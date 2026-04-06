import db from '../database/db.js';

// ROLE GROUPS
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
];

const ADMIN_ROLES = ['admin', 'sub_admin'];
const MANAGEMENT_ROLES = ['technical_head']; // if needed

const isTelecallerLike = (role) => TELECALLER_ROLES.includes(role);
const isAdminLike = (role) => ADMIN_ROLES.includes(role);
const isManagementLike = (role) => MANAGEMENT_ROLES.includes(role);

// export const getAssignedLeadCount = async (req, res) => {
//   try {
//     if (!req.session.user) {
//       return res.status(401).json({ message: "Unauthorized: No session" });
//     }

//     const { id: userId, role } = req.session.user;

//     // Get current user's name for filtering
//     const [userResult] = await db.query(
//       "SELECT name FROM users WHERE user_id = ?",
//       [userId]
//     );
//     const currentUserName = userResult[0]?.name || '';

//     // Get latest reassignments for all leads
//     const [latestReassignments] = await db.query(`
//       SELECT
//         master_id,
//         MAX(id) as latest_id
//       FROM reassignment
//       GROUP BY master_id
//     `);

//     const latestReassignmentIds = latestReassignments.map(r => r.latest_id);

//     let query = `
//       SELECT COUNT(DISTINCT rd.master_id) AS assigned_count
//       FROM raw_data rd
//       LEFT JOIN reassignment re ON rd.master_id = re.master_id
//       WHERE re.id IN (?)
//     `;

//     const params = [latestReassignmentIds];

//     // -------------------------------------
//     // ⭐ ROLE FILTERING (Consistent with other endpoints)
//     // -------------------------------------
//     if (isTelecallerLike(role)) {
//       query += ` AND re.assignedTo = ?`;
//       params.push(currentUserName);
//     }
//     else if (isAdminLike(role) || isManagementLike(role)) {
//       // Admin/Management see all assigned leads
//       query += ` AND rd.status IN ('Assigned', 'Not Interested')`;
//     }
//     else {
//       // Other roles → only leads assigned to them
//       query += ` AND re.assignedTo = ?`;
//       params.push(currentUserName);
//     }

//     const [rows] = await db.query(query, params);
//     res.status(200).json(rows[0] || { assigned_count: 0 });

//   } catch (error) {
//     console.error("❌ Error in getAssignedLeadCount:", error);
//     res.status(500).json({ message: "Failed to fetch assigned leads count" });
//   }
// };

export const getTotalLeadCount1 = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { id: userId, role } = req.session.user;

    // Get current user's name for filtering
    const [userResult] = await db.query(
      'SELECT name FROM users WHERE user_id = ?',
      [userId],
    );
    const currentUserName = userResult[0]?.name || '';

    // Get latest reassignments for all leads
    const [latestReassignments] = await db.query(`
      SELECT 
        master_id,
        MAX(id) as latest_id
      FROM reassignment
      GROUP BY master_id
    `);

    const latestReassignmentIds = latestReassignments.map((r) => r.latest_id);

    let query = `
      SELECT COUNT(DISTINCT rd.master_id) AS lead_count
      FROM raw_data rd
      LEFT JOIN reassignment re ON rd.master_id = re.master_id
      WHERE re.id IN (?)
    `;

    const params = [latestReassignmentIds];

    // ROLE FILTERING
    if (isTelecallerLike(role)) {
      query += ` AND re.assignedTo = ?`;
      params.push(currentUserName);
    } else if (isAdminLike(role) || isManagementLike(role)) {
      // Admin/Management see all
    } else {
      query += ` AND re.assignedTo = ?`;
      params.push(currentUserName);
    }

    const [rows] = await db.query(query, params);
    res.json(rows[0] || { lead_count: 0 });
  } catch (error) {
    console.error('Error fetching leads count:', error);
    res.status(500).json({ error: 'Failed to fetch leads count' });
  }
};

