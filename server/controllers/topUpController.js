import db from '../database/db.js';
import {WalletService} from '../services/walletService.js';

// ─── Role Definitions ─────────────────────────────────────────────────────────

const STAGE1_APPROVER_ROLES = ['project_manager', 'hr_executive', 'hr']; // Added 'hr' for backward compatibility
const ACCOUNTANT_ROLES = ['accountant'];
const ADMIN_ROLES = ['admin', 'sub_admin'];

const isStage1Approver = (role) =>
  STAGE1_APPROVER_ROLES.includes(String(role || '').toLowerCase());

const isAccountant = (role) =>
  ACCOUNTANT_ROLES.includes(String(role || '').toLowerCase());

const isAdmin = (role) =>
  ADMIN_ROLES.includes(String(role || '').toLowerCase());

// Helper to check if user is HR (either role)
const isHR = (role) => {
  const roleLower = String(role || '').toLowerCase();
  return roleLower === 'hr_executive' || roleLower === 'hr';
};

// Helper to check if user is PM
const isPM = (role) => {
  return String(role || '').toLowerCase() === 'project_manager';
};

const getSessionUser = (req) => {
  const user = req.session?.user;
  if (!user?.id) return null;
  return {
    id: Number(user.id),
    role: String(user.role || '').toLowerCase(),
    name: user.name || user.username || null,
  };
};

// ─── Generate Request Number ─────────────────────────────────────────────────

const generateRequestNumber = (insertId) => {
  const today = new Date();
  const dateStr = today.getFullYear() +
    String(today.getMonth() + 1).padStart(2, '0') +
    String(today.getDate()).padStart(2, '0');
  return `TUP-${dateStr}-${String(insertId).padStart(6, '0')}`;
};

// ─── Employee: Request Top-Up ──────────────────────────────────────────────

export const requestTopUp = async (req, res) => {
  try {
    const sessionUser = getSessionUser(req);
    if (!sessionUser) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { employee_id, amount, reason } = req.body;

    // ✅ Check if user is privileged (can request for others)
    const isPrivileged = ['admin', 'sub_admin', 'hr_executive', 'hr', 'project_manager', 'accountant'].includes(sessionUser.role);

    let targetUserId;
    if (isPrivileged) {
      // Privileged users can request for any employee
      targetUserId = employee_id || sessionUser.id;
    } else {
      // Regular employees can ONLY request for themselves
      targetUserId = sessionUser.id;
      if (employee_id && Number(employee_id) !== sessionUser.id) {
        return res.status(403).json({
          success: false,
          message: 'You can only request top-up for yourself'
        });
      }
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Valid amount is required' });
    }


    // Check for duplicate pending request
    const [dupes] = await db.query(
      `SELECT 1 FROM top_up_requests 
       WHERE employee_id = ? AND status IN ('pending', 'awaiting_accountant') 
       AND created_at >= NOW() - INTERVAL 1 DAY`,
      [targetUserId]
    );

    if (dupes.length) {
      return res.status(409).json({
        success: false,
        message: 'A pending top-up request already exists for this user'
      });
    }

    const [result] = await db.query(
      `INSERT INTO top_up_requests 
       (employee_id, amount, reason, created_by, status) 
       VALUES (?, ?, ?, ?, 'pending')`,
      [targetUserId, amount, reason || null, sessionUser.id]
    );

    const insertId = result.insertId;
    const requestNumber = generateRequestNumber(insertId);

    await db.query(
      `UPDATE top_up_requests SET request_number = ? WHERE id = ?`,
      [requestNumber, insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Top-up request submitted for PM/HR approval',
      topup_id: insertId,
      request_number: requestNumber,
      status: 'pending'
    });

  } catch (error) {
    console.error('Request Top-Up Error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit top-up request' });
  }
};

// ─── Stage 1: PM or HR Approve ─────────────────────────────────────────────

