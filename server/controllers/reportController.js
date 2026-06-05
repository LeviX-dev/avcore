 import db from '../database/db.js';
 
 const TELECALLER_ROLES = [
  'tele_caller',
  'digital_marketing',
  'field_marketing_executive',
  'tech_sale_sound_engineer',
  'junior_autocad_designer',
  'senior_autocad_designer',
  'technical_head',
    'av_engineer',
  'acoustic_engineer',
  'acoustic_designer',
   'hr_executive',
     'project_manager',
     'carpenter',
      'accountant'
];

const ADMIN_ROLES = ['admin', 'sub_admin'];
const MANAGEMENT_ROLES = ['technical_head']; // if needed

const isTelecallerLike = (role) => TELECALLER_ROLES.includes(role);
const isAdminLike = (role) => ADMIN_ROLES.includes(role);
const isManagementLike = (role) => MANAGEMENT_ROLES.includes(role);



 export const getAssignedTeleCallerData = async (req, res) => {
  try {
    const query = `
      SELECT 
        a.assign_id,
        a.assign_date,
        rd.master_id,  
        rd.name AS client_name,
        c.cat_name AS category_name,
        p.product_name AS product_name,
        rd.status AS call_status,
        rd.lead_status,
        u.name AS caller_name
      FROM assignments a
      JOIN raw_data rd ON rd.assign_id = a.assign_id
      LEFT JOIN category c ON rd.cat_id = c.cat_id
      LEFT JOIN tele_caller_table tcd ON rd.master_id = tcd.master_id
      LEFT JOIN product p ON tcd.product_id = p.product_id
      LEFT JOIN users u ON a.assigned_to_user_id = u.user_id
      WHERE rd.lead_status ='Active'
      ORDER BY a.assign_date DESC
    `;

    const [data] = await db.query(query);

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error(' Error fetching assigned telecaller data:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};


export const getReportDataByMasterId = async (req, res) => {
  const { master_id } = req.params;

  try {
    const [rows] = await db.execute(
      'SELECT tc_call_duration, tc_remark FROM tele_caller_table WHERE master_id = ?',
      [master_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No report found for this master_id' });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Error fetching tele_caller data:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// PERFOERMANCE COUNT REPORT START FROM HERE 


export const getAssignedLeads = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { assigned_to, search, city, stage, reference } = req.query;

    let query = `
      SELECT
        rd.master_id,
        rd.name AS client_name,
        rd.number,
        rd.city,
        rd.lead_stage,
        c.cat_name AS category,
        ref.reference_name,
        re.assignedTo AS assigned_to,
        u.name AS assigned_by,
        re.created_at

      FROM raw_data rd

      JOIN (
        SELECT master_id, MAX(id) AS latest_id
        FROM reassignment
        GROUP BY master_id
      ) latest ON rd.master_id = latest.master_id

      JOIN reassignment re ON re.id = latest.latest_id
      LEFT JOIN users u ON u.user_id = re.created_by_user
      LEFT JOIN category c ON c.cat_id = rd.cat_id
      LEFT JOIN reference ref ON ref.reference_id = rd.reference_id

      WHERE 1=1
    `;

    const params = [];

    if (assigned_to) {
      query += ` AND re.assignedTo = ?`;
      params.push(assigned_to);
    }

    if (search) {
      query += ` AND (rd.name LIKE ? OR rd.number LIKE ?)`;
      const s = `%${search}%`;
      params.push(s, s);
    }

    if (city) {
      query += ` AND rd.city = ?`;
      params.push(city);
    }

    if (stage) {
      query += ` AND rd.lead_stage = ?`;
      params.push(stage);
    }

    if (reference) {
      query += ` AND ref.reference_name = ?`;
      params.push(reference);
    }

    query += ` ORDER BY re.created_at DESC`;

    const [rows] = await db.query(query, params);

    res.json({
      success: true,
      data: rows
    });

  } catch (err) {
    console.error("❌ assigned leads error:", err);
    res.status(500).json({ success: false });
  }
};

export const getEmployeeAssignedSummary = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id, role } = req.session.user;

    const [userResult] = await db.query(
      "SELECT name FROM users WHERE user_id = ?",
      [id]
    );

    const currentUser = userResult[0]?.name;

    /* ================= OVERALL ================= */
    const [overallRows] = await db.query(`
      SELECT assignedTo AS employee, COUNT(DISTINCT master_id) AS overall
      FROM reassignment
      WHERE assignedTo IS NOT NULL
      GROUP BY assignedTo
    `);

    /* ================= CURRENT (LATEST ONLY - NO FILTER) ================= */
    const [currentRows] = await db.query(`
      SELECT re.assignedTo AS employee, COUNT(*) AS current
      FROM reassignment re
      JOIN (
        SELECT master_id, MAX(id) AS latest_id
        FROM reassignment
        GROUP BY master_id
      ) latest ON re.id = latest.latest_id
      GROUP BY re.assignedTo
    `);

    /* ================= MERGE ================= */
    const map = {};

    overallRows.forEach(r => {
      map[r.employee] = {
        employee: r.employee,
        overall: r.overall,
        current: 0
      };
    });

    currentRows.forEach(r => {
      if (!map[r.employee]) {
        map[r.employee] = {
          employee: r.employee,
          overall: 0,
          current: r.current
        };
      } else {
        map[r.employee].current = r.current;
      }
    });

    let result = Object.values(map);

    /* ================= ROLE FILTER ================= */
    if (!isAdminLike(role) && !isManagementLike(role)) {
      result = result.filter(r => r.employee === currentUser);
    }

    res.json({
      success: true,
      data: result
    });

  } catch (err) {
    console.error("❌ summary error:", err);
    res.status(500).json({ success: false });
  }
};

export const getOverallAssignedLeads = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { assigned_to, page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;

    /* ================= BASE WHERE ================= */
    let where = ` WHERE 1=1 `;
    const params = [];

    if (assigned_to) {
      where += ` AND re.assignedTo = ?`;
      params.push(assigned_to);
    }

    /* ================= COUNT QUERY (CORRECT) ================= */
    const countQuery = `
      SELECT COUNT(*) as total
      FROM reassignment re
      JOIN raw_data rd ON rd.master_id = re.master_id
      ${where}
    `;

    const [countRows] = await db.query(countQuery, params);
    const total = countRows[0]?.total || 0;

    /* ================= DATA QUERY ================= */
    const dataQuery = `
      SELECT
        rd.master_id,
        rd.name AS client_name,
        rd.number,
        rd.city,
        rd.lead_stage,
        c.cat_name AS category,
        ref.reference_name,
        re.assignedTo AS assigned_to,
        u.name AS assigned_by,
        re.created_at

      FROM reassignment re
      JOIN raw_data rd ON rd.master_id = re.master_id
      LEFT JOIN users u ON u.user_id = re.created_by_user
      LEFT JOIN category c ON c.cat_id = rd.cat_id
      LEFT JOIN reference ref ON ref.reference_id = rd.reference_id

      ${where}

      ORDER BY re.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const finalParams = [...params, parseInt(limit), parseInt(offset)];

    const [rows] = await db.query(dataQuery, finalParams);

    res.json({
      success: true,
      data: rows,
      total
    });

  } catch (err) {
    console.error("❌ overall leads error:", err);
    res.status(500).json({ success: false });
  }
};

export const getLeadsCount = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Unauthorized: No session" });
    }

    const { id: userId, role } = req.session.user;

    // Get current user's name for filtering
    const [userResult] = await db.query(
      "SELECT name FROM users WHERE user_id = ?",
      [userId]
    );
    const currentUserName = userResult[0]?.name || "";

    // Define stages
    const closedStages = ['Closed Deal', 'Execution', 'Pre Execution'];
    const dropStages = ['Drop', 'lost'];
    
    // All possible lead stages (for total leads)
    const allStages = [
      'Fresh Lead', 'Cold Lead', 'On Hold', 'Positive Lead', 
      'Pre Site Visit', 'Quotation Pending', 'Quotation Created', 
      'Quotation Follow-up', 'Post Site Visit', 'Demo', 
      'Projection List', 'Drop', 'Closed Deal', 'Execution', 
      'Pre Execution', 'lost'
    ];

    /* ================= 1. CLOSED LEADS COUNT ================= */
    let closedCountQuery = `
      SELECT COUNT(DISTINCT rd.master_id) as count
      FROM raw_data rd
      LEFT JOIN (
        SELECT r1.*, ROW_NUMBER() OVER (PARTITION BY master_id ORDER BY id DESC) rn
        FROM reassignment r1
      ) lr ON rd.master_id = lr.master_id AND lr.rn = 1
      WHERE (rd.lead_stage IN (${closedStages.map(() => '?').join(',')})
         OR lr.leadStage IN (${closedStages.map(() => '?').join(',')}))
    `;

    let closedParams = [...closedStages, ...closedStages];

    // Role-based filtering for closed leads
    if (!isAdminLike(role)) {
      closedCountQuery += ` AND lr.assignedTo = ?`;
      closedParams.push(currentUserName);
    }

    const [closedResult] = await db.query(closedCountQuery, closedParams);
    const closedCount = closedResult[0]?.count || 0;

    /* ================= 2. DROP LEADS COUNT ================= */
    let dropCountQuery = `
      SELECT COUNT(DISTINCT rd.master_id) as count
      FROM raw_data rd
      LEFT JOIN (
        SELECT r1.*, ROW_NUMBER() OVER (PARTITION BY master_id ORDER BY id DESC) rn
        FROM reassignment r1
      ) lr ON rd.master_id = lr.master_id AND lr.rn = 1
      WHERE (rd.lead_stage IN (${dropStages.map(() => '?').join(',')})
         OR lr.leadStage IN (${dropStages.map(() => '?').join(',')}))
    `;

    let dropParams = [...dropStages, ...dropStages];

    // Role-based filtering for drop leads
    if (!isAdminLike(role)) {
      dropCountQuery += ` AND lr.assignedTo = ?`;
      dropParams.push(currentUserName);
    }

    const [dropResult] = await db.query(dropCountQuery, dropParams);
    const dropCount = dropResult[0]?.count || 0;

    /* ================= 3. TOTAL LEADS COUNT ================= */
    let totalLeadsQuery = `
      SELECT COUNT(DISTINCT rd.master_id) as count
      FROM raw_data rd
      LEFT JOIN (
        SELECT r1.*, ROW_NUMBER() OVER (PARTITION BY master_id ORDER BY id DESC) rn
        FROM reassignment r1
      ) lr ON rd.master_id = lr.master_id AND lr.rn = 1
      WHERE rd.lead_stage IN (${allStages.map(() => '?').join(',')})
    `;

    let totalLeadsParams = [...allStages];

    // Role-based filtering for total leads
    if (!isAdminLike(role)) {
      totalLeadsQuery += ` AND lr.assignedTo = ?`;
      totalLeadsParams.push(currentUserName);
    }

    const [totalLeadsResult] = await db.query(totalLeadsQuery, totalLeadsParams);
    const totalLeadsCount = totalLeadsResult[0]?.count || 0;

    /* ================= 4. FRESH LEADS COUNT ================= */
    let freshLeadsQuery = `
      SELECT COUNT(DISTINCT rd.master_id) as count
      FROM raw_data rd
      LEFT JOIN (
        SELECT r1.*, ROW_NUMBER() OVER (PARTITION BY master_id ORDER BY id DESC) rn
        FROM reassignment r1
      ) lr ON rd.master_id = lr.master_id AND lr.rn = 1
      WHERE rd.lead_stage = 'Fresh Lead'
    `;

    let freshLeadsParams = [];

    // Role-based filtering for fresh leads
    if (!isAdminLike(role)) {
      freshLeadsQuery += ` AND lr.assignedTo = ?`;
      freshLeadsParams.push(currentUserName);
    }

    const [freshLeadsResult] = await db.query(freshLeadsQuery, freshLeadsParams);
    const freshLeadsCount = freshLeadsResult[0]?.count || 0;

    // Calculate total calling (total leads - fresh leads)
    const totalCallingCount = totalLeadsCount - freshLeadsCount;

    // Return only the 4 counts
    return res.status(200).json({
      success: true,
      counts: {
        closedLeads: closedCount,
        dropLeads: dropCount,
        totalCalling: totalCallingCount,
        totalLeads: totalLeadsCount
      }
    });

  } catch (error) {
    console.error("❌ Error in getLeadsCount:", error);
    res.status(500).json({ 
      message: "Failed to fetch leads count",
      error: error.message 
    });
  }
};







