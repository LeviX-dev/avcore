import db from '../database/db.js';
import WalletService from '../services/walletService.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { BASE_URL } from '../../public/config.js'; 
//for webmiles
// import { BASE_URL } from '../public/config.js'; 
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const expenseUploadDir = path.join(__dirname, '../uploads/expenses');

const ADMIN_EXPENSE_ROLES = new Set(['admin', 'sub_admin', 'hr', 'hr_executive']);
const DIRECT_EXPENSE = 'direct_expense';
const PROJECT_EXPENSE = 'project_expense';

// Draft statuses — wallet is NEVER touched for any of these
const DRAFT_STATUSES = ['draft_pending', 'draft_approved', 'draft_rejected'];

// ─── Utility Helpers ────────────────────────────────────────────────────────

const ensureUploadDirectory = async () => {
  if (!fs.existsSync(expenseUploadDir)) {
    fs.mkdirSync(expenseUploadDir, { recursive: true });
  }
};

const normalizeText = (value) => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};

const normalizeId = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const numericValue = Number(value);
  return Number.isInteger(numericValue) && numericValue > 0 ? numericValue : null;
};

const normalizeExpenseType = (value) => {
  const next = normalizeText(value);
  if (!next) return null;
  const lower = next.toLowerCase().replace(/\s+/g, '_');
  if (lower === DIRECT_EXPENSE || lower === PROJECT_EXPENSE) return lower;
  return null;
};

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

const buildExpenseTitle = ({ projectName, categoryName, billNumber, vendorLabel }) => {
  const parts = [projectName, categoryName, billNumber, vendorLabel]
    .map((part) => normalizeText(part))
    .filter(Boolean);
  const fallback = parts.join(' - ');
  return fallback ? fallback.slice(0, 255) : 'Expense Entry';
};

