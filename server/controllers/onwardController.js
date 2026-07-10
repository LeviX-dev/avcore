// import db from '../database/db.js';






// export const getExecutionLeads = async (req, res) => {
//   try {
//     const query = `
//       SELECT 
//         rd.master_id,
//         IFNULL(rd.name, 'Not Available') AS name,
//         IFNULL(rd.number, 'Not Available') AS number,
//         IFNULL(rd.email, 'Not Available') AS email,
//         IFNULL(rd.address, 'Not Available') AS address,
//         IFNULL(rd.city, 'Not Available') AS city,
//         IFNULL(rd.status, 'Not Available') AS status,
//         IFNULL(rd.lead_status, 'Not Available') AS lead_status,
//         IFNULL(rd.lead_stage, 'Not Available') AS lead_stage,  
//         IFNULL(rd.current_stage, 'Not Available') AS current_stage,
//         IFNULL(rd.created_by_user, 'Not Available') AS created_by_user,
//         IFNULL(rd.assign_id, 'Not Available') AS assign_id,
//         IFNULL(rd.followup_date, 'Not Available') AS followup_date,
//         IFNULL(rd.cat_id, 'Not Available') AS cat_id,
//         IFNULL(rd.reference_id, 'Not Available') AS reference_id,
//         IFNULL(rd.area_id, 'Not Available') AS area_id,
//         IFNULL(rd.room_length, 'Not Available') AS room_length,
//         IFNULL(rd.room_width, 'Not Available') AS room_width,
//         IFNULL(rd.room_height, 'Not Available') AS room_height,
//         IFNULL(rd.location_link, 'Not Available') AS location_link,
//         IFNULL(rd.p_type, 'Not Available') AS p_type,
//         IFNULL(rd.budget_range, 'Not Available') AS budget_range,

//         'Not Available' AS room_ready,

//         IFNULL(rd.time_to_complete, 'Not Available') AS time_to_complete,
//         IFNULL(rd.site_visit_date, 'Not Available') AS site_visit_date,
//         IFNULL(rd.demo_date, 'Not Available') AS demo_date,
//         IFNULL(rd.lead_activity, 0) AS lead_activity,
//         IFNULL(rd.quick_remark, 'Not Available') AS quick_remark,
//         IFNULL(rd.detailed_remark, 'Not Available') AS detailed_remark,

//         IFNULL(a.area_name, 'Not Available') AS area_name,
//         IFNULL(c.cat_name, 'Not Available') AS cat_name,
//         IFNULL(r.reference_name, 'Not Available') AS reference_name,

//         IFNULL(asg.assign_date, 'Not Available') AS assign_date,
//         IFNULL(asg.target_date, 'Not Available') AS target_date,
//         IFNULL(asg.mode, 'Not Available') AS mode,
//         IFNULL(asg.remark, 'Not Available') AS assignment_remark,
//         IFNULL(asg.assigned_to, 'Not Available') AS assigned_to,
//         IFNULL(asg.assigned_to_user_id, 'Not Available') AS assigned_to_user_id,
//         IFNULL(asg.assign_type, 'Not Available') AS assign_type,

//         CASE WHEN q.qt_id IS NOT NULL THEN 1 ELSE 0 END AS created_flag,

//         -- ✅ Execution Schedule Details
//         IFNULL(es.schedule_name, 'Not Available') AS schedule_name,
//         IFNULL(es.start_date, 'Not Available') AS execution_start_date,
//         IFNULL(es.end_date, 'Not Available') AS execution_end_date

//       FROM raw_data rd
//       LEFT JOIN area a ON rd.area_id = a.area_id
//       LEFT JOIN category c ON rd.cat_id = c.cat_id
//       LEFT JOIN reference r ON rd.reference_id = r.reference_id
//       LEFT JOIN assignments asg ON rd.assign_id = asg.assign_id
//       LEFT JOIN quotation q ON rd.master_id = q.master_id

//       -- 🔥 Join execution_start using lead_ids
//       LEFT JOIN execution_start es 
//         ON FIND_IN_SET(rd.master_id, es.lead_ids)

//       WHERE rd.lead_stage = 'Execution'
//       ORDER BY rd.master_id DESC
//     `;

//     const [rows] = await db.query(query);

  
//     // -------- Reassignment logic (same as your code) --------

//     const masterIds = rows.map(r => r.master_id);
//     let reassignmentRows = [];

//     if (masterIds.length > 0) {
//       const [reassignments] = await db.query(
//         `
//         SELECT 
//           rm.*, 
//           u.name, 
//           u.role
//         FROM reassignment rm
//         LEFT JOIN users u ON u.user_id = rm.created_by_user
//         WHERE rm.master_id IN (?)
//         ORDER BY rm.reassignment_date DESC, rm.created_at DESC
//         `,
//         [masterIds]
//       );
//       reassignmentRows = reassignments;
//     }

//     const formattedRows = rows.map(row => {
//       const reassignments = reassignmentRows
//         .filter(r => r.master_id === row.master_id)
//         .map(r => ({
//           remark: r.remark || '',
//           assignedTo: r.assignedTo || '',
//           leadStage: r.leadStage || '',
//           created_by_user: r.created_by_user || '',
//           created_at: r.created_at
//             ? new Date(r.created_at).toLocaleString('en-GB')
//             : '',
//           reassignment_date: r.reassignment_date
//             ? new Date(r.reassignment_date).toLocaleString('en-GB')
//             : '',
//           name: r.name || '',
//           role: r.role || ''
//         }));

//       return {
//         ...row,
//         reassignment_remarks: reassignments,
//         latest_assignedTo: reassignments.length ? reassignments[0].assignedTo : '',
//         latest_leadStage: reassignments.length ? reassignments[0].leadStage : ''
//       };
//     });

//     return res.status(200).json(formattedRows);

//   } catch (error) {
//     console.error("❌ Error fetching Execution leads:", error);
//     return res.status(500).json({ error: "Failed to fetch execution leads" });
//   }
// };




// //sujit excecution

// const TELECALLER_ROLES = [
//   'tele_caller',
//   'digital_marketing',
//   'field_marketing_executive',
//   'tech_sale_sound_engineer',
//   'junior_autocad_designer',
//   'senior_autocad_designer',
//   'technical_head',
//     'av_engineer',
//   'acoustic_engineer',
//   'acoustic_designer',
//    'hr_executive',
//      'project_manager',
  
// ];

// const isTelecallerLike = (role) => TELECALLER_ROLES.includes(role);




// export const getClosedLeadsDataExe = async (req, res) => {
//   try {
//     if (!req.session.user) {
//       return res.status(401).json({ message: "Unauthorized: No session" });
//     }

//     const { id: userId, role } = req.session.user;

//     /* ================= PAGINATION PARAMETERS ================= */
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const offset = (page - 1) * limit;

//     if (page < 1 || limit < 1 || limit > 100) {
//       return res.status(400).json({
//         message: "Invalid pagination parameters. Page must be >=1, limit between 1-100"
//       });
//     }

//     /* ================= CURRENT USER ================= */
//     const [userResult] = await db.query(
//       "SELECT name FROM users WHERE user_id = ?",
//       [userId]
//     );

//     const currentUserName = userResult[0]?.name || "";

//     /* ================= TOTAL COUNT QUERY ================= */
//     let countQuery = `
//       SELECT COUNT(DISTINCT rd.master_id) as total
//       FROM raw_data rd
//       LEFT JOIN (
//         SELECT r1.*, ROW_NUMBER() OVER (PARTITION BY master_id ORDER BY id DESC) rn
//         FROM reassignment r1
//       ) lr ON rd.master_id = lr.master_id AND lr.rn = 1

//       WHERE (rd.lead_stage = 'Closed Deal'
//          OR lr.leadStage = 'Closed Deal')

//       AND EXISTS (
//         SELECT 1 
//         FROM execution_start es
//         WHERE FIND_IN_SET(rd.master_id, es.lead_ids)
//       )
//     `;

//     const countParams = [];

//     if (isTelecallerLike(role)) {
//       countQuery += ` AND lr.assignedTo = ?`;
//       countParams.push(currentUserName);
//     }

//     const [countResult] = await db.query(countQuery, countParams);
//     const total = countResult[0]?.total || 0;
//     const totalPages = Math.ceil(total / limit);

//     /* ================= MAIN DATA QUERY ================= */
//     let query = `
//       SELECT 
//         rd.master_id,

//         IFNULL(rd.name, 'Not Available') AS name,
//         IFNULL(rd.number, 'Not Available') AS number,
//         IFNULL(rd.alternate_number, 'Not Available') AS alternate_number,
//         IFNULL(rd.email, 'Not Available') AS email,
//         IFNULL(rd.address, 'Not Available') AS address,
//         IFNULL(rd.city, 'Not Available') AS city,

//         IFNULL(rd.status, 'Not Available') AS status,
//         IFNULL(rd.lead_status, 'Not Available') AS lead_status,
//         IFNULL(rd.lead_stage, 'Not Available') AS lead_stage,
//         IFNULL(rd.current_stage, 'Not Available') AS current_stage,

//         IFNULL(rd.created_at, 'Not Available') AS created_at,
//         IFNULL(rd.followup_date, 'Not Available') AS followup_date,

//         IFNULL(rd.room_length, 'Not Available') AS room_length,
//         IFNULL(rd.room_width, 'Not Available') AS room_width,
//         IFNULL(rd.room_height, 'Not Available') AS room_height,
//         IFNULL(rd.p_type, 'Not Available') AS p_type,
//         IFNULL(rd.budget_range, 'Not Available') AS budget_range,
//         IFNULL(rd.time_to_complete, 'Not Available') AS time_to_complete,
//         IFNULL(rd.site_visit_date, 'Not Available') AS site_visit_date,
//         IFNULL(rd.demo_date, 'Not Available') AS demo_date,

//         IFNULL(rd.ar_number, 'Not Available') AS ar_number,
//         IFNULL(rd.architect_name, 'Not Available') AS architect_name,
//         IFNULL(rd.ca_number, 'Not Available') AS ca_number,
//         IFNULL(rd.e_number, 'Not Available') AS e_number,
//         IFNULL(rd.sm_number, 'Not Available') AS sm_number,
//         IFNULL(rd.pop_number, 'Not Available') AS pop_number,
//         IFNULL(rd.other_number, 'Not Available') AS other_number,

//         IFNULL(rd.quick_remark, 'Not Available') AS quick_remark,
//         IFNULL(rd.detailed_remark, 'Not Available') AS detailed_remark,

//         IFNULL(rd.location_link, 'Not Available') AS location_link,

//         IFNULL(c.cat_name, 'Not Available') AS cat_name,
//         IFNULL(ref.reference_name, 'Not Available') AS reference_name,
//         IFNULL(a.area_name, 'Not Available') AS area_name,

//         IFNULL(DATE(asg.assign_date), 'Not Available') AS assign_date,

//         lr.assignedTo AS latest_assigned_to,
//         lr.remark AS latest_remark,
//         DATE(lr.reassignment_date) AS latest_reassignment_date,

//         IFNULL(u.name, 'Not Available') AS telecaller_name,
//         u.user_id AS assigned_to_user_id,

//         /* ================= ADDITIONAL EXECUTION FIELDS ================= */
//         es.execution_id,
//         es.schedule_name AS execution_schedule_name,
//         es.start_date AS execution_start_date,
//         es.end_date AS execution_end_date,
//         es.status AS execution_status,
//         es.remark AS execution_remark,

//         /* ================= PROCESS COUNT ================= */
//         (
//           SELECT COUNT(*)
//           FROM execution_process_map epm
//           WHERE epm.execution_id = es.execution_id
//         ) AS execution_process_count

//       FROM raw_data rd
//       LEFT JOIN area a ON rd.area_id = a.area_id
//       LEFT JOIN category c ON rd.cat_id = c.cat_id
//       LEFT JOIN reference ref ON rd.reference_id = ref.reference_id
//       LEFT JOIN assignments asg ON rd.assign_id = asg.assign_id

//       LEFT JOIN (
//         SELECT r1.*, ROW_NUMBER() OVER (PARTITION BY master_id ORDER BY id DESC) rn
//         FROM reassignment r1
//       ) lr ON rd.master_id = lr.master_id AND lr.rn = 1

//       LEFT JOIN users u ON lr.assignedTo = u.name

//       LEFT JOIN execution_start es
//         ON FIND_IN_SET(rd.master_id, es.lead_ids)

//       WHERE (rd.lead_stage = 'Closed Deal' OR lr.leadStage = 'Closed Deal')

//       AND EXISTS (
//         SELECT 1 
//         FROM execution_start es2
//         WHERE FIND_IN_SET(rd.master_id, es2.lead_ids)
//       )
//     `;

//     const params = [];

//     if (isTelecallerLike(role)) {
//       query += ` AND lr.assignedTo = ?`;
//       params.push(currentUserName);
//     }

//     query += ` GROUP BY rd.master_id ORDER BY rd.master_id DESC LIMIT ? OFFSET ?`;
//     params.push(limit, offset);

//     const [rows] = await db.query(query, params);

//     /* ================= FORMAT RESPONSE ================= */
//     const formattedRows = rows.map(row => {

//       const cleanValue = (value) => {
//         if (!value || value === 'Not Available') return '';
//         return value;
//       };

//       const cleanNumber = (value) => {
//         if (!value || value === 'Not Available') return null;
//         const num = Number(value);
//         return isNaN(num) ? null : num;
//       };

//       return {
//         master_id: row.master_id || 0,

//         name: cleanValue(row.name),
//         number: cleanValue(row.number),
//         alternate_number: cleanValue(row.alternate_number),
//         email: cleanValue(row.email),
//         address: cleanValue(row.address),
//         city: cleanValue(row.city),

//         status: cleanValue(row.status),
//         lead_status: cleanValue(row.lead_status),
//         lead_stage: cleanValue(row.lead_stage) || 'Closed Deal',
//         current_stage: cleanValue(row.current_stage),

//         created_at: cleanValue(row.created_at),
//         followup_date: cleanValue(row.followup_date),
//         assign_date: cleanValue(row.assign_date),
//         latest_reassignment_date: cleanValue(row.latest_reassignment_date),

//         room_length: cleanNumber(row.room_length),
//         room_width: cleanNumber(row.room_width),
//         room_height: cleanNumber(row.room_height),

//         p_type: cleanValue(row.p_type),
//         budget_range: cleanValue(row.budget_range),
//         time_to_complete: cleanValue(row.time_to_complete),
//         site_visit_date: cleanValue(row.site_visit_date),
//         demo_date: cleanValue(row.demo_date),

//         ar_number: cleanValue(row.ar_number),
//         architect_name: cleanValue(row.architect_name),
//         ca_number: cleanValue(row.ca_number),
//         e_number: cleanValue(row.e_number),
//         sm_number: cleanValue(row.sm_number),
//         pop_number: cleanValue(row.pop_number),
//         other_number: cleanValue(row.other_number),

//         quick_remark: cleanValue(row.quick_remark),
//         detailed_remark: cleanValue(row.detailed_remark),
//         latest_remark: cleanValue(row.latest_remark),

//         location_link: cleanValue(row.location_link),

//         cat_name: cleanValue(row.cat_name),
//         reference_name: cleanValue(row.reference_name),
//         area_name: cleanValue(row.area_name),

//         assigned_to: cleanValue(row.latest_assigned_to || row.telecaller_name),
//         telecaller_name: cleanValue(row.telecaller_name),

//         /* ===== NEW ADDITIONAL FIELDS ===== */
//         execution_id: row.execution_id || null,
//         execution_schedule_name: cleanValue(row.execution_schedule_name),
//         execution_start_date: cleanValue(row.execution_start_date),
//         execution_end_date: cleanValue(row.execution_end_date),
//         execution_status: cleanValue(row.execution_status),
//         execution_remark: cleanValue(row.execution_remark),
//         execution_process_count: row.execution_process_count || 0
//       };
//     });

//     return res.status(200).json({
//       success: true,
//       data: formattedRows,
//       pagination: {
//         total,
//         page,
//         limit,
//         totalPages,
//         hasNextPage: page < totalPages,
//         hasPrevPage: page > 1,
//         showingStart: offset + 1,
//         showingEnd: Math.min(offset + limit, total)
//       }
//     });

//   } catch (error) {
//     console.error("❌ Error in getClosedLeadsData:", error);
//     res.status(500).json({
//       message: "Failed to fetch closed leads data",
//       error: error.message
//     });
//   }
// }; 


import db from '../database/db.js';


export const getExecutionLeads = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const query = `
      SELECT 
        es.execution_id,
        es.schedule_name AS schedule,
        es.start_date,
        es.end_date,

        rd.master_id,
        rd.name AS client_name,
        rd.city,

        q.qt_id,
        q.qt_number,
        q.quotation_type,
        q.current_revision

      FROM execution_start es

      JOIN raw_data rd 
        ON FIND_IN_SET(rd.master_id, es.lead_ids)

      LEFT JOIN quotation q 
        ON q.master_id = rd.master_id
        AND q.quotation_type = 'finalized'

      ORDER BY es.start_date DESC
    `;

    const [rows] = await connection.query(query);

    return res.status(200).json({
      message: 'Execution data fetched successfully',
      data: rows,
    });
  } catch (error) {
    console.error('getExecutionLeads Error:', error);

    return res.status(500).json({
      message: 'Failed to fetch execution data',
    });
  } finally {
    connection.release();
  }
};


