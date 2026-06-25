import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../../public/config.js';
import { Eye, Edit, Plus, CheckCircle, XCircle, RotateCcw, User, Wallet, Calendar, Hash } from 'lucide-react';
import { toast } from 'react-toastify';

// ─── Utility Functions ─────────────────────────────────────────────────────────

const formatINR = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

const getStatusBadge = (status: string) => {
  const statusMap: Record<string, { label: string; className: string }> = {
    pending: {
      label: 'Pending PM/HR',
      className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    },
    awaiting_accountant: {
      label: 'Awaiting Accountant',
      className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    },
    approved: {
      label: '✅ Approved',
      className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
    },
    rejected: {
      label: '❌ Rejected',
      className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    },
    cancelled: {
      label: 'Cancelled',
      className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  };

  const config = statusMap[status] || statusMap.pending;
  return (
    <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${config.className}`}>
      {config.label}
    </span>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────

const WalletManagement: React.FC = () => {
  const [tab, setTab] = useState<'requests' | 'users'>('requests');
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showTxnPanel, setShowTxnPanel] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [requests, setRequests] = useState<any[]>([]);
  const [userWallets, setUserWallets] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [txnRows, setTxnRows] = useState<any[]>([]);

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [txnUser, setTxnUser] = useState<any>(null);

  const [adjustType, setAdjustType] = useState<'credit' | 'debit'>('credit');
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustNote, setAdjustNote] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [topupForm, setTopupForm] = useState({ user_id: '', amount: '', reason: '' });

  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('');
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [currentUserName, setCurrentUserName] = useState('');
  const [isRoleLoaded, setIsRoleLoaded] = useState(false);

  // ─── Fetch User Role and ID ──────────────────────────────────────────────

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        // auth/get-name returns { id, name, username, role } — single call, no backend change needed
        const res = await axios.get(`${BASE_URL}auth/get-name`, {
          withCredentials: true
        });
        if (res.data?.role) {
          setRole(res.data.role);
          setCurrentUserId(res.data.id || null);
          setCurrentUserName(res.data.name || '');
        }
        setIsRoleLoaded(true);
      } catch (err) {
        console.error('Error fetching user info:', err);
        setIsRoleLoaded(true);
      }
    };
    fetchUserRole();
  }, []);

  // ─── Fetch Top-Up Requests ───────────────────────────────────────────────

  const fetchTopupRequests = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}api/topup/requests`, {
        withCredentials: true
      });
      setRequests(response.data?.data || []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to fetch top-up requests');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  // ─── Fetch Users List ─────────────────────────────────────────────────────

  const fetchUsersList = async () => {
    try {
      const response = await axios.get(`${BASE_URL}api/wallet/users-list`, {
        withCredentials: true
      });
      setUsersList(response.data?.data || []);
    } catch (err: any) {
      toast.error('Failed to load users');
      setUsersList([]);
    }
  };

  // ─── Fetch User Wallets ──────────────────────────────────────────────────

  const fetchUserWallets = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}api/wallet/admin/wallet/users`, {
        withCredentials: true
      });
      setUserWallets(response.data?.data || []);
    } catch (err: any) {
      toast.error('Failed to fetch users');
      setUserWallets([]);
    } finally {
      setLoading(false);
    }
  };

  // ─── Initial Data Fetch ──────────────────────────────────────────────────

  useEffect(() => {
    if (isRoleLoaded) {
      fetchTopupRequests();
      fetchUsersList();
    }
  }, [isRoleLoaded]);

  useEffect(() => {
    if (isRoleLoaded && tab === 'users') {
      fetchUserWallets();
    }
  }, [tab, isRoleLoaded]);

  // ─── Role-Based Permissions ─────────────────────────────────────────────

  const canViewAllRequests = ['admin', 'sub_admin', 'hr_executive', 'project_manager', 'accountant'].includes(role);
  const canSelectEmployee = ['admin', 'sub_admin', 'hr'].includes(role);
  const isAdmin = role === 'admin' || role === 'sub_admin';
  const isStage1Approver = role === 'project_manager' || role === 'hr_executive' || role === 'hr';
  const isAccountant = role === 'accountant';

  const canViewRequest = (req: any) => {
    if (canViewAllRequests) return true;
    return req.employee_id === currentUserId;
  };

  // ─── Handlers: Top-Up Request ────────────────────────────────────────────

  const openTopupModal = () => {
    fetchUsersList();
    setTopupForm({ user_id: '', amount: '', reason: '' });
    setShowTopupModal(true);
  };

  const closeTopupModal = () => {
    setShowTopupModal(false);
    setTopupForm({ user_id: '', amount: '', reason: '' });
  };

  // ✅ FIX: For employees, use currentUserId directly from state instead of topupForm.user_id
  const handleTopupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ FIX: Determine target user ID correctly
    // - Admins/HR can select any employee → use topupForm.user_id
    // - Regular employees → always use currentUserId from state
    const targetUserId = canSelectEmployee
      ? topupForm.user_id
      : currentUserId;

    // Validate target user
    if (!targetUserId) {
      toast.error('User not found. Please refresh and try again.');
      return;
    }

    // Validate amount
    if (!topupForm.amount || Number(topupForm.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    // Extra safety: non-admin cannot request for someone else
    if (!canSelectEmployee && Number(targetUserId) !== currentUserId) {
      toast.error('You can only request top-up for yourself');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        employee_id: targetUserId,
        amount: Number(topupForm.amount),
        reason: topupForm.reason || null
      };

      const response = await axios.post(
        `${BASE_URL}api/topup/request`,
        payload,
        { withCredentials: true }
      );

      toast.success(`Top-up request ${response.data.request_number || ''} submitted for approval`);
      closeTopupModal();
      fetchTopupRequests();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  // ─── Handlers: Stage 1 Approve (PM/HR) ──────────────────────────────────

  const handleStage1Approve = async (req: any, approverType: 'pm' | 'hr') => {
    setLoading(true);
    try {
      const roleLabel = approverType === 'pm' ? 'PM' : 'HR';
      const payload = { remark: `${roleLabel} approved on ${new Date().toLocaleString()}` };

      const response = await axios.patch(
        `${BASE_URL}api/topup/${req.id}/approve-stage1`,
        payload,
        { withCredentials: true }
      );

      toast.success(response.data.message);
      fetchTopupRequests();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to approve');
    } finally {
      setLoading(false);
    }
  };

  // ─── Handlers: Stage 2 Approve (Accountant) ─────────────────────────────

  const handleAccountantApprove = async (req: any) => {
    if (!window.confirm(`Approve top-up of ${formatINR(Number(req.amount))} for ${req.employee_name}?`)) {
      return;
    }

    setLoading(true);
    try {
      const payload = { remark: `Final approved on ${new Date().toLocaleString()}` };

      const response = await axios.patch(
        `${BASE_URL}api/topup/${req.id}/approve-accountant`,
        payload,
        { withCredentials: true }
      );

      toast.success(response.data.message);
      fetchTopupRequests();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to approve');
    } finally {
      setLoading(false);
    }
  };

  // ─── Handlers: Reject ────────────────────────────────────────────────────

  const openRejectModal = (req: any) => {
    setSelectedRequest(req);
    setShowRejectModal(true);
    setAdminNote('');
  };

  const closeRejectModal = () => {
    setShowRejectModal(false);
    setSelectedRequest(null);
    setAdminNote('');
  };

  const handleReject = async () => {
    if (!adminNote.trim()) {
      toast.error('Rejection reason is required');
      return;
    }

    setLoading(true);
    try {
      const payload = { reason: adminNote };

      const response = await axios.patch(
        `${BASE_URL}api/topup/${selectedRequest.id}/reject`,
        payload,
        { withCredentials: true }
      );

      toast.success(`Request ${selectedRequest.request_number || ''} rejected`);
      closeRejectModal();
      fetchTopupRequests();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to reject');
    } finally {
      setLoading(false);
    }
  };

  // ─── Handlers: Cancel Request (Employee) ────────────────────────────────

  const handleCancel = async (req: any) => {
    if (!window.confirm(`Cancel top-up request ${req.request_number || ''}?`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await axios.patch(
        `${BASE_URL}api/topup/${req.id}/cancel`,
        {},
        { withCredentials: true }
      );

      toast.success(response.data.message);
      fetchTopupRequests();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to cancel');
    } finally {
      setLoading(false);
    }
  };

  // ─── Handlers: View Details ─────────────────────────────────────────────

  const openDetailModal = (req: any) => {
    setSelectedRequest(req);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedRequest(null);
  };

  // ─── Handlers: Manual Adjust ─────────────────────────────────────────────

  const openAdjustModal = (user: any) => {
    setSelectedUser(user);
    setShowAdjustModal(true);
    setAdjustType('credit');
    setAdjustAmount('');
    setAdjustNote('');
  };

  const closeAdjustModal = () => {
    setShowAdjustModal(false);
    setSelectedUser(null);
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!adjustAmount || !adjustNote) {
      toast.error('Amount and note are required');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        amount: Number(adjustAmount),
        type: adjustType,
        admin_note: adjustNote
      };

      const response = await axios.post(
        `${BASE_URL}api/wallet/admin/wallet/users/${selectedUser.user_id}/adjust`,
        payload,
        { withCredentials: true }
      );

      toast.success(`Wallet ${adjustType === 'credit' ? 'credited' : 'debited'} successfully`);
      closeAdjustModal();
      fetchUserWallets();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to adjust wallet');
    } finally {
      setLoading(false);
    }
  };

  // ─── Handlers: View Transactions ────────────────────────────────────────

  const openTxnPanel = async (user: any) => {
    setTxnUser(user);
    setShowTxnPanel(true);
    setLoading(true);
    try {
      const response = await axios.get(
        `${BASE_URL}api/wallet/admin/wallet/users/${user.user_id}/transactions`,
        { withCredentials: true }
      );
      setTxnRows(response.data?.data || []);
    } catch (err: any) {
      toast.error('Failed to fetch transactions');
      setTxnRows([]);
    } finally {
      setLoading(false);
    }
  };

  const closeTxnPanel = () => {
    setShowTxnPanel(false);
    setTxnUser(null);
    setTxnRows([]);
  };

  // ─── Filter requests based on role ──────────────────────────────────────

  const filteredRequests = requests.filter(req => canViewRequest(req));

  // ─── Loading State ──────────────────────────────────────────────────────

  if (!isRoleLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="p-4 dark:bg-black min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 dark:text-white flex items-center gap-2">
          <Wallet className="h-6 w-6" />
          Wallet Management
        </h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
          <button
            className={`px-4 py-2 font-semibold transition-colors ${
              tab === 'requests'
                ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
            onClick={() => setTab('requests')}
          >
            Top-up Requests
            {filteredRequests.filter(r => r.status === 'pending' || r.status === 'awaiting_accountant').length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {filteredRequests.filter(r => r.status === 'pending' || r.status === 'awaiting_accountant').length}
              </span>
            )}
          </button>
          <button
            className={`px-4 py-2 font-semibold transition-colors ${
              tab === 'users'
                ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
            onClick={() => setTab('users')}
          >
            Users & Balances
          </button>
        </div>

        {/* ─── TAB 1: TOP-UP REQUESTS ─── */}
        {tab === 'requests' && (
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4">
            <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
              <div className="font-semibold text-lg dark:text-white">
                All Requests
                {!canViewAllRequests && (
                  <span className="ml-2 text-sm font-normal text-gray-400">(Your requests only)</span>
                )}
              </div>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 transition"
                onClick={openTopupModal}
              >
                <Plus size={18} /> New Top-up Request
              </button>
            </div>

            {loading && filteredRequests.length === 0 ? (
              <div className="text-center py-8 text-gray-400">Loading...</div>
            ) : filteredRequests.length === 0 ? (
              <div className="text-center py-8 text-gray-400">No top-up requests found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-800">
                      <th className="p-2 text-left">Request #</th>
                      <th className="p-2 text-left">Employee</th>
                      <th className="p-2 text-right">Amount</th>
                      <th className="p-2 text-left">Date</th>
                      <th className="p-2 text-left">Status</th>
                      <th className="p-2 text-left">Approvals</th>
                      <th className="p-2 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((req) => (
                      <tr key={req.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="p-2 font-mono text-xs">
                          {req.request_number || `#${req.id}`}
                        </td>
                        <td className="p-2">
                          <div className="font-medium">{req.employee_name}</div>
                          <div className="text-xs text-gray-400">{req.employee_role}</div>
                        </td>
                        <td className="p-2 text-right font-bold text-blue-600 dark:text-blue-400">
                          {formatINR(Number(req.amount))}
                        </td>
                        <td className="p-2 text-xs">
                          {new Date(req.created_at).toLocaleDateString('en-IN')}
                        </td>
                        <td className="p-2">{getStatusBadge(req.status)}</td>
                        <td className="p-2">
                          <div className="flex gap-2 text-xs">
                            <span className={req.pm_approved_at ? 'text-emerald-600' : 'text-gray-400'}>
                              PM {req.pm_approved_at ? '✅' : '⏳'}
                            </span>
                            <span className={req.hr_approved_at ? 'text-emerald-600' : 'text-gray-400'}>
                              HR {req.hr_approved_at ? '✅' : '⏳'}
                            </span>
                          </div>
                        </td>
                        <td className="p-2">
                          <div className="flex flex-wrap justify-center gap-1">
                            {/* View Details */}
                            <button
                              className="p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                              title="View Details"
                              onClick={() => openDetailModal(req)}
                            >
                              <Eye size={16} />
                            </button>

                            {/* Cancel - Employee only, pending status */}
                            {!canViewAllRequests &&
                             req.status === 'pending' &&
                             req.employee_id === currentUserId && (
                              <button
                                className="p-1.5 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
                                title="Cancel Request"
                                onClick={() => handleCancel(req)}
                              >
                                <RotateCcw size={16} />
                              </button>
                            )}

                            {/* Stage 1 Approve - PM/HR */}
                            {isStage1Approver && req.status === 'pending' && (
                              <>
                                {!req.pm_approved_at && role === 'project_manager' && (
                                  <button
                                    className="p-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition"
                                    title="Approve as PM"
                                    onClick={() => handleStage1Approve(req, 'pm')}
                                  >
                                    <CheckCircle size={16} />
                                  </button>
                                )}
                                {!req.hr_approved_at && (role === 'hr_executive' || role === 'hr') && (
                                  <button
                                    className="p-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition"
                                    title="Approve as HR"
                                    onClick={() => handleStage1Approve(req, 'hr')}
                                  >
                                    <CheckCircle size={16} />
                                  </button>
                                )}
                              </>
                            )}

                            {/* Stage 2 Approve - Accountant */}
                            {isAccountant && req.status === 'awaiting_accountant' && (
                              <button
                                className="p-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition"
                                title="Final Approve"
                                onClick={() => handleAccountantApprove(req)}
                              >
                                <CheckCircle size={16} />
                              </button>
                            )}

                            {/* Reject - PM/HR/Accountant */}
                            {(isStage1Approver || isAccountant) &&
                             (req.status === 'pending' || req.status === 'awaiting_accountant') && (
                              <button
                                className="p-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition"
                                title="Reject"
                                onClick={() => openRejectModal(req)}
                              >
                                <XCircle size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ─── TAB 2: USERS & BALANCES ─── */}
        {tab === 'users' && (
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4">
            <div className="font-semibold text-lg mb-4 dark:text-white">Users & Wallet Balances</div>

            {loading && userWallets.length === 0 ? (
              <div className="text-center py-8 text-gray-400">Loading...</div>
            ) : userWallets.length === 0 ? (
              <div className="text-center py-8 text-gray-400">No users found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-800">
                      <th className="p-2 text-left">#</th>
                      <th className="p-2 text-left">Name</th>
                      <th className="p-2 text-left">Email</th>
                      <th className="p-2 text-left">Role</th>
                      <th className="p-2 text-right">Balance</th>
                      <th className="p-2 text-right">Total Credited</th>
                      <th className="p-2 text-right">Total Debited</th>
                      <th className="p-2 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userWallets.map((user, i) => (
                      <tr key={user.user_id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="p-2 text-gray-400">{i + 1}</td>
                        <td className="p-2 font-medium">{user.name}</td>
                        <td className="p-2 text-gray-500">{user.email}</td>
                        <td className="p-2">
                          <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">
                            {user.role}
                          </span>
                        </td>
                        <td className={`p-2 text-right font-bold ${Number(user.wallet_balance) < 0 ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}>
                          {Number(user.wallet_balance) < 0 ? '−' : ''}{formatINR(Math.abs(Number(user.wallet_balance)))}
                        </td>
                        <td className="p-2 text-right text-emerald-600 dark:text-emerald-400">
                          {formatINR(Number(user.total_credited || 0))}
                        </td>
                        <td className="p-2 text-right text-red-600 dark:text-red-400">
                          {formatINR(Number(user.total_debited || 0))}
                        </td>
                        <td className="p-2">
                          <div className="flex justify-center gap-1">
                            <button
                              className="p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                              title="View Transactions"
                              onClick={() => openTxnPanel(user)}
                            >
                              <Eye size={16} />
                            </button>
                            {isAdmin && (
                              <button
                                className="p-1.5 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
                                title="Adjust Wallet"
                                onClick={() => openAdjustModal(user)}
                              >
                                <Edit size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── MODAL: New Top-up Request ────────────────────────────────────── */}
      {showTopupModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-bold mb-4 dark:text-white flex items-center gap-2">
                <Plus size={20} /> New Top-up Request
              </h3>

              <form onSubmit={handleTopupSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-200">
                      {canSelectEmployee ? 'Select Employee *' : 'Employee'}
                    </label>

                    {/* ✅ FIX: Admin/HR → dropdown; Employee → read-only display */}
                    {canSelectEmployee ? (
                      <select
                        className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        value={topupForm.user_id}
                        onChange={(e) => setTopupForm(f => ({ ...f, user_id: e.target.value }))}
                        required
                      >
                        <option value="">Select User</option>
                        {usersList.map((u) => (
                          <option key={u.user_id} value={u.user_id}>
                            {u.name} ({u.email})
                          </option>
                        ))}
                      </select>
                    ) : (
                      // Employee: read-only display — submit uses currentUserId from state directly
                      // currentUserName comes from auth/get-name: { id, name, username, role }
                      <div className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white text-gray-700">
                        {(() => {
                          // 1. Try usersList (may be absent if API excludes this user)
                          const self = usersList.find(u => u.user_id === currentUserId);
                          if (self) {
                            return <>{self.name} <span className="text-gray-400 text-xs">({self.email})</span></>;
                          }
                          // 2. Use name from auth response
                          if (currentUserName) {
                            return <span>{currentUserName}</span>;
                          }
                          // 3. Fallback
                          return <span className="text-gray-500 text-sm">Myself (User #{currentUserId})</span>;
                        })()}
                      </div>
                    )}

                    {!canSelectEmployee && (
                      <p className="text-xs text-gray-400 mt-1">You can only request for yourself</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-200">Amount (₹) *</label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      placeholder="Enter amount"
                      value={topupForm.amount}
                      onChange={(e) => setTopupForm(f => ({ ...f, amount: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-200">Reason</label>
                    <textarea
                      className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white resize-none"
                      rows={3}
                      placeholder="Why do you need this top-up?"
                      value={topupForm.reason}
                      onChange={(e) => setTopupForm(f => ({ ...f, reason: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition"
                    onClick={closeTopupModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: Reject ────────────────────────────────────────────────── */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-bold mb-4 dark:text-white flex items-center gap-2 text-red-600">
                <XCircle size={20} /> Reject Request
              </h3>

              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Rejecting request <span className="font-mono">{selectedRequest.request_number || `#${selectedRequest.id}`}</span> for <strong>{selectedRequest.employee_name}</strong> of {formatINR(Number(selectedRequest.amount))}
              </p>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-200">Rejection Reason *</label>
                <textarea
                  className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white resize-none"
                  rows={3}
                  placeholder="Why are you rejecting this request?"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  required
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition"
                  onClick={closeRejectModal}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                  onClick={handleReject}
                  disabled={loading || !adminNote.trim()}
                >
                  {loading ? 'Rejecting...' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: View Details ──────────────────────────────────────────── */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold dark:text-white">Request Details</h3>
                <button
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  onClick={closeDetailModal}
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400">Request Number</label>
                  <p className="font-mono text-sm">{selectedRequest.request_number || `#${selectedRequest.id}`}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-400">Status</label>
                  <div>{getStatusBadge(selectedRequest.status)}</div>
                </div>
                <div>
                  <label className="text-xs text-gray-400">Employee</label>
                  <p className="font-medium">{selectedRequest.employee_name}</p>
                  <p className="text-xs text-gray-400">{selectedRequest.employee_role}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-400">Amount</label>
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {formatINR(Number(selectedRequest.amount))}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-400">Reason</label>
                  <p className="text-sm">{selectedRequest.reason || 'No reason provided'}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-400">Created</label>
                  <p className="text-sm">{new Date(selectedRequest.created_at).toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-400">PM Approved</label>
                  <p className="text-sm">
                    {selectedRequest.pm_approved_at
                      ? `${new Date(selectedRequest.pm_approved_at).toLocaleString('en-IN')}${selectedRequest.pm_remark ? ` — ${selectedRequest.pm_remark}` : ''}`
                      : '⏳ Pending'}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-400">HR Approved</label>
                  <p className="text-sm">
                    {selectedRequest.hr_approved_at
                      ? `${new Date(selectedRequest.hr_approved_at).toLocaleString('en-IN')}${selectedRequest.hr_remark ? ` — ${selectedRequest.hr_remark}` : ''}`
                      : '⏳ Pending'}
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-gray-400">Accountant Approval</label>
                  <p className="text-sm">
                    {selectedRequest.accountant_approved_at
                      ? `${new Date(selectedRequest.accountant_approved_at).toLocaleString('en-IN')}${selectedRequest.accountant_remark ? ` — ${selectedRequest.accountant_remark}` : ''}`
                      : selectedRequest.status === 'approved' ? '✅ Approved' : '⏳ Pending'}
                  </p>
                </div>
                {selectedRequest.rejected_reason && (
                  <div className="col-span-2">
                    <label className="text-xs text-red-400">Rejection Reason</label>
                    <p className="text-sm text-red-600 dark:text-red-400">{selectedRequest.rejected_reason}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-6">
                <button
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition"
                  onClick={closeDetailModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: View Transactions ─────────────────────────────────────── */}
      {showTxnPanel && txnUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold dark:text-white">
                  Transactions for {txnUser.name}
                  <span className="ml-2 text-sm font-normal text-gray-400">
                    Balance: {formatINR(Number(txnUser.wallet_balance))}
                  </span>
                </h3>
                <button
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  onClick={closeTxnPanel}
                >
                  ✕
                </button>
              </div>

              {loading ? (
                <div className="text-center py-8 text-gray-400">Loading...</div>
              ) : txnRows.length === 0 ? (
                <div className="text-center py-8 text-gray-400">No transactions found</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="bg-gray-100 dark:bg-gray-800">
                        <th className="p-2 text-left">ID</th>
                        <th className="p-2 text-left">Date</th>
                        <th className="p-2 text-left">Type</th>
                        <th className="p-2 text-right">Amount</th>
                        <th className="p-2 text-right">Balance</th>
                        <th className="p-2 text-left">Reference</th>
                        <th className="p-2 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {txnRows.map((txn) => (
                        <tr key={txn.transaction_id} className="border-b dark:border-gray-700">
                          <td className="p-2 text-xs">{txn.transaction_id}</td>
                          <td className="p-2 text-xs">{new Date(txn.created_at).toLocaleString('en-IN')}</td>
                          <td className="p-2">
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              txn.transaction_type === 'credit' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                              txn.transaction_type === 'debit' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {txn.transaction_type}
                            </span>
                          </td>
                          <td className={`p-2 text-right font-bold ${
                            txn.transaction_type === 'credit' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                          }`}>
                            {txn.transaction_type === 'credit' ? '+' : '-'}{formatINR(Number(txn.amount))}
                          </td>
                          <td className="p-2 text-right">{formatINR(Number(txn.balance_after))}</td>
                          <td className="p-2 text-xs">{txn.reference_type}</td>
                          <td className="p-2">
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              txn.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                              txn.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {txn.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: Adjust Wallet ─────────────────────────────────────────── */}
      {showAdjustModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-bold mb-4 dark:text-white">Adjust Wallet</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                {selectedUser.name} — Current Balance: {formatINR(Number(selectedUser.wallet_balance))}
              </p>

              <form onSubmit={handleAdjustSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-200">Type</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="adjustType"
                          value="credit"
                          checked={adjustType === 'credit'}
                          onChange={() => setAdjustType('credit')}
                        />
                        Credit (Add)
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="adjustType"
                          value="debit"
                          checked={adjustType === 'debit'}
                          onChange={() => setAdjustType('debit')}
                        />
                        Debit (Remove)
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-200">Amount (₹) *</label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      placeholder="Enter amount"
                      value={adjustAmount}
                      onChange={(e) => setAdjustAmount(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-200">Admin Note *</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      placeholder="Why is this adjustment being made?"
                      value={adjustNote}
                      onChange={(e) => setAdjustNote(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition"
                    onClick={closeAdjustModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Apply Adjustment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletManagement;