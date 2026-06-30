import db from '../database/db.js'; //
import { createNotification } from './notificationController.js';



// export const assignLeads = async (req, res) => {
//   if (!req.session.user) {
//     return res.status(401).json({ message: 'Unauthorized. Please log in.' });
//   }

//   const {
//     mode,
//     assignedTo,
//     assignDate,
//     targetDate,
//     remark,
//     leadCount,
//     cat_id,
//     area_id,
//   } = req.body;

//   const userId = req.session.user.id;
 

//   if (
//     !mode ||
//     !assignedTo ||
//     !assignDate ||
//     !targetDate ||
//     !leadCount ||
//     !cat_id ||
//     !area_id ||
//     !userId
//   ) {
//     return res.status(400).json({
//       message: 'All fields are required.',
//       received: req.body,
//     });
//   }

//   const connection = await db.getConnection();

//   try {
//     await connection.beginTransaction();

//     const nameOnly = assignedTo.split(' (')[0].trim();
  

//     const [[assignedUser]] = await connection.query(
//       `SELECT user_id FROM users WHERE name = ? LIMIT 1`,
//       [nameOnly],
//     );

//     if (!assignedUser) {
//       throw new Error(
//         `Assigned user '${assignedTo}' not found in users table.`,
//       );
//     }

//     const assignedToUserId = assignedUser.user_id;
  

//     const [leads] = await connection.query(
//       `SELECT master_id, status, cat_id, area_id FROM raw_data 
//        WHERE status = 'Not Assigned' AND cat_id = ? AND area_id = ?
//        ORDER BY master_id ASC
//        LIMIT ?`,
//       [Number(cat_id), Number(area_id), Number(leadCount)],
//     );

   

//     if (leads.length === 0) {
//       throw new Error('No unassigned leads available in selected category.');
//     }

//     const leadIds = leads.map((lead) => lead.master_id);
    

//     const [assignmentResult] = await connection.query(
//       `INSERT INTO assignments (
//         created_by_user,
//         mode,
//         cat_id,
//         assign_date,
//         target_date,
//         remark,
//         created_at,
//         assigned_to,
//         assigned_to_user_id,
//         lead_count,
//         area_id
//       )
//       VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?)`,
//       [
//         userId,
//         mode,
//         cat_id,
//         assignDate,
//         targetDate,
//         remark,
//         assignedTo,
//         assignedToUserId,
//         leadIds.length,
//         area_id,
//       ],
//     );

//     const newAssignId = assignmentResult.insertId;


//     await connection.query(
//       `UPDATE raw_data SET status = 'Assigned', assign_id = ? 
//        WHERE master_id IN (${leadIds.map(() => '?').join(',')})`,
//       [newAssignId, ...leadIds],
//     );

//     await connection.commit();

//     res.status(200).json({
//       message: 'Leads assigned successfully.',
//       assign_id: newAssignId,
//     });
//   } catch (error) {
//     await connection.rollback();
//     console.error('❌ Assignment error:', error);
//     res.status(500).json({
//       message: 'Failed to assign leads.',
//       error: error.message,
//     });
//   } finally {
//     connection.release();
//   }
// };


















// import db from '../database/db.js'; //

// export const assignLeads = async (req, res) => {
//   if (!req.session.user) {
//     return res.status(401).json({ message: 'Unauthorized. Please log in.' });
//   }

//   const {
//     mode,
//     assignedTo,
//     assignDate,
//     targetDate,
//     remark,
//     leadCount,
//     cat_id,
//     area_id,
//   } = req.body;

//   const userId = req.session.user.id;
//   console.log('Request body received:', req.body);

//   if (
//     !mode ||
//     !assignedTo ||
//     !assignDate ||
//     !targetDate ||
//     !leadCount ||
//     !cat_id ||
//     !area_id ||
//     !userId
//   ) {
//     return res
//       .status(400)
//       .json({ message: 'All fields are required.', received: req.body });
//   }

//   const connection = await db.getConnection();

//   try {
//     await connection.beginTransaction();
//     // Extract name before the role part
//     const nameOnly = assignedTo.split(' (')[0].trim();

//     const [[assignedUser]] = await connection.query(
//       `SELECT user_id FROM users WHERE name = ? LIMIT 1`,
//       [nameOnly],
//     );

//     if (!assignedUser) {
//       throw new Error(
//         `Assigned user '${assignedTo}' not found in users table.`,
//       );
//     }

//     const assignedToUserId = assignedUser.user_id;

//     console.log('cat_id: ', cat_id);
//     console.log('area_id: ', area_id);