export const getLatestQuotationByMasterId = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({
        message: 'Unauthorized: No session',
      });
    }

    const { master_id } = req.params;

    if (!master_id) {
      return res.status(400).json({
        message: 'master_id is required',
      });
    }

    /* =========================
       1️⃣ CLIENT DATA
    ========================== */
    const [clientData] = await db.query(
      `SELECT
          master_id,
          name,
          number,
          alternate_number,
          email,
          city,
          address
       FROM raw_data
       WHERE master_id = ?`,
      [master_id],
    );

    if (clientData.length === 0) {
      return res.status(200).json({
        success: false,
        message: 'Client not found',
      });
    }

    /* =========================
       2️⃣ GET LATEST FINALIZED QUOTATION
    ========================== */
    const [quotationData] = await db.query(
      `SELECT *
       FROM quotation
       WHERE master_id = ?
         AND quotation_type = 'finalized'
       ORDER BY qt_id DESC
       LIMIT 1`,
      [master_id],
    );

    if (quotationData.length === 0) {
      return res.status(200).json({
        success: false,
        message: 'No finalized quotation found',
      });
    }

    const quotation = quotationData[0];

    /* =========================
       3️⃣ GET LATEST REVISION
    ========================== */
    const [revisionData] = await db.query(
      `SELECT *
       FROM quotation_revision
       WHERE qt_id = ?
       ORDER BY revision DESC
       LIMIT 1`,
      [quotation.qt_id],
    );

    const latestRevision = revisionData[0] || null;

    if (!latestRevision) {
      return res.status(404).json({
        success: false,
        message: 'No revision found',
      });
    }

    const revisionNumber = Number(latestRevision.revision || 1);

    /* =========================
       4️⃣ PARSE SUMMARY OPTIONS
    ========================== */
    let selectedOptionsForSummary = null;

    if (latestRevision.selected_options_for_summary) {
      try {
        selectedOptionsForSummary =
          typeof latestRevision.selected_options_for_summary === 'string'
            ? JSON.parse(latestRevision.selected_options_for_summary)
            : latestRevision.selected_options_for_summary;
      } catch (e) {
        console.error('Error parsing selected_options_for_summary:', e);
      }
    }

    /* =========================
       5️⃣ CATEGORY MAP
    ========================== */
    const [categories] = await db.query(
      `SELECT cat_id, cat_name FROM category`,
    );

    const categoryMap = {};

    categories.forEach((c) => {
      categoryMap[c.cat_id] = c.cat_name;
    });

    /* =========================
       6️⃣ OPTIONS
    ========================== */
    const [optionRows] = await db.query(
      `SELECT
          option_id,
          option_name,
          option_order,
          subject,
          subject_type,
          floor_name,
          room_name
       FROM quotation_options
       WHERE qt_id = ?
         AND revision = ?
       ORDER BY option_order ASC`,
      [quotation.qt_id, revisionNumber],
    );

    const builtOptions = [];

    const GST_PERCENT = 18;

    const gstBase = Number(latestRevision.gst_app_amt || 0);

    for (const opt of optionRows) {
      /* =========================
         7️⃣ OPTION ITEMS
      ========================== */
      const [mappedItems] = await db.query(
        `SELECT
            qm.qm_id,
            qm.cat_id,
            qm.kit_id,
            qm.model_id,
            qm.model_qty AS qty,
            qm.model_price AS price,
            qm.current_revision,
            qm.kit_qty,

            k.kit_name,

            m.model_no AS model,
            m.image_path,
            m.description,
            m.price AS model_original_price,

            b.brand_id,
            b.brand_name,
            b.product_type_id AS prod_id,

            pt.product_type_name

         FROM quotation_mapped qm

         LEFT JOIN kit k
           ON qm.kit_id = k.kit_id

         LEFT JOIN models m
           ON qm.model_id = m.model_id

         LEFT JOIN brands b
           ON m.brand_id = b.brand_id

         LEFT JOIN product_types pt
           ON b.product_type_id = pt.product_type_id

         WHERE qm.qt_id = ?
           AND qm.option_id = ?
           AND qm.current_revision = ?

         ORDER BY qm.kit_id`,
        [quotation.qt_id, opt.option_id, revisionNumber],
      );

      const formattedItems = [];

      for (const item of mappedItems) {
        /* =========================
           8️⃣ MRN CALCULATIONS
        ========================== */
        const [[sum]] = await db.query(
          `SELECT
              COALESCE(SUM(mpm.requested_qty),0) AS total_requested_qty,
              COALESCE(SUM(mpm.required_qty),0) AS total_issued_qty
           FROM mrn_prod_map mpm
           JOIN generate_mrn gm
             ON gm.mrn_id = mpm.mrn_id
           WHERE gm.qt_id = ?
             AND mpm.model_id = ?`,
          [quotation.qt_id, item.model_id],
        );

        const totalQty = Number(item.qty || 0);

        const requestedQty = Number(sum.total_requested_qty || 0);

        const issuedQty = Number(sum.total_issued_qty || 0);

        const mrnPendingQty = totalQty - requestedQty;

        const issuePendingQty = requestedQty - issuedQty;

        formattedItems.push({
          qm_id: item.qm_id,

          cat_id: item.cat_id,

          kit_id: item.kit_id,

          kit_name: item.kit_name,

          model_id: item.model_id,

          qty: totalQty,

          price: Number(item.price || 0),

          current_revision: item.current_revision,

          kit_qty: item.kit_qty,

          model: item.model,

          image_path: item.image_path,

          description: item.description,

          model_original_price: Number(item.model_original_price || 0),

          brand_id: item.brand_id,

          prod_id: item.prod_id,

          brand_name: item.brand_name,

          product_type_name: item.product_type_name,

          cat_name: categoryMap[item.cat_id] || 'Unknown',

          /* ✅ MRN FLOW */
          total_requested_qty: requestedQty,

          total_issued_qty: issuedQty,

          mrn_pending_qty: mrnPendingQty > 0 ? mrnPendingQty : 0,

          issue_pending_qty: issuePendingQty > 0 ? issuePendingQty : 0,

          is_mrn_generated: mrnPendingQty <= 0 ? 1 : 0,
        });
      }

      /* =========================
         9️⃣ GROUP KITS
      ========================== */
      const kitsMap = {};

      for (const row of formattedItems) {
        const key = row.kit_id ?? `single_${row.model_id}`;

        if (!kitsMap[key]) {
          kitsMap[key] = {
            kit_id: row.kit_id,
            kit_name: row.kit_name,
            items: [],
          };
        }

        kitsMap[key].items.push(row);
      }

      /* =========================
         🔟 ADDITIONAL PRICES
      ========================== */
      const [additional] = await db.query(
        `SELECT add_price_name, price
         FROM additional_price
         WHERE qt_id = ?
           AND option_id = ?
           AND revision = ?`,
        [quotation.qt_id, opt.option_id, revisionNumber],
      );

      const additional_prices = additional.map((a) => ({
        add_price_name: a.add_price_name,
        price: Number(a.price || 0),
      }));

      /* =========================
         1️⃣1️⃣ INSTALLMENTS
      ========================== */
      const [installmentRows] = await db.query(
        `SELECT
            description,
            percentage,
            amount,
            payment_mode
         FROM quotation_installments
         WHERE qt_id = ?
           AND option_id = ?
           AND revision = ?`,
        [quotation.qt_id, opt.option_id, revisionNumber],
      );

      /* =========================
         1️⃣2️⃣ FINAL OFFER
      ========================== */
      const [finalOfferRows] = await db.query(
        `SELECT
            description,
            percentage,
            amount,
            is_default
         FROM quotation_final_offer
         WHERE qt_id = ?
           AND option_id = ?
           AND revision = ?
         LIMIT 1`,
        [quotation.qt_id, opt.option_id, revisionNumber],
      );

      /* =========================
         1️⃣3️⃣ TOTALS
      ========================== */
      const optProductsTotal = formattedItems.reduce(
        (sum, row) => sum + Number(row.price) * Number(row.qty),
        0,
      );

      const optAdditionalTotal = additional_prices.reduce(
        (s, a) => s + a.price,
        0,
      );

      const optGst =
        quotation.type === 'with_gst' ? (gstBase * GST_PERCENT) / 100 : 0;

      const optTotalWithGST = optProductsTotal + optAdditionalTotal + optGst;

      let finalOfferData = null;

      let finalOfferAmount = 0;

      if (finalOfferRows.length > 0 && Number(finalOfferRows[0].amount) > 0) {
        finalOfferData = {
          description:
            finalOfferRows[0].description || 'FINAL BEST OFFER (OPTIONAL)',

          percentage: Number(finalOfferRows[0].percentage || 0),

          amount: Number(finalOfferRows[0].amount || 0),
        };

        finalOfferAmount = Number(finalOfferRows[0].amount || 0);
      }

      const finalizedTotal = optTotalWithGST - finalOfferAmount;

      /* =========================
         1️⃣4️⃣ PUSH OPTION
      ========================== */
      builtOptions.push({
        option_id: opt.option_id,

        option_name: opt.option_name,

        subject: opt.subject || null,

        subject_type: opt.subject_type || 'master',

        floor_name: opt.floor_name || null,

        room_name: opt.room_name || null,

        option_order: opt.option_order,

        items: Object.values(kitsMap),

        additional_prices,

        installments: installmentRows.map((i) => ({
          description: i.description,

          percentage: Number(i.percentage || 0),

          amount: Number(i.amount || 0),

          payment_mode: i.payment_mode || 'Online',
        })),

        revision_details: {
          total_without_gst: optProductsTotal,

          total_with_gst: optTotalWithGST,

          gst_app_amt: gstBase,

          gst_percent: GST_PERCENT,

          gst_calculated_amount: optGst,
        },

        final_offer: finalOfferData,

        final_offer_amount: finalOfferAmount,

        finalized_total: finalizedTotal,
      });
    }

    /* =========================
       ✅ FINAL RESPONSE
    ========================== */
    return res.status(200).json({
      success: true,

      master_id,

      revision: revisionNumber,

      lead: {
        name: clientData[0].name,

        number: clientData[0].number,

        city: clientData[0].city,

        address: clientData[0].address,
      },

      quotation: {
        qt_id: quotation.qt_id,

        qt_number: quotation.qt_number,

        type: quotation.type,

        quotation_type: quotation.quotation_type,

        acoustic_terms: quotation.acoustic_terms,

        subject: quotation.subject,

        selected_options_for_summary: selectedOptionsForSummary,

        created_at: quotation.created_at,

        options: builtOptions,
      },
    });
  } catch (error) {
    console.error('❌ Error fetching quotation:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch quotation details',
      error: error.message,
    });
  }
};


// export const generateMRNold = async (req, res) => {
//   const connection = await db.getConnection();

//   try {
//     const { master_id, qt_id, expected_date, created_by, products } = req.body;

//     if (!master_id || !qt_id) {
//       return res.status(400).json({
//         message: 'master_id and qt_id are required',
//       });
//     }

//     /* =========================
//        1️⃣ Check Quotation Exists
//     ========================== */
//     const [qtCheck] = await connection.query(
//       `SELECT qt_id FROM quotation WHERE qt_id = ?`,
//       [qt_id],
//     );

//     if (qtCheck.length === 0) {
//       return res.status(400).json({
//         message: 'Invalid quotation ID',
//       });
//     }

//     /* =========================
//        2️⃣ Generate MRN Number
//     ========================== */
//     const mrn_number = `MRN${Date.now()}`;

//     /* =========================
//        3️⃣ Insert MRN
//     ========================== */
//     const [mrnResult] = await connection.query(
//       `INSERT INTO generate_mrn
//        (mrn_number, master_id, qt_id, expected_date, created_by)
//        VALUES (?, ?, ?, ?, ?)`,
//       [mrn_number, master_id, qt_id, expected_date || null, created_by || null],
//     );

//     const mrn_id = mrnResult.insertId;

//     /* =========================
//        4️⃣ Insert Products
//     ========================== */
//     if (products && products.length > 0) {
//       for (const item of products) {
//         /* =========================
//            Check Existing MRN Qty
//         ========================== */
//         const [existingQty] = await connection.query(
//           `SELECT
//               COALESCE(SUM(requested_qty),0) as total_requested,
//               COALESCE(SUM(required_qty),0) as total_required
//            FROM mrn_prod_map mp
//            JOIN generate_mrn gm ON gm.mrn_id = mp.mrn_id
//            WHERE gm.qt_id = ?
//            AND mp.model_id = ?
//            AND mp.prod_id = ?
//            AND mp.brand_id = ?`,
//           [qt_id, item.model_id, item.prod_id, item.brand_id],
//         );

//         const totalRequested = Number(existingQty[0].total_requested || 0);
//         const totalRequired = Number(existingQty[0].total_required || 0);

//         const pendingQty = totalRequested - totalRequired;

//         /* =========================
//            Prevent Over Request
//         ========================== */
//         if (pendingQty > 0 && item.requested_qty > pendingQty) {
//           return res.status(400).json({
//             message: `Only ${pendingQty} qty pending for model ${item.model_id}`,
//           });
//         }

//         /* =========================
//            Insert Product
//         ========================== */
//         await connection.query(
//           `INSERT INTO mrn_prod_map
//           (mrn_id, prod_id, model_id, brand_id, kit_id, requested_qty, required_qty)
//           VALUES (?, ?, ?, ?, ?, ?, ?)`,
//           [
//             mrn_id,
//             item.prod_id,
//             item.model_id,
//             item.brand_id,
//             item.kit_id || null,
//             item.requested_qty || 0,
//             item.required_qty || 0,
//           ],
//         );
//       }

//       /* =========================
//          5️⃣ Update Pending Qty
//       ========================== */
//       await connection.query(
//         `UPDATE mrn_prod_map
//          SET pending_qty = requested_qty - required_qty
//          WHERE mrn_id = ?`,
//         [mrn_id],
//       );

//       /* =========================
//          6️⃣ Update quotation_mapped Status
//       ========================== */
//       await connection.query(
//         `UPDATE quotation_mapped qm
//          SET is_mrn_generated =
//          CASE
//             WHEN qm.model_qty <= (
//                 SELECT COALESCE(SUM(mp.required_qty),0)
//                 FROM mrn_prod_map mp
//                 JOIN generate_mrn gm ON gm.mrn_id = mp.mrn_id
//                 WHERE gm.qt_id = qm.qt_id
//                 AND mp.model_id = qm.model_id
//             )
//             THEN 1
//             ELSE 0
//          END
//          WHERE qm.qt_id = ?`,
//         [qt_id],
//       );
//     }

//     /* =========================
//        Success Response
//     ========================== */
//     return res.status(200).json({
//       success: true,
//       message: 'MRN generated successfully',
//       mrn_id,
//       mrn_number,
//     });
//   } catch (error) {
//     console.error('MRN Generation Error:', error);

//     return res.status(500).json({
//       success: false,
//       message: 'Failed to generate MRN',
//       error: error.message,
//     });
//   } finally {
//     connection.release();
//   }
// };


