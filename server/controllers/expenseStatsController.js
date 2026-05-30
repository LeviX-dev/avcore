/**
 * expenseStatsController.js
 *
 * Three focused stat endpoints powering the new chart sections:
 *   GET /api/v1/expense/stats/employees   → EmployeeExpenseChart
 *   GET /api/v1/expense/stats/categories  → CategoryExpenseChart
 *   GET /api/v1/expense/stats/vendors     → VendorExpenseChart
 *
 * Query params (all optional):
 *   from_date  – ISO date string  e.g. "2025-01-01"
 *   to_date    – ISO date string  e.g. "2025-12-31"
 *   status     – "all" | "approved" | "pending" | "rejected"
 *   employee_id – filter by specific employee (admin only for employee/vendor charts)
 */

import db from '../database/db.js';

const ADMIN_EXPENSE_ROLES = new Set(['admin', 'sub_admin', 'hr', 'hr_executive']);

const isPrivilegedExpenseRole = (role) =>
  ADMIN_EXPENSE_ROLES.has(String(role || '').toLowerCase());

const getSessionUser = (req) => {
  const user = req.session?.user;
  if (!user?.id) return null;
  return {
    id: Number(user.id),
    role: String(user.role || '').toLowerCase(),
    name: user.name || user.username || null,
  };
};

/** Build WHERE clause from common filter params */
const buildFilters = (sessionUser, { from_date, to_date, status, employee_id }, tableAlias = 'e') => {
  const conditions = [];
  const params = [];
  const t = tableAlias ? `${tableAlias}.` : '';

  // Scope: non-admins see only their own expenses
  if (!isPrivilegedExpenseRole(sessionUser.role)) {
    conditions.push(`${t}employee_id = ?`);
    params.push(sessionUser.id);
  } else if (employee_id && employee_id !== 'all') {
    conditions.push(`${t}employee_id = ?`);
    params.push(employee_id);
  }

  if (from_date) {
    conditions.push(`${t}expense_date >= ?`);
    params.push(from_date);
  }
  if (to_date) {
    conditions.push(`${t}expense_date <= ?`);
    params.push(to_date);
  }
  if (status && status !== 'all') {
    conditions.push(`${t}status = ?`);
    params.push(status);
  }

  return {
    where: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '',
    params,
  };
};

// ─── Employee-wise Stats ──────────────────────────────────────────────────────

/**
 * GET /api/v1/expense/stats/employees
 * Admin-only: aggregates expenses per employee.
 * Returns all employees who have at least one expense entry.
 */
