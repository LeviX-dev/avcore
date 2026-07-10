import db from '../database/db.js';

/**
 * Get Lead Wise Report with filters and pagination
 * GET /api/lead-wise-report
 */
export const getLeadWiseReport = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { role, id: userId } = req.session.user;

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    // Filters
    const {
      fromDate,
      toDate,
      search,
      city,
      stage,
      assigned_to,
      lead_status
    } = req.query;

    // Build WHERE clause
    const whereConditions = [];
    const params = [];

    // Date filters
    if (fromDate) {
      whereConditions.push('DATE(rd.assign_date) >= ?');
      params.push(fromDate);
    }
    if (toDate) {
      whereConditions.push('DATE(rd.assign_date) <= ?');
      params.push(toDate);
    }

    // Search filter (name, phone, email)
    if (search) {
      whereConditions.push(`(
        rd.name LIKE ? OR 
        rd.number LIKE ? OR 
        rd.email LIKE ?
      )`);
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    if (city) {
      whereConditions.push('rd.city = ?');
      params.push(city);
    }

    if (stage) {
      whereConditions.push('rd.lead_stage = ?');
      params.push(stage);
    }

    if (assigned_to) {
      whereConditions.push('lr.assignedTo = ?');
      params.push(assigned_to);
    }

    if (lead_status) {
      whereConditions.push('rd.lead_status = ?');
      params.push(lead_status);
    }

    // Role-based filtering
    const isTelecallerLike = (role) => {
      const telecallerRoles = [
        'tele_caller', 'digital_marketing', 'field_marketing_executive',
        'tech_sale_sound_engineer', 'junior_autocad_designer',
        'senior_autocad_designer', 'av_engineer', 'acoustic_engineer',
        'acoustic_designer', 'hr_executive', 'project_manager',
        'carpenter', 'accountant'
      ];
      return telecallerRoles.includes(role);
    };

    const isAdminLike = (role) => ['admin', 'sub_admin'].includes(role);
    const isManagementLike = (role) => ['technical_head'].includes(role);

    if (isTelecallerLike(role)) {
      whereConditions.push('lr.assignedTo = (SELECT name FROM users WHERE user_id = ?)');
      params.push(userId);
    } else if (!isAdminLike(role) && !isManagementLike(role)) {
      whereConditions.push('lr.assignedTo = (SELECT name FROM users WHERE user_id = ?)');
      params.push(userId);
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    // Get current user's name for assignment filter
    const [userResult] = await db.query(
      'SELECT name FROM users WHERE user_id = ?',
      [userId]
    );
    const currentUserName = userResult[0]?.name || '';

    // COUNT query
    const countQuery = `
      SELECT COUNT(DISTINCT rd.master_id) as total
      FROM raw_data rd
      LEFT JOIN (
        SELECT r1.*, ROW_NUMBER() OVER (PARTITION BY master_id ORDER BY id DESC) rn
        FROM reassignment r1
      ) lr ON rd.master_id = lr.master_id AND lr.rn = 1
      ${whereClause}
    `;

    const [countResult] = await db.query(countQuery, params);
    const total = countResult[0]?.total || 0;

    // MAIN DATA QUERY
    const dataQuery = `
      SELECT 
        rd.master_id,
        rd.name,
        rd.number,
        rd.email,
        rd.city,
        rd.area_id,
        rd.cat_id,
        rd.reference_id,
        rd.lead_stage,
        rd.lead_status,
        rd.status,
        rd.assign_date,
        rd.followup_date,
        rd.created_at,
        rd.quick_remark,
        rd.detailed_remark,
        rd.lead_activity,
        COALESCE(lr.assignedTo, rd.assigned_to) as assigned_to,
        lr.reassignment_date as latest_reassignment_date,
        lr.assignedTo as latest_assigned_to,
        a.area_name,
        c.cat_name,
        r.reference_name,
        (
          SELECT COUNT(*) FROM documents d WHERE d.master_id = rd.master_id
        ) as document_count
      FROM raw_data rd
      LEFT JOIN area a ON rd.area_id = a.area_id
      LEFT JOIN category c ON rd.cat_id = c.cat_id
      LEFT JOIN reference r ON rd.reference_id = r.reference_id
      LEFT JOIN (
        SELECT r1.*, ROW_NUMBER() OVER (PARTITION BY master_id ORDER BY id DESC) rn
        FROM reassignment r1
      ) lr ON rd.master_id = lr.master_id AND lr.rn = 1
      ${whereClause}
      GROUP BY rd.master_id
      ORDER BY rd.master_id DESC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await db.query(dataQuery, [...params, limit, offset]);

    res.json({
      success: true,
      data: rows,
      total: total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error('❌ getLeadWiseReport error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lead report',
      error: error.message
    });
  }
};

/**
 * Get Lead Wise Report Summary
 * GET /api/lead-wise-report/summary
 */
export const getLeadWiseReportSummary = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { role, id: userId } = req.session.user;

    const {
      fromDate,
      toDate,
      city,
      stage,
      assigned_to,
      lead_status
    } = req.query;

    // Build WHERE clause (same as main query)
    const whereConditions = [];
    const params = [];

    if (fromDate) {
      whereConditions.push('DATE(rd.assign_date) >= ?');
      params.push(fromDate);
    }
    if (toDate) {
      whereConditions.push('DATE(rd.assign_date) <= ?');
      params.push(toDate);
    }
    if (city) {
      whereConditions.push('rd.city = ?');
      params.push(city);
    }
    if (stage) {
      whereConditions.push('rd.lead_stage = ?');
      params.push(stage);
    }
    if (assigned_to) {
      whereConditions.push('lr.assignedTo = ?');
      params.push(assigned_to);
    }
    if (lead_status) {
      whereConditions.push('rd.lead_status = ?');
      params.push(lead_status);
    }

    // Role-based filtering
    const isTelecallerLike = (role) => {
      const telecallerRoles = [
        'tele_caller', 'digital_marketing', 'field_marketing_executive',
        'tech_sale_sound_engineer', 'junior_autocad_designer',
        'senior_autocad_designer', 'av_engineer', 'acoustic_engineer',
        'acoustic_designer', 'hr_executive', 'project_manager',
        'carpenter', 'accountant'
      ];
      return telecallerRoles.includes(role);
    };

    const isAdminLike = (role) => ['admin', 'sub_admin'].includes(role);
    const isManagementLike = (role) => ['technical_head'].includes(role);

    if (isTelecallerLike(role)) {
      whereConditions.push('lr.assignedTo = (SELECT name FROM users WHERE user_id = ?)');
      params.push(userId);
    } else if (!isAdminLike(role) && !isManagementLike(role)) {
      whereConditions.push('lr.assignedTo = (SELECT name FROM users WHERE user_id = ?)');
      params.push(userId);
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    // SUMMARY QUERY
    const summaryQuery = `
      SELECT 
        COUNT(DISTINCT rd.master_id) as total_leads,
        COUNT(DISTINCT CASE WHEN rd.lead_status = 'Active' THEN rd.master_id END) as active_leads,
        COUNT(DISTINCT CASE WHEN rd.lead_status = 'Inactive' THEN rd.master_id END) as inactive_leads,
        COUNT(DISTINCT CASE 
          WHEN lr.assignedTo IS NOT NULL OR rd.assign_id IS NOT NULL 
          THEN rd.master_id END) as assigned_leads,
        JSON_OBJECTAGG(
          COALESCE(rd.lead_stage, 'Unknown'),
          COUNT(DISTINCT rd.master_id)
        ) as stage_breakdown,
        JSON_OBJECTAGG(
          COALESCE(c.cat_name, 'Unknown'),
          COUNT(DISTINCT rd.master_id)
        ) as category_breakdown,
        JSON_OBJECTAGG(
          COALESCE(a.area_name, 'Unknown'),
          COUNT(DISTINCT rd.master_id)
        ) as area_breakdown
      FROM raw_data rd
      LEFT JOIN area a ON rd.area_id = a.area_id
      LEFT JOIN category c ON rd.cat_id = c.cat_id
      LEFT JOIN (
        SELECT r1.*, ROW_NUMBER() OVER (PARTITION BY master_id ORDER BY id DESC) rn
        FROM reassignment r1
      ) lr ON rd.master_id = lr.master_id AND lr.rn = 1
      ${whereClause}
    `;

    const [summaryResult] = await db.query(summaryQuery, params);

    res.json({
      success: true,
      summary: summaryResult[0] || {
        total_leads: 0,
        active_leads: 0,
        inactive_leads: 0,
        assigned_leads: 0,
        stage_breakdown: {},
        category_breakdown: {},
        area_breakdown: {}
      }
    });

  } catch (error) {
    console.error('❌ getLeadWiseReportSummary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch summary',
      error: error.message
    });
  }
};