export const generateMRN = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const { master_id, qt_id, expected_date, products } = req.body;

    const created_by = req.session.user?.id || null;

    if (!master_id || !qt_id) {
      return res.status(400).json({
        success: false,
        message: 'master_id and qt_id are required',
      });
    }

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Products are required',
      });
    }

    await connection.beginTransaction();

    /* =========================
       1️⃣ CHECK FINALIZED QUOTATION
    ========================== */
    const [[quotation]] = await connection.query(
      `SELECT
            qt_id,
            quotation_type
         FROM quotation
         WHERE qt_id = ?
           AND quotation_type = 'finalized'
         LIMIT 1`,
      [qt_id],
    );

    if (!quotation) {
      throw new Error('Only finalized quotation allowed for MRN');
    }

    /* =========================
       2️⃣ GET LATEST REVISION
    ========================== */
    const [[latestRevision]] = await connection.query(
      `SELECT revision
         FROM quotation_revision
         WHERE qt_id = ?
         ORDER BY revision DESC
         LIMIT 1`,
      [qt_id],
    );

    const currentRevision = latestRevision?.revision || 1;

    const mrn_number = `MRN${Date.now()}`;

    /* =========================
       3️⃣ CREATE MRN
    ========================== */
    const [mrnResult] = await connection.query(
      `INSERT INTO generate_mrn
         (
           mrn_number,
           master_id,
           qt_id,
           expected_date,
           created_by
         )
         VALUES (?, ?, ?, ?, ?)`,
      [mrn_number, master_id, qt_id, expected_date || null, created_by],
    );

    const mrn_id = mrnResult.insertId;

    /* =========================
       4️⃣ INSERT PRODUCTS
    ========================== */
    for (const item of products) {
      const requestedQty = Number(item.requested_qty || 0);

      if (requestedQty <= 0) {
        throw new Error('Requested qty must be greater than 0');
      }

      /* =========================
         5️⃣ GET QUOTATION QTY
      ========================== */
      const [[qm]] = await connection.query(
        `SELECT
              qm_id,
              model_qty,
              current_revision
           FROM quotation_mapped
           WHERE qt_id = ?
             AND model_id = ?
             AND current_revision = ?
           LIMIT 1`,
        [qt_id, item.model_id, currentRevision],
      );

      if (!qm) {
        throw new Error(
          `Quotation item not found for model_id ${item.model_id}`,
        );
      }

      const quotationQty = Number(qm.model_qty || 0);

      /* =========================
         6️⃣ TOTAL REQUESTED
      ========================== */
      const [[sum]] = await connection.query(
        `SELECT
              COALESCE(SUM(mpm.requested_qty),0) AS total_requested_qty,
              COALESCE(SUM(mpm.required_qty),0) AS total_issued_qty
           FROM mrn_prod_map mpm
           JOIN generate_mrn gm
             ON gm.mrn_id = mpm.mrn_id
           WHERE gm.qt_id = ?
             AND mpm.model_id = ?`,
        [qt_id, item.model_id],
      );

      const totalRequested = Number(sum.total_requested_qty || 0);

      const totalIssued = Number(sum.total_issued_qty || 0);

      /* =========================
         7️⃣ PENDING CALCULATION
      ========================== */
      const remainingQty = quotationQty - totalRequested;

      if (remainingQty <= 0) {
        throw new Error(
          `MRN already fully generated for model_id ${item.model_id}`,
        );
      }

      if (requestedQty > remainingQty) {
        throw new Error(
          `Only ${remainingQty} qty allowed for model_id ${item.model_id}`,
        );
      }

      /* =========================
         8️⃣ INSERT MRN PRODUCT
      ========================== */
      const [mpmRes] = await connection.query(
        `INSERT INTO mrn_prod_map
          (
            mrn_id,
            prod_id,
            model_id,
            brand_id,
            kit_id,
            requested_qty,
            required_qty,
            status,
            purchase_status
          )
          VALUES
          (
            ?, ?, ?, ?, ?, ?, 0,
            'Verification Pending',
            'Not Requested'
          )`,
        [
          mrn_id,

          item.prod_id || null,

          item.model_id,

          item.brand_id || null,

          item.kit_id || null,

          requestedQty,
        ],
      );

      const mpm_id = mpmRes.insertId;

      /* =========================
         9️⃣ LOG ENTRY
      ========================== */
      await connection.query(
        `INSERT INTO mrn_activity_logs
        (
          mrn_id,
          mpm_id,
          model_id,
          action_type,
          qty,
          status,
          created_by
        )
        VALUES
        (
          ?, ?, ?, 'VERIFICATION',
          ?, 'Generated', ?
        )`,
        [mrn_id, mpm_id, item.model_id, requestedQty, created_by],
      );

      /* OPTIONAL RESPONSE */
      item.previous_requested_qty = totalRequested;

      item.previous_issued_qty = totalIssued;

      item.remaining_before_generation = remainingQty;

      item.remaining_after_generation = remainingQty - requestedQty;
    }

    await connection.commit();

    /* =========================
       ✅ FINAL RESPONSE
    ========================== */
    return res.status(200).json({
      success: true,

      message: 'MRN generated successfully',

      mrn: {
        mrn_id,

        mrn_number,

        master_id,

        qt_id,

        revision: currentRevision,

        expected_date,
      },

      products,
    });
  } catch (err) {
    await connection.rollback();

    console.error('generateMRN Error:', err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  } finally {
    connection.release();
  }
};


// export const generateMRN = async (req, res) => {
//   const connection = await db.getConnection();

//   try {
//     const { master_id, qt_id, expected_date, created_by, products } = req.body;

//     if (!master_id || !qt_id) {
//       return res.status(400).json({
//         success: false,
//         message: "master_id and qt_id are required",
//       });
//     }

//     await connection.beginTransaction();

//     const mrn_number = `MRN${Date.now()}`;

//     const [mrnResult] = await connection.query(
//       `INSERT INTO generate_mrn
//        (mrn_number, master_id, qt_id, expected_date, created_by)
//        VALUES (?, ?, ?, ?, ?)`,
//       [mrn_number, master_id, qt_id, expected_date || null, created_by || null]
//     );

//     const mrn_id = mrnResult.insertId;

//     for (const item of products) {
//       if (item.requested_qty <= 0) {
//         throw new Error("Requested qty must be greater than 0");
//       }

//       /* 🔹 Quotation Qty */
//       const [[qm]] = await connection.query(
//         `SELECT model_qty
//          FROM quotation_mapped
//          WHERE qt_id = ? AND model_id = ?`,
//         [qt_id, item.model_id]
//       );

//       const quotationQty = Number(qm.model_qty);

//       /* 🔹 Already Requested */
//       const [[sum]] = await connection.query(
//         `SELECT COALESCE(SUM(requested_qty),0) as total_requested
//          FROM mrn_prod_map mp
//          JOIN generate_mrn gm ON gm.mrn_id = mp.mrn_id
//          WHERE gm.qt_id = ? AND mp.model_id = ?`,
//         [qt_id, item.model_id]
//       );

//       const totalRequested = Number(sum.total_requested);

//       const remaining = quotationQty - totalRequested;

//       if (item.requested_qty > remaining) {
//         throw new Error(`Only ${remaining} qty allowed`);
//       }

//       await connection.query(
//         `INSERT INTO mrn_prod_map
//         (mrn_id, prod_id, model_id, brand_id, kit_id, requested_qty, required_qty, status, purchase_status)
//         VALUES (?, ?, ?, ?, ?, ?, 0, 'Verification Pending', 'Not Requested')`,
//         [
//           mrn_id,
//           item.prod_id,
//           item.model_id,
//           item.brand_id,
//           item.kit_id || null,
//           item.requested_qty,
//         ]
//       );
//     }

//     await connection.commit();

//     return res.status(200).json({
//       success: true,
//       message: "MRN generated",
//       mrn_id,
//     });
//   } catch (err) {
//     await connection.rollback();
//     return res.status(500).json({ success: false, message: err.message });
//   } finally {
//     connection.release();
//   }
// };

export const getExecutionLeadDetails = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const { master_id } = req.params;

    const query = `
      SELECT 
        rd.master_id,
        rd.name,
        rd.number,
        rd.email,
        rd.city,
        rd.status,
        rd.detailed_remark,

        c.cat_name,
        ref.reference_name,

        es.schedule_name,
        es.start_date AS execution_start_date,
        es.end_date AS execution_end_date,

        lr.assignedTo AS latest_assignedTo,
        lr.leadStage AS latest_leadStage

      FROM raw_data rd

      LEFT JOIN category c 
        ON rd.cat_id = c.cat_id

      LEFT JOIN reference ref 
        ON rd.reference_id = ref.reference_id

      LEFT JOIN execution_start es 
        ON FIND_IN_SET(rd.master_id, es.lead_ids)

      /* Latest Reassignment */
      LEFT JOIN (
        SELECT r1.*
        FROM reassignment r1
        INNER JOIN (
            SELECT master_id, MAX(created_at) AS latest_date
            FROM reassignment
            GROUP BY master_id
        ) r2
        ON r1.master_id = r2.master_id 
        AND r1.created_at = r2.latest_date
      ) lr
      ON lr.master_id = rd.master_id

      WHERE rd.master_id = ?
    `;

    const [leadRows] = await connection.query(query, [master_id]);

    if (leadRows.length === 0) {
      return res.status(404).json({
        message: 'Lead not found',
      });
    }

    /* Reassignment History */
    const historyQuery = `
      SELECT 
        r.created_at,
        r.assignedTo,
        r.leadStage,
        r.remark,
        u.name
      FROM reassignment r
      LEFT JOIN users u
        ON r.created_by_user = u.user_id
      WHERE r.master_id = ?
      ORDER BY r.created_at DESC
    `;

    const [history] = await connection.query(historyQuery, [master_id]);

    const lead = leadRows[0];

    return res.status(200).json({
      message: 'Lead details fetched successfully',
      data: {
        ...lead,
        reassignment_remarks: history,
      },
    });
  } catch (error) {
    console.error('getExecutionLeadDetails Error:', error);
    return res.status(500).json({
      message: 'Failed to fetch lead details',
    });
  } finally {
    connection.release();
  }
};

export const getMRNListByMasterId = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const { master_id } = req.params;

    if (!master_id) {
      return res.status(400).json({
        success: false,
        message: 'master_id is required',
      });
    }

    /* =========================
       Fetch MRN List
    ========================== */
    const [mrnList] = await connection.query(
      `SELECT 
          mrn_id,
          mrn_number,
          mrn_status
       FROM generate_mrn
       WHERE master_id = ?
       ORDER BY mrn_id DESC`,
      [master_id],
    );

    return res.status(200).json({
      success: true,
      count: mrnList.length,
      data: mrnList,
    });
  } catch (error) {
    console.error('Get MRN List Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch MRN list',
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

// export const getMRNDetailsByNumber = async (req, res) => {
//   const connection = await db.getConnection();

//   try {
//     const { mrn_number } = req.params;

//     if (!mrn_number) {
//       return res.status(400).json({
//         success: false,
//         message: 'mrn_number is required',
//       });
//     }

//     /* =========================
//        1️⃣ MRN DETAILS
//     ========================== */
//     const [mrnData] = await connection.query(
//       `SELECT
//           gm.mrn_id,
//           gm.mrn_number,
//           gm.master_id,
//           gm.qt_id,
//           gm.expected_date,
//           gm.created_by,
//           gm.created_at,
//           rd.name
//        FROM generate_mrn gm
//        LEFT JOIN raw_data rd ON rd.master_id = gm.master_id
//        WHERE gm.mrn_number = ?`,
//       [mrn_number],
//     );

//     if (mrnData.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: 'MRN not found',
//       });
//     }

//     const mrn = mrnData[0];

//     /* =========================
//        2️⃣ PRODUCTS (FIXED STATUS)
//     ========================== */
// const [products] = await connection.query(
//   `SELECT
//   mp.mpm_id,
//   mp.prod_id,
//   mp.model_id,
//   mp.brand_id,
//   mp.kit_id,

//   mp.requested_qty,
//   mp.required_qty,

//   IFNULL(mp.verified_qty,0) AS verified_qty,
//   IFNULL(mp.purchase_qty,0) AS purchase_qty,

//   (mp.requested_qty - IFNULL(mp.verified_qty,0)) AS pending_qty,

//   IFNULL(s.qty, 0) AS available_qty,

//   mp.status,

//   b.brand_name,
//   m.model_no,
//   k.kit_name,
//   pt.product_type_name

// FROM mrn_prod_map mp

// LEFT JOIN stock s ON s.model_id = mp.model_id
// LEFT JOIN brands b ON b.brand_id = mp.brand_id
// LEFT JOIN models m ON m.model_id = mp.model_id
// LEFT JOIN kit k ON k.kit_id = mp.kit_id
// LEFT JOIN product_types pt ON pt.product_type_id = b.product_type_id

// WHERE mp.mrn_id = ?`,
//   [mrn.mrn_id]
// );

//     /* =========================
//        3️⃣ RESPONSE
//     ========================== */
//     return res.status(200).json({
//       success: true,
//       data: {
//         ...mrn,
//         products,
//       },
//     });
//   } catch (error) {
//     console.error('Get MRN Details Error:', error);

//     return res.status(500).json({
//       success: false,
//       message: 'Failed to fetch MRN details',
//     });
//   } finally {
//     connection.release();
//   }
// };

export const getMRNDetailsByNumber = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const { mrn_number } = req.params;

    if (!mrn_number) {
      return res.status(400).json({
        success: false,
        message: 'mrn_number is required',
      });
    }

    /* =========================
       1️⃣ MRN DETAILS
    ========================== */
    const [mrnData] = await connection.query(
      `SELECT 
          gm.mrn_id,
          gm.mrn_number,
          gm.master_id,
          gm.qt_id,
          gm.expected_date,
          gm.created_by,
          gm.created_at,
          rd.name
       FROM generate_mrn gm
       LEFT JOIN raw_data rd ON rd.master_id = gm.master_id
       WHERE gm.mrn_number = ?`,
      [mrn_number],
    );

    if (mrnData.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'MRN not found',
      });
    }

    const mrn = mrnData[0];

    /* =========================
       2️⃣ PRODUCTS (FIXED STATUS)
    ========================== */
    const [products] = await connection.query(
      `SELECT 
  mp.mpm_id,
  mp.prod_id,
  mp.model_id,
  mp.brand_id,
  mp.kit_id,

  mp.requested_qty,

  IFNULL(mp.verified_qty,0) AS verified_qty,
  IFNULL(mp.approval_qty,0) AS approval_qty,

  /* ✅ FIXED ISSUED QTY */
  IFNULL(i.total_issued, 0) AS issued_qty,

  IFNULL(mp.purchase_qty,0) AS purchase_qty,

  /* PURCHASE REQUEST */
  IFNULL(pr.total_purchase_requested, 0) AS purchase_requested_qty,

  /* PENDING CALCULATIONS */
  (mp.requested_qty - IFNULL(mp.verified_qty,0)) AS verification_pending,
  (IFNULL(mp.verified_qty,0) - IFNULL(mp.approval_qty,0)) AS approval_pending,

  /* ✅ FIXED ISSUE PENDING */
  (IFNULL(mp.approval_qty,0) - IFNULL(i.total_issued,0)) AS issue_pending,

  IFNULL(s.qty, 0) AS available_qty,

  mp.status,
  mp.purchase_status,

  b.brand_name,
  m.model_no,
  k.kit_name,
  pt.product_type_name

FROM mrn_prod_map mp

/* ✅ ISSUE TABLE JOIN */
LEFT JOIN (
  SELECT 
    mpm_id, 
    SUM(issued_qty) AS total_issued
  FROM issue_items
  GROUP BY mpm_id
) i ON i.mpm_id = mp.mpm_id

/* PURCHASE REQUEST */
LEFT JOIN (
  SELECT 
    mpm_id, 
    SUM(qty) AS total_purchase_requested
  FROM purchase_request
  WHERE status IN ('Pending','Approved','Purchased')
  GROUP BY mpm_id
) pr ON pr.mpm_id = mp.mpm_id

LEFT JOIN stock s ON s.model_id = mp.model_id
LEFT JOIN brands b ON b.brand_id = mp.brand_id
LEFT JOIN models m ON m.model_id = mp.model_id
LEFT JOIN kit k ON k.kit_id = mp.kit_id
LEFT JOIN product_types pt ON pt.product_type_id = b.product_type_id

WHERE mp.mrn_id = ?`,
      [mrn.mrn_id],
    );

    /* =========================
       3️⃣ RESPONSE
    ========================== */
    return res.status(200).json({
      success: true,
      data: {
        ...mrn,
        products,
      },
    });
  } catch (error) {
    console.error('Get MRN Details Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch MRN details',
    });
  } finally {
    connection.release();
  }
};

// export const verifyMRN = async (req, res) => {
//   const connection = await db.getConnection();

//   try {
//     const { mrn_id, products, verified_by } = req.body;

//     await connection.beginTransaction();

//     for (const item of products) {
//       const { mpm_id, verified_qty } = item;

//       const [[mpm]] = await connection.query(
//         `SELECT mpm.*, IFNULL(s.qty,0) as stock_qty
//          FROM mrn_prod_map mpm
//          LEFT JOIN stock s ON s.model_id = mpm.model_id
//          WHERE mpm_id = ?`,
//         [mpm_id]
//       );

//       const requested = mpm.requested_qty;
//       const stock = mpm.stock_qty;

//       let finalVerified = 0;
//       let purchaseQty = 0;

//       /* ✅ FIXED LOGIC */
//       if (stock >= requested) {
//         finalVerified = requested;
//       } else if (stock > 0) {
//         finalVerified =
//           verified_qty != null ? Math.min(verified_qty, stock) : stock;
//         purchaseQty = requested - finalVerified;
//       } else {
//         purchaseQty = requested;
//       }

//       await connection.query(
//         `UPDATE mrn_prod_map
//          SET verified_qty=?, purchase_qty=?, status='Approval Pending',
//          purchase_status=CASE WHEN ? > 0 THEN 'Pending' ELSE 'Not Requested' END
//          WHERE mpm_id=?`,
//         [finalVerified, purchaseQty, purchaseQty, mpm_id]
//       );

//       /* 🔹 Purchase Request */
//       if (purchaseQty > 0) {
//         const [pr] = await connection.query(
//           `INSERT INTO purchase_request
//            (mrn_id, mpm_id, product_type_id, brand_id, model_id, qty)
//            VALUES (?, ?, ?, ?, ?, ?)`,
//           [
//             mrn_id,
//             mpm_id,
//             mpm.prod_id,
//             mpm.brand_id,
//             mpm.model_id,
//             purchaseQty,
//           ]
//         );

//         await connection.query(
//           `INSERT INTO mrn_activity_logs
//            (mrn_id, mpm_id, model_id, pr_id, action_type, qty, status, created_by)
//            VALUES (?, ?, ?, ?, 'PURCHASE_REQUEST', ?, 'Pending', ?)`,
//           [mrn_id, mpm_id, mpm.model_id, pr.insertId, purchaseQty, verified_by]
//         );
//       }

