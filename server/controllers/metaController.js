import axios from "axios";
import db from '../database/db.js';



export const getMetaLeads = async (req, res) => {
  try {
    const PAGE_TOKEN = process.env.META_PAGE_TOKEN;
    const FORM_ID = process.env.META_FORM_ID;

    const response = await axios.get(
      `https://graph.facebook.com/v19.0/${FORM_ID}/leads`,
      {
        params: {
          access_token: PAGE_TOKEN,
          fields: "created_time,field_data",
          limit: 100,
        },
      }
    );

    // Safety check
    const rawLeads = response?.data?.data || [];

    const leads = rawLeads.map((lead) => {
      const obj = {
        created_time: lead.created_time,
      };

      if (Array.isArray(lead.field_data)) {
        lead.field_data.forEach((f) => {
          obj[f.name] =
            Array.isArray(f.values) && f.values.length > 0
              ? f.values[0]
              : ""; // fallback empty
        });
      }

      return obj;
    });

    res.json({
      success: true,
      total: leads.length,
      leads,
    });
  } catch (error) {
    console.error("META ERROR:", error.response?.data || error.message);

    res.status(500).json({
      success: false,
      error: error.response?.data || error.message,
    });
  }
};


// export const importSingleMetaLead = async (req, res) => {
//   try {
//     if (!req.session.user) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     const created_by_user = req.session.user.id;

//     // ===============================
//     // 1. FETCH ONE META LEAD
//     // ===============================
//     const PAGE_TOKEN = process.env.META_PAGE_TOKEN;
//     const FORM_ID = process.env.META_FORM_ID;

//     const metaRes = await axios.get(
//       `https://graph.facebook.com/v19.0/${FORM_ID}/leads`,
//       {
//         params: {
//           access_token: PAGE_TOKEN,
//           fields: "created_time,field_data",
//           limit: 1
//         }
//       }
//     );

//     const rawLeads = metaRes?.data?.data || [];

//     if (!rawLeads.length) {
//       return res.json({ success: false, message: "No Meta leads found" });
//     }

//     const lead = rawLeads[0];

//     let meta = {
//       created_time: lead.created_time
//     };

//     if (Array.isArray(lead.field_data)) {
//       lead.field_data.forEach((f) => {
//         meta[f.name] =
//           Array.isArray(f.values) && f.values.length > 0 ? f.values[0] : "";
//       });
//     }

//     // ===============================
//     // 2. AUTO PICK TELECALLER
//     // ===============================
//     const [tele] = await db.query(
//       `SELECT user_id, name
//        FROM users
//        WHERE role = 'tele_caller'
//        AND status = 'active'
//        ORDER BY user_id ASC
//        LIMIT 1`
//     );

//     if (!tele.length) {
//       return res.status(400).json({ success: false, message: "No active telecaller found" });
//     }

//     const telecaller = tele[0];

//     // ===============================
//     // 3. META REFERENCE
//     // ===============================
//     let reference_id;

//     const [ref] = await db.query(
//       `SELECT reference_id FROM reference WHERE LOWER(reference_name)='meta' LIMIT 1`
//     );

//     if (ref.length) {
//       reference_id = ref[0].reference_id;
//     } else {
//       const [refIns] = await db.query(
//         `INSERT INTO reference (reference_name, created_by_user)
//          VALUES ('META', ?)`,
//         [created_by_user]
//       );
//       reference_id = refIns.insertId;
//     }

//     // ===============================
//     // 4. CREATE ASSIGNMENT
//     // ===============================
//     const assignDate = new Date(meta.created_time || Date.now());

//     const [assignRes] = await db.query(
//       `INSERT INTO assignments
//       (created_by_user, mode, assign_date, assigned_to, assigned_to_user_id, lead_count, assign_type)
//       VALUES (?, ?, ?, ?, ?, ?, ?)`,
//       [
//         created_by_user,
//         "call",
//         assignDate,
//         telecaller.name,
//         telecaller.user_id,
//         1,
//         "manual"
//       ]
//     );

//     const assign_id = assignRes.insertId;

//     // ===============================
//     // 5. BUILD META REMARK
//     // ===============================
//     const detailedRemark = Object.entries(meta)
//       .map(([k, v]) => `${k}: ${v}`)
//       .join("\n");