export const getEmployeeWiseStats = async (req, res) => {
  try {
    const sessionUser = getSessionUser(req);
    if (!sessionUser) return res.status(401).json({ success: false, message: 'Unauthorized' });

    // Non-admins shouldn't see all employees — redirect them to self-stats
    if (!isPrivilegedExpenseRole(sessionUser.role)) {
      return res.status(403).json({ success: false, message: 'Access restricted to admin roles' });
    }

    const { from_date, to_date, status } = req.query;
    const { where, params } = buildFilters(sessionUser, { from_date, to_date, status });

    const [rows] = await db.query(
      `SELECT
          u.user_id,
          COALESCE(u.name, CONCAT('Employee #', u.user_id))   AS employee_name,
          u.role,
          COUNT(e.expense_id)                                  AS count,
          COALESCE(SUM(e.amount), 0)                           AS total_amount,
          COALESCE(SUM(CASE WHEN e.status = 'approved'  THEN e.amount ELSE 0 END), 0) AS approved_amount,
          COALESCE(SUM(CASE WHEN e.status = 'pending'   THEN e.amount ELSE 0 END), 0) AS pending_amount,
          COALESCE(SUM(CASE WHEN e.status = 'rejected'  THEN e.amount ELSE 0 END), 0) AS rejected_amount,
          COUNT(DISTINCT e.category_id)                        AS unique_categories,
          MAX(e.expense_date)                                  AS last_expense_date
       FROM expenses e
       JOIN users u ON u.user_id = e.employee_id
       ${where}
       GROUP BY u.user_id, u.name, u.role
       ORDER BY total_amount DESC`,
      params
    );

    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error('[getEmployeeWiseStats]', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch employee stats' });
  }
};

// ─── Category-wise Stats ──────────────────────────────────────────────────────

/**
 * GET /api/v1/expense/stats/categories
 * Lists every category that has expenses with totals and status breakdown.
 * Admins get company-wide view; employees see only their own.
 */
export const getCategoryWiseStats = async (req, res) => {
  try {
    const sessionUser = getSessionUser(req);
    if (!sessionUser) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { from_date, to_date, status, employee_id } = req.query;
    const { where, params } = buildFilters(sessionUser, { from_date, to_date, status, employee_id });

    const [rows] = await db.query(
      `SELECT
          COALESCE(ec.category_name, e.category, 'Uncategorized') AS category_name,
          e.category_id,
          COUNT(e.expense_id)                                       AS count,
          COALESCE(SUM(e.amount), 0)                                AS total_amount,
          COALESCE(SUM(CASE WHEN e.status = 'approved'  THEN e.amount ELSE 0 END), 0) AS approved_amount,
          COALESCE(SUM(CASE WHEN e.status = 'pending'   THEN e.amount ELSE 0 END), 0) AS pending_amount,
          COALESCE(SUM(CASE WHEN e.status = 'rejected'  THEN e.amount ELSE 0 END), 0) AS rejected_amount,
          COUNT(DISTINCT e.employee_id)                             AS unique_employees
       FROM expenses e
       LEFT JOIN expense_categories ec ON ec.category_id = e.category_id
       ${where}
       GROUP BY e.category_id, ec.category_name, e.category
       ORDER BY total_amount DESC`,
      params
    );

    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error('[getCategoryWiseStats]', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch category stats' });
  }
};

// ─── Vendor-wise Stats ────────────────────────────────────────────────────────

/**
 * GET /api/v1/expense/stats/vendors
 * Lists every vendor that has expenses with totals and employee spread.
 * Admins get company-wide view; employees see only their own.
 */
export const getVendorWiseStats = async (req, res) => {
  try {
    const sessionUser = getSessionUser(req);
    if (!sessionUser) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { from_date, to_date, status, employee_id } = req.query;
    const { where, params } = buildFilters(sessionUser, { from_date, to_date, status, employee_id });

    const [rows] = await db.query(
      `SELECT
          COALESCE(v.company_name, e.vendor_name, 'Unknown Vendor') AS vendor_name,
          e.vendor_id,
          COUNT(e.expense_id)                                         AS count,
          COALESCE(SUM(e.amount), 0)                                  AS total_amount,
          COALESCE(SUM(CASE WHEN e.status = 'approved'  THEN e.amount ELSE 0 END), 0) AS approved_amount,
          COALESCE(SUM(CASE WHEN e.status = 'pending'   THEN e.amount ELSE 0 END), 0) AS pending_amount,
          COALESCE(SUM(CASE WHEN e.status = 'rejected'  THEN e.amount ELSE 0 END), 0) AS rejected_amount,
          COUNT(DISTINCT e.employee_id)                               AS unique_employees
       FROM expenses e
       LEFT JOIN vendors v ON v.vendor_id = e.vendor_id
       ${where}
       GROUP BY e.vendor_id, v.company_name, e.vendor_name
       ORDER BY total_amount DESC`,
      params
    );

    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error('[getVendorWiseStats]', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch vendor stats' });
  }
};
// Add these functions to expenseStatsController.js

// ─── Project-wise Stats (for horizontal bar) ───────────────────────────────
export const getProjectWiseStats = async (req, res) => {
  try {
    const sessionUser = getSessionUser(req);
    if (!sessionUser) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { from_date, to_date, status, employee_id } = req.query;
    const { where, params } = buildFilters(sessionUser, { from_date, to_date, status, employee_id });

    const [rows] = await db.query(
      `SELECT
          COALESCE(rd.name, e.project_name, 'No Project') AS project_name,
          e.project_master_id,
          COUNT(e.expense_id)                               AS count,
          COALESCE(SUM(e.amount), 0)                        AS total_amount,
          COALESCE(SUM(CASE WHEN e.status = 'approved'  THEN e.amount ELSE 0 END), 0) AS approved_amount,
          COALESCE(SUM(CASE WHEN e.status = 'pending'   THEN e.amount ELSE 0 END), 0) AS pending_amount,
          COALESCE(SUM(CASE WHEN e.status = 'rejected'  THEN e.amount ELSE 0 END), 0) AS rejected_amount
       FROM expenses e
       LEFT JOIN raw_data rd ON rd.master_id = e.project_master_id
       ${where}
       GROUP BY e.project_master_id, rd.name, e.project_name
       ORDER BY total_amount DESC
       LIMIT 15`,
      params
    );

    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error('[getProjectWiseStats]', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch project stats' });
  }
};

// ─── Monthly Trend (approved expenses only, for line chart) ─────────────────
export const getMonthlyTrendStats = async (req, res) => {
  try {
    const sessionUser = getSessionUser(req);
    if (!sessionUser) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { from_date, to_date, employee_id } = req.query;
    const { where, params } = buildFilters(sessionUser, { from_date, to_date, status: 'approved', employee_id }, 'e');

    const [rows] = await db.query(
      `SELECT
          DATE_FORMAT(e.expense_date, '%Y-%m') AS month,
          COALESCE(SUM(e.amount), 0)           AS total_amount,
          COUNT(*)                             AS total_count
       FROM expenses e
       ${where}
       GROUP BY DATE_FORMAT(e.expense_date, '%Y-%m')
       ORDER BY month ASC`,
      params
    );

    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error('[getMonthlyTrendStats]', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch monthly trend' });
  }
};