import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb.js';
import { BASE_URL } from '../../../public/config.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEye, faPenToSquare, faTrashCan,
  faCheck, faXmark, faPaperPlane, faMoneyBill,
} from '@fortawesome/free-solid-svg-icons';
import ExpenseEntryModal, {
  ExpenseCategory,
  ExpenseRow,
  EmployeeOption,
  ProjectOption,
  SiteLocationOption,
  VendorOption,
} from './ExpenseEntryModal.js';

// ─── Types ───────────────────────────────────────────────────────────────────

type Tab = 'approved' | 'pending' | 'rejected' | 'drafts';

type ExpenseOptionsResponse = {
  projects: ProjectOption[];
  siteLocations: SiteLocationOption[];
  vendors: VendorOption[];
  employees: EmployeeOption[];
  currentUser: { id: number; role: string; name: string | null };
  canSelectAnyEmployee: boolean;
};

const DRAFT_STATUSES = ['draft_pending', 'draft_approved', 'draft_rejected'];

// ─── Component ───────────────────────────────────────────────────────────────

const ExpensePrototype: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('approved');
  const [rows, setRows] = useState<ExpenseRow[]>([]);
  const [tabCounts, setTabCounts] = useState<Record<Tab, number>>({
    approved: 0, pending: 0, rejected: 0, drafts: 0,
  });

  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [siteLocations, setSiteLocations] = useState<SiteLocationOption[]>([]);
  const [vendors, setVendors] = useState<VendorOption[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [canSelectAnyEmployee, setCanSelectAnyEmployee] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string>('');
  // Track if admin role is loaded from /auth/get-role
  const [roleLoaded, setRoleLoaded] = useState(false);

  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseRow | null>(null);
  const [viewingExpense, setViewingExpense] = useState<ExpenseRow | null>(null);

  // ── Admin approve/reject (pending expenses)
  const [statusModal, setStatusModal] = useState<{
    expense: ExpenseRow; action: 'approved' | 'rejected';
  } | null>(null);
  const [statusRemark, setStatusRemark] = useState('');
  const [statusSaving, setStatusSaving] = useState(false);

  // ── Admin approve/reject DRAFTS (draft_pending)
  const [draftModal, setDraftModal] = useState<{
    expense: ExpenseRow; action: 'draft_approved' | 'draft_rejected';
  } | null>(null);
  const [draftRemark, setDraftRemark] = useState('');
  const [draftSaving, setDraftSaving] = useState(false);

  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);

  // Filters
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const isAdmin = currentUserRole === 'admin' || currentUserRole === 'sub_admin' || currentUserRole === 'hr';

  const showToast = (msg: string, type: 'success' | 'error') => {
    setMessage(msg);
    setMessageType(type);
    window.setTimeout(() => { setMessage(null); setMessageType(null); }, 3500);
  };

  // ─── Fetch ────────────────────────────────────────────────────────────────

  const fetchExpenses = useCallback(async (tab: Tab) => {
    setLoading(true);
    try {
      const params: any = { status: tab === 'drafts' ? 'drafts' : tab };
      const response = await axios.get(`${BASE_URL}api/v1/expense`, { params, withCredentials: true });
      setRows(response.data?.data || []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTabCounts = useCallback(async () => {
    try {
      const [a, p, r, d] = await Promise.all([
        axios.get(`${BASE_URL}api/v1/expense`, { params: { status: 'approved' }, withCredentials: true }),
        axios.get(`${BASE_URL}api/v1/expense`, { params: { status: 'pending' }, withCredentials: true }),
        axios.get(`${BASE_URL}api/v1/expense`, { params: { status: 'rejected' }, withCredentials: true }),
        axios.get(`${BASE_URL}api/v1/expense`, { params: { status: 'drafts' }, withCredentials: true }),
      ]);
      setTabCounts({
        approved: (a.data?.data || []).length,
        pending: (p.data?.data || []).length,
        rejected: (r.data?.data || []).length,
        drafts: (d.data?.data || []).length,
      });
    } catch { /* non-critical */ }
  }, []);

  const fetchCategories = async () => {
    try {
      const r = await axios.get(`${BASE_URL}api/v1/expense/categories`, { withCredentials: true });
      setCategories(r.data?.data || []);
    } catch { setCategories([]); }
  };

  const fetchOptions = async () => {
    try {
      const r = await axios.get(`${BASE_URL}api/v1/expense/options`, { withCredentials: true });
      const data: ExpenseOptionsResponse = r.data?.data || {
        projects: [], siteLocations: [], vendors: [], employees: [],
        currentUser: { id: 0, role: '', name: null }, canSelectAnyEmployee: false,
      };
      setProjects(data.projects || []);
      setSiteLocations(data.siteLocations || []);
      setVendors(data.vendors || []);
      setEmployees(data.employees || []);
      setCanSelectAnyEmployee(Boolean(data.canSelectAnyEmployee));
      setCurrentUserId(data.currentUser?.id || null);
      // Do not set role here; will be set by fetchUserRole
    } catch {
      setProjects([]); setSiteLocations([]); setVendors([]);
      setEmployees([]); setCanSelectAnyEmployee(false); setCurrentUserId(null);
    }
  };

  // Fetch admin role from /auth/get-role
  const fetchUserRole = async () => {
    try {
      const r = await axios.get(`${BASE_URL}auth/get-role`, { withCredentials: true });
      setCurrentUserRole(r.data?.role || '');
    } catch {
      setCurrentUserRole('');
    } finally {
      setRoleLoaded(true);
    }
  };


  useEffect(() => {
    fetchExpenses(activeTab);
    fetchCategories();
    fetchOptions();
    fetchUserRole();
  }, [activeTab]);

  useEffect(() => { fetchTabCounts(); }, []);

  // ─── Filters ──────────────────────────────────────────────────────────────

  const filteredRows = useMemo(() => rows.filter((row) => {
    if (fromDate && row.expense_date < fromDate) return false;
    if (toDate && row.expense_date > toDate) return false;
    if (projectFilter && row.project_name !== projectFilter) return false;
    if (categoryFilter && row.category !== categoryFilter) return false;
    if (userFilter && row.employee_name !== userFilter) return false;
    if (searchTerm) {
      const t = searchTerm.toLowerCase();
      if (
        !row.bill_number?.toLowerCase().includes(t) &&
        !row.vendor_name?.toLowerCase().includes(t) &&
        !row.description?.toLowerCase().includes(t)
      ) return false;
    }
    return true;
  }), [rows, fromDate, toDate, projectFilter, categoryFilter, userFilter, searchTerm]);

  const resetFilters = () => {
    setFromDate(''); setToDate(''); setProjectFilter('');
    setCategoryFilter(''); setUserFilter(''); setSearchTerm('');
  };

  // ─── Actions ──────────────────────────────────────────────────────────────

  const openAddModal = () => { setEditingExpense(null); setModalOpen(true); };
  const openEditModal = (row: ExpenseRow) => { setEditingExpense(row); setModalOpen(true); };

  const onDelete = async (id: number) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await axios.delete(`${BASE_URL}api/v1/expense/${id}`, { withCredentials: true });
      showToast('Expense deleted.', 'success');
      fetchExpenses(activeTab);
      fetchTabCounts();
    } catch (e: any) {
      showToast(e?.response?.data?.message || 'Failed to delete.', 'error');
    }
  };

  // ── Approve/Reject pending expense
  const openStatusModal = (expense: ExpenseRow, action: 'approved' | 'rejected') => {
    setStatusModal({ expense, action }); setStatusRemark('');
  };
  const submitStatusChange = async () => {
    if (!statusModal) return;
    setStatusSaving(true);
    try {
      await axios.patch(
        `${BASE_URL}api/v1/expense/${statusModal.expense.expense_id}/status`,
        { status: statusModal.action, status_remark: statusRemark },
        { withCredentials: true }
      );
      showToast(`Expense ${statusModal.action}.`, 'success');
      setStatusModal(null);
      fetchExpenses(activeTab);
      fetchTabCounts();
    } catch (e: any) {
      showToast(e?.response?.data?.message || 'Failed to update status.', 'error');
    } finally { setStatusSaving(false); }
  };

  // ── Approve/Reject draft (draft_pending)
  const openDraftModal = (expense: ExpenseRow, action: 'draft_approved' | 'draft_rejected') => {
    setDraftModal({ expense, action }); setDraftRemark('');
  };
  const submitDraftStatusChange = async () => {
    if (!draftModal) return;
    setDraftSaving(true);
    try {
      await axios.put(
        `${BASE_URL}api/v1/expense/${draftModal.expense.expense_id}/draft-status`,
        { status: draftModal.action, remark: draftRemark },
        { withCredentials: true }
      );
      showToast(
        draftModal.action === 'draft_approved' ? 'Draft approved.' : 'Draft rejected.',
        'success'
      );
      setDraftModal(null);
      fetchExpenses(activeTab);
      fetchTabCounts();
    } catch (e: any) {
      showToast(e?.response?.data?.message || 'Failed to update draft.', 'error');
    } finally { setDraftSaving(false); }
  };

  // ── Submit draft for review (draft → draft_pending)
  const submitDraftForReview = async (id: number) => {
    if (!window.confirm('Submit this draft for admin review?')) return;
    try {
      const row = rows.find((r) => r.expense_id === id);
      if (row) openEditModal(row);
    } catch (e: any) {
      showToast('Failed to submit draft.', 'error');
    }
  };

  // ── Make Expense from approved draft
  const makeExpense = async (id: number) => {
    if (!window.confirm('Convert this approved draft to an expense? Wallet will be deducted.')) return;
    try {
      await axios.post(
        `${BASE_URL}api/v1/expense/${id}/make-expense`,
        {},
        { withCredentials: true }
      );
      showToast('Expense created! Amount deducted from wallet.', 'success');
      fetchExpenses(activeTab);
      fetchTabCounts();
    } catch (e: any) {
      showToast(e?.response?.data?.message || 'Failed to create expense.', 'error');
    }
  };
  // ── Resubmit rejected expense
  const [resubmittingId, setResubmittingId] = useState<number | null>(null);

  const handleResubmit = async (expenseId: number) => {
    if (!window.confirm('Resubmit this expense for approval? The amount will be deducted from wallet again.')) return;

    setResubmittingId(expenseId);
    try {
      await axios.post(
        `${BASE_URL}api/v1/expense/${expenseId}/resubmit`,
        {},
        { withCredentials: true }
      );
      showToast('Expense resubmitted for approval.', 'success');
      fetchExpenses(activeTab);
      fetchTabCounts();
    } catch (e: any) {
      console.error('Resubmit error:', e);
      showToast(e?.response?.data?.message || 'Failed to resubmit expense.', 'error');
    } finally {
      setResubmittingId(null);
    }
  };

  // ── Bill helpers
  const openBill = (expense: ExpenseRow) => {
    const url = expense.bill_url || expense.attachment_url ||
      (expense.attachment_path?.split('/').pop()
        ? `${BASE_URL}bill/${encodeURIComponent(expense.attachment_path!.split('/').pop()!)}`
        : null);
    if (!url) { showToast('No bill attached.', 'error'); return; }
    window.open(url, '_blank', 'noopener,noreferrer');
  };
  const downloadBill = async (expense: ExpenseRow) => {
    const url = expense.bill_url || expense.attachment_url ||
      (expense.attachment_path?.split('/').pop()
        ? `${BASE_URL}bill/${encodeURIComponent(expense.attachment_path!.split('/').pop()!)}`
        : null);
    if (!url) { showToast('No bill attached.', 'error'); return; }
    try {
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = expense.attachment_name || expense.attachment_path?.split('/').pop() || 'bill';
      document.body.appendChild(link); link.click(); link.remove();
    } catch { showToast('Unable to download bill.', 'error'); }
  };

  // ─── Status Badge ─────────────────────────────────────────────────────────

  const statusBadge = (status: string | null) => {
    const s = (status || '').toLowerCase();
    const colorMap: Record<string, string> = {
      approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      pending: 'bg-yellow-100  text-yellow-700  dark:bg-yellow-900/30  dark:text-yellow-400',
      rejected: 'bg-red-100     text-red-700     dark:bg-red-900/30     dark:text-red-400',
      draft: 'bg-gray-100    text-gray-600    dark:bg-gray-700       dark:text-gray-300',
      draft_pending: 'bg-yellow-100  text-yellow-700  dark:bg-yellow-900/30  dark:text-yellow-400',
      draft_approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      draft_rejected: 'bg-red-100     text-red-700     dark:bg-red-900/30     dark:text-red-400',
    };
    const labelMap: Record<string, string> = {
      draft: 'Saved',
      draft_pending: 'Awaiting Review',
      draft_approved: 'Approved',
      draft_rejected: 'Rejected',
      approved: 'Approved',
      pending: 'Pending',
      rejected: 'Rejected',
    };
    return (
      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${colorMap[s] || colorMap.draft}`}>
        {labelMap[s] || s || '-'}
      </span>
    );
  };

  // ─── Tabs ─────────────────────────────────────────────────────────────────

  const tabs: { key: Tab; label: string }[] = [
    { key: 'approved', label: 'Expenses' },
    { key: 'pending', label: 'Pending' },
    { key: 'rejected', label: 'Rejected' },
    { key: 'drafts', label: 'Drafts' },
  ];

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-2 sm:px-4 lg:px-0">
      <Breadcrumb pageName="Expense Entry" />

      {/* Toast */}
      {message && (
        <div className={`rounded-lg border px-4 py-3 text-sm ${messageType === 'success'
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-700/40 dark:bg-emerald-950/30 dark:text-emerald-300'
          : 'border-red-200 bg-red-50 text-red-700 dark:border-red-700/40 dark:bg-red-950/30 dark:text-red-300'
          }`}>{message}</div>
      )}

      <div className="rounded-2xl border border-stroke bg-white p-5 shadow-default dark:border-strokedark dark:bg-boxdark sm:p-6">

        {/* Header */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-xl font-semibold text-black dark:text-white">Expense Management</h3>
          <button type="button" onClick={openAddModal}
            className="rounded-lg bg-blue-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-600">
            + Add Expense
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-5 flex gap-1 rounded-xl border border-stroke bg-gray-50 p-1 dark:border-strokedark dark:bg-meta-4/10">
          {tabs.map(({ key, label }) => (
            <button key={key} type="button" onClick={() => setActiveTab(key)}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition ${activeTab === key
                ? 'bg-white text-black shadow dark:bg-boxdark dark:text-white'
                : 'text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white'
                }`}>
              {label}
              {tabCounts[key] > 0 && (
                <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${activeTab === key
                  ? key === 'pending' || key === 'drafts'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-blue-100 text-blue-700'
                  : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                  {tabCounts[key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="mb-4 rounded-xl border border-stroke bg-gray-50 p-4 dark:border-strokedark dark:bg-meta-4/10">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-6">
            <div>
              <label className="mb-1 block text-xs font-medium text-black dark:text-white">From Date</label>
              <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)}
                className="w-full rounded-lg border border-stroke bg-white px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-black dark:text-white">To Date</label>
              <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)}
                className="w-full rounded-lg border border-stroke bg-white px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-black dark:text-white">Project</label>
              <select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)}
                className="w-full rounded-lg border border-stroke bg-white px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white">
                <option value="">All Projects</option>
                {projects.map((p) => <option key={p.master_id} value={p.project_name || ''}>{p.project_name || '-'}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-black dark:text-white">Category</label>
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full rounded-lg border border-stroke bg-white px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white">
                <option value="">All Categories</option>
                {categories.map((c) => <option key={c.category_id} value={c.category_name || ''}>{c.category_name || '-'}</option>)}
              </select>
            </div>
            {isAdmin && (
              <div>
                <label className="mb-1 block text-xs font-medium text-black dark:text-white">User</label>
                <select value={userFilter} onChange={(e) => setUserFilter(e.target.value)}
                  className="w-full rounded-lg border border-stroke bg-white px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white">
                  <option value="">All Users</option>
                  {employees.map((e) => <option key={e.user_id} value={e.name || ''}>{e.name || '-'}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="mb-1 block text-xs font-medium text-black dark:text-white">Search</label>
              <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Bill No / Vendor / Desc"
                className="w-full rounded-lg border border-stroke bg-white px-3 py-2 text-sm dark:border-strokedark dark:bg-form-input dark:text-white" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs text-gray-500 dark:text-gray-300">
              Showing {filteredRows.length} of {rows.length} expenses
            </p>
            <button type="button" onClick={resetFilters}
              className="rounded-md border border-stroke px-3 py-1.5 text-xs font-medium text-black transition hover:bg-gray-100 dark:border-strokedark dark:text-white dark:hover:bg-meta-4/30">
              Reset Filters
            </button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="rounded-lg border border-dashed border-stroke px-4 py-8 text-center text-sm text-gray-500 dark:border-strokedark dark:text-gray-300">
            Loading expenses...
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="rounded-lg border border-dashed border-stroke px-4 py-8 text-center text-sm text-gray-500 dark:border-strokedark dark:text-gray-300">
            {rows.length === 0 ? `No ${activeTab} expenses found.` : 'No expenses match the selected filters.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead>
                <tr className="border-b border-stroke dark:border-strokedark text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  <th className="px-2 py-3">#</th>
                  <th className="px-2 py-3">Date</th>
                  <th className="px-2 py-3">Employee</th>
                  <th className="px-2 py-3">Description</th>
                  <th className="px-2 py-3">Category</th>
                  <th className="px-2 py-3">Vendor</th>
                  <th className="px-2 py-3">Mode</th>
                  <th className="px-2 py-3">Amount</th>
                  <th className="px-2 py-3">Status</th>
                  <th className="px-2 py-3">Remark</th>
                  <th className="px-2 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row, index) => {
                  const isOwnRow = currentUserId && row.employee_id === currentUserId;
                  const s = row.status || '';

                  return (
                    <tr key={row.expense_id}
                      className="border-b border-stroke dark:border-strokedark hover:bg-gray-50 dark:hover:bg-meta-4/10">
                      <td className="px-2 py-3 text-black dark:text-white">{index + 1}</td>
                      <td className="px-2 py-3 text-black dark:text-white whitespace-nowrap">
                        {row.expense_date ? row.expense_date.slice(0, 10) : '-'}
                      </td>
                      <td className="px-2 py-3 text-black dark:text-white">{row.employee_name || '-'}</td>
                      <td className="px-2 py-3 text-black dark:text-white max-w-[140px] truncate">{row.description || '-'}</td>
                      <td className="px-2 py-3 text-black dark:text-white">{row.category || '-'}</td>
                      <td className="px-2 py-3 text-black dark:text-white">{row.vendor_name || '-'}</td>
                      <td className="px-2 py-3 capitalize text-black dark:text-white">{row.payment_mode || '-'}</td>
                      <td className="px-2 py-3 text-black dark:text-white whitespace-nowrap">
                        {row.amount ? `₹${Number(row.amount).toLocaleString('en-IN')}` : '-'}
                      </td>
                      <td className="px-2 py-3">{statusBadge(s)}</td>
                      <td className="px-2 py-3 text-black dark:text-white max-w-[120px] truncate">
                        {row.status_remark || '-'}
                      </td>
                      <td className="px-2 py-3">
                        <div className="flex flex-wrap gap-1.5">

                          {/* View - Always visible */}
                          <button type="button" title="View" onClick={() => setViewingExpense(row)}
                            className="rounded-md bg-blue-600 px-2.5 py-1.5 text-white transition hover:bg-blue-700">
                            <FontAwesomeIcon icon={faEye} />
                          </button>

                          {/* ── DRAFT TAB ACTIONS ── */}
                          {activeTab === 'drafts' && (
                            <>
                              {/* Edit: Admin can edit any draft, Employee can edit own draft_pending or draft_rejected */}
                              {(isAdmin || (isOwnRow && (s === 'draft_pending' || s === 'draft_rejected'))) && (
                                <button type="button" title="Edit" onClick={() => openEditModal(row)}
                                  className="rounded-md bg-warning px-2.5 py-1.5 text-white transition hover:bg-warning/90">
                                  <FontAwesomeIcon icon={faPenToSquare} />
                                </button>
                              )}

                              {/* Resubmit: Employee can resubmit draft_rejected */}
                              {isAdmin && isOwnRow && s === 'draft_rejected' && (
                                <button type="button" title="Resubmit Draft" onClick={() => openEditModal(row)}
                                  className="rounded-md bg-blue-500 px-2.5 py-1.5 text-white transition hover:bg-blue-600">
                                  <FontAwesomeIcon icon={faPaperPlane} className="mr-1" />
                                  Resubmit
                                </button>
                              )}

                              {/* Make Expense: Employee, status=draft_approved */}
                              {isOwnRow && s === 'draft_approved' && (
                                <button type="button" title="Make Expense"
                                  onClick={() => makeExpense(row.expense_id)}
                                  className="rounded-md bg-emerald-600 px-2.5 py-1.5 text-white transition hover:bg-emerald-700 text-xs font-medium">
                                  <FontAwesomeIcon icon={faMoneyBill} className="mr-1" />
                                  Make Expense
                                </button>
                              )}

                              {/* Admin Approve Draft: status=draft_pending */}
                              {isAdmin && s === 'draft_pending' && (
                                <button type="button" title="Approve Draft"
                                  onClick={() => openDraftModal(row, 'draft_approved')}
                                  className="rounded-md bg-emerald-600 px-2.5 py-1.5 text-white transition hover:bg-emerald-700">
                                  <FontAwesomeIcon icon={faCheck} />
                                </button>
                              )}

                              {/* Admin Reject Draft: status=draft_pending */}
                              {isAdmin && s === 'draft_pending' && (
                                <button type="button" title="Reject Draft"
                                  onClick={() => openDraftModal(row, 'draft_rejected')}
                                  className="rounded-md bg-red-500 px-2.5 py-1.5 text-white transition hover:bg-red-600">
                                  <FontAwesomeIcon icon={faXmark} />
                                </button>
                              )}

                              {/* Delete: Admin can delete any draft, Employee can delete own draft_pending/draft_rejected */}
                              {(isAdmin || (isOwnRow && (s === 'draft_pending' || s === 'draft_rejected'))) && (
                                <button type="button" title="Delete" onClick={() => onDelete(row.expense_id)}
                                  className="rounded-md bg-danger px-2.5 py-1.5 text-white transition hover:bg-danger/90">
                                  <FontAwesomeIcon icon={faTrashCan} />
                                </button>
                              )}
                            </>
                          )}

                          {/* ── NON-DRAFT TABS (approved, pending, rejected) ── */}
                          {activeTab !== 'drafts' && (
                            <>
                              {/* Edit: Admin can edit any, Employee can edit own rejected */}
                              {(isAdmin || (isOwnRow && s === 'rejected')) && (
                                <button type="button" title="Edit" onClick={() => openEditModal(row)}
                                  className="rounded-md bg-warning px-2.5 py-1.5 text-white transition hover:bg-warning/90">
                                  <FontAwesomeIcon icon={faPenToSquare} />
                                </button>
                              )}

                              {/* Resubmit: Owner of rejected expense can resubmit (regardless of admin status) */}
                              {(isOwnRow && s === 'rejected') && (
                                <button type="button" title="Resubmit Expense"
                                  onClick={() => handleResubmit(row.expense_id)}
                                  disabled={resubmittingId === row.expense_id}
                                  className="rounded-md bg-blue-500 px-2.5 py-1.5 text-white transition hover:bg-blue-600 disabled:opacity-50">
                                  {resubmittingId === row.expense_id ? (
                                    '...'
                                  ) : (
                                    <>
                                      <FontAwesomeIcon icon={faPaperPlane} className="mr-1" />
                                      Resubmit
                                    </>
                                  )}
                                </button>
                              )}

                              {/* Admin Approve/Reject Pending Expenses */}
                              {isAdmin && activeTab === 'pending' && s === 'pending' && (
                                <>
                                  <button type="button" title="Approve"
                                    onClick={() => openStatusModal(row, 'approved')}
                                    className="rounded-md bg-emerald-600 px-2.5 py-1.5 text-white transition hover:bg-emerald-700">
                                    <FontAwesomeIcon icon={faCheck} />
                                  </button>
                                  <button type="button" title="Reject"
                                    onClick={() => openStatusModal(row, 'rejected')}
                                    className="rounded-md bg-red-500 px-2.5 py-1.5 text-white transition hover:bg-red-600">
                                    <FontAwesomeIcon icon={faXmark} />
                                  </button>
                                </>
                              )}

                              {/* Delete: Admin can delete any, Employee can delete own pending */}
                              {(isAdmin || (isOwnRow && s === 'pending')) && (
                                <button type="button" title="Delete" onClick={() => onDelete(row.expense_id)}
                                  className="rounded-md bg-danger px-2.5 py-1.5 text-white transition hover:bg-danger/90">
                                  <FontAwesomeIcon icon={faTrashCan} />
                                </button>
                              )}
                            </>
                          )}

                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── View Modal ──────────────────────────────────────────────────────── */}
      {viewingExpense && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black bg-opacity-50 px-2 pt-20 pb-6 lg:pl-72">
          <div className="w-[92%] rounded-lg bg-white p-6 shadow-lg dark:bg-boxdark sm:w-[80%] lg:w-[55%]">
            <h3 className="mb-4 border-b border-stroke pb-3 text-lg font-semibold text-black dark:border-strokedark dark:text-white">
              Expense Details
            </h3>
            <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
              {[
                { label: 'Status', value: statusBadge(viewingExpense.status) },
                { label: 'Employee', value: viewingExpense.employee_name || '-' },
                { label: 'Type', value: (viewingExpense.expense_type || 'direct_expense').replace('_', ' ') },
                { label: 'Project', value: viewingExpense.project_name || '-' },
                { label: 'Site', value: viewingExpense.site_location || '-' },
                { label: 'Category', value: viewingExpense.category || '-' },
                { label: 'Vendor', value: viewingExpense.vendor_name || '-' },
                { label: 'Amount', value: viewingExpense.amount ? `₹${Number(viewingExpense.amount).toLocaleString('en-IN')}` : '-' },
                { label: 'Date', value: viewingExpense.expense_date ? viewingExpense.expense_date.slice(0, 10) : '-' },
                { label: 'Payment Mode', value: viewingExpense.payment_mode || '-' },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-md bg-gray-50 p-3 dark:bg-meta-4/20">
                  <p className="text-xs text-gray-500 dark:text-gray-300">{label}</p>
                  <div className="font-medium capitalize text-black dark:text-white">{value}</div>
                </div>
              ))}
              <div className="rounded-md bg-gray-50 p-3 dark:bg-meta-4/20 md:col-span-2">
                <p className="text-xs text-gray-500 dark:text-gray-300">Bill No</p>
                <p className="font-medium text-black dark:text-white">{viewingExpense.bill_number || '-'}</p>
              </div>
              <div className="rounded-md bg-gray-50 p-3 dark:bg-meta-4/20 md:col-span-2">
                <p className="text-xs text-gray-500 dark:text-gray-300">Description</p>
                <p className="font-medium text-black dark:text-white">{viewingExpense.description || '-'}</p>
              </div>
              {viewingExpense.status_remark && (
                <div className="rounded-md bg-gray-50 p-3 dark:bg-meta-4/20 md:col-span-2">
                  <p className="text-xs text-gray-500 dark:text-gray-300">Admin Remark</p>
                  <p className="font-medium text-black dark:text-white">{viewingExpense.status_remark}</p>
                </div>
              )}
            </div>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              {(viewingExpense.bill_url || viewingExpense.attachment_path) && (
                <>
                  <button type="button" onClick={() => openBill(viewingExpense)}
                    className="rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700">
                    View Bill
                  </button>
                  <button type="button" onClick={() => downloadBill(viewingExpense)}
                    className="rounded-md bg-emerald-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-emerald-700">
                    Download Bill
                  </button>
                </>
              )}
            </div>
            <div className="mt-4 flex justify-end">
              <button type="button" onClick={() => setViewingExpense(null)}
                className="rounded-md bg-gray-300 px-4 py-2 text-black transition hover:bg-gray-400 dark:bg-gray-600 dark:text-white">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Approve/Reject Pending Expense Modal ────────────────────────────── */}
      {statusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-boxdark">
            <h3 className="mb-3 text-lg font-semibold text-black dark:text-white">
              {statusModal.action === 'approved' ? '✅ Approve' : '❌ Reject'} Expense
            </h3>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
              {statusModal.expense.description || statusModal.expense.title || 'This expense'} —{' '}
              <strong>₹{Number(statusModal.expense.amount).toLocaleString('en-IN')}</strong>
            </p>
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
              Remark {statusModal.action === 'rejected' && <span className="text-red-500">*</span>}
            </label>
            <input type="text" value={statusRemark} onChange={(e) => setStatusRemark(e.target.value)}
              placeholder={statusModal.action === 'approved' ? 'Optional remark...' : 'Reason for rejection...'}
              className="mb-5 w-full rounded-lg border border-stroke bg-transparent px-3 py-2.5 text-sm text-black dark:border-strokedark dark:text-white" />
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setStatusModal(null)}
                className="rounded-lg bg-gray-300 px-5 py-2.5 text-black hover:bg-gray-400 dark:bg-gray-600 dark:text-white">
                Cancel
              </button>
              <button type="button"
                disabled={statusSaving || (statusModal.action === 'rejected' && !statusRemark.trim())}
                onClick={submitStatusChange}
                className={`rounded-lg px-5 py-2.5 text-white transition disabled:opacity-60 ${statusModal.action === 'approved' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-500 hover:bg-red-600'
                  }`}>
                {statusSaving ? 'Saving...' : statusModal.action === 'approved' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Approve/Reject Draft Modal ───────────────────────────────────────── */}
      {draftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-boxdark">
            <h3 className="mb-3 text-lg font-semibold text-black dark:text-white">
              {draftModal.action === 'draft_approved' ? '✅ Approve Draft' : '❌ Reject Draft'}
            </h3>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
              {draftModal.expense.description || draftModal.expense.title || 'This draft'} —{' '}
              <strong>₹{Number(draftModal.expense.amount).toLocaleString('en-IN')}</strong>
            </p>
            <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
              {draftModal.action === 'draft_approved'
                ? 'Approving allows the employee to convert this draft into a real expense.'
                : 'Rejecting sends the draft back to the employee for revision.'}
            </p>
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
              Remark {draftModal.action === 'draft_rejected' && <span className="text-red-500">*</span>}
            </label>
            <input type="text" value={draftRemark} onChange={(e) => setDraftRemark(e.target.value)}
              placeholder={draftModal.action === 'draft_approved' ? 'Optional remark...' : 'Reason for rejection...'}
              className="mb-5 w-full rounded-lg border border-stroke bg-transparent px-3 py-2.5 text-sm text-black dark:border-strokedark dark:text-white" />
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setDraftModal(null)}
                className="rounded-lg bg-gray-300 px-5 py-2.5 text-black hover:bg-gray-400 dark:bg-gray-600 dark:text-white">
                Cancel
              </button>
              <button type="button"
                disabled={draftSaving || (draftModal.action === 'draft_rejected' && !draftRemark.trim())}
                onClick={submitDraftStatusChange}
                className={`rounded-lg px-5 py-2.5 text-white transition disabled:opacity-60 ${draftModal.action === 'draft_approved' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-500 hover:bg-red-600'
                  }`}>
                {draftSaving
                  ? 'Saving...'
                  : draftModal.action === 'draft_approved' ? 'Approve Draft' : 'Reject Draft'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add / Edit Expense Modal ─────────────────────────────────────────── */}
      <ExpenseEntryModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingExpense(null); }}
        onSaved={() => {
          setModalOpen(false);
          setEditingExpense(null);
          fetchExpenses(activeTab);
          fetchTabCounts();
          showToast(
            editingExpense ? 'Expense updated successfully.' : 'Expense submitted successfully.',
            'success'
          );
        }}
        projects={projects}
        siteLocations={siteLocations}
        vendors={vendors}
        employees={employees}
        categories={categories}
        canSelectAnyEmployee={canSelectAnyEmployee}
        currentUserId={currentUserId}
        editingExpense={editingExpense}
      />
    </div>
  );
};

export default ExpensePrototype;