export const getTotalLeadsCount = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT COUNT(*) AS count
      FROM raw_data
    `);

    return res.status(200).json({
      success: true,
      count: rows[0].count,
    });
  } catch (error) {
    console.error('Error fetching total leads count:', error);
    return res.status(500).json({ success: false });
  }
};

export const getAssignedLeadCount = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: 'Unauthorized: No session' });
    }

    const { id: userId, role } = req.session.user;

    const [userResult] = await db.query(
      'SELECT name FROM users WHERE user_id = ?',
      [userId],
    );
    const currentUserName = userResult[0]?.name || '';

    const [latestReassignments] = await db.query(`
      SELECT master_id, MAX(id) as latest_id
      FROM reassignment
      GROUP BY master_id
    `);

    const latestReassignmentIds = latestReassignments.map((r) => r.latest_id);

    let query = `
      SELECT COUNT(DISTINCT rd.master_id) AS assigned_count
      FROM raw_data rd
      LEFT JOIN reassignment re ON rd.master_id = re.master_id
      WHERE re.id IN (?)
      AND rd.lead_stage NOT IN ('Drop', 'Closed Deal')
    `;

    const params = [latestReassignmentIds];

    if (isTelecallerLike(role)) {
      query += ` AND re.assignedTo = ?`;
      params.push(currentUserName);
    } else if (isAdminLike(role) || isManagementLike(role)) {
      query += ` AND rd.status IN ('Assigned', 'Not Interested')`;
    } else {
      query += ` AND re.assignedTo = ?`;
      params.push(currentUserName);
    }

    const [rows] = await db.query(query, params);
    res.status(200).json(rows[0] || { assigned_count: 0 });
  } catch (error) {
    console.error('❌ Error in getAssignedLeadCount:', error);
    res.status(500).json({ message: 'Failed to fetch assigned leads count' });
  }
};

export const getDashboardLeadCounts1 = async (req, res) => {
  try {
    // ===== TOTAL COUNT =====
    const [totalRows] = await db.query(`
      SELECT COUNT(*) AS total_count
      FROM raw_data
    `);

    // ===== DROP COUNT =====
    const [dropRows] = await db.execute(`
      SELECT COUNT(*) AS drop_count
      FROM raw_data
      WHERE lead_stage = 'Drop'
    `);

    // ===== CLOSED COUNT =====
    const [closedRows] = await db.execute(`
      SELECT COUNT(DISTINCT master_id) AS closed_count
      FROM raw_data
      WHERE lead_stage = 'Closed Deal'
    `);

    // ===== PROJECTION COUNT =====
    const [projectionRows] = await db.execute(`
      SELECT COUNT(DISTINCT master_id) AS projection_count
      FROM raw_data
      WHERE lead_stage = 'Projection List'
    `);

    // ===== QUOTATION PENDING COUNT =====
    const [quotationRows] = await db.execute(`
      SELECT COUNT(*) AS quotation_pending_count
      FROM raw_data
      WHERE lead_stage = 'Quotation Pending'
    `);

    if (!req.session.user) {
      return res.status(401).json({ message: 'Unauthorized: No session' });
    }

    const { id: userId, role } = req.session.user;

    const [userResult] = await db.query(
      'SELECT name FROM users WHERE user_id = ?',
      [userId],
    );
    const currentUserName = userResult[0]?.name || '';

    // ===== LATEST REASSIGNMENTS =====
    const [latestReassignments] = await db.query(`
      SELECT master_id, MAX(id) as latest_id
      FROM reassignment
      GROUP BY master_id
    `);

    const latestReassignmentIds = latestReassignments.map((r) => r.latest_id);
    const today = new Date().toISOString().slice(0, 10);

    // ================= ASSIGNED =================
    let assignedQuery = `
      SELECT COUNT(DISTINCT rd.master_id) AS assigned_count
      FROM raw_data rd
      LEFT JOIN reassignment re ON rd.master_id = re.master_id
      WHERE re.id IN (?)
      AND rd.lead_stage NOT IN ('Drop', 'Closed Deal')
    `;

    const assignedParams = [latestReassignmentIds];

    if (isTelecallerLike(role)) {
      assignedQuery += ` AND re.assignedTo = ?`;
      assignedParams.push(currentUserName);
    } else if (isAdminLike(role) || isManagementLike(role)) {
      assignedQuery += ` AND rd.status IN ('Assigned', 'Not Interested')`;
    } else {
      assignedQuery += ` AND re.assignedTo = ?`;
      assignedParams.push(currentUserName);
    }

    const [assignedRows] = await db.query(assignedQuery, assignedParams);
    const assignedCount = assignedRows[0]?.assigned_count || 0;

    // ================= TODAY + MISSED =================
    let tmQuery = `
      SELECT 
        COUNT(DISTINCT CASE 
          WHEN (rd.followup_date = CURDATE() OR DATE(re.reassignment_date) = CURDATE()) 
          THEN rd.master_id 
        END) AS today_count,
        
        COUNT(DISTINCT CASE 
          WHEN rd.followup_date < ? 
          THEN rd.master_id 
        END) AS missed_count
        
      FROM raw_data rd
      LEFT JOIN reassignment re ON rd.master_id = re.master_id
      WHERE re.id IN (?)
      AND rd.lead_stage NOT IN ('Drop', 'Closed Deal')
    `;

    const tmParams = [today, latestReassignmentIds];

    if (isTelecallerLike(role)) {
      tmQuery += ` AND re.assignedTo = ?`;
      tmParams.push(currentUserName);
    } else if (!isAdminLike(role) && !isManagementLike(role)) {
      tmQuery += ` AND re.assignedTo = ?`;
      tmParams.push(currentUserName);
    }

    const [tmRows] = await db.query(tmQuery, tmParams);
    const todayCount = tmRows[0]?.today_count || 0;
    const missedCount = tmRows[0]?.missed_count || 0;

    // ================= UPCOMING =================
    let upcomingQuery = `
      SELECT COUNT(DISTINCT rd.master_id) AS total_count
      FROM raw_data rd
      LEFT JOIN reassignment re ON rd.master_id = re.master_id
      WHERE re.id IN (?)
      AND rd.lead_stage NOT IN ('Drop','Closed Deal')
      AND (rd.followup_date > CURDATE() OR DATE(re.reassignment_date) > CURDATE())
    `;

    const upcomingParams = [latestReassignmentIds];

    if (isTelecallerLike(role)) {
      upcomingQuery += ` AND re.assignedTo = ?`;
      upcomingParams.push(currentUserName);
    }

    const [upcomingRows] = await db.query(upcomingQuery, upcomingParams);
    const upcomingCount = upcomingRows[0]?.total_count || 0;

    // ===== FINAL RESPONSE =====
    return res.status(200).json({
      success: true,
      total: totalRows[0]?.total_count || 0,
      drop: dropRows[0]?.drop_count || 0,
      closed: closedRows[0]?.closed_count || 0,
      projection: projectionRows[0]?.projection_count || 0,
      quotation_pending: quotationRows[0]?.quotation_pending_count || 0,
      assigned: assignedCount,
      today: todayCount,
      missed: missedCount,
      upcoming: upcomingCount,
      today_missed_total: todayCount + missedCount,
    });
  } catch (error) {
    console.error('❌ Error in getDashboardLeadCounts:', error);
    return res.status(500).json({ success: false });
  }
};

export const getDashboardLeadCounts = async (req, res) => {
  try {
    // ===== TOTAL COUNT =====
    const [totalRows] = await db.query(`
      SELECT COUNT(*) AS total_count
      FROM raw_data
    `);

    // ===== DROP COUNT =====
    const [dropRows] = await db.execute(`
  SELECT COUNT(*) AS drop_count
  FROM raw_data
  WHERE lead_stage IN ('Drop', 'loss')
`);

    // ===== CLOSED COUNT (NOW INCLUDES Closed Deal, Execution, Pre Execution) =====
    const closedStages = ['Closed Deal', 'Execution', 'Pre Execution'];
    const [closedRows] = await db.execute(
      `
      SELECT COUNT(DISTINCT master_id) AS closed_count
      FROM raw_data
      WHERE lead_stage IN (?, ?, ?)
    `,
      closedStages,
    );

    // ===== PROJECTION COUNT =====
    const [projectionRows] = await db.execute(`
      SELECT COUNT(DISTINCT master_id) AS projection_count
      FROM raw_data
      WHERE lead_stage = 'Projection List'
    `);

    // ===== QUOTATION PENDING COUNT =====
    const [quotationRows] = await db.execute(`
      SELECT COUNT(*) AS quotation_pending_count
      FROM raw_data
      WHERE lead_stage = 'Quotation Pending'
    `);

    // ===== QUOTATION FOLLOW-UP COUNT =====
const [quotationFollowupRows] = await db.execute(`
  SELECT COUNT(*) AS quotation_followup_count
  FROM raw_data
  WHERE lead_stage = 'Quotation Follow-up'
`);

    if (!req.session.user) {
      return res.status(401).json({ message: 'Unauthorized: No session' });
    }

    const { id: userId, role } = req.session.user;

    const [userResult] = await db.query(
      'SELECT name FROM users WHERE user_id = ?',
      [userId],
    );
    const currentUserName = userResult[0]?.name || '';

    // ===== LATEST REASSIGNMENTS =====
    const [latestReassignments] = await db.query(`
      SELECT master_id, MAX(id) as latest_id
      FROM reassignment
      GROUP BY master_id
    `);

    const latestReassignmentIds = latestReassignments.map((r) => r.latest_id);
    const today = new Date().toISOString().slice(0, 10);

    // ================= ASSIGNED =================
    let assignedQuery = `
      SELECT COUNT(DISTINCT rd.master_id) AS assigned_count
      FROM raw_data rd
      LEFT JOIN reassignment re ON rd.master_id = re.master_id
      WHERE re.id IN (?)
      AND rd.lead_stage NOT IN ('Drop', ?, ?, ?)
    `;

    const assignedParams = [latestReassignmentIds, ...closedStages];

    if (isTelecallerLike(role)) {
      assignedQuery += ` AND re.assignedTo = ?`;
      assignedParams.push(currentUserName);
    } else if (isAdminLike(role) || isManagementLike(role)) {
      assignedQuery += ` AND rd.status IN ('Assigned', 'Not Interested')`;
    } else {
      assignedQuery += ` AND re.assignedTo = ?`;
      assignedParams.push(currentUserName);
    }

    const [assignedRows] = await db.query(assignedQuery, assignedParams);
    const assignedCount = assignedRows[0]?.assigned_count || 0;

    // ================= TODAY + MISSED =================
    let tmQuery = `
      SELECT 
        COUNT(DISTINCT CASE 
          WHEN (rd.followup_date = CURDATE() OR DATE(re.reassignment_date) = CURDATE()) 
          THEN rd.master_id 
        END) AS today_count,
        
        COUNT(DISTINCT CASE 
          WHEN rd.followup_date < ? 
          THEN rd.master_id 
        END) AS missed_count
        
      FROM raw_data rd
      LEFT JOIN reassignment re ON rd.master_id = re.master_id
      WHERE re.id IN (?)
      AND rd.lead_stage NOT IN ('Drop', ?, ?, ?)
    `;

    const tmParams = [today, latestReassignmentIds, ...closedStages];

    if (isTelecallerLike(role)) {
      tmQuery += ` AND re.assignedTo = ?`;
      tmParams.push(currentUserName);
    } else if (!isAdminLike(role) && !isManagementLike(role)) {
      tmQuery += ` AND re.assignedTo = ?`;
      tmParams.push(currentUserName);
    }

    const [tmRows] = await db.query(tmQuery, tmParams);
    const todayCount = tmRows[0]?.today_count || 0;
    const missedCount = tmRows[0]?.missed_count || 0;

    // ================= UPCOMING =================
    let upcomingQuery = `
  SELECT COUNT(DISTINCT rd.master_id) AS total_count
  FROM raw_data rd
  LEFT JOIN reassignment re ON rd.master_id = re.master_id
  WHERE re.id IN (?)
  AND rd.lead_stage NOT IN ('Drop', ?, ?, ?)
  AND (rd.followup_date > CURDATE() OR DATE(re.reassignment_date) > CURDATE())