//     // ===============================
//     // 6. INSERT RAW DATA
//     // ===============================
//     const [rawRes] = await db.query(
//       `INSERT INTO raw_data
//       (
//         name,
//         number,
//         email,
//         city,
//         current_stage,
//         p_type,
//         budget_range,
//         detailed_remark,
//         status,
//         lead_status,
//         assign_id,
//         created_by_user,
//         lead_activity,
//         lead_stage,
//         followup_date,
//         reference_id
//       )
//       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//       [
//         meta.full_name || "",
//         meta.whatsapp_number || "",
//         meta.email || "",
//         meta.city || "",
//         meta["your_home_theater_room_current_stage?_"] || "",
//         meta["do_you_need_projector_or_tv_?"] || "",
//         meta["what_is_your_budget_range_for_audio_&_video_setup?"] || "",
//         detailedRemark,
//         "Assigned",
//         "Inactive",
//         assign_id,
//         created_by_user,
//         0,
//         "Fresh Lead",
//         assignDate,
//         reference_id
//       ]
//     );

//     const master_id = rawRes.insertId;

//     // ===============================
//     // 7. INSERT REASSIGNMENT LOG
//     // ===============================
//     await db.query(
//       `INSERT INTO reassignment
//       (assign_id, master_id, created_by_user, assignedTo, leadStage, remark, reassignment_date)
//       VALUES (?, ?, ?, ?, ?, ?, ?)`,
//       [
//         assign_id,
//         master_id,
//         created_by_user,
//         telecaller.name,
//         "Fresh Lead",
//         detailedRemark,
//         assignDate
//       ]
//     );

//     res.json({
//       success: true,
//       message: "✅ Single Meta lead imported",
//       assigned_to: telecaller.name,
//       assign_id,
//       master_id
//     });

//   } catch (err) {
//     console.error("META IMPORT ERROR:", err);
//     res.status(500).json({
//       success: false,
//       error: err.message
//     });
//   }
// };



// ------------------ helpers ------------------


const cleanNumber = (num = "") => {
  let x = String(num).replace(/\D/g, "");
  if (x.startsWith("91") && x.length > 10) x = x.slice(2);
  return x.slice(-10);
};

