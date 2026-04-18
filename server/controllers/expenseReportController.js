import db from '../database/db.js';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { Parser } from 'json2csv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// ─── Shared summary builder ───────────────────────────────────────────────────
const buildSummary = async (db, whereClauses, params) => {
    const [rows] = await db.query(`
    SELECT
      COUNT(*)                                        AS total_transactions,
      COALESCE(SUM(amount), 0)                        AS total_amount,
      COALESCE(AVG(amount), 0)                        AS average_amount,
      COALESCE(MIN(amount), 0)                        AS min_amount,
      COALESCE(MAX(amount), 0)                        AS max_amount,
      COUNT(DISTINCT employee_id)                     AS unique_employees,
      MIN(expense_date)                               AS first_expense,
      MAX(expense_date)                               AS last_expense
    FROM expenses
    WHERE ${whereClauses}
  `, params);
    return rows[0];
};

export const getDateWiseReport = async (req, res) => {
    try {
        const sessionUser = getSessionUser(req);
        if (!sessionUser) return res.status(401).json({ success: false, message: 'Unauthorized' });

        const { from_date, to_date, employee_id } = req.query;

        let query = `
      SELECT 
        DATE(e.expense_date) as expense_date,
        COUNT(*) as total_expenses,
        SUM(e.amount) as total_amount,
        GROUP_CONCAT(DISTINCT e.payment_mode) as payment_modes
      FROM expenses e
      WHERE e.status = 'approved'
        AND e.expense_date BETWEEN ? AND ?
    `;

        const params = [from_date, to_date];

        if (employee_id && isPrivilegedExpenseRole(sessionUser.role)) {
            query += ` AND e.employee_id = ?`;
            params.push(employee_id);
        } else if (!isPrivilegedExpenseRole(sessionUser.role)) {
            query += ` AND e.employee_id = ?`;
            params.push(sessionUser.id);
        }

        query += ` GROUP BY DATE(e.expense_date) ORDER BY expense_date DESC`;

        const [rows] = await db.query(query, params);

        // Format dates nicely
        const formattedRows = rows.map(row => ({
            ...row,
            expense_date_formatted: new Date(row.expense_date).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            }),
            expense_date: row.expense_date // keep original for sorting
        }));

        // Get summary - only total transactions and total amount
        const [summary] = await db.query(`
      SELECT 
        COUNT(*) as total_transactions,
        SUM(amount) as total_amount
      FROM expenses
      WHERE status = 'approved'
        AND expense_date BETWEEN ? AND ?
    `, [from_date, to_date]);

        return res.status(200).json({
            success: true,
            data: formattedRows,
            summary: summary[0],
            filters: {
                from_date,
                to_date,
                from_date_formatted: new Date(from_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
                to_date_formatted: new Date(to_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
            }
        });
    } catch (error) {
        console.error('Error generating date-wise report:', error);
        return res.status(500).json({ success: false, message: 'Failed to generate report' });
    }
};

// ─── Project-wise Expense Report ─────────────────────────────────────────────
export const getProjectWiseReport = async (req, res) => {
    try {
        const sessionUser = getSessionUser(req);
        if (!sessionUser) return res.status(401).json({ success: false, message: 'Unauthorized' });

        const { from_date, to_date, project_id } = req.query;
        const params = [from_date, to_date];
        let extraFilters = '';

        if (project_id) {
            extraFilters += ` AND e.project_master_id = ?`;
            params.push(project_id);
        }
        if (!isPrivilegedExpenseRole(sessionUser.role)) {
            extraFilters += ` AND e.employee_id = ?`;
            params.push(sessionUser.id);
        }

        // Build main SQL query string
        const mainSQL = `
  SELECT
    COALESCE(rd.name, 'No Project')               AS project_name,
    e.project_master_id,
    MAX(q.total_price)                            AS budget,
    COALESCE((
      SELECT SUM(amount)
      FROM expenses e2
      WHERE e2.project_master_id = e.project_master_id
        AND e2.status = 'approved'
        ${!isPrivilegedExpenseRole(sessionUser.role) ? 'AND e2.employee_id = ?' : ''}
    ), 0)                                         AS total_expense_overall,
    COALESCE(SUM(e.amount), 0)                    AS expense_range,
    COUNT(*)                                      AS no_of_expenses,
    COALESCE(AVG(e.amount), 0)                    AS average_amount,
    COUNT(DISTINCT e.employee_id)                 AS unique_employees,
    COUNT(DISTINCT e.vendor_id)                   AS unique_vendors
  FROM expenses e
  LEFT JOIN raw_data rd ON rd.master_id = e.project_master_id
  LEFT JOIN quotation q ON q.master_id = rd.master_id
  WHERE e.status = 'approved'
    AND e.expense_date BETWEEN ? AND ?
    AND e.project_master_id IS NOT NULL           -- ✅ Exclude "No Project"
    ${extraFilters}
  GROUP BY e.project_master_id, rd.name
  ORDER BY expense_range DESC
`;

        const mainParams = [...params, ...(!isPrivilegedExpenseRole(sessionUser.role) ? [sessionUser.id] : [])];

        // Log the main query
        console.log('\n========== PROJECT-WISE REPORT MAIN QUERY ==========');
        console.log('SQL:', mainSQL);
        console.log('Parameters:', mainParams);
        console.log('====================================================\n');

        const [rows] = await db.query(mainSQL, mainParams);

        // Build summary query
        const summaryParams = [from_date, to_date, ...params.slice(2)];
        const summaryWhere = `status = 'approved' AND expense_date BETWEEN ? AND ?${project_id ? ' AND project_master_id = ?' : ''
            }${!isPrivilegedExpenseRole(sessionUser.role) ? ' AND employee_id = ?' : ''}`;

        const summarySQL = `
      SELECT
        COUNT(*)                                        AS total_transactions,
        COALESCE(SUM(amount), 0)                        AS total_amount,
        COALESCE(AVG(amount), 0)                        AS average_amount,
        COALESCE(MIN(amount), 0)                        AS min_amount,
        COALESCE(MAX(amount), 0)                        AS max_amount,
        COUNT(DISTINCT employee_id)                     AS unique_employees,
        MIN(expense_date)                               AS first_expense,
        MAX(expense_date)                               AS last_expense
      FROM expenses
      WHERE ${summaryWhere}
    `;

        console.log('\n========== PROJECT-WISE REPORT SUMMARY QUERY ==========');
        console.log('SQL:', summarySQL);
        console.log('Parameters:', summaryParams);
        console.log('=======================================================\n');

        const summary = await buildSummary(db, summaryWhere, summaryParams); // buildSummary already executes the query

        return res.status(200).json({
            success: true,
            data: rows,
            summary,
            filters: { from_date, to_date, project_id: project_id || null },
        });
    } catch (error) {
        console.error('Error generating project-wise report:', error);
        return res.status(500).json({ success: false, message: 'Failed to generate report' });
    }
};