`;

    const upcomingParams = [latestReassignmentIds, ...closedStages];

    // ✅ ONLY add filter for non-admin, non-management roles
    if (!isAdminLike(role) && !isManagementLike(role)) {
      upcomingQuery += ` AND re.assignedTo = ?`;
      upcomingParams.push(currentUserName);
    }

    const [upcomingRows] = await db.query(upcomingQuery, upcomingParams);
    const upcomingCount = upcomingRows[0]?.total_count || 0;
    
    // ===== FINAL RESPONSE =====
    return res.status(200).json({
      success: true,
      total: totalRows[0]?.total_count || 0,
      drop: dropRows[0]?.drop_count || 0,
      closed: closedRows[0]?.closed_count || 0,
      projection: projectionRows[0]?.projection_count || 0,
      quotation_pending: quotationRows[0]?.quotation_pending_count || 0,
      quotation_followup: quotationFollowupRows[0]?.quotation_followup_count || 0,
      assigned: assignedCount,
      today: todayCount,
      missed: missedCount,
      upcoming: upcomingCount,
      today_missed_total: todayCount + missedCount,
    });
  } catch (error) {
    console.error('❌ Error in getDashboardLeadCounts:', error);
    return res.status(500).json({ success: false });
  }
};

export const getMissedAssignedCount = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: 'Unauthorized: No session' });
    }

    const { id: userId, role } = req.session.user;

    const [userResult] = await db.query(
      'SELECT name FROM users WHERE user_id = ?',
      [userId],
    );
    const currentUserName = userResult[0]?.name || '';

    const [latestReassignments] = await db.query(`
      SELECT master_id, MAX(id) as latest_id
      FROM reassignment
      GROUP BY master_id
    `);

    const latestReassignmentIds = latestReassignments.map((r) => r.latest_id);
    const today = new Date().toISOString().slice(0, 10);

    let query = `
      SELECT COUNT(DISTINCT rd.master_id) AS total_count
      FROM raw_data rd
      LEFT JOIN reassignment re ON rd.master_id = re.master_id
      WHERE re.id IN (?)
      AND rd.lead_stage NOT IN ('Drop','Closed Deal')
      AND rd.followup_date < ?
    `;

    const params = [latestReassignmentIds, today];

    if (isTelecallerLike(role)) {
      query += ` AND re.assignedTo = ?`;
      params.push(currentUserName);
    }

    const [rows] = await db.query(query, params);

    res.status(200).json({
      success: true,
      missed: rows[0]?.total_count || 0,
    });
  } catch (error) {
    console.error('❌ Error in getMissedAssignedCount:', error);
    res.status(500).json({ message: 'Failed to fetch missed assigned count' });
  }
};

// Add this new controller function
export const getTodaysMissedCombinedCount = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: 'Unauthorized: No session' });
    }

    const { id: userId, role } = req.session.user;

    // Get current user's name
    const [userResult] = await db.query(
      'SELECT name FROM users WHERE user_id = ?',
      [userId],
    );
    const currentUserName = userResult[0]?.name || '';

    // Get latest reassignments for all leads
    const [latestReassignments] = await db.query(`
      SELECT master_id, MAX(id) as latest_id
      FROM reassignment
      GROUP BY master_id
    `);

    const latestReassignmentIds = latestReassignments.map((r) => r.latest_id);
    const today = new Date().toISOString().slice(0, 10);

    // Combined query for today's and missed leads
    let query = `
      SELECT 
        COUNT(DISTINCT CASE 
          WHEN (rd.followup_date = CURDATE() OR DATE(re.reassignment_date) = CURDATE()) 
          THEN rd.master_id 
        END) AS today_count,
        
        COUNT(DISTINCT CASE 
          WHEN rd.followup_date < ? 
          THEN rd.master_id 
        END) AS missed_count
        
      FROM raw_data rd
      LEFT JOIN reassignment re ON rd.master_id = re.master_id
      WHERE re.id IN (?)
      AND rd.lead_stage NOT IN ('Drop', 'Closed Deal')
    `;

    const params = [today, latestReassignmentIds];

    // Role filtering (same logic as your existing endpoints)
    if (isTelecallerLike(role)) {
      query += ` AND re.assignedTo = ?`;
      params.push(currentUserName);
    } else if (isAdminLike(role) || isManagementLike(role)) {
      // Admin/Management see all
    } else {
      query += ` AND re.assignedTo = ?`;
      params.push(currentUserName);
    }

    const [rows] = await db.query(query, params);

    res.status(200).json({
      success: true,
      today: rows[0]?.today_count || 0,
      missed: rows[0]?.missed_count || 0,
      total: (rows[0]?.today_count || 0) + (rows[0]?.missed_count || 0),
    });
  } catch (error) {
    console.error('❌ Error in getTodaysMissedCombinedCount:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch combined today's and missed leads count",
    });
  }
};

export const getTodaysAssignedLeads = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { id: userId, role } = req.session.user;

    // ================= CURRENT USER =================
    const [userResult] = await db.query(
      'SELECT name FROM users WHERE user_id = ?',
      [userId],
    );
    const currentUserName = userResult[0]?.name || '';

    // ================= COUNT QUERY (SAME AS FULL DATA) =================
    let query = `
      SELECT COUNT(DISTINCT rd.master_id) AS total
      FROM raw_data rd
      LEFT JOIN assignments asg ON rd.assign_id = asg.assign_id

      LEFT JOIN (
        SELECT r1.*, ROW_NUMBER() OVER (PARTITION BY master_id ORDER BY id DESC) rn
        FROM reassignment r1
      ) lr ON rd.master_id = lr.master_id AND lr.rn = 1

      LEFT JOIN users u ON lr.assignedTo = u.name

      WHERE DATE(lr.reassignment_date) = CURDATE()
      AND rd.lead_stage NOT IN ('Drop','Closed Deal')
    `;

    const params = [];

    // ================= ROLE FILTERS (IDENTICAL) =================
    if (isTelecallerLike(role)) {
      query += ` AND lr.assignedTo = ?`;
      params.push(currentUserName);
    } else if (isAdminLike(role)) {
      query += ` AND rd.status IN ('Assigned','Not Interested')`;
    } else if (!isManagementLike(role)) {
      query += ` AND lr.assignedTo = ?`;
      params.push(currentUserName);
    }

    const [[{ total = 0 }]] = await db.query(query, params);

    return res.status(200).json({
      success: true,
      total,
    });
  } catch (err) {
    console.error('❌ Error in getTodaysAssignedLeads:', err);
    res.status(500).json({ message: 'Failed to fetch count' });
  }
};

export const getUpcomingAssignedCount = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { id: userId, role } = req.session.user;

    const [userResult] = await db.query(
      'SELECT name FROM users WHERE user_id = ?',
      [userId],
    );
    const currentUserName = userResult[0]?.name || '';

    const [latestReassignments] = await db.query(`
      SELECT master_id, MAX(id) as latest_id
      FROM reassignment
      GROUP BY master_id
    `);

    const latestReassignmentIds = latestReassignments.map((r) => r.latest_id);

    let query = `
      SELECT COUNT(DISTINCT rd.master_id) AS total_count
      FROM raw_data rd
      LEFT JOIN reassignment re ON rd.master_id = re.master_id
      WHERE re.id IN (?)
      AND rd.lead_stage NOT IN ('Drop','Closed Deal')
      AND (rd.followup_date > CURDATE() OR DATE(re.reassignment_date) > CURDATE())
    `;

    const params = [latestReassignmentIds];

    if (isTelecallerLike(role)) {
      query += ` AND re.assignedTo = ?`;
      params.push(currentUserName);
    }

    const [rows] = await db.query(query, params);

    res.status(200).json({
      success: true,
      upcoming: rows[0]?.total_count || 0,
    });
  } catch (error) {
    console.error('❌ Error in getUpcomingAssignedCount:', error);
    res
      .status(500)
      .json({ message: 'Failed to fetch upcoming assigned count' });
  }
};

export const getDropLeads1 = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT 
          r.*, 
          a.assign_date, 
          a.assigned_to, 
          a.assigned_to_user_id,

          CONCAT(
            '[',
              GROUP_CONCAT(
                JSON_OBJECT(
                  'id', rs.id,
                  'leadStage', rs.leadStage,
                  'remark', rs.remark,
                  'created_at', rs.created_at
                )
                ORDER BY rs.id DESC
              ),
            ']'
          ) AS reassignment_history

       FROM raw_data r
       LEFT JOIN assignments a 
            ON r.assign_id = a.assign_id
       LEFT JOIN reassignment rs 
            ON r.master_id = rs.master_id

       WHERE r.lead_stage = 'Drop'

       GROUP BY r.master_id
       ORDER BY r.master_id DESC`,
    );

    res.status(200).json({
      success: true,
      total: rows.length,
      leads: rows,
    });
  } catch (err) {
    console.error('❌ getDropLeads error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getDropLeads = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT COUNT(*) AS drop_count
       FROM raw_data
       WHERE lead_stage = 'Drop'`,
    );

    res.status(200).json({
      success: true,
      count: rows[0]?.drop_count || 0,
    });
  } catch (err) {
    console.error('❌ getDropLeadCount error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getClosedLeads1 = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT 
          r.*, 
          a.assign_date, 
          a.assigned_to, 
          a.assigned_to_user_id,

          CONCAT(
            '[',
              GROUP_CONCAT(
                JSON_OBJECT(
                  'id', rs.id,
                  'leadStage', rs.leadStage,
                  'remark', rs.remark,
                  'created_at', rs.created_at
                )
                ORDER BY rs.id DESC
              ),
            ']'
          ) AS reassignment_history

       FROM raw_data r
       LEFT JOIN assignments a 
            ON r.assign_id = a.assign_id
       LEFT JOIN reassignment rs 
            ON r.master_id = rs.master_id

       WHERE r.lead_stage = 'Closed Deal'

       GROUP BY r.master_id
       ORDER BY r.master_id DESC`,
    );

    res.status(200).json({
      success: true,
      total: rows.length,
      leads: rows,
    });
  } catch (err) {
    console.error('❌ getClosedLeads error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getClosedLeads2 = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT COUNT(*) AS closed_count
       FROM raw_data
       WHERE lead_stage = 'Closed Deal'`,
    );

    res.status(200).json({
      success: true,
      count: rows[0]?.closed_count || 0,
    });
  } catch (err) {
    console.error('❌ getClosedLeadCount error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getClosedLeads = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT COUNT(DISTINCT master_id) AS closed_count
       FROM raw_data
       WHERE lead_stage = 'Closed Deal'`,
    );

    res.status(200).json({
      success: true,
      count: rows[0]?.closed_count || 0,
    });
  } catch (err) {
    console.error('❌ getClosedLeadCount error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// export const getTodaysAssignedLeads = async (req, res) => {
//   try {
//     if (!req.session.user) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     const { id: userId, role } = req.session.user;

//     // Get current user's name for filtering
//     const [userResult] = await db.query(
//       "SELECT name FROM users WHERE user_id = ?",
//       [userId]
//     );
//     const currentUserName = userResult[0]?.name || '';

//     // Get latest reassignments for all leads
//     const [latestReassignments] = await db.query(`
//       SELECT
//         master_id,
//         MAX(id) as latest_id
//       FROM reassignment
//       GROUP BY master_id
//     `);

//     const latestReassignmentIds = latestReassignments.map(r => r.latest_id);

//     let query = `
//       SELECT COUNT(DISTINCT rd.master_id) AS total_count
//       FROM raw_data rd
//       LEFT JOIN reassignment re ON rd.master_id = re.master_id
//       WHERE re.id IN (?)
//       AND (rd.followup_date = CURDATE() OR DATE(re.reassignment_date) = CURDATE())
//     `;

//     const params = [latestReassignmentIds];

//     // -----------------------------------
//     // ⭐ ROLE FILTERING
//     // -----------------------------------
//     if (isTelecallerLike(role)) {
//       query += ` AND re.assignedTo = ?`;
//       params.push(currentUserName);
//     }
//     else if (isAdminLike(role) || isManagementLike(role)) {
//       // Admin/Management see all
//     }
//     else {
//       query += ` AND re.assignedTo = ?`;
//       params.push(currentUserName);
//     }

//     const [rows] = await db.query(query, params);

//     res.status(200).json({
//       success: true,
//       total: rows[0]?.total_count || 0
//     });

//   } catch (err) {
//     console.error("❌ Error:", err);
//     res.status(500).json({ message: "Failed to fetch count" });
//   }
// };

// export const getTodaysAssignedLeads = async (req, res) => {
//   try {
//     if (!req.session.user) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     const { id: userId, role } = req.session.user;

//     const [userResult] = await db.query(
//       "SELECT name FROM users WHERE user_id = ?",
//       [userId]
//     );
//     const currentUserName = userResult[0]?.name || '';

//     const [latestReassignments] = await db.query(`
//       SELECT master_id, MAX(id) as latest_id
//       FROM reassignment
//       GROUP BY master_id
//     `);

//     const latestReassignmentIds = latestReassignments.map(r => r.latest_id);

//     let query = `
//       SELECT COUNT(DISTINCT rd.master_id) AS total_count
//       FROM raw_data rd
//       LEFT JOIN reassignment re ON rd.master_id = re.master_id
//       WHERE re.id IN (?)
//       AND rd.lead_stage NOT IN ('Drop','Closed Deal')
//       AND (rd.followup_date = CURDATE() OR DATE(re.reassignment_date) = CURDATE())
//     `;

//     const params = [latestReassignmentIds];

//     if (isTelecallerLike(role)) {
//       query += ` AND re.assignedTo = ?`;
//       params.push(currentUserName);
//     }

//     const [rows] = await db.query(query, params);

//     res.status(200).json({
//       success: true,
//       total: rows[0]?.total_count || 0
//     });

//   } catch (err) {
//     console.error("❌ Error:", err);
//     res.status(500).json({ message: "Failed to fetch count" });
//   }
// };

// export const getUpcomingAssignedCount = async (req, res) => {
//   try {
//     if (!req.session.user) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     const { id: userId, role } = req.session.user;

//     // Get current user's name for filtering
//     const [userResult] = await db.query(
//       "SELECT name FROM users WHERE user_id = ?",
//       [userId]
//     );
//     const currentUserName = userResult[0]?.name || '';

//     // Get latest reassignments for all leads
//     const [latestReassignments] = await db.query(`
//       SELECT
//         master_id,
//         MAX(id) as latest_id
//       FROM reassignment
//       GROUP BY master_id
//     `);

//     const latestReassignmentIds = latestReassignments.map(r => r.latest_id);

//     let query = `
//       SELECT COUNT(DISTINCT rd.master_id) AS total_count
//       FROM raw_data rd
//       LEFT JOIN reassignment re ON rd.master_id = re.master_id
//       WHERE re.id IN (?)
//       AND (rd.followup_date > CURDATE() OR DATE(re.reassignment_date) > CURDATE())
//     `;

//     const params = [latestReassignmentIds];

//     // -----------------------------------
//     // ⭐ ROLE FILTERING
//     // -----------------------------------
//     if (isTelecallerLike(role)) {
//       query += ` AND re.assignedTo = ?`;
//       params.push(currentUserName);
//     }
//     else if (isAdminLike(role) || isManagementLike(role)) {
//       // Admin/Management see all
//     }
//     else {
//       query += ` AND re.assignedTo = ?`;
//       params.push(currentUserName);
//     }

//     const [rows] = await db.query(query, params);

//     res.status(200).json({
//       success: true,
//       upcoming: rows[0]?.total_count || 0
//     });

//   } catch (error) {
//     console.error("❌ Error in getUpcomingAssignedCount:", error);
//     res.status(500).json({ message: "Failed to fetch upcoming assigned count" });
//   }
// };

// export const getMissedAssignedCount = async (req, res) => {
//   try {
//     if (!req.session.user) {
//       return res.status(401).json({ message: "Unauthorized: No session" });
//     }

//     const { id: userId, role } = req.session.user;

//     // Get current user's name for filtering
//     const [userResult] = await db.query(
//       "SELECT name FROM users WHERE user_id = ?",
//       [userId]
//     );
//     const currentUserName = userResult[0]?.name || '';

//     // Get latest reassignments for all leads
//     const [latestReassignments] = await db.query(`
//       SELECT
//         master_id,
//         MAX(id) as latest_id
//       FROM reassignment
//       GROUP BY master_id
//     `);

//     const latestReassignmentIds = latestReassignments.map(r => r.latest_id);
//     const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

//     let query = `
//       SELECT COUNT(DISTINCT rd.master_id) AS total_count
//       FROM raw_data rd
//       LEFT JOIN reassignment re ON rd.master_id = re.master_id
//       WHERE re.id IN (?)
//       AND rd.followup_date < ?
//     `;

//     const params = [latestReassignmentIds, today];

//     // ---------------------------------------
//     // ⭐ ROLE FILTERING
//     // ---------------------------------------
//     if (isTelecallerLike(role)) {
//       query += ` AND re.assignedTo = ?`;
//       params.push(currentUserName);
//     }
//     else if (isAdminLike(role) || isManagementLike(role)) {
//       // Admin/Management see all
//     }
//     else {
//       query += ` AND re.assignedTo = ?`;
//       params.push(currentUserName);
//     }

//     const [rows] = await db.query(query, params);

//     res.status(200).json({
//       success: true,
//       missed: rows[0]?.total_count || 0
//     });

//   } catch (error) {
//     console.error("❌ Error in getMissedAssignedCount:", error);
//     res.status(500).json({ message: "Failed to fetch missed assigned count" });
//   }
// };

export const getProjectionLeads = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT 
          r.*, 
          a.assign_date, 
          a.assigned_to, 
          a.assigned_to_user_id,

          CONCAT(
            '[',
              GROUP_CONCAT(
                JSON_OBJECT(
                  'id', rs.id,
                  'leadStage', rs.leadStage,
                  'remark', rs.remark,
                  'created_at', rs.created_at
                )
                ORDER BY rs.id DESC
              ),
            ']'
          ) AS reassignment_history

       FROM raw_data r
       LEFT JOIN assignments a 
            ON r.assign_id = a.assign_id
       LEFT JOIN reassignment rs 
            ON r.master_id = rs.master_id

       WHERE r.lead_stage = 'Projection List'

       GROUP BY r.master_id
       ORDER BY r.master_id DESC`,
    );

    res.status(200).json({
      success: true,
      total: rows.length,
      leads: rows,
    });
  } catch (err) {
    console.error('❌ getProjectionLeads error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

export const getQuotationPendingLeads = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT COUNT(*) AS total
      FROM raw_data
      WHERE lead_stage = 'Quotation Pending'
    `);

    res.status(200).json({
      success: true,
      total: rows[0].total,
    });
  } catch (err) {
    console.error('❌ getQuotationPendingLeads error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getQuotationFollowupLeads = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT COUNT(*) AS total
      FROM raw_data
      WHERE lead_stage = 'Quotation Follow-up'
    `);

    res.status(200).json({
      success: true,
      total: rows[0].total,
    });
  } catch (err) {
    console.error('❌ getQuotationFollowupLeads error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getDemoLeads = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT COUNT(*) AS total
      FROM raw_data
      WHERE lead_stage = 'Demo'
    `);

    res.status(200).json({
      success: true,
      total: rows[0].total,
    });
  } catch (err) {
    console.error('❌ getDemoLeads error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getLeadStageSummary = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { id: userId, role } = req.session.user;

    const [userResult] = await db.query(
      'SELECT name FROM users WHERE user_id = ?',
      [userId],
    );
    const currentUserName = userResult[0]?.name || '';

    let query = `
      SELECT 
        COALESCE(lr.leadStage, rd.lead_stage) AS stage,
        COUNT(DISTINCT rd.master_id) AS total
      FROM raw_data rd
      LEFT JOIN (
        SELECT r1.master_id, r1.leadStage, r1.assignedTo
        FROM reassignment r1
        INNER JOIN (
          SELECT master_id, MAX(id) max_id
          FROM reassignment
          GROUP BY master_id
        ) r2 ON r1.id = r2.max_id
      ) lr ON lr.master_id = rd.master_id
      WHERE 1=1
    `;

    const params = [];

    if (isTelecallerLike(role)) {
      query += ` AND lr.assignedTo = ?`;
      params.push(currentUserName);
    } else if (!isAdminLike(role) && !isManagementLike(role)) {
      query += ` AND lr.assignedTo = ?`;
      params.push(currentUserName);
    }

    query += ` GROUP BY stage`;

    const [rows] = await db.query(query, params);

    const summary = {};
    rows.forEach((r) => {
      summary[r.stage || 'Others'] = Number(r.total);
    });

    return res.json({ success: true, summary });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Stage summary error' });
  }
};

