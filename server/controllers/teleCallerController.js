import db from '../database/db.js';

//get data for tele caller

// 12/11/25

// export const fetchTaleCallerData = async (req, res) => {
//   try {
//     if (!req.session.user) {
//       return res.status(401).json({ message: 'Unauthorized: No session' });
//     }

//     const { id: userId, role } = req.session.user;

//     let query = `
//       SELECT
//         rd.master_id,
//         rd.name AS client_name,
//         c.cat_name AS category,
//         GROUP_CONCAT(p.product_name) AS products,
//         a.assign_id,
//         a.assign_date,
//         a.target_date,
//         rd.status AS call_status,
//         MAX(tct.tc_remark) AS call_remark,
//         MAX(tct.tc_call_duration) AS call_duration
//       FROM raw_data rd
//       INNER JOIN assignments a ON rd.assign_id = a.assign_id
//       LEFT JOIN category c ON rd.cat_id = c.cat_id
//       LEFT JOIN tele_caller_table tct ON rd.master_id = tct.master_id
//       LEFT JOIN product_mapping pm ON rd.master_id = pm.master_id
//       LEFT JOIN product p ON p.product_id = pm.product_id
//       WHERE rd.status = 'Assigned'
//     `;

//     const params = [];

//     if (role === 'tele_caller') {
//       query += ` AND a.assigned_to_user_id = ?`;
//       params.push(userId);
//     }

//     query += ' GROUP BY rd.master_id';

//     const [results] = await db.query(query, params);

//     res.status(200).json(results);
//   } catch (error) {
//     console.error('❌ Error in fetchTaleCallerData:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };

