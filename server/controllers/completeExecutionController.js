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
    'carpenter',
    'accountant'
];

const isTelecallerLike = (role) => TELECALLER_ROLES.includes(role);


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

      WHERE (rd.lead_stage = 'Closed Deal'
         OR lr.leadStage = 'Closed Deal')

      AND EXISTS (
        SELECT 1 
        FROM execution_start es
        WHERE FIND_IN_SET(rd.master_id, es.lead_ids)
        AND es.status = 'complete'
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
  AND es.status = 'complete'

WHERE rd.lead_stage = 'Execution' 

      AND EXISTS (
        SELECT 1 
        FROM execution_start es2
        WHERE FIND_IN_SET(rd.master_id, es2.lead_ids)
        AND es2.status = 'complete'
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
      const cleanValue = (value) => (!value || value === 'Not Available' ? '' : value);
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