// ------------------ main controller ------------------
export const importMetaLeadsRoundRobin1 = async (req, res) => {
  try {
    // =====================================
    // 0. GET DIGITAL MARKETING USER (CREATOR)
    // =====================================
    const [dmUser] = await db.query(
      `SELECT user_id
       FROM users
       WHERE role='digital_marketing'
       AND status='active'
       LIMIT 1`
    );

    if (!dmUser.length) {
      return res?.status?.(400).json({
        success: false,
        message: "No active digital_marketing user found"
      });
    }

    const created_by_user = dmUser[0].user_id;

    // =====================================
    // 1. FETCH META LEADS
    // =====================================
    const PAGE_TOKEN = process.env.META_PAGE_TOKEN;
    const FORM_ID = process.env.META_FORM_ID;

    const metaRes = await axios.get(
      `https://graph.facebook.com/v19.0/${FORM_ID}/leads`,
      {
        params: {
          access_token: PAGE_TOKEN,
          fields: "created_time,field_data",
          limit: 100
        }
      }
    );

    const rawLeads = metaRes?.data?.data || [];

    if (!rawLeads.length) {
      return res?.json?.({ success: true, message: "No Meta leads found" });
    }

    // Normalize Meta leads
    const leads = rawLeads.map((lead) => {
      let obj = { created_time: lead.created_time };
      if (Array.isArray(lead.field_data)) {
        lead.field_data.forEach((f) => {
          obj[f.name] =
            Array.isArray(f.values) && f.values.length > 0 ? f.values[0] : "";
        });
      }
      return obj;
    });

    // =====================================
    // 2. GET ALL ACTIVE TELECALLERS
    // =====================================
    const [telecallers] = await db.query(
      `SELECT user_id, name
       FROM users
       WHERE role='tele_caller'
       AND status='active'
       ORDER BY user_id ASC`
    );

    if (!telecallers.length) {
      return res?.status?.(400).json({
        success: false,
        message: "No active telecaller found"
      });
    }

    // =====================================
    // 3. FIND LAST ASSIGNED TELECALLER
    // =====================================
    const [lastAssign] = await db.query(
      `SELECT assigned_to_user_id
       FROM assignments
       WHERE assigned_to_user_id IS NOT NULL
       ORDER BY assign_id DESC
       LIMIT 1`
    );

    let startIndex = 0;

    if (lastAssign.length) {
      const lastUserId = lastAssign[0].assigned_to_user_id;
      const idx = telecallers.findIndex(t => t.user_id === lastUserId);
      if (idx >= 0) startIndex = (idx + 1) % telecallers.length;
    }

    // =====================================
    // 4. META REFERENCE
    // =====================================
    let reference_id;

    const [ref] = await db.query(
      `SELECT reference_id
       FROM reference
       WHERE LOWER(reference_name)='meta'
       LIMIT 1`
    );

    if (ref.length) {
      reference_id = ref[0].reference_id;
    } else {
      const [refIns] = await db.query(
        `INSERT INTO reference (reference_name, created_by_user)
         VALUES ('META', ?)`,
        [created_by_user]
      );
      reference_id = refIns.insertId;
    }

    // =====================================
    // 5. PROCESS LEADS (ROUND ROBIN)
    // =====================================
    let tcPointer = startIndex;
    let inserted = 0;
    let duplicates = 0;

    for (const meta of leads) {
      const mobile = cleanNumber(meta.whatsapp_number || "");

      if (!mobile || mobile.length !== 10) continue;

      // ---- duplicate check
      const [dup] = await db.query(
        `SELECT master_id FROM raw_data WHERE number=? LIMIT 1`,
        [mobile]
      );

      if (dup.length) {
        duplicates++;
        continue;
      }

      // ---- pick telecaller (round robin)
      const telecaller = telecallers[tcPointer];
      tcPointer = (tcPointer + 1) % telecallers.length;

      const assignDate = new Date(meta.created_time || Date.now());

      // =================================
      // assignments
      // =================================
      const [assignRes] = await db.query(
        `INSERT INTO assignments
        (created_by_user, mode, assign_date, assigned_to, assigned_to_user_id, lead_count, assign_type)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          created_by_user,
          "call",
          assignDate,
          telecaller.name,
          telecaller.user_id,
          1,
          "manual"
        ]
      );

      const assign_id = assignRes.insertId;

      // ---- build remark (ALL META fields)
      const detailedRemark = Object.entries(meta)
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n");

      // =================================
      // raw_data
      // =================================
      const [rawRes] = await db.query(
        `INSERT INTO raw_data
        (
          name,
          number,
          email,
          city,
          current_stage,
          p_type,
          budget_range,
          detailed_remark,
          status,
          lead_status,
          assign_id,
          created_by_user,
          lead_activity,
          lead_stage,
          followup_date,
          reference_id
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          meta.full_name || "",
          mobile,
          meta.email || "",
          meta.city || "",
          meta["your_home_theater_room_current_stage?_"] || "",
          meta["do_you_need_projector_or_tv_?"] || "",
          meta["what_is_your_budget_range_for_audio_&_video_setup?"] || "",
          detailedRemark,
          "Assigned",
          "Inactive",
          assign_id,
          created_by_user,
          0,
          "Fresh Lead",
          assignDate,
          reference_id
        ]
      );

      const master_id = rawRes.insertId;

      // =================================
      // reassignment
      // =================================
      await db.query(
        `INSERT INTO reassignment
        (assign_id, master_id, created_by_user, assignedTo, leadStage, remark, reassignment_date)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          assign_id,
          master_id,
          created_by_user,
          telecaller.name,
          "Fresh Lead",
          detailedRemark,
          assignDate
        ]
      );

      inserted++;
    }

    return res?.json?.({
      success: true,
      total_meta: leads.length,
      inserted,
      duplicates,
      telecallers: telecallers.map(t => t.name)
    });

  } catch (err) {
    console.error("META ROUND ROBIN ERROR:", err);
    return res?.status?.(500).json({
      success: false,
      error: err.message
    });
  }
};


export const importMetaLeadsRoundRobin = async (req, res) => {
  try {
    // =====================================
    // 0. GET DIGITAL MARKETING USER (CREATOR)
    // =====================================
    const [dmUser] = await db.query(
      `SELECT user_id
       FROM users
       WHERE role='digital_marketing'
       AND status='active'
       LIMIT 1`
    );

    if (!dmUser.length) {
      return res?.status?.(400).json({
        success: false,
        message: "No active digital_marketing user found"
      });
    }

    const created_by_user = dmUser[0].user_id;

    // =====================================
    // 1. FETCH META LEADS
    // =====================================
    const PAGE_TOKEN = process.env.META_PAGE_TOKEN;
    const FORM_ID = process.env.META_FORM_ID;

    const metaRes = await axios.get(
      `https://graph.facebook.com/v19.0/${FORM_ID}/leads`,
      {
        params: {
          access_token: PAGE_TOKEN,
          fields: "created_time,field_data",
          limit: 100
        }
      }
    );

    const rawLeads = metaRes?.data?.data || [];

    if (!rawLeads.length) {
      return res?.json?.({ success: true, message: "No Meta leads found" });
    }

    // Normalize Meta leads
    const leads = rawLeads.map((lead) => {
      let obj = { created_time: lead.created_time };
      if (Array.isArray(lead.field_data)) {
        lead.field_data.forEach((f) => {
          obj[f.name] =
            Array.isArray(f.values) && f.values.length > 0 ? f.values[0] : "";
        });
      }
      return obj;
    });

    // =====================================
    // 2. GET ALL ACTIVE TELECALLERS
    // =====================================
    const [telecallers] = await db.query(
      `SELECT user_id, name
       FROM users
       WHERE role='tele_caller'
       AND status='active'
       ORDER BY user_id ASC`
    );

    if (!telecallers.length) {
      return res?.status?.(400).json({
        success: false,
        message: "No active telecaller found"
      });
    }

    // =====================================
    // 3. FIND LAST ASSIGNED TELECALLER
    // =====================================
    const [lastAssign] = await db.query(
      `SELECT assigned_to_user_id
       FROM assignments
       WHERE assigned_to_user_id IS NOT NULL
       ORDER BY assign_id DESC
       LIMIT 1`
    );

    let startIndex = 0;

    if (lastAssign.length) {
      const lastUserId = lastAssign[0].assigned_to_user_id;
      const idx = telecallers.findIndex(t => t.user_id === lastUserId);
      if (idx >= 0) startIndex = (idx + 1) % telecallers.length;
    }

    // =====================================
    // 4. META REFERENCE
    // =====================================
    let reference_id;

    const [ref] = await db.query(
      `SELECT reference_id
       FROM reference
       WHERE LOWER(reference_name)='meta'
       LIMIT 1`
    );

    if (ref.length) {
      reference_id = ref[0].reference_id;
    } else {
      const [refIns] = await db.query(
        `INSERT INTO reference (reference_name, created_by_user)
         VALUES ('META', ?)`,
        [created_by_user]
      );
      reference_id = refIns.insertId;
    }

    // =====================================
    // 5. PROCESS LEADS (ROUND ROBIN)
    // =====================================
    let tcPointer = startIndex;
    let inserted = 0;
    let duplicates = 0;

    for (const meta of leads) {
      const mobile = cleanNumber(meta.whatsapp_number || "");

      if (!mobile || mobile.length !== 10) continue;

      // ---- duplicate check
      const [dup] = await db.query(
        `SELECT master_id FROM raw_data WHERE number=? LIMIT 1`,
        [mobile]
      );

      if (dup.length) {
        duplicates++;
        continue;
      }

      // ---- pick telecaller (round robin)
      const telecaller = telecallers[tcPointer];
      tcPointer = (tcPointer + 1) % telecallers.length;

      const assignDate = new Date(meta.created_time || Date.now());

      // =================================
      // assignments
      // =================================
      const [assignRes] = await db.query(
        `INSERT INTO assignments
        (created_by_user, mode, assign_date, assigned_to, assigned_to_user_id, lead_count, assign_type)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          created_by_user,
          "call",
          assignDate,
          telecaller.name,
          telecaller.user_id,
          1,
          "manual"
        ]
      );

      const assign_id = assignRes.insertId;

      // ---- build remark (ALL META fields)
      const detailedRemark = Object.entries(meta)
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n");

      // =================================
      // raw_data
      // =================================
const [rawRes] = await db.query(
  `INSERT INTO raw_data (
          name,
          number,
          email,
          city,
          current_stage,
          p_type,
          budget_range,
          detailed_remark,
          status,
          lead_status,
          assign_id,
          created_by_user,
          lead_activity,
          lead_stage,
          followup_date,
          reference_id
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          meta.full_name || "",
          mobile,
          meta.email || "",
          meta.city || "",
          meta["your_home_theater_room_current_stage?_"] || "",
          meta["do_you_need_projector_or_tv_?"] || "",
          meta["what_is_your_budget_range_for_audio_&_video_setup?"] || "",
          detailedRemark,
          "Assigned",
          "Inactive",
          assign_id,
          created_by_user,
          0,
          "Fresh Lead",
          assignDate,
          reference_id
        ]
      );

      const master_id = rawRes.insertId;

      // =================================
      // reassignment
      // =================================
      await db.query(
        `INSERT INTO reassignment
        (assign_id, master_id, created_by_user, assignedTo, leadStage, remark, reassignment_date)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          assign_id,
          master_id,
          created_by_user,
          telecaller.name,
          "Fresh Lead",
          detailedRemark,
          assignDate
        ]
      );

      inserted++;
    }

    return res?.json?.({
      success: true,
      total_meta: leads.length,
      inserted,
      duplicates,
      telecallers: telecallers.map(t => t.name)
    });

  } catch (err) {
    console.error("META ROUND ROBIN ERROR:", err);
    return res?.status?.(500).json({
      success: false,
      error: err.message
    });
  }
};