export const getCategorySummary = async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const [userResult] = await db.query(
      'SELECT name FROM users WHERE user_id = ?',
      [user.id],
    );
    const currentUserName = userResult[0]?.name || '';

    let query = `
      SELECT c.cat_name AS label,
             COUNT(DISTINCT rd.master_id) AS total
      FROM category c
      LEFT JOIN raw_data rd ON rd.cat_id = c.cat_id
      LEFT JOIN (
        SELECT r1.master_id, r1.assignedTo
        FROM reassignment r1
        INNER JOIN (
          SELECT master_id, MAX(id) max_id
          FROM reassignment
          GROUP BY master_id
        ) r2 ON r1.id = r2.max_id
      ) lr ON lr.master_id = rd.master_id
      WHERE c.cat_name IS NOT NULL AND c.cat_name != ''
    `;

    const params = [];

    if (isTelecallerLike(user.role)) {
      query += ` AND lr.assignedTo = ?`;
      params.push(currentUserName);
    } else if (!isAdminLike(user.role) && !isManagementLike(user.role)) {
      query += ` AND lr.assignedTo = ?`;
      params.push(currentUserName);
    }

    query += ` GROUP BY c.cat_id, c.cat_name`;

    const [rows] = await db.query(query, params);

    const summary = {};
    rows.forEach((r) => (summary[r.label] = Number(r.total)));

    res.json({ summary });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Category summary error' });
  }
};

