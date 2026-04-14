import db from '../database/db.js';
import WalletService from '../services/walletService.js';

  // --- USER ENDPOINTS ---

  // POST /api/wallet/topup-request
  export const submitTopupRequest = async (req, res) => {
    try {
      const user = req.session?.user;
      if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });
      const { user_id, amount, reason } = req.body;
      const targetUserId = user_id || user.id;
      console.log('Received topup request:', { requested_by: user.id, target_user_id: targetUserId, amount, reason });
      if (!targetUserId || !amount || amount <= 0) return res.status(400).json({ success: false, message: 'User and valid amount required' });
      // Duplicate topup check (pending, same amount, 24h, for same target user)
      const [dupes] = await db.query(
        `SELECT 1 FROM wallet_topup_requests WHERE requested_by = ? AND target_user_id = ? AND amount = ? AND status = 'pending' AND requested_at >= NOW() - INTERVAL 1 DAY`,
        [user.id, targetUserId, amount]
      );
      if (dupes.length) return res.status(409).json({ success: false, message: 'Similar pending topup exists in last 24h' });
      await db.query(
        `INSERT INTO wallet_topup_requests (requested_by, target_user_id, amount, reason, status) VALUES (?, ?, ?, ?, ?)` ,
        [user.id, targetUserId, amount, reason || null, 'pending']
      );
      res.status(201).json({ success: true, message: 'Topup request submitted' });
    } catch (err) {
      console.log('Error submitting topup request:', err);
      res.status(500).json({ success: false, message: 'Failed to submit topup request' });
    }
  };

  // GET /api/wallet/topup-requests
  export const getMyTopupRequests = async (req, res) => {
    try {
      const user = req.session?.user;
      if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });
      const [rows] = await db.query(
        `SELECT * FROM wallet_topup_requests WHERE requested_by = ? ORDER BY requested_at DESC`,
        [user.id]
      );
      res.json({ success: true, data: rows });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to fetch topup requests' });
    }
  };

  // GET /api/wallet/balance
  export const getMyWalletBalance = async (req, res) => {
    try {
   const user = req.query.user_id;
      if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });
      const [[row]] = await db.query(
        `SELECT wallet_balance, total_credited, total_debited FROM users WHERE user_id = ?`,
        [user]
      );
      res.json({ success: true, data: row });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to fetch wallet balance' });
    }
  };

  // GET /api/wallet/transactions
  export const getMyTransactions = async (req, res) => {
    try {
      const user = req.session?.user;
      if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });
      const { page = 1, pageSize = 20 } = req.query;
      const offset = (page - 1) * pageSize;
      const [rows] = await db.query(
        `SELECT * FROM wallet_transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [user.id, +pageSize, +offset]
      );
      res.json({ success: true, data: rows });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to fetch transactions' });
    }
  };

  // GET /api/wallet/transactions/:id
  export const getTransactionDetail = async (req, res) => {
    try {
      const user = req.session?.user;
      if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });
      const { id } = req.params;
      const [[row]] = await db.query(
        `SELECT * FROM wallet_transactions WHERE transaction_id = ? AND user_id = ?`,
        [id, user.id]
      );
      if (!row) return res.status(404).json({ success: false, message: 'Transaction not found' });
      res.json({ success: true, data: row });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to fetch transaction detail' });
    }
  };

  // --- ADMIN ENDPOINTS ---

  // GET /api/admin/wallet/topup-requests
  export const getAllTopupRequests = async (req, res) => {
    try {
      const user = req.session?.user;
      if (!user || !['admin','hr'].includes(user.role)) return res.status(403).json({ success: false, message: 'Forbidden' });
      const [rows] = await db.query(
        `SELECT r.*, u1.name as requested_by_name, u2.name as target_user_name FROM wallet_topup_requests r JOIN users u1 ON r.requested_by = u1.user_id JOIN users u2 ON r.target_user_id = u2.user_id ORDER BY requested_at DESC`
      );
      res.json({ success: true, data: rows });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to fetch topup requests' });
    }
  };

  // PUT /api/admin/wallet/topup-requests/:id/approve
  export const approveTopupRequest = async (req, res) => {
    try {
      const user = req.session?.user;
      if (!user || !['admin','hr'].includes(user.role)) return res.status(403).json({ success: false, message: 'Forbidden' });
      const { id } = req.params;
      const [[reqRow]] = await db.query(`SELECT * FROM wallet_topup_requests WHERE topup_id = ? AND status = 'pending'`, [id]);
      if (!reqRow) return res.status(404).json({ success: false, message: 'Request not found or already actioned' });
      // Credit wallet to TARGET user
      await WalletService.creditWallet({
        userId: reqRow.target_user_id,
        amount: reqRow.amount,
        initiatedBy: user.id,
        referenceType: 'wallet_topup',
        referenceId: id,
        remarks: reqRow.reason,
        adminNote: req.body.admin_note || null,
        status: 'approved'
      });
      await db.query(`UPDATE wallet_topup_requests SET status = 'approved', approved_by = ?, admin_note = ?, actioned_at = NOW() WHERE topup_id = ?`, [user.id, req.body.admin_note || null, id]);
      res.json({ success: true, message: 'Topup approved and wallet credited' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to approve topup' });
    }
  };

  // PUT /api/admin/wallet/topup-requests/:id/reject
  export const rejectTopupRequest = async (req, res) => {
    try {
      const user = req.session?.user;
      if (!user || !['admin','hr'].includes(user.role)) return res.status(403).json({ success: false, message: 'Forbidden' });
      const { id } = req.params;
      const [[reqRow]] = await db.query(`SELECT * FROM wallet_topup_requests WHERE topup_id = ? AND status = 'pending'`, [id]);
      if (!reqRow) return res.status(404).json({ success: false, message: 'Request not found or already actioned' });
      await db.query(`UPDATE wallet_topup_requests SET status = 'rejected', approved_by = ?, admin_note = ?, actioned_at = NOW() WHERE topup_id = ?`, [user.id, req.body.admin_note || null, id]);
      // No wallet change on rejection
      res.json({ success: true, message: 'Topup rejected' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to reject topup' });
    }
  };

  // GET /api/admin/wallet/users
  export const getAllUsersWithWallet = async (req, res) => {
    try {
      const user = req.session?.user;
      if (!user || !['admin','hr','sub_admin','accountant'].includes(user.role)) return res.status(403).json({ success: false, message: 'Forbidden' });
      const [rows] = await db.query(
        `SELECT user_id, name, email, role, wallet_balance, total_credited, total_debited FROM users`
      );
      res.json({ success: true, data: rows });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to fetch users' });
    }
  };

// GET /api/wallet/users-list
export const getUsersList = async (req, res) => {
  try {
    const user = req.session?.user;
    if (!user || !['admin','hr','hr_executive','accountant','sub_admin'].includes(user.role)) return res.status(403).json({ success: false, message: 'Forbidden' });
    const [rows] = await db.query(
      `SELECT user_id, name, email, role FROM users WHERE role NOT IN ('admin','hr','accountant','sub_admin') AND status = 'active' ORDER BY name ASC`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch users list' });
  }
};

  // GET /api/admin/wallet/users/:id/transactions
  export const getUserTransactions = async (req, res) => {
    try {
      const user = req.session?.user;
      if (!user || !['admin','hr','sub_admin'].includes(user.role)) return res.status(403).json({ success: false, message: 'Forbidden' });
      const { id } = req.params;
      const [rows] = await db.query(
        `SELECT * FROM wallet_transactions WHERE user_id = ? ORDER BY created_at DESC`,
        [id]
      );
      res.json({ success: true, data: rows });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to fetch transactions' });
    }
  };

  // POST /api/admin/wallet/users/:id/adjust
  export const manualAdjustWallet = async (req, res) => {
    try {
      const user = req.session?.user;
      if (!user || !['admin','hr'].includes(user.role)) return res.status(403).json({ success: false, message: 'Forbidden' });
      const { id } = req.params;
      const { amount, type, admin_note } = req.body;
      if (!amount || amount <= 0 || !['credit','debit'].includes(type) || !admin_note) {
        return res.status(400).json({ success: false, message: 'Invalid input' });
      }
      if (type === 'credit') {
        await WalletService.creditWallet({
          userId: id,
          amount,
          initiatedBy: user.id,
          referenceType: 'manual_adjustment',
          referenceId: null,
          remarks: null,
          adminNote: admin_note,
          status: 'approved'
        });
      } else {
        await WalletService.debitWallet({
          userId: id,
          amount,
          initiatedBy: user.id,
          referenceType: 'manual_adjustment',
          referenceId: null,
          remarks: null,
          adminNote: admin_note,
          status: 'approved'
        });
      }
      res.json({ success: true, message: 'Wallet adjusted' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to adjust wallet' });
    }
  };
