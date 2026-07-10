

import db from '../database/db.js';

// export const getMeetingSchedules = async (req, res) => {
//   try {
//     // console.log(" [GET] /api/meeting-schedules - Fetching all meeting schedules");

//     const query = `
//       SELECT 
//         meeting_id, 
//         master_id, 
//         client_name, 
//         client_contact, 
//         meeting_date, 
//         next_meeting_date, 
//         meeting_remark, 
//         meeting_status, 
//         created_by_user 
//       FROM meeting_schedule
//     `;

//     const [rows] = await db.query(query);

//     // console.log(`✅ Fetched ${rows.length} meeting schedule(s)`);

//     res.status(200).json({
//       success: true,
//       data: rows,
//       message: rows.length === 0 ? "No meeting schedules found" : "Meeting schedules fetched successfully"
//     });

//   } catch (error) {
//     console.error(' Error fetching meeting schedules:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: error.message
//     });
//   }
// };

// export const getMeetingSchedules = async (req, res) => {
//   try {
//     const user = req.session.user;

//     if (!user) {
//       return res.status(401).json({ message: 'Unauthorized: No user session found' });
//     }

//     const { id: userId, role } = user;

//     let query = `
//       SELECT 
//         m.meeting_id, 
//         m.master_id, 
//         m.client_name, 
//         m.client_contact, 
//         m.meeting_date, 
//         m.next_meeting_date, 
//         m.meeting_remark, 
//         m.meeting_status, 
//         m.created_by_user,
//         a.assign_id AS assignment_id
//       FROM meeting_schedule m
//       LEFT JOIN raw_data r ON m.master_id = r.master_id
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

//     query += ' ORDER BY m.meeting_date DESC';

//     const [rows] = await db.query(query, params);

//     res.status(200).json({
//       success: true,
//       data: rows,
//       message: rows.length === 0 ? 'No meeting schedules found' : 'Meeting schedules fetched successfully'
//     });

//   } catch (error) {
//     console.error('Error fetching meeting schedules:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: error.message
//     });
//   }
// };


export const getMeetingSchedules = async (req, res) => {
  try {
    const user = req.session.user;

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized: No user session found' });
    }

    const { id: userId, role } = user;

    let query = `
      SELECT 
        m.meeting_id, 
        m.master_id, 
        r.name AS client_name,
        r.number AS client_contact,
        r.city,
        m.meeting_date, 
        m.next_meeting_date, 
        m.meeting_remark, 
        m.meeting_status, 
        m.created_by_user,
        a.assign_id AS assignment_id
      FROM meeting_schedule m
      LEFT JOIN raw_data r ON m.master_id = r.master_id
      LEFT JOIN assignments a ON r.assign_id = a.assign_id
    `;

    const conditions = [];
    const params = [];

    // tele_caller can only see assigned meetings
    if (role === 'tele_caller') {
      conditions.push('a.assigned_to_user_id = ?');
      params.push(userId);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY m.meeting_date DESC';

    const [rows] = await db.query(query, params);

    res.status(200).json({
      success: true,
      data: rows,
      message: rows.length === 0 ? 'No meeting schedules found' : 'Meeting schedules fetched successfully'
    });

  } catch (error) {
    console.error('Error fetching meeting schedules:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};


export const updateMeetingSchedule = async (req, res) => {
  const {
    meeting_id,
    master_id,
    client_name,
    client_contact,
    meeting_date,
    next_meeting_date,
    meeting_remark,
    meeting_status,
    created_by_user,
  } = req.body;

  try {
    // Format dates
    const formattedMeetingDate = meeting_date
      ? new Date(meeting_date).toISOString().split('T')[0]
      : null;
    const formattedNextMeetingDate = next_meeting_date
      ? new Date(next_meeting_date).toISOString().split('T')[0]
      : null;

    // Check if meeting exists
    const [existing] = await db.query(
      `SELECT * FROM meeting_schedule WHERE meeting_id = ?`,
      [meeting_id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Meeting schedule not found' });
    }

    // Update meeting_table
    const sql = `
      UPDATE meeting_schedule SET
        master_id = ?, client_name = ?, client_contact = ?, 
        meeting_date = ?, next_meeting_date = ?, meeting_remark = ?, 
        meeting_status = ?, created_by_user = ?
      WHERE meeting_id = ?
    `;

    const values = [
      master_id,
      client_name,
      client_contact,
      formattedMeetingDate,
      formattedNextMeetingDate,
      meeting_remark,
      meeting_status,
      created_by_user,
      meeting_id,
    ];

    await db.query(sql, values);

    await db.query(
     `UPDATE raw_data SET status = ? WHERE master_id = ?`,
      [meeting_status, master_id]
    );


    if (
      ['Follow-Up', 'Meeting Scheduled', 'Next Follow Up', 'Lead Converted'].includes(
        meeting_status
      )
    ) {
      await db.query(
        `UPDATE raw_data SET lead_activity = IFNULL(lead_activity, 0) + 1 WHERE master_id = ?`,
        [master_id]
      );
    }

    res.status(200).json({ message: 'Meeting schedule updated successfully' });
  } catch (error) {
    console.error('Error updating meeting schedule:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



//get meeting view
export const getMeetingById = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query(
      `
      SELECT 
        m.meeting_id,
        m.master_id,
        m.client_name,
        m.client_contact,
        m.meeting_date,
        m.next_meeting_date,
        m.meeting_remark,
        m.meeting_status,
        m.created_by_user,
        GROUP_CONCAT(DISTINCT c.cat_name) AS categories,
        GROUP_CONCAT(DISTINCT p.product_name) AS products
      FROM meeting_schedule m
      LEFT JOIN raw_data r ON r.master_id = m.master_id
      LEFT JOIN product_mapping pm ON pm.master_id = r.master_id
      LEFT JOIN category c ON c.cat_id = pm.cat_id
      LEFT JOIN product p ON p.product_id = pm.product_id
      WHERE m.meeting_id = ?
      GROUP BY m.meeting_id
      `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    res.status(200).json({ data: rows[0] });
  } catch (error) {
    console.error('Error fetching meeting by ID:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
