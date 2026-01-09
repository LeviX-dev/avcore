 import db from '../database/db.js';
 

 export const getAssignedTeleCallerData = async (req, res) => {
  try {
    const query = `
      SELECT 
        a.assign_id,
        a.assign_date,
        rd.master_id,  
        rd.name AS client_name,
        c.cat_name AS category_name,
        p.product_name AS product_name,
        rd.status AS call_status,
        rd.lead_status,
        u.name AS caller_name
      FROM assignments a
      JOIN raw_data rd ON rd.assign_id = a.assign_id
      LEFT JOIN category c ON rd.cat_id = c.cat_id
      LEFT JOIN tele_caller_table tcd ON rd.master_id = tcd.master_id
      LEFT JOIN product p ON tcd.product_id = p.product_id
      LEFT JOIN users u ON a.assigned_to_user_id = u.user_id
      WHERE rd.lead_status ='Active'
      ORDER BY a.assign_date DESC
    `;

    const [data] = await db.query(query);

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error(' Error fetching assigned telecaller data:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};



export const getReportDataByMasterId = async (req, res) => {
  const { master_id } = req.params;

  try {
    const [rows] = await db.execute(
      'SELECT tc_call_duration, tc_remark FROM tele_caller_table WHERE master_id = ?',
      [master_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No report found for this master_id' });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Error fetching tele_caller data:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


