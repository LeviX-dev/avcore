import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../../public/config.js';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

type Transaction = {
  transaction_id: number;
  transaction_type: 'credit' | 'debit' | 'hold' | 'reversal';
  amount: number;
  balance_after: number;
  status: 'pending' | 'approved' | 'rejected';
  reference_type: string;
  reference_id?: number;
  remarks?: string;
  admin_note?: string;
  initiated_by?: number;
  initiated_by_name?: string;
  created_at: string;
  user_id?: number;
  user_name?: string;
};

const formatINR = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

const WalletTransactions: React.FC = () => {
  const [role, setRole] = useState<string | null>(null);
  const [stats, setStats] = useState({ wallet_balance: 0, total_credited: 0, total_debited: 0 });
  const [rows, setRows] = useState<Transaction[]>([]);
  const [filters, setFilters] = useState({ type: '', status: '', from: '', to: '' });
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [showAllUsers, setShowAllUsers] = useState(false);
  const navigate = useNavigate();

  // Fetch user role on mount
  useEffect(() => {
    fetchUserRole();
  }, []);

  const fetchUserRole = async () => {
    try {
      const response = await axios.get(`${BASE_URL}auth/get-role`, {
        withCredentials: true
      });
      if (response.data?.role) {
        setRole(response.data.role);
        console.log("User role fetched:", response.data.role);
      }
    } catch (err) {
      console.error("Error fetching user role:", err);
      toast.error("Failed to fetch user role");
    }
  };

  // Fetch wallet balance separately (FIXED)
  const fetchWalletBalance = useCallback(async () => {
    setBalanceLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}api/wallet/balance`, { 
        params: showAllUsers ? {} : undefined,
        withCredentials: true 
      });
      setStats(prev => ({ ...prev, wallet_balance: Number(res.data.data?.wallet_balance) || 0 }));
    } catch (err) {
      console.error("Error fetching balance:", err);
      toast.error("Failed to fetch wallet balance");
    } finally {
      setBalanceLoading(false);
    }
  }, [showAllUsers]);

  // Fetch transactions (FIXED - added error toast)
  const fetchRows = useCallback(() => {
    setLoading(true);
    const params: any = { page, limit: pageSize };
    if (filters.type) params.type = filters.type;
    if (filters.status) params.status = filters.status;
    if (filters.from) params.from = filters.from;
    if (filters.to) params.to = filters.to;
    
    let url = `${BASE_URL}api/wallet/transactions`;
    const isAdmin = role === 'admin' || role === 'sub_admin' || role === 'hr';
    
    if (isAdmin && showAllUsers) {
      url = `${BASE_URL}api/wallet/admin/wallet/all-transactions`;
    }
    
    axios.get(url, { params, withCredentials: true })
      .then(res => {
        setRows(res.data.data || []);
        setTotal(res.data.total || 0);
        
        // Calculate credited/debited totals from fetched transactions
        let total_credited = 0;
        let total_debited = 0;
        for (const txn of (res.data.data || [])) {
          if (["credit", "reversal"].includes(txn.transaction_type)) {
            total_credited += Number(txn.amount);
          }
          if (["debit", "hold"].includes(txn.transaction_type)) {
            total_debited += Number(txn.amount);
          }
        }
        setStats(prev => ({ ...prev, total_credited, total_debited }));
      })
      .catch(err => {
        console.error("Error fetching transactions:", err);
        toast.error(err?.response?.data?.message || "Failed to fetch transactions");
        setRows([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [filters, page, role, showAllUsers, pageSize]);

  // Fetch wallet balance when role is loaded and when showAllUsers changes
  useEffect(() => {
    if (role) {
      fetchWalletBalance();
    }
  }, [role, fetchWalletBalance]);

  // Fetch transactions when dependencies change
  useEffect(() => {
    if (role !== null) {
      fetchRows();
    }
  }, [fetchRows, role]);

  // Filter handlers (FIXED - added toast feedback)
  const handleFilter = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters(f => ({ ...f, [e.target.name]: e.target.value }));
    setPage(1);
  };
  
  const resetFilters = () => {
    setFilters({ type: '', status: '', from: '', to: '' });
    setPage(1);
    toast.info("Filters reset");
  };

  // Pagination
  const totalPages = Math.ceil(total / pageSize);
  const isAdmin = role === 'admin' || role === 'sub_admin' || role === 'hr';

  // Show loading state while role is being fetched
  if (role === null) {
    return (
      <div className="flex items-center justify-center min-h-screen dark:bg-black">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-4 dark:bg-black min-h-screen">
      <h1 className="text-2xl font-bold mb-4 dark:text-white">
        {isAdmin && showAllUsers ? "All Users' Wallet Transactions" : "My Wallet Transactions"}
      </h1>
      
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-100 dark:bg-blue-900 rounded-lg p-4 flex flex-col items-center">
          <div className="text-sm text-blue-700 dark:text-blue-200">Wallet Balance</div>
          {balanceLoading ? (
            <div className="text-blue-800 dark:text-blue-300">Loading...</div>
          ) : (
            <div className={`text-2xl font-bold ${Number(stats.wallet_balance) < 0 ? 'text-red-800 dark:text-red-400' : 'text-blue-800 dark:text-blue-300'}`}>
              {Number(stats.wallet_balance) < 0 ? '−' : '₹'}
              {Math.abs(Number(stats.wallet_balance)).toLocaleString('en-IN')}
            </div>
          )}
        </div>
        <div className="bg-green-100 dark:bg-green-900 rounded-lg p-4 flex flex-col items-center">
          <div className="text-sm text-green-700 dark:text-green-200">Total Credited</div>
          <div className="text-2xl font-bold text-green-800 dark:text-green-300">
            {formatINR(Number(stats.total_credited) || 0)}
          </div>
        </div>
        <div className="bg-red-100 dark:bg-red-900 rounded-lg p-4 flex flex-col items-center">
          <div className="text-sm text-red-700 dark:text-red-200">Total Debited</div>
          <div className="text-2xl font-bold text-red-800 dark:text-red-300">
            {formatINR(Number(stats.total_debited) || 0)}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4 items-end">
        <div>
          <label className="block text-xs font-semibold dark:text-gray-200">Type</label>
          <select name="type" value={filters.type} onChange={handleFilter} 
            className="p-2 rounded border dark:bg-gray-800 dark:text-white">
            <option value="">All</option>
            <option value="credit">Credit</option>
            <option value="debit">Debit</option>
            <option value="hold">Hold</option>
            <option value="reversal">Reversal</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold dark:text-gray-200">Status</label>
          <select name="status" value={filters.status} onChange={handleFilter} 
            className="p-2 rounded border dark:bg-gray-800 dark:text-white">
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold dark:text-gray-200">From</label>
          <input type="date" name="from" value={filters.from} onChange={handleFilter} 
            className="p-2 rounded border dark:bg-gray-800 dark:text-white" />
        </div>
        <div>
          <label className="block text-xs font-semibold dark:text-gray-200">To</label>
          <input type="date" name="to" value={filters.to} onChange={handleFilter} 
            className="p-2 rounded border dark:bg-gray-800 dark:text-white" />
        </div>
        <button 
          className="bg-gray-200 dark:bg-gray-700 text-black dark:text-white px-3 py-2 rounded ml-2" 
          onClick={resetFilters} 
          type="button">
          Reset Filters
        </button>
        
        {/* Only show for admin roles */}
        {isAdmin && (
          <div className="flex items-center ml-4">
            <input
              type="checkbox"
              id="showAllUsers"
              checked={showAllUsers}
              onChange={e => setShowAllUsers(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="showAllUsers" className="text-xs font-semibold dark:text-gray-200">
              Show all users
            </label>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 overflow-x-auto">
        {loading ? (
          <div className="text-center py-8 text-gray-400">Loading transactions...</div>
        ) : (
          <>
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
                  <th className="p-2">#</th>
                  {isAdmin && showAllUsers && <th className="p-2">User</th>}
                  <th className="p-2">Date</th>
                  <th className="p-2">Type</th>
                  <th className="p-2">Reference</th>
                  <th className="p-2">Amount</th>
                  <th className="p-2">Balance After</th>
                  <th className="p-2">By</th>
                  <th className="p-2">Note / Remarks</th>
                  <th className="p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((txn, i) => {
                  const statusBadge = (status: string) => {
                    const map: Record<string, string> = {
                      approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
                      pending:  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
                      rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                    };
                    return (
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize 
                        ${map[status] || 'bg-gray-100 text-gray-600'}`}>
                        {status || '-'}
                      </span>
                    );
                  };

                  const isAdjustment = txn.reference_type === 'manual_adjustment';
                  
                  return (
                    <tr
                      key={txn.transaction_id}
                      className={`border-b dark:border-gray-700 ${isAdjustment ? 'bg-amber-50 dark:bg-amber-900/10' : ''}`}
                    >
                      <td className="p-2">{(page - 1) * pageSize + i + 1}</td>
                      {isAdmin && showAllUsers && (
                        <td className="p-2 font-medium">{txn.user_name || txn.user_id || '-'}</td>
                      )}
                      <td className="p-2 whitespace-nowrap">
                        {new Date(txn.created_at).toLocaleString('en-IN')}
                      </td>
                      <td className="p-2 capitalize">
                        <span>{txn.transaction_type}</span>
                        {isAdjustment && (
                          <span className="ml-1 px-1.5 py-0.5 rounded text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 font-semibold">
                            ADJ
                          </span>
                        )}
                      </td>
                      <td className="p-2 text-xs text-gray-500 dark:text-gray-400">
                        {txn.reference_type?.replace(/_/g, ' ') || '-'}
                      </td>
                      <td className={`p-2 font-bold ${['credit','reversal'].includes(txn.transaction_type) ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {['credit','reversal'].includes(txn.transaction_type) ? '↑' : '↓'}
                        {formatINR(Number(txn.amount))}
                      </td>
                      <td className={Number(txn.balance_after) < 0 ? 'p-2 text-red-600 dark:text-red-400' : 'p-2'}>
                        {Number(txn.balance_after) < 0 ? '−' : '₹'}
                        {Math.abs(Number(txn.balance_after)).toLocaleString('en-IN')}
                      </td>
                      <td className="p-2 text-xs">
                        {txn.initiated_by_name ? (
                          <span className={`font-medium ${isAdjustment ? 'text-amber-700 dark:text-amber-400' : 'text-gray-600 dark:text-gray-300'}`}>
                            {txn.initiated_by_name}
                          </span>
                        ) : (
                          <span className="text-gray-300 dark:text-gray-600">—</span>
                        )}
                      </td>
                      <td className="p-2 text-xs max-w-[180px]">
                        {txn.admin_note && (
                          <div className="text-amber-700 dark:text-amber-400 font-medium truncate" title={txn.admin_note}>
                            📝 {txn.admin_note}
                          </div>
                        )}
                        {txn.remarks && (
                          <div className="text-gray-500 dark:text-gray-400 truncate" title={txn.remarks}>
                            {txn.remarks}
                          </div>
                        )}
                        {!txn.admin_note && !txn.remarks && (
                          <span className="text-gray-300 dark:text-gray-600">—</span>
                        )}
                      </td>
                      <td className="p-2">{statusBadge(txn.status)}</td>
                    </tr>
                  );
                })}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={isAdmin && showAllUsers ? 10 : 9} className="text-center py-8 text-gray-400">
                      No transactions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                <button 
                  disabled={page === 1} 
                  onClick={() => setPage(p => p - 1)} 
                  className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 disabled:opacity-50">
                  Prev
                </button>
                <span className="px-2 py-1">Page {page} of {totalPages}</span>
                <button 
                  disabled={page === totalPages} 
                  onClick={() => setPage(p => p + 1)} 
                  className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 disabled:opacity-50">
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default WalletTransactions;