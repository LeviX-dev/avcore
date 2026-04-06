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
  
];

const isTelecallerLike = (role) => TELECALLER_ROLES.includes(role);


export const getClosedLeadsDataExe1 = async (req, res) => {
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

      WHERE (rd.lead_stage = 'Closed Deal'
         OR lr.leadStage = 'Closed Deal')

      AND EXISTS (
        SELECT 1 
        FROM execution_start es
        WHERE FIND_IN_SET(rd.master_id, es.lead_ids)
      )
    `;

    const countParams = [];

    if (isTelecallerLike(role)) {
      countQuery += ` AND lr.assignedTo = ?`;
      countParams.push(currentUserName);
    }

    const [countResult] = await db.query(countQuery, countParams);
    const total = countResult[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    /* ================= MAIN DATA QUERY ================= */
    let query = `
      SELECT 
        rd.master_id,

        IFNULL(rd.name, 'Not Available') AS name,
        IFNULL(rd.number, 'Not Available') AS number,
        IFNULL(rd.alternate_number, 'Not Available') AS alternate_number,
        IFNULL(rd.email, 'Not Available') AS email,
        IFNULL(rd.address, 'Not Available') AS address,
        IFNULL(rd.city, 'Not Available') AS city,

        IFNULL(rd.status, 'Not Available') AS status,
        IFNULL(rd.lead_status, 'Not Available') AS lead_status,
        IFNULL(rd.lead_stage, 'Not Available') AS lead_stage,
        IFNULL(rd.current_stage, 'Not Available') AS current_stage,

        IFNULL(rd.created_at, 'Not Available') AS created_at,
        IFNULL(rd.followup_date, 'Not Available') AS followup_date,

        IFNULL(rd.room_length, 'Not Available') AS room_length,
        IFNULL(rd.room_width, 'Not Available') AS room_width,
        IFNULL(rd.room_height, 'Not Available') AS room_height,
        IFNULL(rd.p_type, 'Not Available') AS p_type,
        IFNULL(rd.budget_range, 'Not Available') AS budget_range,
        IFNULL(rd.time_to_complete, 'Not Available') AS time_to_complete,
        IFNULL(rd.site_visit_date, 'Not Available') AS site_visit_date,
        IFNULL(rd.demo_date, 'Not Available') AS demo_date,

        IFNULL(rd.ar_number, 'Not Available') AS ar_number,
        IFNULL(rd.architect_name, 'Not Available') AS architect_name,
        IFNULL(rd.ca_number, 'Not Available') AS ca_number,
        IFNULL(rd.e_number, 'Not Available') AS e_number,
        IFNULL(rd.sm_number, 'Not Available') AS sm_number,
        IFNULL(rd.pop_number, 'Not Available') AS pop_number,
        IFNULL(rd.other_number, 'Not Available') AS other_number,

        IFNULL(rd.quick_remark, 'Not Available') AS quick_remark,
        IFNULL(rd.detailed_remark, 'Not Available') AS detailed_remark,

        IFNULL(rd.location_link, 'Not Available') AS location_link,

        IFNULL(c.cat_name, 'Not Available') AS cat_name,
        IFNULL(ref.reference_name, 'Not Available') AS reference_name,
        IFNULL(a.area_name, 'Not Available') AS area_name,

        IFNULL(DATE(asg.assign_date), 'Not Available') AS assign_date,

        lr.assignedTo AS latest_assigned_to,
        lr.remark AS latest_remark,
        DATE(lr.reassignment_date) AS latest_reassignment_date,

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

      WHERE (rd.lead_stage = 'Closed Deal' OR lr.leadStage = 'Closed Deal')

      AND EXISTS (
        SELECT 1 
        FROM execution_start es
        WHERE FIND_IN_SET(rd.master_id, es.lead_ids)
      )
    `;

    const params = [];

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

        name: cleanValue(row.name),
        number: cleanValue(row.number),
        alternate_number: cleanValue(row.alternate_number),
        email: cleanValue(row.email),
        address: cleanValue(row.address),
        city: cleanValue(row.city),

        status: cleanValue(row.status),
        lead_status: cleanValue(row.lead_status),
        lead_stage: cleanValue(row.lead_stage) || 'Closed Deal',
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


export const getClosedLeadsDataExe2 = async (req, res) => {
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

      WHERE (rd.lead_stage = 'Closed Deal'
         OR lr.leadStage = 'Closed Deal')

      AND EXISTS (
        SELECT 1 
        FROM execution_start es
        WHERE FIND_IN_SET(rd.master_id, es.lead_ids)
      )
    `;

    const countParams = [];

    if (isTelecallerLike(role)) {
      countQuery += ` AND lr.assignedTo = ?`;
      countParams.push(currentUserName);
    }

    const [countResult] = await db.query(countQuery, countParams);
    const total = countResult[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    /* ================= MAIN DATA QUERY ================= */
    let query = `
      SELECT 
        rd.master_id,

        IFNULL(rd.name, 'Not Available') AS name,
        IFNULL(rd.number, 'Not Available') AS number,
        IFNULL(rd.alternate_number, 'Not Available') AS alternate_number,
        IFNULL(rd.email, 'Not Available') AS email,
        IFNULL(rd.address, 'Not Available') AS address,
        IFNULL(rd.city, 'Not Available') AS city,

        IFNULL(rd.status, 'Not Available') AS status,
        IFNULL(rd.lead_status, 'Not Available') AS lead_status,
        IFNULL(rd.lead_stage, 'Not Available') AS lead_stage,
        IFNULL(rd.current_stage, 'Not Available') AS current_stage,

        IFNULL(rd.created_at, 'Not Available') AS created_at,
        IFNULL(rd.followup_date, 'Not Available') AS followup_date,

        IFNULL(rd.room_length, 'Not Available') AS room_length,
        IFNULL(rd.room_width, 'Not Available') AS room_width,
        IFNULL(rd.room_height, 'Not Available') AS room_height,
        IFNULL(rd.p_type, 'Not Available') AS p_type,
        IFNULL(rd.budget_range, 'Not Available') AS budget_range,
        IFNULL(rd.time_to_complete, 'Not Available') AS time_to_complete,
        IFNULL(rd.site_visit_date, 'Not Available') AS site_visit_date,
        IFNULL(rd.demo_date, 'Not Available') AS demo_date,

        IFNULL(rd.ar_number, 'Not Available') AS ar_number,
        IFNULL(rd.architect_name, 'Not Available') AS architect_name,
        IFNULL(rd.ca_number, 'Not Available') AS ca_number,
        IFNULL(rd.e_number, 'Not Available') AS e_number,
        IFNULL(rd.sm_number, 'Not Available') AS sm_number,
        IFNULL(rd.pop_number, 'Not Available') AS pop_number,
        IFNULL(rd.other_number, 'Not Available') AS other_number,

        IFNULL(rd.quick_remark, 'Not Available') AS quick_remark,
        IFNULL(rd.detailed_remark, 'Not Available') AS detailed_remark,

        IFNULL(rd.location_link, 'Not Available') AS location_link,

        IFNULL(c.cat_name, 'Not Available') AS cat_name,
        IFNULL(ref.reference_name, 'Not Available') AS reference_name,
        IFNULL(a.area_name, 'Not Available') AS area_name,

        IFNULL(DATE(asg.assign_date), 'Not Available') AS assign_date,

        lr.assignedTo AS latest_assigned_to,
        lr.remark AS latest_remark,
        DATE(lr.reassignment_date) AS latest_reassignment_date,

        IFNULL(u.name, 'Not Available') AS telecaller_name,
        u.user_id AS assigned_to_user_id,

        /* ================= ADDITIONAL EXECUTION FIELDS ================= */
        es.execution_id,
        es.schedule_name AS execution_schedule_name,
        es.start_date AS execution_start_date,
        es.end_date AS execution_end_date,
        es.status AS execution_status,
        es.remark AS execution_remark,

        /* ================= PROCESS COUNT ================= */
        (
          SELECT COUNT(*)
          FROM execution_process_map epm
          WHERE epm.execution_id = es.execution_id
        ) AS execution_process_count

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

      LEFT JOIN execution_start es
        ON FIND_IN_SET(rd.master_id, es.lead_ids)

      WHERE (rd.lead_stage = 'Closed Deal' OR lr.leadStage = 'Closed Deal')

      AND EXISTS (
        SELECT 1 
        FROM execution_start es2
        WHERE FIND_IN_SET(rd.master_id, es2.lead_ids)
      )
    `;

    const params = [];

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
        lead_stage: cleanValue(row.lead_stage) || 'Closed Deal',
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
        telecaller_name: cleanValue(row.telecaller_name),

        /* ===== NEW ADDITIONAL FIELDS ===== */
        execution_id: row.execution_id || null,
        execution_schedule_name: cleanValue(row.execution_schedule_name),
        execution_start_date: cleanValue(row.execution_start_date),
        execution_end_date: cleanValue(row.execution_end_date),
        execution_status: cleanValue(row.execution_status),
        execution_remark: cleanValue(row.execution_remark),
        execution_process_count: row.execution_process_count || 0
        
      };
    });

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


