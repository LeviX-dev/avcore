// controllers/campaignController.js
import db from '../database/db.js';

export const createCampaign = async (req, res) => {
  try {
    const { campaign_name, platform, start_date, end_date, description } = req.body;

    // ✅ Validate required fields
    if (!campaign_name || !platform || !start_date || !end_date) {
      return res.status(400).json({ message: "All required fields must be filled." });
    }

    const sql = `
      INSERT INTO campaigns (campaign_name, platform, start_date, end_date, description)
      VALUES (?, ?, ?, ?, ?)
    `;

    // ✅ Use promise-based query
    const [result] = await db.execute(sql, [
      campaign_name,
      platform,
      start_date,
      end_date,
      description,
    ]);

    // ✅ Send proper JSON response
    return res.status(201).json({
      message: "✅ Campaign created successfully!",
      campaignId: result.insertId,
    });
  } catch (error) {
    console.error("❌ Error inserting campaign:", error);
    return res.status(500).json({ message: "Server error while creating campaign." });
  }
};


export const getAllCampaigns = async (req, res) => {
  try {
    const sql = "SELECT * FROM campaigns ORDER BY id DESC";

    // ✅ Use await (no callback)
    const [results] = await db.query(sql);

    res.status(200).json(results);
  } catch (err) {
    console.error("❌ Error fetching campaigns:", err);
    res.status(500).json({ message: "Database error", error: err });
  }
};


// ✅ Update Campaign
export const updateCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const { campaign_name, platform, start_date, end_date, description } = req.body;

    // Validate
    if (!id || !campaign_name || !platform || !start_date || !end_date) {
      return res.status(400).json({ message: "All required fields must be filled." });
    }

    const sql = `
      UPDATE campaigns 
      SET campaign_name = ?, platform = ?, start_date = ?, end_date = ?, description = ?
      WHERE id = ?
    `;

    const [result] = await db.execute(sql, [
      campaign_name,
      platform,
      start_date,
      end_date,
      description,
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Campaign not found." });
    }

    return res.status(200).json({ message: "✅ Campaign updated successfully!" });
  } catch (error) {
    console.error("❌ Error updating campaign:", error);
    return res.status(500).json({ message: "Server error while updating campaign." });
  }
};


// 📥 CREATE Student Record
// 📥 CREATE Student Record
export const createStudent = async (req, res) => {
  try {
    const { name, email, phone, education, area_id, cat_id, address, campaign_id } = req.body;

    if (!name || !email || !campaign_id) {
      return res.status(400).json({ message: "Name, Email, and Campaign ID are required." });
    }

    const sql = `
      INSERT INTO students_form (name, email, phone, education, area_id, cat_id, address, campaign_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(sql, [
      name,
      email,
      phone,
      education,
      area_id,
      cat_id,
      address,
      campaign_id,
    ]);

    res.status(201).json({
      message: "✅ Student record created successfully!",
      studentId: result.insertId,
    });
  } catch (error) {
    console.error("❌ Error creating student:", error);
    res.status(500).json({ message: "Database error", error });
  }
};



// 📤 GET: Fetch all Students with area, category, campaign info and platform filter
export const getAllStudents = async (req, res) => {
  try {
    const { platform, campaign_id } = req.query; // Get platform & campaign_id

    let sql = `
      SELECT 
        s.id,
        s.name,
        s.email,
        s.phone,
        s.education,
        s.address,
        s.area_id,
        a.area_name,
        s.cat_id,
        c.cat_name,
        s.campaign_id,
        cam.campaign_name,
        cam.platform,
        s.created_at
      FROM students_form AS s
      LEFT JOIN area AS a ON s.area_id = a.area_id
      LEFT JOIN category AS c ON s.cat_id = c.cat_id
      LEFT JOIN campaigns AS cam ON s.campaign_id = cam.id
    `;

    let conditions = [];
    let queryParams = [];

    // If filtering by campaign
    if (campaign_id) {
      conditions.push(`s.campaign_id = ?`);
      queryParams.push(campaign_id);
    }

    // If filtering by platform
    if (platform && platform !== "all") {
      conditions.push(`cam.platform = ?`);
      queryParams.push(platform);
    }

    // Add WHERE conditions if any filters exist
    if (conditions.length > 0) {
      sql += ` WHERE ` + conditions.join(" AND ");
    }

    sql += ` ORDER BY s.created_at DESC`;

    const [students] = await db.query(sql, queryParams);
    res.status(200).json(students);

  } catch (error) {
    console.error("❌ Error fetching students:", error);
    res.status(500).json({ message: "Database error", error });
  }
};


export const assignCampLeads = async (req, res) => {
  const { mode, assignedTo, assignDate, targetDate, remark, leadCount, selectedIds } = req.body;

  if (!selectedIds || selectedIds.length === 0) {
    return res.status(400).json({ message: "No responses selected for assignment." });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Insert all selected IDs at once
    const assignmentValues = selectedIds.map(responseId => [
      mode, 
      assignedTo, 
      assignDate, 
      targetDate, 
      remark, 
      leadCount || null, 
      responseId
    ]);

    await conn.query(
      `INSERT INTO lead_assignments 
      (mode, assigned_to, assign_date, target_date, remark, lead_count, response_id) 
      VALUES ?`,
      [assignmentValues]
    );

    await conn.commit();
    res.status(200).json({ message: "Leads assigned successfully!" });
  } catch (err) {
    await conn.rollback();
    console.error("Error assigning leads:", err);
    res.status(500).json({ message: "Error assigning leads", error: err.message });
  } finally {
    conn.release();
  }
}; 

