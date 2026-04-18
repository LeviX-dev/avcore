import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../../public/config.js';
import { Eye, Edit, Plus, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-toastify';

// Utility for currency formatting
const formatINR = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

const WalletManagement: React.FC = () => {
  const [tab, setTab] = useState<'requests' | 'users'>('requests');
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showTxnPanel, setShowTxnPanel] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [adjustType, setAdjustType] = useState<'credit' | 'debit'>('credit');
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustNote, setAdjustNote] = useState('');
  const [txnUser, setTxnUser] = useState<any>(null);
  const [txnRows, setTxnRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [topupForm, setTopupForm] = useState({ user_id: '', amount: '', reason: '' });
  const [adminNote, setAdminNote] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [role, setRole] = useState('');

  // Fetch user role on mount
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await axios.get(`${BASE_URL}auth/get-role`, {
          withCredentials: true
        });
        if (response.data?.role) {
          setRole(response.data.role);
        }
      } catch (err) {
        console.error("Error fetching user role:", err);
      }
    };
    fetchUserRole();
  }, []);

  // Fetch users for Select User dropdown (for topup request)
  const [usersList, setUsersList] = useState<any[]>([]);
  const fetchUsersList = () => {
    axios.get(BASE_URL + 'api/wallet/users-list', { withCredentials: true })
      .then(res => setUsersList(res.data.data || []))
      .catch(() => {
        toast.error('Failed to load users. Please refresh.');
        setUsersList([]);
      });
  };

  // Fetch top-up requests
  const fetchTopupRequests = () => {
    axios.get(BASE_URL + 'api/wallet/admin/wallet/topup-requests', { withCredentials: true })
      .then(res => setRequests(res.data.data || []))
      .catch(() => {
        axios.get(BASE_URL + 'api/wallet/topup-requests', { withCredentials: true })
          .then(res => setRequests(res.data.data || []));
      });
  };
  useEffect(() => {
    fetchTopupRequests();
  }, []);

  // Fetch all users with wallet for tab 2
  const [userWallets, setUserWallets] = useState<any[]>([]);
  useEffect(() => {
    if (tab === 'users') {
      axios.get(BASE_URL + 'api/wallet/admin/wallet/users', { withCredentials: true })
        .then(res => setUserWallets(res.data.data || []));
    }
  }, [tab, showAdjustModal]);

  // Handlers
  const openTopupModal = () => {
    fetchUsersList();
    setShowTopupModal(true);
  };
  const closeTopupModal = () => { setShowTopupModal(false); setTopupForm({ user_id: '', amount: '', reason: '' }); };

  const handleTopupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topupForm.user_id || !topupForm.amount || isNaN(Number(topupForm.amount)) || Number(topupForm.amount) <= 0) {
      toast.error('User and valid amount required');
      return;
    }
    setLoading(true);
    try {
      await axios.post(BASE_URL + 'api/wallet/topup-request', {
        user_id: topupForm.user_id,
        amount: topupForm.amount,
        reason: topupForm.reason
      }, { withCredentials: true });
      toast.success('Top-up request submitted');
      closeTopupModal();
      fetchTopupRequests(); // Refresh requests after successful submit
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to submit');
    } finally {
      setLoading(false);
    }
  };

  // Approve/Reject actions
  const handleApprove = async (req: any) => {
    if (!window.confirm('Approve this top-up request?')) return;
    setLoading(true);
    try {
      await axios.put(BASE_URL + `api/wallet/admin/wallet/topup-requests/${req.topup_id}/approve`, {}, { withCredentials: true });
      toast.success('Approved');
      setRequests(r => r.map(x => x.topup_id === req.topup_id ? { ...x, status: 'approved' } : x));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };
  const handleReject = async () => {
    if (!adminNote) return toast.error('Admin note required');
    setLoading(true);
    try {
      await axios.put(BASE_URL + `api/wallet/admin/wallet/topup-requests/${selectedRequest.topup_id}/reject`, { admin_note: adminNote }, { withCredentials: true });
      toast.success('Rejected');
      setRequests(r => r.map(x => x.topup_id === selectedRequest.topup_id ? { ...x, status: 'rejected', admin_note: adminNote } : x));
      setShowRejectModal(false);
      setAdminNote('');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  // Manual adjust
  const openAdjustModal = (user: any) => { setSelectedUser(user); setShowAdjustModal(true); setAdjustType('credit'); setAdjustAmount(''); setAdjustNote(''); };
  const closeAdjustModal = () => setShowAdjustModal(false);
  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustAmount || !adjustNote) return toast.error('Amount and note required');
    setLoading(true);
    try {
      await axios.post(BASE_URL + `api/wallet/admin/wallet/users/${selectedUser.user_id}/adjust`, { amount: adjustAmount, type: adjustType, admin_note: adjustNote }, { withCredentials: true });
      toast.success('Wallet adjusted');
      closeAdjustModal();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  // User transaction panel
  const openTxnPanel = async (user: any) => {
    setTxnUser(user);
    setShowTxnPanel(true);
    setLoading(true);
    try {
      const res = await axios.get(BASE_URL + `api/wallet/admin/wallet/users/${user.user_id}/transactions`, { withCredentials: true });
      setTxnRows(res.data.data || []);
    } catch {
      setTxnRows([]);
    } finally {
      setLoading(false);
    }
  };
  const closeTxnPanel = () => setShowTxnPanel(false);

  // UI
  return (
    <div className="p-4 dark:bg-black min-h-screen">
      <h1 className="text-2xl font-bold mb-4 dark:text-white">Wallet Management</h1>
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          className={`px-4 py-2 rounded-t-md font-semibold ${tab === 'requests' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-800 dark:text-gray-200'}`}
          onClick={() => setTab('requests')}
        >Top-up Requests</button>
        <button
          className={`px-4 py-2 rounded-t-md font-semibold ${tab === 'users' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-800 dark:text-gray-200'}`}
          onClick={() => setTab('users')}
        >Users & Balances</button>
      </div>

      {/* Top-up Requests Tab */}
      {tab === 'requests' && (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-4">
            <div className="font-semibold text-lg dark:text-white">Top-up Requests</div>
            {/* Show for all with permission */}
              <button className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2" onClick={openTopupModal}>
                <Plus size={18} /> New Top-up Request
              </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
                  <th className="p-2">#</th>
                  <th className="p-2">Requested By</th>
                  <th className="p-2">For User</th>
                  <th className="p-2">Amount</th>
                  <th className="p-2">Reason</th>
                  <th className="p-2">Date</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Admin Note</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req, i) => (
                  <tr key={req.topup_id} className="border-b dark:border-gray-700">
                    <td className="p-2">{i + 1}</td>
                    <td className="p-2">{req.requested_by_name}</td>
                    <td className="p-2">{req.target_user_name || req.user_name}</td>
                    <td className="p-2 font-bold text-blue-600 dark:text-blue-400">{formatINR(Number(req.amount))}</td>
                    <td className="p-2">{req.reason}</td>
                    <td className="p-2">{new Date(req.requested_at).toLocaleString('en-IN')}</td>
                    <td className="p-2">
                      {req.status === 'pending' && <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-2 py-1 rounded">Pending</span>}
                      {req.status === 'approved' && <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 px-2 py-1 rounded">Approved</span>}
                      {req.status === 'rejected' && <span className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-2 py-1 rounded">Rejected</span>}
                    </td>
                    <td className="p-2">{req.admin_note || '-'}</td>
                    <td className="p-2 flex gap-2">
                      {(role === 'admin' || role === 'sub_admin') && req.status?.toLowerCase() === 'pending' && (
                        <>
                          <button
                            className="bg-emerald-600 text-white rounded p-1"
                            title="Approve"
                            onClick={() => handleApprove(req)}
                          >
                            <CheckCircle size={18} />
                          </button>

                          <button
                            className="bg-red-600 text-white rounded p-1"
                            title="Reject"
                            onClick={() => {
                              setSelectedRequest(req);
                              setShowRejectModal(true);
                            }}
                          >
                            <XCircle size={18} />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Users & Balances Tab */}
      {tab === 'users' && (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4">
          <div className="font-semibold text-lg mb-4 dark:text-white">Users & Balances</div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
                  <th className="p-2">#</th>
                  <th className="p-2">Name</th>
                  <th className="p-2">Email</th>
                  <th className="p-2">Role</th>
                  <th className="p-2">Wallet Balance</th>
                  <th className="p-2">Total Credited</th>
                  <th className="p-2">Total Debited</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {userWallets.map((user, i) => (
                  <tr key={user.user_id} className="border-b dark:border-gray-700">
                    <td className="p-2">{i + 1}</td>
                    <td className="p-2">{user.name}</td>
                    <td className="p-2">{user.email}</td>
                    <td className="p-2">{user.role}</td>
                    <td className={`p-2 font-bold ${Number(user.wallet_balance) < 0 ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}>{Number(user.wallet_balance) < 0 ? '−' : '₹'}{Math.abs(Number(user.wallet_balance)).toLocaleString('en-IN')}</td>
                    <td className="p-2 text-green-600 dark:text-green-400">{formatINR(Number(user.total_credited))}</td>
                    <td className="p-2 text-red-600 dark:text-red-400">{formatINR(Number(user.total_debited))}</td>
                    <td className="p-2 flex gap-2">
                      <button className="bg-blue-600 text-white rounded p-1" title="Transactions" onClick={() => openTxnPanel(user)}><Eye size={18} /></button>
                      <button className="bg-yellow-400 text-black rounded p-1" title="Adjust" onClick={() => openAdjustModal(user)}><Edit size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Top-up Request Modal */}
      {showTopupModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <form className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md" onSubmit={handleTopupSubmit}>
            <div className="text-lg font-bold mb-4 dark:text-white">New Top-up Request</div>
            <label className="block mb-2 text-sm font-semibold dark:text-gray-200">Select User</label>
            <select className="w-full mb-3 p-2 rounded border dark:bg-gray-800 dark:text-white" required value={topupForm.user_id} onChange={e => setTopupForm(f => ({ ...f, user_id: e.target.value }))}>
              <option value="">Select User</option>
              {usersList.map(u => (
                <option key={u.user_id} value={u.user_id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
            <label className="block mb-2 text-sm font-semibold dark:text-gray-200">Amount</label>
            <input type="number" min="1" className="w-full mb-3 p-2 rounded border dark:bg-gray-800 dark:text-white" required value={topupForm.amount} onChange={e => setTopupForm(f => ({ ...f, amount: e.target.value }))} />
            <label className="block mb-2 text-sm font-semibold dark:text-gray-200">Reason (optional)</label>
            <textarea className="w-full mb-3 p-2 rounded border dark:bg-gray-800 dark:text-white" value={topupForm.reason} onChange={e => setTopupForm(f => ({ ...f, reason: e.target.value }))} />
            <div className="flex gap-2 mt-4">
              <button type="button" className="bg-gray-300 dark:bg-gray-700 text-black dark:text-white px-4 py-2 rounded" onClick={closeTopupModal}>Cancel</button>
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>{loading ? 'Submitting...' : 'Submit'}</button>
            </div>
          </form>
        </div>
      )}

      {/* Manual Adjust Modal */}
      {showAdjustModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <form className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md" onSubmit={handleAdjustSubmit}>
            <div className="text-lg font-bold mb-4 dark:text-white">Manual Wallet Adjustment</div>
            <div className="mb-2 text-gray-700 dark:text-gray-200">User: <span className="font-semibold">{selectedUser?.name}</span></div>
            <div className="flex gap-4 mb-3">
              <label className="flex items-center gap-1">
                <input type="radio" name="adjustType" value="credit" checked={adjustType === 'credit'} onChange={() => setAdjustType('credit')} /> Credit
              </label>
              <label className="flex items-center gap-1">
                <input type="radio" name="adjustType" value="debit" checked={adjustType === 'debit'} onChange={() => setAdjustType('debit')} /> Debit
              </label>
            </div>
            <label className="block mb-2 text-sm font-semibold dark:text-gray-200">Amount</label>
            <input type="number" min="1" className="w-full mb-3 p-2 rounded border dark:bg-gray-800 dark:text-white" required value={adjustAmount} onChange={e => setAdjustAmount(e.target.value)} />
            <label className="block mb-2 text-sm font-semibold dark:text-gray-200">Admin Note</label>
            <textarea className="w-full mb-3 p-2 rounded border dark:bg-gray-800 dark:text-white" required value={adjustNote} onChange={e => setAdjustNote(e.target.value)} />
            <div className="text-yellow-700 dark:text-yellow-300 mb-3 text-xs">⚠️ This directly modifies user wallet balance</div>
            <div className="flex gap-2 mt-4">
              <button type="button" className="bg-gray-300 dark:bg-gray-700 text-black dark:text-white px-4 py-2 rounded" onClick={closeAdjustModal}>Cancel</button>
              <button type="submit" className="bg-yellow-400 text-black px-4 py-2 rounded" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
            </div>
          </form>
        </div>
      )}

      {/* User Transaction Panel */}
      {showTxnPanel && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <div className="text-lg font-bold dark:text-white">Transactions for {txnUser?.name}</div>
              <button className="text-gray-500 hover:text-black dark:hover:text-white" onClick={closeTxnPanel}>✕</button>
            </div>
            {/* Filters and Export CSV can be added here */}
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800">
                    <th className="p-2">Txn ID</th>
                    <th className="p-2">Date</th>
                    <th className="p-2">Type</th>
                    <th className="p-2">Reference</th>
                    <th className="p-2">Amount</th>
                    <th className="p-2">Balance Before</th>
                    <th className="p-2">Balance After</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {txnRows.map(txn => (
                    <tr key={txn.transaction_id} className="border-b dark:border-gray-700">
                      <td className="p-2">{txn.transaction_id}</td>
                      <td className="p-2">{new Date(txn.created_at).toLocaleString('en-IN')}</td>
                      <td className="p-2">{txn.type}</td>
                      <td className="p-2">{txn.reference_type}</td>
                      <td className={`p-2 font-bold ${['credit','reversal'].includes(txn.type) ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{['credit','reversal'].includes(txn.type) ? '↑' : '↓'}{formatINR(Number(txn.amount))}</td>
                      <td className={Number(txn.balance_before) < 0 ? 'p-2 text-red-600 dark:text-red-400' : 'p-2'}>{Number(txn.balance_before) < 0 ? '−' : '₹'}{Math.abs(Number(txn.balance_before)).toLocaleString('en-IN')}</td>
                      <td className={Number(txn.balance_after) < 0 ? 'p-2 text-red-600 dark:text-red-400' : 'p-2'}>{Number(txn.balance_after) < 0 ? '−' : '₹'}{Math.abs(Number(txn.balance_after)).toLocaleString('en-IN')}</td>
                      <td className="p-2">{txn.status}</td>
                      <td className="p-2">{txn.remarks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="text-lg font-bold mb-4 dark:text-white">Reject Top-up Request</div>
            <label className="block mb-2 text-sm font-semibold dark:text-gray-200">Admin Note (required)</label>
            <textarea className="w-full mb-3 p-2 rounded border dark:bg-gray-800 dark:text-white" required value={adminNote} onChange={e => setAdminNote(e.target.value)} />
            <div className="flex gap-2 mt-4">
              <button type="button" className="bg-gray-300 dark:bg-gray-700 text-black dark:text-white px-4 py-2 rounded" onClick={() => setShowRejectModal(false)}>Cancel</button>
              <button type="button" className="bg-red-600 text-white px-4 py-2 rounded" disabled={loading} onClick={handleReject}>{loading ? 'Rejecting...' : 'Reject'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletManagement;
