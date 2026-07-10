// controllers/avCoreDocumentController.js
import db from '../database/db.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directories exist
const ensureDirectories = () => {
  const uploadDir = path.join(process.cwd(), 'uploads', 'av_core');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  return uploadDir;
};

// Get all AV Core documents with pagination and status filter
export const getAVCoreDocuments = async (req, res) => {
  try {
    console.log('=== getAVCoreDocuments called ===');
    console.log('Query params:', req.query);
    console.log('URL:', req.originalUrl);
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const status = req.query.status || 'all';

    let statusCondition = '';
    let queryParams = [];

    if (status !== 'all') {
      statusCondition = 'WHERE acd.status = ?';
      queryParams.push(status);
    }

    // Get total count
    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM av_core_documents acd ${statusCondition}`,
      queryParams
    );
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    // Get paginated data
    const [documents] = await db.query(`
      SELECT 
        acd.id,
        acd.file_name,
        acd.file_path,
        acd.file_type,
        acd.file_size,
        acd.remark,
        acd.uploaded_by,
        acd.created_at,
        acd.status,
        u.name as uploaded_by_name,
        u.role as uploaded_by_role
      FROM av_core_documents acd
      LEFT JOIN users u ON acd.uploaded_by = u.user_id
      ${statusCondition}
      ORDER BY acd.created_at DESC
      LIMIT ? OFFSET ?
    `, [...queryParams, limit, offset]);

    console.log(`Found ${documents.length} documents`);

    // Get base URL
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    // Process file paths to full URLs
    const processedDocs = documents.map(doc => {
      let filePath = doc.file_path || '';
      filePath = filePath.replace(/\\/g, '/');
      
      if (!filePath.startsWith('uploads/') && !filePath.startsWith('/uploads/')) {
        filePath = `uploads/${filePath}`;
      }
      
      const fullUrl = `${baseUrl}/${filePath}`;
      
      return {
        ...doc,
        file_url: fullUrl,
        preview_url: doc.file_type === 'image' ? fullUrl : null,
        file_size: doc.file_size || 0,
        status: doc.status || 'active',
        remark: doc.remark || null
      };
    });

    res.json({
      success: true,
      documents: processedDocs,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalItems: total,
        itemsPerPage: limit
      }
    });
    
  } catch (error) {
    console.error('Error fetching AV Core documents:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch documents',
      error: error.message
    });
  }
};

// Upload AV Core document with status
export const uploadAVCoreDocument = async (req, res) => {
  try {
    console.log('=== uploadAVCoreDocument called ===');
    const { remark, status } = req.body;
    const userId = req.session?.user?.id;

    console.log('User ID from session:', userId);
    console.log('Request body:', req.body);
    console.log('Files:', req.files);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    if (!req.files || !req.files.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const file = req.files.file;
    const originalName = file.name;
    const fileExtension = path.extname(originalName).toLowerCase();
    const fileType = file.mimetype.startsWith('image/') ? 'image' : 'document';
    
    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const safeName = `av_core_${timestamp}_${randomStr}${fileExtension}`;
    const uploadDir = ensureDirectories();
    const savePath = path.join(uploadDir, safeName);
    
    console.log('Saving file to:', savePath);
    
    // Move file
    await file.mv(savePath);
    
    const dbPath = `uploads/av_core/${safeName}`;
    const documentStatus = status || 'active';
    
    // Insert into database
    const [result] = await db.query(
      `INSERT INTO av_core_documents 
       (file_name, file_path, file_type, file_size, remark, uploaded_by, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [originalName, dbPath, fileType, file.size, remark || null, userId, documentStatus]
    );

    console.log('Document inserted with ID:', result.insertId);

    // Get the inserted document with user details
    const [newDoc] = await db.query(`
      SELECT 
        acd.id,
        acd.file_name,
        acd.file_path,
        acd.file_type,
        acd.file_size,
        acd.remark,
        acd.uploaded_by,
        acd.created_at,
        acd.status,
        u.name as uploaded_by_name,
        u.role as uploaded_by_role
      FROM av_core_documents acd
      LEFT JOIN users u ON acd.uploaded_by = u.user_id
      WHERE acd.id = ?
    `, [result.insertId]);

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    let filePath = newDoc[0].file_path.replace(/\\/g, '/');
    if (!filePath.startsWith('uploads/')) {
      filePath = `uploads/${filePath}`;
    }
    const fullUrl = `${baseUrl}/${filePath}`;

    res.json({
      success: true,
      message: 'Document uploaded successfully',
      document: {
        ...newDoc[0],
        file_url: fullUrl,
        preview_url: fileType === 'image' ? fullUrl : null,
        status: documentStatus
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload document',
      error: error.message
    });
  }
};

// Update document status
export const updateDocumentStatus = async (req, res) => {
  try {
    console.log('=== updateDocumentStatus called ===');
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.session?.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    await db.query(
      'UPDATE av_core_documents SET status = ? WHERE id = ?',
      [status, id]
    );

    res.json({
      success: true,
      message: 'Status updated successfully'
    });
  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update status'
    });
  }
};

// Delete AV Core document
export const deleteAVCoreDocument = async (req, res) => {
  try {
    console.log('=== deleteAVCoreDocument called ===');
    const { id } = req.params;
    const userId = req.session?.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Get file path first
    const [doc] = await db.query(
      'SELECT file_path FROM av_core_documents WHERE id = ?',
      [id]
    );

    if (doc.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Delete file from disk
    const filePath = path.join(process.cwd(), doc[0].file_path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('File deleted:', filePath);
    }

    // Delete from database
    await db.query('DELETE FROM av_core_documents WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete document'
    });
  }
};