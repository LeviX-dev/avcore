import db from '../database/db.js';



// export const getAllFollowups = async (req, res) => {
//   try {
//     const user = req.session.user;

//     // console.log('Full session:', req.session);

//     if (!user) {
//       return res.status(401).json({ message: 'Unauthorized: No user session found' });
//     }

//     const { id: userId, role } = user;

//     let query = `
//       SELECT 
//         f.followup_id,
//         f.master_id,
//         f.client_name,
//         f.client_contact,
//         f.next_followup_date,
//         f.remark,
//         f.status AS followup_status,
//         f.created_by_user AS followup_created_by_user,   
//         r.master_id,  
//         r.city,
//         r.followup_date,
//         a.assign_id AS assignment_id
//       FROM followup f
//       LEFT JOIN raw_data r ON f.master_id = r.master_id
//       LEFT JOIN assignments a ON r.assign_id = a.assign_id
//     `;

//     const conditions = [];
//     const params = [];

//     if (role === 'tele_caller') {
//       conditions.push('a.assigned_to_user_id = ?');
//       params.push(userId);
//     }

//     if (conditions.length > 0) {
//       query += ' WHERE ' + conditions.join(' AND ');
//     }

//     query += ' ORDER BY f.followup_date DESC';

//     const [followups] = await db.query(query, params);

//     res.status(200).json({ data: followups });
//   } catch (error) {
//     console.error('Error fetching followups:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };


//get by id



