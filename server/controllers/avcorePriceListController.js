import db from '../database/db.js';
import path from 'path';
import fs from 'fs';

const uploadDir = 'uploads/avcore_pricelist';

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// GET with pagination
export const getPriceList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const status = req.query.status || 'all';

    let statusCondition = '';
    if (status !== 'all') {
      statusCondition = 'WHERE ap.status = ?';
    }

    // Get total count
    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM avcore_pricelist ap ${statusCondition}`,
      status !== 'all' ? [status] : []
    );
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    // Get paginated data
    const [rows] = await db.query(`
      SELECT ap.*, u.name as uploaded_by_name, u.role as uploaded_by_role
      FROM avcore_pricelist ap
      LEFT JOIN users u ON ap.uploaded_by = u.user_id
      ${statusCondition}
      ORDER BY ap.created_at DESC
      LIMIT ? OFFSET ?
    `, status !== 'all' ? [status, limit, offset] : [limit, offset]);

    const baseUrl = `${req.protocol}://${req.get('host')}`;

    const data = rows.map(doc => ({
      ...doc,
      file_url: `${baseUrl}/${doc.file_path}`,
      preview_url: doc.file_type.startsWith('image') ? `${baseUrl}/${doc.file_path}` : null
    }));

    res.json({
      success: true,
      documents: data,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalItems: total,
        itemsPerPage: limit
      }
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// UPLOAD (updated to include status)
export const uploadPriceList = async (req, res) => {
  try {
    const file = req.files?.file;
    const remark = req.body.remark || '';
    const status = req.body.status || 'active';
    const userId = req.session?.user?.id;

    if (!file) return res.status(400).json({ message: "No file" });

    const ext = path.extname(file.name);
    const fileName = `price_${Date.now()}${ext}`;
    const filePath = `${uploadDir}/${fileName}`;

    await file.mv(filePath);

    await db.query(`
      INSERT INTO avcore_pricelist 
      (file_name, file_path, file_type, file_size, remark, uploaded_by, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      file.name,
      filePath,
      file.mimetype,
      file.size,
      remark,
      userId,
      status
    ]);

    res.json({ success: true, message: "Uploaded" });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// UPDATE STATUS
export const updatePriceListStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await db.query(
      "UPDATE avcore_pricelist SET status = ? WHERE id = ?",
      [status, id]
    );

    res.json({ success: true, message: "Status updated" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE
export const deletePriceList = async (req, res) => {
  try {
    const { id } = req.params;

    const [[doc]] = await db.query("SELECT * FROM avcore_pricelist WHERE id = ?", [id]);

    if (!doc) return res.status(404).json({ message: "Not found" });

    if (fs.existsSync(doc.file_path)) {
      fs.unlinkSync(doc.file_path);
    }

    await db.query("DELETE FROM avcore_pricelist WHERE id = ?", [id]);

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};