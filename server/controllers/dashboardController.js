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


export const getTotalLeadCount = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id: userId, role } = req.session.user;

    // Get current user's name for filtering
    const [userResult] = await db.query(
      "SELECT name FROM users WHERE user_id = ?",
      [userId]
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

    const latestReassignmentIds = latestReassignments.map(r => r.latest_id);

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
    }
    else if (isAdminLike(role) || isManagementLike(role)) {
      // Admin/Management see all
    }
    else {
      query += ` AND re.assignedTo = ?`;
      params.push(currentUserName);
    }

    const [rows] = await db.query(query, params);
    res.json(rows[0] || { lead_count: 0 });
  } catch (error) {
    console.error("Error fetching leads count:", error);
    res.status(500).json({ error: "Failed to fetch leads count" });
  }
};


export const getAssignedLeadCount = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Unauthorized: No session" });
    }

    const { id: userId, role } = req.session.user;

    const [userResult] = await db.query(
      "SELECT name FROM users WHERE user_id = ?",
      [userId]
    );
    const currentUserName = userResult[0]?.name || '';

    const [latestReassignments] = await db.query(`
      SELECT master_id, MAX(id) as latest_id
      FROM reassignment
      GROUP BY master_id
    `);

    const latestReassignmentIds = latestReassignments.map(r => r.latest_id);

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
    } 
    else if (isAdminLike(role) || isManagementLike(role)) {
      query += ` AND rd.status IN ('Assigned', 'Not Interested')`;
    } 
    else {
      query += ` AND re.assignedTo = ?`;
      params.push(currentUserName);
    }

    const [rows] = await db.query(query, params);
    res.status(200).json(rows[0] || { assigned_count: 0 });

  } catch (error) {
    console.error("❌ Error in getAssignedLeadCount:", error);
    res.status(500).json({ message: "Failed to fetch assigned leads count" });
  }
};


export const getMissedAssignedCount = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Unauthorized: No session" });
    }

    const { id: userId, role } = req.session.user;

    const [userResult] = await db.query(
      "SELECT name FROM users WHERE user_id = ?",
      [userId]
    );
    const currentUserName = userResult[0]?.name || '';

    const [latestReassignments] = await db.query(`
      SELECT master_id, MAX(id) as latest_id
      FROM reassignment
      GROUP BY master_id
    `);

    const latestReassignmentIds = latestReassignments.map(r => r.latest_id);
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
      missed: rows[0]?.total_count || 0
    });

  } catch (error) {
    console.error("❌ Error in getMissedAssignedCount:", error);
    res.status(500).json({ message: "Failed to fetch missed assigned count" });
  }
};



export const getTodaysAssignedLeads = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id: userId, role } = req.session.user;

    // ================= CURRENT USER =================
    const [userResult] = await db.query(
      "SELECT name FROM users WHERE user_id = ?",
      [userId]
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
      total
    });

  } catch (err) {
    console.error("❌ Error in getTodaysAssignedLeads:", err);
    res.status(500).json({ message: "Failed to fetch count" });
  }
};



export const getUpcomingAssignedCount = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id: userId, role } = req.session.user;

    const [userResult] = await db.query(
      "SELECT name FROM users WHERE user_id = ?",
      [userId]
    );
    const currentUserName = userResult[0]?.name || '';

    const [latestReassignments] = await db.query(`
      SELECT master_id, MAX(id) as latest_id
      FROM reassignment
      GROUP BY master_id
    `);

    const latestReassignmentIds = latestReassignments.map(r => r.latest_id);

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
      upcoming: rows[0]?.total_count || 0
    });

  } catch (error) {
    console.error("❌ Error in getUpcomingAssignedCount:", error);
    res.status(500).json({ message: "Failed to fetch upcoming assigned count" });
  }
};