export const fetchTaleCallerData = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Unauthorized: No session" });
    }

    const { id: userId, role } = req.session.user;

    let query = `
      SELECT 
        rd.master_id,
        rd.name AS client_name,

        c.cat_name AS category,
        GROUP_CONCAT(p.product_name) AS products,

        a.assign_id,
        a.assign_date,
        a.target_date,

        u.name AS telecaller_name,    -- NEW FIELD

        rd.status AS call_status,

        -- tele_caller fields
        MAX(tct.tc_remark) AS call_remark,
        MAX(tct.tc_call_duration) AS call_duration,

        -- New fields
        rd.lead_stage,
        rd.quick_remark,
        rd.detailed_remark,
        rd.city,
        rd.number

      FROM raw_data rd

      INNER JOIN assignments a 
        ON rd.assign_id = a.assign_id

      LEFT JOIN users u 
        ON a.assigned_to_user_id = u.user_id   -- JOIN USERS TABLE

      LEFT JOIN category c 
        ON rd.cat_id = c.cat_id

      LEFT JOIN tele_caller_table tct 
        ON rd.master_id = tct.master_id

      LEFT JOIN product_mapping pm 
        ON rd.master_id = pm.master_id

      LEFT JOIN product p 
        ON p.product_id = pm.product_id

      WHERE rd.status IN ('Assigned', 'Not Interested')
    `;

    const params = [];

    // Apply tele_caller filter only when role is tele_caller
    if (role === "tele_caller") {
      query += ` AND a.assigned_to_user_id = ?`;
      params.push(userId);
    }

    query += ` GROUP BY rd.master_id`;

    const [results] = await db.query(query, params);

    res.status(200).json(results);

  } catch (error) {
    console.error("❌ Error in fetchTaleCallerData:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


//get status from telecaller table

export const getTeleCallerStatus = async (req, res) => {
  try {
    const query = `SHOW COLUMNS FROM tele_caller_table WHERE Field = 'tc_status'`;
    const [rows] = await db.query(query);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Field not found' });
    }

    const enumStr = rows[0].Type;

    const values = enumStr
      .match(/enum\((.*)\)/)[1]
      .split(',')
      .map((value) => value.trim().replace(/^'(.*)'$/, '$1'));

    res.status(200).json(values);
  } catch (error) {
    console.error('Error fetching enum options:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

//get category from category table

export const getCategories = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM category');
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

//get product from product table

export const getProductsByCategory = async (req, res) => {
  const { cat_id } = req.params;

  if (!cat_id) {
    return res.status(400).json({ error: 'Category ID is required' });
  }

  try {
    const [rows] = await db.query(
      'SELECT product_id, product_name FROM product WHERE cat_id = ? AND status = "active"',
      [cat_id],
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching products by category:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

//get status from raw data table

export const getRawDataStatus = async (req, res) => {
  try {
    const query = `
      SELECT COLUMN_TYPE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'raw_data' AND COLUMN_NAME = 'status'
    `;

    const [result] = await db.query(query);

    if (result.length === 0) {
      return res.status(404).json({ message: 'Column not found' });
    }

    const enumStr = result[0].COLUMN_TYPE;
    const statusValues = enumStr
      .replace(/^enum\(/, '')
      .replace(/\)$/, '')
      .split(',')
      .map((val) => val.trim().replace(/^'/, '').replace(/'$/, ''));

    res.status(200).json(statusValues);
  } catch (error) {
    console.error('Error fetching status enum values:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

//update telecaller

// export const updateTaleCallerData = async (req, res) => {
//   const {
//     master_id,
//     cat_id,
//     tc_status,
//     tc_remark,
//     tc_call_duration,
//     client_name,
//     tc_next_followup_date,
//     selected_products = [],
//     selected_raw_status,

//   } = req.body;

//   const created_by_user = req.session?.user?.id || req.body.created_by_user;

//   if (!created_by_user || isNaN(parseInt(created_by_user))) {
//     return res.status(400).json({ message: 'Invalid or missing user ID' });
//   }

//   try {
//     const callDuration =
//       tc_call_duration === '' ? null : parseInt(tc_call_duration, 10);
//     const product_id =
//       selected_products.length > 0 ? selected_products[0] : null;

//     const [existingTeleCaller] = await db.query(
//       `SELECT * FROM tele_caller_table WHERE master_id = ?`,
//       [master_id],
//     );

//     if (tc_status === 'Not Interested') {
//       if (existingTeleCaller.length > 0) {
//         await db.query(
//           `UPDATE tele_caller_table
//            SET cat_id = ?, product_id = ?, tc_status = ?, tc_remark = ?, tc_call_duration = ?, tc_next_followup_date = ?
//            WHERE master_id = ?`,
//           [
//             cat_id,
//             null,
//             tc_status,
//             tc_remark,
//             callDuration,
//             tc_next_followup_date,
//             master_id,
//           ],
//         );
//       } else {
//         await db.query(
//           `INSERT INTO tele_caller_table
//            (master_id, cat_id, product_id, tc_status, tc_remark, tc_call_duration, tc_next_followup_date)
//            VALUES (?, ?, ?, ?, ?, ?, ?)`,
//           [
//             master_id,
//             cat_id,
//             null,
//             tc_status,
//             tc_remark,
//             callDuration,
//             tc_next_followup_date,
//           ],
//         );
//       }

//       await db.query(
//         `UPDATE raw_data SET name = ?, status = ?, lead_status = ? WHERE master_id = ?`,
//         [client_name, 'Lead Cancelled', 'Inactive', master_id],
//       );

//       return res
//         .status(200)
//         .json({ message: 'Not Interested data saved successfully' });
//     }

//     let finalStatus = 'Assigned';
//     let leadStatus = 'Inactive';

//     if (tc_status === 'Interested') {
//       if (!selected_raw_status) {
//         return res
//           .status(400)
//           .json({ message: 'Please select a status for Interested' });
//       }
//       finalStatus = selected_raw_status;
//       leadStatus = 'Active';
//     } else if (tc_status === 'Follow-Up') {
//       finalStatus = 'Follow-Up';
//     }

//     if (existingTeleCaller.length > 0) {
//       await db.query(
//         `UPDATE tele_caller_table
//          SET cat_id = ?, product_id = ?, tc_status = ?, tc_remark = ?, tc_call_duration = ?, tc_next_followup_date = ?
//          WHERE master_id = ?`,
//         [
//           cat_id,
//           product_id,
//           tc_status,
//           tc_remark,
//           callDuration,
//           tc_next_followup_date,
//           master_id,
//         ],
//       );
//     } else {
//       await db.query(
//         `INSERT INTO tele_caller_table
//          (master_id, cat_id, product_id, tc_status, tc_remark, tc_call_duration, tc_next_followup_date)
//          VALUES (?, ?, ?, ?, ?, ?, ?)`,
//         [
//           master_id,
//           cat_id,
//           product_id,
//           tc_status,
//           tc_remark,
//           callDuration,
//           tc_next_followup_date,
//         ],
//       );
//     }

//     await db.query(
//       `UPDATE raw_data SET name = ?, status = ?, lead_status = ? WHERE master_id = ?`,
//       [client_name, finalStatus, leadStatus, master_id],
//     );

//     if (
//       ['Follow-Up', 'Meeting Scheduled', 'Lead Converted'].includes(finalStatus)
//     ) {
//       await db.query(
//         `UPDATE raw_data SET lead_activity = IFNULL(lead_activity, 0) + 1 WHERE master_id = ?`,
//         [master_id],
//       );
//     }

//     if (finalStatus === 'Follow-Up') {
//       const followupStatus = 'next follow up';

//       const [rawDataResult] = await db.query(
//         'SELECT number FROM raw_data WHERE master_id = ?',
//         [master_id],
//       );
//       const client_number =
//         rawDataResult.length > 0 ? rawDataResult[0].number : '';

//       const [existingFollowup] = await db.query(
//         `SELECT * FROM followup WHERE master_id = ?`,
//         [master_id],
//       );

//       if (existingFollowup.length > 0) {
//         await db.query(
//           `UPDATE followup
//            SET client_name = ?, client_contact = ?, followup_date = ?, remark = ?, status = ?, created_by_user = ?
//            WHERE master_id = ?`,
//           [
//             client_name,
//             client_number,
//             tc_next_followup_date,
//             tc_remark,
//             followupStatus,
//             created_by_user,
//             master_id,
//           ],
//         );
//       } else {
//         await db.query(
//           `INSERT INTO followup
//            (master_id, client_name, client_contact, followup_date, remark, status, created_by_user)
//            VALUES (?, ?, ?, ?, ?, ?, ?)`,
//           [
//             master_id,
//             client_name,
//             client_number,
//             tc_next_followup_date,
//             tc_remark,
//             followupStatus,
//             created_by_user,
//           ],
//         );
//       }
//     }

//     if (tc_status === 'Interested') {
//       for (const product_id of selected_products) {
//         if (!product_id) continue;

//         const [productData] = await db.query(
//           `SELECT cat_id FROM product WHERE product_id = ?`,
//           [product_id],
//         );
//         if (productData.length === 0) continue;

//         const realCatId = productData[0].cat_id;
//         const [existing] = await db.query(
//           `SELECT * FROM product_mapping WHERE master_id = ? AND product_id = ?`,
//           [master_id, product_id],
//         );

//         if (existing.length === 0) {
//           await db.query(
//             `INSERT INTO product_mapping
//              (master_id, product_id, cat_id, created_by_user)
//              VALUES (?, ?, ?, ?)`,
//             [master_id, product_id, realCatId, created_by_user],
//           );
//         }
//       }
//     }

//     res.status(200).json({ message: 'tele_caller data updated successfully' });
//   } catch (error) {
//     console.error('Error updating tele_caller data:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };

// export const updateTaleCallerData = async (req, res) => {
//   const {
//     master_id,
//     cat_id,
//     tc_status,
//     tc_remark,
//     tc_call_duration,
//     client_name,
//     tc_next_followup_date,
//     selected_products = [],
//     selected_raw_status,
//     lead_stage,
//     detailed_remark
//   } = req.body;

//   const created_by_user = req.session?.user?.id || req.body.created_by_user;

//   if (!created_by_user || isNaN(parseInt(created_by_user))) {
//     return res.status(400).json({ message: 'Invalid or missing user ID' });
//   }

//   try {
//     const callDuration =
//       tc_call_duration === '' ? null : parseInt(tc_call_duration, 10);
//     const product_id =
//       selected_products.length > 0 ? selected_products[0] : null;

//     const [existingTeleCaller] = await db.query(
//       `SELECT * FROM tele_caller_table WHERE master_id = ?`,
//       [master_id],
//     );

//     // **************************
//     // QUICK REMARK LOGIC + LOGS
//     // **************************

//     let newQuickRemark = null;

//     if (tc_status === "Interested") {
//       newQuickRemark = "Interested";
//     } else if (tc_status === "Not Interested") {
//       newQuickRemark = "Not Interested";
//     } else if (tc_status === "Follow-Up") {
//       newQuickRemark = "Follow-Up";
//     } else if (tc_status === "Meeting Scheduled") {
//       newQuickRemark = "Meeting Scheduled";
//     }

//     // Get old quick remark
//     const [oldQuickRemarkRow] = await db.query(
//       `SELECT quick_remark FROM raw_data WHERE master_id = ?`,
//       [master_id]
//     );

//     const oldQuickRemark = oldQuickRemarkRow.length
//       ? oldQuickRemarkRow[0].quick_remark
//       : null;

//     // Update quick_remark, lead_stage, detailed_remark
//     await db.query(
//       `UPDATE raw_data
//        SET quick_remark = ?, lead_stage = ?, detailed_remark = ?
//        WHERE master_id = ?`,
//       [
//         newQuickRemark,
//         lead_stage || null,
//         detailed_remark || null,
//         master_id
//       ]
//     );

//     // Insert log only when quick_remark changes
//     if (oldQuickRemark !== newQuickRemark) {
//       await db.query(
//         `INSERT INTO tele_caller_logs
//          (master_id, user_id, old_quick_remark, new_quick_remark)
//          VALUES (?, ?, ?, ?)`,
//         [master_id, created_by_user, oldQuickRemark, newQuickRemark]
//       );
//     }

//     // **************************
//     // DO NOT CHANGE ANYTHING BELOW
//     // **************************

//     if (tc_status === 'Not Interested') {
//       if (existingTeleCaller.length > 0) {
//         await db.query(
//           `UPDATE tele_caller_table
//            SET cat_id = ?, product_id = ?, tc_status = ?, tc_remark = ?, tc_call_duration = ?, tc_next_followup_date = ?
//            WHERE master_id = ?`,
//           [
//             cat_id,
//             null,
//             tc_status,
//             tc_remark,
//             callDuration,
//             tc_next_followup_date,
//             master_id,
//           ],
//         );
//       } else {
//         await db.query(
//           `INSERT INTO tele_caller_table
//            (master_id, cat_id, product_id, tc_status, tc_remark, tc_call_duration, tc_next_followup_date)
//            VALUES (?, ?, ?, ?, ?, ?, ?)`,
//           [
//             master_id,
//             cat_id,
//             null,
//             tc_status,
//             tc_remark,
//             callDuration,
//             tc_next_followup_date,
//           ],
//         );
//       }

//       await db.query(
//         `UPDATE raw_data SET name = ?, status = ?, lead_status = ? WHERE master_id = ?`,
//         [client_name, 'Lead Cancelled', 'Inactive', master_id],
//       );

//       return res
//         .status(200)
//         .json({ message: 'Not Interested data saved successfully' });
//     }

//     let finalStatus = 'Assigned';
//     let leadStatus = 'Inactive';

//     if (tc_status === 'Interested') {
//       if (!selected_raw_status) {
//         return res
//           .status(400)
//           .json({ message: 'Please select a status for Interested' });
//       }
//       finalStatus = selected_raw_status;
//       leadStatus = 'Active';
//     } else if (tc_status === 'Follow-Up') {
//       finalStatus = 'Follow-Up';
//     }

//     if (existingTeleCaller.length > 0) {
//       await db.query(
//         `UPDATE tele_caller_table
//          SET cat_id = ?, product_id = ?, tc_status = ?, tc_remark = ?, tc_call_duration = ?, tc_next_followup_date = ?
//          WHERE master_id = ?`,
//         [
//           cat_id,
//           product_id,
//           tc_status,
//           tc_remark,
//           callDuration,
//           tc_next_followup_date,
//           master_id,
//         ],
//       );
//     } else {
//       await db.query(
//         `INSERT INTO tele_caller_table
//          (master_id, cat_id, product_id, tc_status, tc_remark, tc_call_duration, tc_next_followup_date)
//          VALUES (?, ?, ?, ?, ?, ?, ?)`,
//         [
//           master_id,
//           cat_id,
//           product_id,
//           tc_status,
//           tc_remark,
//           callDuration,
//           tc_next_followup_date,
//         ],
//       );
//     }

//     await db.query(
//       `UPDATE raw_data SET name = ?, status = ?, lead_status = ? WHERE master_id = ?`,
//       [client_name, finalStatus, leadStatus, master_id],
//     );

//     if (
//       ['Follow-Up', 'Meeting Scheduled', 'Lead Converted'].includes(finalStatus)
//     ) {
//       await db.query(
//         `UPDATE raw_data SET lead_activity = IFNULL(lead_activity, 0) + 1 WHERE master_id = ?`,
//         [master_id],
//       );
//     }

//     if (finalStatus === 'Follow-Up') {
//       const followupStatus = 'next follow up';

//       const [rawDataResult] = await db.query(
//         'SELECT number FROM raw_data WHERE master_id = ?',
//         [master_id],
//       );
//       const client_number =
//         rawDataResult.length > 0 ? rawDataResult[0].number : '';

//       const [existingFollowup] = await db.query(
//         `SELECT * FROM followup WHERE master_id = ?`,
//         [master_id],
//       );

//       if (existingFollowup.length > 0) {
//         await db.query(
//           `UPDATE followup
//            SET client_name = ?, client_contact = ?, followup_date = ?, remark = ?, status = ?, created_by_user = ?
//            WHERE master_id = ?`,
//           [
//             client_name,
//             client_number,
//             tc_next_followup_date,
//             tc_remark,
//             followupStatus,
//             created_by_user,
//             master_id,
//           ],
//         );
//       } else {
//         await db.query(
//           `INSERT INTO followup
//            (master_id, client_name, client_contact, followup_date, remark, status, created_by_user)
//            VALUES (?, ?, ?, ?, ?, ?, ?)`,
//           [
//             master_id,
//             client_name,
//             client_number,
//             tc_next_followup_date,
//             tc_remark,
//             followupStatus,
//             created_by_user,
//           ],
//         );
//       }
//     }

//     if (tc_status === 'Interested') {
//       for (const product_id of selected_products) {
//         if (!product_id) continue;

//         const [productData] = await db.query(
//           `SELECT cat_id FROM product WHERE product_id = ?`,
//           [product_id],
//         );
//         if (productData.length === 0) continue;

//         const realCatId = productData[0].cat_id;
//         const [existing] = await db.query(
//           `SELECT * FROM product_mapping WHERE master_id = ? AND product_id = ?`,
//           [master_id, product_id],
//         );

//         if (existing.length === 0) {
//           await db.query(
//             `INSERT INTO product_mapping
//              (master_id, product_id, cat_id, created_by_user)
//              VALUES (?, ?, ?, ?)`,
//             [master_id, product_id, realCatId, created_by_user],
//           );
//         }
//       }
//     }

//     res.status(200).json({ message: 'tele_caller data updated successfully' });
//   } catch (error) {
//     console.error('Error updating tele_caller data:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };

export const updateTaleCallerData1 = async (req, res) => {
  const {
    master_id,
    cat_id,
    quick_remark,
    tc_remark,
    tc_call_duration,
    client_name,
    tc_next_followup_date,
    selected_products = [],
    selected_raw_status,
    lead_stage,
    detailed_remark,
  } = req.body;

  const created_by_user = req.session?.user?.id || req.body.created_by_user;

  if (!created_by_user || isNaN(parseInt(created_by_user))) {
    return res.status(400).json({ message: 'Invalid or missing user ID' });
  }

  try {
    const callDuration =
      tc_call_duration === '' ? null : parseInt(tc_call_duration, 10);

    const product_id =
      selected_products.length > 0 ? selected_products[0] : null;

    const [existingTeleCaller] = await db.query(
      `SELECT * FROM tele_caller_table WHERE master_id = ?`,
      [master_id],
    );

    // **************************
    // QUICK REMARK LOGIC + LOG DATA
    // **************************

    const newQuickRemark = quick_remark || null;

    // Fetch old quick remark
    const [oldQuickRemarkRow] = await db.query(
      `SELECT quick_remark FROM raw_data WHERE master_id = ?`,
      [master_id],
    );

    const oldQuickRemark = oldQuickRemarkRow.length
      ? oldQuickRemarkRow[0].quick_remark
      : null;

    // Update quick_remark in raw_data
    await db.query(
      `UPDATE raw_data 
       SET quick_remark = ?, lead_stage = ?, detailed_remark = ?
       WHERE master_id = ?`,
      [newQuickRemark, lead_stage || null, detailed_remark || null, master_id],
    );

    // Insert tele_caller logs only if changed
    if (oldQuickRemark !== newQuickRemark) {
      await db.query(
        `INSERT INTO tele_caller_logs
         (master_id, user_id, old_quick_remark, new_quick_remark)
         VALUES (?, ?, ?, ?)`,
        [master_id, created_by_user, oldQuickRemark, newQuickRemark],
      );
    }

    // **************************
    // BELOW: STATUS-BASED LOGIC
    // **************************

    const status = quick_remark; // renamed for clarity

    if (status === 'Not Interested') {
      if (existingTeleCaller.length > 0) {
        await db.query(
          `UPDATE tele_caller_table
           SET cat_id = ?, product_id = ?, tc_status = ?, tc_remark = ?, tc_call_duration = ?, tc_next_followup_date = ?
           WHERE master_id = ?`,
          [
            cat_id,
            null,
            status,
            tc_remark,
            callDuration,
            tc_next_followup_date,
            master_id,
          ],
        );
      } else {
        await db.query(
          `INSERT INTO tele_caller_table
           (master_id, cat_id, product_id, tc_status, tc_remark, tc_call_duration, tc_next_followup_date)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            master_id,
            cat_id,
            null,
            status,
            tc_remark,
            callDuration,
            tc_next_followup_date,
          ],
        );
      }

      await db.query(
        `UPDATE raw_data SET name = ?, status = ?, lead_status = ? WHERE master_id = ?`,
        [client_name, 'Lead Cancelled', 'Inactive', master_id],
      );

      return res
        .status(200)
        .json({ message: 'Not Interested data saved successfully' });
    }

    let finalStatus = 'Assigned';
    let leadStatus = 'Inactive';

    if (status === 'Interested') {
      if (!selected_raw_status) {
        return res
          .status(400)
          .json({ message: 'Please select a status for Interested' });
      }
      finalStatus = selected_raw_status;
      leadStatus = 'Active';
    }

    if (status === 'Follow-Up') {
      finalStatus = 'Follow-Up';
    }

    // Save tele caller table
    if (existingTeleCaller.length > 0) {
      await db.query(
        `UPDATE tele_caller_table
         SET cat_id = ?, product_id = ?, tc_status = ?, tc_remark = ?, tc_call_duration = ?, tc_next_followup_date = ?
         WHERE master_id = ?`,
        [
          cat_id,
          product_id,
          status,
          tc_remark,
          callDuration,
          tc_next_followup_date,
          master_id,
        ],
      );
    } else {
      await db.query(
        `INSERT INTO tele_caller_table
         (master_id, cat_id, product_id, tc_status, tc_remark, tc_call_duration, tc_next_followup_date)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          master_id,
          cat_id,
          product_id,
          status,
          tc_remark,
          callDuration,
          tc_next_followup_date,
        ],
      );
    }

    await db.query(
      `UPDATE raw_data SET name = ?, status = ?, lead_status = ? WHERE master_id = ?`,
      [client_name, finalStatus, leadStatus, master_id],
    );

    // Follow-up logic
    if (finalStatus === 'Follow-Up') {
      const followupStatus = 'next follow up';

      const [rawDataResult] = await db.query(
        'SELECT number FROM raw_data WHERE master_id = ?',
        [master_id],
      );
      const client_number =
        rawDataResult.length > 0 ? rawDataResult[0].number : '';

      const [existingFollowup] = await db.query(
        `SELECT * FROM followup WHERE master_id = ?`,
        [master_id],
      );

      if (existingFollowup.length > 0) {
        await db.query(
          `UPDATE followup
           SET client_name = ?, client_contact = ?, followup_date = ?, remark = ?, status = ?, created_by_user = ?
           WHERE master_id = ?`,
          [
            client_name,
            client_number,
            tc_next_followup_date,
            tc_remark,
            followupStatus,
            created_by_user,
            master_id,
          ],
        );
      } else {
        await db.query(
          `INSERT INTO followup
           (master_id, client_name, client_contact, followup_date, remark, status, created_by_user)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            master_id,
            client_name,
            client_number,
            tc_next_followup_date,
            tc_remark,
            followupStatus,
            created_by_user,
          ],
        );
      }
    }

    // Product Mapping for Interested
    if (status === 'Interested') {
      for (const product_id of selected_products) {
        if (!product_id) continue;

        const [productData] = await db.query(
          `SELECT cat_id FROM product WHERE product_id = ?`,
          [product_id],
        );
        if (productData.length === 0) continue;

        const realCatId = productData[0].cat_id;

        const [existing] = await db.query(
          `SELECT * FROM product_mapping WHERE master_id = ? AND product_id = ?`,
          [master_id, product_id],
        );

        if (existing.length === 0) {
          await db.query(
            `INSERT INTO product_mapping
             (master_id, product_id, cat_id, created_by_user)
             VALUES (?, ?, ?, ?)`,
            [master_id, product_id, realCatId, created_by_user],
          );
        }
      }
    }

    res.status(200).json({ message: 'tele_caller data updated successfully' });
  } catch (error) {
    console.error('Error updating tele_caller data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// export const updateTaleCallerDataNew = async (req, res) => {
//   const {
//     master_id,
//     cat_id,
//     quick_remark,
//     tc_remark,
//     tc_call_duration,
//     client_name,
//     tc_next_followup_date,
//     selected_products = [],
//     selected_raw_status,
//     lead_stage,
//     detailed_remark,
//   } = req.body;

//   const created_by_user = req.session?.user?.id || req.body.created_by_user;

//   if (!created_by_user || isNaN(parseInt(created_by_user))) {
//     return res.status(400).json({ message: 'Invalid or missing user ID' });
//   }

//   try {
//     const callDuration =
//       tc_call_duration === '' ? null : parseInt(tc_call_duration, 10);

//     const product_id =
//       selected_products.length > 0 ? selected_products[0] : null;

//     const [existingTeleCaller] = await db.query(
//       `SELECT * FROM tele_caller_table WHERE master_id = ?`,
//       [master_id]
//     );

//     // **************************
//     // QUICK REMARK LOGIC + LOG DATA
//     // **************************
//     const newQuickRemark = quick_remark || null;

//     const [oldQuickRemarkRow] = await db.query(
//       `SELECT quick_remark FROM raw_data WHERE master_id = ?`,
//       [master_id]
//     );

//     const oldQuickRemark = oldQuickRemarkRow.length
//       ? oldQuickRemarkRow[0].quick_remark
//       : null;

//     await db.query(
//       `UPDATE raw_data
//        SET quick_remark = ?, lead_stage = ?, detailed_remark = ?
//        WHERE master_id = ?`,
//       [newQuickRemark, lead_stage || null, detailed_remark || null, master_id]
//     );

//     if (oldQuickRemark !== newQuickRemark) {
//       await db.query(
//         `INSERT INTO tele_caller_logs
//          (master_id, user_id, old_quick_remark, new_quick_remark)
//          VALUES (?, ?, ?, ?)`,
//         [master_id, created_by_user, oldQuickRemark, newQuickRemark]
//       );
//     }

//     // **************************
//     // ROUTING BASED ON LEAD_STAGE / QUICK_REMARK
//     // **************************

//     // 1️⃣ FOLLOW-UP LEAD_STAGES
//     const followupLeadStages = [
//       "Fresh Lead", "Cold Lead", "On Hold", "Positive Lead",
//       "Quotation Pending", "Quotation Follow-up", "Quotation Sent",
//       "Projection List", "Drop", "Closed Deal"
//     ];

//     // 2️⃣ MEETING LEAD_STAGES
//     const meetingLeadStages = ["Pre Site Visit", "Post Site Visit", "Demo"];

//     // 3️⃣ tele_caller QUICK REMARKS
//     const teleCallerRemarks = [
//       "Interested","Not Interested","Not Received","Call Cut",
//       "Not Reachable","Busy","Purchase from other","Revised Quote","Invalid Number"
//     ];

//     if (followupLeadStages.includes(lead_stage)) {
//       // Update raw_data status to Follow-Up
//       await db.query(
//         `UPDATE raw_data SET status = ?, lead_status = ? WHERE master_id = ?`,
//         ["Follow-Up", "Active", master_id]
//       );

//       // Insert or update followup table
//       const [rawDataResult] = await db.query(
//         'SELECT number FROM raw_data WHERE master_id = ?',
//         [master_id]
//       );
//       const client_number = rawDataResult.length > 0 ? rawDataResult[0].number : '';

//       const [existingFollowup] = await db.query(
//         `SELECT * FROM followup WHERE master_id = ?`,
//         [master_id]
//       );

//       if (existingFollowup.length > 0) {
//         await db.query(
//           `UPDATE followup
//            SET client_name = ?, client_contact = ?, followup_date = ?, remark = ?, status = ?, created_by_user = ?
//            WHERE master_id = ?`,
//           [client_name, client_number, tc_next_followup_date, tc_remark, 'Follow-Up', created_by_user, master_id]
//         );
//       } else {
//         await db.query(
//           `INSERT INTO followup
//            (master_id, client_name, client_contact, followup_date, remark, status, created_by_user)
//            VALUES (?, ?, ?, ?, ?, ?, ?)`,
//           [master_id, client_name, client_number, tc_next_followup_date, tc_remark, 'Follow-Up', created_by_user]
//         );
//       }
//     } else if (meetingLeadStages.includes(lead_stage)) {
//       // Update raw_data status to Meeting Scheduled
//       await db.query(
//         `UPDATE raw_data SET status = ?, lead_status = ? WHERE master_id = ?`,
//         ["Meeting Scheduled", "Active", master_id]
//       );

//       // Insert into meeting_schedule
//       await db.query(
//         `INSERT INTO meeting_schedule
//          (master_id, client_name, client_contact, next_meeting_date, meeting_remark, meeting_status, created_by_user)
//          VALUES (?, ?, ?, ?, ?, ?, ?)`,
//         [master_id, client_name, client_name, tc_next_followup_date, tc_remark, lead_stage, created_by_user]
//       );
//     } else if (teleCallerRemarks.includes(quick_remark)) {
//       // Save in tele_caller_table
//       if (existingTeleCaller.length > 0) {
//         await db.query(
//           `UPDATE tele_caller_table
//            SET cat_id = ?, product_id = ?, tc_status = ?, tc_remark = ?, tc_call_duration = ?, tc_next_followup_date = ?
//            WHERE master_id = ?`,
//           [cat_id, product_id, quick_remark, tc_remark, callDuration, tc_next_followup_date, master_id]
//         );
//       } else {
//         await db.query(
//           `INSERT INTO tele_caller_table
//            (master_id, cat_id, product_id, tc_status, tc_remark, tc_call_duration, tc_next_followup_date)
//            VALUES (?, ?, ?, ?, ?, ?, ?)`,
//           [master_id, cat_id, product_id, quick_remark, tc_remark, callDuration, tc_next_followup_date]
//         );
//       }

//       await db.query(
//         `UPDATE raw_data SET status = ?, lead_status = ? WHERE master_id = ?`,
//         [quick_remark, "Active", master_id]
//       );

//       // Handle product mapping if Interested
//       if (quick_remark === "Interested") {
//         for (const product_id of selected_products) {
//           if (!product_id) continue;
//           const [productData] = await db.query(
//             `SELECT cat_id FROM product WHERE product_id = ?`,
//             [product_id]
//           );
//           if (productData.length === 0) continue;

//           const realCatId = productData[0].cat_id;

//           const [existing] = await db.query(
//             `SELECT * FROM product_mapping WHERE master_id = ? AND product_id = ?`,
//             [master_id, product_id]
//           );

//           if (existing.length === 0) {
//             await db.query(
//               `INSERT INTO product_mapping
//                (master_id, product_id, cat_id, created_by_user)
//                VALUES (?, ?, ?, ?)`,
//               [master_id, product_id, realCatId, created_by_user]
//             );
//           }
//         }
//       }
//     }

//     res.status(200).json({ message: 'tele_caller data updated successfully' });
//   } catch (error) {
//     console.error('Error updating tele_caller data:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };





// export const updateTaleCallerData = async (req, res) => {
//   const {
//     master_id,
//     cat_id,
//     quick_remark,
//     tc_remark,
//     tc_call_duration,
//     client_name,
//     tc_next_followup_date,
//     selected_products = [],
//     lead_stage,
//     detailed_remark,
//   } = req.body;

//   const created_by_user = req.session?.user?.id || req.body.created_by_user;

//   // Convert date string from frontend to MySQL datetime format
// let followupDate = null;
// if (tc_next_followup_date) {
//   const d = new Date(tc_next_followup_date);
//   followupDate = d.toISOString().slice(0, 19).replace('T', ' '); 
//   // results in '2025-12-01 00:00:00'
// }


//   if (!created_by_user) {
//     return res.status(400).json({ message: 'Invalid or missing user ID' });
//   }

//   try {
//     const callDuration =
//       tc_call_duration === '' ? null : parseInt(tc_call_duration);

//     // Group 1: FOLLOW-UP lead stages
//     const followupStages = [
//       'Fresh Lead',
//       'Cold Lead',
//       'On Hold',
//       'Positive Lead',
//       'Quotation Pending',
//       'Quotation Follow-up',
//       'Quotation Sent',
//       'Projection List',
//       'Drop',
//       'Closed Deal',
//     ];

//     // Group 2: MEETING lead stages
//     const meetingStages = ['Pre Site Visit', 'Post Site Visit', 'Demo'];

//     // Group 3: tele_caller quick remarks
//    const teleCallerRemarks = [
//   'Interested',
//   'Not Interested',
//   'Not Received',
//   'Call Cut',
//   'Not Reachable',
//   'Busy',
//   'Purchase from other',
//   'Revised Quote',
//   'Invalid Number',
// ];

//     // NEGATIVE REMARKS should set status = Not Interested
//     const negativeRemarks = [
//       'Not Interested',
//       'Not Received',
//       'Call Cut',
//       'Not Reachable',
//       'Busy',
//       'Purchase from other',
//       'Quotation Sent',
//       'Revised Quote',
//       'Invalid Number',
//     ];

// const cleanedRemark = quick_remark ? quick_remark.trim() : "";

//     // Update raw_data base fields
//     await db.query(
//       `UPDATE raw_data 
//        SET lead_stage = ?, quick_remark = ?, detailed_remark = ?
//        WHERE master_id = ?`,
//       [lead_stage, quick_remark, detailed_remark, master_id],
//     );

//     // -------------------------------------------------
//     // CASE 0: NEGATIVE QUICK REMARK → NOT INTERESTED
//     // -------------------------------------------------
//     if (negativeRemarks.includes(quick_remark)) {

//       // Update raw_data status
//       await db.query(
//         `UPDATE raw_data SET status = ? WHERE master_id = ?`,
//         ['Not Interested', master_id]
//       );

//       // Insert into tele_caller_table
//       await db.query(
//         `INSERT INTO tele_caller_table 
//         (master_id, tc_status, tc_remark, tc_call_duration, tc_next_followup_date)
//         VALUES (?, ?, ?, ?, ?)`,
//         [
//           master_id,
//           quick_remark,
//           tc_remark,
//           callDuration,
//           tc_next_followup_date,
//           created_by_user
//         ]
//       );

//       return res.json({ message: 'Saved as Not Interested' });
//     }

//     // -------------------------------------------------
//     // CASE 1: FOLLOW-UP
//     // -------------------------------------------------
//     if (followupStages.includes(lead_stage)) {
//     await db.query(
//   `UPDATE raw_data SET status = ?, followup_date = ? WHERE master_id = ?`,
//   ['Follow-Up', followupDate, master_id]
// );


//       const [raw] = await db.query(
//         'SELECT number FROM raw_data WHERE master_id = ?',
//         [master_id],
//       );

//       const client_number = raw.length ? raw[0].number : '';

//       const [existingFU] = await db.query(
//         `SELECT * FROM followup WHERE master_id = ?`,
//         [master_id],
//       );

//       if (existingFU.length > 0) {
//         await db.query(
//           `UPDATE followup 
//            SET client_name=?, client_contact=?, followup_date=?, remark=?, status=?, created_by_user=?
//            WHERE master_id=?`,
//           [
//             client_name,
//             client_number,
//             tc_next_followup_date,
//             tc_remark,
//             'Follow-Up',
//             created_by_user,
//             master_id,
//           ],
//         );
//       } else {
//         await db.query(
//   `INSERT INTO followup 
//     (master_id, client_name, client_contact, followup_date, remark, status, created_by_user)
//    VALUES (?, ?, ?, ?, ?, ?, ?)
//    ON DUPLICATE KEY UPDATE 
//      client_name = VALUES(client_name),
//      client_contact = VALUES(client_contact),
//      followup_date = VALUES(followup_date),
//      remark = VALUES(remark),
//      status = VALUES(status),
//      created_by_user = VALUES(created_by_user)`,
//   [master_id, client_name, client_number, followupDate, tc_remark, 'Follow-Up', created_by_user]
// );

//       }

//       return res.json({ message: 'Follow-Up saved successfully' });
//     }

//     // -------------------------------------------------
//     // CASE 2: MEETING SCHEDULE
//     // -------------------------------------------------
//     if (meetingStages.includes(lead_stage)) {
//       await db.query(`UPDATE raw_data SET status = ? WHERE master_id = ?`, [
//         'Meeting Scheduled',
//         master_id,
//       ]);

//       const [rawClient] = await db.query(
//         'SELECT number FROM raw_data WHERE master_id = ?',
//         [master_id],
//       );

//       const client_number = rawClient.length ? rawClient[0].number : '';

//       await db.query(
//         `INSERT INTO meeting_schedule 
//          (master_id, client_name, client_contact, next_meeting_date, meeting_remark, meeting_status, created_by_user)
//          VALUES (?, ?, ?, ?, ?, ?, ?)`,
//         [
//           master_id,
//           client_name,
//           client_number,
//           tc_next_followup_date,
//           tc_remark,
//           lead_stage,
//           created_by_user,
//         ],
//       );

//       return res.json({ message: 'Meeting Scheduled saved successfully' });
//     }

//    // ----------------------------
// // CASE 3: tele_caller ENTRIES
// // ----------------------------
// if (negativeRemarks.includes(cleanedRemark)) {

//   // UPDATE STATUS → Not Interested
//   await db.query(
//     `UPDATE raw_data SET status = ? WHERE master_id = ?`,
//     ['Not Interested', master_id]
//   );

//   // INSERT tele_caller ENTRY
//   await db.query(
//     `INSERT INTO tele_caller_table 
//       (master_id, tc_status, tc_remark, tc_call_duration, tc_next_followup_date)
//     VALUES (?, ?, ?, ?, ?)`,
//     [
//       master_id,
//       cleanedRemark,
//       tc_remark,
//       callDuration,
//       tc_next_followup_date
//     ]
//   );

//   return res.json({ message: 'Saved as Not Interested' });
// }


//     // If nothing matched
//     res.json({ message: 'Saved, but no rule matched' });

//   } catch (error) {
//     console.error('Error updating tele_caller data:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };



export const updateTaleCallerData = async (req, res) => {
  const {
    master_id,
    cat_id,
    quick_remark,
    client_name,
    lead_stage,
    detailed_remark,
    tc_next_followup_date,
    assigned_to_names,
    assigned_to_ids,
    raw_data_status = 'Assigned',
    call_status
  } = req.body;

  // ✅ FIX 1: get created_by_user
  const created_by_user = req.session?.user?.id || null;

  console.log('📱 Received update request:', {
    master_id,
    assigned_to_names,
    assigned_to_ids,
    raw_data_status,
    lead_stage,
    quick_remark,
    call_status,
    created_by_user
  });

  if (!master_id) {
    return res.status(400).json({
      success: false,
      message: "master_id is required"
    });
  }

  if (!assigned_to_names || !Array.isArray(assigned_to_names) || assigned_to_names.length === 0) {
    return res.status(400).json({
      success: false,
      message: "At least one user must be assigned"
    });
  }

  // Convert follow-up date safely
  let followupDate = null;
  let reassignmentDate = null;

  if (tc_next_followup_date) {
    const d = new Date(tc_next_followup_date);
    if (!isNaN(d.getTime())) {
      followupDate = d.toISOString().slice(0, 19).replace("T", " ");
      reassignmentDate = followupDate;
    }
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    /* ============================
       STEP 1: UPDATE raw_data
    ============================ */
    await connection.query(
      `UPDATE raw_data
       SET
         name = COALESCE(?, name),
         cat_id = COALESCE(?, cat_id),
         quick_remark = COALESCE(?, quick_remark),
         lead_stage = COALESCE(?, lead_stage),
         followup_date = COALESCE(?, followup_date),
         detailed_remark = COALESCE(?, detailed_remark)
       WHERE master_id = ?`,
      [
        client_name || null,
        cat_id || null,
        quick_remark || null,
        lead_stage || null,
        followupDate,
        detailed_remark || null,
        master_id
      ]
    );

    /* ============================
       STEP 2: INSERT reassignment
       (ALWAYS INSERT — NO UPDATE)
    ============================ */

    // Get assign_id
    const [raw] = await connection.query(
      `SELECT assign_id FROM raw_data WHERE master_id = ?`,
      [master_id]
    );

    if (!raw.length || !raw[0].assign_id) {
      throw new Error("assign_id not found for master_id");
    }

    const assign_id = raw[0].assign_id;

    for (let i = 0; i < assigned_to_names.length; i++) {
      const userName = assigned_to_names[i];
      const userId = assigned_to_ids?.[i] || null;

      await connection.query(
        `INSERT INTO reassignment
         (
           assign_id,
           master_id,
           created_by_user,
           assignedTo,
           leadStage,
           remark,
           reassignment_date,
           created_at
         )
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          assign_id,
          master_id,
          created_by_user,          // ✅ FIX 2
          userName,
          lead_stage || 'Cold Lead',
          detailed_remark || `Assigned to ${userName}`,
          reassignmentDate || new Date().toISOString().slice(0, 19).replace("T", " ")
        ]
      );

      console.log(`✅ Reassignment inserted for: ${userName}`);
    }

    await connection.commit();

    return res.json({
      success: true,
      message: "Lead updated successfully",
      data: {
        master_id,
        assigned_users: assigned_to_names,
        created_by_user,
        reassignment_count: assigned_to_names.length
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error("❌ Update Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  } finally {
    connection.release();
  }
};