const saveExpenseAttachment = async (file) => {
  if (!file) return { attachmentPath: null, attachmentName: null };
  await ensureUploadDirectory();
  const originalName = file.name || file.filename || 'attachment';
  const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${safeName}`;
  const savePath = path.join(expenseUploadDir, uniqueName);
  await file.mv(savePath);
  return {
    attachmentPath: `expenses/${uniqueName}`,
    attachmentName: originalName,
  };
};

const resolveAttachmentUrl = (attachmentPath) => {
  if (!attachmentPath) return null;
  return `${BASE_URL}uploads/${attachmentPath.replace(/^\/+/, '')}`;
};

const resolveBillUrl = (attachmentPath) => {
  if (!attachmentPath) return null;
  const filename = attachmentPath.replace(/\\/g, '/').split('/').pop();
  if (!filename) return null;
  return `${BASE_URL}bill/${encodeURIComponent(filename)}`;
};

const resolveProjectDetails = async (projectMasterId, projectName, siteLocation) => {
  const resolvedMasterId = normalizeId(projectMasterId);
  let resolvedProjectName = normalizeText(projectName);
  let resolvedSiteLocation = normalizeText(siteLocation);

  if (!resolvedMasterId && !resolvedProjectName && !resolvedSiteLocation) {
    return { projectMasterId: null, projectName: null, siteLocation: null };
  }

  if (resolvedMasterId) {
    const [rows] = await db.query(
      `SELECT rd.master_id,
              IFNULL(rd.name, '') AS project_name,
              COALESCE(NULLIF(a.area_name, ''), NULLIF(rd.city, '')) AS site_location
       FROM raw_data rd
       LEFT JOIN area a ON a.area_id = rd.area_id
       WHERE rd.master_id = ?
       LIMIT 1`,
      [resolvedMasterId]
    );
    if (!rows.length) return null;
    resolvedProjectName = resolvedProjectName || normalizeText(rows[0].project_name);
    resolvedSiteLocation = resolvedSiteLocation || normalizeText(rows[0].site_location);
    return {
      projectMasterId: rows[0].master_id,
      projectName: resolvedProjectName,
      siteLocation: resolvedSiteLocation,
    };
  }

  return { projectMasterId: null, projectName: resolvedProjectName, siteLocation: resolvedSiteLocation };
};

const resolveVendorDetails = async (vendorId, vendorSource, vendorLabel) => {
  const resolvedVendorId = normalizeId(vendorId);
  let resolvedVendorSource = normalizeText(vendorSource) || (resolvedVendorId ? 'vendor' : 'other');
  let resolvedVendorLabel = normalizeText(vendorLabel);

  if (resolvedVendorId) {
    const [rows] = await db.query(
      `SELECT vendor_id, company_name, vendor_name
       FROM vendors
       WHERE vendor_id = ? AND is_active = 1
       LIMIT 1`,
      [resolvedVendorId]
    );
    if (!rows.length) return null;
    resolvedVendorSource = 'vendor';
    resolvedVendorLabel = normalizeText(rows[0].vendor_name) || normalizeText(rows[0].company_name);
    return { vendorId: rows[0].vendor_id, vendorSource: resolvedVendorSource, vendorLabel: resolvedVendorLabel };
  }

  if (!resolvedVendorLabel) resolvedVendorSource = 'other';
  return { vendorId: null, vendorSource: resolvedVendorSource, vendorLabel: resolvedVendorLabel };
};

const resolveEmployeeAssignment = async (sessionUser, requestedEmployeeId, existingEmployeeId = null) => {
  const requestedId = normalizeId(requestedEmployeeId);
  const existingId = normalizeId(existingEmployeeId);
  let targetEmployeeId = sessionUser.id;

  if (isPrivilegedExpenseRole(sessionUser.role)) {
    targetEmployeeId = requestedId || existingId;
    if (!targetEmployeeId) return { error: 'employee is required' };
  } else {
    targetEmployeeId = sessionUser.id;
    if (requestedId && requestedId !== sessionUser.id) {
      return { error: 'You are not allowed to assign expense to another employee', statusCode: 403 };
    }
  }

  const [rows] = await db.query(
    `SELECT user_id, name, role FROM users WHERE user_id = ? LIMIT 1`,
    [targetEmployeeId]
  );
  if (!rows.length) return { error: 'Selected employee not found' };
  return { employeeId: rows[0].user_id, employeeName: rows[0].name, employeeRole: rows[0].role };
};

const requireSubmitFields = ({ expenseType, projectDetails, categoryId, vendorDetails, paymentMode, billNumber }) => {
  if (!expenseType) return 'Expense type is required';
  if (expenseType === PROJECT_EXPENSE && (!projectDetails?.projectName || !projectDetails?.siteLocation)) {
    return 'Project and site/location are required for project expense';
  }
  if (!categoryId) return 'Expense category is required';
  if (!vendorDetails?.vendorId && !vendorDetails?.vendorLabel) return 'Vendor or vendor name is required';
  if (!paymentMode) return 'Payment mode is required';
  if (!billNumber) return 'Bill number is required';
  return null;
};

// ─── DB Setup ────────────────────────────────────────────────────────────────

export const ensureExpenseTable = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS expenses (
      expense_id        INT AUTO_INCREMENT PRIMARY KEY,
      title             VARCHAR(255) NOT NULL,
      expense_type      VARCHAR(30)  DEFAULT 'direct_expense',
      employee_id       INT          DEFAULT NULL,
      project_master_id INT          DEFAULT NULL,
      project_name      VARCHAR(255) DEFAULT NULL,
      site_location     VARCHAR(255) DEFAULT NULL,
      category_id       INT          DEFAULT NULL,
      category          VARCHAR(100) DEFAULT NULL,
      vendor_id         INT          DEFAULT NULL,
      vendor_source     VARCHAR(20)  DEFAULT 'other',
      vendor_name       VARCHAR(255) DEFAULT NULL,
      payment_mode      VARCHAR(20)  DEFAULT NULL,
      bill_number       VARCHAR(100) DEFAULT NULL,
      description       TEXT         DEFAULT NULL,
      amount            DECIMAL(12,2) NOT NULL,
      expense_date      DATE         NOT NULL,
      attachment_path   VARCHAR(255) DEFAULT NULL,
      attachment_name   VARCHAR(255) DEFAULT NULL,
      status            VARCHAR(230)  DEFAULT 'pending',
      status_remark     TEXT         DEFAULT NULL,
      remark            TEXT         DEFAULT NULL,
      created_by        INT          DEFAULT NULL,
      created_at        TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
      updated_at        TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
};

export const ensureExpenseCategoryTable = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS expense_categories (
      category_id         INT AUTO_INCREMENT PRIMARY KEY,
      category_name       VARCHAR(150) NOT NULL,
      category_description TEXT        DEFAULT NULL,
      is_active           TINYINT(1)  DEFAULT 1,
      created_at          TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
      updated_at          TIMESTAMP   DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
};

// ─── Options ─────────────────────────────────────────────────────────────────

export const getExpenseOptions = async (req, res) => {
  try {
    const sessionUser = getSessionUser(req);
    if (!sessionUser) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const [projects] = await db.query(
      `SELECT DISTINCT
        rd.master_id,
        IFNULL(rd.name, '') AS project_name,
        COALESCE(NULLIF(a.area_name, ''), NULLIF(rd.city, '')) AS site_location
       FROM raw_data rd
       LEFT JOIN area a ON a.area_id = rd.area_id
       WHERE rd.name IS NOT NULL AND rd.name <> ''
       ORDER BY project_name ASC, rd.master_id DESC`
    );

    const [siteLocations] = await db.query(
      `SELECT DISTINCT
        COALESCE(NULLIF(a.area_name, ''), NULLIF(rd.city, '')) AS site_location
       FROM raw_data rd
       LEFT JOIN area a ON a.area_id = rd.area_id
       WHERE COALESCE(NULLIF(a.area_name, ''), NULLIF(rd.city, '')) IS NOT NULL
         AND COALESCE(NULLIF(a.area_name, ''), NULLIF(rd.city, '')) <> ''
       ORDER BY site_location ASC`
    );

    const [vendors] = await db.query(
      `SELECT vendor_id, company_name, vendor_name, contact_number, city, state_province
       FROM vendors
       WHERE is_active = 1
       ORDER BY company_name ASC, vendor_id DESC`
    );

    let employees = [];
    if (isPrivilegedExpenseRole(sessionUser.role)) {
      const [rows] = await db.query(
        `SELECT user_id, name, role FROM users
         WHERE COALESCE(status, 'active') <> 'inactive'
         ORDER BY name ASC, user_id ASC`
      );
      employees = rows;
    } else {
      const [rows] = await db.query(
        `SELECT user_id, name, role FROM users WHERE user_id = ? LIMIT 1`,
        [sessionUser.id]
      );
      employees = rows;
    }

    return res.status(200).json({
      success: true,
      data: {
        projects,
        siteLocations,
        vendors,
        employees,
        currentUser: { id: sessionUser.id, role: sessionUser.role, name: sessionUser.name },
        canSelectAnyEmployee: isPrivilegedExpenseRole(sessionUser.role),
      },
    });
  } catch (error) {
    console.error('Error fetching expense options:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch expense options' });
  }
};

// ─── Expenses CRUD ────────────────────────────────────────────────────────────

/**
 * GET /api/expense
 * status = 'drafts' → returns all draft_ statuses combined
 * status = 'pending' | 'approved' | 'rejected' → single status filter
 * omit → all expenses
 */
export const getExpenses = async (req, res) => {
  try {
    const sessionUser = getSessionUser(req);
    if (!sessionUser) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { status } = req.query;
    const conditions = [];
    const params = [];

    if (!isPrivilegedExpenseRole(sessionUser.role)) {
      conditions.push('COALESCE(e.employee_id, e.created_by) = ?');
      params.push(sessionUser.id);
    }

    if (status === 'drafts') {
      conditions.push(
        `e.status IN ('draft_pending', 'draft_approved', 'draft_rejected')`
      );
    } else if (status) {
      conditions.push('e.status = ?');
      params.push(status);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const [rows] = await db.query(
      `SELECT
        e.expense_id, e.title, e.expense_type,
        COALESCE(e.employee_id, e.created_by) AS employee_id,
        emp.name AS employee_name,
        e.project_master_id, e.project_name, e.site_location,
        e.category_id, COALESCE(c.category_name, e.category) AS category,
        e.vendor_id, e.vendor_source,
        COALESCE(e.vendor_name, v.company_name, v.vendor_name) AS vendor_name,
        e.payment_mode, e.bill_number, e.description,
        e.amount, e.expense_date, e.attachment_path, e.attachment_name,
        e.status, e.status_remark, e.remark,
        e.created_by, e.created_at, e.updated_at
       FROM expenses e
       LEFT JOIN expense_categories c ON c.category_id = e.category_id
       LEFT JOIN vendors v ON v.vendor_id = e.vendor_id
       LEFT JOIN users emp ON emp.user_id = COALESCE(e.employee_id, e.created_by)
       ${whereClause}
       ORDER BY e.expense_date DESC, e.expense_id DESC`,
      params
    );

    const normalizedRows = rows.map((row) => ({
      ...row,
      attachment_url: resolveAttachmentUrl(row.attachment_path),
      bill_url: resolveBillUrl(row.attachment_path),
    }));

    return res.status(200).json({ success: true, data: normalizedRows });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch expenses' });
  }
};

/**
 * POST /api/expense
 * 
 * NEW FLOW:
 * - expense_mode = 'draft' → status: draft_pending (admin review, NO wallet)
 * - expense_mode = 'direct' → status: pending (wallet deducted immediately)
 * - Admin with expense_mode != 'draft' → status: approved (wallet deducted)
 */
export const createExpense = async (req, res) => {
  try {
    const sessionUser = getSessionUser(req);
    if (!sessionUser) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const {
      title,
      expense_type,
      employee_id,
      project_master_id,
      project_name,
      site_location,
      category_id,
      vendor_id,
      vendor_source,
      vendor_name,
      payment_mode,
      bill_number,
      description,
      amount,
      expense_date,
      remark,
      expense_mode, // 'direct' | 'draft'
    } = req.body;

    if (amount === undefined || !expense_date) {
      return res.status(400).json({ success: false, message: 'amount and expense_date are required' });
    }

    const numericAmount = Number(amount);
    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ success: false, message: 'amount must be a positive number' });
    }

    const normalizedExpenseType = normalizeExpenseType(expense_type);
    if (!normalizedExpenseType) {
      return res.status(400).json({ success: false, message: 'expense_type is required' });
    }

    // ── Determine final status based on NEW ENUM ───────────────────────────────
    let finalStatus;
    
    if (expense_mode === 'draft') {
      // Draft flow: always go to admin review first
      finalStatus = 'draft_pending';
    } else if (isPrivilegedExpenseRole(sessionUser.role)) {
      // Admin creating direct expense → approved immediately
      finalStatus = 'approved';
    } else {
      // Employee creating direct expense → pending
      finalStatus = 'pending';
    }

    const shouldDeductWallet = !DRAFT_STATUSES.includes(finalStatus);

    const employeeAssignment = await resolveEmployeeAssignment(sessionUser, employee_id);
    if (employeeAssignment.error) {
      return res.status(employeeAssignment.statusCode || 400).json({ success: false, message: employeeAssignment.error });
    }

    let resolvedProject = { projectMasterId: null, projectName: null, siteLocation: null };
    if (normalizedExpenseType === PROJECT_EXPENSE) {
      resolvedProject = await resolveProjectDetails(project_master_id, project_name, site_location);
      if (!resolvedProject) {
        return res.status(400).json({ success: false, message: 'Invalid project selected' });
      }
    }

    const resolvedVendor = await resolveVendorDetails(vendor_id, vendor_source, vendor_name);
    if (vendor_id && !resolvedVendor) {
      return res.status(400).json({ success: false, message: 'Invalid vendor selected' });
    }

    let categoryId = null;
    let categoryName = null;
    if (category_id) {
      const [categoryRows] = await db.query(
        'SELECT category_id, category_name FROM expense_categories WHERE category_id = ? AND is_active = 1',
        [category_id]
      );
      if (!categoryRows.length) {
        return res.status(400).json({ success: false, message: 'Invalid expense category' });
      }
      categoryId = categoryRows[0].category_id;
      categoryName = categoryRows[0].category_name;
    }

    // Full validation for direct expenses (pending or approved)
    if (finalStatus === 'pending' || finalStatus === 'approved') {
      const validationError = requireSubmitFields({
        expenseType: normalizedExpenseType,
        projectDetails: resolvedProject,
        categoryId,
        vendorDetails: resolvedVendor,
        paymentMode: normalizeText(payment_mode),
        billNumber: normalizeText(bill_number),
      });
      if (validationError) {
        return res.status(400).json({ success: false, message: validationError });
      }
    }

    if (finalStatus === 'pending' && normalizedExpenseType === PROJECT_EXPENSE && !resolvedProject?.projectMasterId) {
      return res.status(400).json({ success: false, message: 'Project expense must be linked to a project' });
    }

    const uploadFile = Array.isArray(req.files?.attachment) ? req.files.attachment[0] : req.files?.attachment;
    const attachment = await saveExpenseAttachment(uploadFile || null);

    const resolvedTitle = buildExpenseTitle({
      projectName: resolvedProject?.projectName || resolvedProject?.siteLocation,
      categoryName,
      billNumber: bill_number,
      vendorLabel: resolvedVendor?.vendorLabel,
    });

    console.log(finalStatus);

    const [result] = await db.query(
      `INSERT INTO expenses (
        title, expense_type, employee_id,
        project_master_id, project_name, site_location,
        category_id, category,
        vendor_id, vendor_source, vendor_name,
        payment_mode, bill_number, description,
        amount, expense_date,
        attachment_path, attachment_name,
        status, remark, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        normalizeText(title) || resolvedTitle,
        normalizedExpenseType,
        employeeAssignment.employeeId,
        normalizedExpenseType === PROJECT_EXPENSE ? resolvedProject?.projectMasterId || null : null,
        normalizedExpenseType === PROJECT_EXPENSE ? resolvedProject?.projectName || null : null,
        normalizedExpenseType === PROJECT_EXPENSE ? resolvedProject?.siteLocation || null : null,
        categoryId,
        categoryName,
        resolvedVendor?.vendorId || null,
        resolvedVendor?.vendorSource || (resolvedVendor?.vendorId ? 'vendor' : 'other'),
        resolvedVendor?.vendorLabel || null,
        normalizeText(payment_mode),
        normalizeText(bill_number),
        normalizeText(description),
        numericAmount,
        expense_date,
        attachment.attachmentPath,
        attachment.attachmentName,
        finalStatus,
        normalizeText(remark),
        sessionUser.id,
      ]
    );

    // Deduct wallet only for non-draft expenses
    if (shouldDeductWallet) {
      try {
        await WalletService.debitWallet({
          userId: employeeAssignment.employeeId,
          amount: numericAmount,
          initiatedBy: sessionUser.id,
          referenceType: 'expense_deduction',
          referenceId: result.insertId,
          remarks: finalStatus === 'approved' ? 'Expense approved by admin' : 'Expense submitted',
          adminNote: null,
          status: finalStatus,
        });
      } catch (err) {
        await db.query('DELETE FROM expenses WHERE expense_id = ?', [result.insertId]);
        if (err.message && err.message.includes('Insufficient wallet balance')) {
          return res.status(400).json({ success: false, message: 'Insufficient company wallet balance' });
        }
        throw err;
      }
    }

    const message = finalStatus === 'draft_pending' 
      ? 'Draft submitted for admin review' 
      : 'Expense submitted successfully';

    return res.status(201).json({ success: true, message, expense_id: result.insertId });
  } catch (error) {
    console.error('Error creating expense:', error);
    return res.status(500).json({ success: false, message: 'Failed to create expense' });
  }
};

