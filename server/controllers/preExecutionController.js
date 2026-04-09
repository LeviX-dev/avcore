import db from "../database/db.js";

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
];

const isTelecallerLike = (role) => TELECALLER_ROLES.includes(role);

export const getClosedLeadsData1 = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Unauthorized: No session" });
    }

    const { id: userId, role } = req.session.user;

    /* ================= PAGINATION PARAMETERS ================= */
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({ 
        message: "Invalid pagination parameters. Page must be >=1, limit between 1-100" 
      });
    }

    /* ================= CURRENT USER ================= */
    const [userResult] = await db.query(
      "SELECT name FROM users WHERE user_id = ?",
      [userId]
    );
    const currentUserName = userResult[0]?.name || "";

    /* ================= TOTAL COUNT QUERY ================= */
    let countQuery = `
      SELECT COUNT(DISTINCT rd.master_id) as total
      FROM raw_data rd
      LEFT JOIN (
        SELECT r1.*, ROW_NUMBER() OVER (PARTITION BY master_id ORDER BY id DESC) rn
        FROM reassignment r1
      ) lr ON rd.master_id = lr.master_id AND lr.rn = 1
      WHERE rd.lead_stage = 'Closed Deal'
         OR lr.leadStage = 'Closed Deal'
    `;

    const countParams = [];

    if (isTelecallerLike(role)) {
      countQuery += ` AND lr.assignedTo = ?`;
      countParams.push(currentUserName);
    }

    const [countResult] = await db.query(countQuery, countParams);
    const total = countResult[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    /* ================= MAIN QUERY FOR CLOSED LEADS ================= */
    let query = `
      SELECT 
        rd.master_id,
        
        -- CLIENT INFO
        IFNULL(rd.name, 'Not Available') AS name,
        IFNULL(rd.number, 'Not Available') AS number,
        IFNULL(rd.alternate_number, 'Not Available') AS alternate_number,
        IFNULL(rd.email, 'Not Available') AS email,
        IFNULL(rd.address, 'Not Available') AS address,
        IFNULL(rd.city, 'Not Available') AS city,
        
        -- STATUS & STAGE
        IFNULL(rd.status, 'Not Available') AS status,
        IFNULL(rd.lead_status, 'Not Available') AS lead_status,
        IFNULL(rd.lead_stage, 'Not Available') AS lead_stage,
        IFNULL(rd.current_stage, 'Not Available') AS current_stage,
        
        -- DATES
        IFNULL(rd.created_at, 'Not Available') AS created_at,
        IFNULL(rd.followup_date, 'Not Available') AS followup_date,
        
        -- PROJECT DETAILS
        IFNULL(rd.room_length, 'Not Available') AS room_length,
        IFNULL(rd.room_width, 'Not Available') AS room_width,
        IFNULL(rd.room_height, 'Not Available') AS room_height,
        IFNULL(rd.p_type, 'Not Available') AS p_type,
        IFNULL(rd.budget_range, 'Not Available') AS budget_range,
        IFNULL(rd.time_to_complete, 'Not Available') AS time_to_complete,
        IFNULL(rd.site_visit_date, 'Not Available') AS site_visit_date,
        IFNULL(rd.demo_date, 'Not Available') AS demo_date,
        
        -- CONTACT NUMBERS
        IFNULL(rd.ar_number, 'Not Available') AS ar_number,
        IFNULL(rd.architect_name, 'Not Available') AS architect_name,
        IFNULL(rd.ca_number, 'Not Available') AS ca_number,
        IFNULL(rd.e_number, 'Not Available') AS e_number,
        IFNULL(rd.sm_number, 'Not Available') AS sm_number,
        IFNULL(rd.pop_number, 'Not Available') AS pop_number,
        IFNULL(rd.other_number, 'Not Available') AS other_number,
        
        -- REMARKS
        IFNULL(rd.quick_remark, 'Not Available') AS quick_remark,
        IFNULL(rd.detailed_remark, 'Not Available') AS detailed_remark,
        
        -- LINKS
        IFNULL(rd.location_link, 'Not Available') AS location_link,
        
        -- CATEGORY/REFERENCE/AREA
        IFNULL(c.cat_name, 'Not Available') AS cat_name,
        IFNULL(ref.reference_name, 'Not Available') AS reference_name,
        IFNULL(a.area_name, 'Not Available') AS area_name,
        
        -- ASSIGNMENT INFO
        IFNULL(DATE(asg.assign_date), 'Not Available') AS assign_date,
        
        -- LATEST ASSIGNED USER
        lr.assignedTo AS latest_assigned_to,
        lr.remark AS latest_remark,
        DATE(lr.reassignment_date) AS latest_reassignment_date,
        
        -- TELE CALLER INFO
        IFNULL(u.name, 'Not Available') AS telecaller_name,
        u.user_id AS assigned_to_user_id

      FROM raw_data rd

      LEFT JOIN area a ON rd.area_id = a.area_id
      LEFT JOIN category c ON rd.cat_id = c.cat_id
      LEFT JOIN reference ref ON rd.reference_id = ref.reference_id
      LEFT JOIN assignments asg ON rd.assign_id = asg.assign_id

      LEFT JOIN (
        SELECT r1.*, ROW_NUMBER() OVER (PARTITION BY master_id ORDER BY id DESC) rn
        FROM reassignment r1
      ) lr ON rd.master_id = lr.master_id AND lr.rn = 1

      LEFT JOIN users u ON lr.assignedTo = u.name
    `;

    const params = [];

    /* ================= ONLY CLOSED LEADS FILTER ================= */
    query += `
      WHERE (rd.lead_stage = 'Closed Deal' OR lr.leadStage = 'Closed Deal')
    `;

    if (isTelecallerLike(role)) {
      query += ` AND lr.assignedTo = ?`;
      params.push(currentUserName);
    }

    // Add GROUP BY, ORDER BY, and PAGINATION
    query += ` GROUP BY rd.master_id ORDER BY rd.master_id DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [rows] = await db.query(query, params);

    /* ================= FORMAT RESPONSE ================= */
    const formattedRows = rows.map(row => {
      // Helper function to clean values
      const cleanValue = (value) => {
        if (value === 'Not Available' || value === null || value === undefined || value === '') {
          return '';
        }
        return value;
      };

      const cleanNumber = (value) => {
        if (value === 'Not Available' || value === null || value === undefined) {
          return null;
        }
        const num = Number(value);
        return isNaN(num) ? null : num;
      };

      return {
        master_id: row.master_id || 0,
        
        // Client Information
        name: cleanValue(row.name),
        number: cleanValue(row.number),
        alternate_number: cleanValue(row.alternate_number),
        email: cleanValue(row.email),
        address: cleanValue(row.address),
        city: cleanValue(row.city),
        
        // Status Information
        status: cleanValue(row.status),
        lead_status: cleanValue(row.lead_status),
        lead_stage: cleanValue(row.lead_stage) || 'Closed Deal',
        current_stage: cleanValue(row.current_stage),
        
        // Dates
        created_at: cleanValue(row.created_at),
        followup_date: cleanValue(row.followup_date),
        assign_date: cleanValue(row.assign_date),
        latest_reassignment_date: cleanValue(row.latest_reassignment_date),
        
        // Project Details
        room_length: cleanNumber(row.room_length),
        room_width: cleanNumber(row.room_width),
        room_height: cleanNumber(row.room_height),
        p_type: cleanValue(row.p_type),
        budget_range: cleanValue(row.budget_range),
        time_to_complete: cleanValue(row.time_to_complete),
        site_visit_date: cleanValue(row.site_visit_date),
        demo_date: cleanValue(row.demo_date),
        
        // Contact Numbers
        ar_number: cleanValue(row.ar_number),
        architect_name: cleanValue(row.architect_name),
        ca_number: cleanValue(row.ca_number),
        e_number: cleanValue(row.e_number),
        sm_number: cleanValue(row.sm_number),
        pop_number: cleanValue(row.pop_number),
        other_number: cleanValue(row.other_number),
        
        // Remarks
        quick_remark: cleanValue(row.quick_remark),
        detailed_remark: cleanValue(row.detailed_remark),
        latest_remark: cleanValue(row.latest_remark),
        
        // Links
        location_link: cleanValue(row.location_link),
        
        // Category/Reference/Area
        cat_name: cleanValue(row.cat_name),
        reference_name: cleanValue(row.reference_name),
        area_name: cleanValue(row.area_name),
        
        // Assignment Info
        assigned_to: cleanValue(row.latest_assigned_to || row.telecaller_name),
        telecaller_name: cleanValue(row.telecaller_name)
      };
    });

    /* ================= RESPONSE WITH PAGINATION ================= */
    return res.status(200).json({
      success: true,
      data: formattedRows,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        showingStart: offset + 1,
        showingEnd: Math.min(offset + limit, total)
      }
    });

  } catch (error) {
    console.error("❌ Error in getClosedLeadsData:", error);
    res.status(500).json({ 
      message: "Failed to fetch closed leads data",
      error: error.message 
    });
  }
}; 

export const getPreExecutionLeadsData = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Unauthorized: No session" });
    }

    const { id: userId, role } = req.session.user;

    /* ================= PAGINATION PARAMETERS ================= */
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({
        message: "Invalid pagination parameters. Page must be >=1, limit between 1-100"
      });
    }

    /* ================= CURRENT USER ================= */
    const [userResult] = await db.query(
      "SELECT name FROM users WHERE user_id = ?",
      [userId]
    );
    const currentUserName = userResult[0]?.name || "";

    /* ================= TOTAL COUNT QUERY ================= */
    let countQuery = `
      SELECT COUNT(DISTINCT rd.master_id) as total
      FROM raw_data rd
      LEFT JOIN (
        SELECT r1.*, ROW_NUMBER() OVER (PARTITION BY master_id ORDER BY id DESC) rn
        FROM reassignment r1
      ) lr ON rd.master_id = lr.master_id AND lr.rn = 1
      WHERE rd.lead_stage = 'Pre Execution'
         OR lr.leadStage = 'Pre Execution'
    `;

    const countParams = [];

    if (isTelecallerLike(role)) {
      countQuery += ` AND lr.assignedTo = ?`;
      countParams.push(currentUserName);
    }

    const [countResult] = await db.query(countQuery, countParams);
    const total = countResult[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    /* ================= MAIN QUERY ================= */
    let query = `
      SELECT 
        rd.master_id,

        -- CLIENT INFO
        IFNULL(rd.name, 'Not Available') AS name,
        IFNULL(rd.number, 'Not Available') AS number,
        IFNULL(rd.alternate_number, 'Not Available') AS alternate_number,
        IFNULL(rd.email, 'Not Available') AS email,
        IFNULL(rd.address, 'Not Available') AS address,
        IFNULL(rd.city, 'Not Available') AS city,

        -- STATUS & STAGE
        IFNULL(rd.status, 'Not Available') AS status,
        IFNULL(rd.lead_status, 'Not Available') AS lead_status,
        IFNULL(rd.lead_stage, 'Not Available') AS lead_stage,
        IFNULL(rd.current_stage, 'Not Available') AS current_stage,

        -- DATES
        IFNULL(rd.created_at, 'Not Available') AS created_at,
        IFNULL(rd.followup_date, 'Not Available') AS followup_date,

        -- PROJECT DETAILS
        IFNULL(rd.room_length, 'Not Available') AS room_length,
        IFNULL(rd.room_width, 'Not Available') AS room_width,
        IFNULL(rd.room_height, 'Not Available') AS room_height,
        IFNULL(rd.p_type, 'Not Available') AS p_type,
        IFNULL(rd.budget_range, 'Not Available') AS budget_range,
        IFNULL(rd.time_to_complete, 'Not Available') AS time_to_complete,
        IFNULL(rd.site_visit_date, 'Not Available') AS site_visit_date,
        IFNULL(rd.demo_date, 'Not Available') AS demo_date,

        -- CONTACT NUMBERS
        IFNULL(rd.ar_number, 'Not Available') AS ar_number,
        IFNULL(rd.architect_name, 'Not Available') AS architect_name,
        IFNULL(rd.ca_number, 'Not Available') AS ca_number,
        IFNULL(rd.e_number, 'Not Available') AS e_number,
        IFNULL(rd.sm_number, 'Not Available') AS sm_number,
        IFNULL(rd.pop_number, 'Not Available') AS pop_number,
        IFNULL(rd.other_number, 'Not Available') AS other_number,

        -- REMARKS
        IFNULL(rd.quick_remark, 'Not Available') AS quick_remark,
        IFNULL(rd.detailed_remark, 'Not Available') AS detailed_remark,

        -- LINKS
        IFNULL(rd.location_link, 'Not Available') AS location_link,

        -- CATEGORY/REFERENCE/AREA
        IFNULL(c.cat_name, 'Not Available') AS cat_name,
        IFNULL(ref.reference_name, 'Not Available') AS reference_name,
        IFNULL(a.area_name, 'Not Available') AS area_name,

        -- ASSIGNMENT INFO
        IFNULL(DATE(asg.assign_date), 'Not Available') AS assign_date,

        -- LATEST ASSIGNED USER
        lr.assignedTo AS latest_assigned_to,
        lr.remark AS latest_remark,
        DATE(lr.reassignment_date) AS latest_reassignment_date,

        -- TELECALLER INFO
        IFNULL(u.name, 'Not Available') AS telecaller_name,
        u.user_id AS assigned_to_user_id

      FROM raw_data rd

      LEFT JOIN area a ON rd.area_id = a.area_id
      LEFT JOIN category c ON rd.cat_id = c.cat_id
      LEFT JOIN reference ref ON rd.reference_id = ref.reference_id
      LEFT JOIN assignments asg ON rd.assign_id = asg.assign_id

      LEFT JOIN (
        SELECT r1.*, ROW_NUMBER() OVER (PARTITION BY master_id ORDER BY id DESC) rn
        FROM reassignment r1
      ) lr ON rd.master_id = lr.master_id AND lr.rn = 1

      LEFT JOIN users u ON lr.assignedTo = u.name
    `;

    const params = [];

    /* ================= PRE EXECUTION FILTER ================= */
    query += `
      WHERE (rd.lead_stage = 'Pre Execution' OR lr.leadStage = 'Pre Execution')
    `;

    if (isTelecallerLike(role)) {
      query += ` AND lr.assignedTo = ?`;
      params.push(currentUserName);
    }

    query += ` GROUP BY rd.master_id ORDER BY rd.master_id DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [rows] = await db.query(query, params);

    /* ================= FORMAT RESPONSE ================= */
    const formattedRows = rows.map(row => {
      const cleanValue = (value) => {
        if (!value || value === 'Not Available') return '';
        return value;
      };

      const cleanNumber = (value) => {
        if (!value || value === 'Not Available') return null;
        const num = Number(value);
        return isNaN(num) ? null : num;
      };

      return {
        master_id: row.master_id || 0,

        name: cleanValue(row.name),
        number: cleanValue(row.number),
        alternate_number: cleanValue(row.alternate_number),
        email: cleanValue(row.email),
        address: cleanValue(row.address),
        city: cleanValue(row.city),

        status: cleanValue(row.status),
        lead_status: cleanValue(row.lead_status),
        lead_stage: cleanValue(row.lead_stage) || 'Pre Execution',
        current_stage: cleanValue(row.current_stage),

        created_at: cleanValue(row.created_at),
        followup_date: cleanValue(row.followup_date),
        assign_date: cleanValue(row.assign_date),
        latest_reassignment_date: cleanValue(row.latest_reassignment_date),

        room_length: cleanNumber(row.room_length),
        room_width: cleanNumber(row.room_width),
        room_height: cleanNumber(row.room_height),

        p_type: cleanValue(row.p_type),
        budget_range: cleanValue(row.budget_range),
        time_to_complete: cleanValue(row.time_to_complete),
        site_visit_date: cleanValue(row.site_visit_date),
        demo_date: cleanValue(row.demo_date),

        ar_number: cleanValue(row.ar_number),
        architect_name: cleanValue(row.architect_name),
        ca_number: cleanValue(row.ca_number),
        e_number: cleanValue(row.e_number),
        sm_number: cleanValue(row.sm_number),
        pop_number: cleanValue(row.pop_number),
        other_number: cleanValue(row.other_number),

        quick_remark: cleanValue(row.quick_remark),
        detailed_remark: cleanValue(row.detailed_remark),
        latest_remark: cleanValue(row.latest_remark),

        location_link: cleanValue(row.location_link),

        cat_name: cleanValue(row.cat_name),
        reference_name: cleanValue(row.reference_name),
        area_name: cleanValue(row.area_name),

        assigned_to: cleanValue(row.latest_assigned_to || row.telecaller_name),
        telecaller_name: cleanValue(row.telecaller_name)
      };
    });

    /* ================= RESPONSE ================= */
    return res.status(200).json({
      success: true,
      data: formattedRows,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        showingStart: offset + 1,
        showingEnd: Math.min(offset + limit, total)
      }
    });

  } catch (error) {
    console.error("❌ Error in getPreExecutionLeadsData:", error);
    res.status(500).json({
      message: "Failed to fetch Pre Execution leads data",
      error: error.message
    });
  }
};