export const getAreaSummary = async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const [userResult] = await db.query(
      'SELECT name FROM users WHERE user_id = ?',
      [user.id],
    );
    const currentUserName = userResult[0]?.name || '';

    let query = `
      SELECT a.area_name AS label,
             COUNT(DISTINCT rd.master_id) AS total
      FROM area a
      LEFT JOIN raw_data rd ON rd.area_id = a.area_id
      LEFT JOIN (
        SELECT r1.master_id, r1.assignedTo
        FROM reassignment r1
        INNER JOIN (
          SELECT master_id, MAX(id) max_id
          FROM reassignment
          GROUP BY master_id
        ) r2 ON r1.id = r2.max_id
      ) lr ON lr.master_id = rd.master_id
      WHERE a.area_name IS NOT NULL AND a.area_name != ''
    `;

    const params = [];

    if (isTelecallerLike(user.role)) {
      query += ` AND lr.assignedTo = ?`;
      params.push(currentUserName);
    } else if (!isAdminLike(user.role) && !isManagementLike(user.role)) {
      query += ` AND lr.assignedTo = ?`;
      params.push(currentUserName);
    }

    query += ` GROUP BY a.area_id, a.area_name
              ORDER BY total DESC`;

    const [rows] = await db.query(query, params);

    const summary = {};
    rows.forEach((r) => (summary[r.label] = Number(r.total)));

    res.json({ summary });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Area summary error' });
  }
};