/**
 * PUT /api/expense/:id/draft-status
 * Admin only — approve or reject a draft_pending expense.
 * Wallet is NEVER touched here.
 * 
 * Body: { status: 'draft_approved' | 'draft_rejected', remark?: string }
 */
export const updateDraftStatus = async (req, res) => {
  try {
    const sessionUser = getSessionUser(req);
    if (!sessionUser) return res.status(401).json({ success: false, message: 'Unauthorized' });
    if (!isPrivilegedExpenseRole(sessionUser.role)) {
      return res.status(403).json({ success: false, message: 'Only admin can review drafts' });
    }

    const { id } = req.params;
    const { status, remark } = req.body;

    if (!['draft_approved', 'draft_rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be 'draft_approved' or 'draft_rejected'" });
    }

    const [rows] = await db.query(
      'SELECT status FROM expenses WHERE expense_id = ? LIMIT 1',
      [id]
    );
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }
    if (rows[0].status !== 'draft_pending') {
      return res.status(400).json({ success: false, message: 'Only draft_pending expenses can be reviewed' });
    }

    await db.query(
      'UPDATE expenses SET status = ?, status_remark = ? WHERE expense_id = ?',
      [status, normalizeText(remark) || null, id]
    );

    return res.status(200).json({
      success: true,
      message: status === 'draft_approved' ? 'Draft approved successfully' : 'Draft rejected',
    });
  } catch (error) {
    console.error('Error updating draft status:', error);
    return res.status(500).json({ success: false, message: 'Failed to update draft status' });
  }
};