// Get all schedules for dropdown
export const getSchedulesForDropdown = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT schedule_id, schedule_name, description 
      FROM schedules_master 
      WHERE status = 'active'
      ORDER BY schedule_name
    `);
    
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Error fetching schedules:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getScheduleMappingWithDetails = async (req,res)=>{
 try{

  const { scheduleId } = req.params;

  const [rows] = await db.query(`
   SELECT stpm.*, et.type_name, pe.process_name
   FROM schedule_type_process_map stpm
   JOIN execution_type et ON et.type_id=stpm.type_id
   JOIN process_execution pe ON pe.process_id=stpm.process_id
   WHERE stpm.schedule_id=?
   ORDER BY et.type_name
  `,[scheduleId]);

  res.json({ success:true, data:rows });

 }catch(err){
  res.status(500).json({ success:false, error:err.message });
 }
};



// Create execution start
export const createExecutionStart1 = async (req, res) => {
  try {
    const { 
      schedule_id, 
      schedule_name, 
      start_date, 
      end_date, 
      remark, 
      assigned_users, 
      lead_ids 
    } = req.body;

    const { id: created_by, name: created_by_name } = req.session.user;

    // Validate
    if (!schedule_id || !start_date || !end_date) {
      return res.status(400).json({ 
        success: false, 
        message: "Schedule, start date and end date are required" 
      });
    }

    if (!assigned_users || assigned_users.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Please assign at least one user" 
      });
    }

    if (!lead_ids || lead_ids.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Please select at least one lead" 
      });
    }

    // Convert arrays to comma-separated strings
    const assignedUsersStr = Array.isArray(assigned_users) 
      ? assigned_users.join(',') 
      : assigned_users;
    
    const leadIdsStr = Array.isArray(lead_ids) 
      ? lead_ids.join(',') 
      : lead_ids;

    // Insert into execution_start table
    const [result] = await db.query(
      `INSERT INTO execution_start 
       (schedule_id, schedule_name, start_date, end_date, remark, 
        assigned_users, lead_ids, created_by, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        schedule_id,
        schedule_name,
        start_date,
        end_date,
        remark || '',
        assignedUsersStr,
        leadIdsStr,
        created_by
      ]
    );

    res.json({
      success: true,
      execution_id: result.insertId,
      message: 'Execution started successfully!'
    });

  } catch (err) {
    console.error('Error creating execution:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};


export const createExecutionStart2 = async (req, res) => {
  try {
    const {
      schedule_id,
      schedule_name,
      start_date,
      end_date,
      remark,
      assigned_users,        // ["Rohit", "Amit"]
      assigned_user_ids,     // [2, 5]
      lead_ids               // [101, 102]
    } = req.body;

    const { id: created_by } = req.session.user;

    /* ================= VALIDATION ================= */

    if (!schedule_id || !start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: "Schedule, start date and end date are required"
      });
    }

    if (!assigned_users || assigned_users.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please assign at least one user"
      });
    }

    if (!assigned_user_ids || assigned_user_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "User IDs are required"
      });
    }

    if (!lead_ids || lead_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one lead"
      });
    }

    if (assigned_users.length !== assigned_user_ids.length) {
      return res.status(400).json({
        success: false,
        message: "User names and IDs count mismatch"
      });
    }

    await db.query("START TRANSACTION");

    /* ================= INSERT INTO execution_start ================= */

    const [result] = await db.query(
      `INSERT INTO execution_start
       (schedule_id, schedule_name, start_date, end_date, remark,
        assigned_users, lead_ids, created_by, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'startExecution')`,
      [
        schedule_id,
        schedule_name,
        start_date,
        end_date,
        remark || '',
        assigned_users.join(','),  // keep comma version
        lead_ids.join(','),        // keep comma version
        created_by
      ]
    );

    const execution_id = result.insertId;

    /* ================= INSERT LEADS ROW BY ROW ================= */

    for (const master_id of lead_ids) {
      await db.query(
        `INSERT INTO execution_leads (execution_id, master_id)
         VALUES (?, ?)`,
        [execution_id, master_id]
      );
    }

    /* ================= INSERT USERS ROW BY ROW (NEW TABLE) ================= */

    for (let i = 0; i < assigned_user_ids.length; i++) {
      await db.query(
        `INSERT INTO execution_assigned_users
         (execution_id, user_id, user_name)
         VALUES (?, ?, ?)`,
        [
          execution_id,
          assigned_user_ids[i],
          assigned_users[i]
        ]
      );
    }

    /* ================= COPY SCHEDULE TYPE + PROCESS ================= */

    const [scheduleMappings] = await db.query(
      `SELECT type_id, process_id
       FROM schedule_type_process_map
       WHERE schedule_id = ?`,
      [schedule_id]
    );

    for (const row of scheduleMappings) {
      await db.query(
        `INSERT INTO execution_process_map
         (execution_id, schedule_id, type_id, process_id)
         VALUES (?, ?, ?, ?)`,
        [
          execution_id,
          schedule_id,
          row.type_id,
          row.process_id
        ]
      );
    }

    await db.query("COMMIT");

    res.json({
      success: true,
      execution_id,
      message: "Execution started successfully!"
    });

  } catch (err) {
    await db.query("ROLLBACK");
    console.error("Error creating execution:", err);

    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

export const createExecutionStart3 = async (req, res) => {
  try {
    const {
      schedule_id,
      schedule_name,
      start_date,
      end_date,
      remark,
      assigned_users,
      assigned_user_ids,
      lead_ids
    } = req.body;

    const { id: created_by } = req.session.user;

    /* ================= VALIDATION ================= */

    if (!schedule_id || !start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: "Schedule, start date and end date are required"
      });
    }

    if (!assigned_users || assigned_users.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please assign at least one user"
      });
    }

    if (!assigned_user_ids || assigned_user_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "User IDs are required"
      });
    }

    if (!lead_ids || lead_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one lead"
      });
    }

    if (assigned_users.length !== assigned_user_ids.length) {
      return res.status(400).json({
        success: false,
        message: "User names and IDs count mismatch"
      });
    }

    /* ================= START TRANSACTION ================= */

    await db.query("START TRANSACTION");

    /* ================= INSERT INTO execution_start ================= */

    const [result] = await db.query(
      `INSERT INTO execution_start
       (schedule_id, schedule_name, start_date, end_date, remark,
        assigned_users, lead_ids, created_by, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'startExecution')`,
      [
        schedule_id,
        schedule_name,
        start_date,
        end_date,
        remark || '',
        assigned_users.join(','),   // comma separated
        lead_ids.join(','),         // comma separated
        created_by
      ]
    );

    const execution_id = result.insertId;

    /* ================= INSERT LEADS + UPDATE LEAD_STAGE ================= */

    for (const master_id of lead_ids) {

      // Insert into execution_leads
      await db.query(
        `INSERT INTO execution_leads (execution_id, master_id)
         VALUES (?, ?)`,
        [execution_id, master_id]
      );

      // ✅ Update raw_data.lead_stage = 'Execution'
      await db.query(
        `UPDATE raw_data
         SET lead_stage = 'Execution'
         WHERE master_id = ?`,
        [master_id]
      );
    }

    /* ================= INSERT ASSIGNED USERS ================= */

    for (let i = 0; i < assigned_user_ids.length; i++) {
      await db.query(
        `INSERT INTO execution_assigned_users
         (execution_id, user_id, user_name)
         VALUES (?, ?, ?)`,
        [
          execution_id,
          assigned_user_ids[i],
          assigned_users[i]
        ]
      );
    }

    /* ================= COPY SCHEDULE TYPE + PROCESS ================= */

    const [scheduleMappings] = await db.query(
      `SELECT type_id, process_id
       FROM schedule_type_process_map
       WHERE schedule_id = ?`,
      [schedule_id]
    );

    for (const row of scheduleMappings) {
      await db.query(
        `INSERT INTO execution_process_map
         (execution_id, schedule_id, type_id, process_id)
         VALUES (?, ?, ?, ?)`,
        [
          execution_id,
          schedule_id,
          row.type_id,
          row.process_id
        ]
      );
    }

    /* ================= COMMIT ================= */

    await db.query("COMMIT");

    res.json({
      success: true,
      execution_id,
      message: "Execution started successfully! Lead stage updated to Execution."
    });

  } catch (err) {

    await db.query("ROLLBACK");

    console.error("Error creating execution:", err);

    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};


