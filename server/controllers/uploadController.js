import db from '../database/db.js';
import { BASE_URL } from '../../public/config.js';

// import { BASE_URL } from '../public/config.js';  // for webmiles 



// Controller function
export const saveDocumentController = async (req, res) => {
  try {
    const user = req.session.user;

    if (!user) {
      return res
        .status(401)
        .json({ message: 'Unauthorized: User not logged in' });
    }

    const { product_id, content, upload_status } = req.body;
    const status = upload_status || 'Active';

    if (!product_id) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const uploadedUrls = [];

    for (const file of req.files) {
      const docFile = file.filename;

      await saveDocument({
        product_id,
        user_id: user.id,
        document_file: docFile,
        content,
        upload_status: status,
        upload_date: new Date(),
      });

      uploadedUrls.push(`${BASE_URL}uploads/documents/${docFile}`);
    }

    res.status(200).json({
      message: 'Documents uploaded successfully',
      uploadedFiles: uploadedUrls,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      message: 'Internal server error during document upload',
      error: error.message,
    });
  }
};

// Service function (shared by controller)
export const saveDocument = async ({
  product_id,
  user_id,
  document_file,
  content,
  upload_status,
  upload_date,
}) => {
  const query = `
    INSERT INTO document_upload (product_id, user_id, document_file, content, upload_status, upload_date)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const safeContent = content !== undefined ? content : null;
  return db.execute(query, [
    product_id,
    user_id,
    document_file,
    safeContent,
    upload_status,
    upload_date,
  ]);
};


// controller
export const getDocumentsByProductId = async (req, res) => {
  try {
    const { product_id } = req.params;
    const [rows] = await db.execute(
      'SELECT * FROM document_upload WHERE product_id = ? ORDER BY upload_date DESC',
      [product_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch documents', error: err.message });
  }
};