export const getReferenceSummary = async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const [userResult] = await db.query(
      'SELECT name FROM users WHERE user_id = ?',
      [user.id],
    );
    const currentUserName = userResult[0]?.name || '';

    let query = `
      SELECT ref.reference_name AS label,
             COUNT(DISTINCT rd.master_id) AS total
      FROM reference ref
      LEFT JOIN raw_data rd ON rd.reference_id = ref.reference_id
      LEFT JOIN (
        SELECT r1.master_id, r1.assignedTo
        FROM reassignment r1
        INNER JOIN (
          SELECT master_id, MAX(id) max_id
          FROM reassignment
          GROUP BY master_id
        ) r2 ON r1.id = r2.max_id
      ) lr ON lr.master_id = rd.master_id
      WHERE ref.reference_name IS NOT NULL AND ref.reference_name != ''
    `;

    const params = [];

    if (isTelecallerLike(user.role)) {
      query += ` AND lr.assignedTo = ?`;
      params.push(currentUserName);
    } else if (!isAdminLike(user.role) && !isManagementLike(user.role)) {
      query += ` AND lr.assignedTo = ?`;
      params.push(currentUserName);
    }

    query += ` GROUP BY ref.reference_id, ref.reference_name`;

    const [rows] = await db.query(query, params);

    const summary = {};
    rows.forEach((r) => (summary[r.label] = Number(r.total)));

    res.json({ summary });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Reference summary error' });
  }
};

export const getBudgetRangeSummary = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { role } = req.session.user;

    if (!['admin', 'sub_admin'].includes(role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const [rows] = await db.query(`
      SELECT budget_range
      FROM raw_data
    `);

    // Fixed buckets
    const summary = {
      'Basic Range: Above ₹7 Lakh': 0,
      'Premium Range: Above ₹10 Lakh': 0,
      'Ultra-Premium Range: Above ₹15 Lakh': 0,
      'Elite Range: Above ₹25 Lakh': 0,
      Other: 0,
      'Not Specified': 0,
    };

    const knownRanges = [
      'Basic Range: Above ₹7 Lakh',
      'Premium Range: Above ₹10 Lakh',
      'Ultra-Premium Range: Above ₹15 Lakh',
      'Elite Range: Above ₹25 Lakh',
    ];

    for (const row of rows) {
      const value = row.budget_range?.trim();

      if (!value) {
        summary['Not Specified']++;
      } else if (knownRanges.includes(value)) {
        summary[value]++;
      } else {
        // Covers "Other" + custom text
        summary['Other']++;
      }
    }

    res.status(200).json({
      success: true,
      summary,
    });
  } catch (err) {
    console.error('❌ getBudgetRangeSummary error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message,
    });
  }
};

export const getfollowups = async (req, res) => {
  try {
    const query = `SELECT COUNT(*) AS followup_count FROM followup`;
    const [rows] = await db.query(query);
    console.log('followup rows: ', rows);
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching Followups count:', error);
    res.status(500).json({ error: 'Failed to fetch followups count' });
  }
};

// meeting scheduled
export const getMeetingScheduled = async (req, res) => {
  try {
    const query = `SELECT COUNT(*) AS meeting_count FROM meeting_schedule`;
    const [rows] = await db.query(query);
    console.log('Meeting rows: ', rows);
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching Meeting count:', error);
    res.status(500).json({ error: 'Failed to fetch Meeting count' });
  }
};

// Category
export const getcategory = async (req, res) => {
  try {
    const query = `SELECT COUNT(*) AS category_count FROM category`;
    const [rows] = await db.query(query);
    console.log('category rows: ', rows);
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching category count:', error);
    res.status(500).json({ error: 'Failed to fetch category count' });
  }
};

// Category
export const getProducts = async (req, res) => {
  try {
    const query = `SELECT COUNT(*) AS product_count FROM product`;
    const [rows] = await db.query(query);
    console.log('product rows: ', rows);
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching product count:', error);
    res.status(500).json({ error: 'Failed to fetch product count' });
  }
};

// Category
export const getConvertedLeads = async (req, res) => {
  try {
    const query = `SELECT COUNT(*) AS converted_count FROM raw_data WHERE status= 'lead Converted'`;
    const [rows] = await db.query(query);
    console.log('converted rows: ', rows);
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching cnverted count:', error);
    res.status(500).json({ error: 'Failed to fetch converted count' });
  }
};

export const getTotalCampaignCount = async (req, res) => {
  try {
    const query = `SELECT COUNT(*) AS campaign_count FROM campaigns`;

    const [rows] = await db.query(query);

    res.json({ campaign_count: rows[0].campaign_count || 0 });
  } catch (error) {
    console.error('Error fetching campaign count:', error);
    res.status(500).json({ error: 'Failed to fetch campaign count' });
  }
};

