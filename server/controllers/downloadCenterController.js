// controllers/downloadCenterController.js
import db from '../database/db.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to extract version number
const extractVersionNumber = (versionStr) => {
    if (!versionStr) return -1;
    const match = versionStr.match(/v(\d+)/i);
    if (match && match[1]) {
        return parseInt(match[1]);
    }
    // Handle version like "1.0.0"
    const dotMatch = versionStr.match(/^(\d+)\./);
    if (dotMatch && dotMatch[1]) {
        return parseInt(dotMatch[1]);
    }
    return -1;
};

// Get all download items (APK versions only)
export const getDownloadItems = async (req, res) => {
  try {
    const [items] = await db.execute(`
      SELECT dc.*, 
             u1.name as created_by_name,
             u2.name as updated_by_name
      FROM download_center dc
      LEFT JOIN users u1 ON dc.created_by = u1.user_id
      LEFT JOIN users u2 ON dc.updated_by = u2.user_id
      WHERE dc.file_type = 'apk'
      ORDER BY dc.created_at DESC
    `);
    
    // Format version numbers for display
    const formattedItems = items.map(item => {
        let displayVersion = item.version;
        // If version doesn't start with 'v', add it
        if (displayVersion && !displayVersion.startsWith('v') && !displayVersion.startsWith('V')) {
            displayVersion = `v${displayVersion}`;
        }
        return {
            ...item,
            display_version: displayVersion,
            version_number: extractVersionNumber(item.version)
        };
    });
    
    res.status(200).json(formattedItems);
  } catch (error) {
    console.error('Error fetching download items:', error);
    res.status(500).json({ error: 'Failed to fetch download items' });
  }
};

// Get next version number
const getNextVersion = async () => {
  try {
    const [rows] = await db.execute(`
      SELECT version FROM download_center 
      WHERE file_type = 'apk' 
      ORDER BY created_at DESC 
      LIMIT 1
    `);
    
    if (rows.length === 0) {
      return 'v0';
    }
    
    const lastVersion = rows[0].version;
    let versionNumber = 0;
    
    // Extract number from version string (supports v0, v1, 1.0.0, etc.)
    const match = lastVersion.match(/(\d+)/);
    if (match) {
      versionNumber = parseInt(match[1]) + 1;
    }
    
    return `v${versionNumber}`;
  } catch (error) {
    console.error('Error getting next version:', error);
    return 'v0';
  }
};

// Add new APK version
export const addDownloadItem = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: 'Unauthorized. Please log in.' });
    }

    const { title, description } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: 'APK file is required' });
    }

    const file = req.files.file;
    
    // Validate file type
    if (!file.name.endsWith('.apk')) {
      return res.status(400).json({ error: 'Only APK files are allowed' });
    }
    
    // Get next version number
    const nextVersion = await getNextVersion();
    
    // Generate filename with version
    const fileName = `AVCoreApp_${nextVersion}.apk`;
    const uploadDir = path.join(__dirname, '../uploads/downloads');
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const filePath = path.join(uploadDir, fileName);
    await file.mv(filePath);
    
    const fileSize = file.size;
    
    // Set previous versions to inactive
    await db.execute(`
      UPDATE download_center 
      SET status = 'inactive' 
      WHERE file_type = 'apk' AND status = 'active'
    `);
    
    // Insert new version
    const [result] = await db.execute(`
      INSERT INTO download_center 
      (title, description, file_name, file_path, file_type, file_size, version, status, created_by) 
      VALUES (?, ?, ?, ?, 'apk', ?, ?, 'active', ?)
    `, [title, description, fileName, `/uploads/downloads/${fileName}`, fileSize, nextVersion, req.session.user.user_id || req.session.user.id]);
    
    res.status(201).json({ 
      message: 'APK version added successfully', 
      id: result.insertId,
      version: nextVersion
    });
  } catch (error) {
    console.error('Error adding download item:', error);
    res.status(500).json({ error: 'Failed to add APK version' });
  }
};

// Toggle status (active/inactive)
export const toggleStatus = async (req, res) => {
  const { id } = req.params;
  
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: 'Unauthorized. Please log in.' });
    }
    
    // Get current item
    const [items] = await db.execute('SELECT * FROM download_center WHERE id = ?', [id]);
    if (items.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    const currentStatus = items[0].status;
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    // If activating this version, deactivate all other active versions
    if (newStatus === 'active') {
      await db.execute(`
        UPDATE download_center 
        SET status = 'inactive' 
        WHERE file_type = 'apk' AND status = 'active' AND id != ?
      `, [id]);
    }
    
    // Update the status
    await db.execute(`
      UPDATE download_center 
      SET status = ?, updated_by = ?, updated_at = NOW()
      WHERE id = ?
    `, [newStatus, req.session.user.user_id || req.session.user.id, id]);
    
    res.status(200).json({ 
      success: true,
      message: `Status changed to ${newStatus} successfully`,
      status: newStatus
    });
  } catch (error) {
    console.error('Error toggling status:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
};

// Download file (only active versions can be downloaded)
export const downloadFile = async (req, res) => {
  const { id } = req.params;
  
  try {
    const [items] = await db.execute('SELECT * FROM download_center WHERE id = ?', [id]);
    if (items.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    const item = items[0];
    const filePath = path.join(__dirname, '..', item.file_path);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on server' });
    }
    
    // Increment download count
    await db.execute('UPDATE download_center SET download_count = download_count + 1 WHERE id = ?', [id]);
    
    res.download(filePath, item.file_name);
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
};

// Download latest active APK
export const downloadLatestApk = async (req, res) => {
  try {
    const [items] = await db.execute(`
      SELECT * FROM download_center 
      WHERE file_type = 'apk' AND status = 'active' 
      ORDER BY created_at DESC 
      LIMIT 1
    `);
    
    if (items.length === 0) {
      return res.status(404).json({ error: 'No active APK version found' });
    }
    
    const item = items[0];
    const filePath = path.join(__dirname, '..', item.file_path);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'APK file not found on server' });
    }
    
    await db.execute('UPDATE download_center SET download_count = download_count + 1 WHERE id = ?', [item.id]);
    
    res.download(filePath, `AVCoreApp_${item.version}.apk`);
  } catch (error) {
    console.error('Error downloading APK:', error);
    res.status(500).json({ error: 'Failed to download APK' });
  }
};