// ─── Employee-wise Expense Report ───────────────────────────────────────────
export const getEmployeeWiseReport = async (req, res) => {
    try {
        const sessionUser = getSessionUser(req);
        if (!sessionUser) return res.status(401).json({ success: false, message: 'Unauthorized' });

        const { from_date, to_date, employee_id } = req.query;
        const params = [from_date, to_date];
        let extraFilters = '';

        if (employee_id && isPrivilegedExpenseRole(sessionUser.role)) {
            extraFilters += ` AND e.employee_id = ?`;
            params.push(employee_id);
        } else if (!isPrivilegedExpenseRole(sessionUser.role)) {
            extraFilters += ` AND e.employee_id = ?`;
            params.push(sessionUser.id);
        }

        const [rows] = await db.query(`
            SELECT
                u.name                                      AS employee_name,
                u.user_id                                   AS employee_id,
                COALESCE(SUM(e.amount), 0)                  AS total_expense,
                COUNT(*)                                    AS no_of_expenses,
                COALESCE(AVG(e.amount), 0)                  AS average_expense,
                MIN(e.amount)                               AS min_expense,
                MAX(e.amount)                               AS max_expense,
                COALESCE(u.wallet_balance, 0)               AS wallet_balance,
                COALESCE(u.total_credited, 0)               AS total_credited    -- 🆕 total credited amount
            FROM expenses e
            INNER JOIN users u ON u.user_id = e.employee_id
            WHERE e.status = 'approved'
                AND e.expense_date BETWEEN ? AND ?
                ${extraFilters}
            GROUP BY e.employee_id, u.name, u.wallet_balance, u.total_credited
            ORDER BY total_expense DESC
        `, params);

        // Summary (overall totals for the date range, respecting filters)
        const summaryParams = [from_date, to_date];
        let summaryExtra = '';
        if (employee_id && isPrivilegedExpenseRole(sessionUser.role)) {
            summaryExtra += ` AND employee_id = ?`;
            summaryParams.push(employee_id);
        } else if (!isPrivilegedExpenseRole(sessionUser.role)) {
            summaryExtra += ` AND employee_id = ?`;
            summaryParams.push(sessionUser.id);
        }
        const summaryWhere = `status = 'approved' AND expense_date BETWEEN ? AND ?${summaryExtra}`;
        const summary = await buildSummary(db, summaryWhere, summaryParams);

        let employees = [];
        if (isPrivilegedExpenseRole(sessionUser.role)) {
            const [empRows] = await db.query(`
                SELECT user_id, name, wallet_balance, total_credited FROM users
                WHERE role IN ('admin', 'sub_admin', 'hr', 'hr_executive', 'employee')
                ORDER BY name
            `);
            employees = empRows;
        }

        return res.status(200).json({
            success: true,
            data: rows,
            summary,
            filters: { from_date, to_date, employee_id: employee_id || null },
            employees,
        });
    } catch (error) {
        console.error('Error generating employee-wise report:', error);
        return res.status(500).json({ success: false, message: 'Failed to generate report' });
    }
};

// ─── Category-wise Expense Report ───────────────────────────────────────────
export const getCategoryWiseReport = async (req, res) => {
    try {
        const sessionUser = getSessionUser(req);
        if (!sessionUser) return res.status(401).json({ success: false, message: 'Unauthorized' });

        const { from_date, to_date, category_id } = req.query;
        const params = [from_date, to_date];
        let extraFilters = '';

        if (category_id) {
            extraFilters += ` AND e.category_id = ?`;
            params.push(category_id);
        }
        if (!isPrivilegedExpenseRole(sessionUser.role)) {
            extraFilters += ` AND e.employee_id = ?`;
            params.push(sessionUser.id);
        }

        const [rows] = await db.query(`
      SELECT
        e.category_id,
        COALESCE(e.category, 'Uncategorized')         AS category_name,
        COUNT(*)                                      AS total_expenses,
        COALESCE(SUM(e.amount), 0)                    AS total_amount,
        COALESCE(AVG(e.amount), 0)                    AS average_amount,
        COUNT(DISTINCT e.employee_id)                 AS unique_employees
      FROM expenses e
      WHERE e.status = 'approved'
        AND e.expense_date BETWEEN ? AND ?
        ${extraFilters}
      GROUP BY e.category_id, e.category
      ORDER BY total_amount DESC
    `, params);

        // Top 5 categories — always global (unfiltered by category_id) for context
        const topParams = [from_date, to_date];
        if (!isPrivilegedExpenseRole(sessionUser.role)) topParams.push(sessionUser.id);

        const [topCategories] = await db.query(`
      SELECT
        COALESCE(category, 'Uncategorized')           AS category_name,
        COALESCE(SUM(amount), 0)                      AS total_amount,
        COUNT(*)                                      AS total_expenses
      FROM expenses
      WHERE status = 'approved'
        AND expense_date BETWEEN ? AND ?
        ${!isPrivilegedExpenseRole(sessionUser.role) ? ' AND employee_id = ?' : ''}
      GROUP BY category
      ORDER BY total_amount DESC
      LIMIT 5
    `, topParams);

        const summaryParams = [from_date, to_date, ...params.slice(2)];
        const summaryWhere = `status = 'approved' AND expense_date BETWEEN ? AND ?${category_id ? ' AND category_id = ?' : ''
            }${!isPrivilegedExpenseRole(sessionUser.role) ? ' AND employee_id = ?' : ''}`;
        const summary = await buildSummary(db, summaryWhere, summaryParams);

        return res.status(200).json({
            success: true,
            data: rows,
            summary,
            top_categories: topCategories,
            filters: { from_date, to_date, category_id: category_id || null },
        });
    } catch (error) {
        console.error('Error generating category-wise report:', error);
        return res.status(500).json({ success: false, message: 'Failed to generate report' });
    }
};