//     // ✅ STEP 1: Select leads by cat_id
//     const [leads] = await connection.query(
//       `SELECT master_id FROM raw_data 
//         WHERE status = 'Not Assigned' AND cat_id = ? AND area_id = ?
//         ORDER BY master_id ASC
//         LIMIT ?`,
//       [Number(cat_id), Number(area_id), Number(leadCount)],
//     );

//     if (leads.length === 0) {
//       throw new Error('No unassigned leads available in selected category.');
//     }

//     const leadIds = leads.map((lead) => lead.master_id);

//     // ✅ STEP 2: Insert assignment record
//     const [assignmentResult] = await connection.query(
//       `INSERT INTO assignments (
//         created_by_user,
//         mode,
//         cat_id,
//         assign_date,
//         target_date,
//         remark,
//         created_at,
//         assigned_to,
//         assigned_to_user_id,
//         lead_count,
//         area_id
//       )
//       VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?,?)`,
//       [
//         userId,
//         mode,
//         cat_id,
//         assignDate,
//         targetDate,
//         remark,
//         assignedTo,
//         assignedToUserId,
//         leadIds.length,
//         area_id,
//       ],
//     );

//     const newAssignId = assignmentResult.insertId;

//     // ✅ STEP 3: Update raw_data with assigned status
//     await connection.query(
//       `UPDATE raw_data SET status = 'Assigned', assign_id = ? 
//        WHERE master_id IN (?)`,
//       [newAssignId, leadIds],
//     );

//     await connection.commit();
//     res
//       .status(200)
//       .json({
//         message: 'Leads assigned successfully.',
//         assign_id: newAssignId,
//       });
//   } catch (error) {
//     await connection.rollback();
//     console.error('Assignment error:', error);
//     res
//       .status(500)
//       .json({ message: 'Failed to assign leads.', error: error.message });
//   } finally {
//     connection.release();
//   }
// };

//07-11-25

// export const assignLeads = async (req, res) => {
//   if (!req.session.user) {
//     return res.status(401).json({ message: "Unauthorized. Please log in." });
//   }

//   const {
//     mode,
//     assignedTo,
//     assignDate,
//     targetDate,
//     remark,
//     leadCount,
//     cat_id,
//     area_id,
//   } = req.body;

//   const userId = req.session.user.id;

//   if (
//     !mode ||
//     !assignedTo ||
//     !assignDate ||
//     !targetDate ||
//     !leadCount ||
//     !cat_id ||
//     !area_id ||
//     !userId
//   ) {
//     return res.status(400).json({
//       message: "All fields are required.",
//       received: req.body,
//     });
//   }

//   const connection = await db.getConnection();

//   try {
//     await connection.beginTransaction();

//     const nameOnly = assignedTo.split(" (")[0].trim();

//     const [[assignedUser]] = await connection.query(
//       `SELECT user_id FROM users WHERE name = ? LIMIT 1`,
//       [nameOnly]
//     );

//     if (!assignedUser) {
//       throw new Error(`Assigned user '${assignedTo}' not found in users table.`);
//     }

//     const assignedToUserId = assignedUser.user_id;

//     console.log("📩 AssignLeads request body:", req.body);
//     console.log("🔍 Using cat_id:", cat_id, "area_id:", area_id);

//     // 🟢 Step 1: Try exact match
//     const [leads] = await connection.query(
//       `SELECT master_id, status, cat_id, area_id FROM raw_data 
//        WHERE status = 'Not Assigned' AND cat_id = ? AND area_id = ?
//        ORDER BY master_id ASC
//        LIMIT ?`,
//       [Number(cat_id), Number(area_id), Number(leadCount)]
//     );

//     console.log("🧾 Found leads:", leads);

//     // 🟠 Step 2: Fallback (if no exact area match)
//     if (leads.length === 0) {
//       const [fallbackLeads] = await connection.query(
//         `SELECT master_id, status, cat_id, area_id FROM raw_data 
//          WHERE status = 'Not Assigned' AND cat_id = ?
//          ORDER BY master_id ASC
//          LIMIT ?`,
//         [Number(cat_id), Number(leadCount)]
//       );

//       if (fallbackLeads.length === 0) {
//         throw new Error(
//           `No unassigned leads available for cat_id=${cat_id} and area_id=${area_id}.`
//         );
//       } else {
//         console.log(
//           `⚠️ No leads for area_id=${area_id}, using available leads with cat_id=${cat_id} from other areas.`
//         );
//         leads.push(...fallbackLeads);
//       }
//     }

