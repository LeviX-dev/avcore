import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../../public/config.js';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ProjectOption = {
  master_id: number;
  project_name: string;
  site_location: string | null;
};

export type VendorOption = {
  vendor_id: number;
  company_name: string;
  vendor_name?: string | null;
};

export type SiteLocationOption = {
  site_location: string;
};

export type EmployeeOption = {
  user_id: number;
  name: string;
  role: string;
};

export type ExpenseCategory = {
  category_id: number;
  category_name: string;
};

export type ExpenseRow = {
  title: string | null;
  expense_id: number;
  expense_type: string | null;
  employee_id: number | null;
  employee_name: string | null;
  category: string | null;
  status: string | null;
  status_remark: string | null;
  project_master_id: number | null;
  project_name: string | null;
  site_location: string | null;
  category_id: number | null;
  vendor_id: number | null;
  vendor_name: string | null;
  payment_mode: string | null;
  bill_number: string | null;
  description: string | null;
  amount: number | string;
  expense_date: string;
  attachment_path: string | null;
  attachment_name: string | null;
  attachment_url?: string | null;
  bill_url?: string | null;
  remark?: string | null;
  approved_amount?: number | string | null;
};

type ExpenseForm = {
  expense_type: 'direct_expense' | 'project_expense';
  employee_id: string;
  project_master_id: string;
  project_name: string;
  site_location: string;
  category_id: string;
  vendor_source: 'vendor' | 'other';
  vendor_id: string;
  vendor_name: string;
  payment_mode: string;
  bill_number: string;
  description: string;
  amount: string;
  expense_date: string;
  attachment_path: string;
  attachment_name: string;
  remark: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  projects: ProjectOption[];
  siteLocations: SiteLocationOption[];
  vendors: VendorOption[];
  employees: EmployeeOption[];
  categories: ExpenseCategory[];
  canSelectAnyEmployee: boolean;
  currentUserId: number | null;
  editingExpense: ExpenseRow | null;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const paymentModes = [
  { label: 'Cash',          value: 'cash' },
  { label: 'Bank Transfer', value: 'bank' },
  { label: 'UPI',           value: 'upi' },
  { label: 'Credit Card',   value: 'credit_card' },
  { label: 'Other',         value: 'other' },
];

const initialForm: ExpenseForm = {
  expense_type: 'direct_expense',
  employee_id: '',
  project_master_id: '',
  project_name: '',
  site_location: '',
  category_id: '',
  vendor_source: 'vendor',
  vendor_id: '',
  vendor_name: '',
  payment_mode: '',
  bill_number: '',
  description: '',
  amount: '',
  expense_date: '',
  attachment_path: '',
  attachment_name: '',
  remark: '',
};

const DRAFT_STATUSES = ['draft_pending', 'draft_approved', 'draft_rejected'];

// ─── Component ────────────────────────────────────────────────────────────────

const ExpenseEntryModal: React.FC<Props> = ({
  open,
  onClose,
  onSaved,
  projects,
  siteLocations,
  vendors,
  employees,
  categories,
  canSelectAnyEmployee,
  currentUserId,
  editingExpense,
}) => {
  const [form, setForm] = useState<ExpenseForm>(initialForm);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // expense_mode: 'direct' = deduct wallet now, 'draft' = send for admin review
  const [expenseMode, setExpenseMode] = useState<'direct' | 'draft'>('direct');

  // Wallet balance
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [walletLoading, setWalletLoading] = useState(false);

  const getWalletUserId = () => {
    if (canSelectAnyEmployee && form.employee_id) return form.employee_id;
    return currentUserId ? String(currentUserId) : '';
  };

  const fetchWalletBalance = (userId: string) => {
    if (!userId) { setWalletBalance(null); return; }
    setWalletLoading(true);
    axios
      .get(`${BASE_URL}api/wallet/balance`, {
        params: { user_id: userId },
        withCredentials: true,
      })
      .then((res) => setWalletBalance(Number(res.data.data?.wallet_balance) || 0))
      .catch(() => setWalletBalance(null))
      .finally(() => setWalletLoading(false));
  };

  useEffect(() => {
    if (open) fetchWalletBalance(getWalletUserId());
  }, [open, form.employee_id, canSelectAnyEmployee]);

  useEffect(() => {
    if (!open) return;
    if (editingExpense) {
      setForm({
        expense_type: editingExpense.expense_type === 'project_expense' ? 'project_expense' : 'direct_expense',
        employee_id: editingExpense.employee_id ? String(editingExpense.employee_id) : (currentUserId ? String(currentUserId) : ''),
        project_master_id: editingExpense.project_master_id ? String(editingExpense.project_master_id) : '',
        project_name: editingExpense.project_name || '',
        site_location: editingExpense.site_location || '',
        category_id: editingExpense.category_id ? String(editingExpense.category_id) : '',
        vendor_source: editingExpense.vendor_id ? 'vendor' : 'other',
        vendor_id: editingExpense.vendor_id ? String(editingExpense.vendor_id) : '',
        vendor_name: editingExpense.vendor_id ? '' : (editingExpense.vendor_name || ''),
        payment_mode: editingExpense.payment_mode || '',
        bill_number: editingExpense.bill_number || '',
        description: editingExpense.description || '',
        amount: String(editingExpense.amount || ''),
        expense_date: editingExpense.expense_date ? editingExpense.expense_date.slice(0, 10) : '',
        attachment_path: editingExpense.attachment_path || '',
        attachment_name: editingExpense.attachment_name || '',
        remark: editingExpense.remark || '',
      });
      setExpenseMode(DRAFT_STATUSES.includes(editingExpense.status || '') ? 'draft' : 'direct');
    } else {
      setForm({
        ...initialForm,
        employee_id: currentUserId ? String(currentUserId) : (employees[0] ? String(employees[0].user_id) : ''),
      });
      setExpenseMode('direct');
    }
    setAttachmentFile(null);
    setFeedback(null);
    setSaving(false);
  }, [open, editingExpense, currentUserId, employees]);

  useEffect(() => {
    if (!open) setExpenseMode('direct');
  }, [open]);

  if (!open) return null;

  const isEditing = Boolean(editingExpense);
  const editingStatus = editingExpense?.status || '';

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'expense_type') {
      setForm((prev) => ({
        ...prev,
        expense_type: value as 'direct_expense' | 'project_expense',
        project_master_id: value === 'project_expense' ? prev.project_master_id : '',
        project_name: value === 'project_expense' ? prev.project_name : '',
        site_location: value === 'project_expense' ? prev.site_location : '',
      }));
      return;
    }

    if (name === 'employee_id') {
      setForm((prev) => ({ ...prev, employee_id: value }));
      return;
    }

    if (name === 'project_master_id') {
      const selectedProject = projects.find((p) => String(p.master_id) === value);
      setForm((prev) => ({
        ...prev,
        project_master_id: value,
        project_name: selectedProject?.project_name || '',
        site_location: selectedProject?.site_location || '',
      }));
      return;
    }

    if (name === 'vendor_source') {
      setForm((prev) => ({
        ...prev,
        vendor_source: value as 'vendor' | 'other',
        vendor_id: value === 'vendor' ? prev.vendor_id : '',
        vendor_name: value === 'other' ? prev.vendor_name : '',
      }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!form.expense_type) return 'Expense type is required';
    if (!form.employee_id) return 'Employee is required';
    if (form.expense_type === 'project_expense' && !form.project_master_id)
      return 'Project is required for project expense';
    if (!form.category_id) return 'Expense category is required';
    if (!form.amount) return 'Amount is required';
    if (!form.expense_date) return 'Expense date is required';
    if (expenseMode === 'direct') {
      if (!form.vendor_id && !form.vendor_name) return 'Vendor is required';
      if (!form.payment_mode) return 'Payment mode is required';
      if (!form.bill_number) return 'Bill number is required';
    }
    return null;
  };

  const buildPayload = (): FormData => {
    const payload = new FormData();
    payload.append('expense_type', form.expense_type);
    payload.append('employee_id', form.employee_id);
    payload.append('project_master_id', form.expense_type === 'project_expense' ? form.project_master_id : '');
    payload.append('project_name', form.expense_type === 'project_expense' ? form.project_name : '');
    payload.append('site_location', form.expense_type === 'project_expense' ? form.site_location : '');
    payload.append('category_id', form.category_id);
    payload.append('vendor_source', form.vendor_source);
    payload.append('vendor_id', form.vendor_source === 'vendor' ? form.vendor_id : '');
    payload.append('vendor_name', form.vendor_source === 'other' ? form.vendor_name : '');
    payload.append('payment_mode', form.payment_mode);
    payload.append('bill_number', form.bill_number);
    payload.append('description', form.description);
    payload.append('amount', form.amount);
    payload.append('expense_date', form.expense_date);
    payload.append('remark', form.remark || '');
    payload.append('attachment_path', form.attachment_path);
    payload.append('attachment_name', form.attachment_name);
    payload.append('expense_mode', expenseMode);
    if (attachmentFile) payload.append('attachment', attachmentFile);
    return payload;
  };

  const submit = async () => {
    const error = validate();
    if (error) { setFeedback(error); return; }

    setSaving(true);
    setFeedback(null);
    const payload = buildPayload();

    try {
      if (editingExpense?.expense_id) {
        await axios.put(
          `${BASE_URL}api/v1/expense/${editingExpense.expense_id}`,
          payload,
          { withCredentials: true }
        );
      } else {
        await axios.post(`${BASE_URL}api/v1/expense`, payload, { withCredentials: true });
      }
      onClose();
      setTimeout(onSaved, 100);
    } catch (err: any) {
      setFeedback(err?.response?.data?.message || 'Failed to save expense');
    } finally {
      setSaving(false);
    }
  };

  const submitLabel = () => {
    if (saving) return 'Submitting...';
    if (isEditing) {
      if (editingStatus === 'draft_rejected') return 'Resubmit for Review';
      if (editingStatus === 'rejected') return 'Resubmit Expense';
      return 'Update Expense';
    }
    return expenseMode === 'draft' ? 'Save as Draft' : 'Submit Expense';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black bg-opacity-50 px-2 pt-20 pb-6 lg:pl-72">
      <div className="w-[92%] rounded-lg bg-white p-6 shadow-lg dark:bg-boxdark sm:w-[80%] lg:w-[70%]">

        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-black dark:text-white">
            {isEditing ? 'Edit Expense' : 'Add Expense'}
          </h3>
          {isEditing && editingStatus && (
            <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
              editingStatus === 'approved'       ? 'bg-emerald-100 text-emerald-700' :
              editingStatus === 'rejected'       ? 'bg-red-100 text-red-600' :
              editingStatus === 'draft_pending'  ? 'bg-yellow-100 text-yellow-700' :
              editingStatus === 'draft_approved' ? 'bg-emerald-100 text-emerald-700' :
              editingStatus === 'draft_rejected' ? 'bg-red-100 text-red-600' :
                                                   'bg-yellow-100 text-yellow-700'
            }`}>
              {{
                draft_pending:  'Awaiting Review',
                draft_approved: 'Draft Approved',
                draft_rejected: 'Draft Rejected',
                approved:       'Approved',
                pending:        'Pending',
                rejected:       'Rejected',
              }[editingStatus] || editingStatus}
            </span>
          )}
        </div>

        {!isEditing && (
          <div className="mb-5">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setExpenseMode('direct')}
                className={`rounded-lg px-4 py-2 text-sm font-medium border transition ${
                  expenseMode === 'direct'
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-black border-stroke dark:bg-boxdark dark:text-white dark:border-strokedark'
                }`}
              >
                Direct Expense
              </button>
              <button
                type="button"
                onClick={() => setExpenseMode('draft')}
                className={`rounded-lg px-4 py-2 text-sm font-medium border transition ${
                  expenseMode === 'draft'
                    ? 'bg-yellow-400 text-black border-yellow-400'
                    : 'bg-white text-black border-stroke dark:bg-boxdark dark:text-white dark:border-strokedark'
                }`}
              >
                Draft (Request First)
              </button>
            </div>
           
          </div>
        )}

        {isEditing && (editingStatus === 'rejected' || editingStatus === 'draft_rejected') && editingExpense?.status_remark && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-700/40 dark:bg-red-950/30 dark:text-red-400">
            <strong>Rejected:</strong> {editingExpense.status_remark}
          </div>
        )}

        {feedback && (
          <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-500 dark:bg-red-950/30">
            {feedback}
          </p>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">

          <div className="md:col-span-2 xl:col-span-3">
            <div className="rounded-lg border border-stroke bg-gray-50 px-4 py-2.5 dark:border-strokedark dark:bg-meta-4/20">
              {walletLoading ? (
                <p className="text-xs text-gray-500 dark:text-gray-300">Loading wallet balance...</p>
              ) : walletBalance !== null ? (
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500 dark:text-gray-300">Available Budget</p>
                  <p className={`text-sm font-semibold ${walletBalance < 0 ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}>
                    {walletBalance < 0 ? '−' : '₹'}{Math.abs(walletBalance).toLocaleString('en-IN')}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-red-500">Unable to fetch wallet balance</p>
              )}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">Expense Type</label>
            <select 
              name="expense_type" 
              value={form.expense_type} 
              onChange={onChange}
              className="w-full rounded-lg border border-stroke bg-white px-4 py-3 text-black dark:border-strokedark dark:bg-boxdark dark:text-white"
              required
            >
              <option value="direct_expense">Direct Expense</option>
              <option value="project_expense">Project Expense</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">Employee</label>
            <select 
              name="employee_id" 
              value={form.employee_id} 
              onChange={onChange}
              disabled={!canSelectAnyEmployee}
              className="w-full rounded-lg border border-stroke bg-white px-4 py-3 text-black disabled:bg-gray-100 dark:border-strokedark dark:bg-boxdark dark:text-white dark:disabled:bg-gray-800"
              required
            >
              <option value="">Select employee</option>
              {employees.map((emp) => (
                <option key={emp.user_id} value={emp.user_id}>{emp.name}</option>
              ))}
            </select>
          </div>

          {form.expense_type === 'project_expense' && (
            <div>
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">Project</label>
              <select 
                name="project_master_id" 
                value={form.project_master_id} 
                onChange={onChange}
                className="w-full rounded-lg border border-stroke bg-white px-4 py-3 text-black dark:border-strokedark dark:bg-boxdark dark:text-white"
                required
              >
                <option value="">Select project</option>
                {projects.map((p) => (
                  <option key={p.master_id} value={p.master_id}>{p.project_name}</option>
                ))}
              </select>
            </div>
          )}

          {form.expense_type === 'project_expense' && (
            <div>
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">Site / Location</label>
              <select 
                name="site_location" 
                value={form.site_location} 
                onChange={onChange}
                className="w-full rounded-lg border border-stroke bg-white px-4 py-3 text-black dark:border-strokedark dark:bg-boxdark dark:text-white"
              >
                <option value="">Select location</option>
                {siteLocations.map((s) => (
                  <option key={s.site_location} value={s.site_location}>{s.site_location}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">Expense Category</label>
            <select 
              name="category_id" 
              value={form.category_id} 
              onChange={onChange}
              className="w-full rounded-lg border border-stroke bg-white px-4 py-3 text-black dark:border-strokedark dark:bg-boxdark dark:text-white"
              required
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">Vendor Type</label>
            <select 
              name="vendor_source" 
              value={form.vendor_source} 
              onChange={onChange}
              className="w-full rounded-lg border border-stroke bg-white px-4 py-3 text-black dark:border-strokedark dark:bg-boxdark dark:text-white"
            >
              <option value="vendor">Active Vendor</option>
              <option value="other">Other</option>
            </select>
          </div>

          {form.vendor_source === 'vendor' ? (
            <div>
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">Vendor</label>
              <select 
                name="vendor_id" 
                value={form.vendor_id} 
                onChange={onChange}
                className="w-full rounded-lg border border-stroke bg-white px-4 py-3 text-black dark:border-strokedark dark:bg-boxdark dark:text-white"
              >
                <option value="">Select vendor</option>
                {vendors.map((v) => (
                  <option key={v.vendor_id} value={v.vendor_id}>
                    {v.vendor_name ? `${v.company_name} - ${v.vendor_name}` : v.company_name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">Other Vendor Name</label>
              <input 
                name="vendor_name" 
                value={form.vendor_name} 
                onChange={onChange}
                placeholder="Enter vendor name"
                className="w-full rounded-lg border border-stroke bg-white px-4 py-3 text-black dark:border-strokedark dark:bg-boxdark dark:text-white" 
              />
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">Payment Mode</label>
            <select 
              name="payment_mode" 
              value={form.payment_mode} 
              onChange={onChange}
              className="w-full rounded-lg border border-stroke bg-white px-4 py-3 text-black dark:border-strokedark dark:bg-boxdark dark:text-white"
            >
              <option value="">Select payment mode</option>
              {paymentModes.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            {expenseMode === 'direct' && !form.payment_mode && (
              <p className="mt-1 text-xs text-orange-500">Required for direct expense</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">Bill Number</label>
            <input 
              name="bill_number" 
              value={form.bill_number} 
              onChange={onChange}
              placeholder="Bill / invoice number"
              className="w-full rounded-lg border border-stroke bg-white px-4 py-3 text-black dark:border-strokedark dark:bg-boxdark dark:text-white" 
            />
            {expenseMode === 'direct' && !form.bill_number && (
              <p className="mt-1 text-xs text-orange-500">Required for direct expense</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">Amount (₹)</label>
            <input 
              name="amount" 
              type="number" 
              min="0" 
              step="0.01" 
              value={form.amount} 
              onChange={onChange}
              placeholder="0.00"
              className="w-full rounded-lg border border-stroke bg-white px-4 py-3 text-black dark:border-strokedark dark:bg-boxdark dark:text-white" 
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">Expense Date</label>
            <input 
              name="expense_date" 
              type="date" 
              value={form.expense_date} 
              onChange={onChange}
              className="w-full rounded-lg border border-stroke bg-white px-4 py-3 text-black dark:border-strokedark dark:bg-boxdark dark:text-white" 
              required 
            />
          </div>

          <div className="xl:col-span-3">
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">Description</label>
            <textarea 
              name="description" 
              value={form.description} 
              onChange={onChange} 
              rows={3}
              className="w-full rounded-lg border border-stroke bg-white px-4 py-3 text-black dark:border-strokedark dark:bg-boxdark dark:text-white" 
            />
          </div>

          <div className="xl:col-span-2">
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
              Attachment (Bill / Invoice)
            </label>
            {form.attachment_name && !attachmentFile && (
              <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">Current: {form.attachment_name}</p>
            )}
            <input 
              type="file" 
              accept="image/*,application/pdf"
              onChange={(e) => setAttachmentFile(e.target.files?.[0] || null)}
              className="w-full rounded-lg border border-stroke bg-white px-4 py-3 text-black dark:border-strokedark dark:bg-boxdark dark:text-white" 
            />
          </div>

          <div className="xl:col-span-1">
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">Remark</label>
            <input 
              name="remark" 
              value={form.remark} 
              onChange={onChange}
              placeholder="Optional note..."
              className="w-full rounded-lg border border-stroke bg-white px-4 py-3 text-black dark:border-strokedark dark:bg-boxdark dark:text-white" 
            />
          </div>

          <div className="xl:col-span-3 mt-2 flex flex-wrap justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="rounded-lg bg-gray-300 px-5 py-2.5 text-black transition hover:bg-gray-400 dark:bg-gray-600 dark:text-white"
            >
              Cancel
            </button>
            <button 
              type="button" 
              disabled={saving} 
              onClick={submit}
              className="rounded-lg bg-blue-500 px-5 py-2.5 text-white transition hover:bg-blue-600 disabled:opacity-70"
            >
              {submitLabel()}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ExpenseEntryModal;