export const createExecutionStart4 = async (req, res) => {
  try {
    const {
      schedule_id,
      schedule_name,
      start_date,
      end_date,
      remark,
      status = "startExecution",   // ✅ NEW STATUS SUPPORT
      assigned_users,
      assigned_user_ids,
      lead_ids
    } = req.body;

    const { id: created_by } = req.session.user;

    /* ================= VALIDATION ================= */

    if (!schedule_id || !start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: "Schedule, start date and end date are required"
      });
    }

    if (!assigned_users || assigned_users.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please assign at least one user"
      });
    }

    if (!assigned_user_ids || assigned_user_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "User IDs are required"
      });
    }

    if (!lead_ids || lead_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one lead"
      });
    }

    if (assigned_users.length !== assigned_user_ids.length) {
      return res.status(400).json({
        success: false,
        message: "User names and IDs count mismatch"
      });
    }

    /* ================= START TRANSACTION ================= */

    await db.query("START TRANSACTION");

    /* ================= INSERT execution_start ================= */

    const [result] = await db.query(
      `INSERT INTO execution_start
       (schedule_id, schedule_name, start_date, end_date, remark,
        assigned_users, lead_ids, created_by, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        schedule_id,
        schedule_name,
        start_date,
        end_date,
        remark || '',
        assigned_users.join(','),
        lead_ids.join(','),
        created_by,
        status                // ✅ STORED STATUS
      ]
    );

    const execution_id = result.insertId;

    /* ===== LOG execution created ===== */
    await db.query(
      `INSERT INTO execution_logs
       (execution_id, table_name, record_id, field_name, old_value, new_value, action_type, changed_by)
       VALUES (?, 'execution_start', ?, 'execution_created', NULL, ?, 'CREATE', ?)`,
      [execution_id, execution_id, `Execution Started (${status})`, created_by]
    );

    /* ================= INSERT LEADS + UPDATE LEAD_STAGE ================= */

    for (const master_id of lead_ids) {

      /* INSERT execution_leads */
      await db.query(
        `INSERT INTO execution_leads (execution_id, master_id)
         VALUES (?, ?)`,
        [execution_id, master_id]
      );

      /* LOG lead added */
      await db.query(
        `INSERT INTO execution_logs
         (execution_id, table_name, record_id, field_name, old_value, new_value, action_type, changed_by)
         VALUES (?, 'execution_leads', ?, 'lead_added', NULL, ?, 'CREATE', ?)`,
        [execution_id, master_id, master_id, created_by]
      );

      /* GET OLD LEAD STAGE */
      const [[oldLead]] = await db.query(
        `SELECT lead_stage FROM raw_data WHERE master_id = ?`,
        [master_id]
      );

      const oldStage = oldLead?.lead_stage || null;

      /* UPDATE only if stage changed */
      if (oldStage !== 'Execution') {

        await db.query(
          `UPDATE raw_data
           SET lead_stage = 'Execution'
           WHERE master_id = ?`,
          [master_id]
        );

        /* LOG stage change */
        await db.query(
          `INSERT INTO execution_logs
           (execution_id, table_name, record_id, field_name, old_value, new_value, action_type, changed_by)
           VALUES (?, 'raw_data', ?, 'lead_stage', ?, 'Execution', 'STATUS_CHANGE', ?)`,
          [execution_id, master_id, oldStage, created_by]
        );
      }
    }

    /* ================= INSERT ASSIGNED USERS ================= */

    for (let i = 0; i < assigned_user_ids.length; i++) {

      await db.query(
        `INSERT INTO execution_assigned_users
         (execution_id, user_id, user_name)
         VALUES (?, ?, ?)`,
        [
          execution_id,
          assigned_user_ids[i],
          assigned_users[i]
        ]
      );

      /* LOG assigned user */
      await db.query(
        `INSERT INTO execution_logs
         (execution_id, table_name, record_id, field_name, old_value, new_value, action_type, changed_by)
         VALUES (?, 'execution_assigned_users', ?, 'assigned_user', NULL, ?, 'CREATE', ?)`,
        [
          execution_id,
          assigned_user_ids[i],
          assigned_users[i],
          created_by
        ]
      );
    }

    /* ================= COPY SCHEDULE PROCESS ================= */

    const [scheduleMappings] = await db.query(
      `SELECT type_id, process_id
       FROM schedule_type_process_map
       WHERE schedule_id = ?`,
      [schedule_id]
    );

    for (const row of scheduleMappings) {

      await db.query(
        `INSERT INTO execution_process_map
         (execution_id, schedule_id, type_id, process_id)
         VALUES (?, ?, ?, ?)`,
        [
          execution_id,
          schedule_id,
          row.type_id,
          row.process_id
        ]
      );

      /* LOG process mapped */
      await db.query(
        `INSERT INTO execution_logs
         (execution_id, table_name, record_id, field_name, old_value, new_value, action_type, changed_by)
         VALUES (?, 'execution_process_map', ?, 'process_added', NULL, ?, 'CREATE', ?)`,
        [
          execution_id,
          row.process_id,
          row.process_id,
          created_by
        ]
      );
    }

    /* ================= COMMIT ================= */

    await db.query("COMMIT");

    res.json({
      success: true,
      execution_id,
      message: `Execution started successfully with status: ${status}`
    });

  } catch (err) {

    await db.query("ROLLBACK");

    console.error("Error creating execution:", err);

    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

export const createExecutionStart = async (req, res) => {
  try {
    const {
      schedule_id,
      schedule_name,
      start_date,
      end_date,
      remark,
      status = "startExecution",
      assigned_users,
      assigned_user_ids,
      lead_ids
    } = req.body;

    const { id: created_by } = req.session.user;

    if (!schedule_id || !start_date || !end_date)
      return res.status(400).json({ success:false, message:"Schedule, start & end date required" });

    if (!assigned_users?.length || !assigned_user_ids?.length)
      return res.status(400).json({ success:false, message:"Assign users required" });

    if (!lead_ids?.length)
      return res.status(400).json({ success:false, message:"Lead required" });

    await db.query("START TRANSACTION");

    /* ===== INSERT execution_start ===== */
    const [result] = await db.query(
      `INSERT INTO execution_start
       (schedule_id, schedule_name, start_date, end_date, remark,
        assigned_users, lead_ids, created_by, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        schedule_id,
        schedule_name,
        start_date,
        end_date,
        remark || '',
        assigned_users.join(','),
        lead_ids.join(','),
        created_by,
        status
      ]
    );

    const execution_id = result.insertId;

    /* ===== HISTORY: execution created ===== */
    await db.query(
      `INSERT INTO execution_history
       (execution_id, field_name, old_value, new_value, changed_by)
       VALUES (?, 'execution_created', NULL, ?, ?)`,
      [execution_id, `Execution Started (${status})`, created_by]
    );

    /* ===== LEADS ===== */
    for (const master_id of lead_ids) {

      await db.query(
        `INSERT INTO execution_leads (execution_id, master_id)
         VALUES (?, ?)`,
        [execution_id, master_id]
      );

      /* lead added history */
      await db.query(
        `INSERT INTO execution_lead_history
         (execution_id, master_id, action_type, changed_by)
         VALUES (?, ?, 'ADDED', ?)`,
        [execution_id, master_id, created_by]
      );

      /* stage update */
      const [[oldLead]] = await db.query(
        `SELECT lead_stage FROM raw_data WHERE master_id = ?`,
        [master_id]
      );

      const oldStage = oldLead?.lead_stage || null;

      if (oldStage !== 'Execution') {
        await db.query(
          `UPDATE raw_data SET lead_stage='Execution'
           WHERE master_id=?`,
          [master_id]
        );

        await db.query(
          `INSERT INTO execution_lead_history
           (execution_id, master_id, action_type, old_value, new_value, changed_by)
           VALUES (?, ?, 'STAGE_CHANGED', ?, 'Execution', ?)`,
          [execution_id, master_id, oldStage, created_by]
        );
      }
    }

    /* ===== ASSIGNED USERS ===== */
    for (let i = 0; i < assigned_user_ids.length; i++) {

      await db.query(
        `INSERT INTO execution_assigned_users
         (execution_id, user_id, user_name)
         VALUES (?, ?, ?)`,
        [execution_id, assigned_user_ids[i], assigned_users[i]]
      );

      await db.query(
        `INSERT INTO execution_user_history
         (execution_id, user_id, user_name, action_type, changed_by)
         VALUES (?, ?, ?, 'ASSIGNED', ?)`,
        [execution_id, assigned_user_ids[i], assigned_users[i], created_by]
      );
    }

    /* ===== COPY PROCESS ===== */
    const [scheduleMappings] = await db.query(
      `SELECT type_id, process_id
       FROM schedule_type_process_map
       WHERE schedule_id = ?`,
      [schedule_id]
    );

    for (const row of scheduleMappings) {

      await db.query(
        `INSERT INTO execution_process_map
         (execution_id, schedule_id, type_id, process_id)
         VALUES (?, ?, ?, ?)`,
        [execution_id, schedule_id, row.type_id, row.process_id]
      );

      await db.query(
        `INSERT INTO execution_process_history
         (execution_id, process_id, action_type, changed_by)
         VALUES (?, ?, 'ADDED', ?)`,
        [execution_id, row.process_id, created_by]
      );
    }

    await db.query("COMMIT");

    res.json({
      success:true,
      execution_id,
      message:`Execution started (${status})`
    });

  } catch (err) {
    await db.query("ROLLBACK");
    res.status(500).json({ success:false, error:err.message });
  }
};