/**
 * POST /api/expense/:id/make-expense
 * Employee only — convert a draft_approved expense into a real pending expense.
 * THIS is when wallet gets deducted for the draft flow.
 */
export const makeExpenseFromDraft = async (req, res) => {
  try {
    const sessionUser = getSessionUser(req);
    if (!sessionUser) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { id } = req.params;

    const [rows] = await db.query(
      'SELECT * FROM expenses WHERE expense_id = ? LIMIT 1',
      [id]
    );
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    const expense = rows[0];

    if (expense.status !== 'draft_approved') {
      return res.status(400).json({ success: false, message: 'Only draft_approved expenses can be converted to expense' });
    }

    // Verify ownership — only the employee who owns the draft can convert it
    if (Number(expense.employee_id || expense.created_by) !== Number(sessionUser.id)) {
      return res.status(403).json({ success: false, message: 'You are not allowed to convert this draft' });
    }

    // NOW deduct wallet — this is the moment money leaves the budget
    try {
      await WalletService.debitWallet({
        userId: expense.employee_id || expense.created_by,
        amount: expense.amount,
        initiatedBy: sessionUser.id,
        referenceType: 'expense_deduction',
        referenceId: expense.expense_id,
        remarks: 'Converted from approved draft',
        adminNote: null,
        status: 'pending',
      });
    } catch (err) {
      if (err.message && err.message.includes('Insufficient wallet balance')) {
        return res.status(400).json({ success: false, message: 'Insufficient company wallet balance' });
      }
      throw err;
    }

    // Update expense status to pending for admin final approval
    await db.query(
      'UPDATE expenses SET status = ? WHERE expense_id = ?',
      ['approved', id]
    );

    return res.status(200).json({
      success: true,
      message: 'Expense created from draft. Amount deducted from wallet.',
    });
  } catch (error) {
    console.error('Error making expense from draft:', error);
    return res.status(500).json({ success: false, message: 'Failed to make expense from draft' });
  }
};
/**
 * POST /api/expense/:id/resubmit
 * Employee only - Resubmit a rejected expense for approval
 * Changes status from 'rejected' to 'pending' and deducts wallet again
 */