//     const leadIds = leads.map((lead) => lead.master_id);
//     console.log("✅ Lead IDs selected for assignment:", leadIds);

//     // 🟢 Step 3: Create assignment record
//     const [assignmentResult] = await connection.query(
//       `INSERT INTO assignments (
//         created_by_user,
//         mode,
//         cat_id,
//         assign_date,
//         target_date,
//         remark,
//         created_at,
//         assigned_to,
//         assigned_to_user_id,
//         lead_count,
//         area_id
//       )
//       VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?)`,
//       [
//         userId,
//         mode,
//         cat_id,
//         assignDate,
//         targetDate,
//         remark,
//         assignedTo,
//         assignedToUserId,
//         leadIds.length,
//         area_id,
//       ]
//     );

//     const newAssignId = assignmentResult.insertId;

//     // 🟢 Step 4: Update raw_data
//     await connection.query(
//       `UPDATE raw_data SET status = 'Assigned', assign_id = ? 
//        WHERE master_id IN (${leadIds.map(() => "?").join(",")})`,
//       [newAssignId, ...leadIds]
//     );

//     await connection.commit();

//     res.status(200).json({
//       message: "Leads assigned successfully.",
//       assign_id: newAssignId,
//     });
//   } catch (error) {
//     await connection.rollback();
//     console.error("❌ Assignment error:", error);
//     res.status(500).json({
//       message: "Failed to assign leads.",
//       error: error.message,
//     });
//   } finally {
//     connection.release();
//   }
// };


export const assignLeads = async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized. Please log in." });
  }

  const { assignType, mode, assignDate, targetDate, remark, leadCount } = req.body;
  const userId = req.session.user.id;

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    if (!assignType || !mode || !assignDate || !targetDate || !leadCount) {
      return res.status(400).json({ message: "Missing required fields" });
    }

  
    const [leads] = await connection.query(
      `SELECT master_id 
       FROM raw_data 
       WHERE status='Not Assigned'
       ORDER BY master_id ASC
       LIMIT ?`,
      [Number(leadCount)]
    );

    if (leads.length === 0) {
      throw new Error("No unassigned leads available.");
    }

    const leadIds = leads.map((l) => l.master_id);


    const [telecallers] = await connection.query(
      `SELECT user_id, name 
       FROM users 
       WHERE role = 'tele_caller'
       ORDER BY user_id ASC`
    );

    if (telecallers.length === 0) {
      throw new Error("No telecallers found.");
    }

 
    let assignIndex = 0;

    for (let i = 0; i < leadIds.length; i++) {
      const tele = telecallers[assignIndex];

      
      const [assignmentResult] = await connection.query(
        `INSERT INTO assignments (
          created_by_user, mode, assign_date, target_date, remark, created_at,
          assigned_to, assigned_to_user_id, lead_count, assign_type
        )
        VALUES (?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?)`,
        [
          userId,
          mode,
          assignDate,
          targetDate,
          remark,
          tele.name,
          tele.user_id,
          1, // one lead for this telecaller
          assignType
        ]
      );

      const newAssignId = assignmentResult.insertId;

      // Update raw_data
      await connection.query(
        `UPDATE raw_data 
         SET status='Assigned', assign_id=?
         WHERE master_id=?`,
        [newAssignId, leadIds[i]]
      );

      console.log("notification created")
  await createNotification(
        tele.user_id,
        'New Lead Assigned',
        `You have been assigned a new lead (ID: ${leadIds[i]}). Please check your dashboard.`,
        `/call` // link to the assigned calls page
      );

      // Move to next telecaller
      assignIndex++;
      if (assignIndex >= telecallers.length) {
        assignIndex = 0;
      }
    }

    await connection.commit();

    res.status(200).json({
      message: "Leads auto-distributed successfully (Round Robin).",
      totalLeads: leadIds.length,
      telecallers: telecallers.length
    });

  } catch (error) {
    await connection.rollback();
    res.status(500).json({
      message: "Failed to auto-assign leads",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

// ✅ Get available cat_id and area_id combinations with names
export const getAvailableCatArea = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT DISTINCT 
        r.cat_id,
        c.cat_name,
        r.area_id,
        a.area_name
      FROM raw_data r
      JOIN category c ON r.cat_id = c.cat_id
      JOIN area a ON r.area_id = a.area_id
      WHERE r.status = 'Not Assigned'
      ORDER BY r.cat_id, r.area_id;
    `);

    res.status(200).json(rows);
  } catch (error) {
    console.error("❌ Error fetching available cat/area:", error);
    res.status(500).json({ message: "Failed to fetch available category/area data." });
  }
};