export const updateExecution = async (req, res) => {
  try {
    const { execution_id } = req.params;
    const {
      start_date,
      end_date,
      remark,
      status,
      assigned_users,
      assigned_user_ids
    } = req.body;

    const { id: changed_by } = req.session.user;

    await db.query("START TRANSACTION");

    const [rows] = await db.query(
      `SELECT * FROM execution_start WHERE execution_id=?`,
      [execution_id]
    );

    if (!rows.length) {
      await db.query("ROLLBACK");
      return res.status(404).json({ success:false, message:"Execution not found" });
    }

    const old = rows[0];
    const updates = [];
    const values = [];

    const logField = async (field, oldVal, newVal) => {
      if (oldVal != newVal) {
        await db.query(
          `INSERT INTO execution_history
           (execution_id, field_name, old_value, new_value, changed_by)
           VALUES (?, ?, ?, ?, ?)`,
          [execution_id, field, oldVal, newVal, changed_by]
        );
      }
    };

    if (start_date && start_date !== old.start_date) {
      updates.push("start_date=?");
      values.push(start_date);
      await logField("start_date", old.start_date, start_date);
    }

    if (end_date && end_date !== old.end_date) {
      updates.push("end_date=?");
      values.push(end_date);
      await logField("end_date", old.end_date, end_date);
    }

    if (remark !== undefined && remark !== old.remark) {
      updates.push("remark=?");
      values.push(remark);
      await logField("remark", old.remark, remark);
    }

    if (status && status !== old.status) {
      updates.push("status=?");
      values.push(status);
      await logField("status", old.status, status);
    }

    if (updates.length) {
      updates.push("updated_at=CURRENT_TIMESTAMP");
      values.push(execution_id);

      await db.query(
        `UPDATE execution_start SET ${updates.join(",")}
         WHERE execution_id=?`,
        values
      );
    }

    /* ===== USER REASSIGNMENT ===== */
    if (assigned_user_ids && assigned_users) {

      const [oldUsers] = await db.query(
        `SELECT user_id,user_name
         FROM execution_assigned_users
         WHERE execution_id=?`,
        [execution_id]
      );

      const oldIds = oldUsers.map(u=>u.user_id);

      /* removed */
      for (const u of oldUsers) {
        if (!assigned_user_ids.includes(u.user_id)) {
          await db.query(
            `INSERT INTO execution_user_history
             (execution_id,user_id,user_name,action_type,changed_by)
             VALUES (?,?,?,'REMOVED',?)`,
            [execution_id, u.user_id, u.user_name, changed_by]
          );
        }
      }

      /* added */
      for (let i=0;i<assigned_user_ids.length;i++) {
        if (!oldIds.includes(assigned_user_ids[i])) {
          await db.query(
            `INSERT INTO execution_user_history
             (execution_id,user_id,user_name,action_type,changed_by)
             VALUES (?,?,?,'ASSIGNED',?)`,
            [execution_id, assigned_user_ids[i], assigned_users[i], changed_by]
          );
        }
      }

      await db.query(
        `DELETE FROM execution_assigned_users
         WHERE execution_id=?`,
        [execution_id]
      );

      for (let i=0;i<assigned_user_ids.length;i++) {
        await db.query(
          `INSERT INTO execution_assigned_users
           (execution_id,user_id,user_name)
           VALUES (?,?,?)`,
          [execution_id, assigned_user_ids[i], assigned_users[i]]
        );
      }
    }

    await db.query("COMMIT");

    res.json({
      success:true,
      message:"Execution updated with structured history"
    });

  } catch (err) {
    await db.query("ROLLBACK");
    res.status(500).json({ success:false, error:err.message });
  }
};


