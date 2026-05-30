import React, { useEffect, useMemo, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../../../public/config.js';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb.tsx';
import EmployeeExpenseChart from './EmployeeExpenseChart.tsx';
import CategoryExpenseChart from './CategoryExpenseChart.tsx';
import VendorExpenseChart from './VendorExpenseChart';
import ProjectExpenseChart from './ProjectExpenseChart';
import { MonthlyTrendChart } from './MonthlyTrendChart';
import { WalletTrendChart } from './WalletTrendChart';

const ADMIN_ROLES = ['admin', 'sub_admin', 'hr', 'hr_executive'];
const isAdminRole = (role) => ADMIN_ROLES.includes(String(role || '').toLowerCase());

const getDateRange = (preset, customStart, customEnd) => {
  const now = new Date();
  if (preset === 'all') return { from_date: null, to_date: null };
  if (preset === 'custom') return { from_date: customStart, to_date: customEnd };
  let start, end = new Date(now);
  end.setHours(23,59,59,999);
  if (preset === 'this_month') start = new Date(now.getFullYear(), now.getMonth(), 1);
  else if (preset === 'last_month') {
    start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    end = new Date(now.getFullYear(), now.getMonth(), 0);
    end.setHours(23,59,59,999);
  } else if (preset === 'this_quarter') {
    const q = Math.floor(now.getMonth() / 3);
    start = new Date(now.getFullYear(), q * 3, 1);
  } else if (preset === 'this_year') start = new Date(now.getFullYear(), 0, 1);
  else return { from_date: null, to_date: null };
  return { from_date: start.toISOString().slice(0,10), to_date: end.toISOString().slice(0,10) };
};

const ExpenseStats = () => {
  const navigate = useNavigate();
  const [auth, setAuth] = useState({ role: '', employeeId: null, name: '' });
  const [loadingSession, setLoadingSession] = useState(true);

  // Filter states
  const [datePreset, setDatePreset] = useState('this_month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [status, setStatus] = useState('all');
  const [viewAllEmployees, setViewAllEmployees] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [employeeOptions, setEmployeeOptions] = useState([]);

  // Chart data
  const [employeeData, setEmployeeData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [vendorData, setVendorData] = useState([]);
  const [projectData, setProjectData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [walletData, setWalletData] = useState([]);

  // Loading states
  const [loading, setLoading] = useState({
    employee: false, category: false, vendor: false, project: false, monthly: false, wallet: false
  });

  // Session check
  useEffect(() => {
    let mounted = true;
    const fetchSession = async () => {
      try {
        const { data } = await axios.get(`${BASE_URL}auth/check-session`, { withCredentials: true });
        if (!mounted) return;
        if (!data?.isAuthenticated) { navigate('/signin'); return; }
        const user = data?.user || {};
        setAuth({
          role: data?.role || user?.role || '',
          employeeId: user?.id ?? user?.user_id ?? null,
          name: user?.name || '',
        });
      } catch { /* ignore */ } finally { if (mounted) setLoadingSession(false); }
    };
    fetchSession();
    return () => { mounted = false; };
  }, [navigate]);

  const isAdmin = isAdminRole(auth.role);
  const dateRange = useMemo(
    () => getDateRange(datePreset, customStart, customEnd),
    [datePreset, customStart, customEnd]
  );

  const filterParams = useMemo(() => ({
    from_date: dateRange.from_date,
    to_date: dateRange.to_date,
    status: status !== 'all' ? status : undefined,
    ...(isAdmin && viewAllEmployees && selectedEmployeeId ? { employee_id: selectedEmployeeId } : {})
  }), [dateRange.from_date, dateRange.to_date, status, isAdmin, viewAllEmployees, selectedEmployeeId]);

  // Data fetchers
  const fetchAll = useCallback(async () => {
    if (loadingSession) return;
    const endpoints = [
      { key: 'employee', url: `${BASE_URL}api/v1/expense/stats/employees`, setter: setEmployeeData, condition: isAdmin },
      { key: 'category', url: `${BASE_URL}api/v1/expense/stats/categories`, setter: setCategoryData, condition: true },
      { key: 'vendor',   url: `${BASE_URL}api/v1/expense/stats/vendors`,   setter: setVendorData,   condition: true },
      { key: 'project',  url: `${BASE_URL}api/v1/expense/stats/projects`,  setter: setProjectData,  condition: true },
      { key: 'monthly',  url: `${BASE_URL}api/v1/expense/stats/monthly-trend`, setter: setMonthlyData, condition: true },
      { key: 'wallet',   url: `${BASE_URL}api/wallet/stats/trend`, setter: setWalletData, condition: true }
    ];
    for (const ep of endpoints) {
      if (!ep.condition) continue;
      setLoading(prev => ({ ...prev, [ep.key]: true }));
      try {
        const res = await axios.get(ep.url, { params: filterParams, withCredentials: true });
        const responseData = res.data?.data || [];
        const normalizedData = ep.key === 'project'
          ? responseData.map((item) => ({
              ...item,
              project: item.project ?? item.project_name ?? 'No Project',
              amount: item.amount ?? item.total_amount ?? 0,
            }))
          : responseData;

        ep.setter(normalizedData);
        if (ep.key === 'employee' && res.data?.data?.length && employeeOptions.length === 0) {
          setEmployeeOptions(res.data.data.map(e => ({ id: e.user_id, name: e.employee_name })));
        }
      } catch (err) {
        console.error(`Failed to fetch ${ep.key} stats`, err);
      } finally {
        setLoading(prev => ({ ...prev, [ep.key]: false }));
      }
    }
  }, [loadingSession, filterParams, isAdmin, employeeOptions.length]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  if (loadingSession) return <div className="p-8 text-center">Loading session...</div>;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-2 sm:px-4 lg:px-0">
      <Breadcrumb pageName="Expense Analytics" />

      {/* Filter Bar */}
      <div className="rounded-2xl border border-stroke bg-white p-4 dark:border-strokedark dark:bg-boxdark">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="space-y-1">
            <label className="text-xs font-medium">Date Range</label>
            <div className="flex flex-wrap gap-2">
              {['all', 'this_month', 'last_month', 'this_quarter', 'this_year', 'custom'].map(preset => (
                <button key={preset} onClick={() => setDatePreset(preset)}
                  className={`px-3 py-1 text-xs rounded-lg border ${datePreset === preset ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>
                  {preset.replace(/_/g,' ')}
                </button>
              ))}
            </div>
            {datePreset === 'custom' && (
              <div className="flex gap-2 mt-2">
                <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} className="rounded border px-2 py-1 text-sm" />
                <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} className="rounded border px-2 py-1 text-sm" />
              </div>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium">Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)} className="rounded border px-2 py-1 text-sm">
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          {isAdmin && (
            <>
              <div className="space-y-1 flex items-center gap-2">
                <input type="checkbox" checked={viewAllEmployees} onChange={e => setViewAllEmployees(e.target.checked)} id="viewAll" />
                <label htmlFor="viewAll" className="text-sm">View All Employees</label>
              </div>
              {viewAllEmployees && employeeOptions.length > 0 && (
                <div className="space-y-1">
                  <select value={selectedEmployeeId} onChange={e => setSelectedEmployeeId(e.target.value)} className="rounded border px-2 py-1 text-sm">
                    <option value="">All Employees</option>
                    {employeeOptions.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                  </select>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Grid of Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Employee Expense - Horizontal Bar */}
        <div className="lg:col-span-1">
          <EmployeeExpenseChart data={employeeData} loading={loading.employee} title="Employee Expenses" />
        </div>
        {/* Category Expense - Donut + Table */}
        <div className="lg:col-span-1">
          <CategoryExpenseChart data={categoryData} loading={loading.category} title="Expense by Category" />
        </div>
        {/* Vendor Expense - Horizontal Bar */}
        <div className="lg:col-span-1">
          <VendorExpenseChart data={vendorData} loading={loading.vendor} title="Expense by Vendor" />
        </div>
        {/* Project Expense - Horizontal Bar */}
        <div className="lg:col-span-1">
          <ProjectExpenseChart data={projectData} loading={loading.project} title="Expense by Project" />
        </div>
        {/* Monthly Trend - Line */}
        <div className="lg:col-span-1">
          <MonthlyTrendChart data={monthlyData} loading={loading.monthly} />
        </div>
        {/* Wallet Trend - Double Bar */}
        <div className="lg:col-span-1">
          <WalletTrendChart data={walletData} loading={loading.wallet} />
        </div>
      </div>
    </div>
  );
};

export default ExpenseStats;