// ─── Vendor-wise Expense Report ─────────────────────────────────────────────
export const getVendorWiseReport = async (req, res) => {
    try {
        const sessionUser = getSessionUser(req);
        if (!sessionUser) return res.status(401).json({ success: false, message: 'Unauthorized' });

        const { from_date, to_date, vendor_id } = req.query;
        const params = [from_date, to_date];
        let extraFilters = '';

        if (vendor_id) {
            extraFilters += ` AND e.vendor_id = ?`;
            params.push(vendor_id);
        }
        if (!isPrivilegedExpenseRole(sessionUser.role)) {
            extraFilters += ` AND e.employee_id = ?`;
            params.push(sessionUser.id);
        }

        const [rows] = await db.query(`
      SELECT
        e.vendor_id,
        COALESCE(e.vendor_name, v.company_name, 'Other') AS vendor_name,
        COUNT(*)                                          AS total_transactions,
        COALESCE(SUM(e.amount), 0)                        AS total_amount,
        COALESCE(AVG(e.amount), 0)                        AS average_amount,
        COALESCE(MIN(e.amount), 0)                        AS min_amount,
        COALESCE(MAX(e.amount), 0)                        AS max_amount
      FROM expenses e
      LEFT JOIN vendors v ON v.vendor_id = e.vendor_id
      WHERE e.status = 'approved'
        AND e.expense_date BETWEEN ? AND ?
        AND (e.vendor_name IS NOT NULL OR v.company_name IS NOT NULL)
        ${extraFilters}
      GROUP BY e.vendor_id, e.vendor_name
      ORDER BY total_amount DESC
      LIMIT 50
    `, params);

        const summaryParams = [from_date, to_date, ...params.slice(2)];
        const summaryWhere = `status = 'approved' AND expense_date BETWEEN ? AND ?${vendor_id ? ' AND vendor_id = ?' : ''
            }${!isPrivilegedExpenseRole(sessionUser.role) ? ' AND employee_id = ?' : ''}`;
        const summary = await buildSummary(db, summaryWhere, summaryParams);

        return res.status(200).json({
            success: true,
            data: rows,
            summary,
            filters: { from_date, to_date, vendor_id: vendor_id || null },
        });
    } catch (error) {
        console.error('Error generating vendor-wise report:', error);
        return res.status(500).json({ success: false, message: 'Failed to generate report' });
    }
};

// ─── Payment Mode Report ────────────────────────────────────────────────────
export const getPaymentModeReport = async (req, res) => {
    try {
        const sessionUser = getSessionUser(req);
        if (!sessionUser) return res.status(401).json({ success: false, message: 'Unauthorized' });

        const { from_date, to_date } = req.query;
        const params = [from_date, to_date];
        let employeeFilter = '';

        if (!isPrivilegedExpenseRole(sessionUser.role)) {
            employeeFilter = ` AND e.employee_id = ?`;
            params.push(sessionUser.id);
        }

        const [rows] = await db.query(`
      SELECT
        COALESCE(e.payment_mode, 'Unknown')           AS payment_mode,
        COUNT(*)                                      AS total_transactions,
        COALESCE(SUM(e.amount), 0)                    AS total_amount,
        COALESCE(AVG(e.amount), 0)                    AS average_amount,
        COUNT(DISTINCT e.employee_id)                 AS unique_employees
      FROM expenses e
      WHERE e.status = 'approved'
        AND e.expense_date BETWEEN ? AND ?
        AND e.payment_mode IS NOT NULL
        ${employeeFilter}
      GROUP BY e.payment_mode
      ORDER BY total_amount DESC
    `, params);

        // Monthly trend by payment mode (same employee scope)
        const trendParams = [from_date, to_date];
        if (!isPrivilegedExpenseRole(sessionUser.role)) trendParams.push(sessionUser.id);

        const [monthlyTrend] = await db.query(`
      SELECT
        DATE_FORMAT(expense_date, '%Y-%m')            AS month,
        COALESCE(payment_mode, 'Unknown')             AS payment_mode,
        COALESCE(SUM(amount), 0)                      AS total_amount,
        COUNT(*)                                      AS total_transactions
      FROM expenses
      WHERE status = 'approved'
        AND expense_date BETWEEN ? AND ?
        AND payment_mode IS NOT NULL
        ${!isPrivilegedExpenseRole(sessionUser.role) ? ' AND employee_id = ?' : ''}
      GROUP BY month, payment_mode
      ORDER BY month DESC, total_amount DESC
    `, trendParams);

        const summaryWhere = `status = 'approved' AND expense_date BETWEEN ? AND ?${!isPrivilegedExpenseRole(sessionUser.role) ? ' AND employee_id = ?' : ''
            }`;
        const summary = await buildSummary(db, summaryWhere, params);

        return res.status(200).json({
            success: true,
            data: rows,
            summary,
            monthly_trend: monthlyTrend,
            filters: { from_date, to_date },
        });
    } catch (error) {
        console.error('Error generating payment mode report:', error);
        return res.status(500).json({ success: false, message: 'Failed to generate report' });
    }
};