export const updateExecution1 = async (req, res) => {
  try {
    const { execution_id } = req.params;
    const {
      start_date,
      end_date,
      remark,
      status,
      assigned_users,
      assigned_user_ids
    } = req.body;

    const { id: changed_by } = req.session.user;

    await db.query("START TRANSACTION");

    /* ===== GET CURRENT EXECUTION ===== */
    const [rows] = await db.query(
      `SELECT * FROM execution_start WHERE execution_id = ?`,
      [execution_id]
    );

    if (rows.length === 0) {
      await db.query("ROLLBACK");
      return res.status(404).json({ success: false, message: "Execution not found" });
    }

    const old = rows[0];

    /* ===== UPDATE execution_start + FIELD LOGS ===== */
    const updates = [];
    const values = [];

    const logField = async (field, oldVal, newVal) => {
      if (oldVal != newVal) {
        await db.query(
          `INSERT INTO execution_logs
           (execution_id, table_name, record_id, field_name, old_value, new_value, action_type, changed_by)
           VALUES (?, 'execution_start', ?, ?, ?, ?, 'UPDATE', ?)`,
          [execution_id, execution_id, field, oldVal, newVal, changed_by]
        );
      }
    };

    if (start_date && start_date !== old.start_date) {
      updates.push("start_date = ?");
      values.push(start_date);
      await logField("start_date", old.start_date, start_date);
    }

    if (end_date && end_date !== old.end_date) {
      updates.push("end_date = ?");
      values.push(end_date);
      await logField("end_date", old.end_date, end_date);
    }

    if (remark !== undefined && remark !== old.remark) {
      updates.push("remark = ?");
      values.push(remark);
      await logField("remark", old.remark, remark);
    }

    if (status && status !== old.status) {
      updates.push("status = ?");
      values.push(status);
      await logField("status", old.status, status);
    }

    if (assigned_users) {
      const newUsersStr = assigned_users.join(',');
      if (newUsersStr !== old.assigned_users) {
        updates.push("assigned_users = ?");
        values.push(newUsersStr);

        await logField("assigned_users", old.assigned_users, newUsersStr);
      }
    }

    if (updates.length > 0) {
      updates.push("updated_at = CURRENT_TIMESTAMP");
      values.push(execution_id);

      await db.query(
        `UPDATE execution_start SET ${updates.join(", ")} WHERE execution_id = ?`,
        values
      );
    }

    /* ===== USER ASSIGNMENT CHANGES ===== */
    if (assigned_users && assigned_user_ids) {

      const [oldUsersRows] = await db.query(
        `SELECT user_id, user_name
         FROM execution_assigned_users
         WHERE execution_id = ?`,
        [execution_id]
      );

      const oldUserIds = oldUsersRows.map(u => u.user_id);
      const newUserIds = assigned_user_ids;

      /* USERS REMOVED */
      for (const oldUser of oldUsersRows) {
        if (!newUserIds.includes(oldUser.user_id)) {

          await db.query(
            `INSERT INTO execution_logs
             (execution_id, table_name, record_id, field_name, old_value, new_value, action_type, changed_by)
             VALUES (?, 'execution_assigned_users', ?, 'assigned_user', ?, NULL, 'DELETE', ?)`,
            [execution_id, oldUser.user_id, oldUser.user_name, changed_by]
          );
        }
      }

      /* USERS ADDED */
      for (let i = 0; i < newUserIds.length; i++) {
        if (!oldUserIds.includes(newUserIds[i])) {

          await db.query(
            `INSERT INTO execution_logs
             (execution_id, table_name, record_id, field_name, old_value, new_value, action_type, changed_by)
             VALUES (?, 'execution_assigned_users', ?, 'assigned_user', NULL, ?, 'CREATE', ?)`,
            [execution_id, newUserIds[i], assigned_users[i], changed_by]
          );
        }
      }

      /* REPLACE ASSIGNMENTS TABLE */
      await db.query(
        `DELETE FROM execution_assigned_users WHERE execution_id = ?`,
        [execution_id]
      );

      for (let i = 0; i < assigned_user_ids.length; i++) {
        await db.query(
          `INSERT INTO execution_assigned_users
           (execution_id, user_id, user_name)
           VALUES (?, ?, ?)`,
          [execution_id, assigned_user_ids[i], assigned_users[i]]
        );
      }
    }

    await db.query("COMMIT");

    res.json({
      success: true,
      message: "Execution updated with field-level logs"
    });

  } catch (err) {
    await db.query("ROLLBACK");
    console.error("Update execution error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};


// Get all started executions
export const getAllStartedExecutions = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT es.*, u.name as created_by_name,
             LENGTH(es.lead_ids) - LENGTH(REPLACE(es.lead_ids, ',', '')) + 1 as lead_count,
             LENGTH(es.assigned_users) - LENGTH(REPLACE(es.assigned_users, ',', '')) + 1 as user_count
      FROM execution_start es
      LEFT JOIN users u ON es.created_by = u.user_id
      ORDER BY es.created_at DESC
    `);
    
    // Parse comma-separated strings back to arrays
    const parsedRows = rows.map(row => ({
      ...row,
      lead_ids: row.lead_ids ? row.lead_ids.split(',') : [],
      assigned_users: row.assigned_users ? row.assigned_users.split(',') : []
    }));
    
    res.json({ success: true, data: parsedRows });
  } catch (err) {
    console.error('Error fetching executions:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Delete execution start
export const deleteExecutionStart = async (req, res) => {
  try {
    const { id } = req.params;
    
    await db.query(
      `DELETE FROM execution_start WHERE execution_id = ?`,
      [id]
    );
    
    res.json({ success: true, message: 'Execution deleted successfully' });
  } catch (err) {
    console.error('Error deleting execution:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};


export const getExecutionPrefill1 = async (req, res) => {
  try {
    const { masterId } = req.params;

    /* ================= FIND EXECUTION ================= */
    const [executionRows] = await db.query(
      `
      SELECT es.*
      FROM execution_start es
      JOIN execution_leads el 
        ON el.execution_id = es.execution_id
      WHERE el.master_id = ?
      LIMIT 1
      `,
      [masterId]
    );

    if (executionRows.length === 0) {
     res.json({
  success: true,
  exists: true,
  data: {
    execution_id: execution.execution_id,
    schedule_id: execution.schedule_id,
    schedule_name: execution.schedule_name,
    start_date: execution.start_date,
    end_date: execution.end_date,
    remark: execution.remark,
    status: execution.status,        // ✅ ADD THIS
    assigned_users,
    assigned_user_ids,
  },
});

    }

    const execution = executionRows[0];

    /* ================= USERS ================= */
    const [userRows] = await db.query(
      `
      SELECT user_id, user_name
      FROM execution_assigned_users
      WHERE execution_id = ?
      `,
      [execution.execution_id]
    );

    const assigned_user_ids = userRows.map(u => u.user_id);
    const assigned_users = userRows.map(u => u.user_name);

    /* ================= RESPONSE ================= */
    res.json({
      success: true,
      exists: true,
      data: {
        execution_id: execution.execution_id,
        schedule_id: execution.schedule_id,
        schedule_name: execution.schedule_name,
        start_date: execution.start_date,
        end_date: execution.end_date,
        remark: execution.remark,
        assigned_users,
        assigned_user_ids,
      },
    });

  } catch (err) {
    console.error("Prefill execution error:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};


export const getExecutionPrefill = async (req, res) => {
  try {
    const { masterId } = req.params;

    /* ================= FIND EXECUTION ================= */
    const [executionRows] = await db.query(
      `
      SELECT es.*
      FROM execution_start es
      JOIN execution_leads el 
        ON el.execution_id = es.execution_id
      WHERE el.master_id = ?
      LIMIT 1
      `,
      [masterId]
    );

    if (executionRows.length === 0) {
      return res.json({
        success: true,
        exists: false,
        data: null
      });
    }

    const execution = executionRows[0];

    /* ================= USERS ================= */
    const [userRows] = await db.query(
      `
      SELECT user_id, user_name
      FROM execution_assigned_users
      WHERE execution_id = ?
      `,
      [execution.execution_id]
    );

    const assigned_user_ids = userRows.map(u => u.user_id);
    const assigned_users = userRows.map(u => u.user_name);

    /* ================= FIX DATES - Remove timezone offset ================= */
    // Format dates to YYYY-MM-DD to avoid timezone issues
    const formatDateForDisplay = (date) => {
      if (!date) return null;
      
      // If it's a Date object or string, convert to YYYY-MM-DD
      const d = new Date(date);
      if (isNaN(d.getTime())) return null;
      
      // Format as YYYY-MM-DD to avoid timezone shifting
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    };

    /* ================= RESPONSE ================= */
    res.json({
      success: true,
      exists: true,
      data: {
        execution_id: execution.execution_id,
        schedule_id: execution.schedule_id,
        schedule_name: execution.schedule_name,
        start_date: formatDateForDisplay(execution.start_date), // Fixed date format
        end_date: formatDateForDisplay(execution.end_date),     // Fixed date format
        remark: execution.remark,
        status: execution.status || "startExecution",           // ✅ ADD STATUS FIELD
        assigned_users,
        assigned_user_ids,
      },
    });

  } catch (err) {
    console.error("Prefill execution error:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};



export const updateExecutionLeads = async (req, res) => {
  try {
    const { execution_id } = req.params;
    const { add_leads = [], remove_leads = [] } = req.body;
    const { id: changed_by, name: changed_by_name } = req.session.user;

    await db.query("START TRANSACTION");

    // Get execution details for logging
    const [executionData] = await db.query(
      `SELECT * FROM execution_start WHERE execution_id = ?`,
      [execution_id]
    );

    if (executionData.length === 0) {
      await db.query("ROLLBACK");
      return res.status(404).json({ 
        success: false, 
        message: "Execution not found" 
      });
    }

    // Add new leads
    for (const master_id of add_leads) {
      // Get current lead stage
      const [leadData] = await db.query(
        `SELECT lead_stage FROM raw_data WHERE master_id = ?`,
        [master_id]
      );
      const old_stage = leadData[0]?.lead_stage || 'Unknown';

      // Check if already in execution
      const [existing] = await db.query(
        `SELECT * FROM execution_leads 
         WHERE execution_id = ? AND master_id = ?`,
        [execution_id, master_id]
      );

      if (existing.length === 0) {
        // Insert into execution_leads
        await db.query(
          `INSERT INTO execution_leads (execution_id, master_id) VALUES (?, ?)`,
          [execution_id, master_id]
        );

        // Update lead stage
        await db.query(
          `UPDATE raw_data SET lead_stage = 'Execution' WHERE master_id = ?`,
          [master_id]
        );

        // ========== LOG LEAD ADDITION ==========
        await db.query(
          `INSERT INTO lead_execution_history
           (lead_id, execution_id, action, old_lead_stage, new_lead_stage, changed_by)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [master_id, execution_id, 'ADDED_TO_EXECUTION', old_stage, 'Execution', changed_by]
        );

        // Update lead_ids in execution_start
        await db.query(
          `UPDATE execution_start 
           SET lead_ids = CONCAT(lead_ids, ',', ?)
           WHERE execution_id = ?`,
          [master_id, execution_id]
        );
      }
    }

    // Remove leads
    for (const master_id of remove_leads) {
      // Get current stage before removal
      const [leadData] = await db.query(
        `SELECT lead_stage FROM raw_data WHERE master_id = ?`,
        [master_id]
      );
      const old_stage = leadData[0]?.lead_stage || 'Unknown';

      // Delete from execution_leads
      await db.query(
        `DELETE FROM execution_leads WHERE execution_id = ? AND master_id = ?`,
        [execution_id, master_id]
      );

      // Revert lead stage (you might want to set to previous stage)
      await db.query(
        `UPDATE raw_data SET lead_stage = 'Closed Deal' WHERE master_id = ?`,
        [master_id]
      );

      // ========== LOG LEAD REMOVAL ==========
      await db.query(
        `INSERT INTO lead_execution_history
         (lead_id, execution_id, action, old_lead_stage, new_lead_stage, changed_by)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [master_id, execution_id, 'REMOVED_FROM_EXECUTION', old_stage, 'Closed Deal', changed_by]
      );

      // Update lead_ids in execution_start
      const [execData] = await db.query(
        `SELECT lead_ids FROM execution_start WHERE execution_id = ?`,
        [execution_id]
      );
      
      if (execData.length > 0) {
        const leadArray = execData[0].lead_ids.split(',').filter(id => id != master_id);
        await db.query(
          `UPDATE execution_start SET lead_ids = ? WHERE execution_id = ?`,
          [leadArray.join(','), execution_id]
        );
      }
    }

    // ========== LOG BATCH UPDATE ==========
    if (add_leads.length > 0 || remove_leads.length > 0) {
      await db.query(
        `INSERT INTO execution_logs 
         (execution_id, action_type, new_data, changed_by, changed_by_name, remarks)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          execution_id,
          'UPDATED',
          JSON.stringify({ added: add_leads.length, removed: remove_leads.length }),
          changed_by,
          changed_by_name,
          `Added ${add_leads.length} leads, removed ${remove_leads.length} leads`
        ]
      );
    }

    await db.query("COMMIT");

    res.json({
      success: true,
      message: `Added ${add_leads.length} leads, removed ${remove_leads.length} leads`
    });

  } catch (err) {
    await db.query("ROLLBACK");
    console.error("Error updating execution leads:", err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

export const getExecutionHistory = async (req, res) => {
  try {
    const { execution_id } = req.params;
    
    // Get execution logs
    const [logs] = await db.query(
      `SELECT * FROM execution_logs 
       WHERE execution_id = ? 
       ORDER BY changed_at DESC`,
      [execution_id]
    );

    // Get lead history for this execution
    const [leadHistory] = await db.query(
      `SELECT lh.*, rd.name as lead_name
       FROM lead_execution_history lh
       LEFT JOIN raw_data rd ON lh.lead_id = rd.master_id
       WHERE lh.execution_id = ?
       ORDER BY lh.changed_at DESC`,
      [execution_id]
    );

    // Get process logs for all leads in this execution
    const [processLogs] = await db.query(
      `SELECT epul.*, u.name as updated_by_name, rd.name as lead_name
       FROM execution_process_update_logs epul
       JOIN raw_data rd ON epul.lead_id = rd.master_id
       LEFT JOIN users u ON epul.updated_by = u.user_id
       WHERE epul.lead_id IN (
         SELECT master_id FROM execution_leads WHERE execution_id = ?
       )
       ORDER BY epul.created_at DESC
       LIMIT 100`,
      [execution_id]
    );

    res.json({
      success: true,
      data: {
        execution_logs: logs,
        lead_history: leadHistory,
        recent_process_logs: processLogs
      }
    });

  } catch (err) {
    console.error("Error fetching execution history:", err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

export const getExecutionLogsForLead = async (req, res) => {
  try {
    const { leadId } = req.params;

    /* ================= FIND EXECUTIONS FOR LEAD ================= */
    const [execRows] = await db.query(
      `SELECT execution_id
       FROM execution_leads
       WHERE master_id = ?`,
      [leadId]
    );

    if (!execRows.length) {
      return res.json({ success: true, data: [] });
    }

    const executionIds = execRows.map(e => e.execution_id);

    /* ================= FETCH ALL LOGS ================= */
    const [logs] = await db.query(
      `SELECT 
          el.log_id,
          el.execution_id,
          el.table_name,
          el.record_id,
          el.field_name,
          el.old_value,
          el.new_value,
          el.action_type,
          el.changed_at,
          u.name AS changed_by
       FROM execution_logs el
       LEFT JOIN users u 
         ON el.changed_by = u.user_id
       WHERE el.execution_id IN (${executionIds.map(() => "?").join(",")})
       ORDER BY el.changed_at DESC`,
      executionIds
    );

    /* ================= FORMAT MESSAGES ================= */
    const formatted = logs.map(log => {
      let message = "";

      // execution start
      if (log.table_name === "execution_start") {
        message = `Execution ${log.execution_id} started`;
      }

      // lead added
      else if (log.table_name === "execution_leads") {
        message = `Lead ${log.new_value} added`;
      }

      // lead stage change
      else if (log.table_name === "raw_data" && log.field_name === "lead_stage") {
        message = `Lead ${log.record_id} moved ${log.old_value} → ${log.new_value}`;
      }

      // user assignment
      else if (log.table_name === "execution_assigned_users") {
        if (log.action_type === "CREATE") {
          message = `${log.new_value} assigned`;
        } else if (log.action_type === "DELETE") {
          message = `${log.old_value} removed`;
        }
      }

      // process added
      else if (log.table_name === "execution_process_map") {
        message = `Process ${log.new_value} added`;
      }

      // fallback
      else {
        message = `${log.field_name}`;
      }

      return {
        log_id: log.log_id,
        execution_id: log.execution_id,
        message,
        changed_by: log.changed_by || "System",
        changed_at: log.changed_at
      };
    });

    res.json({
      success: true,
      data: formatted
    });

  } catch (err) {
    console.error("Error fetching execution logs:", err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};



export const getExecutionLogs1 = async (req, res) => {
  try {
    const { execution_id } = req.params;

    const [logs] = await db.query(`
      SELECT 
        el.*,
        u.name AS changed_by_name
      FROM execution_logs el
      LEFT JOIN users u 
        ON el.changed_by = u.user_id
      WHERE el.execution_id = ?
      ORDER BY el.changed_at DESC
    `, [execution_id]);

    // ===== FORMAT HUMAN READABLE =====
    const formatted = logs.map(log => {
      let message = "";

      if (log.table_name === "execution_start" && log.field_name === "execution_created") {
        message = `Execution started`;
      }

      else if (log.table_name === "execution_leads" && log.field_name === "lead_added") {
        message = `Lead ${log.new_value} added to execution`;
      }

      else if (log.table_name === "raw_data" && log.field_name === "lead_stage") {
        message = `Lead ${log.record_id} moved ${log.old_value} → ${log.new_value}`;
      }

      else if (log.table_name === "execution_assigned_users") {
        if (log.action_type === "CREATE") {
          message = `${log.new_value} assigned`;
        } else if (log.action_type === "DELETE") {
          message = `${log.old_value} removed`;
        }
      }

      else if (log.table_name === "execution_process_map") {
        message = `Process ${log.new_value} added`;
      }

      else {
        message = `${log.field_name} updated`;
      }

      return {
        log_id: log.log_id,
        execution_id: log.execution_id,
        message,
        changed_by: log.changed_by_name,
        changed_at: log.changed_at
      };
    });

    res.json({
      success: true,
      data: formatted
    });

  } catch (err) {
    console.error("Error fetching execution logs:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getExecutionLogs = async (req, res) => {
  try {
    const { execution_id } = req.params;

    /* ===== EXECUTION FIELD HISTORY ===== */
    const [execHist] = await db.query(`
      SELECT 
        eh.history_id AS log_id,
        eh.execution_id,
        eh.field_name,
        eh.old_value,
        eh.new_value,
        eh.changed_at,
        u.name AS changed_by_name,
        'EXECUTION' AS source
      FROM execution_history eh
      LEFT JOIN users u 
        ON eh.changed_by = u.user_id
      WHERE eh.execution_id = ?
    `, [execution_id]);

    /* ===== USER HISTORY ===== */
    const [userHist] = await db.query(`
      SELECT 
        euh.id AS log_id,
        euh.execution_id,
        euh.user_name,
        euh.action_type,
        euh.changed_at,
        u.name AS changed_by_name,
        'USER' AS source
      FROM execution_user_history euh
      LEFT JOIN users u 
        ON euh.changed_by = u.user_id
      WHERE euh.execution_id = ?
    `, [execution_id]);

    /* ===== LEAD HISTORY ===== */
    const [leadHist] = await db.query(`
      SELECT 
        elh.id AS log_id,
        elh.execution_id,
        elh.master_id,
        elh.action_type,
        elh.old_value,
        elh.new_value,
        elh.changed_at,
        u.name AS changed_by_name,
        'LEAD' AS source
      FROM execution_lead_history elh
      LEFT JOIN users u 
        ON elh.changed_by = u.user_id
      WHERE elh.execution_id = ?
    `, [execution_id]);

    /* ===== PROCESS HISTORY ===== */
    const [procHist] = await db.query(`
      SELECT 
        eph.id AS log_id,
        eph.execution_id,
        eph.process_id,
        eph.action_type,
        eph.changed_at,
        u.name AS changed_by_name,
        'PROCESS' AS source
      FROM execution_process_history eph
      LEFT JOIN users u 
        ON eph.changed_by = u.user_id
      WHERE eph.execution_id = ?
    `, [execution_id]);

    /* ===== MERGE ALL ===== */
    const allLogs = [
      ...execHist,
      ...userHist,
      ...leadHist,
      ...procHist
    ];

    /* ===== FORMAT HUMAN MESSAGE ===== */
    const formatted = allLogs.map(log => {
      let message = "";

      if (log.source === "EXECUTION") {
        if (log.field_name === "execution_created") {
          message = "Execution started";
        } else {
          message = `${log.field_name} changed ${log.old_value || ""} → ${log.new_value}`;
        }
      }

      else if (log.source === "USER") {
        if (log.action_type === "ASSIGNED") {
          message = `${log.user_name} assigned`;
        } else if (log.action_type === "REMOVED") {
          message = `${log.user_name} removed`;
        }
      }

      else if (log.source === "LEAD") {
        if (log.action_type === "ADDED") {
          message = `Lead ${log.master_id} added`;
        } 
        else if (log.action_type === "REMOVED") {
          message = `Lead ${log.master_id} removed`;
        }
        else if (log.action_type === "STAGE_CHANGED") {
          message = `Lead ${log.master_id} moved ${log.old_value} → ${log.new_value}`;
        }
      }

      else if (log.source === "PROCESS") {
        if (log.action_type === "ADDED") {
          message = `Process ${log.process_id} added`;
        } else if (log.action_type === "REMOVED") {
          message = `Process ${log.process_id} removed`;
        }
      }

      return {
        log_id: log.log_id,
        execution_id: log.execution_id,
        message,
        changed_by: log.changed_by_name,
        changed_at: log.changed_at
      };
    });

    /* ===== SORT TIMELINE ===== */
    formatted.sort((a, b) => new Date(b.changed_at) - new Date(a.changed_at));

    res.json({
      success: true,
      data: formatted
    });

  } catch (err) {
    console.error("Error fetching execution logs:", err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};


export const getExecutionById1 = async (req, res) => {
  try {
    const { execution_id } = req.params;

    /* ===== MAIN EXECUTION ===== */
    const [[execution]] = await db.query(
      `SELECT *
       FROM execution_start
       WHERE execution_id = ?`,
      [execution_id]
    );

    if (!execution) {
      return res.status(404).json({
        success: false,
        message: ""
      });
    }

    /* ===== USERS ===== */
    const [users] = await db.query(
      `SELECT user_id, user_name
       FROM execution_assigned_users
       WHERE execution_id = ?`,
      [execution_id]
    );

    /* ===== LEADS ===== */
    const [leads] = await db.query(
      `SELECT master_id
       FROM execution_leads
       WHERE execution_id = ?`,
      [execution_id]
    );

    /* ===== PROCESSES ===== */
    const [processes] = await db.query(
      `SELECT process_id, type_id
       FROM execution_process_map
       WHERE execution_id = ?`,
      [execution_id]
    );

    /* ===== LOGS (TABULAR SAME AS DB) ===== */
    const [logs] = await db.query(
      `SELECT 
          el.changed_at,
          el.table_name,
          el.field_name,
          el.old_value,
          el.new_value,
          el.action_type,
          u.name AS changed_by
       FROM execution_logs el
       LEFT JOIN users u 
         ON el.changed_by = u.user_id
       WHERE el.execution_id = ?
       ORDER BY el.changed_at DESC, el.log_id DESC`,
      [execution_id]
    );

    /* ===== RESPONSE ===== */
    res.json({
      success: true,
      data: {
        execution_id: execution.execution_id,
        schedule_id: execution.schedule_id,
        schedule_name: execution.schedule_name,
        start_date: execution.start_date,
        end_date: execution.end_date,
        remark: execution.remark,
        status: execution.status,

        assigned_users: users.map(u => u.user_name),
        assigned_user_ids: users.map(u => u.user_id),

        lead_ids: leads.map(l => l.master_id),

        processes,

        logs   // ✅ SAME TABULAR FORMAT
      }
    });

  } catch (err) {
    console.error("Error fetching execution:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};


export const getExecutionById2 = async (req, res) => {
  try {
    const { execution_id } = req.params;

    /* ===== EXECUTION FIELD HISTORY ===== */
    const [execHist] = await db.query(`
      SELECT 
        eh.history_id AS log_id,
        eh.execution_id,
        eh.field_name,
        eh.old_value,
        eh.new_value,
        eh.changed_at,
        u.name AS changed_by_name,
        'EXECUTION' AS source
      FROM execution_history eh
      LEFT JOIN users u 
        ON eh.changed_by = u.user_id
      WHERE eh.execution_id = ?
    `, [execution_id]);

    /* ===== USER HISTORY ===== */
    const [userHist] = await db.query(`
      SELECT 
        euh.id AS log_id,
        euh.execution_id,
        euh.user_name,
        euh.action_type,
        euh.changed_at,
        u.name AS changed_by_name,
        'USER' AS source
      FROM execution_user_history euh
      LEFT JOIN users u 
        ON euh.changed_by = u.user_id
      WHERE euh.execution_id = ?
    `, [execution_id]);

    /* ===== LEAD HISTORY ===== */
    const [leadHist] = await db.query(`
      SELECT 
        elh.id AS log_id,
        elh.execution_id,
        elh.master_id,
        elh.action_type,
        elh.old_value,
        elh.new_value,
        elh.changed_at,
        u.name AS changed_by_name,
        'LEAD' AS source
      FROM execution_lead_history elh
      LEFT JOIN users u 
        ON elh.changed_by = u.user_id
      WHERE elh.execution_id = ?
    `, [execution_id]);

    /* ===== PROCESS HISTORY ===== */
    const [procHist] = await db.query(`
      SELECT 
        eph.id AS log_id,
        eph.execution_id,
        eph.process_id,
        eph.action_type,
        eph.changed_at,
        u.name AS changed_by_name,
        'PROCESS' AS source
      FROM execution_process_history eph
      LEFT JOIN users u 
        ON eph.changed_by = u.user_id
      WHERE eph.execution_id = ?
    `, [execution_id]);

    /* ===== MERGE ALL ===== */
    const allLogs = [
      ...execHist,
      ...userHist,
      ...leadHist,
      ...procHist
    ];

    /* ===== FORMAT HUMAN MESSAGE ===== */
    const formatted = allLogs.map(log => {
      let message = "";

      if (log.source === "EXECUTION") {
        if (log.field_name === "execution_created") {
          message = "Execution started";
        } else {
          message = `${log.field_name} changed ${log.old_value || ""} → ${log.new_value}`;
        }
      }

      else if (log.source === "USER") {
        if (log.action_type === "ASSIGNED") {
          message = `${log.user_name} assigned`;
        } else if (log.action_type === "REMOVED") {
          message = `${log.user_name} removed`;
        }
      }

      else if (log.source === "LEAD") {
        if (log.action_type === "ADDED") {
          message = `Lead ${log.master_id} added`;
        } 
        else if (log.action_type === "REMOVED") {
          message = `Lead ${log.master_id} removed`;
        }
        else if (log.action_type === "STAGE_CHANGED") {
          message = `Lead ${log.master_id} moved ${log.old_value} → ${log.new_value}`;
        }
      }

      else if (log.source === "PROCESS") {
        if (log.action_type === "ADDED") {
          message = `Process ${log.process_id} added`;
        } else if (log.action_type === "REMOVED") {
          message = `Process ${log.process_id} removed`;
        }
      }

      return {
        log_id: log.log_id,
        execution_id: log.execution_id,
        message,
        changed_by: log.changed_by_name,
        changed_at: log.changed_at
      };
    });

    /* ===== SORT TIMELINE ===== */
    formatted.sort((a, b) => new Date(b.changed_at) - new Date(a.changed_at));

    res.json({
      success: true,
      data: formatted
    });

  } catch (err) {
    console.error("Error fetching execution logs:", err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};


export const getExecutionById = async (req, res) => {
  try {
    const { execution_id } = req.params;

    /* ================= EXECUTION FIELD HISTORY ================= */
    const [execHist] = await db.query(`
      SELECT 
        eh.history_id AS log_id,
        eh.execution_id,
        'EXECUTION' AS source,
        eh.field_name,
        eh.old_value,
        eh.new_value,
        eh.changed_at,
        u.name AS changed_by
      FROM execution_history eh
      LEFT JOIN users u 
        ON eh.changed_by = u.user_id
      WHERE eh.execution_id = ?
    `, [execution_id]);

    /* ================= USER HISTORY ================= */
    const [userHist] = await db.query(`
      SELECT 
        euh.id AS log_id,
        euh.execution_id,
        'USER' AS source,
        'assigned_user' AS field_name,
        NULL AS old_value,
        euh.user_name AS new_value,
        euh.changed_at,
        u.name AS changed_by
      FROM execution_user_history euh
      LEFT JOIN users u 
        ON euh.changed_by = u.user_id
      WHERE euh.execution_id = ?
    `, [execution_id]);

    /* ================= LEAD HISTORY ================= */
    const [leadHist] = await db.query(`
      SELECT 
        elh.id AS log_id,
        elh.execution_id,
        'LEAD' AS source,
        'lead' AS field_name,
        rd_old.name AS old_value,
        rd_new.name AS new_value,
        elh.changed_at,
        u.name AS changed_by
      FROM execution_lead_history elh

      LEFT JOIN raw_data rd_old
        ON elh.old_value = rd_old.master_id

      LEFT JOIN raw_data rd_new
        ON elh.new_value = rd_new.master_id

      LEFT JOIN users u 
        ON elh.changed_by = u.user_id

      WHERE elh.execution_id = ?
    `, [execution_id]);

    /* ================= PROCESS HISTORY (NAME RESOLVED) ================= */
    const [procHist] = await db.query(`
      SELECT 
        eph.id AS log_id,
        eph.execution_id,
        'PROCESS' AS source,
        'process' AS field_name,
        NULL AS old_value,
        p.process_name AS new_value,
        eph.changed_at,
        u.name AS changed_by
      FROM execution_process_history eph

      LEFT JOIN process_execution p
        ON eph.process_id = p.process_id   -- ✅ process name

      LEFT JOIN users u 
        ON eph.changed_by = u.user_id

      WHERE eph.execution_id = ?
    `, [execution_id]);

    /* ================= MERGE ALL LOGS ================= */
    const allLogs = [
      ...execHist,
      ...userHist,
      ...leadHist,
      ...procHist
    ];

    /* ================= SORT TIMELINE ================= */
    allLogs.sort(
      (a, b) => new Date(b.changed_at) - new Date(a.changed_at)
    );

    /* ================= RESPONSE ================= */
    res.json({
      success: true,
      data: allLogs
    });

  } catch (err) {
    console.error("Error fetching execution logs:", err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
}; 



// Get checklist selections for a lead
export const getChecklistSelections = async (req, res) => {
  try {
    const { master_id } = req.params;

    console.log("Fetching checklist for master_id:", master_id); // Debug log

    const [rows] = await db.query(
      `SELECT item_id FROM lead_checklist_items WHERE master_id = ?`,
      [master_id]
    );

    console.log("Found rows:", rows); // Debug log

    const selectedItems = rows.map(row => row.item_id);

    res.json({
      success: true,
      selected_items: selectedItems
    });

  } catch (err) {
    console.error("Error in getChecklistSelections:", err);
    res.status(500).json({ 
      success: false, 
      error: err.message,
      sqlMessage: err.sqlMessage 
    });
  }
};

// Save checklist selections
export const saveChecklistSelections = async (req, res) => {
  try {
    const { master_id } = req.params;
    const { selected_items } = req.body;

    console.log("Saving for master_id:", master_id, "items:", selected_items);

    if (!Array.isArray(selected_items)) {
      return res.status(400).json({ 
        success: false, 
        error: "selected_items must be an array" 
      });
    }

    await db.query("START TRANSACTION");

    // Delete existing selections for this lead
    await db.query(
      `DELETE FROM lead_checklist_items WHERE master_id = ?`,
      [master_id]
    );

    // Insert new selections
    if (selected_items.length > 0) {
      for (const item_id of selected_items) {
        // Get checklist_id for this item
        const [itemData] = await db.query(
          `SELECT checklist_id FROM checklist_items WHERE item_id = ?`,
          [item_id]
        );

        if (itemData.length > 0) {
          await db.query(
            `INSERT INTO lead_checklist_items (master_id, item_id, checklist_id) 
             VALUES (?, ?, ?)`,
            [master_id, item_id, itemData[0].checklist_id]
          );
        } else {
          console.warn(`Item ${item_id} not found in checklist_items table`);
        }
      }
    }

    await db.query("COMMIT");

    res.json({
      success: true,
      message: "Checklist saved successfully",
      count: selected_items.length
    });

  } catch (err) {
    await db.query("ROLLBACK");
    console.error("Error in saveChecklistSelections:", err);
    res.status(500).json({ 
      success: false, 
      error: err.message,
      sqlMessage: err.sqlMessage 
    });
  }
};

// Check if lead has checklist items
export const checkLeadHasChecklistItems = async (req, res) => {
  try {
    const { master_id } = req.params;

    const [rows] = await db.query(
      `SELECT COUNT(*) as count FROM lead_checklist_items WHERE master_id = ?`,
      [master_id]
    );

    res.json({
      success: true,
      has_items: rows[0].count > 0,
      count: rows[0].count
    });

  } catch (err) {
    console.error("Error in checkLeadHasChecklistItems:", err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
};



export const getAllChecklistsWithItems = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        ec.checklist_id,
        ec.checklist_name,
        ci.item_id,
        ci.item_name
      FROM execution_checklist ec
      LEFT JOIN checklist_items ci 
        ON ci.checklist_id = ec.checklist_id
      ORDER BY ec.checklist_id, ci.item_id
    `);

    // Group items by checklist
    const checklistsMap = {};
    
    rows.forEach(row => {
      if (!checklistsMap[row.checklist_id]) {
        checklistsMap[row.checklist_id] = {
          checklist_id: row.checklist_id,
          checklist_name: row.checklist_name,
          items: []
        };
      }
      
      if (row.item_id) {
        checklistsMap[row.checklist_id].items.push({
          item_id: row.item_id,
          item_name: row.item_name
        });
      }
    });

    res.json({
      success: true,
      data: Object.values(checklistsMap)
    });

  } catch (err) {
    console.error("Error in getAllChecklistsWithItems:", err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
};