export const approveStage1 = async (req, res) => {
  try {
    const sessionUser = getSessionUser(req);
    if (!sessionUser) return res.status(401).json({ success: false, message: 'Unauthorized' });

    if (!isStage1Approver(sessionUser.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only Project Manager or HR can approve Stage 1'
      });
    }

    const { id } = req.params;
    const { remark } = req.body;

    const [rows] = await db.query(
      'SELECT * FROM top_up_requests WHERE id = ? AND status = "pending"',
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: 'Request not found or already processed'
      });
    }

    const isPMUser = isPM(sessionUser.role);
    const isHRUser = isHR(sessionUser.role);

    if (isPMUser) {
      await db.query(
        `UPDATE top_up_requests 
         SET pm_approved_by = ?,
             pm_approved_at = ?,
             pm_remark = ?,
             updated_at = NOW()
         WHERE id = ?`,
        [sessionUser.id, new Date(), remark || null, id]
      );
    } else if (isHRUser) {
      await db.query(
        `UPDATE top_up_requests 
         SET hr_approved_by = ?,
             hr_approved_at = ?,
             hr_remark = ?,
             updated_at = NOW()
         WHERE id = ?`,
        [sessionUser.id, new Date(), remark || null, id]
      );
    } else {
      return res.status(403).json({
        success: false,
        message: 'Only Project Manager or HR can approve Stage 1'
      });
    }
const [checkRows] = await db.query(
  `SELECT pm_approved_at, hr_approved_at FROM top_up_requests WHERE id = ?`,
  [id]
);

const pmApproved = checkRows[0].pm_approved_at !== null;
const hrApproved = checkRows[0].hr_approved_at !== null;
const eitherApproved = pmApproved || hrApproved;

if (eitherApproved) {
  await db.query(
    `UPDATE top_up_requests SET status = 'awaiting_accountant' WHERE id = ?`,
    [id]
  );
}

const [updatedRows] = await db.query(
  `SELECT request_number, status FROM top_up_requests WHERE id = ?`,
  [id]
);

const message = isPMUser
  ? `✅ PM approved. Awaiting Accountant approval.`
  : `✅ HR approved. Awaiting Accountant approval.`;

res.json({
  success: true,
  message: message,
  request_number: updatedRows[0].request_number,
  status: updatedRows[0].status,   // ← read actual DB status, no hardcoding
  pm_approved: pmApproved,
  hr_approved: hrApproved
});

  } catch (error) {
    console.error('Stage 1 Approval Error:', error);
    res.status(500).json({ success: false, message: 'Failed to approve' });
  }
};

// ─── Stage 2: Accountant Final Approval ────────────────────────────────────

export const approveAccountant = async (req, res) => {
  try {
    const sessionUser = getSessionUser(req);
    if (!sessionUser) return res.status(401).json({ success: false, message: 'Unauthorized' });

    if (!isAccountant(sessionUser.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only Accountant can do final approval'
      });
    }

    const { id } = req.params;
    const { remark } = req.body;

    const [rows] = await db.query(
      'SELECT * FROM top_up_requests WHERE id = ? AND status = "awaiting_accountant"',
      [id]
    );

    if (!rows.length) {
      return res.status(400).json({
        success: false,
        message: 'Request not found or not ready for Accountant approval'
      });
    }

    const request = rows[0];

    const [accountantRows] = await db.query(
      'SELECT wallet_balance FROM users WHERE user_id = ?',
      [sessionUser.id]
    );

    if (!accountantRows.length) {
      return res.status(404).json({
        success: false,
        message: 'Accountant not found'
      });
    }

    const accountantBalance = Number(accountantRows[0].wallet_balance);

    if (accountantBalance < Number(request.amount)) {
      return res.status(400).json({
        success: false,
        message: `Insufficient balance in your wallet. Available: ₹${accountantBalance.toLocaleString('en-IN')}. Required: ₹${Number(request.amount).toLocaleString('en-IN')}`
      });
    }

    const result = await WalletService.processTopUpWithAccountant(request, sessionUser.id);

    await db.query(
      `UPDATE top_up_requests 
       SET status = 'approved',
           accountant_approved_by = ?,
           accountant_approved_at = ?,
           accountant_remark = ?,
           accountant_wallet_transaction_id = ?,
           employee_wallet_transaction_id = ?,
           updated_at = NOW()
       WHERE id = ?`,
      [
        sessionUser.id,
        new Date(),
        remark || null,
        result.accountantTransactionId,
        result.employeeTransactionId,
        id
      ]
    );

    const [updatedRows] = await db.query(
      `SELECT request_number FROM top_up_requests WHERE id = ?`,
      [id]
    );

    res.json({
      success: true,
      message: `✅ Top-up approved! ₹${Number(request.amount).toLocaleString('en-IN')} credited to employee wallet.`,
      request_number: updatedRows[0].request_number,
      data: {
        amount: request.amount,
        employee_id: request.employee_id,
        accountant_balance_after: result.accountantBalanceAfter,
        employee_balance_after: result.employeeBalanceAfter
      }
    });

  } catch (error) {
    console.error('Accountant Approval Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to approve'
    });
  }
};