//       /* 🔹 Verification Log FIX */
//       const logQty = finalVerified > 0 ? finalVerified : purchaseQty;

//       await connection.query(
//         `INSERT INTO mrn_activity_logs
//          (mrn_id, mpm_id, model_id, action_type, qty, status, created_by)
//          VALUES (?, ?, ?, 'VERIFICATION', ?, 'Verified', ?)`,
//         [mrn_id, mpm_id, mpm.model_id, logQty, verified_by]
//       );
//     }

//     await connection.query(
//       `UPDATE generate_mrn SET mrn_status='Verified' WHERE mrn_id=?`,
//       [mrn_id]
//     );

//     await connection.commit();

//     res.json({ success: true, message: "Verified" });
//   } catch (err) {
//     await connection.rollback();
//     res.status(500).json({ success: false, message: err.message });
//   } finally {
//     connection.release();
//   }
// };


export const verifyMRN = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const { mrn_id, products } = req.body;

    const verified_by = req.session.user?.id || null;

    if (!mrn_id || !products || !Array.isArray(products)) {
      return res.status(400).json({
        success: false,
        message: 'mrn_id and products are required',
      });
    }

    await connection.beginTransaction();

    for (const item of products) {
      const { mpm_id, verified_qty } = item;

      /* =========================
         GET PRODUCT + STOCK
      ========================== */
      const [[mpm]] = await connection.query(
        `SELECT 
            mpm.*,
            IFNULL(s.qty, 0) AS stock_qty
         FROM mrn_prod_map mpm
         LEFT JOIN stock s
           ON s.model_id = mpm.model_id
         WHERE mpm.mpm_id=?`,
        [mpm_id],
      );

      if (!mpm) {
        throw new Error(`Invalid MPM ID: ${mpm_id}`);
      }

      const requestedQty = Number(mpm.requested_qty);
      const stockQty = Number(mpm.stock_qty);

      let finalVerifiedQty = 0;
      let purchaseQty = 0;

      /* =========================
         STOCK VERIFICATION LOGIC
      ========================== */

      // Full stock available
      if (stockQty >= requestedQty) {
        finalVerifiedQty = requestedQty;
        purchaseQty = 0;
      }

      // Partial stock available
      else if (stockQty > 0) {
        finalVerifiedQty =
          verified_qty != null
            ? Math.min(Number(verified_qty), stockQty)
            : stockQty;

        purchaseQty = requestedQty - finalVerifiedQty;
      }

      // No stock available
      else {
        finalVerifiedQty = 0;
        purchaseQty = requestedQty;
      }

      /* =========================
         UPDATE MRM PRODUCT MAP
      ========================== */

      await connection.query(
        `UPDATE mrn_prod_map
         SET 
           verified_qty=?,
           purchase_qty=?,
           status='Approval Pending',
           purchase_status=
             CASE
               WHEN ? > 0 THEN 'Pending'
               ELSE 'Not Requested'
             END
         WHERE mpm_id=?`,
        [finalVerifiedQty, purchaseQty, purchaseQty, mpm_id],
      );

      /* =========================
         VERIFICATION LOG
      ========================== */

      const logQty = finalVerifiedQty > 0 ? finalVerifiedQty : purchaseQty;

      await connection.query(
        `INSERT INTO mrn_activity_logs
         (
           mrn_id,
           mpm_id,
           model_id,
           action_type,
           qty,
           status,
           created_by
         )
         VALUES
         (
           ?, ?, ?, 'VERIFICATION',
           ?, 'Verified', ?
         )`,
        [mrn_id, mpm_id, mpm.model_id, logQty, verified_by],
      );
    }

    /* =========================
       UPDATE MRN STATUS
    ========================== */

    await connection.query(
      `UPDATE generate_mrn
       SET mrn_status='Verified'
       WHERE mrn_id=?`,
      [mrn_id],
    );

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: 'MRN Verified Successfully',
    });
  } catch (err) {
    await connection.rollback();

    console.error('Verify MRN Error:', err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  } finally {
    connection.release();
  }
};


const updateMRNStatus = async (mrn_id, connection) => {
  const [rows] = await connection.query(
    `SELECT COUNT(*) as pendingCount
     FROM mrn_prod_map
     WHERE mrn_id = ? AND pending_qty > 0`,
    [mrn_id],
  );

  const mrnStatus =
    rows[0].pendingCount > 0 ? 'Verification Pending' : 'Approval Pending';

  await connection.query(
    `UPDATE generate_mrn 
     SET mrn_status = ?
     WHERE mrn_id = ?`,
    [mrnStatus, mrn_id],
  );
};

export const getMRNDetailsById = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const { mrn_id } = req.params;

    /* =========================
       1️⃣ MRN DATA
    ========================== */
    const [mrn] = await connection.query(
      `SELECT 
          m.mrn_id,
          m.mrn_number,
          m.master_id,
          m.qt_id,
          m.expected_date,
          m.created_by,
          m.created_at,
          rd.name,
          m.mrn_status
       FROM generate_mrn m
       LEFT JOIN raw_data rd ON rd.master_id = m.master_id
       WHERE m.mrn_id = ?`,
      [mrn_id],
    );

    if (!mrn.length) {
      return res.status(404).json({
        success: false,
        message: 'MRN not found',
      });
    }

    /* =========================
       2️⃣ PRODUCTS (CORRECT LOGIC)
    ========================== */
    const [products] = await connection.query(
      `SELECT 
        mpm.mpm_id,
        mpm.prod_id,
        mpm.model_id,
        mpm.brand_id,
        mpm.kit_id,

        /* ✅ MRN GENERATED QTY */
        mpm.requested_qty,

        /* ✅ VERIFIED / APPROVED / ISSUED */
        IFNULL(mpm.verified_qty,0) AS verified_qty,
        IFNULL(mpm.approval_qty,0) AS approval_qty,
        IFNULL(mpm.required_qty,0) AS issued_qty,

        /* ✅ PURCHASE REQUESTED */
        IFNULL(pr.total_requested, 0) AS purchase_requested_qty,

        /* ✅ CORRECT PENDING (FOR PURCHASE) */
        (
          mpm.requested_qty - IFNULL(pr.total_requested,0)
        ) AS pending_qty,

        /* ✅ STOCK */
        IFNULL(s.qty, 0) AS available_qty,

        /* ✅ PRODUCT INFO */
        b.brand_name,
        mo.model_no,

        /* ✅ STATUS */
        mpm.status,

        /* ✅ FULLY APPROVED FLAG */
        CASE 
          WHEN IFNULL(mpm.approval_qty,0) >= mpm.requested_qty THEN 1
          ELSE 0
        END AS is_fully_approved

      FROM mrn_prod_map mpm

      /* ✅ PURCHASE REQUEST JOIN */
      LEFT JOIN (
        SELECT mpm_id, SUM(qty) AS total_requested
        FROM purchase_request
        WHERE status IN ('Pending','Approved','Purchased')
        GROUP BY mpm_id
      ) pr ON pr.mpm_id = mpm.mpm_id

      /* ✅ STOCK */
      LEFT JOIN stock s ON s.model_id = mpm.model_id

      /* ✅ MASTER DATA */
      LEFT JOIN brands b ON b.brand_id = mpm.brand_id
      LEFT JOIN models mo ON mo.model_id = mpm.model_id

      WHERE mpm.mrn_id = ?`,
      [mrn_id],
    );

    /* =========================
       3️⃣ RESPONSE
    ========================== */
    return res.status(200).json({
      success: true,
      data: {
        ...mrn[0],
        products,
      },
    });
  } catch (error) {
    console.error('Error fetching MRN details:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  } finally {
    connection.release();
  }
};


export const getVerificationPendingMRNs = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const query = `
      SELECT 
        gm.mrn_id,
        gm.mrn_number,
        gm.master_id,
        gm.qt_id,
        gm.expected_date,
        gm.created_by,
        gm.created_at,
        gm.mrn_status,

        rd.name AS client_name,
        rd.city,

        es.execution_id,
        es.schedule_name,

        mpm.mpm_id,
        mpm.prod_id,
        mpm.model_id,
        mpm.brand_id,

        mpm.required_qty,
        IFNULL(mpm.approval_qty,0) AS approval_qty,

        /* ✅ CALCULATED PENDING */
        (mpm.required_qty - IFNULL(mpm.approval_qty,0)) AS pending_qty,

        mpm.status AS item_status

      FROM generate_mrn gm

      LEFT JOIN raw_data rd 
        ON gm.master_id = rd.master_id

      LEFT JOIN execution_start es 
        ON FIND_IN_SET(gm.master_id, es.lead_ids)

      LEFT JOIN mrn_prod_map mpm 
        ON gm.mrn_id = mpm.mrn_id

      WHERE gm.mrn_status = 'Verification Pending'

      ORDER BY gm.created_at DESC
    `;

    const [rows] = await connection.query(query);

    /* =========================
       ✅ GROUPING
    ========================== */
    const mrnMap = {};

    rows.forEach((row) => {
      if (!mrnMap[row.mrn_id]) {
        mrnMap[row.mrn_id] = {
          mrn_id: row.mrn_id,
          mrn_number: row.mrn_number,
          master_id: row.master_id,
          qt_id: row.qt_id,
          expected_date: row.expected_date,
          created_at: row.created_at,
          mrn_status: row.mrn_status,

          client_name: row.client_name,
          city: row.city,

          execution: {
            execution_id: row.execution_id,
            schedule_name: row.schedule_name,
          },

          items: [],
        };
      }

      if (row.mpm_id) {
        mrnMap[row.mrn_id].items.push({
          mpm_id: row.mpm_id,
          prod_id: row.prod_id,
          model_id: row.model_id,
          brand_id: row.brand_id,

          required_qty: row.required_qty,
          approval_qty: row.approval_qty, // ✅ NEW

          pending_qty: row.pending_qty, // ✅ CALCULATED

          status: row.item_status,
        });
      }
    });

    const result = Object.values(mrnMap);

    return res.status(200).json({
      message: result.length
        ? 'Verification Pending MRNs fetched successfully'
        : 'No MRNs found',
      data: result,
    });
  } catch (error) {
    console.error('getVerificationPendingMRNs Error:', error);

    return res.status(500).json({
      message: 'Failed to fetch MRNs',
      error: error.message,
    });
  } finally {
    connection.release();
  }
};


export const getVerifiedMRNs = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const query = `
      SELECT 
        gm.mrn_id,
        gm.mrn_number,
        gm.master_id,
        gm.qt_id,
        gm.expected_date,
        gm.created_at,
        gm.mrn_status,

        rd.name AS client_name,
        rd.city,

        es.execution_id,
        es.schedule_name,

        mpm.mpm_id,
        mpm.prod_id,
        mpm.model_id,
        mpm.brand_id,

        /* ✅ CORRECT VALUES */
        IFNULL(mpm.requested_qty,0) AS requested_qty,
        IFNULL(mpm.verified_qty,0) AS verified_qty,
        IFNULL(mpm.approval_qty,0) AS approval_qty,

        /* ✅ CORRECT PENDING */
        (IFNULL(mpm.verified_qty,0) - IFNULL(mpm.approval_qty,0)) AS pending_qty,

        mpm.status AS item_status

      FROM generate_mrn gm

      LEFT JOIN raw_data rd 
        ON gm.master_id = rd.master_id

      LEFT JOIN execution_start es 
        ON FIND_IN_SET(gm.master_id, es.lead_ids)

      LEFT JOIN mrn_prod_map mpm 
        ON gm.mrn_id = mpm.mrn_id

      /* ✅ ONLY VERIFIED MRNs */
      WHERE gm.mrn_status IN ('Verified', 'Approval Pending')

      ORDER BY gm.created_at DESC
    `;

    const [rows] = await connection.query(query);

    /* =========================
       ✅ GROUPING (IMPORTANT)
    ========================== */
    const mrnMap = {};

    rows.forEach((row) => {
      if (!mrnMap[row.mrn_id]) {
        mrnMap[row.mrn_id] = {
          mrn_id: row.mrn_id,
          mrn_number: row.mrn_number,
          master_id: row.master_id,
          qt_id: row.qt_id,
          expected_date: row.expected_date,
          created_at: row.created_at,
          mrn_status: row.mrn_status,

          client_name: row.client_name,
          city: row.city,

          execution: {
            execution_id: row.execution_id,
            schedule_name: row.schedule_name,
          },

          items: [],
        };
      }

      if (row.mpm_id) {
        mrnMap[row.mrn_id].items.push({
          mpm_id: row.mpm_id,
          prod_id: row.prod_id,
          model_id: row.model_id,
          brand_id: row.brand_id,

          requested_qty: row.requested_qty,
          verified_qty: row.verified_qty,
          approval_qty: row.approval_qty,

          pending_qty: row.pending_qty > 0 ? row.pending_qty : 0,

          /* ✅ FIX STATUS (important) */
          status: row.pending_qty > 0 ? 'Approval Pending' : 'Approved',
        });
      }
    });

    const result = Object.values(mrnMap);

    return res.status(200).json({
      message: result.length
        ? 'Verified MRNs fetched successfully'
        : 'No Verified MRNs found',
      data: result,
    });
  } catch (error) {
    console.error('getVerifiedMRNs Error:', error);

    return res.status(500).json({
      message: 'Failed to fetch MRNs',
      error: error.message,
    });
  } finally {
    connection.release();
  }
};


// export const getApprovalItems = async (req, res) => {
//   const connection = await db.getConnection();

//   try {
//     const query = `
//       SELECT
//         gm.mrn_id,
//         gm.mrn_number,
//         gm.mrn_status,
//         rd.name AS client_name,

//         mpm.mpm_id,
//         mpm.model_id,
//         mpm.brand_id,

//         mpm.verified_qty,
//         mpm.approval_qty,

//         (mpm.verified_qty - IFNULL(mpm.approval_qty,0)) AS pending_qty,

//         b.brand_name,
//         m.model_no

//       FROM generate_mrn gm
//       JOIN mrn_prod_map mpm ON gm.mrn_id = mpm.mrn_id
//       LEFT JOIN raw_data rd ON rd.master_id = gm.master_id
//       LEFT JOIN brands b ON b.brand_id = mpm.brand_id
//       LEFT JOIN models m ON m.model_id = mpm.model_id

//       WHERE gm.mrn_status = 'Verified'
//       AND mpm.verified_qty > 0
//     `;

//     const [rows] = await connection.query(query);