export const resubmitExpense = async (req, res) => {
  try {
    const sessionUser = getSessionUser(req);
    if (!sessionUser) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { id } = req.params;

    // Get the expense
    const [rows] = await db.query(
      'SELECT * FROM expenses WHERE expense_id = ? AND status = ?',
      [id, 'rejected']
    );
    
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Expense not found or not in rejected status' });
    }
    
    const expense = rows[0];
    const ownerId = expense.employee_id || expense.created_by;
    
    // Check ownership - only the employee who owns the expense can resubmit
    if (!isPrivilegedExpenseRole(sessionUser.role) && ownerId !== sessionUser.id) {
      return res.status(403).json({ success: false, message: 'You are not allowed to resubmit this expense' });
    }
    
    // Validate required fields are present
    if (!expense.category_id) {
      return res.status(400).json({ success: false, message: 'Category is required' });
    }
    
    if (expense.expense_type === 'direct_expense') {
      if (!expense.vendor_id && !expense.vendor_name) {
        return res.status(400).json({ success: false, message: 'Vendor is required' });
      }
      if (!expense.payment_mode) {
        return res.status(400).json({ success: false, message: 'Payment mode is required' });
      }
      if (!expense.bill_number) {
        return res.status(400).json({ success: false, message: 'Bill number is required' });
      }
    }
    
    if (expense.expense_type === 'project_expense' && !expense.project_master_id) {
      return res.status(400).json({ success: false, message: 'Project is required for project expense' });
    }
    
    // Deduct wallet again
    try {
      await WalletService.debitWallet({
        userId: ownerId,
        amount: expense.amount,
        initiatedBy: sessionUser.id,
        referenceType: 'expense_deduction',
        referenceId: expense.expense_id,
        remarks: 'Resubmitted rejected expense',
        adminNote: null,
        status: 'pending',
      });
    } catch (err) {
      console.error('Wallet debit failed on resubmit:', err);
      // Allow resubmit even if wallet fails (allow negative balance)
      // Don't block the resubmit
    }
    
    // Update status from rejected to pending
    await db.query(
      'UPDATE expenses SET status = ?, status_remark = NULL WHERE expense_id = ?',
      ['pending', id]
    );
    
    return res.status(200).json({
      success: true,
      message: 'Expense resubmitted for approval',
    });
  } catch (error) {
    console.error('Error resubmitting expense:', error);
    return res.status(500).json({ success: false, message: 'Failed to resubmit expense' });
  }
};
/**
 * PUT /api/expense/:id
 * Employees can edit their own draft_pending, draft_rejected, or rejected expenses.
 * Admins can edit any expense.
 */