// ─── Export to Excel ────────────────────────────────────────────────────────
export const exportToExcel = async (req, res) => {
    try {
        const sessionUser = getSessionUser(req);
        if (!sessionUser) return res.status(401).json({ success: false, message: 'Unauthorized' });

        const { report_type, from_date, to_date, format = 'excel' } = req.query;

        let data = [];
        let columns = [];
        let sheetName = '';

        // ---------- Helper to build dynamic query + params ----------
        const buildQueryAndParams = (type) => {
            let query = '';
            let params = [from_date, to_date];
            let extra = '';

            switch (type) {
                case 'date_wise':
                    query = `
            SELECT 
              DATE_FORMAT(expense_date, '%d %b %Y') AS Date,
              COUNT(*) AS 'Total Expenses',
              SUM(amount) AS 'Total Amount',
              GROUP_CONCAT(DISTINCT payment_mode) AS 'Payment Modes'
            FROM expenses
            WHERE status = 'approved' AND expense_date BETWEEN ? AND ?
          `;
                    if (req.query.employee_id && isPrivilegedExpenseRole(sessionUser.role)) {
                        query += ` AND employee_id = ?`;
                        params.push(req.query.employee_id);
                    } else if (!isPrivilegedExpenseRole(sessionUser.role)) {
                        query += ` AND employee_id = ?`;
                        params.push(sessionUser.id);
                    }
                    query += ` GROUP BY DATE(expense_date) ORDER BY expense_date DESC`;
                    break;

                case 'employee_wise':
                    query = `
            SELECT
              u.name AS 'Employee Name',
              COALESCE(SUM(e.amount), 0) AS 'Total Expense',
              COUNT(*) AS 'No. of Expenses',
              COALESCE(u.wallet_balance, 0) AS 'Wallet Balance',
              COALESCE(u.total_credited, 0) AS 'Total Credited'
            FROM expenses e
            INNER JOIN users u ON u.user_id = e.employee_id
            WHERE e.status = 'approved' AND e.expense_date BETWEEN ? AND ?
          `;
                    if (req.query.employee_id && isPrivilegedExpenseRole(sessionUser.role)) {
                        query += ` AND e.employee_id = ?`;
                        params.push(req.query.employee_id);
                    } else if (!isPrivilegedExpenseRole(sessionUser.role)) {
                        query += ` AND e.employee_id = ?`;
                        params.push(sessionUser.id);
                    }
                    query += ` GROUP BY e.employee_id, u.name, u.wallet_balance, u.total_credited ORDER BY SUM(e.amount) DESC`;
                    break;

                case 'project_wise':
                    query = `
            SELECT
              COALESCE(rd.name, 'No Project') AS Project,
              MAX(q.total_price) AS Budget,
              COALESCE((
                SELECT SUM(amount) FROM expenses e2
                WHERE e2.project_master_id = e.project_master_id AND e2.status = 'approved'
                ${!isPrivilegedExpenseRole(sessionUser.role) ? 'AND e2.employee_id = ?' : ''}
              ), 0) AS 'Total Expense (Overall)',
              SUM(e.amount) AS 'Expense (Date Range)',
              COUNT(*) AS 'No. of Expenses'
            FROM expenses e
            LEFT JOIN raw_data rd ON rd.master_id = e.project_master_id
            LEFT JOIN quotation q ON q.master_id = rd.master_id
            WHERE e.status = 'approved' AND e.expense_date BETWEEN ? AND ?
            ${req.query.project_id ? 'AND e.project_master_id = ?' : ''}
            ${!isPrivilegedExpenseRole(sessionUser.role) ? 'AND e.employee_id = ?' : ''}
            GROUP BY e.project_master_id, rd.name
            ORDER BY SUM(e.amount) DESC
          `;
                    if (req.query.project_id) params.push(req.query.project_id);
                    if (!isPrivilegedExpenseRole(sessionUser.role)) params.push(sessionUser.id);
                    break;

                case 'category_wise':
                    query = `
            SELECT
              COALESCE(category, 'Uncategorized') AS Category,
              COUNT(*) AS 'Total Expenses',
              SUM(amount) AS 'Total Amount',
              AVG(amount) AS 'Avg Amount'
            FROM expenses
            WHERE status = 'approved' AND expense_date BETWEEN ? AND ?
            ${req.query.category_id ? 'AND category_id = ?' : ''}
            ${!isPrivilegedExpenseRole(sessionUser.role) ? 'AND employee_id = ?' : ''}
            GROUP BY category_id, category ORDER BY SUM(amount) DESC
          `;
                    if (req.query.category_id) params.push(req.query.category_id);
                    if (!isPrivilegedExpenseRole(sessionUser.role)) params.push(sessionUser.id);
                    break;

                case 'vendor_wise':
                    query = `
            SELECT
              COALESCE(e.vendor_name, v.company_name, 'Other') AS Vendor,
              COUNT(*) AS Transactions,
              SUM(e.amount) AS 'Total Amount',
              AVG(e.amount) AS 'Avg Amount',
              MIN(e.amount) AS Minimum,
              MAX(e.amount) AS Maximum
            FROM expenses e
            LEFT JOIN vendors v ON v.vendor_id = e.vendor_id
            WHERE e.status = 'approved' AND e.expense_date BETWEEN ? AND ?
              AND (e.vendor_name IS NOT NULL OR v.company_name IS NOT NULL)
            ${req.query.vendor_id ? 'AND e.vendor_id = ?' : ''}
            ${!isPrivilegedExpenseRole(sessionUser.role) ? 'AND e.employee_id = ?' : ''}
            GROUP BY e.vendor_id, e.vendor_name ORDER BY SUM(e.amount) DESC LIMIT 100
          `;
                    if (req.query.vendor_id) params.push(req.query.vendor_id);
                    if (!isPrivilegedExpenseRole(sessionUser.role)) params.push(sessionUser.id);
                    break;

                case 'payment_mode':
                    query = `
            SELECT
              COALESCE(payment_mode, 'Unknown') AS 'Payment Mode',
              COUNT(*) AS Transactions,
              SUM(amount) AS 'Total Amount',
              AVG(amount) AS 'Avg Amount'
            FROM expenses
            WHERE status = 'approved' AND expense_date BETWEEN ? AND ?
              AND payment_mode IS NOT NULL
            ${!isPrivilegedExpenseRole(sessionUser.role) ? 'AND employee_id = ?' : ''}
            GROUP BY payment_mode ORDER BY SUM(amount) DESC
          `;
                    if (!isPrivilegedExpenseRole(sessionUser.role)) params.push(sessionUser.id);
                    break;

                default:
                    query = `
            SELECT
              e.expense_id AS 'ID',
              DATE(e.expense_date) AS 'Date',
              e.bill_number AS 'Bill No',
              COALESCE(e.vendor_name, v.company_name, '-') AS Vendor,
              COALESCE(e.category, '-') AS Category,
              e.amount AS Amount,
              COALESCE(e.payment_mode, '-') AS 'Payment Mode',
              COALESCE(e.project_name, '-') AS Project,
              u.name AS Employee,
              COALESCE(e.description, '-') AS Description
            FROM expenses e
            LEFT JOIN vendors v ON v.vendor_id = e.vendor_id
            LEFT JOIN users u ON u.user_id = e.employee_id
            WHERE e.status = 'approved' AND e.expense_date BETWEEN ? AND ?
            ${!isPrivilegedExpenseRole(sessionUser.role) ? 'AND e.employee_id = ?' : ''}
            ORDER BY e.expense_date DESC LIMIT 5000
          `;
                    if (!isPrivilegedExpenseRole(sessionUser.role)) params.push(sessionUser.id);
                    break;
            }
            return { query, params };
        };

        const { query, params } = buildQueryAndParams(report_type);
        const [rows] = await db.query(query, params);

        // ---------- Prepare data & columns ----------
        if (report_type === 'date_wise') {
            const startFormatted = new Date(from_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
            const endFormatted = new Date(to_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
            data = rows.map(row => ({ ...row, 'Start Date': startFormatted, 'End Date': endFormatted }));
            columns = ['Date', 'Total Expenses', 'Total Amount', 'Payment Modes', 'Start Date', 'End Date'];
            sheetName = 'Date_Wise_Report';
        }
        else if (report_type === 'employee_wise') {
            data = rows;
            columns = ['Employee Name', 'Total Expense', 'No. of Expenses', 'Wallet Balance', 'Total Credited'];
            sheetName = 'Employee_Wise_Report';
        }
        else if (report_type === 'project_wise') {
            data = rows;
            columns = ['Project', 'Budget', 'Total Expense (Overall)', 'Expense (Date Range)', 'No. of Expenses'];
            sheetName = 'Project_Wise_Report';
        }
        else if (report_type === 'category_wise') {
            data = rows;
            columns = ['Category', 'Total Expenses', 'Total Amount', 'Avg Amount'];
            sheetName = 'Category_Wise_Report';
        }
        else if (report_type === 'vendor_wise') {
            data = rows;
            columns = ['Vendor', 'Transactions', 'Total Amount', 'Avg Amount', 'Minimum', 'Maximum'];
            sheetName = 'Vendor_Wise_Report';
        }
        else if (report_type === 'payment_mode') {
            data = rows;
            columns = ['Payment Mode', 'Transactions', 'Total Amount', 'Avg Amount'];
            sheetName = 'Payment_Mode_Report';
        }
        else {
            data = rows;
            columns = ['ID', 'Date', 'Bill No', 'Vendor', 'Category', 'Amount', 'Payment Mode', 'Project', 'Employee', 'Description'];
            sheetName = 'Expense_Details';
        }

        if (format === 'csv') {
            const json2csvParser = new Parser({ fields: columns });
            const csv = json2csvParser.parse(data);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=${sheetName}_${from_date}_to_${to_date}.csv`);
            return res.send(csv);
        }

        // ---------- Excel workbook ----------
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Expense Reports System';
        workbook.created = new Date();
        const worksheet = workbook.addWorksheet(sheetName);

        const lastCol = String.fromCharCode(64 + columns.length);

        // Title row
        worksheet.mergeCells(`A1:${lastCol}1`);
        const titleCell = worksheet.getCell('A1');
        titleCell.value = `${sheetName.replace(/_/g, ' ')} — ${from_date} to ${to_date}`;
        titleCell.font = { size: 13, bold: true, color: { argb: 'FF1F3864' } };
        titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
        titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E1F2' } };
        worksheet.getRow(1).height = 28;

        // Generated-on row
        worksheet.mergeCells(`A2:${lastCol}2`);
        const genCell = worksheet.getCell('A2');
        genCell.value = `Generated: ${new Date().toLocaleString('en-IN')}`;
        genCell.font = { size: 9, italic: true, color: { argb: 'FF888888' } };
        genCell.alignment = { horizontal: 'right' };

        // Header row
        const headerRow = worksheet.addRow(columns);
        headerRow.eachCell((cell) => {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F3864' } };
            cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
            cell.border = {
                top: { style: 'thin', color: { argb: 'FF1F3864' } },
                bottom: { style: 'thin', color: { argb: 'FF1F3864' } },
                left: { style: 'thin', color: { argb: 'FF1F3864' } },
                right: { style: 'thin', color: { argb: 'FF1F3864' } },
            };
        });
        headerRow.height = 22;

        // Data rows
        data.forEach((row, i) => {
            const rowValues = columns.map((col) => {
                const key = Object.keys(row).find(k => k === col || k.toLowerCase() === col.toLowerCase().replace(/ /g, '_'));
                const val = key ? row[key] : null;
                return val !== null && val !== undefined ? val : '-';
            });
            const dataRow = worksheet.addRow(rowValues);
            dataRow.eachCell((cell, colNumber) => {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: i % 2 === 0 ? 'FFFFFFFF' : 'FFF2F6FC' } };
                cell.border = { bottom: { style: 'hair', color: { argb: 'FFCCCCCC' } }, right: { style: 'hair', color: { argb: 'FFCCCCCC' } } };
                cell.alignment = { vertical: 'middle' };
                if (typeof cell.value === 'number') {
                    const colName = columns[colNumber - 1];
                    const isAmount = colName.toLowerCase().includes('amount') || colName.toLowerCase().includes('total');
                    if (isAmount) {
                        cell.numFmt = '₹#,##0.00';
                        cell.alignment = { horizontal: 'right', vertical: 'middle' };
                    } else {
                        cell.numFmt = '#,##0';
                        cell.alignment = { horizontal: 'right', vertical: 'middle' };
                    }
                }
            });
        });

        // Totals row – exclude 'Total Credited' from summation
        const amountCols = columns
            .map((col, idx) => ({ col, idx }))
            .filter(({ col }) => {
                const lower = col.toLowerCase();
                // Do NOT sum 'total credited' (lifetime value)
                if (lower.includes('total credited')) return false;
                return lower.includes('amount') || lower.includes('total');
            });

        if (amountCols.length > 0) {
            const totalsRow = worksheet.addRow(
                columns.map((col, idx) => {
                    if (idx === 0) return 'TOTAL';
                    const match = amountCols.find(a => a.idx === idx);
                    if (match) {
                        return data.reduce((sum, r) => {
                            const key = Object.keys(r).find(k => k === col || k.toLowerCase() === col.toLowerCase().replace(/ /g, '_'));
                            return sum + (Number(key ? r[key] : 0) || 0);
                        }, 0);
                    }
                    return '';
                })
            );
            totalsRow.eachCell((cell, colNum) => {
                cell.font = { bold: true, color: { argb: 'FF1F3864' } };
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E1F2' } };
                if (typeof cell.value === 'number') {
                    cell.numFmt = '₹#,##0.00';
                    cell.alignment = { horizontal: 'right', vertical: 'middle' };
                }
            });
        }

        // Auto-fit columns
        worksheet.columns.forEach((column) => {
            let max = 12;
            column.eachCell({ includeEmpty: true }, (cell) => {
                const len = cell.value ? String(cell.value).length : 0;
                if (len > max) max = len;
            });
            column.width = Math.min(max + 3, 35);
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${sheetName}_${from_date}_to_${to_date}.xlsx`);
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Error exporting to Excel:', error);
        return res.status(500).json({ success: false, message: 'Failed to export report' });
    }
};

// ─── Export to PDF ──────────────────────────────────────────────────────────
export const exportToPDF = async (req, res) => {
    try {
        const sessionUser = getSessionUser(req);
        if (!sessionUser) return res.status(401).json({ success: false, message: 'Unauthorized' });

        const { report_type, from_date, to_date, employee_id } = req.query;

        // Helper to build query + params (same as Excel)
        const buildQueryAndParams = (type) => {
            let query = '';
            let params = [from_date, to_date];

            switch (type) {
                case 'date_wise':
                    query = `
            SELECT 
              DATE_FORMAT(expense_date, '%d %b %Y') AS Date,
              COUNT(*) AS Expenses,
              SUM(amount) AS Amount,
              GROUP_CONCAT(DISTINCT payment_mode) AS 'Payment Modes'
            FROM expenses
            WHERE status = 'approved' AND expense_date BETWEEN ? AND ?
          `;
                    if (employee_id && isPrivilegedExpenseRole(sessionUser.role)) {
                        query += ` AND employee_id = ?`;
                        params.push(employee_id);
                    } else if (!isPrivilegedExpenseRole(sessionUser.role)) {
                        query += ` AND employee_id = ?`;
                        params.push(sessionUser.id);
                    }
                    query += ` GROUP BY DATE(expense_date) ORDER BY expense_date DESC`;
                    break;

                case 'employee_wise':
                    query = `
            SELECT
              u.name AS "Employee Name",
              COALESCE(SUM(e.amount), 0) AS "Total Expense",
              COUNT(*) AS "No. of Expenses",
              COALESCE(u.wallet_balance, 0) AS "Wallet Balance",
              COALESCE(u.total_credited, 0) AS "Total Credited"
            FROM expenses e
            INNER JOIN users u ON u.user_id = e.employee_id
            WHERE e.status = 'approved' AND e.expense_date BETWEEN ? AND ?
          `;
                    if (req.query.employee_id && isPrivilegedExpenseRole(sessionUser.role)) {
                        query += ` AND e.employee_id = ?`;
                        params.push(req.query.employee_id);
                    } else if (!isPrivilegedExpenseRole(sessionUser.role)) {
                        query += ` AND e.employee_id = ?`;
                        params.push(sessionUser.id);
                    }
                    query += ` GROUP BY e.employee_id, u.name, u.wallet_balance, u.total_credited ORDER BY SUM(e.amount) DESC`;
                    break;

                case 'project_wise':
                    query = `
            SELECT
              COALESCE(rd.name, 'No Project') AS Project,
              MAX(q.total_price) AS Budget,
              COALESCE((
                SELECT SUM(amount) FROM expenses e2
                WHERE e2.project_master_id = e.project_master_id AND e2.status = 'approved'
                ${!isPrivilegedExpenseRole(sessionUser.role) ? 'AND e2.employee_id = ?' : ''}
              ), 0) AS "Total Expense (Overall)",
              SUM(e.amount) AS "Expense (Date Range)",
              COUNT(*) AS "No. of Expenses"
            FROM expenses e
            LEFT JOIN raw_data rd ON rd.master_id = e.project_master_id
            LEFT JOIN quotation q ON q.master_id = rd.master_id
            WHERE e.status = 'approved' AND e.expense_date BETWEEN ? AND ?
            ${req.query.project_id ? 'AND e.project_master_id = ?' : ''}
            ${!isPrivilegedExpenseRole(sessionUser.role) ? 'AND e.employee_id = ?' : ''}
            GROUP BY e.project_master_id, rd.name
            ORDER BY SUM(e.amount) DESC
          `;
                    if (req.query.project_id) params.push(req.query.project_id);
                    if (!isPrivilegedExpenseRole(sessionUser.role)) params.push(sessionUser.id);
                    break;

                case 'category_wise':
                    query = `
            SELECT
              COALESCE(category, 'Uncategorized') AS Category,
              COUNT(*) AS Expenses,
              SUM(amount) AS Amount,
              AVG(amount) AS "Avg Amount"
            FROM expenses
            WHERE status = 'approved' AND expense_date BETWEEN ? AND ?
            ${req.query.category_id ? 'AND category_id = ?' : ''}
            ${!isPrivilegedExpenseRole(sessionUser.role) ? 'AND employee_id = ?' : ''}
            GROUP BY category_id, category ORDER BY SUM(amount) DESC
          `;
                    if (req.query.category_id) params.push(req.query.category_id);
                    if (!isPrivilegedExpenseRole(sessionUser.role)) params.push(sessionUser.id);
                    break;

                case 'vendor_wise':
                    query = `
            SELECT
              COALESCE(e.vendor_name, v.company_name, 'Other') AS Vendor,
              COUNT(*) AS Transactions,
              SUM(e.amount) AS Amount,
              AVG(e.amount) AS "Avg Amount"
            FROM expenses e
            LEFT JOIN vendors v ON v.vendor_id = e.vendor_id
            WHERE e.status = 'approved' AND e.expense_date BETWEEN ? AND ?
              AND (e.vendor_name IS NOT NULL OR v.company_name IS NOT NULL)
            ${req.query.vendor_id ? 'AND e.vendor_id = ?' : ''}
            ${!isPrivilegedExpenseRole(sessionUser.role) ? 'AND e.employee_id = ?' : ''}
            GROUP BY e.vendor_id, e.vendor_name ORDER BY SUM(e.amount) DESC LIMIT 50
          `;
                    if (req.query.vendor_id) params.push(req.query.vendor_id);
                    if (!isPrivilegedExpenseRole(sessionUser.role)) params.push(sessionUser.id);
                    break;

                case 'payment_mode':
                    query = `
            SELECT
              COALESCE(payment_mode, 'Unknown') AS "Payment Mode",
              COUNT(*) AS Transactions,
              SUM(amount) AS Amount,
              AVG(amount) AS "Avg Amount"
            FROM expenses
            WHERE status = 'approved' AND expense_date BETWEEN ? AND ?
              AND payment_mode IS NOT NULL
            ${!isPrivilegedExpenseRole(sessionUser.role) ? 'AND employee_id = ?' : ''}
            GROUP BY payment_mode ORDER BY SUM(amount) DESC
          `;
                    if (!isPrivilegedExpenseRole(sessionUser.role)) params.push(sessionUser.id);
                    break;

                default:
                    query = `
            SELECT
              DATE(expense_date) AS Date,
              bill_number AS "Bill No",
              COALESCE(category, '-') AS Category,
              amount AS Amount,
              COALESCE(payment_mode, '-') AS "Payment Mode",
              COALESCE(description, '-') AS Description
            FROM expenses
            WHERE status = 'approved' AND expense_date BETWEEN ? AND ?
            ${!isPrivilegedExpenseRole(sessionUser.role) ? 'AND employee_id = ?' : ''}
            ORDER BY expense_date DESC LIMIT 1000
          `;
                    if (!isPrivilegedExpenseRole(sessionUser.role)) params.push(sessionUser.id);
                    break;
            }
            return { query, params };
        };

        const { query, params } = buildQueryAndParams(report_type);
        const [data] = await db.query(query, params);

        // For date_wise, add Start/End Date columns (but better to show in header)
        let finalData = data;
        let title = '';
        if (report_type === 'date_wise') {
            title = 'Date Wise Expense Report';
            const startFormatted = new Date(from_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
            const endFormatted = new Date(to_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
            finalData = data.map(row => ({ ...row, 'Start Date': startFormatted, 'End Date': endFormatted }));
        } else {
            title = REPORT_MAP[report_type]?.title || 'Expense Details Report';
        }

        generatePDF(finalData, title, from_date, to_date, res);
    } catch (error) {
        console.error('Error exporting to PDF:', error);
        return res.status(500).json({ success: false, message: 'Failed to export PDF' });
    }
};


// Helper function to generate PDF (avoids code duplication)
function generatePDF(data, title, from_date, to_date, res) {
    const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${title.replace(/ /g, '_')}_${from_date}_to_${to_date}.pdf`);
    doc.pipe(res);

    let pageNumber = 1;
    let totalPages = 1; // Will be updated after rendering all pages (simplified: assume single page for now)
    // Actually we can't know total pages in advance easily; we'll just show current page number.

    // Header
    const drawHeader = () => {
        doc.rect(0, 0, doc.page.width, 70).fill('#1F3864');
        doc.fill('#FFFFFF').fontSize(18).font('Helvetica-Bold')
            .text(title, 40, 18, { align: 'center' });
        doc.fontSize(9).font('Helvetica')
            .text(`Period: ${from_date} to ${to_date}   |   Generated: ${new Date().toLocaleString('en-IN')}`, 40, 46, { align: 'center' });
        doc.fill('#000000');
        doc.moveDown(3.5);
    };
    drawHeader();

    if (!data.length) {
        doc.fontSize(12).text('No records found for selected filters.', { align: 'center' });
        doc.end();
        return;
    }

    const cols = Object.keys(data[0]);
    const pageW = doc.page.width - 80;
    const colW = pageW / cols.length;
    let y = doc.y + 10;

    const drawTableHeader = (yPos) => {
        doc.rect(40, yPos, pageW, 18).fill('#1F3864');
        cols.forEach((col, i) => {
            doc.fill('#FFFFFF').fontSize(8).font('Helvetica-Bold')
                .text(col.replace(/_/g, ' ').toUpperCase(), 40 + i * colW, yPos + 4, {
                    width: colW - 4, align: 'center', lineBreak: false,
                });
        });
        return yPos + 18;
    };

    y = drawTableHeader(y);

    // Identify which columns are numeric amounts (to right‑align and sum)
    const numericCols = cols.map((col, idx) => {
        const lower = col.toLowerCase();
        const isAmount = lower.includes('amount') || lower.includes('total');
        // Exclude 'Total Credited' from summation
        const excludeFromSum = lower.includes('total credited');
        return { idx, isAmount, excludeFromSum };
    });

    // Sum totals for numeric columns (excluding Total Credited)
    const totals = numericCols.map(({ idx, isAmount, excludeFromSum }) => {
        if (!isAmount || excludeFromSum) return 0;
        return data.reduce((sum, row) => sum + (Number(row[cols[idx]]) || 0), 0);
    });

    data.forEach((row, rowIdx) => {
        if (y > doc.page.height - 60) {
            doc.addPage();
            pageNumber++;
            drawHeader(); // redraw header on new page
            y = 40;
            y = drawTableHeader(y);
        }

        const bg = rowIdx % 2 === 0 ? '#FFFFFF' : '#F2F6FC';
        doc.rect(40, y, pageW, 16).fill(bg);

        cols.forEach((col, colIdx) => {
            const val = row[col];
            const isNumeric = numericCols[colIdx]?.isAmount || false;
            const display = isNumeric && typeof val === 'number' ? `₹${val.toLocaleString('en-IN')}` : (val !== null && val !== undefined ? String(val) : '-');
            doc.fill('#222222').fontSize(7.5).font('Helvetica')
                .text(display, 42 + colIdx * colW, y + 4, {
                    width: colW - 4,
                    align: isNumeric ? 'right' : 'left',
                    lineBreak: false,
                });
        });

        doc.moveTo(40, y + 16).lineTo(40 + pageW, y + 16).strokeColor('#CCCCCC').lineWidth(0.3).stroke();
        y += 16;
    });

    // Totals row
    const hasTotals = numericCols.some(({ isAmount, excludeFromSum }) => isAmount && !excludeFromSum);
    if (hasTotals) {
        doc.rect(40, y, pageW, 20).fill('#D9E1F2');
        doc.fill('#1F3864').fontSize(9).font('Helvetica-Bold')
            .text('TOTAL', 42, y + 5, { width: colW - 4, lineBreak: false });
        cols.forEach((col, idx) => {
            const total = totals[idx];
            if (total !== 0 && numericCols[idx]?.isAmount && !numericCols[idx]?.excludeFromSum) {
                doc.fill('#1F3864').fontSize(9).font('Helvetica-Bold')
                    .text(`₹${total.toLocaleString('en-IN')}`, 42 + idx * colW, y + 5, {
                        width: colW - 4, align: 'right', lineBreak: false,
                    });
            }
        });
        y += 20;
    }

    // Footer
    const footerY = doc.page.height - 30;
    doc.fill('#888888').fontSize(7)
        .text(`Expense Reports System | Page ${pageNumber} | Generated: ${new Date().toLocaleString('en-IN')} | Total Records: ${data.length}`,
            40, footerY, { align: 'center', width: pageW });

    doc.end();
}
// ─── Dashboard Summary ───────────────────────────────────────────────────────
export const getDashboardSummary = async (req, res) => {
    try {
        const sessionUser = getSessionUser(req);
        if (!sessionUser) return res.status(401).json({ success: false, message: 'Unauthorized' });

        const { period = 'month' } = req.query;
        const employeeFilter = isPrivilegedExpenseRole(sessionUser.role)
            ? ''
            : ` AND employee_id = ${db.escape(sessionUser.id)}`;

        const periodMap = {
            week: { cond: "expense_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)", group: "DATE(expense_date)", limit: 7 },
            month: { cond: "expense_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)", group: "DATE(expense_date)", limit: 30 },
            year: { cond: "expense_date >= DATE_SUB(CURDATE(), INTERVAL 365 DAY)", group: "DATE_FORMAT(expense_date,'%Y-%m')", limit: 12 },
        };
        const { cond, group, limit } = periodMap[period] || periodMap.month;

        const [totals] = await db.query(`
            SELECT
                COUNT(*)                      AS total_transactions,
                COALESCE(SUM(amount), 0)      AS total_amount,
                COALESCE(AVG(amount), 0)      AS average_amount,
                COALESCE(MIN(amount), 0)      AS min_amount,
                COALESCE(MAX(amount), 0)      AS max_amount,
                COUNT(DISTINCT employee_id)   AS unique_employees
            FROM expenses
            WHERE status = 'approved' AND ${cond}${employeeFilter}
        `);

        const [topCategories] = await db.query(`
            SELECT
                COALESCE(category, 'Uncategorized')   AS category,
                COALESCE(SUM(amount), 0)              AS amount,
                COUNT(*)                              AS count
            FROM expenses
            WHERE status = 'approved' AND ${cond}${employeeFilter}
            GROUP BY category
            ORDER BY amount DESC
            LIMIT 5
        `);

        const [trend] = await db.query(`
            SELECT
                ${group}                              AS date_label,
                COALESCE(SUM(amount), 0)              AS amount,
                COUNT(*)                              AS count
            FROM expenses
            WHERE status = 'approved' AND ${cond}${employeeFilter}
            GROUP BY date_label
            ORDER BY date_label DESC
            LIMIT ${limit}
        `);

        const [paymentBreakdown] = await db.query(`
            SELECT
                COALESCE(payment_mode, 'Unknown')     AS payment_mode,
                COALESCE(SUM(amount), 0)              AS total_amount,
                COUNT(*)                              AS count
            FROM expenses
            WHERE status = 'approved' AND ${cond}${employeeFilter}
                AND payment_mode IS NOT NULL
            GROUP BY payment_mode
            ORDER BY total_amount DESC
        `);

        const [recent] = await db.query(`
            SELECT
                e.expense_id,
                DATE(e.expense_date)                  AS date,
                e.amount,
                COALESCE(e.category, '-')             AS category,
                COALESCE(e.bill_number, '-')          AS bill_number,
                COALESCE(u.name, '-')                 AS employee_name
            FROM expenses e
            LEFT JOIN users u ON u.user_id = e.employee_id
            WHERE e.status = 'approved'${employeeFilter.replace('employee_id', 'e.employee_id')}
            ORDER BY e.expense_date DESC
            LIMIT 10
        `);

        return res.status(200).json({
            success: true,
            data: {
                totals: totals[0],
                top_categories: topCategories,
                trend: trend.reverse(),
                payment_breakdown: paymentBreakdown,
                recent_expenses: recent,
                period,
            },
        });
    } catch (error) {
        console.error('Error fetching dashboard summary:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch dashboard data' });
    }
};