//     res.json({
//       success: true,
//       data: rows,
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   } finally {
//     connection.release();
//   }
// };

export const getApprovalItems = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const query = `
      SELECT 
        gm.mrn_id,
        gm.mrn_number,
        gm.mrn_status,
        rd.name AS client_name,

        mpm.mpm_id,
        mpm.model_id,
        mpm.brand_id,

        mpm.verified_qty,
        mpm.approval_qty,

        (mpm.verified_qty - IFNULL(mpm.approval_qty,0)) AS pending_qty,

        b.brand_name,
        m.model_no,

        mpm.purchase_status   -- ✅ ADD THIS (important)

      FROM generate_mrn gm
      JOIN mrn_prod_map mpm ON gm.mrn_id = mpm.mrn_id
      LEFT JOIN raw_data rd ON rd.master_id = gm.master_id
      LEFT JOIN brands b ON b.brand_id = mpm.brand_id
      LEFT JOIN models m ON m.model_id = mpm.model_id

      WHERE gm.mrn_status IN ('Verified', 'Approval Pending')  -- ✅ FIX
      AND (mpm.verified_qty - IFNULL(mpm.approval_qty,0)) > 0  -- ✅ ONLY PENDING
    `;

    const [rows] = await connection.query(query);

    res.json({
      success: true,
      data: rows,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    connection.release();
  }
};


// export const approveMRN = async (req, res) => {
//   const connection = await db.getConnection();

//   try {
//     const { mrn_id, products } = req.body;
// const approved_by = req.session.user?.id || null;

//     await connection.beginTransaction();

//     for (const item of products) {
//       const { mpm_id, approval_qty } = item;

//       /* =========================
//          1️⃣ GET CURRENT DATA
//       ========================== */
//       const [[mpm]] = await connection.query(
//         `SELECT
//             verified_qty,
//             approval_qty
//          FROM mrn_prod_map
//          WHERE mpm_id = ?`,
//         [mpm_id]
//       );

//       if (!mpm) {
//         throw new Error(`Item not found (mpm_id: ${mpm_id})`);
//       }

//       const verified = Number(mpm.verified_qty || 0);
//       const alreadyApproved = Number(mpm.approval_qty || 0);

//       const pending = verified - alreadyApproved;

//       /* =========================
//          2️⃣ VALIDATION
//       ========================== */
//       if (approval_qty <= 0) {
//         throw new Error(`Invalid approval qty for item ${mpm_id}`);
//       }

//       if (approval_qty > pending) {
//         throw new Error(
//           `Approval exceeds pending for item ${mpm_id}`
//         );
//       }

//       /* =========================
//          3️⃣ UPDATE APPROVAL
//       ========================== */
//       const newApprovalQty = alreadyApproved + approval_qty;

//       const newStatus =
//         newApprovalQty >= verified
//           ? 'Approved'
//           : 'Approval Pending';

//       await connection.query(
//         `UPDATE mrn_prod_map
//          SET approval_qty = ?, status = ?
//          WHERE mpm_id = ?`,
//         [newApprovalQty, newStatus, mpm_id]
//       );

//       /* =========================
//          4️⃣ LOG ENTRY
//       ========================== */
//       await connection.query(
//         `INSERT INTO mrn_activity_logs
//          (mrn_id, mpm_id, model_id, action_type, qty, status, created_by)
//          VALUES (?, ?,
//             (SELECT model_id FROM mrn_prod_map WHERE mpm_id=?),
//             'APPROVAL', ?, ?, ?)`,
//         [
//           mrn_id,
//           mpm_id,
//           mpm_id,
//           approval_qty,
//           newStatus,
//           approved_by || null,
//         ]
//       );
//     }

//     /* =========================
//        5️⃣ UPDATE MRN STATUS
//     ========================== */
//     const [[pendingCheck]] = await connection.query(
//       `SELECT COUNT(*) AS pending
//        FROM mrn_prod_map
//        WHERE mrn_id = ?
//        AND approval_qty < verified_qty`,
//       [mrn_id]
//     );

//     const finalStatus =
//       pendingCheck.pending === 0 ? 'Approved' : 'Approval Pending';

//     await connection.query(
//       `UPDATE generate_mrn
//        SET mrn_status = ?
//        WHERE mrn_id = ?`,
//       [finalStatus, mrn_id]
//     );

//     await connection.commit();

//     res.json({
//       success: true,
//       message: 'MRN Approved Successfully',
//     });

//   } catch (error) {
//     await connection.rollback();

//     console.error('Approve MRN Error:', error);

//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   } finally {
//     connection.release();
//   }
// };


export const approveMRN = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const { mrn_id, products } = req.body;
    const approved_by = req.session.user?.id || null;

    if (!mrn_id || !products || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'MRN ID and products are required',
      });
    }

    await connection.beginTransaction();

    /* =========================
       1️⃣ ITEM LOOP
    ========================== */
    for (const item of products) {
      const { mpm_id, approval_qty } = item;

      /* GET DATA */
      const [[mpm]] = await connection.query(
        `SELECT verified_qty, approval_qty
         FROM mrn_prod_map
         WHERE mpm_id = ?`,
        [mpm_id],
      );

      if (!mpm) {
        throw new Error(`Item not found (mpm_id: ${mpm_id})`);
      }

      const verified = Number(mpm.verified_qty || 0);
      const alreadyApproved = Number(mpm.approval_qty || 0);
      const pending = verified - alreadyApproved;

      /* VALIDATION */
      if (approval_qty <= 0) {
        throw new Error(`Invalid approval qty for item ${mpm_id}`);
      }

      if (approval_qty > pending) {
        throw new Error(`Approval exceeds pending for item ${mpm_id}`);
      }

      /* UPDATE APPROVAL */
      const newApprovalQty = alreadyApproved + approval_qty;

      const newStatus =
        newApprovalQty >= verified ? 'Approved' : 'Approval Pending';

      await connection.query(
        `UPDATE mrn_prod_map
         SET approval_qty = ?, status = ?
         WHERE mpm_id = ?`,
        [newApprovalQty, newStatus, mpm_id],
      );

      /* ITEM LOG */
      await connection.query(
        `INSERT INTO mrn_activity_logs
         (mrn_id, mpm_id, model_id, action_type, qty, status, created_by)
         VALUES (?, ?, 
           (SELECT model_id FROM mrn_prod_map WHERE mpm_id=?),
           'APPROVAL', ?, ?, ?)`,
        [mrn_id, mpm_id, mpm_id, approval_qty, newStatus, approved_by],
      );
    }

    /* =========================
       2️⃣ UPDATE MRN STATUS
    ========================== */
    const [[pendingCheck]] = await connection.query(
      `SELECT COUNT(*) AS pending
       FROM mrn_prod_map
       WHERE mrn_id = ?
       AND approval_qty < verified_qty`,
      [mrn_id],
    );

    const finalStatus =
      pendingCheck.pending === 0 ? 'Approved' : 'Approval Pending';

    await connection.query(
      `UPDATE generate_mrn
       SET mrn_status = ?
       WHERE mrn_id = ?`,
      [finalStatus, mrn_id],
    );

    /* =========================
       3️⃣ MRN LEVEL LOG (NEW ✅)
    ========================== */
    const [[anyMpm]] = await connection.query(
      `SELECT mpm_id, model_id 
       FROM mrn_prod_map 
       WHERE mrn_id=? 
       LIMIT 1`,
      [mrn_id],
    );

    if (anyMpm?.mpm_id && anyMpm?.model_id) {
      await connection.query(
        `INSERT INTO mrn_activity_logs
   (mrn_id, mpm_id, model_id, action_type, status, created_by)
   VALUES (?, ?, ?, ?, ?, ?)`,
        [
          mrn_id,
          anyMpm.mpm_id,
          anyMpm.model_id,
          'MRN_STATUS_UPDATE', // ✅ FIXED
          finalStatus,
          approved_by,
        ],
      );
    }

    await connection.commit();

    res.json({
      success: true,
      message: 'MRN Approved Successfully',
    });
  } catch (error) {
    await connection.rollback();

    console.error('Approve MRN Error:', error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    connection.release();
  }
};


// export const getApprovedMRNs = async (req, res) => {
//   const connection = await db.getConnection();

//   try {
//     const query = `
//       SELECT
//   gm.mrn_id,
//   gm.mrn_number,
//   gm.master_id,
//   gm.qt_id,
//   gm.expected_date,
//   gm.created_at,
//   gm.mrn_status,

//   rd.name AS client_name,
//   rd.city,

//   mpm.mpm_id,
//   mpm.prod_id,
//   mpm.model_id,
//   mpm.brand_id,

//   IFNULL(mpm.requested_qty,0) AS requested_qty,
//   IFNULL(mpm.verified_qty,0) AS verified_qty,
//   IFNULL(mpm.approval_qty,0) AS approval_qty,

//   (IFNULL(mpm.approval_qty,0) - IFNULL(mpm.verified_qty,0)) AS extra_info,

//   b.brand_name,
//   m.model_no

// FROM generate_mrn gm

// LEFT JOIN raw_data rd
//   ON gm.master_id = rd.master_id

// LEFT JOIN mrn_prod_map mpm
//   ON gm.mrn_id = mpm.mrn_id

// LEFT JOIN brands b
//   ON b.brand_id = mpm.brand_id

// LEFT JOIN models m
//   ON m.model_id = mpm.model_id

// WHERE gm.mrn_status = 'Approved'

// ORDER BY gm.created_at DESC;
//     `;

//     const [rows] = await connection.query(query);

//     // Grouping
//     const mrnMap = {};

//     rows.forEach((row) => {
//       if (!mrnMap[row.mrn_id]) {
//         mrnMap[row.mrn_id] = {
//           mrn_id: row.mrn_id,
//           mrn_number: row.mrn_number,
//           master_id: row.master_id,
//           qt_id: row.qt_id,
//           expected_date: row.expected_date,
//           created_at: row.created_at,
//           mrn_status: row.mrn_status,
//           client_name: row.client_name,
//           city: row.city,
//           items: [],
//         };
//       }

//       if (row.mpm_id) {
//         mrnMap[row.mrn_id].items.push({
//           mpm_id: row.mpm_id,
//           prod_id: row.prod_id,
//           model_id: row.model_id,
//           brand_name: row.brand_name,
//           model_no: row.model_no,
//           brand_id: row.brand_id,
//           requested_qty: row.requested_qty,
//           verified_qty: row.verified_qty,
//           approval_qty: row.approval_qty,
//         });
//       }
//     });

//     const result = Object.values(mrnMap);

//     res.status(200).json({
//       success: true,
//       message: result.length
//         ? "Approved MRNs fetched successfully"
//         : "No Approved MRNs found",
//       data: result,
//     });

//   } catch (error) {
//     console.error("getApprovedMRNs Error:", error);

//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });

//   } finally {
//     connection.release();
//   }
// };

export const getMRNsForIssueAndPurchase = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const query = `
      SELECT 
        gm.mrn_id,
        gm.mrn_number,
        gm.mrn_status,
        gm.master_id,
        gm.qt_id,
        gm.created_at,

        rd.name AS client_name,
        rd.city,

        mpm.mpm_id,
        mpm.prod_id,
        mpm.model_id,
        mpm.brand_id,

        IFNULL(mpm.requested_qty,0) AS requested_qty,
        IFNULL(mpm.verified_qty,0) AS verified_qty,
        IFNULL(mpm.approval_qty,0) AS approval_qty,
        IFNULL(mpm.purchase_qty,0) AS purchase_qty,

        /* ✅ ISSUED QTY */
        IFNULL(iss.issued_qty,0) AS issued_qty,

        /* ✅ REMAINING ISSUE QTY */
        (IFNULL(mpm.approval_qty,0) - IFNULL(iss.issued_qty,0)) AS remaining_qty,

        /* ✅ ITEM STATUS */
        CASE 
          WHEN IFNULL(mpm.purchase_qty,0) > 0 
            THEN 'Waiting Purchase'

          WHEN IFNULL(iss.issued_qty,0) = 0 
            THEN 'Ready to Issue'

          WHEN IFNULL(iss.issued_qty,0) < IFNULL(mpm.approval_qty,0) 
            THEN 'Partially Issued'

          ELSE 'Fully Issued'
        END AS item_status,

        b.brand_name,
        m.model_no

      FROM generate_mrn gm

      JOIN mrn_prod_map mpm 
        ON gm.mrn_id = mpm.mrn_id

      LEFT JOIN raw_data rd 
        ON rd.master_id = gm.master_id

      /* ✅ ISSUE SUMMARY */
      LEFT JOIN (
        SELECT mpm_id, SUM(issued_qty) AS issued_qty
        FROM issue_items
        GROUP BY mpm_id
      ) iss 
        ON iss.mpm_id = mpm.mpm_id

      LEFT JOIN brands b 
        ON b.brand_id = mpm.brand_id

      LEFT JOIN models m 
        ON m.model_id = mpm.model_id

      /* 🔥 BOTH MRN STATUS */
      WHERE gm.mrn_status IN ('Approved', 'Partially Issued')

      /* 🔥 INCLUDE BOTH TYPES */
      AND (
        (IFNULL(mpm.approval_qty,0) - IFNULL(iss.issued_qty,0)) > 0
        OR IFNULL(mpm.purchase_qty,0) > 0
      )

      ORDER BY gm.created_at DESC
    `;

    const [rows] = await connection.query(query);

    /* =========================
       ✅ GROUPING
    ========================== */
    const mrnMap = {};

    rows.forEach((row) => {
      if (!mrnMap[row.mrn_id]) {
        mrnMap[row.mrn_id] = {
          mrn_id: row.mrn_id,
          mrn_number: row.mrn_number,
          mrn_status: row.mrn_status,
          master_id: row.master_id,
          qt_id: row.qt_id,
          created_at: row.created_at,
          client_name: row.client_name,
          city: row.city,
          items: [],
        };
      }

      if (row.mpm_id) {
        mrnMap[row.mrn_id].items.push({
          mpm_id: row.mpm_id,
          prod_id: row.prod_id,
          model_id: row.model_id,
          brand_id: row.brand_id,

          brand_name: row.brand_name,
          model_no: row.model_no,

          requested_qty: row.requested_qty,
          verified_qty: row.verified_qty,
          approval_qty: row.approval_qty,
          purchase_qty: row.purchase_qty,

          issued_qty: Number(row.issued_qty),
          remaining_qty: Number(row.remaining_qty),

          item_status: row.item_status,
        });
      }
    });

    res.status(200).json({
      success: true,
      message: 'MRNs fetched successfully (Issue + Purchase)',
      data: Object.values(mrnMap),
    });
  } catch (error) {
    console.error('getMRNsForIssueAndPurchase Error:', error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    connection.release();
  }
};


export const getApprovedMRNs = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const query = `
      SELECT 
        gm.mrn_id,
        gm.mrn_number,
        gm.master_id,
        gm.qt_id,
        gm.expected_date,
        gm.created_at,
        gm.mrn_status,

        rd.name AS client_name,
        rd.city,

        mpm.mpm_id,
        mpm.prod_id,
        mpm.model_id,
        mpm.brand_id,

        IFNULL(mpm.requested_qty,0) AS requested_qty,
        IFNULL(mpm.verified_qty,0) AS verified_qty,
        IFNULL(mpm.approval_qty,0) AS approval_qty,
        IFNULL(mpm.purchase_qty,0) AS purchase_qty,

        /* ✅ ISSUED QTY */
        IFNULL(iss.issued_qty,0) AS issued_qty,

        /* ✅ REMAINING */
        (IFNULL(mpm.approval_qty,0) - IFNULL(iss.issued_qty,0)) AS remaining_qty,

        /* ✅ STATUS */
        CASE 
          WHEN IFNULL(mpm.approval_qty,0) = 0 AND IFNULL(mpm.purchase_qty,0) > 0 
            THEN 'Waiting Purchase'
          WHEN IFNULL(iss.issued_qty,0) = 0 
            THEN 'Ready to Issue'
          WHEN IFNULL(iss.issued_qty,0) < IFNULL(mpm.approval_qty,0) 
            THEN 'Partially Issued'
          ELSE 'Fully Issed'
        END AS item_status,

        b.brand_name,
        m.model_no

      FROM generate_mrn gm

      LEFT JOIN raw_data rd 
        ON gm.master_id = rd.master_id

      LEFT JOIN mrn_prod_map mpm 
        ON gm.mrn_id = mpm.mrn_id

      /* ✅ ISSUE SUMMARY */
      LEFT JOIN (
        SELECT mpm_id, SUM(issued_qty) AS issued_qty
        FROM issue_items
        GROUP BY mpm_id
      ) iss ON iss.mpm_id = mpm.mpm_id

      LEFT JOIN brands b 
        ON b.brand_id = mpm.brand_id

      LEFT JOIN models m 
        ON m.model_id = mpm.model_id

      WHERE gm.mrn_status = 'Approved'
      
      /* 🔥 IMPORTANT FIX */
      AND (IFNULL(mpm.approval_qty,0) - IFNULL(iss.issued_qty,0)) > 0

      ORDER BY gm.created_at DESC
    `;

    const [rows] = await connection.query(query);

    /* =========================
       ✅ GROUPING
    ========================== */
    const mrnMap = {};

    rows.forEach((row) => {
      if (!mrnMap[row.mrn_id]) {
        mrnMap[row.mrn_id] = {
          mrn_id: row.mrn_id,
          mrn_number: row.mrn_number,
          master_id: row.master_id,
          qt_id: row.qt_id,
          expected_date: row.expected_date,
          created_at: row.created_at,
          mrn_status: row.mrn_status,
          client_name: row.client_name,
          city: row.city,
          items: [],
        };
      }

      if (row.mpm_id) {
        mrnMap[row.mrn_id].items.push({
          mpm_id: row.mpm_id,
          prod_id: row.prod_id,
          model_id: row.model_id,
          brand_id: row.brand_id,

          brand_name: row.brand_name,
          model_no: row.model_no,

          requested_qty: row.requested_qty,
          verified_qty: row.verified_qty,
          approval_qty: row.approval_qty,
          purchase_qty: row.purchase_qty,

          issued_qty: row.issued_qty,
          remaining_qty: row.remaining_qty > 0 ? row.remaining_qty : 0,

          item_status: row.item_status,
        });
      }
    });

    res.status(200).json({
      success: true,
      message: 'Issuable MRNs fetched successfully',
      data: Object.values(mrnMap),
    });
  } catch (error) {
    console.error('getApprovedMRNs Error:', error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    connection.release();
  }
};