export const getInactiveLeadCount = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { id: userId, role } = req.session.user;

    // Get current user's name for filtering
    const [userResult] = await db.query(
      'SELECT name FROM users WHERE user_id = ?',
      [userId],
    );
    const currentUserName = userResult[0]?.name || '';

    // Get latest reassignments for all leads
    const [latestReassignments] = await db.query(`
      SELECT 
        master_id,
        MAX(id) as latest_id
      FROM reassignment
      GROUP BY master_id
    `);

    const latestReassignmentIds = latestReassignments.map((r) => r.latest_id);

    let query = `
      SELECT COUNT(DISTINCT rd.master_id) AS inactive_count
      FROM raw_data rd
      LEFT JOIN reassignment re ON rd.master_id = re.master_id
      WHERE re.id IN (?)
      AND rd.lead_status = 'Inactive'
    `;

    const params = [latestReassignmentIds];

    // ROLE FILTERING
    if (isTelecallerLike(role)) {
      query += ` AND re.assignedTo = ?`;
      params.push(currentUserName);
    } else if (isAdminLike(role) || isManagementLike(role)) {
      // Admin/Management see all inactive leads
    } else {
      query += ` AND re.assignedTo = ?`;
      params.push(currentUserName);
    }

    const [rows] = await db.query(query, params);
    res.json(rows[0] || { inactive_count: 0 });
  } catch (error) {
    console.error('Error fetching inactive lead count:', error);
    res.status(500).json({ error: 'Failed to fetch inactive lead count' });
  }
};

// In your backend controller (dashboardController.js)
export const getAssignedToTotalRatio = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { id: userId, role } = req.session.user;

    // Get current user's name
    const [userResult] = await db.query(
      'SELECT name FROM users WHERE user_id = ?',
      [userId],
    );
    const currentUserName = userResult[0]?.name || '';

    // Get latest reassignments
    const [latestReassignments] = await db.query(`
      SELECT 
        master_id,
        MAX(id) as latest_id
      FROM reassignment
      GROUP BY master_id
    `);

    const latestReassignmentIds = latestReassignments.map((r) => r.latest_id);

    // Get assigned leads count (filtered by role)
    let assignedQuery = `
      SELECT COUNT(DISTINCT rd.master_id) AS assigned_count
      FROM raw_data rd
      LEFT JOIN reassignment re ON rd.master_id = re.master_id
      WHERE re.id IN (?)
    `;

    const assignedParams = [latestReassignmentIds];

    if (isTelecallerLike(role)) {
      assignedQuery += ` AND re.assignedTo = ?`;
      assignedParams.push(currentUserName);
    } else if (!isAdminLike(role) && !isManagementLike(role)) {
      assignedQuery += ` AND re.assignedTo = ?`;
      assignedParams.push(currentUserName);
    }

    const [assignedRows] = await db.query(assignedQuery, assignedParams);
    const assignedCount = assignedRows[0]?.assigned_count || 0;

    // Get total leads count (only for admin/management)
    let totalCount = 0;
    if (isAdminLike(role) || isManagementLike(role)) {
      const [totalRows] = await db.query(
        'SELECT COUNT(*) as total_count FROM raw_data',
      );
      totalCount = totalRows[0]?.total_count || 0;
    }

    // Calculate ratio and percentage
    const ratio =
      isAdminLike(role) || isManagementLike(role)
        ? `${assignedCount}/${totalCount}`
        : `${assignedCount}`;

    const percentage =
      totalCount > 0 ? Math.round((assignedCount / totalCount) * 100) : 0;

    res.json({
      assigned_count: assignedCount,
      total_count: totalCount,
      ratio: ratio,
      percentage: percentage,
      is_admin: isAdminLike(role) || isManagementLike(role),
    });
  } catch (error) {
    console.error('❌ Error in getAssignedToTotalRatio:', error);
    res.status(500).json({ message: 'Failed to fetch assigned/total ratio' });
  }
};

export const getClosedLeadsCount = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: 'Unauthorized: No session' });
    }

    const { id: userId, role } = req.session.user;

    /* ===== CURRENT USER NAME ===== */
    const [userResult] = await db.query(
      'SELECT name FROM users WHERE user_id = ?',
      [userId],
    );

    const currentUserName = userResult[0]?.name || '';

    /* ===== COUNT QUERY (same logic as main API) ===== */
    let countQuery = `
      SELECT COUNT(DISTINCT rd.master_id) AS total
      FROM raw_data rd
      LEFT JOIN (
        SELECT r1.*, ROW_NUMBER() OVER (PARTITION BY master_id ORDER BY id DESC) rn
        FROM reassignment r1
      ) lr ON rd.master_id = lr.master_id AND lr.rn = 1
      WHERE (rd.lead_stage = 'Closed Deal'
         OR lr.leadStage = 'Closed Deal')
      AND NOT EXISTS (
        SELECT 1 
        FROM execution_start es
        WHERE FIND_IN_SET(rd.master_id, es.lead_ids)
      )
    `;

    const params = [];

    /* ===== TELECALLER FILTER ===== */
    if (isTelecallerLike(role)) {
      countQuery += ` AND lr.assignedTo = ?`;
      params.push(currentUserName);
    }

    const [result] = await db.query(countQuery, params);

    return res.status(200).json({
      success: true,
      count: result[0]?.total || 0,
    });
  } catch (error) {
    console.error('❌ Error in getClosedLeadsCount:', error);
    res.status(500).json({
      message: 'Failed to fetch closed leads count',
      error: error.message,
    });
  }
};

export const getClosedLeadsExeCount = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: 'Unauthorized: No session' });
    }

    const { id: userId, role } = req.session.user;

    /* ===== CURRENT USER ===== */
    const [userResult] = await db.query(
      'SELECT name FROM users WHERE user_id = ?',
      [userId],
    );

    const currentUserName = userResult[0]?.name || '';

    /* ===== COUNT QUERY (same logic as getClosedLeadsDataExe) ===== */
    let countQuery = `
      SELECT COUNT(DISTINCT rd.master_id) AS total
      FROM raw_data rd
      LEFT JOIN (
        SELECT r1.*, ROW_NUMBER() OVER (PARTITION BY master_id ORDER BY id DESC) rn
        FROM reassignment r1
      ) lr ON rd.master_id = lr.master_id AND lr.rn = 1

      WHERE (rd.lead_stage = 'Closed Deal'
         OR lr.leadStage = 'Closed Deal')

      AND EXISTS (
        SELECT 1 
        FROM execution_start es
        WHERE FIND_IN_SET(rd.master_id, es.lead_ids)
      )
    `;

    const params = [];

    /* ===== ROLE FILTER ===== */
    if (isTelecallerLike(role)) {
      countQuery += ` AND lr.assignedTo = ?`;
      params.push(currentUserName);
    }

    const [result] = await db.query(countQuery, params);

    return res.status(200).json({
      success: true,
      count: result[0]?.total || 0,
    });
  } catch (error) {
    console.error('❌ Error in getClosedLeadsExeCount:', error);
    res.status(500).json({
      message: 'Failed to fetch closed execution leads count',
      error: error.message,
    });
  }
};