// ─── Reject Top-Up Request ──────────────────────────────────────────────────

export const rejectTopUp = async (req, res) => {
  try {
    const sessionUser = getSessionUser(req);
    if (!sessionUser) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const [rows] = await db.query(
      'SELECT * FROM top_up_requests WHERE id = ? AND status NOT IN ("approved", "cancelled")',
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: 'Request not found or cannot be rejected'
      });
    }

    const sessionRole = sessionUser.role;
    const canReject = isStage1Approver(sessionRole) || isAccountant(sessionRole) || isAdmin(sessionRole);

    if (!canReject) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to reject this request'
      });
    }

    await db.query(
      `UPDATE top_up_requests 
       SET status = 'rejected',
           rejected_by = ?,
           rejected_at = ?,
           rejected_reason = ?,
           updated_at = NOW()
       WHERE id = ?`,
      [sessionUser.id, new Date(), reason.trim(), id]
    );

    const [updatedRows] = await db.query(
      `SELECT request_number FROM top_up_requests WHERE id = ?`,
      [id]
    );

    res.json({
      success: true,
      message: `Top-up request ${updatedRows[0].request_number} rejected`,
      status: 'rejected'
    });

  } catch (error) {
    console.error('Reject Top-Up Error:', error);
    res.status(500).json({ success: false, message: 'Failed to reject' });
  }
};

// ─── Cancel Top-Up Request ──────────────────────────────────────────────────

export const cancelTopUp = async (req, res) => {
  try {
    const sessionUser = getSessionUser(req);
    if (!sessionUser) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { id } = req.params;

    const [rows] = await db.query(
      'SELECT employee_id, status, request_number FROM top_up_requests WHERE id = ? AND status IN ("pending", "awaiting_accountant")',
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: 'Request not found or cannot be cancelled'
      });
    }

    if (rows[0].employee_id !== sessionUser.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own requests'
      });
    }

    await db.query(
      `UPDATE top_up_requests 
       SET status = 'cancelled', updated_at = NOW()
       WHERE id = ?`,
      [id]
    );

    res.json({
      success: true,
      message: `Top-up request ${rows[0].request_number} cancelled`,
      status: 'cancelled'
    });

  } catch (error) {
    console.error('Cancel Top-Up Error:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel request' });
  }
};

// ─── Get Top-Up Requests ─────────────────────────────────────────────────────

