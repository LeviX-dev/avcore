import db from '../database/db.js';

const ensureVendorTable = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS vendors (
      vendor_id INT AUTO_INCREMENT PRIMARY KEY,
      company_name VARCHAR(255) NOT NULL,
      vendor_name VARCHAR(255) DEFAULT NULL,
      contact_number VARCHAR(20) NOT NULL,
      company_email VARCHAR(255) DEFAULT NULL,
      office_address TEXT DEFAULT NULL,
      city VARCHAR(120) DEFAULT NULL,
      state_province VARCHAR(120) DEFAULT NULL,
      invoice_gst_number VARCHAR(64) DEFAULT NULL,
      remarks TEXT DEFAULT NULL,
      is_active TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await db.query(`ALTER TABLE vendors ADD COLUMN IF NOT EXISTS company_name VARCHAR(255) NOT NULL DEFAULT ''`);
  await db.query(`ALTER TABLE vendors ADD COLUMN IF NOT EXISTS vendor_name VARCHAR(255) DEFAULT NULL`);
  await db.query(`ALTER TABLE vendors ADD COLUMN IF NOT EXISTS contact_number VARCHAR(20) NOT NULL DEFAULT ''`);
  await db.query(`ALTER TABLE vendors ADD COLUMN IF NOT EXISTS company_email VARCHAR(255) DEFAULT NULL`);
  await db.query(`ALTER TABLE vendors ADD COLUMN IF NOT EXISTS office_address TEXT DEFAULT NULL`);
  await db.query(`ALTER TABLE vendors ADD COLUMN IF NOT EXISTS city VARCHAR(120) DEFAULT NULL`);
  await db.query(`ALTER TABLE vendors ADD COLUMN IF NOT EXISTS state_province VARCHAR(120) DEFAULT NULL`);
  await db.query(`ALTER TABLE vendors ADD COLUMN IF NOT EXISTS invoice_gst_number VARCHAR(64) DEFAULT NULL`);
  await db.query(`ALTER TABLE vendors ADD COLUMN IF NOT EXISTS remarks TEXT DEFAULT NULL`);
  await db.query(`ALTER TABLE vendors ADD COLUMN IF NOT EXISTS is_active TINYINT(1) DEFAULT 1`);
};

export const createVendor = async (req, res) => {
  try {
    await ensureVendorTable();

    const {
      company_name,
      vendor_name,
      contact_number,
      company_email,
      office_address,
      city,
      state_province,
      invoice_gst_number,
      remarks,
    } = req.body;

    if (!company_name || !company_name.trim()) {
      return res.status(400).json({ success: false, message: 'company_name is required' });
    }

    if (!contact_number || !contact_number.trim()) {
      return res.status(400).json({ success: false, message: 'contact_number is required' });
    }

    const [result] = await db.query(
      `INSERT INTO vendors
      (company_name, vendor_name, contact_number, company_email, office_address, city, state_province, invoice_gst_number, remarks, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        company_name.trim(),
        vendor_name?.trim() || null,
        contact_number.trim(),
        company_email?.trim() || null,
        office_address?.trim() || null,
        city?.trim() || null,
        state_province?.trim() || null,
        invoice_gst_number?.trim() || null,
        remarks?.trim() || null,
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Vendor added successfully',
      vendor_id: result.insertId,
    });
  } catch (error) {
    console.error('Error creating vendor:', error);
    return res.status(500).json({ success: false, message: 'Failed to create vendor' });
  }
};

export const getVendors = async (req, res) => {
  try {
    await ensureVendorTable();

    const [rows] = await db.query(
      `SELECT
        vendor_id,
        company_name,
        vendor_name,
        contact_number,
        company_email,
        office_address,
     
        city,
        state_province,
        invoice_gst_number,
        remarks,
        is_active,
        created_at,
        updated_at
      FROM vendors
      WHERE is_active = 1
      ORDER BY vendor_id DESC`
    );

    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching vendors:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch vendors' });
  }
};

export const updateVendor = async (req, res) => {
  try {
    await ensureVendorTable();

    const { id } = req.params;
    const {
      company_name,
      vendor_name,
      contact_number,
      company_email,
      office_address,
      city,
      state_province,
      invoice_gst_number,
      remarks,
    } = req.body;

    if (!company_name || !company_name.trim()) {
      return res.status(400).json({ success: false, message: 'company_name is required' });
    }

    if (!contact_number || !contact_number.trim()) {
      return res.status(400).json({ success: false, message: 'contact_number is required' });
    }

    const [result] = await db.query(
      `UPDATE vendors
       SET company_name = ?, vendor_name = ?, contact_number = ?, company_email = ?, office_address = ?,
           city = ?, state_province = ?, invoice_gst_number = ?, remarks = ?
       WHERE vendor_id = ? AND is_active = 1`,
      [
        company_name.trim(),
        vendor_name?.trim() || null,
        contact_number.trim(),
        company_email?.trim() || null,
        office_address?.trim() || null,
        city?.trim() || null,
        state_province?.trim() || null,
        invoice_gst_number?.trim() || null,
        remarks?.trim() || null,
        id,
      ]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    return res.status(200).json({ success: true, message: 'Vendor updated successfully' });
  } catch (error) {
    console.error('Error updating vendor:', error);
    return res.status(500).json({ success: false, message: 'Failed to update vendor' });
  }
};

export const deleteVendor = async (req, res) => {
  try {
    await ensureVendorTable();

    const { id } = req.params;
    const [result] = await db.query(
      'UPDATE vendors SET is_active = 0 WHERE vendor_id = ? AND is_active = 1',
      [id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    return res.status(200).json({ success: true, message: 'Vendor deleted successfully' });
  } catch (error) {
    console.error('Error deleting vendor:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete vendor' });
  }
};