export const getManagerProcessesCount = async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    let countQuery = `
      SELECT COUNT(*) AS total
      FROM execution_documents ed
    `;

    const params = [];

    /* ===== ROLE FILTER (same as main API) ===== */
    if (user.role !== 'admin') {
      countQuery += ` WHERE ed.uploaded_by = ?`;
      params.push(user.id);
    }

    const [result] = await db.query(countQuery, params);

    return res.json({
      success: true,
      count: result[0]?.total || 0,
      user: {
        id: user.id,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('ManagerProcessesCount error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

export const getDailyExecutionProcessesCount = async (req, res) => {
  try {
    const user = req.session.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const userId = user.id;

    /* ===== COUNT QUERY (same filter as main API) ===== */
    const [result] = await db.query(
      `
      SELECT COUNT(*) AS total
      FROM execution_process_user_map epum
      WHERE epum.user_id = ?
      `,
      [userId],
    );

    return res.json({
      success: true,
      count: result[0]?.total || 0,
      user: {
        id: user.id,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('DailyExecutionProcessesCount error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

export const getExecutionDashboardCounts1 = async (req, res) => {
  try {
    const user = req.session.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const { id: userId, role } = user;

    /* ===== CURRENT USER NAME ===== */
    const [userResult] = await db.query(
      'SELECT name FROM users WHERE user_id = ?',
      [userId],
    );

    const currentUserName = userResult[0]?.name || '';

    // ================= PRE EXECUTION (closed non execution) =================
    let closedQuery = `
      SELECT COUNT(DISTINCT rd.master_id) AS total
      FROM raw_data rd
      LEFT JOIN (
        SELECT r1.*, ROW_NUMBER() OVER (PARTITION BY master_id ORDER BY id DESC) rn
        FROM reassignment r1
      ) lr ON rd.master_id = lr.master_id AND lr.rn = 1
      WHERE (rd.lead_stage = 'Pre Execution'
         OR lr.leadStage = 'Pre Execution')
      AND NOT EXISTS (
        SELECT 1 
        FROM execution_start es
        WHERE FIND_IN_SET(rd.master_id, es.lead_ids)
      )
    `;

    const closedParams = [];

    if (isTelecallerLike(role)) {
      closedQuery += ` AND lr.assignedTo = ?`;
      closedParams.push(currentUserName);
    }

    const [closedRows] = await db.query(closedQuery, closedParams);
    const preExecutionCount = closedRows[0]?.total || 0;

    // ================= EXECUTION =================
    // ================= EXECUTION =================
    let closedExeQuery = `
  SELECT COUNT(DISTINCT rd.master_id) AS total
  FROM raw_data rd
  LEFT JOIN (
    SELECT r1.*, ROW_NUMBER() OVER (PARTITION BY master_id ORDER BY id DESC) rn
    FROM reassignment r1
  ) lr ON rd.master_id = lr.master_id AND lr.rn = 1
  WHERE (rd.lead_stage = 'Execution'
     OR lr.leadStage = 'Execution')
  AND EXISTS (
    SELECT 1 
    FROM execution_start es
    WHERE FIND_IN_SET(rd.master_id, es.lead_ids)
    AND es.status != 'complete'
  )
`;

    const closedExeParams = [];

    if (isTelecallerLike(role)) {
      closedExeQuery += ` AND lr.assignedTo = ?`;
      closedExeParams.push(currentUserName);
    }

    const [closedExeRows] = await db.query(closedExeQuery, closedExeParams);
    const executionCount = closedExeRows[0]?.total || 0;

    // ================= DAILY OPERATION (manager processes) =================
    let managerQuery = `
      SELECT COUNT(*) AS total
      FROM execution_documents ed
    `;

    const managerParams = [];

    if (role !== 'admin') {
      managerQuery += ` WHERE ed.uploaded_by = ?`;
      managerParams.push(userId);
    }

    const [managerRows] = await db.query(managerQuery, managerParams);
    const dailyOperationCount = managerRows[0]?.total || 0;

    // ================= ASSIGNED PROCESS (daily execution processes) =================
    const [dailyRows] = await db.query(
      `
      SELECT COUNT(*) AS total
      FROM execution_process_user_map epum
      WHERE epum.user_id = ?
      `,
      [userId],
    );

    const assignedProcessCount = dailyRows[0]?.total || 0;

    // ===== FINAL RESPONSE (RENAMED) =====
    return res.json({
      success: true,
      pre_execution: preExecutionCount,
      execution: executionCount,
      assigned_process: assignedProcessCount,
      daily_operation: dailyOperationCount,
      total_closed: preExecutionCount + executionCount,
    });
  } catch (error) {
    console.error('ExecutionDashboardCounts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

export const getExecutionDashboardCounts = async (req, res) => {
  try {
    const user = req.session.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const { id: userId, role } = user;

    /* ===== CURRENT USER NAME ===== */
    const [userResult] = await db.query(
      'SELECT name FROM users WHERE user_id = ?',
      [userId],
    );

    const currentUserName = userResult[0]?.name || '';

    // ================= PRE EXECUTION =================
    let closedQuery = `
      SELECT COUNT(DISTINCT rd.master_id) AS total
      FROM raw_data rd
      WHERE rd.lead_stage = 'Pre Execution'
      AND NOT EXISTS (
        SELECT 1 
        FROM execution_start es
        WHERE FIND_IN_SET(rd.master_id, es.lead_ids)
      )
    `;

    const closedParams = [];

    // 👉 Apply role filter ONLY if column exists in raw_data
    if (isTelecallerLike(role)) {
      closedQuery += ` AND rd.assigned_to = ?`; // change column if needed
      closedParams.push(currentUserName);
    }

    const [closedRows] = await db.query(closedQuery, closedParams);
    const preExecutionCount = closedRows[0]?.total || 0;

    // ================= EXECUTION =================
    let closedExeQuery = `
      SELECT COUNT(DISTINCT rd.master_id) AS total
      FROM raw_data rd
      WHERE rd.lead_stage = 'Execution'
      AND EXISTS (
        SELECT 1 
        FROM execution_start es
        WHERE FIND_IN_SET(rd.master_id, es.lead_ids)
        AND es.status != 'complete'
      )
    `;

    const closedExeParams = [];

    if (isTelecallerLike(role)) {
      closedExeQuery += ` AND rd.assigned_to = ?`; // change column if needed
      closedExeParams.push(currentUserName);
    }

    const [closedExeRows] = await db.query(closedExeQuery, closedExeParams);
    const executionCount = closedExeRows[0]?.total || 0;

    // ================= DAILY OPERATION =================
    let managerQuery = `
      SELECT COUNT(*) AS total
      FROM execution_documents ed
    `;

    const managerParams = [];

    if (role !== 'admin') {
      managerQuery += ` WHERE ed.uploaded_by = ?`;
      managerParams.push(userId);
    }

    const [managerRows] = await db.query(managerQuery, managerParams);
    const dailyOperationCount = managerRows[0]?.total || 0;

    // ================= ASSIGNED PROCESS =================
    const [dailyRows] = await db.query(
      `
      SELECT COUNT(*) AS total
      FROM execution_process_user_map epum
      WHERE epum.user_id = ?
      `,
      [userId],
    );

    const assignedProcessCount = dailyRows[0]?.total || 0;

    // ================= FINAL RESPONSE =================
    return res.json({
      success: true,
      pre_execution: preExecutionCount,
      execution: executionCount,
      assigned_process: assignedProcessCount,
      daily_operation: dailyOperationCount,
      total_closed: preExecutionCount + executionCount,
    });
  } catch (error) {
    console.error('ExecutionDashboardCounts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};