export const getClosedLeadsDataExe3 = async (req, res) => {
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

      WHERE (rd.lead_stage = 'Closed Deal'
         OR lr.leadStage = 'Closed Deal')

      AND EXISTS (
        SELECT 1 
        FROM execution_start es
        WHERE FIND_IN_SET(rd.master_id, es.lead_ids)
        AND es.status != 'complete'
      )
    `;

    const countParams = [];

    if (isTelecallerLike(role)) {
      countQuery += ` AND lr.assignedTo = ?`;
      countParams.push(currentUserName);
    }

    const [countResult] = await db.query(countQuery, countParams);
    const total = countResult[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    /* ================= MAIN DATA QUERY ================= */
    let query = `
      SELECT 
        rd.master_id,

        IFNULL(rd.name, 'Not Available') AS name,
        IFNULL(rd.number, 'Not Available') AS number,
        IFNULL(rd.alternate_number, 'Not Available') AS alternate_number,
        IFNULL(rd.email, 'Not Available') AS email,
        IFNULL(rd.address, 'Not Available') AS address,
        IFNULL(rd.city, 'Not Available') AS city,

        IFNULL(rd.status, 'Not Available') AS status,
        IFNULL(rd.lead_status, 'Not Available') AS lead_status,
        IFNULL(rd.lead_stage, 'Not Available') AS lead_stage,
        IFNULL(rd.current_stage, 'Not Available') AS current_stage,

        IFNULL(rd.created_at, 'Not Available') AS created_at,
        IFNULL(rd.followup_date, 'Not Available') AS followup_date,

        IFNULL(rd.room_length, 'Not Available') AS room_length,
        IFNULL(rd.room_width, 'Not Available') AS room_width,
        IFNULL(rd.room_height, 'Not Available') AS room_height,
        IFNULL(rd.p_type, 'Not Available') AS p_type,
        IFNULL(rd.budget_range, 'Not Available') AS budget_range,
        IFNULL(rd.time_to_complete, 'Not Available') AS time_to_complete,
        IFNULL(rd.site_visit_date, 'Not Available') AS site_visit_date,
        IFNULL(rd.demo_date, 'Not Available') AS demo_date,

        IFNULL(rd.ar_number, 'Not Available') AS ar_number,
        IFNULL(rd.architect_name, 'Not Available') AS architect_name,
        IFNULL(rd.ca_number, 'Not Available') AS ca_number,
        IFNULL(rd.e_number, 'Not Available') AS e_number,
        IFNULL(rd.sm_number, 'Not Available') AS sm_number,
        IFNULL(rd.pop_number, 'Not Available') AS pop_number,
        IFNULL(rd.other_number, 'Not Available') AS other_number,

        IFNULL(rd.quick_remark, 'Not Available') AS quick_remark,
        IFNULL(rd.detailed_remark, 'Not Available') AS detailed_remark,

        IFNULL(rd.location_link, 'Not Available') AS location_link,

        IFNULL(c.cat_name, 'Not Available') AS cat_name,
        IFNULL(ref.reference_name, 'Not Available') AS reference_name,
        IFNULL(a.area_name, 'Not Available') AS area_name,

        IFNULL(DATE(asg.assign_date), 'Not Available') AS assign_date,

        lr.assignedTo AS latest_assigned_to,
        lr.remark AS latest_remark,
        DATE(lr.reassignment_date) AS latest_reassignment_date,

        IFNULL(u.name, 'Not Available') AS telecaller_name,
        u.user_id AS assigned_to_user_id,

        /* ================= EXECUTION FIELDS ================= */
        es.execution_id,
        es.schedule_name AS execution_schedule_name,
        es.start_date AS execution_start_date,
        es.end_date AS execution_end_date,
        es.status AS execution_status,
        es.remark AS execution_remark,

        /* ================= PROCESS COUNT ================= */
        (
          SELECT COUNT(*)
          FROM execution_process_map epm
          WHERE epm.execution_id = es.execution_id
        ) AS execution_process_count

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

      LEFT JOIN execution_start es
        ON FIND_IN_SET(rd.master_id, es.lead_ids)

      WHERE (rd.lead_stage = 'Closed Deal' OR lr.leadStage = 'Closed Deal')

      AND EXISTS (
        SELECT 1 
        FROM execution_start es2
        WHERE FIND_IN_SET(rd.master_id, es2.lead_ids)
        AND es2.status != 'complete'
      )
    `;

    const params = [];

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
        lead_stage: cleanValue(row.lead_stage) || 'Closed Deal',
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
        telecaller_name: cleanValue(row.telecaller_name),

        execution_id: row.execution_id || null,
        execution_schedule_name: cleanValue(row.execution_schedule_name),
        execution_start_date: cleanValue(row.execution_start_date),
        execution_end_date: cleanValue(row.execution_end_date),
        execution_status: cleanValue(row.execution_status),
        execution_remark: cleanValue(row.execution_remark),
        execution_process_count: row.execution_process_count || 0
      };
    });

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


export const getClosedLeadsDataExe5 = async (req, res) => {
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

      WHERE (rd.lead_stage = 'Closed Deal'
         OR lr.leadStage = 'Closed Deal')

      AND EXISTS (
        SELECT 1 
        FROM execution_start es
        WHERE FIND_IN_SET(rd.master_id, es.lead_ids)
       AND es.status IN ('pending','in_progress','hold_by_client','hold_by_avcore')
      )
    `;

    const countParams = [];

    if (isTelecallerLike(role)) {
      countQuery += ` AND lr.assignedTo = ?`;
      countParams.push(currentUserName);
    }

    const [countResult] = await db.query(countQuery, countParams);
    const total = countResult[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    /* ================= MAIN DATA QUERY ================= */
    let query = `
      SELECT 
        rd.master_id,

        IFNULL(rd.name, 'Not Available') AS name,
        IFNULL(rd.number, 'Not Available') AS number,
        IFNULL(rd.alternate_number, 'Not Available') AS alternate_number,
        IFNULL(rd.email, 'Not Available') AS email,
        IFNULL(rd.address, 'Not Available') AS address,
        IFNULL(rd.city, 'Not Available') AS city,

        IFNULL(rd.status, 'Not Available') AS status,
        IFNULL(rd.lead_status, 'Not Available') AS lead_status,
        IFNULL(rd.lead_stage, 'Not Available') AS lead_stage,
        IFNULL(rd.current_stage, 'Not Available') AS current_stage,

        IFNULL(rd.created_at, 'Not Available') AS created_at,
        IFNULL(rd.followup_date, 'Not Available') AS followup_date,

        IFNULL(rd.room_length, 'Not Available') AS room_length,
        IFNULL(rd.room_width, 'Not Available') AS room_width,
        IFNULL(rd.room_height, 'Not Available') AS room_height,
        IFNULL(rd.p_type, 'Not Available') AS p_type,
        IFNULL(rd.budget_range, 'Not Available') AS budget_range,
        IFNULL(rd.time_to_complete, 'Not Available') AS time_to_complete,
        IFNULL(rd.site_visit_date, 'Not Available') AS site_visit_date,
        IFNULL(rd.demo_date, 'Not Available') AS demo_date,

        IFNULL(rd.ar_number, 'Not Available') AS ar_number,
        IFNULL(rd.architect_name, 'Not Available') AS architect_name,
        IFNULL(rd.ca_number, 'Not Available') AS ca_number,
        IFNULL(rd.e_number, 'Not Available') AS e_number,
        IFNULL(rd.sm_number, 'Not Available') AS sm_number,
        IFNULL(rd.pop_number, 'Not Available') AS pop_number,
        IFNULL(rd.other_number, 'Not Available') AS other_number,

        IFNULL(rd.quick_remark, 'Not Available') AS quick_remark,
        IFNULL(rd.detailed_remark, 'Not Available') AS detailed_remark,

        IFNULL(rd.location_link, 'Not Available') AS location_link,

        IFNULL(c.cat_name, 'Not Available') AS cat_name,
        IFNULL(ref.reference_name, 'Not Available') AS reference_name,
        IFNULL(a.area_name, 'Not Available') AS area_name,

        IFNULL(DATE(asg.assign_date), 'Not Available') AS assign_date,

        lr.assignedTo AS latest_assigned_to,
        lr.remark AS latest_remark,
        DATE(lr.reassignment_date) AS latest_reassignment_date,

        IFNULL(u.name, 'Not Available') AS telecaller_name,
        u.user_id AS assigned_to_user_id,

        es.execution_id,
        es.schedule_name AS execution_schedule_name,
        es.start_date AS execution_start_date,
        es.end_date AS execution_end_date,
        es.status AS execution_status,
        es.remark AS execution_remark,
        es.created_at AS execution_created_at, 

        (
          SELECT COUNT(*)
          FROM execution_process_map epm
          WHERE epm.execution_id = es.execution_id
        ) AS execution_process_count

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

      LEFT JOIN execution_start es
        ON FIND_IN_SET(rd.master_id, es.lead_ids)

      WHERE (rd.lead_stage = 'Closed Deal' OR lr.leadStage = 'Closed Deal')

      AND EXISTS (
        SELECT 1 
        FROM execution_start es2
        WHERE FIND_IN_SET(rd.master_id, es2.lead_ids)
AND es.status IN ('pending','in_progress','hold_by_client','hold_by_avcore')
      )
    `;

    const params = [];

    if (isTelecallerLike(role)) {
      query += ` AND lr.assignedTo = ?`;
      params.push(currentUserName);
    }

    /* ✅ ORDER BY LATEST EXECUTION_ID DESC */
    query += `
      GROUP BY rd.master_id
      ORDER BY MAX(es.execution_id) DESC
      LIMIT ? OFFSET ?
    `;
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
        lead_stage: cleanValue(row.lead_stage) || 'Closed Deal',
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
        telecaller_name: cleanValue(row.telecaller_name),

        execution_id: row.execution_id || null,
        execution_schedule_name: cleanValue(row.execution_schedule_name),
        execution_start_date: cleanValue(row.execution_start_date),
        execution_end_date: cleanValue(row.execution_end_date),
        execution_status: cleanValue(row.execution_status),
        execution_remark: cleanValue(row.execution_remark),
        execution_process_count: row.execution_process_count || 0 ,
        execution_created_at: cleanValue(row.execution_created_at),
      };
    });

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
    console.error("❌ Error in getClosedLeadsDataExe:", error);
    res.status(500).json({
      message: "Failed to fetch closed leads data",
      error: error.message
    });
  }
};


