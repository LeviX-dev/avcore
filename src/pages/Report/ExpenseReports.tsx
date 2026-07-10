import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../../public/config.js';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartLine,
  faChartPie,
  faFileExcel,
  faFilePdf,
  faDownload,
  faCalendar,
  faProjectDiagram,
  faTags,
  faBuilding,
  faCreditCard,
  faUsers
} from '@fortawesome/free-solid-svg-icons';

type ReportData = {
  data: any[];
  summary?: any;
  top_categories?: any[];
  monthly_trend?: any[];
  filters?: any;
  employees?: any[];
};

type ReportType = 'date_wise' | 'project_wise' | 'category_wise' | 'vendor_wise' | 'payment_mode' | 'employee_wise';

const ExpenseReports: React.FC = () => {
  const [activeReport, setActiveReport] = useState<ReportType>('date_wise');
  const [fromDate, setFromDate] = useState(() => {
    const date = new Date();
    date.setDate(1);
    return date.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('');
  const [canSelectAnyEmployee, setCanSelectAnyEmployee] = useState(false);
  const [employeeOptions, setEmployeeOptions] = useState<any[]>([]);

  useEffect(() => {
    fetchReport();
    fetchOptions();
  }, [activeReport, fromDate, toDate, selectedFilter]);

  const fetchOptions = async () => {
    try {
      const response = await axios.get(`${BASE_URL}api/v1/expense/options`, { withCredentials: true });
      setEmployees(response.data?.data?.employees || []);
      setProjects(response.data?.data?.projects || []);
      setCategories(response.data?.data?.categories || []);
      setVendors(response.data?.data?.vendors || []);
      setCanSelectAnyEmployee(response.data?.data?.canSelectAnyEmployee || false);
    } catch (error) {
      console.error('Error fetching options:', error);
    }
  };

  const fetchReport = async () => {
    setLoading(true);
    try {
      let url = `${BASE_URL}api/v1/reports/${activeReport}`;
      const params: any = { from_date: fromDate, to_date: toDate };
      
      if (activeReport === 'project_wise' && selectedFilter) {
        params.project_id = selectedFilter;
      } else if (activeReport === 'category_wise' && selectedFilter) {
        params.category_id = selectedFilter;
      } else if (activeReport === 'vendor_wise' && selectedFilter) {
        params.vendor_id = selectedFilter;
      } else if (activeReport === 'date_wise' && selectedFilter && canSelectAnyEmployee) {
        params.employee_id = selectedFilter;
      } else if (activeReport === 'employee_wise' && selectedFilter) {
        params.employee_id = selectedFilter;
      }
      
      const response = await axios.get(url, { params, withCredentials: true });
      setReportData(response.data);
      if (response.data.employees) {
        setEmployeeOptions(response.data.employees);
      }
    } catch (error) {
      console.error('Error fetching report:', error);
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format: 'excel' | 'pdf') => {
    const url = `${BASE_URL}api/v1/reports/export/${format === 'excel' ? 'excel' : 'pdf'}`;
    const params: any = {
      report_type: activeReport,
      from_date: fromDate,
      to_date: toDate,
      format: format
    };
    
    if (activeReport === 'project_wise' && selectedFilter) {
      params.project_id = selectedFilter;
    } else if (activeReport === 'category_wise' && selectedFilter) {
      params.category_id = selectedFilter;
    } else if (activeReport === 'vendor_wise' && selectedFilter) {
      params.vendor_id = selectedFilter;
    } else if (activeReport === 'date_wise' && selectedFilter && canSelectAnyEmployee) {
      params.employee_id = selectedFilter;
    } else if (activeReport === 'employee_wise' && selectedFilter) {
      params.employee_id = selectedFilter;
    }
    
    window.open(`${url}?${new URLSearchParams(params).toString()}`, '_blank');
  };

  const reports = [
    { key: 'date_wise' as ReportType, label: 'Date Wise', icon: faCalendar, color: 'bg-blue-500' },
    { key: 'project_wise' as ReportType, label: 'Project Wise', icon: faProjectDiagram, color: 'bg-green-500' },
    { key: 'category_wise' as ReportType, label: 'Category Wise', icon: faTags, color: 'bg-purple-500' },
    { key: 'vendor_wise' as ReportType, label: 'Vendor Wise', icon: faBuilding, color: 'bg-orange-500' },
    { key: 'payment_mode' as ReportType, label: 'Payment Mode', icon: faCreditCard, color: 'bg-cyan-500' },
    { key: 'employee_wise' as ReportType, label: 'Employee Wise', icon: faUsers, color: 'bg-indigo-500' }
  ];

  const renderFilterSelect = () => {
    switch (activeReport) {
      case 'date_wise':
        if (!canSelectAnyEmployee) return null;
        return (
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="rounded-lg border border-stroke bg-white px-4 py-2.5 text-sm dark:border-strokedark dark:bg-form-input"
          >
            <option value="">All Employees</option>
            {employees.map(emp => (
              <option key={emp.user_id} value={emp.user_id}>{emp.name}</option>
            ))}
          </select>
        );
      case 'project_wise':
        return (
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="rounded-lg border border-stroke bg-white px-4 py-2.5 text-sm dark:border-strokedark dark:bg-form-input"
          >
            <option value="">All Projects</option>
            {projects.map(proj => (
              <option key={proj.master_id} value={proj.master_id}>{proj.project_name}</option>
            ))}
          </select>
        );
      case 'category_wise':
        return (
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="rounded-lg border border-stroke bg-white px-4 py-2.5 text-sm dark:border-strokedark dark:bg-form-input"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.category_id} value={cat.category_id}>{cat.category_name}</option>
            ))}
          </select>
        );
      case 'vendor_wise':
        return (
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="rounded-lg border border-stroke bg-white px-4 py-2.5 text-sm dark:border-strokedark dark:bg-form-input"
          >
            <option value="">All Vendors</option>
            {vendors.map(vendor => (
              <option key={vendor.vendor_id} value={vendor.vendor_id}>
                {vendor.vendor_name || vendor.company_name}
              </option>
            ))}
          </select>
        );
      case 'employee_wise':
        if (employeeOptions.length === 0) return null;
        return (
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="rounded-lg border border-stroke bg-white px-4 py-2.5 text-sm dark:border-strokedark dark:bg-form-input"
          >
            <option value="">All Employees</option>
            {employeeOptions.map(emp => (
              <option key={emp.user_id} value={emp.user_id}>{emp.name}</option>
            ))}
          </select>
        );
      default:
        return null;
    }
  };

  const renderSummaryCards = () => {
    if (!reportData?.summary && !reportData?.top_categories) return null;
    
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {reportData.summary && (
          <>
            <div className="rounded-lg border border-stroke bg-white p-4 shadow-sm dark:border-strokedark dark:bg-boxdark">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Transactions</p>
              <p className="text-2xl font-bold text-black dark:text-white">
                {reportData.summary.total_transactions?.toLocaleString() || 0}
              </p>
            </div>
            <div className="rounded-lg border border-stroke bg-white p-4 shadow-sm dark:border-strokedark dark:bg-boxdark">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                ₹{reportData.summary.total_amount?.toLocaleString('en-IN') || 0}
              </p>
            </div>
          </>
        )}
      </div>
    );
  };

  // Custom table renderer for Date‑wise report
  const renderDateWiseTable = () => {
    if (!reportData?.data || reportData.data.length === 0) {
      return (
        <div className="rounded-lg border border-dashed border-stroke p-8 text-center text-gray-500 dark:border-strokedark">
          No data found for selected period
        </div>
      );
    }

    const { data, filters } = reportData;
    const startDate = filters?.from_date_formatted || filters?.from_date || fromDate;
    const endDate = filters?.to_date_formatted || filters?.to_date || toDate;

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-stroke bg-gray-50 dark:border-strokedark dark:bg-meta-4">
              <th className="px-4 py-3 font-semibold text-black dark:text-white">EXPENSE DATE</th>
              <th className="px-4 py-3 font-semibold text-black dark:text-white">Total Expenses</th>
              <th className="px-4 py-3 font-semibold text-black dark:text-white">Total Amount (₹)</th>
              <th className="px-4 py-3 font-semibold text-black dark:text-white">PAYMENT MODES</th>
              <th className="px-4 py-3 font-semibold text-black dark:text-white">Start Date</th>
              <th className="px-4 py-3 font-semibold text-black dark:text-white">End Date</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row: any, idx: number) => (
              <tr key={idx} className="border-b border-stroke hover:bg-gray-50 dark:border-strokedark dark:hover:bg-meta-4">
                <td className="px-4 py-2.5 text-black dark:text-white">
                  {row.expense_date_formatted || new Date(row.expense_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>
                <td className="px-4 py-2.5 text-black dark:text-white">{row.total_expenses || 0}</td>
                <td className="px-4 py-2.5 text-black dark:text-white">₹{(row.total_amount || 0).toLocaleString('en-IN')}</td>
                <td className="px-4 py-2.5 text-black dark:text-white">{row.payment_modes || '-'}</td>
                <td className="px-4 py-2.5 text-black dark:text-white">{startDate}</td>
                <td className="px-4 py-2.5 text-black dark:text-white">{endDate}</td>
              </tr>
            ))}
          </tbody>
          {reportData.summary && (
            <tfoot>
              <tr className="bg-gray-100 dark:bg-meta-4 font-semibold">
                <td className="px-4 py-2.5">Total</td>
                <td className="px-4 py-2.5">{reportData.summary.total_transactions || 0}</td>
                <td className="px-4 py-2.5">₹{(reportData.summary.total_amount || 0).toLocaleString('en-IN')}</td>
                <td className="px-4 py-2.5"></td>
                <td className="px-4 py-2.5"></td>
                <td className="px-4 py-2.5"></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    );
  };

  // Custom table renderer for Project‑wise report
 const renderProjectWiseTable = () => {
  if (!reportData?.data || reportData.data.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-stroke p-8 text-center text-gray-500 dark:border-strokedark">
        No data found for selected period
      </div>
    );
  }

  // Filter out "No Project" rows
  const filteredData = reportData.data.filter(row => row.project_name !== 'No Project');

  if (filteredData.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-stroke p-8 text-center text-gray-500 dark:border-strokedark">
        No project data found for selected period
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-stroke bg-gray-50 dark:border-strokedark dark:bg-meta-4">
            <th className="px-4 py-3 font-semibold text-black dark:text-white">Project Name</th>
            <th className="px-4 py-3 font-semibold text-black dark:text-white">Budget (₹)</th>
            <th className="px-4 py-3 font-semibold text-black dark:text-white">Total Expense (Overall) (₹)</th>
            <th className="px-4 py-3 font-semibold text-black dark:text-white">Expense (Date Range) (₹)</th>
            <th className="px-4 py-3 font-semibold text-black dark:text-white">No. of Expenses</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((row: any, idx: number) => (
            <tr key={idx} className="border-b border-stroke hover:bg-gray-50 dark:border-strokedark dark:hover:bg-meta-4">
              <td className="px-4 py-2.5 text-black dark:text-white">{row.project_name}</td>
              <td className="px-4 py-2.5 text-black dark:text-white">
                {row.budget ? `₹${row.budget.toLocaleString('en-IN')}` : '—'}
              </td>
              <td className="px-4 py-2.5 text-black dark:text-white">
                ₹{(row.total_expense_overall || 0).toLocaleString('en-IN')}
              </td>
              <td className="px-4 py-2.5 text-black dark:text-white">
                ₹{(row.expense_range || 0).toLocaleString('en-IN')}
              </td>
              <td className="px-4 py-2.5 text-black dark:text-white">{row.no_of_expenses || 0}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-gray-100 dark:bg-meta-4 font-semibold">
            <td className="px-4 py-2.5">Total</td>
            <td className="px-4 py-2.5">—</td>
            <td className="px-4 py-2.5">
              ₹{(filteredData.reduce((sum: number, r: any) => sum + (r.total_expense_overall || 0), 0)).toLocaleString('en-IN')}
            </td>
            <td className="px-4 py-2.5">
              ₹{(reportData.summary?.total_amount || 0).toLocaleString('en-IN')}
            </td>
            <td className="px-4 py-2.5">{reportData.summary?.total_transactions || 0}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};
  // Custom table renderer for Employee‑wise report
const renderEmployeeWiseTable = () => {
  if (!reportData?.data || reportData.data.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-stroke p-8 text-center text-gray-500 dark:border-strokedark">
        No data found for selected period
      </div>
    );
  }

  const { data } = reportData;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-stroke bg-gray-50 dark:border-strokedark dark:bg-meta-4">
            <th className="px-4 py-3 font-semibold text-black dark:text-white">Employee Name</th>
            <th className="px-4 py-3 font-semibold text-black dark:text-white">Total Expense (₹)</th>
            <th className="px-4 py-3 font-semibold text-black dark:text-white">No. of Expenses</th>
            <th className="px-4 py-3 font-semibold text-black dark:text-white">Wallet Balance (₹)</th>
            <th className="px-4 py-3 font-semibold text-black dark:text-white">Total Credited (₹)</th>  {/* 🆕 */}
          </tr>
        </thead>
        <tbody>
          {data.map((row: any, idx: number) => (
            <tr key={idx} className="border-b border-stroke hover:bg-gray-50 dark:border-strokedark dark:hover:bg-meta-4">
              <td className="px-4 py-2.5 text-black dark:text-white">{row.employee_name}</td>
              <td className="px-4 py-2.5 text-black dark:text-white">
                ₹{(row.total_expense || 0).toLocaleString('en-IN')}
              </td>
              <td className="px-4 py-2.5 text-black dark:text-white">{row.no_of_expenses || 0}</td>
              <td className="px-4 py-2.5 text-black dark:text-white">
                ₹{(row.wallet_balance || 0).toLocaleString('en-IN')}
              </td>
              <td className="px-4 py-2.5 text-black dark:text-white">
                ₹{(row.total_credited || 0).toLocaleString('en-IN')}
              </td>
            </tr>
          ))}
        </tbody>
        {reportData.summary && (
          <tfoot>
            <tr className="bg-gray-100 dark:bg-meta-4 font-semibold">
              <td className="px-4 py-2.5">Total</td>
              <td className="px-4 py-2.5">
                ₹{(reportData.summary.total_amount || 0).toLocaleString('en-IN')}
              </td>
              <td className="px-4 py-2.5">{reportData.summary.total_transactions || 0}</td>
              <td className="px-4 py-2.5">—</td>
              <td className="px-4 py-2.5">—</td>
             </tr>
          </tfoot>
        )}
       </table>
    </div>
  );
};

  // Generic table renderer for other report types
  const renderGenericTable = () => {
    if (!reportData?.data || reportData.data.length === 0) {
      return (
        <div className="rounded-lg border border-dashed border-stroke p-8 text-center text-gray-500 dark:border-strokedark">
          No data found for selected period
        </div>
      );
    }

    const columns = Object.keys(reportData.data[0]);
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-stroke bg-gray-50 dark:border-strokedark dark:bg-meta-4">
              {columns.map((col) => (
                <th key={col} className="px-4 py-3 font-semibold text-black dark:text-white">
                  {col.replace(/_/g, ' ').toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reportData.data.map((row: any, idx: number) => (
              <tr key={idx} className="border-b border-stroke hover:bg-gray-50 dark:border-strokedark dark:hover:bg-meta-4">
                {columns.map((col) => (
                  <td key={col} className="px-4 py-2.5 text-black dark:text-white">
                    {col.toLowerCase().includes('amount') && typeof row[col] === 'number'
                      ? `₹${row[col].toLocaleString('en-IN')}`
                      : row[col] || '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-2 sm:px-4 lg:px-0">
      <Breadcrumb pageName="Expense Reports" />

      {/* Report Type Tabs */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
        {reports.map((report) => (
          <button
            key={report.key}
            onClick={() => {
              setActiveReport(report.key);
              setSelectedFilter('');
            }}
            className={`flex items-center justify-center gap-2 rounded-lg p-3 text-sm font-medium transition ${
              activeReport === report.key
                ? `${report.color} text-white`
                : 'border border-stroke bg-white text-black hover:bg-gray-50 dark:border-strokedark dark:bg-boxdark dark:text-white'
            }`}
          >
            <FontAwesomeIcon icon={report.icon} />
            {report.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="rounded-lg border border-stroke bg-white p-4 shadow-sm dark:border-strokedark dark:bg-boxdark">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[150px]">
            <label className="mb-1 block text-xs font-medium text-gray-500">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full rounded-lg border border-stroke bg-white px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input"
            />
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="mb-1 block text-xs font-medium text-gray-500">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full rounded-lg border border-stroke bg-white px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="mb-1 block text-xs font-medium text-gray-500">Filter</label>
            {renderFilterSelect()}
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={() => exportReport('excel')}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
            >
              <FontAwesomeIcon icon={faFileExcel} className="mr-2" />
              Export Excel
            </button>
            <button
              onClick={() => exportReport('pdf')}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
            >
              <FontAwesomeIcon icon={faFilePdf} className="mr-2" />
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {renderSummaryCards()}

      {/* Top Categories (for category report) */}
      {activeReport === 'category_wise' && reportData?.top_categories && (
        <div className="rounded-lg border border-stroke bg-white p-4 dark:border-strokedark dark:bg-boxdark">
          <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">Top 5 Categories</h3>
          <div className="space-y-3">
            {reportData.top_categories.map((cat: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-sm text-black dark:text-white">{cat.category_name}</span>
                <span className="text-sm font-semibold text-emerald-600">
                  ₹{cat.total_amount?.toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data Table */}
      {loading ? (
        <div className="rounded-lg border border-stroke p-8 text-center">Loading report data...</div>
      ) : (
        <>
          {activeReport === 'date_wise' && renderDateWiseTable()}
          {activeReport === 'project_wise' && renderProjectWiseTable()}
          {activeReport === 'employee_wise' && renderEmployeeWiseTable()}
          {activeReport !== 'date_wise' && activeReport !== 'project_wise' && activeReport !== 'employee_wise' && renderGenericTable()}
        </>
      )}
    </div>
  );
};

export default ExpenseReports;