export const getAllFollowups = async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized: No user session found' });
    }

    const { id: userId, role } = user;

    let query = `
      SELECT 
        f.followup_id,
        f.master_id,
        f.client_name,
        f.client_contact,
        DATE_FORMAT(f.next_followup_date, '%Y-%m-%d %H:%i:%s') AS next_followup_date,
        f.remark,
        f.status AS followup_status,
        f.created_by_user AS followup_created_by_user,   
        r.master_id,  
        r.city,
        r.lead_stage,
        DATE_FORMAT(r.followup_date, '%Y-%m-%d %H:%i:%s') AS followup_date,
        a.assign_id AS assignment_id
      FROM followup f
      LEFT JOIN raw_data r ON f.master_id = r.master_id
      LEFT JOIN assignments a ON r.assign_id = a.assign_id
    `;

    const conditions = [];
    const params = [];

    if (role === 'tele_caller') {
      conditions.push('a.assigned_to_user_id = ?');
      params.push(userId);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY f.followup_date DESC';

    const [followups] = await db.query(query, params);

    res.status(200).json({ data: followups });
  } catch (error) {
    console.error('Error fetching followups:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};




export const getFollowupById = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query(
  `
  SELECT 
    f.followup_id,
    f.master_id,
    r.name AS client_name,
    r.number AS client_contact,
    f.followup_date,
    f.next_followup_date,
    f.remark,
    f.status AS followup_status,
    f.created_by_user,
    GROUP_CONCAT(DISTINCT c.cat_name) AS categories,
    GROUP_CONCAT(DISTINCT p.product_name) AS products
  FROM followup f
  LEFT JOIN raw_data r ON r.master_id = f.master_id
  LEFT JOIN product_mapping pm ON pm.master_id = r.master_id
  LEFT JOIN category c ON c.cat_id = pm.cat_id
  LEFT JOIN product p ON p.product_id = pm.product_id
  WHERE f.followup_id = ?
  GROUP BY f.followup_id
  `,
  [id]
);


    if (rows.length === 0) {
      return res.status(404).json({ message: 'Followup not found' });
    }

    res.status(200).json({ data: rows[0] });
  } catch (error) {
    console.error('Error fetching followup by ID:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



//get followup status
export const getFollowupStatuses = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_NAME = 'followup' AND COLUMN_NAME = 'status' AND TABLE_SCHEMA = DATABASE()`
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Status column not found' });
    }

    const columnType = rows[0].COLUMN_TYPE; 
   
    const enumValues = columnType
      .substring(5, columnType.length - 1) 
      .split(',')
      .map(value => value.replace(/'/g, '').trim()); 

    res.status(200).json({ statuses: enumValues });
  } catch (error) {
    console.error('Error fetching followup enum statuses:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


//update controller




// export const updateFollowupById = async (req, res) => {
//   const followupId = req.params.id;
//   let {
//     client_name,
//     client_contact,
//     followup_date,
//     next_followup_date,
//     remark,
//     status,
//   } = req.body;

//   try {
//     if (followup_date) {
//       followup_date = new Date(followup_date).toISOString().split('T')[0];
//     }

//     if (next_followup_date) {
//       next_followup_date = new Date(next_followup_date).toISOString().split('T')[0];
//     }

//     const [existing] = await db.query(
//       `SELECT * FROM followup WHERE followup_id = ?`,
//       [followupId]
//     );

//     if (existing.length === 0) {
//       return res.status(404).json({ message: 'Followup not found' });
//     }

//     const followup = existing[0];
//     const master_id = followup.master_id;

//     if (!status) {
//       status = followup.status;
//     }

 
//     if (status === 'meeting scheduled') {
//       await db.query(
//         `INSERT INTO meeting_schedule 
//          (master_id, client_name, client_contact, meeting_date, next_meeting_date, meeting_remark, meeting_status, created_by_user)
//          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
//         [
//           master_id,
//           client_name,
//           client_contact,
//           followup_date,
//           next_followup_date,
//           remark,
//           status,
//           followup.created_by_user,
//         ]
//       );

   
//       await db.query(
//         `UPDATE raw_data 
//          SET status = ?, 
//              lead_activity = IFNULL(lead_activity, 0) + 1 
//          WHERE master_id = ?`,
//         [status, master_id]
//       );

//       await db.query(`DELETE FROM followup WHERE followup_id = ?`, [followupId]);

//       return res.status(200).json({ message: 'Moved to meeting schedule and deleted from followup' });
//     }

 
//     await db.query(
//       `UPDATE followup
//        SET client_name = ?, client_contact = ?, followup_date = ?, next_followup_date = ?, remark = ?, status = ?
//        WHERE followup_id = ?`,
//       [client_name, client_contact, followup_date, next_followup_date, remark, status, followupId]
//     );


//     await db.query(
//       `UPDATE raw_data SET status = ? WHERE master_id = ?`,
//       [status, master_id]
//     );

//     if (['Follow-Up', 'Meeting Scheduled', 'Next Follow Up','Lead Converted'].includes(status)) {
//       await db.query(
//         `UPDATE raw_data 
//          SET lead_activity = IFNULL(lead_activity, 0) + 1 
//          WHERE master_id = ?`,
//         [master_id]
//       );
//     }

//     res.status(200).json({ message: 'Followup updated successfully' });
//   } catch (error) {
//     console.error('Error updating followup:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };



export const updateFollowupById = async (req, res) => {
  const followupId = req.params.id;
  let {
    client_name,
    client_contact,
    followup_date,
    next_followup_date,
    remark,
    status,
  } = req.body;

  try {
    // Format dates for MySQL datetime
    if (followup_date) {
      followup_date = new Date(followup_date).toISOString().slice(0, 19).replace('T', ' ');
    }
    if (next_followup_date) {
      next_followup_date = new Date(next_followup_date).toISOString().slice(0, 19).replace('T', ' ');
    }

    const [existing] = await db.query(
      `SELECT * FROM followup WHERE followup_id = ?`,
      [followupId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Followup not found' });
    }

    const followup = existing[0];
    const master_id = followup.master_id;

    if (!status) {
      status = followup.status;
    }

    // Define status groups
    const followupStatuses = [
      "Fresh Lead",
      "Cold Lead",
      "On Hold",
      "Positive Lead",
      "Quotation Pending",
      "Quotation Follow-up",
      "Projection List",
      "Drop",
      "Closed Deal"
    ];

    const meetingStatuses = ["Pre Site Visit", "Post Site Visit", "Demo"];

    // CASE 1: Meeting Schedule
    if (meetingStatuses.includes(status)) {
      // Insert into meeting_schedule
      await db.query(
        `INSERT INTO meeting_schedule 
          (master_id, client_name, client_contact, meeting_date, next_meeting_date, meeting_remark, meeting_status, created_by_user)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          master_id,
          client_name,
          client_contact,
          followup_date || new Date(),
          next_followup_date || new Date(),
          remark || '',
          status,
          followup.created_by_user,
        ]
      );

      // Update raw_data status
      await db.query(
        `UPDATE raw_data SET status = ?, lead_activity = IFNULL(lead_activity, 0) + 1 WHERE master_id = ?`,
        ['Meeting Scheduled', master_id]
      );

      // Delete from followup table
      await db.query(`DELETE FROM followup WHERE followup_id = ?`, [followupId]);

      return res.status(200).json({ message: 'Moved to meeting schedule and deleted from followup' });
    }

    // CASE 2: Follow-Up
    if (followupStatuses.includes(status)) {
      // Update followup table
      await db.query(
        `UPDATE followup
         SET client_name = ?, client_contact = ?, followup_date = ?, next_followup_date = ?, remark = ?, status = ?
         WHERE followup_id = ?`,
        [
          client_name,
          client_contact,
          followup_date || new Date(),
          next_followup_date || new Date(),
          remark || '',
          status,
          followupId
        ]
      );

      // Update raw_data status to Follow-Up
      await db.query(
        `UPDATE raw_data SET status = ?, lead_activity = IFNULL(lead_activity, 0) + 1 WHERE master_id = ?`,
        ['Follow-Up', master_id]
      );

      return res.status(200).json({ message: 'Followup updated successfully' });
    }

    // If status doesn't match any group, just update followup and raw_data without table change
    await db.query(
      `UPDATE followup
       SET client_name = ?, client_contact = ?, followup_date = ?, next_followup_date = ?, remark = ?, status = ?
       WHERE followup_id = ?`,
      [
        client_name,
        client_contact,
        followup_date || new Date(),
        next_followup_date || new Date(),
        remark || '',
        status,
        followupId
      ]
    );

    await db.query(
      `UPDATE raw_data SET status = ? WHERE master_id = ?`,
      [status, master_id]
    );

    res.status(200).json({ message: 'Followup updated successfully' });

  } catch (error) {
    console.error('Error updating followup:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