export const getClosedLeadsDataExe4 = async (req, res) => {
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

      WHERE EXISTS (
        SELECT 1 
        FROM execution_start es
        WHERE FIND_IN_SET(rd.master_id, es.lead_ids)
        AND es.status != 'complete'
      )
    `;

    const countParams = [];

    if (isTelecallerLike(role)) {
      countQuery += ` AND lr.assignedTo = ?`;
      countParams.push(currentUserName);
    }

    const [countResult] = await db.query(countQuery, countParams);
    const total = countResult[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    /* ================= MAIN DATA QUERY ================= */
    let query = `
      SELECT 
        rd.master_id,

        IFNULL(rd.name, 'Not Available') AS name,
        IFNULL(rd.number, 'Not Available') AS number,
        IFNULL(rd.alternate_number, 'Not Available') AS alternate_number,
        IFNULL(rd.email, 'Not Available') AS email,
        IFNULL(rd.address, 'Not Available') AS address,
        IFNULL(rd.city, 'Not Available') AS city,

        IFNULL(rd.status, 'Not Available') AS status,
        IFNULL(rd.lead_status, 'Not Available') AS lead_status,
        IFNULL(rd.lead_stage, 'Not Available') AS lead_stage,
        IFNULL(rd.current_stage, 'Not Available') AS current_stage,

        IFNULL(rd.created_at, 'Not Available') AS created_at,
        IFNULL(rd.followup_date, 'Not Available') AS followup_date,

        IFNULL(rd.room_length, 'Not Available') AS room_length,
        IFNULL(rd.room_width, 'Not Available') AS room_width,
        IFNULL(rd.room_height, 'Not Available') AS room_height,
        IFNULL(rd.p_type, 'Not Available') AS p_type,
        IFNULL(rd.budget_range, 'Not Available') AS budget_range,
        IFNULL(rd.time_to_complete, 'Not Available') AS time_to_complete,
        IFNULL(rd.site_visit_date, 'Not Available') AS site_visit_date,
        IFNULL(rd.demo_date, 'Not Available') AS demo_date,

        IFNULL(rd.ar_number, 'Not Available') AS ar_number,
        IFNULL(rd.architect_name, 'Not Available') AS architect_name,
        IFNULL(rd.ca_number, 'Not Available') AS ca_number,
        IFNULL(rd.e_number, 'Not Available') AS e_number,
        IFNULL(rd.sm_number, 'Not Available') AS sm_number,
        IFNULL(rd.pop_number, 'Not Available') AS pop_number,
        IFNULL(rd.other_number, 'Not Available') AS other_number,

        IFNULL(rd.quick_remark, 'Not Available') AS quick_remark,
        IFNULL(rd.detailed_remark, 'Not Available') AS detailed_remark,

        IFNULL(rd.location_link, 'Not Available') AS location_link,

        IFNULL(c.cat_name, 'Not Available') AS cat_name,
        IFNULL(ref.reference_name, 'Not Available') AS reference_name,
        IFNULL(a.area_name, 'Not Available') AS area_name,

        IFNULL(DATE(asg.assign_date), 'Not Available') AS assign_date,

        lr.assignedTo AS latest_assigned_to,
        lr.remark AS latest_remark,
        DATE(lr.reassignment_date) AS latest_reassignment_date,

        IFNULL(u.name, 'Not Available') AS telecaller_name,
        u.user_id AS assigned_to_user_id,

        es.execution_id,
        es.schedule_name AS execution_schedule_name,
        es.start_date AS execution_start_date,
        es.end_date AS execution_end_date,
        es.status AS execution_status,
        es.remark AS execution_remark,
        es.created_at AS execution_created_at, 

        (
          SELECT COUNT(*)
          FROM execution_process_map epm
          WHERE epm.execution_id = es.execution_id
        ) AS execution_process_count

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

LEFT JOIN execution_start es
  ON FIND_IN_SET(rd.master_id, es.lead_ids)
  AND es.status != 'complete'

      WHERE EXISTS (
        SELECT 1 
        FROM execution_start es2
        WHERE FIND_IN_SET(rd.master_id, es2.lead_ids)
        AND es2.status != 'complete'
      )
    `;

    const params = [];

    if (isTelecallerLike(role)) {
      query += ` AND lr.assignedTo = ?`;
      params.push(currentUserName);
    }

    /* ✅ ORDER BY LATEST EXECUTION_ID DESC */
    query += `
      GROUP BY rd.master_id
      ORDER BY MAX(es.execution_id) DESC
      LIMIT ? OFFSET ?
    `;
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
        lead_stage: cleanValue(row.lead_stage),
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
        telecaller_name: cleanValue(row.telecaller_name),

        execution_id: row.execution_id || null,
        execution_schedule_name: cleanValue(row.execution_schedule_name),
        execution_start_date: cleanValue(row.execution_start_date),
        execution_end_date: cleanValue(row.execution_end_date),
        execution_status: cleanValue(row.execution_status),
        execution_remark: cleanValue(row.execution_remark),
        execution_process_count: row.execution_process_count || 0,
        execution_created_at: cleanValue(row.execution_created_at),
      };
    });

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
    console.error("❌ Error in getExecutionDataExe:", error);
    res.status(500).json({
      message: "Failed to fetch execution data",
      error: error.message
    });
  }
};


export const getClosedLeadsDataExe = async (req, res) => {
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

      WHERE (rd.lead_stage = 'Execution'
         OR lr.leadStage = 'Execution')

      AND EXISTS (
        SELECT 1 
        FROM execution_start es
        WHERE FIND_IN_SET(rd.master_id, es.lead_ids)
       AND es.status IN ('pending','in_progress','hold_by_client','hold_by_avcore')
      )
    `;

    const countParams = [];

    if (isTelecallerLike(role)) {
      countQuery += ` AND lr.assignedTo = ?`;
      countParams.push(currentUserName);
    }

    const [countResult] = await db.query(countQuery, countParams);
    const total = countResult[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    /* ================= MAIN DATA QUERY ================= */
    let query = `
      SELECT 
        rd.master_id,

        IFNULL(rd.name, 'Not Available') AS name,
        IFNULL(rd.number, 'Not Available') AS number,
        IFNULL(rd.alternate_number, 'Not Available') AS alternate_number,
        IFNULL(rd.email, 'Not Available') AS email,
        IFNULL(rd.address, 'Not Available') AS address,
        IFNULL(rd.city, 'Not Available') AS city,

        IFNULL(rd.status, 'Not Available') AS status,
        IFNULL(rd.lead_status, 'Not Available') AS lead_status,
        IFNULL(rd.lead_stage, 'Not Available') AS lead_stage,
        IFNULL(rd.current_stage, 'Not Available') AS current_stage,

        IFNULL(rd.created_at, 'Not Available') AS created_at,
        IFNULL(rd.followup_date, 'Not Available') AS followup_date,

        IFNULL(rd.room_length, 'Not Available') AS room_length,
        IFNULL(rd.room_width, 'Not Available') AS room_width,
        IFNULL(rd.room_height, 'Not Available') AS room_height,
        IFNULL(rd.p_type, 'Not Available') AS p_type,
        IFNULL(rd.budget_range, 'Not Available') AS budget_range,
        IFNULL(rd.time_to_complete, 'Not Available') AS time_to_complete,
        IFNULL(rd.site_visit_date, 'Not Available') AS site_visit_date,
        IFNULL(rd.demo_date, 'Not Available') AS demo_date,

        IFNULL(rd.ar_number, 'Not Available') AS ar_number,
        IFNULL(rd.architect_name, 'Not Available') AS architect_name,
        IFNULL(rd.ca_number, 'Not Available') AS ca_number,
        IFNULL(rd.e_number, 'Not Available') AS e_number,
        IFNULL(rd.sm_number, 'Not Available') AS sm_number,
        IFNULL(rd.pop_number, 'Not Available') AS pop_number,
        IFNULL(rd.other_number, 'Not Available') AS other_number,

        IFNULL(rd.quick_remark, 'Not Available') AS quick_remark,
        IFNULL(rd.detailed_remark, 'Not Available') AS detailed_remark,

        IFNULL(rd.location_link, 'Not Available') AS location_link,

        IFNULL(c.cat_name, 'Not Available') AS cat_name,
        IFNULL(ref.reference_name, 'Not Available') AS reference_name,
        IFNULL(a.area_name, 'Not Available') AS area_name,

        IFNULL(DATE(asg.assign_date), 'Not Available') AS assign_date,

        lr.assignedTo AS latest_assigned_to,
        lr.remark AS latest_remark,
        DATE(lr.reassignment_date) AS latest_reassignment_date,

        IFNULL(u.name, 'Not Available') AS telecaller_name,
        u.user_id AS assigned_to_user_id,

        es.execution_id,
        es.schedule_name AS execution_schedule_name,
        es.start_date AS execution_start_date,
        es.end_date AS execution_end_date,
        es.status AS execution_status,
        es.remark AS execution_remark,
        es.created_at AS execution_created_at, 

        (
          SELECT COUNT(*)
          FROM execution_process_map epm
          WHERE epm.execution_id = es.execution_id
        ) AS execution_process_count

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

      LEFT JOIN execution_start es
        ON FIND_IN_SET(rd.master_id, es.lead_ids)

      WHERE (rd.lead_stage = 'Execution' OR lr.leadStage = 'Execution')

      AND EXISTS (
        SELECT 1 
        FROM execution_start es2
        WHERE FIND_IN_SET(rd.master_id, es2.lead_ids)
        AND es2.status IN ('pending','in_progress','hold_by_client','hold_by_avcore')
      )
    `;

    const params = [];

    if (isTelecallerLike(role)) {
      query += ` AND lr.assignedTo = ?`;
      params.push(currentUserName);
    }

    /* ✅ ORDER BY LATEST EXECUTION_ID DESC */
    query += `
      GROUP BY rd.master_id
      ORDER BY MAX(es.execution_id) DESC
      LIMIT ? OFFSET ?
    `;
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
        lead_stage: cleanValue(row.lead_stage) || 'Execution',
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
        telecaller_name: cleanValue(row.telecaller_name),

        execution_id: row.execution_id || null,
        execution_schedule_name: cleanValue(row.execution_schedule_name),
        execution_start_date: cleanValue(row.execution_start_date),
        execution_end_date: cleanValue(row.execution_end_date),
        execution_status: cleanValue(row.execution_status),
        execution_remark: cleanValue(row.execution_remark),
        execution_process_count: row.execution_process_count || 0 ,
        execution_created_at: cleanValue(row.execution_created_at),
      };
    });

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
    console.error("❌ Error in getExecutionLeadsDataExe:", error);
    res.status(500).json({
      message: "Failed to fetch execution leads data",
      error: error.message
    });
  }
};