export const getIssueItems = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const query = `
      SELECT 
        gm.mrn_id,
        gm.mrn_number,
        gm.mrn_status,
        gm.created_at,

        rd.name AS client_name,
        rd.city,

        mpm.mpm_id,
        mpm.prod_id,
        mpm.model_id,
        mpm.brand_id,

        /* ✅ CORE QTY FIELDS */
        IFNULL(mpm.requested_qty,0) AS requested_qty,
        IFNULL(mpm.verified_qty,0) AS verified_qty,
        IFNULL(mpm.approval_qty,0) AS approval_qty,

        /* ✅ TOTAL ISSUED */
        IFNULL(iss.issued_qty,0) AS issued_qty,

        /* ✅ REMAINING TO ISSUE */
        (IFNULL(mpm.approval_qty,0) - IFNULL(iss.issued_qty,0)) AS remaining_qty,

        /* ✅ STATUS FOR UI */
        CASE 
          WHEN IFNULL(iss.issued_qty,0) = 0 THEN 'Not Issued'
          WHEN IFNULL(iss.issued_qty,0) < IFNULL(mpm.approval_qty,0) THEN 'Partially Issued'
          ELSE 'Fully Issued'
        END AS issue_status,

        b.brand_name,
        m.model_no

      FROM generate_mrn gm

      JOIN mrn_prod_map mpm 
        ON gm.mrn_id = mpm.mrn_id

      /* ✅ ISSUE SUMMARY */
      LEFT JOIN (
        SELECT 
          mpm_id, 
          SUM(issued_qty) AS issued_qty
        FROM issue_items
        GROUP BY mpm_id
      ) iss 
        ON iss.mpm_id = mpm.mpm_id

      LEFT JOIN raw_data rd 
        ON rd.master_id = gm.master_id

      LEFT JOIN brands b 
        ON b.brand_id = mpm.brand_id

      LEFT JOIN models m 
        ON m.model_id = mpm.model_id

      /* ✅ ONLY APPROVED MRNs */
      WHERE gm.mrn_status = 'Approved'
      AND IFNULL(mpm.approval_qty,0) > 0

      ORDER BY gm.created_at DESC
    `;

    const [rows] = await connection.query(query);

    /* =========================
       ✅ GROUP BY MRN
    ========================== */
    const mrnMap = {};

    rows.forEach((row) => {
      if (!mrnMap[row.mrn_id]) {
        mrnMap[row.mrn_id] = {
          mrn_id: row.mrn_id,
          mrn_number: row.mrn_number,
          mrn_status: row.mrn_status,
          created_at: row.created_at,

          client_name: row.client_name,
          city: row.city,

          items: [],
        };
      }

      mrnMap[row.mrn_id].items.push({
        mpm_id: row.mpm_id,
        prod_id: row.prod_id,
        model_id: row.model_id,
        brand_id: row.brand_id,

        brand_name: row.brand_name,
        model_no: row.model_no,

        requested_qty: row.requested_qty,
        verified_qty: row.verified_qty,
        approval_qty: row.approval_qty,

        issued_qty: row.issued_qty,
        remaining_qty: row.remaining_qty > 0 ? row.remaining_qty : 0,

        issue_status: row.issue_status,
      });
    });

    const result = Object.values(mrnMap);

    return res.status(200).json({
      success: true,
      message: result.length
        ? 'Issue items fetched successfully'
        : 'No items available for issue',
      data: result,
    });
  } catch (error) {
    console.error('getIssueItems Error:', error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    connection.release();
  }
};

// export const issueMRNItems = async (req, res) => {
//   const connection = await db.getConnection();

//   try {
//     const { mrn_id, items } = req.body;
//     const issued_by = req.session.user?.id || null;

//     if (!mrn_id || !items || items.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: 'MRN ID and items are required',
//       });
//     }

//     await connection.beginTransaction();

//     for (const item of items) {
//       const { mpm_id, model_id, issue_qty } = item;

//       if (!issue_qty || issue_qty <= 0) {
//         throw new Error(`Invalid issue qty for mpm_id ${mpm_id}`);
//       }

//       /* =========================
//          1️⃣ GET MPM DATA
//       ========================== */
//       const [[mpm]] = await connection.query(
//         `SELECT approval_qty FROM mrn_prod_map WHERE mpm_id=?`,
//         [mpm_id],
//       );

//       if (!mpm) throw new Error(`MPM not found (${mpm_id})`);

//       const approvalQty = Number(mpm.approval_qty);

//       /* 🚫 BLOCK NON-APPROVED */
//       if (approvalQty <= 0) {
//         throw new Error(`Item not approved (mpm_id: ${mpm_id})`);
//       }

//       /* =========================
//          2️⃣ ALREADY ISSUED
//       ========================== */
//       const [[issuedRow]] = await connection.query(
//         `SELECT IFNULL(SUM(issued_qty),0) AS issued_qty
//          FROM issue_items WHERE mpm_id=?`,
//         [mpm_id],
//       );

//       const alreadyIssued = Number(issuedRow.issued_qty);
//       const remaining = approvalQty - alreadyIssued;

//       if (issue_qty > remaining) {
//         throw new Error(
//           `Issue qty exceeds remaining for mpm_id ${mpm_id}. Remaining: ${remaining}`,
//         );
//       }

//       /* =========================
//          3️⃣ STOCK CHECK
//       ========================== */
//       const [[stockRow]] = await connection.query(
//         `SELECT qty FROM stock WHERE model_id=?`,
//         [model_id],
//       );

//       if (!stockRow) {
//         throw new Error(`Stock not found for model_id ${model_id}`);
//       }

//       const availableStock = Number(stockRow.qty);

//       if (availableStock < issue_qty) {
//         throw new Error(
//           `Insufficient stock for model_id ${model_id}. Available: ${availableStock}`,
//         );
//       }

//       /* =========================
//          4️⃣ INSERT ISSUE
//       ========================== */
//       const [issueResult] = await connection.query(
//         `INSERT INTO issue_items
//    (mrn_id, mpm_id, model_id, issued_qty, Issue_notes, issued_by)
//    VALUES (?, ?, ?, ?, ?, ?)`,
//         [
//           mrn_id,
//           mpm_id,
//           model_id,
//           issue_qty,
//           issue_notes || null, // ✅ FIXED
//           issued_by,
//         ],
//       );

//       const issue_id = issueResult.insertId;

//       /* =========================
//          5️⃣ UPDATE STOCK
//       ========================== */
//       await connection.query(
//         `UPDATE stock SET qty = qty - ? WHERE model_id=?`,
//         [issue_qty, model_id],
//       );

//       /* =========================
//          6️⃣ UPDATE ITEM STATUS
//       ========================== */
//       const newIssued = alreadyIssued + issue_qty;

//       const itemStatus =
//         newIssued >= approvalQty ? 'Issued' : 'Partially Issued';

//       await connection.query(
//         `UPDATE mrn_prod_map SET status=? WHERE mpm_id=?`,
//         [itemStatus, mpm_id],
//       );

//       /* =========================
//          7️⃣ ITEM LOG (WITH model_id ✅)
//       ========================== */
//       await connection.query(
//         `INSERT INTO mrn_activity_logs
//          (mrn_id, mpm_id, model_id, issue_id, action_type, qty, status, created_by)
//          VALUES (?, ?, ?, ?, 'ISSUE', ?, ?, ?)`,
//         [
//           mrn_id,
//           mpm_id,
//           model_id, // ✅ REQUIRED
//           issue_id,
//           issue_qty,
//           itemStatus,
//           issued_by,
//         ],
//       );
//     }

//     /* =========================
//        8️⃣ FINAL STATUS CHECK
//     ========================== */
//     const [[pendingCheck]] = await connection.query(
//       `
//       SELECT COUNT(*) AS pending
//       FROM mrn_prod_map mpm
//       LEFT JOIN (
//         SELECT mpm_id, SUM(issued_qty) AS issued_qty
//         FROM issue_items
//         GROUP BY mpm_id
//       ) iss ON iss.mpm_id = mpm.mpm_id
//       WHERE mpm.mrn_id = ?
//       AND (
//         IFNULL(mpm.approval_qty,0) > IFNULL(iss.issued_qty,0)
//         OR IFNULL(mpm.purchase_qty,0) > 0
//       )
//       `,
//       [mrn_id],
//     );

//     const finalStatus =
//       pendingCheck.pending === 0 ? 'Completed' : 'Partially Issued';

//     await connection.query(
//       `UPDATE generate_mrn SET mrn_status=? WHERE mrn_id=?`,
//       [finalStatus, mrn_id],
//     );

//     /* =========================
//        9️⃣ FINAL MRN LOG (FIXED FK)
//     ========================== */
//     const [[anyMpm]] = await connection.query(
//       `SELECT mpm_id, model_id
//        FROM mrn_prod_map
//        WHERE mrn_id=?
//        LIMIT 1`,
//       [mrn_id],
//     );

//     if (anyMpm?.mpm_id && anyMpm?.model_id) {
//       await connection.query(
//         `INSERT INTO mrn_activity_logs
//          (mrn_id, mpm_id, model_id, action_type, status, created_by)
//          VALUES (?, ?, ?, 'MRN_STATUS_UPDATE', ?, ?)`,
//         [mrn_id, anyMpm.mpm_id, anyMpm.model_id, finalStatus, issued_by],
//       );
//     }

//     await connection.commit();

//     res.status(200).json({
//       success: true,
//       message: 'Items issued successfully',
//     });
//   } catch (error) {
//     await connection.rollback();

//     console.error('issueMRNItems Error:', error);

//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   } finally {
//     connection.release();
//   }
// };

export const issueMRNItems = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const { mrn_id, items, issue_notes } = req.body; // ✅ added issue_notes
    const issued_by = req.session.user?.id || null;

    if (!mrn_id || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'MRN ID and items are required',
      });
    }

    await connection.beginTransaction();

    for (const item of items) {
      const { mpm_id, model_id, issue_qty } = item;

      if (!issue_qty || issue_qty <= 0) {
        throw new Error(`Invalid issue qty for mpm_id ${mpm_id}`);
      }

      /* =========================
         1️⃣ GET MPM DATA
      ========================== */
      const [[mpm]] = await connection.query(
        `SELECT approval_qty FROM mrn_prod_map WHERE mpm_id=?`,
        [mpm_id],
      );

      if (!mpm) throw new Error(`MPM not found (${mpm_id})`);

      const approvalQty = Number(mpm.approval_qty);

      /* 🚫 BLOCK NON-APPROVED */
      if (approvalQty <= 0) {
        throw new Error(`Item not approved (mpm_id: ${mpm_id})`);
      }

      /* =========================
         2️⃣ ALREADY ISSUED
      ========================== */
      const [[issuedRow]] = await connection.query(
        `SELECT IFNULL(SUM(issued_qty),0) AS issued_qty
         FROM issue_items WHERE mpm_id=?`,
        [mpm_id],
      );

      const alreadyIssued = Number(issuedRow.issued_qty);
      const remaining = approvalQty - alreadyIssued;

      if (issue_qty > remaining) {
        throw new Error(
          `Issue qty exceeds remaining for mpm_id ${mpm_id}. Remaining: ${remaining}`,
        );
      }

      /* =========================
         3️⃣ STOCK CHECK
      ========================== */
      const [[stockRow]] = await connection.query(
        `SELECT qty FROM stock WHERE model_id=?`,
        [model_id],
      );

      if (!stockRow) {
        throw new Error(`Stock not found for model_id ${model_id}`);
      }

      const availableStock = Number(stockRow.qty);

      if (availableStock < issue_qty) {
        throw new Error(
          `Insufficient stock for model_id ${model_id}. Available: ${availableStock}`,
        );
      }

      /* =========================
         4️⃣ INSERT ISSUE (UPDATED)
      ========================== */
      const [issueResult] = await connection.query(
        `INSERT INTO issue_items
         (mrn_id, mpm_id, model_id, issued_qty, issued_by)
         VALUES (?, ?, ?, ?, ?)`,
        [mrn_id, mpm_id, model_id, issue_qty, issued_by],
      );

      const issue_id = issueResult.insertId;

      /* =========================
         🔥 INSERT ISSUE NOTE
      ========================== */
      if (issue_notes) {
        await connection.query(
          `INSERT INTO issue_notes
           (issue_id, note, created_by)
           VALUES (?, ?, ?)`,
          [issue_id, issue_notes, issued_by],
        );
      }

      /* =========================
         5️⃣ UPDATE STOCK
      ========================== */
      await connection.query(
        `UPDATE stock SET qty = qty - ? WHERE model_id=?`,
        [issue_qty, model_id],
      );

      /* =========================
         6️⃣ UPDATE ITEM STATUS
      ========================== */
      const newIssued = alreadyIssued + issue_qty;

      const itemStatus =
        newIssued >= approvalQty ? 'Issued' : 'Partially Issued';

      await connection.query(
        `UPDATE mrn_prod_map SET status=? WHERE mpm_id=?`,
        [itemStatus, mpm_id],
      );

      /* =========================
         7️⃣ ITEM LOG
      ========================== */
      await connection.query(
        `INSERT INTO mrn_activity_logs
         (mrn_id, mpm_id, model_id, issue_id, action_type, qty, status, created_by)
         VALUES (?, ?, ?, ?, 'ISSUE', ?, ?, ?)`,
        [mrn_id, mpm_id, model_id, issue_id, issue_qty, itemStatus, issued_by],
      );
    }

    /* =========================
       8️⃣ FINAL STATUS CHECK
    ========================== */
    const [[pendingCheck]] = await connection.query(
      `
      SELECT COUNT(*) AS pending
      FROM mrn_prod_map mpm
      LEFT JOIN (
        SELECT mpm_id, SUM(issued_qty) AS issued_qty
        FROM issue_items
        GROUP BY mpm_id
      ) iss ON iss.mpm_id = mpm.mpm_id
      WHERE mpm.mrn_id = ?
      AND (
        IFNULL(mpm.approval_qty,0) > IFNULL(iss.issued_qty,0)
        OR IFNULL(mpm.purchase_qty,0) > 0
      )
      `,
      [mrn_id],
    );

    const finalStatus =
      pendingCheck.pending === 0 ? 'Completed' : 'Partially Issued';

    await connection.query(
      `UPDATE generate_mrn SET mrn_status=? WHERE mrn_id=?`,
      [finalStatus, mrn_id],
    );

    /* =========================
       9️⃣ FINAL MRN LOG
    ========================== */
    const [[anyMpm]] = await connection.query(
      `SELECT mpm_id, model_id 
       FROM mrn_prod_map 
       WHERE mrn_id=? 
       LIMIT 1`,
      [mrn_id],
    );

    if (anyMpm?.mpm_id && anyMpm?.model_id) {
      await connection.query(
        `INSERT INTO mrn_activity_logs
         (mrn_id, mpm_id, model_id, action_type, status, created_by)
         VALUES (?, ?, ?, 'MRN_STATUS_UPDATE', ?, ?)`,
        [mrn_id, anyMpm.mpm_id, anyMpm.model_id, finalStatus, issued_by],
      );
    }

    await connection.commit();

    res.status(200).json({
      success: true,
      message: 'Items issued successfully',
    });
  } catch (error) {
    await connection.rollback();

    console.error('issueMRNItems Error:', error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    connection.release();
  }
};


export const getMRNLogs = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const { mrn_id } = req.params;

    if (!mrn_id) {
      return res.status(400).json({
        success: false,
        message: 'MRN ID is required',
      });
    }

    const query = `
      SELECT 
        l.log_id,
        l.mrn_id,
        l.mpm_id,
        l.model_id,
        l.issue_id,
        l.pr_id,
        l.action_type,
        l.qty,
        l.status,
        l.created_by,
        l.created_at,

        mpm.prod_id,
        mpm.brand_id,

        b.brand_name,
        mo.model_no,

        u.username AS action_by

      FROM mrn_activity_logs l

      LEFT JOIN mrn_prod_map mpm 
        ON mpm.mpm_id = l.mpm_id

      LEFT JOIN models mo 
        ON mo.model_id = l.model_id

      LEFT JOIN brands b 
        ON b.brand_id = mpm.brand_id

      LEFT JOIN users u 
        ON u.user_id = l.created_by

      WHERE l.mrn_id = ?

      ORDER BY l.created_at ASC
    `;

    const [rows] = await connection.query(query, [mrn_id]);

    res.status(200).json({
      success: true,
      message: rows.length
        ? 'MRN logs fetched successfully'
        : 'No logs found for this MRN',
      data: rows,
    });
  } catch (error) {
    console.error('getMRNLogs Error:', error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    connection.release();
  }
};

export const getPurchaseItemsByMRN = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const query = `
      SELECT 
        gm.mrn_id,
        gm.mrn_number,

        rd.name AS client_name,
        rd.city,

        mpm.mpm_id,
        mpm.model_id,
        mpm.brand_id,

        mpm.purchase_qty,
        mpm.purchase_status,

        pr.pr_id,
        pr.status AS pr_status,

        b.brand_name,
        m.model_no

      FROM generate_mrn gm

      JOIN mrn_prod_map mpm
        ON gm.mrn_id = mpm.mrn_id

      LEFT JOIN purchase_request pr
        ON pr.mpm_id = mpm.mpm_id

      LEFT JOIN raw_data rd
        ON rd.master_id = gm.master_id

      LEFT JOIN brands b
        ON b.brand_id = mpm.brand_id

      LEFT JOIN models m
        ON m.model_id = mpm.model_id

      WHERE 
        mpm.purchase_qty > 0

        /* HIDE ITEMS AFTER PO GENERATED */
        AND (
          mpm.purchase_status IS NULL
          OR mpm.purchase_status != 'Ordered'
        )

      ORDER BY gm.mrn_id DESC
    `;

    const [rows] = await connection.query(query);

    /* =========================
       GROUPING
    ========================== */

    const mrnMap = {};

    rows.forEach((row) => {
      if (!mrnMap[row.mrn_id]) {
        mrnMap[row.mrn_id] = {
          mrn_id: row.mrn_id,
          mrn_number: row.mrn_number,

          client_name: row.client_name,
          city: row.city,

          items: [],
        };
      }

      mrnMap[row.mrn_id].items.push({
        mpm_id: row.mpm_id,
        pr_id: row.pr_id,

        model_id: row.model_id,
        brand_id: row.brand_id,

        brand_name: row.brand_name,
        model_no: row.model_no,

        purchase_qty: row.purchase_qty,
        purchase_status: row.purchase_status,

        pr_status: row.pr_status,
      });
    });

    return res.status(200).json({
      success: true,
      data: Object.values(mrnMap),
    });
  } catch (err) {
    console.error('Get Purchase Items Error:', err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  } finally {
    connection.release();
  }
};