/**
 * PUT /api/expense/:id
 * Employees can edit their own draft_pending, draft_rejected, or rejected expenses.
 * Admins can edit any expense.
 */
export const updateExpense = async (req, res) => {
  try {
    const sessionUser = getSessionUser(req);
    if (!sessionUser) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { id } = req.params;
    const [existingRows] = await db.query(
      'SELECT expense_id, employee_id, created_by, status FROM expenses WHERE expense_id = ? LIMIT 1',
      [id]
    );
    if (!existingRows.length) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    const existing = existingRows[0];
    const ownerEmployeeId = normalizeId(existing.employee_id || existing.created_by);

    // Check permissions
    if (!isPrivilegedExpenseRole(sessionUser.role)) {
      if (ownerEmployeeId !== sessionUser.id) {
        return res.status(403).json({ success: false, message: 'You are not allowed to update this expense' });
      }
      if (!['draft_pending', 'draft_rejected', 'rejected'].includes(existing.status)) {
        return res.status(403).json({ success: false, message: 'You can only edit draft_pending, draft_rejected, or rejected expenses' });
      }
    }

    const {
      title,
      expense_type,
      employee_id,
      project_master_id,
      project_name,
      site_location,
      category_id,
      vendor_id,
      vendor_source,
      vendor_name,
      payment_mode,
      bill_number,
      description,
      amount,
      expense_date,
      remark,
      attachment_path,
      attachment_name,
      expense_mode, // Get expense_mode from request
    } = req.body;

    if (amount === undefined || !expense_date) {
      return res.status(400).json({ success: false, message: 'amount and expense_date are required' });
    }

    const numericAmount = Number(amount);
    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ success: false, message: 'amount must be a positive number' });
    }

    const normalizedExpenseType = normalizeExpenseType(expense_type);
    if (!normalizedExpenseType) {
      return res.status(400).json({ success: false, message: 'expense_type is required' });
    }

    // Determine new status for employee edits
    let finalStatus = existing.status;
    let isResubmit = false;
    
    if (!isPrivilegedExpenseRole(sessionUser.role)) {
      if (existing.status === 'draft_pending') {
        // Editing a pending draft keeps it pending for review
        finalStatus = 'draft_pending';
      } else if (existing.status === 'draft_rejected') {
        // Resubmit a draft_rejected → back to draft_pending for admin review
        finalStatus = 'draft_pending';
        isResubmit = true;
      } else if (existing.status === 'rejected') {
        // Resubmit a rejected expense → back to pending
        finalStatus = 'pending';
        isResubmit = true;
      }
    }

    const employeeAssignment = await resolveEmployeeAssignment(sessionUser, employee_id, existing.employee_id || existing.created_by);
    if (employeeAssignment.error) {
      return res.status(employeeAssignment.statusCode || 400).json({ success: false, message: employeeAssignment.error });
    }

    let resolvedProject = { projectMasterId: null, projectName: null, siteLocation: null };
    if (normalizedExpenseType === PROJECT_EXPENSE) {
      resolvedProject = await resolveProjectDetails(project_master_id, project_name, site_location);
      if (!resolvedProject) {
        return res.status(400).json({ success: false, message: 'Invalid project selected' });
      }
    }

    const resolvedVendor = await resolveVendorDetails(vendor_id, vendor_source, vendor_name);
    if (vendor_id && !resolvedVendor) {
      return res.status(400).json({ success: false, message: 'Invalid vendor selected' });
    }

    let categoryId = null;
    let categoryName = null;
    if (category_id) {
      const [categoryRows] = await db.query(
        'SELECT category_id, category_name FROM expense_categories WHERE category_id = ? AND is_active = 1',
        [category_id]
      );
      if (!categoryRows.length) {
        return res.status(400).json({ success: false, message: 'Invalid expense category' });
      }
      categoryId = categoryRows[0].category_id;
      categoryName = categoryRows[0].category_name;
    }

    // For resubmit (draft_rejected → draft_pending), only validate basic fields
    // For pending (rejected → pending), validate all required fields
    if (finalStatus === 'pending') {
      const validationError = requireSubmitFields({
        expenseType: normalizedExpenseType,
        projectDetails: resolvedProject,
        categoryId,
        vendorDetails: resolvedVendor,
        paymentMode: normalizeText(payment_mode),
        billNumber: normalizeText(bill_number),
      });
      if (validationError) {
        return res.status(400).json({ success: false, message: validationError });
      }
    }
    
    // For draft resubmit, we don't require full validation (vendor, payment, bill can be missing)

    if (finalStatus === 'pending' && normalizedExpenseType === PROJECT_EXPENSE && !resolvedProject?.projectMasterId) {
      return res.status(400).json({ success: false, message: 'Project expense must be linked to a project' });
    }

    const uploadFile = Array.isArray(req.files?.attachment) ? req.files.attachment[0] : req.files?.attachment;
    const uploadedAttachment = await saveExpenseAttachment(uploadFile || null);
    const finalAttachmentPath = uploadedAttachment.attachmentPath || normalizeText(attachment_path);
    const finalAttachmentName = uploadedAttachment.attachmentName || normalizeText(attachment_name);

    const resolvedTitle = buildExpenseTitle({
      projectName: resolvedProject?.projectName || resolvedProject?.siteLocation,
      categoryName,
      billNumber: bill_number,
      vendorLabel: resolvedVendor?.vendorLabel,
    });

    const [result] = await db.query(
      `UPDATE expenses
       SET title = ?, expense_type = ?, employee_id = ?,
           project_master_id = ?, project_name = ?, site_location = ?,
           category_id = ?, category = ?,
           vendor_id = ?, vendor_source = ?, vendor_name = ?,
           payment_mode = ?, bill_number = ?, description = ?,
           amount = ?, expense_date = ?,
           attachment_path = ?, attachment_name = ?,
           status = ?, remark = ?
       WHERE expense_id = ?`,
      [
        normalizeText(title) || resolvedTitle,
        normalizedExpenseType,
        employeeAssignment.employeeId,
        normalizedExpenseType === PROJECT_EXPENSE ? resolvedProject?.projectMasterId || null : null,
        normalizedExpenseType === PROJECT_EXPENSE ? resolvedProject?.projectName || null : null,
        normalizedExpenseType === PROJECT_EXPENSE ? resolvedProject?.siteLocation || null : null,
        categoryId,
        categoryName,
        resolvedVendor?.vendorId || null,
        resolvedVendor?.vendorSource || (resolvedVendor?.vendorId ? 'vendor' : 'other'),
        resolvedVendor?.vendorLabel || null,
        normalizeText(payment_mode),
        normalizeText(bill_number),
        normalizeText(description),
        numericAmount,
        expense_date,
        finalAttachmentPath,
        finalAttachmentName,
        finalStatus,
        normalizeText(remark),
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    // If employee resubmitted a rejected expense → deduct wallet again
    if (existing.status === 'rejected' && finalStatus === 'pending') {
      try {
        await WalletService.debitWallet({
          userId: employeeAssignment.employeeId,
          amount: numericAmount,
          initiatedBy: sessionUser.id,
          referenceType: 'expense_deduction',
          referenceId: Number(id),
          remarks: 'Resubmitted expense',
          adminNote: null,
          status: 'pending',
        });
      } catch (err) {
        // Rollback to rejected if wallet fails
        await db.query('UPDATE expenses SET status = ? WHERE expense_id = ?', ['rejected', id]);
        if (err.message && err.message.includes('Insufficient wallet balance')) {
          return res.status(400).json({ success: false, message: 'Insufficient company wallet balance' });
        }
        throw err;
      }
    }

    const message = isResubmit 
      ? (finalStatus === 'draft_pending' ? 'Draft resubmitted for admin review' : 'Expense resubmitted successfully')
      : 'Expense updated successfully';

    return res.status(200).json({ success: true, message });
  } catch (error) {
    console.error('Error updating expense:', error);
    return res.status(500).json({ success: false, message: 'Failed to update expense' });
  }
};