export const getTopUpRequests = async (req, res) => {
  try {
    const sessionUser = getSessionUser(req);
    if (!sessionUser) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { status, employee_id } = req.query;
    
    const isAdminUser = isAdmin(sessionUser.role);
    const isHRUser = isHR(sessionUser.role);
    const isPMUser = isPM(sessionUser.role);
    const isAccountantUser = isAccountant(sessionUser.role);
    
    // ✅ FIX: Accountant can now view all (or filter as needed)
    const canViewAll = isAdminUser || isPMUser || isHRUser || isAccountantUser;

    let query = `
      SELECT 
        r.*,
        e.name as employee_name,
        e.role as employee_role,
        e.wallet_balance as employee_balance,
        pm.name as pm_approved_by_name,
        hr.name as hr_approved_by_name,
        acc.name as accountant_approved_by_name,
        created.name as created_by_name,
        rejected.name as rejected_by_name
      FROM top_up_requests r
      LEFT JOIN users e ON r.employee_id = e.user_id
      LEFT JOIN users pm ON r.pm_approved_by = pm.user_id
      LEFT JOIN users hr ON r.hr_approved_by = hr.user_id
      LEFT JOIN users acc ON r.accountant_approved_by = acc.user_id
      LEFT JOIN users created ON r.created_by = created.user_id
      LEFT JOIN users rejected ON r.rejected_by = rejected.user_id
      WHERE 1=1
    `;

    const params = [];

    // ✅ Role-based visibility - UPDATED
    if (isAdminUser) {
      console.log('👑 Admin user - showing all requests');
    } else if (isPMUser || isHRUser) {
      console.log(`📋 ${isPMUser ? 'PM' : 'HR'} user - showing all requests for approval`);
    } else if (isAccountantUser) {
      // ✅ Option A: Show ALL requests (uncomment this)
      console.log('💰 Accountant user - showing all requests');
      
      // ✅ Option B: Only show awaiting_accountant (comment out Option A, uncomment this)
      query += ` AND r.status = 'awaiting_accountant'`;
      console.log('💰 Accountant user - showing only awaiting_accountant requests');
    } else {
      query += ` AND r.employee_id = ?`;
      params.push(sessionUser.id);
      console.log(`👤 Regular employee ${sessionUser.id} - showing only their own requests`);
    }

    if (status) {
      query += ` AND r.status = ?`;
      params.push(status);
    }

    if (employee_id && canViewAll) {
      query += ` AND r.employee_id = ?`;
      params.push(employee_id);
    }

    query += ` ORDER BY r.created_at DESC`;

    const [rows] = await db.query(query, params);

    // Permission flags for frontend
    const rowsWithPermissions = rows.map(row => ({
      ...row,
      can_approve_pm: isPMUser && row.status === 'pending' && !row.pm_approved_at,
      can_approve_hr: isHRUser && row.status === 'pending' && !row.hr_approved_at,
      can_approve_accountant: isAccountantUser && row.status === 'awaiting_accountant',
      can_reject: (isPMUser || isHRUser || isAccountantUser || isAdminUser) && 
                  (row.status === 'pending' || row.status === 'awaiting_accountant'),
      can_cancel: row.employee_id === sessionUser.id && 
                  (row.status === 'pending' || row.status === 'awaiting_accountant')
    }));

    res.json({
      success: true,
      data: rowsWithPermissions,
      user: {
        id: sessionUser.id,
        role: sessionUser.role,
        is_admin: isAdminUser,
        is_pm: isPMUser,
        is_hr: isHRUser,
        is_accountant: isAccountantUser,
        permissions: {
          can_approve_pm: isPMUser,
          can_approve_hr: isHRUser,
          can_approve_accountant: isAccountantUser,
          can_reject: isPMUser || isHRUser || isAccountantUser || isAdminUser,
          can_view_all: canViewAll
        }
      }
    });

  } catch (error) {
    console.error('Get Top-Up Requests Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch requests' });
  }
};
// ─── Get Single Top-Up Request ──────────────────────────────────────────────

export const getTopUpRequestById = async (req, res) => {
  try {
    const sessionUser = getSessionUser(req);
    if (!sessionUser) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { id } = req.params;

    const [rows] = await db.query(
      `SELECT 
        r.*,
        e.name as employee_name,
        e.role as employee_role,
        pm.name as pm_approved_by_name,
        hr.name as hr_approved_by_name,
        acc.name as accountant_approved_by_name,
        created.name as created_by_name,
        rejected.name as rejected_by_name
      FROM top_up_requests r
      LEFT JOIN users e ON r.employee_id = e.user_id
      LEFT JOIN users pm ON r.pm_approved_by = pm.user_id
      LEFT JOIN users hr ON r.hr_approved_by = hr.user_id
      LEFT JOIN users acc ON r.accountant_approved_by = acc.user_id
      LEFT JOIN users created ON r.created_by = created.user_id
      LEFT JOIN users rejected ON r.rejected_by = rejected.user_id
      WHERE r.id = ?`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    const request = rows[0];
    const isAdminUser = isAdmin(sessionUser.role);
    const isAccountantUser = isAccountant(sessionUser.role);
    const isOwner = request.employee_id === sessionUser.id;
    const isApprover = isStage1Approver(sessionUser.role);

    if (!isAdminUser && !isAccountantUser && !isOwner && !isApprover) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this request'
      });
    }

    res.json({
      success: true,
      data: request
    });

  } catch (error) {
    console.error('Get Top-Up Request Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch request' });
  }
};