export const approvePurchaseRequest = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const { pr_id, status } = req.body;
    const approved_by = req.session.user?.id || null;

    if (!pr_id || !status) {
      return res.status(400).json({
        success: false,
        message: 'pr_id and status required',
      });
    }

    await connection.beginTransaction();

    const [[pr]] = await connection.query(
      `SELECT * FROM purchase_request WHERE pr_id=?`,
      [pr_id],
    );

    if (!pr) throw new Error('PR not found');

    await connection.query(
      `UPDATE purchase_request 
       SET status=?, approved_by=? 
       WHERE pr_id=?`,
      [status, approved_by, pr_id],
    );

    /* UPDATE MPM PURCHASE STATUS */
    await connection.query(
      `UPDATE mrn_prod_map 
       SET purchase_status=? 
       WHERE mpm_id=?`,
      [status === 'Approved' ? 'Approved' : 'Rejected', pr.mpm_id],
    );

    /* LOG */
    await connection.query(
      `INSERT INTO mrn_activity_logs
   (mrn_id, mpm_id, model_id, pr_id, action_type, status, created_by)
   VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        pr.mrn_id,
        pr.mpm_id,
        pr.model_id,
        pr_id,
        'PURCHASE_APPROVAL', // ✅ FIXED ENUM
        status,
        approved_by,
      ],
    );

    await connection.commit();

    res.json({ success: true, message: `PR ${status}` });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ success: false, message: err.message });
  } finally {
    connection.release();
  }
};

// export const createPurchaseOrder = async (req, res) => {
//   const connection = await db.getConnection();

//   try {
//     const { pr_id, qty, vendor_id, unit_price } = req.body;

//     if (!pr_id || !qty || !vendor_id || !unit_price) {
//       return res.status(400).json({
//         success: false,
//         message: 'pr_id, qty, vendor_id and unit_price required',
//       });
//     }

//     await connection.beginTransaction();

//     /* =========================
//        1️⃣ GET PR
//     ========================== */
//     const [[pr]] = await connection.query(
//       `SELECT * FROM purchase_request WHERE pr_id=?`,
//       [pr_id],
//     );

//     if (!pr) throw new Error('PR not found');

//     if (pr.status !== 'Approved') {
//       throw new Error('PR must be approved first');
//     }

//     /* =========================
//        2️⃣ VALIDATE VENDOR
//     ========================== */
//     const [[vendor]] = await connection.query(
//       `SELECT * FROM vendors WHERE vendor_id=? AND is_active=1`,
//       [vendor_id],
//     );

//     if (!vendor) {
//       throw new Error('Invalid or inactive vendor');
//     }

//     /* =========================
//        3️⃣ CALCULATE PRICE
//     ========================== */
//     const total_price = qty * unit_price;

//     const po_number = `PO${Date.now()}`;

//     /* =========================
//        4️⃣ CREATE PO
//     ========================== */
//     const [poRes] = await connection.query(
//       `INSERT INTO purchase_order
//        (po_number, pr_id, model_id, qty, vendor_id, unit_price, total_price, status)
//        VALUES (?, ?, ?, ?, ?, ?, ?, 'Ordered')`,
//       [po_number, pr_id, pr.model_id, qty, vendor_id, unit_price, total_price],
//     );

//     /* =========================
//        5️⃣ UPDATE MPM STATUS
//     ========================== */
//     await connection.query(
//       `UPDATE mrn_prod_map
//        SET purchase_status='Ordered'
//        WHERE mpm_id=?`,
//       [pr.mpm_id],
//     );

//     /* =========================
//        6️⃣ LOG
//     ========================== */
//     await connection.query(
//       `INSERT INTO mrn_activity_logs
//        (mrn_id, mpm_id, model_id, pr_id, action_type, qty, status, remark)
//        VALUES (?, ?, ?, ?, 'PO_CREATED', ?, 'Ordered', ?)`,
//       [
//         pr.mrn_id,
//         pr.mpm_id,
//         pr.model_id,
//         pr_id,
//         qty,
//         `Vendor: ${vendor.vendor_name}, Price: ${unit_price}`,
//       ],
//     );

//     await connection.commit();

//     res.json({
//       success: true,
//       message: 'PO Created Successfully',
//       po_id: poRes.insertId,
//     });
//   } catch (err) {
//     await connection.rollback();
//     console.error('Create PO Error:', err);

//     res.status(500).json({
//       success: false,
//       message: err.message,
//     });
//   } finally {
//     connection.release();
//   }
// };


export const createPurchaseOrder = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const { mrn_id, items } = req.body;

    const created_by = req.session.user?.id || null;

    // =========================
    // VALIDATION
    // =========================

    if (!mrn_id) {
      return res.status(400).json({
        success: false,
        message: 'mrn_id required',
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'items required',
      });
    }

    await connection.beginTransaction();

    // =========================
    // CREATE SINGLE PO HEADER
    // =========================

    const po_number = `PO${Date.now()}`;

    const [poRes] = await connection.query(
      `
        INSERT INTO purchase_order
        (
          po_number,
          mrn_id,
          status
        )
        VALUES (?, ?, 'Ordered')
        `,
      [po_number, mrn_id],
    );

    const po_id = poRes.insertId;

    // =========================
    // LOOP ITEMS
    // =========================

    for (const item of items) {
      const { pr_id, mpm_id, model_id, brand_id, vendor_id, qty, unit_price } =
        item;

      // =========================
      // VALIDATE VENDOR
      // =========================

      const [[vendor]] = await connection.query(
        `
          SELECT *
          FROM vendors
          WHERE vendor_id=?
          AND is_active=1
          `,
        [vendor_id],
      );

      if (!vendor) {
        throw new Error(`Invalid vendor ${vendor_id}`);
      }

      const total_price = Number(qty) * Number(unit_price);

      // =========================
      // INSERT PO ITEM
      // =========================

      await connection.query(
        `
        INSERT INTO purchase_order_items
        (
          po_id,
          vendor_id,
          pr_id,
          mpm_id,
          brand_id,
          model_id,
          qty,
          unit_price,
          total_price,
          received_qty,
          status
        )
        VALUES
        (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, 0,
          'Ordered'
        )
        `,
        [
          po_id,
          vendor_id,
          pr_id,
          mpm_id,
          brand_id,
          model_id,
          qty,
          unit_price,
          total_price,
        ],
      );

      // =========================
      // UPDATE STATUS
      // =========================

      await connection.query(
        `
        UPDATE mrn_prod_map
        SET purchase_status='Ordered'
        WHERE mpm_id=?
        `,
        [mpm_id],
      );

      await connection.query(
        `
        UPDATE purchase_request
        SET status='Purchased'
        WHERE pr_id=?
        `,
        [pr_id],
      );

      // =========================
      // LOG
      // =========================

      await connection.query(
        `
        INSERT INTO mrn_activity_logs
        (
          mrn_id,
          mpm_id,
          model_id,
          pr_id,
          action_type,
          qty,
          status,
          remark,
          created_by
        )
        VALUES
        (
          ?, ?, ?, ?, 'PO_CREATED',
          ?, 'Ordered', ?, ?
        )
        `,
        [
          mrn_id,
          mpm_id,
          model_id,
          pr_id,
          qty,
          `Vendor: ${vendor.vendor_name || vendor.company_name}`,
          created_by,
        ],
      );
    }

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: 'Purchase Order Created Successfully',
      po_id,
      po_number,
    });
  } catch (err) {
    await connection.rollback();

    console.error('Create PO Error:', err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  } finally {
    connection.release();
  }
};


export const getVendors = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const [vendors] = await connection.query(
      `SELECT 
        vendor_id,
        company_name,
        vendor_name,
        contact_number,
        company_email,
        office_address,
        city,
        state_province,
        invoice_gst_number
       FROM vendors
       WHERE is_active = 1
       ORDER BY company_name ASC`,
    );

    res.json({
      success: true,
      data: vendors,
    });
  } catch (err) {
    console.error('Get Vendors Error:', err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  } finally {
    connection.release();
  }
};


export const getGeneratedPOList = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const query = `
      SELECT 
        po.po_id,
        po.po_number,
        po.status AS po_status,
        po.created_at,

        gm.mrn_id,
        gm.mrn_number,

        rd.name AS client_name,
        rd.city,

        poi.poi_id,
        poi.vendor_id,
        poi.pr_id,
        poi.mpm_id,

        poi.product_type_id,
        poi.brand_id,
        poi.model_id,

        poi.qty,
        poi.unit_price,
        poi.total_price,
        poi.received_qty,
        poi.status AS item_status,

        v.vendor_name,
        v.company_name,

        b.brand_name,
        m.model_no

      FROM purchase_order po

      JOIN purchase_order_items poi
        ON poi.po_id = po.po_id

      LEFT JOIN purchase_request pr
        ON pr.pr_id = poi.pr_id

      LEFT JOIN generate_mrn gm
        ON gm.mrn_id = po.mrn_id

      /* ✅ FIXED HERE */
      LEFT JOIN vendors v
        ON v.vendor_id = poi.vendor_id

      LEFT JOIN raw_data rd
        ON rd.master_id = gm.master_id

      LEFT JOIN brands b
        ON b.brand_id = poi.brand_id

      LEFT JOIN models m
        ON m.model_id = poi.model_id

      ORDER BY po.po_id DESC
    `;

    const [rows] = await connection.query(query);

    /* =========================
       GROUP PO
    ========================== */

    const poMap = {};

    rows.forEach((row) => {
      if (!poMap[row.po_id]) {
        poMap[row.po_id] = {
          po_id: row.po_id,
          po_number: row.po_number,
          po_status: row.po_status,
          created_at: row.created_at,

          mrn: {
            mrn_id: row.mrn_id,
            mrn_number: row.mrn_number,
          },

          client_name: row.client_name,
          city: row.city,

          items: [],
        };
      }

      poMap[row.po_id].items.push({
        poi_id: row.poi_id,

        vendor: {
          vendor_id: row.vendor_id,
          vendor_name: row.vendor_name || row.company_name,
        },

        pr_id: row.pr_id,
        mpm_id: row.mpm_id,

        product_type_id: row.product_type_id,

        brand_id: row.brand_id,
        model_id: row.model_id,

        brand_name: row.brand_name,
        model_no: row.model_no,

        qty: row.qty,
        unit_price: row.unit_price,
        total_price: row.total_price,

        received_qty: row.received_qty,

        status: row.item_status,
      });
    });

    return res.status(200).json({
      success: true,
      data: Object.values(poMap),
    });
  } catch (err) {
    console.error('Get PO List Error:', err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  } finally {
    connection.release();
  }
};


// export const receivePurchaseOrder = async (req, res) => {
//   const connection = await db.getConnection();

//   try {
//     const {
//       po_id,
//       received_qty,
//       bill_number,
//       bill_date,
//       total_amount,
//     } = req.body;

//     const files = req.files; // multer (multiple images)

//     if (!po_id || !received_qty || !bill_number) {
//       return res.status(400).json({
//         success: false,
//         message: 'po_id, received_qty, bill_number required',
//       });
//     }

//     await connection.beginTransaction();

//     /* =========================
//        1️⃣ GET PO + PR + MPM
//     ========================== */
//     const [[po]] = await connection.query(
//       `SELECT po.*, pr.mrn_id, pr.mpm_id, pr.product_type_id, pr.brand_id
//        FROM purchase_order po
//        JOIN purchase_request pr ON pr.pr_id = po.pr_id
//        WHERE po.po_id=?`,
//       [po_id],
//     );

//     if (!po) throw new Error('PO not found');

//     if (po.status !== 'Ordered') {
//       throw new Error('PO already received or invalid state');
//     }

//     /* =========================
//        2️⃣ INSERT BILL
//     ========================== */
//     const [billRes] = await connection.query(
//       `INSERT INTO purchase_bill
//        (po_id, bill_number, bill_date, total_amount)
//        VALUES (?, ?, ?, ?)`,
//       [po_id, bill_number, bill_date || null, total_amount || null],
//     );

//     const bill_id = billRes.insertId;

//     /* =========================
//        3️⃣ STORE MULTIPLE IMAGES
//     ========================== */
//     if (files && files.length > 0) {
//       for (const file of files) {
//         await connection.query(
//           `INSERT INTO purchase_bill_images (bill_id, image_path)
//            VALUES (?, ?)`,
//           [bill_id, file.path],
//         );
//       }
//     }

//     /* =========================
//        4️⃣ UPDATE PO (PARTIAL SUPPORT)
//     ========================== */
//     const newReceivedQty = po.received_qty + Number(received_qty);

//     let newStatus = 'Ordered';
//     let billStatus = 'Partial';

//     if (newReceivedQty >= po.qty) {
//       newStatus = 'Received';
//       billStatus = 'Completed';
//     }

//     await connection.query(
//       `UPDATE purchase_order
//        SET
//          received_qty = ?,
//          received_date = NOW(),
//          status = ?,
//          bill_status = ?
//        WHERE po_id=?`,
//       [newReceivedQty, newStatus, billStatus, po_id],
//     );

//     /* =========================
//        5️⃣ UPDATE STOCK
//     ========================== */
//     await connection.query(
//       `INSERT INTO stock (product_type_id, brand_id, model_id, qty)
//        VALUES (?, ?, ?, ?)
//        ON DUPLICATE KEY UPDATE qty = qty + VALUES(qty)`,
//       [
//         po.product_type_id,
//         po.brand_id,
//         po.model_id,
//         received_qty,
//       ],
//     );

//     /* =========================
//        6️⃣ UPDATE MPM
//     ========================== */
//     await connection.query(
//       `UPDATE mrn_prod_map
//        SET
//          verified_qty = verified_qty + ?,
//          purchase_qty = purchase_qty + ?,
//          purchase_status = 'Received'
//        WHERE mpm_id=?`,
//       [received_qty, received_qty, po.mpm_id],
//     );

//     /* =========================
//        7️⃣ CHECK ITEM COMPLETE
//     ========================== */
//     await connection.query(
//       `UPDATE mrn_prod_map
//        SET status = 'Approved'
//        WHERE mpm_id = ?
//        AND verified_qty >= requested_qty`,
//       [po.mpm_id],
//     );

//     /* =========================
//        8️⃣ CHECK FULL MRN STATUS
//     ========================== */
//     const [[pending]] = await connection.query(
//       `SELECT COUNT(*) AS cnt
//        FROM mrn_prod_map
//        WHERE mrn_id = ?
//        AND verified_qty < requested_qty`,
//       [po.mrn_id],
//     );

//     const mrnStatus =
//   pending.cnt === 0 ? 'Approval Pending' : 'Partial Ready';

//     await connection.query(
//       `UPDATE generate_mrn
//        SET mrn_status=?
//        WHERE mrn_id=?`,
//       [mrnStatus, po.mrn_id],
//     );

//     /* =========================
//        9️⃣ LOG
//     ========================== */
//     await connection.query(
//       `INSERT INTO mrn_activity_logs
//        (mrn_id, mpm_id, model_id, pr_id, action_type, qty, status, remark)
//        VALUES (?, ?, ?, ?, 'PO_RECEIVED', ?, ?, ?)`,
//       [
//         po.mrn_id,
//         po.mpm_id,
//         po.model_id,
//         po.pr_id,
//         received_qty,
//         newStatus,
//         `Bill No: ${bill_number}`,
//       ],
//     );

//     await connection.commit();

//     res.json({
//       success: true,
//       message: 'PO Received with Bill & Images',
//       bill_id,
//     });

//   } catch (err) {
//     await connection.rollback();
//     console.error('Receive PO Error:', err);

//     res.status(500).json({
//       success: false,
//       message: err.message,
//     });
//   } finally {
//     connection.release();
//   }
// };