/**
 * PATCH /api/expense/:id/status
 * Admin only — approve or reject a PENDING expense.
 * Only works on status = 'pending'. Draft flow uses /draft-status endpoint.
 */
export const updateExpenseStatus = async (req, res) => {
  try {
    const sessionUser = getSessionUser(req);
    if (!sessionUser) return res.status(401).json({ success: false, message: 'Unauthorized' });
    if (!isPrivilegedExpenseRole(sessionUser.role)) {
      return res.status(403).json({ success: false, message: 'Only admin can change expense status' });
    }

    const { id } = req.params;
    const { status, status_remark } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be 'approved' or 'rejected'" });
    }

    const [rows] = await db.query(
      'SELECT expense_id, status, employee_id, amount FROM expenses WHERE expense_id = ? LIMIT 1',
      [id]
    );
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    const expense = rows[0];

    if (expense.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Only pending expenses can be approved or rejected' });
    }

    if (status === 'approved') {
      // Wallet was already deducted on submit — just confirm the transaction
      await db.query(
        `UPDATE wallet_transactions
         SET status = 'approved'
         WHERE reference_type = 'expense_deduction'
           AND reference_id = ?
           AND user_id = ?
           AND status != 'approved'`,
        [id, expense.employee_id]
      );
    }

    if (status === 'rejected') {
      // Reverse the wallet deduction
      try {
        await WalletService.reversal({
          userId: expense.employee_id,
          amount: expense.amount,
          initiatedBy: sessionUser.id,
          referenceType: 'rejection_reversal',
          referenceId: id,
          remarks: 'Expense rejected, amount reversed',
          adminNote: normalizeText(status_remark) || null,
          status: 'approved',
        });
      } catch (err) {
        console.error('Wallet reversal failed during rejection:', err);
        return res.status(500).json({ success: false, message: 'Wallet reversal failed. Expense not rejected.' });
      }

      // Mark original debit transaction as reversed
      await db.query(
        `UPDATE wallet_transactions
         SET status = 'reversed'
         WHERE reference_type = 'expense_deduction'
           AND reference_id = ?
           AND user_id = ?
           AND status != 'reversed'`,
        [id, expense.employee_id]
      );
    }

    await db.query(
      'UPDATE expenses SET status = ?, status_remark = ? WHERE expense_id = ?',
      [status, normalizeText(status_remark) || null, id]
    );

    return res.status(200).json({ success: true, message: `Expense ${status} successfully` });
  } catch (error) {
    console.error('Error updating expense status:', error);
    return res.status(500).json({ success: false, message: 'Failed to update expense status' });
  }
};

