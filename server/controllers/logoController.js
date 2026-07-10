import fileUpload from 'express-fileupload';
import { fileURLToPath } from 'url';
import db from "../database/db.js";
import path from "path";
import fs from "fs";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure file upload middleware for logos
export const logoUploadMiddleware = fileUpload({
  createParentPath: true,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB for logos
  abortOnLimit: true,
  responseOnLimit: 'File size limit has been reached (max 2MB)',
  safeFileNames: true,
  preserveExtension: true,
  useTempFiles: false
});

// Upload Logo
export const uploadLogo = async (req, res) => {
  try {
    const { logo_name } = req.body;
    const user = req.session.user;

    console.log("========== LOGO UPLOAD DEBUG ==========");
    console.log("User ID:", user?.user_id || user?.id);
    console.log("Logo Name:", logo_name);
    console.log("Files:", req.files);
    console.log("=======================================");

    if (!logo_name || !logo_name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Logo name is required"
      });
    }

    if (!req.files || !req.files.logo) {
      return res.status(400).json({
        success: false,
        message: "No logo file uploaded"
      });
    }

    const logoFile = req.files.logo;
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(logoFile.mimetype)) {
      return res.status(400).json({
        success: false,
        message: "Only image files (JPEG, PNG, WEBP, SVG) are allowed"
      });
    }

    // Create safe filename
    const fileExt = path.extname(logoFile.name);
    const safeName = `logo_${Date.now()}_${Math.round(Math.random() * 10000)}${fileExt}`;
    
    const uploadDir = path.join("uploads", "logos");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const savePath = path.join(uploadDir, safeName);
    await logoFile.mv(savePath);

    const dbPath = `uploads/logos/${safeName}`;
    const userId = user?.user_id || user?.id;

    // Insert into database
    const [result] = await db.query(
      `INSERT INTO company_logos (logo_url, logo_name, uploaded_by, created_by, updated_by, is_active) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [dbPath, logo_name.trim(), userId, userId, userId, false]
    );

    // Get the inserted record with user names
    const [newLogo] = await db.query(
      `SELECT l.*, 
        u1.name as uploaded_by_name,
        u2.name as created_by_name,
        u3.name as updated_by_name,
        u4.name as deleted_by_name
       FROM company_logos l
       LEFT JOIN users u1 ON l.uploaded_by = u1.user_id
       LEFT JOIN users u2 ON l.created_by = u2.user_id
       LEFT JOIN users u3 ON l.updated_by = u3.user_id
       LEFT JOIN users u4 ON l.deleted_by = u4.user_id
       WHERE l.id = ?`,
      [result.insertId]
    );

    res.json({
      success: true,
      message: "Logo uploaded successfully",
      data: newLogo[0]
    });

  } catch (err) {
    console.error("LOGO UPLOAD ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Upload failed: " + err.message
    });
  }
};

// Get all logos (list)
export const getLogos = async (req, res) => {
  try {
    const [logos] = await db.query(
      `SELECT l.*, 
        u1.name as uploaded_by_name,
        u2.name as created_by_name,
        u3.name as updated_by_name,
        u4.name as deleted_by_name
       FROM company_logos l
       LEFT JOIN users u1 ON l.uploaded_by = u1.user_id
       LEFT JOIN users u2 ON l.created_by = u2.user_id
       LEFT JOIN users u3 ON l.updated_by = u3.user_id
       LEFT JOIN users u4 ON l.deleted_by = u4.user_id
       WHERE l.is_deleted = 0
       ORDER BY l.is_active DESC, l.created_at DESC`
    );
    
    res.json({
      success: true,
      data: logos
    });
  } catch (err) {
    console.error("GET LOGOS ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch logos"
    });
  }
};

// Get active logo
export const getActiveLogo = async (req, res) => {
  try {
    const [logos] = await db.query(
      `SELECT l.*, u1.name as uploaded_by_name 
       FROM company_logos l
       LEFT JOIN users u1 ON l.uploaded_by = u1.user_id
       WHERE l.is_active = 1 AND l.is_deleted = 0
       LIMIT 1`
    );
    
    res.json({
      success: true,
      data: logos[0] || null
    });
  } catch (err) {
    console.error("GET ACTIVE LOGO ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch active logo"
    });
  }
};

// Set active logo (only one active at a time)
export const setActiveLogo = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { id } = req.params;
    const userId = req.session.user?.user_id || req.session.user?.id;

    await connection.beginTransaction();
    
    // Remove active flag from all logos
    await connection.query(
      'UPDATE company_logos SET is_active = 0, updated_by = ?, updated_at = NOW() WHERE is_deleted = 0',
      [userId]
    );
    
    // Set selected logo as active
    await connection.query(
      'UPDATE company_logos SET is_active = 1, updated_by = ?, updated_at = NOW() WHERE id = ? AND is_deleted = 0',
      [userId, id]
    );
    
    await connection.commit();
    
    res.json({
      success: true,
      message: "Active logo updated successfully"
    });
  } catch (error) {
    await connection.rollback();
    console.error("SET ACTIVE LOGO ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to set active logo"
    });
  } finally {
    connection.release();
  }
};

// Update logo name
export const updateLogo = async (req, res) => {
  try {
    const { id } = req.params;
    const { logo_name } = req.body;
    const userId = req.session.user?.user_id || req.session.user?.id;

    if (!logo_name || !logo_name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Logo name is required"
      });
    }

    const [result] = await db.query(
      `UPDATE company_logos 
       SET logo_name = ?, updated_by = ?, updated_at = NOW() 
       WHERE id = ? AND is_deleted = 0`,
      [logo_name.trim(), userId, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Logo not found"
      });
    }

    res.json({
      success: true,
      message: "Logo updated successfully"
    });
  } catch (error) {
    console.error("UPDATE LOGO ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update logo"
    });
  }
};

// Delete logo (soft delete)
export const deleteLogo = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.session.user?.user_id || req.session.user?.id;

    // Get logo URL first
    const [logos] = await db.query(
      'SELECT logo_url FROM company_logos WHERE id = ? AND is_deleted = 0',
      [id]
    );
    
    if (logos.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Logo not found"
      });
    }

    // Soft delete - mark as deleted
    await db.query(
      `UPDATE company_logos 
       SET is_deleted = 1, deleted_by = ?, deleted_at = NOW(), updated_by = ?, updated_at = NOW() 
       WHERE id = ?`,
      [userId, userId, id]
    );

    // Optionally delete physical file (uncomment if you want to delete files)
    // const filePath = logos[0].logo_url;
    // if (fs.existsSync(filePath)) {
    //   fs.unlinkSync(filePath);
    // }

    res.json({
      success: true,
      message: "Logo deleted successfully"
    });
  } catch (error) {
    console.error("DELETE LOGO ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete logo"
    });
  }
};