/* ==========================================
   GET PROCESSES FOR A LEAD
========================================== */

export const getProcessesByLead1 = async (req, res) => {
  try {
    const { leadId } = req.params;

    /* =========================
       FIND EXECUTION ID
    ========================= */

    const [execution] = await db.query(
      `
      SELECT es.execution_id
      FROM execution_start es
      WHERE FIND_IN_SET(?, es.lead_ids)
      LIMIT 1
      `,
      [leadId]
    );

    if (execution.length === 0) {
      return res.json({
        success: true,
        data: [],
      });
    }

    const execution_id = execution[0].execution_id;

    /* =========================
       GET ALL PROCESSES
       + JOIN SAVED DATA
    ========================= */

    const [rows] = await db.query(
      `
      SELECT 
        epm.process_id,
        pe.process_name,
        pe.description,
        
        epl.start_date,
        epl.end_date,
        epl.status,
        epl.assigned_to,
        epl.remark

      FROM execution_process_map epm

      JOIN process_execution pe
        ON pe.process_id = epm.process_id

      LEFT JOIN execution_process_logs epl
        ON epl.process_id = epm.process_id
        AND epl.lead_id = ?

      WHERE epm.execution_id = ?

      ORDER BY pe.process_name ASC
      `,
      [leadId, execution_id]
    );

    res.json({
      success: true,
      data: rows,
    });

  } catch (err) {
    console.error("Error fetching processes:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};


export const getProcessesByLead = async (req, res) => {
  try {
    const { leadId } = req.params;

    /* =========================
       FIND EXECUTION ID
    ========================= */
    const [execution] = await db.query(
      `
      SELECT es.execution_id
      FROM execution_start es
      WHERE FIND_IN_SET(?, es.lead_ids)
      LIMIT 1
      `,
      [leadId]
    );

    if (execution.length === 0) {
      return res.json({
        success: true,
        data: [],
      });
    }

    const execution_id = execution[0].execution_id;

    /* =========================
       GET PROCESSES + ASSIGNED USERS (ID TABLE)
    ========================= */
    const [rows] = await db.query(
      `
      SELECT 
        epm.process_id,
        pe.process_name,
        pe.description,

        MAX(epl.start_date) AS start_date,
        MAX(epl.end_date) AS end_date,
        MAX(epl.status) AS status,
        MAX(epl.remark) AS remark,

        GROUP_CONCAT(DISTINCT u.user_id) AS assigned_user_ids,
        GROUP_CONCAT(DISTINCT u.name) AS assigned_user_names

      FROM execution_process_map epm

      JOIN process_execution pe
        ON pe.process_id = epm.process_id

      LEFT JOIN execution_process_logs epl
        ON epl.process_id = epm.process_id
        AND epl.lead_id = ?

      LEFT JOIN execution_process_user_map epum
        ON epum.process_id = epm.process_id
        AND epum.lead_id = ?

      LEFT JOIN users u
        ON u.user_id = epum.user_id

      WHERE epm.execution_id = ?

      GROUP BY 
        epm.process_id,
        pe.process_name,
        pe.description

      ORDER BY pe.process_name ASC
      `,
      [leadId, leadId, execution_id]
    );

    /* =========================
       FORMAT USERS ARRAY
    ========================= */
    const formattedRows = rows.map(row => ({
      process_id: row.process_id,
      process_name: row.process_name,
      description: row.description,
      start_date: row.start_date,
      end_date: row.end_date,
      status: row.status,
      remark: row.remark,

      assigned_user_ids: row.assigned_user_ids
        ? row.assigned_user_ids.split(",").map(id => Number(id))
        : [],

      assigned_user_names: row.assigned_user_names
        ? row.assigned_user_names.split(",")
        : []
    }));

    res.json({
      success: true,
      data: formattedRows,
    });

  } catch (err) {
    console.error("Error fetching processes:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};




/* ==========================================
   INSERT OR UPDATE PROCESS
========================================== */


export const saveProcess1 = async (req, res) => {
  try {
    const {
      lead_id,
      process_id,
      process_name,
      start_date,
      end_date,
      status,
      assigned_user_ids, // ARRAY OF IDS
      remark,
    } = req.body;

    const updated_by = req.session.user?.id || null;

    if (!lead_id || !process_id) {
      return res.status(400).json({
        success: false,
        message: "Lead ID and Process ID required",
      });
    }

    // =========================================
    // 1️⃣ GET USER NAMES FROM IDS
    // =========================================

    let assigned_to = null;

    if (assigned_user_ids && assigned_user_ids.length > 0) {
      const [users] = await db.query(
        `SELECT name FROM users WHERE user_id IN (?)`,
        [assigned_user_ids]
      );

      const namesArray = users.map((u) => u.name);
      assigned_to = namesArray.join(",");
    }

    let execution_process_log_id;

    // =========================================
    // 2️⃣ CHECK IF MAIN RECORD EXISTS
    // =========================================

    const [existing] = await db.query(
      `SELECT id FROM execution_process_logs
       WHERE lead_id = ? AND process_id = ?`,
      [lead_id, process_id]
    );

    if (existing.length > 0) {
      execution_process_log_id = existing[0].id;

      // UPDATE MAIN TABLE
      await db.query(
        `UPDATE execution_process_logs
         SET start_date = ?, 
             end_date = ?, 
             status = ?, 
             remark = ?, 
             assigned_to = ?, 
             updated_at = NOW()
         WHERE id = ?`,
        [
          start_date || null,
          end_date || null,
          status || "pending",
          remark || null,
          assigned_to,
          execution_process_log_id,
        ]
      );
    } else {
      // INSERT MAIN TABLE
      const [insertMain] = await db.query(
        `INSERT INTO execution_process_logs
         (lead_id, process_id, process_name, start_date, end_date, status, remark, assigned_to)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          lead_id,
          process_id,
          process_name,
          start_date || null,
          end_date || null,
          status || "pending",
          remark || null,
          assigned_to,
        ]
      );

      execution_process_log_id = insertMain.insertId;
    }

    // =========================================
    // 3️⃣ INSERT INTO UPDATE LOGS
    // =========================================

    const [insertLog] = await db.query(
      `INSERT INTO execution_process_update_logs
       (lead_id, process_id, execution_process_log_id,
        updated_by, start_date, end_date, status, remark)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        lead_id,
        process_id,
        execution_process_log_id,
        updated_by,
        start_date || null,
        end_date || null,
        status || "pending",
        remark || null,
      ]
    );

    const execution_process_update_log_id = insertLog.insertId;

    // =========================================
    // 4️⃣ USER MAPPING TABLE (ONLY IDS)
    // =========================================

    // Always clear old mapping
    await db.query(
      `DELETE FROM execution_process_user_map
       WHERE lead_id = ? AND process_id = ?`,
      [lead_id, process_id]
    );

    if (assigned_user_ids && assigned_user_ids.length > 0) {
      for (const user_id of assigned_user_ids) {
        await db.query(
          `INSERT INTO execution_process_user_map
           (lead_id, process_id,
            execution_process_log_id,
            execution_process_update_log_id,
            user_id)
           VALUES (?, ?, ?, ?, ?)`,
          [
            lead_id,
            process_id,
            execution_process_log_id,
            execution_process_update_log_id,
            user_id,
          ]
        );
      }
    }

    return res.json({
      success: true,
      message: "Process saved successfully",
    });

  } catch (error) {
    console.error("Error saving process:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};



export const saveProcess = async (req, res) => {
  try {
    const {
      lead_id,
      process_id,
      process_name,
      start_date,
      end_date,
      status,
      assigned_user_ids, // ARRAY OF IDS
      remark,
    } = req.body;

    const updated_by = req.session.user?.id || null;

    if (!lead_id || !process_id) {
      return res.status(400).json({
        success: false,
        message: "Lead ID and Process ID required",
      });
    }

    // =========================================
    // 1️⃣ GET USER NAMES FROM IDS
    // =========================================

    let assigned_to = null;

    if (assigned_user_ids && assigned_user_ids.length > 0) {
      // Remove duplicates from the input array first
      const unique_user_ids = [...new Set(assigned_user_ids)];
      
      const [users] = await db.query(
        `SELECT name FROM users WHERE user_id IN (?)`,
        [unique_user_ids]
      );

      const namesArray = users.map((u) => u.name);
      assigned_to = namesArray.join(",");
    }

    let execution_process_log_id;

    // =========================================
    // 2️⃣ CHECK IF MAIN RECORD EXISTS
    // =========================================

    const [existing] = await db.query(
      `SELECT id FROM execution_process_logs
       WHERE lead_id = ? AND process_id = ?`,
      [lead_id, process_id]
    );

    if (existing.length > 0) {
      execution_process_log_id = existing[0].id;

      // UPDATE MAIN TABLE
      await db.query(
        `UPDATE execution_process_logs
         SET start_date = ?, 
             end_date = ?, 
             status = ?, 
             remark = ?, 
             assigned_to = ?, 
             updated_at = NOW()
         WHERE id = ?`,
        [
          start_date || null,
          end_date || null,
          status || "pending",
          remark || null,
          assigned_to,
          execution_process_log_id,
        ]
      );
    } else {
      // INSERT MAIN TABLE
      const [insertMain] = await db.query(
        `INSERT INTO execution_process_logs
         (lead_id, process_id, process_name, start_date, end_date, status, remark, assigned_to)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          lead_id,
          process_id,
          process_name,
          start_date || null,
          end_date || null,
          status || "pending",
          remark || null,
          assigned_to,
        ]
      );

      execution_process_log_id = insertMain.insertId;
    }

    // =========================================
    // 3️⃣ INSERT INTO UPDATE LOGS
    // =========================================

    const [insertLog] = await db.query(
      `INSERT INTO execution_process_update_logs
       (lead_id, process_id, execution_process_log_id,
        updated_by, start_date, end_date, status, remark)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        lead_id,
        process_id,
        execution_process_log_id,
        updated_by,
        start_date || null,
        end_date || null,
        status || "pending",
        remark || null,
      ]
    );

    const execution_process_update_log_id = insertLog.insertId;

    // =========================================
    // 4️⃣ USER MAPPING TABLE - NO DUPLICATES!
    // =========================================

    if (assigned_user_ids && assigned_user_ids.length > 0) {
      // Remove duplicates from input
      const unique_user_ids = [...new Set(assigned_user_ids)];
      
      for (const user_id of unique_user_ids) {
        // Check if this user is already assigned to this process in ANY update log
        const [existingMapping] = await db.query(
          `SELECT id FROM execution_process_user_map
           WHERE lead_id = ? AND process_id = ? AND user_id = ?`,
          [lead_id, process_id, user_id]
        );

        // Only insert if not already assigned to this process
        if (existingMapping.length === 0) {
          await db.query(
            `INSERT INTO execution_process_user_map
             (lead_id, process_id,
              execution_process_log_id,
              execution_process_update_log_id,
              user_id)
             VALUES (?, ?, ?, ?, ?)`,
            [
              lead_id,
              process_id,
              execution_process_log_id,
              execution_process_update_log_id,
              user_id,
            ]
          );
        } else {
          console.log(`User ${user_id} already assigned to process ${process_id}, skipping duplicate`);
        }
      }
    }

    return res.json({
      success: true,
      message: "Process saved successfully",
    });

  } catch (error) {
    console.error("Error saving process:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};


export const getProcessLogs1 = async (req, res) => {
  try {
    const { leadId, processId } = req.params;

    const [logs] = await db.query(
      `
      SELECT 
        l.*,
        u.name AS updated_by_name,
        GROUP_CONCAT(au.name) AS assigned_to_names

      FROM execution_process_update_logs l

      LEFT JOIN users u
        ON u.user_id = l.updated_by

      LEFT JOIN execution_process_user_map epum
        ON epum.execution_process_update_log_id = l.log_id

      LEFT JOIN users au
        ON au.user_id = epum.user_id

      WHERE l.lead_id = ?
        AND l.process_id = ?

      GROUP BY l.log_id
      ORDER BY l.created_at DESC
      `,
      [leadId, processId]
    );

    res.json({
      success: true,
      data: logs,
    });

  } catch (error) {
    console.error("Error fetching process logs:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};


export const getProcessLogs2 = async (req, res) => {
  try {
    const { leadId, processId } = req.params;

    // 1️⃣ Logs newest → oldest
    const [logs] = await db.query(
      `
      SELECT 
        l.log_id,
        l.lead_id,
        l.process_id,
        l.start_date,
        l.end_date,
        l.status,
        l.remark,
        l.created_at,
        u.name AS updated_by_name
      FROM execution_process_update_logs l
      LEFT JOIN users u
        ON u.user_id = l.updated_by
      WHERE l.lead_id = ?
        AND l.process_id = ?
      ORDER BY l.created_at DESC
      `,
      [leadId, processId]
    );

    if (logs.length === 0) {
      return res.json({ success: true, data: [] });
    }

    // 2️⃣ Users per log
    const logIds = logs.map(l => l.log_id);

    const [userRows] = await db.query(
      `
      SELECT 
        epum.execution_process_update_log_id AS log_id,
        u.name
      FROM execution_process_user_map epum
      JOIN users u
        ON u.user_id = epum.user_id
      WHERE epum.execution_process_update_log_id IN (?)
      `,
      [logIds]
    );

    const usersByLog = {};
    for (const row of userRows) {
      if (!usersByLog[row.log_id]) usersByLog[row.log_id] = [];
      usersByLog[row.log_id].push(row.name.trim());
    }

    // 3️⃣ Initial assignment from main table
    const [main] = await db.query(
      `
      SELECT assigned_to
      FROM execution_process_logs
      WHERE lead_id = ?
        AND process_id = ?
      LIMIT 1
      `,
      [leadId, processId]
    );

    let lastKnown = main[0]?.assigned_to
      ? main[0].assigned_to.split(",").map(s => s.trim())
      : [];

    // 4️⃣ Build logs with rolling history
    const result = logs.map(log => {
      const current = usersByLog[log.log_id] || [];

      const previous = [...lastKnown];

      // update lastKnown if this log has assignment
      if (current.length > 0) {
        lastKnown = current;
      }

      return {
        ...log,
        previous_assigned_to_names: previous,
        new_assigned_to_names: current
      };
    });

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error("Error fetching process logs:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};



export const getProcessLogs = async (req, res) => {
  try {
    const { leadId, processId } = req.params;

    // 1️⃣ Logs newest → oldest
    const [logs] = await db.query(
      `
      SELECT 
        l.log_id,
        l.lead_id,
        l.process_id,
        l.start_date,
        l.end_date,
        l.status,
        l.remark,
        l.created_at,
        u.name AS updated_by_name
      FROM execution_process_update_logs l
      LEFT JOIN users u
        ON u.user_id = l.updated_by
      WHERE l.lead_id = ?
        AND l.process_id = ?
      ORDER BY l.created_at DESC
      `,
      [leadId, processId]
    );

    if (logs.length === 0) {
      return res.json({ success: true, data: [] });
    }

    // 2️⃣ Get users for each log from the mapping table
    const logIds = logs.map(l => l.log_id);

    const [userRows] = await db.query(
      `
      SELECT 
        epum.execution_process_update_log_id AS log_id,
        u.name
      FROM execution_process_user_map epum
      JOIN users u
        ON u.user_id = epum.user_id
      WHERE epum.execution_process_update_log_id IN (?)
      `,
      [logIds]
    );

    // Create a map of log_id -> users for that specific log
    const usersByLog = {};
    for (const row of userRows) {
      if (!usersByLog[row.log_id]) usersByLog[row.log_id] = [];
      usersByLog[row.log_id].push(row.name.trim());
    }

    // 3️⃣ Build logs WITHOUT rolling history - each log shows only its own assignments
    const result = logs.map(log => {
      // Get ONLY the users assigned in THIS specific log
      const currentAssignments = usersByLog[log.log_id] || [];

      return {
        ...log,
        assigned_to_names: currentAssignments, // Only show current assignments
        previous_assigned_to_names: [], // Remove this
        new_assigned_to_names: currentAssignments // Keep for backward compatibility
      };
    });

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error("Error fetching process logs:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};