/**
 * DELETE /api/expense/:id
 * Employees can delete draft_pending, draft_rejected, or pending expenses.
 * Admins can delete any expense.
 */
export const deleteExpense = async (req, res) => {
  try {
    const sessionUser = getSessionUser(req);
    if (!sessionUser) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { id } = req.params;

    if (!isPrivilegedExpenseRole(sessionUser.role)) {
      const [rows] = await db.query(
        'SELECT status FROM expenses WHERE expense_id = ? AND COALESCE(employee_id, created_by) = ? LIMIT 1',
        [id, sessionUser.id]
      );
      if (!rows.length) {
        return res.status(404).json({ success: false, message: 'Expense not found' });
      }
      // Allow deletion of draft_pending, draft_rejected, and pending
      if (!['draft_pending', 'draft_rejected', 'pending'].includes(rows[0].status)) {
        return res.status(403).json({ success: false, message: 'You can only delete draft or pending expenses' });
      }
    }

    let query = 'DELETE FROM expenses WHERE expense_id = ?';
    const params = [id];
    if (!isPrivilegedExpenseRole(sessionUser.role)) {
      query += ' AND COALESCE(employee_id, created_by) = ?';
      params.push(sessionUser.id);
    }

    const [result] = await db.query(query, params);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    return res.status(200).json({ success: true, message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete expense' });
  }
};

// ─── Expense Categories ───────────────────────────────────────────────────────

export const getExpenseCategories = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT category_id, category_name, category_description, is_active, created_at, updated_at
       FROM expense_categories
       WHERE is_active = 1
       ORDER BY category_name ASC`
    );
    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching expense categories:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch expense categories' });
  }
};

export const createExpenseCategory = async (req, res) => {
  try {
    const { category_name, category_description } = req.body;
    if (!category_name || !category_name.trim()) {
      return res.status(400).json({ success: false, message: 'category_name is required' });
    }

    const categoryName = category_name.trim();
    const categoryDescription =
      typeof category_description === 'string' && category_description.trim()
        ? category_description.trim()
        : null;

    const [duplicate] = await db.query(
      'SELECT category_id FROM expense_categories WHERE LOWER(category_name) = LOWER(?) AND is_active = 1 LIMIT 1',
      [categoryName]
    );
    if (duplicate.length) {
      return res.status(400).json({ success: false, message: 'Category already exists' });
    }

    const [result] = await db.query(
      'INSERT INTO expense_categories (category_name, category_description, is_active) VALUES (?, ?, 1)',
      [categoryName, categoryDescription]
    );

    return res.status(201).json({
      success: true,
      message: 'Expense category created successfully',
      category_id: result.insertId,
    });
  } catch (error) {
    console.error('Error creating expense category:', error);
    return res.status(500).json({ success: false, message: 'Failed to create expense category' });
  }
};

export const updateExpenseCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { category_name, category_description } = req.body;
    if (!category_name || !category_name.trim()) {
      return res.status(400).json({ success: false, message: 'category_name is required' });
    }

    const categoryName = category_name.trim();
    const categoryDescription =
      typeof category_description === 'string' && category_description.trim()
        ? category_description.trim()
        : null;

    const [duplicate] = await db.query(
      'SELECT category_id FROM expense_categories WHERE LOWER(category_name) = LOWER(?) AND category_id <> ? AND is_active = 1 LIMIT 1',
      [categoryName, id]
    );
    if (duplicate.length) {
      return res.status(400).json({ success: false, message: 'Category already exists' });
    }

    const [result] = await db.query(
      'UPDATE expense_categories SET category_name = ?, category_description = ? WHERE category_id = ? AND is_active = 1',
      [categoryName, categoryDescription, id]
    );
    if (!result.affectedRows) {
      return res.status(404).json({ success: false, message: 'Expense category not found' });
    }

    await db.query('UPDATE expenses SET category = ? WHERE category_id = ?', [categoryName, id]);

    return res.status(200).json({ success: true, message: 'Expense category updated successfully' });
  } catch (error) {
    console.error('Error updating expense category:', error);
    return res.status(500).json({ success: false, message: 'Failed to update expense category' });
  }
};

export const deleteExpenseCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const [linkedExpenses] = await db.query('SELECT COUNT(*) AS total FROM expenses WHERE category_id = ?', [id]);
    if (linkedExpenses[0]?.total > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category because expenses are linked to it',
      });
    }

    const [result] = await db.query(
      'UPDATE expense_categories SET is_active = 0 WHERE category_id = ? AND is_active = 1',
      [id]
    );
    if (!result.affectedRows) {
      return res.status(404).json({ success: false, message: 'Expense category not found' });
    }

    return res.status(200).json({ success: true, message: 'Expense category deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense category:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete expense category' });
  }
};