export const receivePurchaseOrder = async (req, res) => {
  const connection = await db.getConnection();

  try {
    let { po_id, bill_number, bill_date, total_amount, items } = req.body;

    const files = req.files;

    // ✅ parse form-data JSON
    if (typeof items === 'string') {
      items = JSON.parse(items);
    }

    const receivedBy = req.session.user?.id || null;

    /* =========================
       VALIDATION
    ========================== */
    if (!po_id || !bill_number) {
      return res.status(400).json({
        success: false,
        message: 'po_id and bill_number required',
      });
    }

    if (!items || !items.length) {
      return res.status(400).json({
        success: false,
        message: 'items required',
      });
    }

    await connection.beginTransaction();

    /* =========================
       1. INSERT BILL
    ========================== */
    const [billRes] = await connection.query(
      `INSERT INTO purchase_bill
      (po_id, bill_number, bill_date, total_amount)
      VALUES (?, ?, ?, ?)`,
      [po_id, bill_number, bill_date || null, total_amount || 0],
    );

    const bill_id = billRes.insertId;

    /* =========================
       2. STORE BILL IMAGES
    ========================== */
    if (files?.length) {
      for (const file of files) {
        await connection.query(
          `INSERT INTO purchase_bill_images
           (bill_id, image_path)
           VALUES (?, ?)`,
          [bill_id, file.path],
        );
      }
    }

    /* =========================
       3. PROCESS ITEMS
    ========================== */
    for (const item of items) {
      const { poi_id, received_qty } = item;

      const [[poi]] = await connection.query(
        `SELECT * 
         FROM purchase_order_items
         WHERE poi_id = ?`,
        [poi_id],
      );

      if (!poi) {
        throw new Error(`PO item not found: ${poi_id}`);
      }

      const receiveQty = Number(received_qty || 0);
      const oldQty = Number(poi.received_qty || 0);
      const orderQty = Number(poi.qty);

      const newQty = oldQty + receiveQty;

      if (newQty > orderQty) {
        throw new Error(
          `Received qty exceeds ordered qty for PO Item ${poi_id}`,
        );
      }

      /* =========================
         STATUS
      ========================== */
      let status = 'Pending';
      if (newQty === orderQty) status = 'Received';
      else if (newQty > 0) status = 'Partial';

      /* =========================
         UPDATE PO ITEM
      ========================== */
      await connection.query(
        `UPDATE purchase_order_items
         SET received_qty = ?, status = ?
         WHERE poi_id = ?`,
        [newQty, status, poi_id],
      );

      /* =========================
         STOCK FIX (IMPORTANT)
      ========================== */

      // 🔥 ALWAYS ensure product_type_id exists
      let productTypeId = poi.product_type_id;

      if (!productTypeId) {
        const [[pt]] = await connection.query(
          `SELECT product_type_id
           FROM product_types
           WHERE cat_id = (
             SELECT cat_id FROM mrn_prod_map WHERE mpm_id = ?
           )
           LIMIT 1`,
          [poi.mpm_id],
        );

        productTypeId = pt?.product_type_id || 1; // fallback safe
      }

      await connection.query(
        `INSERT INTO stock
        (product_type_id, brand_id, model_id, qty)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          qty = qty + VALUES(qty)`,
        [productTypeId, poi.brand_id, poi.model_id, receiveQty],
      );

      /* =========================
         UPDATE MRN PROD MAP
      ========================== */
      await connection.query(
        `UPDATE mrn_prod_map
         SET 
           verified_qty = verified_qty + ?,
           purchase_qty = GREATEST(0, purchase_qty - ?),
           purchase_status = CASE
             WHEN purchase_qty - ? <= 0 THEN 'Purchased'
             ELSE 'Partial Received'
           END
         WHERE mpm_id = ?`,
        [receiveQty, receiveQty, receiveQty, poi.mpm_id],
      );

      /* =========================
         LOG
      ========================== */
      const [[pr]] = await connection.query(
        `SELECT * FROM purchase_request WHERE pr_id = ?`,
        [poi.pr_id],
      );

      await connection.query(
        `INSERT INTO mrn_activity_logs
        (mrn_id, mpm_id, model_id, pr_id, action_type, qty, status, created_by, remark)
        VALUES (?, ?, ?, ?, 'PO_RECEIVED', ?, ?, ?, ?)`,
        [
          pr?.mrn_id || null,
          poi.mpm_id,
          poi.model_id,
          poi.pr_id,
          receiveQty,
          status,
          receivedBy,
          `Bill No: ${bill_number}`,
        ],
      );
    }

    /* =========================
       4. UPDATE PO STATUS
    ========================== */
    const [[pending]] = await connection.query(
      `SELECT COUNT(*) AS cnt
       FROM purchase_order_items
       WHERE po_id = ?
       AND received_qty < qty`,
      [po_id],
    );

    const poStatus = pending.cnt === 0 ? 'Received' : 'Partial';

    await connection.query(
      `UPDATE purchase_order
       SET status = ?
       WHERE po_id = ?`,
      [poStatus, po_id],
    );

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: 'Purchase Order received successfully',
      bill_id,
    });
  } catch (err) {
    await connection.rollback();

    console.error('Receive PO Error:', err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  } finally {
    connection.release();
  }
};
export const issueMRN = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const { mrn_id, items } = req.body;
    const issued_by = req.session.user?.id || null;

    await connection.beginTransaction();

    for (const item of items) {
      const { mpm_id, issue_qty } = item;

      const [[mpm]] = await connection.query(
        `SELECT * FROM mrn_prod_map WHERE mpm_id=?`,
        [mpm_id],
      );

      if (!mpm) throw new Error('Invalid MPM');

      const available = Number(mpm.verified_qty) + Number(mpm.purchase_qty);

      if (issue_qty > available) {
        throw new Error('Issue qty exceeds available');
      }

      /* REDUCE STOCK */
      await connection.query(
        `UPDATE stock SET qty = qty - ? WHERE model_id=?`,
        [issue_qty, mpm.model_id],
      );

      /* INSERT ISSUE */
      await connection.query(
        `INSERT INTO mrn_activity_logs
         (mrn_id, mpm_id, model_id, action_type, qty, status, created_by)
         VALUES (?, ?, ?, 'ISSUE', ?, 'Issued', ?)`,
        [mrn_id, mpm_id, mpm.model_id, issue_qty, issued_by],
      );

      /* UPDATE STATUS */
      await connection.query(
        `UPDATE mrn_prod_map
         SET status='Issued'
         WHERE mpm_id=?`,
        [mpm_id],
      );
    }

    /* FINAL MRN CHECK */
    const [[pending]] = await connection.query(
      `SELECT COUNT(*) as count
       FROM mrn_prod_map
       WHERE mrn_id=? AND status!='Issued'`,
      [mrn_id],
    );

    if (pending.count === 0) {
      await connection.query(
        `UPDATE generate_mrn
         SET mrn_status='Completed'
         WHERE mrn_id=?`,
        [mrn_id],
      );
    }

    await connection.commit();

    res.json({ success: true, message: 'Material Issued' });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ success: false, message: err.message });
  } finally {
    connection.release();
  }
};

export const getCompletedMRNs1 = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const query = `
      SELECT 
        gm.mrn_id,
        gm.mrn_number,
        gm.master_id,
        gm.qt_id,
        gm.expected_date,
        gm.created_at,
        gm.mrn_status,

        rd.name AS client_name,
        rd.city,

        es.execution_id,
        es.schedule_name,

        mpm.mpm_id,
        mpm.prod_id,
        mpm.model_id,
        mpm.brand_id,

        IFNULL(mpm.requested_qty,0) AS requested_qty,
        IFNULL(mpm.verified_qty,0) AS verified_qty,
        IFNULL(mpm.approval_qty,0) AS approval_qty,
        IFNULL(mpm.purchase_qty,0) AS purchase_qty,
        IFNULL(mpm.purchase_status,'') AS purchase_status,

        /* ✅ ISSUED QTY */
        IFNULL(iss.total_issued,0) AS issued_qty,

        /* ✅ PENDING AFTER ISSUE */
        (IFNULL(mpm.approval_qty,0) - IFNULL(iss.total_issued,0)) AS remaining_qty,

        mpm.status AS item_status,

        b.brand_name,
        m.model_no

      FROM generate_mrn gm

      LEFT JOIN raw_data rd 
        ON gm.master_id = rd.master_id

      LEFT JOIN execution_start es 
        ON FIND_IN_SET(gm.master_id, es.lead_ids)

      LEFT JOIN mrn_prod_map mpm 
        ON gm.mrn_id = mpm.mrn_id

      LEFT JOIN brands b 
        ON b.brand_id = mpm.brand_id

      LEFT JOIN models m 
        ON m.model_id = mpm.model_id

      /* ✅ ISSUE SUMMARY */
      LEFT JOIN (
        SELECT mpm_id, SUM(issued_qty) AS total_issued
        FROM issue_items
        GROUP BY mpm_id
      ) iss ON iss.mpm_id = mpm.mpm_id

      WHERE gm.mrn_status = 'Completed'

      ORDER BY gm.created_at DESC
    `;

    const [rows] = await connection.query(query);

    /* =========================
       ✅ GROUPING
    ========================== */
    const mrnMap = {};

    rows.forEach((row) => {
      if (!mrnMap[row.mrn_id]) {
        mrnMap[row.mrn_id] = {
          mrn_id: row.mrn_id,
          mrn_number: row.mrn_number,
          master_id: row.master_id,
          qt_id: row.qt_id,
          expected_date: row.expected_date,
          created_at: row.created_at,
          mrn_status: row.mrn_status,

          client_name: row.client_name,
          city: row.city,

          execution: {
            execution_id: row.execution_id,
            schedule_name: row.schedule_name,
          },

          items: [],
        };
      }

      if (row.mpm_id) {
        mrnMap[row.mrn_id].items.push({
          mpm_id: row.mpm_id,
          prod_id: row.prod_id,
          model_id: row.model_id,
          brand_id: row.brand_id,

          brand_name: row.brand_name,
          model_no: row.model_no,

          requested_qty: row.requested_qty,
          verified_qty: row.verified_qty,
          approval_qty: row.approval_qty,
          purchase_qty: row.purchase_qty,

          purchase_status: row.purchase_status,

          issued_qty: row.issued_qty,
          remaining_qty: row.remaining_qty > 0 ? row.remaining_qty : 0,

          status: row.item_status || 'Completed',
        });
      }
    });

    const result = Object.values(mrnMap);

    return res.status(200).json({
      success: true,
      message: result.length
        ? 'Completed MRNs fetched successfully'
        : 'No Completed MRNs found',
      data: result,
    });
  } catch (error) {
    console.error('getCompletedMRNs Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch completed MRNs',
      error: error.message,
    });
  } finally {
    connection.release();
  }
}; 

export const getCompletedMRNs = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const query = `
      SELECT 
        gm.mrn_id,
        gm.mrn_number,
        gm.master_id,
        gm.qt_id,
        gm.expected_date,
        gm.created_at,
        gm.mrn_status,

        rd.name AS client_name,
        rd.city,

        es.execution_id,
        es.schedule_name,

        mpm.mpm_id,
        mpm.prod_id,
        mpm.model_id,
        mpm.brand_id,

        IFNULL(mpm.requested_qty,0) AS requested_qty,
        IFNULL(mpm.verified_qty,0) AS verified_qty,
        IFNULL(mpm.approval_qty,0) AS approval_qty,
        IFNULL(mpm.purchase_qty,0) AS purchase_qty,
        IFNULL(mpm.purchase_status,'') AS purchase_status,

        IFNULL(iss.total_issued,0) AS issued_qty,
        (IFNULL(mpm.approval_qty,0) - IFNULL(iss.total_issued,0)) AS remaining_qty,

        mpm.status AS item_status,

        b.brand_name,
        m.model_no,

        /* PURCHASE ORDER */
        po.po_id,
        po.po_number,

        poi.poi_id,
        poi.qty AS po_qty,
        poi.unit_price,
        poi.total_price,
        poi.received_qty,
        poi.status AS po_status,

        /* BILL */
        pb.bill_id,
        pb.bill_number,
        pb.bill_date,
        pb.total_amount,

        /* BILL IMAGES */
        pbi.image_path

      FROM generate_mrn gm

      LEFT JOIN raw_data rd 
        ON gm.master_id = rd.master_id

      LEFT JOIN execution_start es 
        ON FIND_IN_SET(gm.master_id, es.lead_ids)

      LEFT JOIN mrn_prod_map mpm 
        ON gm.mrn_id = mpm.mrn_id

      LEFT JOIN brands b 
        ON b.brand_id = mpm.brand_id

      LEFT JOIN models m 
        ON m.model_id = mpm.model_id

      /* ISSUED QTY */
      LEFT JOIN (
        SELECT mpm_id, SUM(issued_qty) AS total_issued
        FROM issue_items
        GROUP BY mpm_id
      ) iss 
        ON iss.mpm_id = mpm.mpm_id

      /* PURCHASE REQUEST */
      LEFT JOIN purchase_request pr
        ON pr.mpm_id = mpm.mpm_id

      /* PURCHASE ORDER ITEMS */
      LEFT JOIN purchase_order_items poi
        ON poi.pr_id = pr.pr_id

      /* PURCHASE ORDER */
      LEFT JOIN purchase_order po
        ON po.po_id = poi.po_id

      /* BILL */
      LEFT JOIN purchase_bill pb
        ON pb.po_id = po.po_id

      /* BILL IMAGES */
      LEFT JOIN purchase_bill_images pbi
        ON pbi.bill_id = pb.bill_id

      WHERE gm.mrn_status = 'Completed'

      ORDER BY gm.created_at DESC
    `;

    const [rows] = await connection.query(query);

    const mrnMap = {};

    rows.forEach((row) => {
      if (!mrnMap[row.mrn_id]) {
        mrnMap[row.mrn_id] = {
          mrn_id: row.mrn_id,
          mrn_number: row.mrn_number,
          master_id: row.master_id,
          qt_id: row.qt_id,
          expected_date: row.expected_date,
          created_at: row.created_at,
          mrn_status: row.mrn_status,

          client_name: row.client_name,
          city: row.city,

          execution: {
            execution_id: row.execution_id,
            schedule_name: row.schedule_name,
          },

          items: [],
        };
      }

      if (!row.mpm_id) return;

      let item = mrnMap[row.mrn_id].items.find(
        (i) => i.mpm_id === row.mpm_id
      );

      if (!item) {
        item = {
          mpm_id: row.mpm_id,
          prod_id: row.prod_id,
          model_id: row.model_id,
          brand_id: row.brand_id,

          brand_name: row.brand_name,
          model_no: row.model_no,

          requested_qty: row.requested_qty,
          verified_qty: row.verified_qty,
          approval_qty: row.approval_qty,
          purchase_qty: row.purchase_qty,

          purchase_status: row.purchase_status,

          issued_qty: row.issued_qty,
          remaining_qty:
            row.remaining_qty > 0 ? row.remaining_qty : 0,

          status: row.item_status || "Completed",

          purchase_orders: [],
        };

        mrnMap[row.mrn_id].items.push(item);
      }

      if (row.po_id) {
        let po = item.purchase_orders.find(
          (p) => p.po_id === row.po_id
        );

        if (!po) {
          po = {
            po_id: row.po_id,
            po_number: row.po_number,

            qty: row.po_qty,
            unit_price: row.unit_price,
            total_price: row.total_price,

            received_qty: row.received_qty,
            status: row.po_status,

            bills: [],
          };

          item.purchase_orders.push(po);
        }

        if (row.bill_id) {
          let bill = po.bills.find(
            (b) => b.bill_id === row.bill_id
          );

          if (!bill) {
            bill = {
              bill_id: row.bill_id,
              bill_number: row.bill_number,
              bill_date: row.bill_date,
              total_amount: row.total_amount,
              images: [],
            };

            po.bills.push(bill);
          }

          const BASE_URL =
            process.env.BASE_URL || "http://localhost:3000";

          if (
            row.image_path &&
            !bill.images.includes(row.image_path)
          ) {
            const cleanPath = row.image_path
              .replace(/\\/g, "/")
              .split("uploads/")[1];

            bill.images.push(
              `${BASE_URL}/uploads/${cleanPath}`
            );
          }
        }
      }
    });

    const result = Object.values(mrnMap);

    return res.status(200).json({
      success: true,
      message: result.length
        ? "Completed MRNs with PO & Bill details fetched successfully"
        : "No Completed MRNs found",
      data: result,
    });
  } catch (error) {
    console.error("getCompletedMRNs Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch completed MRNs",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};


export const approvePurchaseRequestByMRN = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const { mrn_id, items } = req.body;

    const approved_by = req.session.user?.id || null;

    if (!mrn_id || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'mrn_id and items required',
      });
    }

    await connection.beginTransaction();

    for (const item of items) {
      // =========================
      // CREATE PURCHASE REQUEST
      // =========================

      const [insertPR] = await connection.query(
        `
        INSERT INTO purchase_request
        (
          mrn_id,
          mpm_id,
          brand_id,
          model_id,
          qty,
          status,
          approved_by
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
          mrn_id,
          item.mpm_id,
          item.brand_id,
          item.model_id,
          item.quantity,
          'Approved',
          approved_by,
        ],
      );

      const pr_id = insertPR.insertId;

      // =========================
      // UPDATE MRN PRODUCT MAP
      // =========================

      await connection.query(
        `
        UPDATE mrn_prod_map
        SET purchase_status = 'Approved'
        WHERE mpm_id = ?
        `,
        [item.mpm_id],
      );

      // =========================
      // INSERT ACTIVITY LOG
      // =========================

      await connection.query(
        `
        INSERT INTO mrn_activity_logs
        (
          mrn_id,
          mpm_id,
          model_id,
          pr_id,
          action_type,
          status,
          created_by
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
          mrn_id,
          item.mpm_id,
          item.model_id,
          pr_id,
          'PURCHASE_APPROVAL',
          'Approved',
          approved_by,
        ],
      );
    }

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: 'PR Generated & Approved Successfully',
    });
  } catch (err) {
    await connection.rollback();

    console.error('Approve PR Error:', err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  } finally {
    connection.release();
  }
};