export const getDropLeads = async (req, res) => {
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
       ORDER BY r.master_id DESC`
    );

    res.status(200).json({
      success: true,
      total: rows.length,
      leads: rows
    });

  } catch (err) {
    console.error("❌ getDropLeads error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


export const getClosedLeads = async (req, res) => {
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
       ORDER BY r.master_id DESC`
    );

    res.status(200).json({
      success: true,
      total: rows.length,
      leads: rows
    });

  } catch (err) {
    console.error("❌ getClosedLeads error:", err);
    res.status(500).json({ success: false, message: "Server error" });
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
       ORDER BY r.master_id DESC`
    );

    res.status(200).json({
      success: true,
      total: rows.length,
      leads: rows
    });

  } catch (err) {
    console.error("❌ getProjectionLeads error:", err);
    res.status(500).json({
      success: false,
      message: "Server error"
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
      total: rows[0].total
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
      total: rows[0].total
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
      total: rows[0].total
    });

  } catch (err) {
    console.error('❌ getDemoLeads error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


export const getLeadStageSummary = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id: userId, role } = req.session.user;

    // Current user name
    const [userResult] = await db.query(
      "SELECT name FROM users WHERE user_id = ?",
      [userId]
    );
    const currentUserName = userResult[0]?.name || "";

    const knownStages = [
      "Fresh Lead",
      "Cold Lead",
      "On Hold",
      "Positive Lead",
      "Pre Site Visit",
      "Quotation Pending",
      "Quotation Follow-up",
      "Post Site Visit",
      "Demo",
      "Projection List",
      "Drop",
      "Closed Deal"
    ];

    // ✅ SAME LOGIC AS getAllRawData (latest reassignment per master)
    let query = `
      SELECT 
        rd.master_id,
        rd.lead_stage AS rawStage,
        lr.leadStage AS latestStage,
        lr.assignedTo
      FROM raw_data rd

      LEFT JOIN (
        SELECT r1.*
        FROM reassignment r1
        INNER JOIN (
          SELECT master_id, MAX(id) AS max_id
          FROM reassignment
          GROUP BY master_id
        ) r2 ON r1.id = r2.max_id
      ) lr ON lr.master_id = rd.master_id
      WHERE 1=1
    `;

    const params = [];

    // ROLE FILTER (same meaning, but now on latest reassignment)
    if (isTelecallerLike(role)) {
      query += ` AND lr.assignedTo = ?`;
      params.push(currentUserName);
    } else if (isAdminLike(role) || isManagementLike(role)) {
      // no filter
    } else {
      query += ` AND lr.assignedTo = ?`;
      params.push(currentUserName);
    }

    const [rows] = await db.query(query, params);

    let summary = {};
    knownStages.forEach(s => (summary[s] = 0));
    summary["Others"] = 0;

    // ✅ SAME AS getAllRawData:
    // latestStage || rawStage
    for (const row of rows) {
      const stage = row.latestStage || row.rawStage;

      if (!knownStages.includes(stage)) {
        summary["Others"]++;
      } else {
        summary[stage]++;
      }
    }

    return res.status(200).json({
      success: true,
      summary
    });

  } catch (err) {
    console.error("❌ getLeadStageSummary error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};



export const getCategorySummary = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id: userId, role } = req.session.user;

    // Get current user's name for filtering
    const [userResult] = await db.query(
      "SELECT name FROM users WHERE user_id = ?",
      [userId]
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

    const latestReassignmentIds = latestReassignments.map(r => r.latest_id);

    // Base query with role filtering
    let query = `
      SELECT
        c.cat_name AS label,
        COALESCE(COUNT(DISTINCT r.master_id), 0) AS total
      FROM category c
      LEFT JOIN raw_data r ON r.cat_id = c.cat_id
      LEFT JOIN reassignment ra ON r.master_id = ra.master_id
      WHERE c.cat_name IS NOT NULL 
        AND c.cat_name != ''
        AND ra.id IN (?)
    `;

    const params = [latestReassignmentIds];

    // ROLE FILTERING
    if (isTelecallerLike(role)) {
      query += ` AND ra.assignedTo = ?`;
      params.push(currentUserName);
    }
    else if (isAdminLike(role) || isManagementLike(role)) {
      // Admin/Management see all - no extra filter
    }
    else {
      // Other roles → only leads assigned to them
      query += ` AND ra.assignedTo = ?`;
      params.push(currentUserName);
    }

    query += `
      GROUP BY c.cat_id, c.cat_name
      ORDER BY c.cat_name
    `;

    const [rows] = await db.query(query, params);

    // For Admin/Management: Also include categories with 0 leads
    if ((isAdminLike(role) || isManagementLike(role)) && rows.length > 0) {
      // Get ALL categories including those with 0 leads
      const [allCategories] = await db.query(`
        SELECT cat_name AS label, 0 AS total
        FROM category 
        WHERE cat_name IS NOT NULL AND cat_name != ''
        ORDER BY cat_name
      `);

      // Merge with actual counts
      const categoryMap = {};
      rows.forEach(row => {
        if (row.label && row.label.trim() !== '') {
          categoryMap[row.label] = Number(row.total);
        }
      });

      const summary = {};
      allCategories.forEach(cat => {
        const label = cat.label.trim();
        if (label) {
          summary[label] = categoryMap[label] || 0;
        }
      });

      return res.json({ summary });
    }

    // For other roles: only show categories they have leads in
    const summary = {};
    rows.forEach(row => {
      if (row.label && row.label.trim() !== '') {
        summary[row.label] = Number(row.total);
      }
    });

    res.json({ summary });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Category summary error' });
  }
};


export const getReferenceSummary = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id: userId, role } = req.session.user;

    // Get current user's name for filtering
    const [userResult] = await db.query(
      "SELECT name FROM users WHERE user_id = ?",
      [userId]
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

    const latestReassignmentIds = latestReassignments.map(r => r.latest_id);

    // Base query with role filtering
    let query = `
      SELECT
        ref.reference_name AS label,
        COALESCE(COUNT(DISTINCT r.master_id), 0) AS total
      FROM reference ref
      LEFT JOIN raw_data r ON r.reference_id = ref.reference_id
      LEFT JOIN reassignment ra ON r.master_id = ra.master_id
      WHERE ref.reference_name IS NOT NULL 
        AND ref.reference_name != ''
        AND ra.id IN (?)
    `;

    const params = [latestReassignmentIds];

    // ROLE FILTERING
    if (isTelecallerLike(role)) {
      query += ` AND ra.assignedTo = ?`;
      params.push(currentUserName);
    }
    else if (isAdminLike(role) || isManagementLike(role)) {
      // Admin/Management see all - no extra filter
    }
    else {
      // Other roles → only leads assigned to them
      query += ` AND ra.assignedTo = ?`;
      params.push(currentUserName);
    }

    query += `
      GROUP BY ref.reference_id, ref.reference_name
      ORDER BY ref.reference_name
    `;

    const [rows] = await db.query(query, params);

    // For Admin/Management: Also include references with 0 leads
    if ((isAdminLike(role) || isManagementLike(role)) && rows.length > 0) {
      // Get ALL references including those with 0 leads
      const [allReferences] = await db.query(`
        SELECT reference_name AS label, 0 AS total
        FROM reference 
        WHERE reference_name IS NOT NULL AND reference_name != ''
        ORDER BY reference_name
      `);

      // Merge with actual counts
      const referenceMap = {};
      rows.forEach(row => {
        if (row.label && row.label.trim() !== '') {
          referenceMap[row.label] = Number(row.total);
        }
      });

      const summary = {};
      allReferences.forEach(ref => {
        const label = ref.label.trim();
        if (label) {
          summary[label] = referenceMap[label] || 0;
        }
      });

      return res.json({ summary });
    }

    // For other roles: only show references they have leads in
    const summary = {};
    rows.forEach(row => {
      if (row.label && row.label.trim() !== '') {
        summary[row.label] = Number(row.total);
      }
    });

    res.json({ summary });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Reference summary error' });
  }
};

export const getBudgetRangeSummary = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { role } = req.session.user;

    if (!['admin', 'sub_admin'].includes(role)) {
      return res.status(403).json({ message: "Forbidden" });
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
      'Other': 0,
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
      }
      else if (knownRanges.includes(value)) {
        summary[value]++;
      }
      else {
        // Covers "Other" + custom text
        summary['Other']++;
      }
    }

    res.status(200).json({
      success: true,
      summary
    });

  } catch (err) {
    console.error("❌ getBudgetRangeSummary error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};






export const getfollowups = async (req, res) => {
  try {
    const query = `SELECT COUNT(*) AS followup_count FROM followup`;
    const [rows] = await db.query(query);
   console.log("followup rows: ", rows);
    res.json(rows[0]);
  } catch (error) {
    console.error("Error fetching Followups count:", error);
    res.status(500).json({ error: "Failed to fetch followups count" });
  }
}

// meeting scheduled
export const getMeetingScheduled = async (req, res) => {
  try {
    const query = `SELECT COUNT(*) AS meeting_count FROM meeting_schedule`;
    const [rows] = await db.query(query);
   console.log("Meeting rows: ", rows);
    res.json(rows[0]);
  } catch (error) {
    console.error("Error fetching Meeting count:", error);
    res.status(500).json({ error: "Failed to fetch Meeting count" });
  }
}


// Category
export const getcategory = async (req, res) => {
  try {
    const query = `SELECT COUNT(*) AS category_count FROM category`;
    const [rows] = await db.query(query);
   console.log("category rows: ", rows);
    res.json(rows[0]);
  } catch (error) {
    console.error("Error fetching category count:", error);
    res.status(500).json({ error: "Failed to fetch category count" });
  }
}


// Category
export const getProducts = async (req, res) => {
  try {
    const query = `SELECT COUNT(*) AS product_count FROM product`;
    const [rows] = await db.query(query);
   console.log("product rows: ", rows);
    res.json(rows[0]);
  } catch (error) {
    console.error("Error fetching product count:", error);
    res.status(500).json({ error: "Failed to fetch product count" });
  }
}



// Category
export const getConvertedLeads = async (req, res) => {
  try {
    const query = `SELECT COUNT(*) AS converted_count FROM raw_data WHERE status= 'lead Converted'`;
    const [rows] = await db.query(query);
   console.log("converted rows: ", rows);
    res.json(rows[0]);
  } catch (error) {
    console.error("Error fetching cnverted count:", error);
    res.status(500).json({ error: "Failed to fetch converted count" });
  }
}


export const getTotalCampaignCount = async (req, res) => {
  try {
    const query = `SELECT COUNT(*) AS campaign_count FROM campaigns`;

    const [rows] = await db.query(query);

    res.json({ campaign_count: rows[0].campaign_count || 0 });
  } catch (error) {
    console.error("Error fetching campaign count:", error);
    res.status(500).json({ error: "Failed to fetch campaign count" });
  }
};


export const getInactiveLeadCount = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id: userId, role } = req.session.user;

    // Get current user's name for filtering
    const [userResult] = await db.query(
      "SELECT name FROM users WHERE user_id = ?",
      [userId]
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

    const latestReassignmentIds = latestReassignments.map(r => r.latest_id);

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
    }
    else if (isAdminLike(role) || isManagementLike(role)) {
      // Admin/Management see all inactive leads
    }
    else {
      query += ` AND re.assignedTo = ?`;
      params.push(currentUserName);
    }

    const [rows] = await db.query(query, params);
    res.json(rows[0] || { inactive_count: 0 });
  } catch (error) {
    console.error("Error fetching inactive lead count:", error);
    res.status(500).json({ error: "Failed to fetch inactive lead count" });
  }
};



// In your backend controller (dashboardController.js)
export const getAssignedToTotalRatio = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id: userId, role } = req.session.user;

    // Get current user's name
    const [userResult] = await db.query(
      "SELECT name FROM users WHERE user_id = ?",
      [userId]
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

    const latestReassignmentIds = latestReassignments.map(r => r.latest_id);

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
    } 
    else if (!isAdminLike(role) && !isManagementLike(role)) {
      assignedQuery += ` AND re.assignedTo = ?`;
      assignedParams.push(currentUserName);
    }

    const [assignedRows] = await db.query(assignedQuery, assignedParams);
    const assignedCount = assignedRows[0]?.assigned_count || 0;

    // Get total leads count (only for admin/management)
    let totalCount = 0;
    if (isAdminLike(role) || isManagementLike(role)) {
      const [totalRows] = await db.query("SELECT COUNT(*) as total_count FROM raw_data");
      totalCount = totalRows[0]?.total_count || 0;
    }

    // Calculate ratio and percentage
    const ratio = isAdminLike(role) || isManagementLike(role) 
      ? `${assignedCount}/${totalCount}`
      : `${assignedCount}`;
    
    const percentage = totalCount > 0 
      ? Math.round((assignedCount / totalCount) * 100) 
      : 0;

    res.json({
      assigned_count: assignedCount,
      total_count: totalCount,
      ratio: ratio,
      percentage: percentage,
      is_admin: isAdminLike(role) || isManagementLike(role)
    });

  } catch (error) {
    console.error("❌ Error in getAssignedToTotalRatio:", error);
    res.status(500).json({ message: "Failed to fetch assigned/total ratio" });
  }
};