import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../../public/config.js';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const formatINR = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

const WalletTransactions: React.FC = () => {
  const [role, setRole] = useState('');
  const [stats, setStats] = useState({ wallet_balance: 0, total_credited: 0, total_debited: 0 });
  const [rows, setRows] = useState<any[]>([]);
  const [filters, setFilters] = useState({ type: '', status: '', from: '', to: '' });
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

   
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
    }
  };

  // Fetch stats
  useEffect(() => {
    axios.get(`${BASE_URL}api/wallet/balance`, { withCredentials: true })
      .then(res => setStats(res.data.data || {}));
  }, []);

  // Fetch transactions
  const fetchRows = () => {
    setLoading(true);
    const params: any = { page, pageSize };
    if (filters.type) params.type = filters.type;
    if (filters.status) params.status = filters.status;
    if (filters.from) params.from = filters.from;
    if (filters.to) params.to = filters.to;
    let url = `${BASE_URL}api/wallet/transactions`;
    if (role === 'admin' || role === 'sub_admin') {
      url = `${BASE_URL}api/wallet/admin/wallet/all-transactions`;
    }
    axios.get(url, { params, withCredentials: true })
      .then(res => {
        setRows(res.data.data || []);
        setTotal(res.data.total || 0);
      })
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  };
  useEffect(() => { fetchRows(); }, [filters, page, role]);

  // Filter handlers
  const handleFilter = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters(f => ({ ...f, [e.target.name]: e.target.value }));
    setPage(1);
  };
  const resetFilters = () => setFilters({ type: '', status: '', from: '', to: '' });

  // Pagination
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="p-4 dark:bg-black min-h-screen">
      <h1 className="text-2xl font-bold mb-4 dark:text-white">My Wallet Transactions</h1>
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-100 dark:bg-blue-900 rounded-lg p-4 flex flex-col items-center">
          <div className="text-sm text-blue-700 dark:text-blue-200">Wallet Balance</div>
          <div className="text-2xl font-bold text-blue-800 dark:text-blue-300">{formatINR(Number(stats.wallet_balance) || 0)}</div>
        </div>
        <div className="bg-green-100 dark:bg-green-900 rounded-lg p-4 flex flex-col items-center">
          <div className="text-sm text-green-700 dark:text-green-200">Total Credited</div>
          <div className="text-2xl font-bold text-green-800 dark:text-green-300">{formatINR(Number(stats.total_credited) || 0)}</div>
        </div>
        <div className="bg-red-100 dark:bg-red-900 rounded-lg p-4 flex flex-col items-center">
          <div className="text-sm text-red-700 dark:text-red-200">Total Debited</div>
          <div className="text-2xl font-bold text-red-800 dark:text-red-300">{formatINR(Number(stats.total_debited) || 0)}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4 items-end">
        <div>
          <label className="block text-xs font-semibold dark:text-gray-200">Type</label>
          <select name="type" value={filters.type} onChange={handleFilter} className="p-2 rounded border dark:bg-gray-800 dark:text-white">
            <option value="">All</option>
            <option value="credit">Credit</option>
            <option value="debit">Debit</option>
            <option value="hold">Hold</option>
            <option value="reversal">Reversal</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold dark:text-gray-200">Status</label>
          <select name="status" value={filters.status} onChange={handleFilter} className="p-2 rounded border dark:bg-gray-800 dark:text-white">
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold dark:text-gray-200">From</label>
          <input type="date" name="from" value={filters.from} onChange={handleFilter} className="p-2 rounded border dark:bg-gray-800 dark:text-white" />
        </div>
        <div>
          <label className="block text-xs font-semibold dark:text-gray-200">To</label>
          <input type="date" name="to" value={filters.to} onChange={handleFilter} className="p-2 rounded border dark:bg-gray-800 dark:text-white" />
        </div>
        <button className="bg-gray-200 dark:bg-gray-700 text-black dark:text-white px-3 py-2 rounded ml-2" onClick={resetFilters} type="button">Reset Filters</button>
        {(role === 'admin' || role === 'hr') && (
          <button className="ml-auto bg-blue-600 text-white px-4 py-2 rounded" onClick={() => navigate('/wallet/management')}>View All Users</button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="p-2">#</th>
              <th className="p-2">Date</th>
              <th className="p-2">Type</th>
              <th className="p-2">Reference</th>
              <th className="p-2">Amount</th>
              <th className="p-2">Balance After</th>
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
              return (
                <tr key={txn.transaction_id} className="border-b dark:border-gray-700">
                  <td className="p-2">{(page - 1) * pageSize + i + 1}</td>
                  <td className="p-2">{new Date(txn.created_at).toLocaleString('en-IN')}</td>
                  <td className="p-2">{txn.transaction_type}</td>
                  <td className="p-2">{txn.reference_type}</td>
                  <td className={`p-2 font-bold ${['credit','reversal'].includes(txn.transaction_type) ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{['credit','reversal'].includes(txn.transaction_type) ? '↑' : '↓'}{formatINR(Number(txn.amount))}</td>
                  <td className="p-2">{formatINR(Number(txn.balance_after))}</td>
                  <td className="p-2">{statusBadge(txn.status)}</td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr><td colSpan={7} className="text-center py-8 text-gray-400">No transactions found</td></tr>
            )}
          </tbody>
        </table>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 disabled:opacity-50">Prev</button>
            <span className="px-2 py-1">Page {page} of {totalPages}</span>
            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 disabled:opacity-50">Next</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletTransactions;
