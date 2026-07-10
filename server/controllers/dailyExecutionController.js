import db from "../database/db.js";
import path from "path";
import fs from "fs";

/* =====================================================
   GET DAILY EXECUTION PROCESSES (ONLY ASSIGNED USER)
===================================================== */

export const getDailyExecutionProcesses1 = async (req, res) => {
  try {
    const user = req.session.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const userId = user.id;

    const [rows] = await db.query(
      `
      SELECT 
        epum.lead_id,
        rd.name AS lead_name,

        epum.process_id,
        pe.process_name,
        pe.description,

        epl.id AS execution_id,

        epl.start_date,
        epl.end_date,
        epl.status,
        epl.remark,
        epl.assigned_to

      FROM execution_process_user_map epum

      JOIN process_execution pe
        ON pe.process_id = epum.process_id

      LEFT JOIN execution_process_logs epl
        ON epl.process_id = epum.process_id
       AND epl.lead_id = epum.lead_id

      LEFT JOIN raw_data rd
        ON rd.master_id = epum.lead_id

      WHERE epum.user_id = ?

      ORDER BY epum.lead_id ASC, pe.process_name ASC
      `,
      [userId]
    );

    res.json({
      success: true,
      data: rows,
    });

  } catch (error) {
    console.error("DailyExecution error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}; 

export const getDailyExecutionProcesses2 = async (req, res) => {
  try {
    const user = req.session.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const userId = user.id;

    // ✅ Admin + Project Manager can see all processes
    const canSeeAll =
      user.role === "admin" ||
      user.role === "project_manager";

    let query = `
      SELECT 
        epum.lead_id,
        rd.name AS lead_name,

        epum.process_id,
        pe.process_name,
        pe.description,

        epl.id AS execution_id,

        epl.start_date,
        epl.end_date,
        epl.status,
        epl.remark,
        epl.assigned_to

      FROM execution_process_user_map epum

      JOIN process_execution pe
        ON pe.process_id = epum.process_id

      LEFT JOIN execution_process_logs epl
        ON epl.process_id = epum.process_id
       AND epl.lead_id = epum.lead_id

      LEFT JOIN raw_data rd
        ON rd.master_id = epum.lead_id
    `;

    let queryParams = [];

    // ✅ Only normal users see their own processes
    if (!canSeeAll) {
      query += ` WHERE epum.user_id = ?`;
      queryParams.push(userId);
    }

    query += ` ORDER BY epum.lead_id ASC, pe.process_name ASC`;

    const [rows] = await db.query(query, queryParams);

    res.json({
      success: true,
      data: rows,
    });

  } catch (error) {
    console.error("DailyExecution error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};



export const getDailyExecutionProcesses3 = async (req, res) => {
  try {
    const user = req.session.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const userId = user.id;

    // ✅ Admin + Project Manager can see all processes
    const canSeeAll =
      user.role === "admin" ||
      user.role === "project_manager";

    let query = `
      SELECT 
        epum.lead_id,

        -- ✅ Raw Data Details
        rd.master_id,
        rd.name AS lead_name,
        rd.number,

        -- ✅ Show area_name if available else city
        CASE
          WHEN rd.area_id IS NOT NULL
               AND rd.area_id != ''
               AND a.area_name IS NOT NULL
          THEN a.area_name
          ELSE rd.city
        END AS city,

        -- ✅ Location Link from documents table
        d.location_link,

        rd.ar_number,
        rd.architect_name,
        rd.ca_number,
        rd.e_number,
        rd.sm_number,
        rd.pop_number,
        rd.other_number,

        -- ✅ Area Details
        rd.area_id,
        a.area_name,

        -- ✅ Process Details
        epum.process_id,
        pe.process_name,
        pe.description,

        -- ✅ Execution Log Details
        epl.id AS execution_id,
        epl.type_id,

        -- ✅ Execution Type Details
        et.type_name,
        et.completion_percentage,

        epl.start_date,
        epl.end_date,
        epl.status,
        epl.remark,
        epl.assigned_to,

        -- ✅ Manager Approval Details
        ed.manager_status,
        ed.manager_remark

      FROM execution_process_user_map epum

      JOIN process_execution pe
        ON pe.process_id = epum.process_id

      LEFT JOIN execution_process_logs epl
        ON epl.process_id = epum.process_id
       AND epl.lead_id = epum.lead_id

      -- ✅ Fetch execution type
      LEFT JOIN execution_type et
        ON et.type_id = epl.type_id

      -- ✅ Manager fields table
      LEFT JOIN execution_documents ed
        ON ed.process_id = epum.process_id
       AND ed.lead_id = epum.lead_id

      -- ✅ Raw Data
      LEFT JOIN raw_data rd
        ON rd.master_id = epum.lead_id

      -- ✅ Area Table
      LEFT JOIN area a
        ON a.area_id = rd.area_id

      -- ✅ Documents Table for location link
      LEFT JOIN documents d
        ON d.master_id = rd.master_id
    `;

    let queryParams = [];

    // ✅ Only normal users see their own processes
    if (!canSeeAll) {
      query += ` WHERE epum.user_id = ?`;
      queryParams.push(userId);
    }

    query += ` ORDER BY epum.lead_id ASC, pe.process_name ASC`;

    const [rows] = await db.query(query, queryParams);

    res.json({
      success: true,
      total: rows.length,
      data: rows,
    });

  } catch (error) {
    console.error("DailyExecution error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const getDailyExecutionProcesses = async (req, res) => {
  try {
    const user = req.session.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const userId = user.id;

    // ✅ Admin + Project Manager can see all processes
    const canSeeAll =
      user.role === "admin" ||
      user.role === "project_manager";

    let query = `
      SELECT 
        epum.lead_id,

        -- ✅ Raw Data Details
        rd.master_id,
        rd.name AS lead_name,
        rd.number,

        -- ✅ Show area_name if available else city
        CASE
          WHEN rd.area_id IS NOT NULL
               AND rd.area_id != ''
               AND a.area_name IS NOT NULL
          THEN a.area_name
          ELSE rd.city
        END AS city,

        -- ✅ Location Link from documents table
        d.location_link,

        rd.ar_number,
        rd.architect_name,
        rd.ca_number,
        rd.e_number,
        rd.sm_number,
        rd.pop_number,
        rd.other_number,

        -- ✅ Area Details
        rd.area_id,
        a.area_name,

        -- ✅ Process Details
        epum.process_id,
        pe.process_name,
        pe.description,

        -- ✅ Execution Log Details
        epl.id AS execution_id,
        epl.type_id,

        -- ✅ Execution Type Details
        et.type_name,
        et.completion_percentage,

        epl.start_date,
        epl.end_date,
        epl.status,
        epl.remark,
        epl.assigned_to,

        -- ✅ Manager Approval Details - Use a subquery to get the latest document
        (
          SELECT ed.manager_status 
          FROM execution_documents ed 
          WHERE ed.process_id = epum.process_id 
            AND ed.lead_id = epum.lead_id 
          ORDER BY ed.created_at DESC 
          LIMIT 1
        ) AS manager_status,
        
        (
          SELECT ed.manager_remark 
          FROM execution_documents ed 
          WHERE ed.process_id = epum.process_id 
            AND ed.lead_id = epum.lead_id 
          ORDER BY ed.created_at DESC 
          LIMIT 1
        ) AS manager_remark

      FROM execution_process_user_map epum

      JOIN process_execution pe
        ON pe.process_id = epum.process_id

      LEFT JOIN execution_process_logs epl
        ON epl.process_id = epum.process_id
       AND epl.lead_id = epum.lead_id

      -- ✅ Fetch execution type
      LEFT JOIN execution_type et
        ON et.type_id = epl.type_id

      -- ✅ Raw Data
      LEFT JOIN raw_data rd
        ON rd.master_id = epum.lead_id

      -- ✅ Area Table
      LEFT JOIN area a
        ON a.area_id = rd.area_id

      -- ✅ Documents Table for location link
      LEFT JOIN documents d
        ON d.master_id = rd.master_id
    `;

    let queryParams = [];

    // ✅ Only normal users see their own processes
    if (!canSeeAll) {
      query += ` WHERE epum.user_id = ?`;
      queryParams.push(userId);
    }

    query += ` GROUP BY epum.lead_id, epum.process_id, epl.id`;
    query += ` ORDER BY epum.lead_id ASC, pe.process_name ASC`;

    const [rows] = await db.query(query, queryParams);

    res.json({
      success: true,
      total: rows.length,
      data: rows,
    });

  } catch (error) {
    console.error("DailyExecution error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};





export const uploadExecutionDocuments1 = async (req, res) => {
  try {
    const { execution_id, process_id } = req.params;
    const { lead_id, remark } = req.body;
    const user = req.session.user;
    
    // DEBUGGING: Log session info
    console.log("========== UPLOAD DEBUG ==========");
    console.log("1. Full session object:", req.session);
    console.log("2. Session user:", user);
    console.log("3. User ID:", user?.id);
    console.log("4. Session ID:", req.sessionID);
    console.log("5. Cookies:", req.headers.cookie);
    console.log("==================================");

    if (!execution_id || !process_id || !lead_id) {
      return res.status(400).json({
        success: false,
        message: "execution_id, process_id, lead_id required"
      });
    }

    if (!req.files || !req.files.files) {
      return res.status(400).json({
        success: false,
        message: "No files uploaded"
      });
    }

    const filesArray = Array.isArray(req.files.files)
      ? req.files.files
      : [req.files.files];

    const values = [];
    const uploaded = [];

    for (const file of filesArray) {
      const original = file.name;

      const fileType = file.mimetype.startsWith("image/")
        ? "image"
        : file.mimetype.startsWith("video/")
        ? "video"
        : "document";

      const safeName = `${execution_id}_${process_id}_${Date.now()}_${original.replace(/\s+/g, "_")}`;

      const uploadDir = path.join("uploads", "execution", fileType);
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

      const savePath = path.join(uploadDir, safeName);
      await file.mv(savePath);

      const dbPath = `execution/${fileType}/${safeName}`;

      // DEBUG: Log what we're inserting
      console.log(`Inserting file ${original} with uploaded_by:`, user?.id || null);

      values.push([
        execution_id,
        lead_id,
        process_id,
        dbPath,
        fileType,
        remark || null,
        'pending', // default manager_status
        null,      // manager_remark
        user?.id || null  // uploaded_by
      ]);

      uploaded.push({
        execution_id,
        lead_id,
        process_id,
        file_path: dbPath
      });
    }

    if (values.length) {
      console.log("6. Inserting values:", values);
      const [result] = await db.query(
        `INSERT INTO execution_documents
         (execution_id, lead_id, process_id, file_path, file_type, remark, manager_status, manager_remark, uploaded_by)
         VALUES ?`,
        [values]
      );
      console.log("7. Insert result:", result);
    }

    res.json({
      success: true,
      uploaded
    });

  } catch (err) {
    console.error("EXECUTION UPLOAD ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Upload failed"
    });
  }
};

export const uploadExecutionDocuments = async (req, res) => {
  try {
    const { execution_id, process_id } = req.params;
    const { lead_id, remark, start_date, start_time, end_time } = req.body;
    const user = req.session.user;

    console.log("========== UPLOAD DEBUG ==========");
    console.log("User:", user);
    console.log("Body:", req.body);
    console.log("==================================");

    if (!execution_id || !process_id || !lead_id) {
      return res.status(400).json({
        success: false,
        message: "execution_id, process_id, lead_id required"
      });
    }

    if (!req.files || !req.files.files) {
      return res.status(400).json({
        success: false,
        message: "No files uploaded"
      });
    }

    const filesArray = Array.isArray(req.files.files)
      ? req.files.files
      : [req.files.files];

    const values = [];
    const uploaded = [];

    for (const file of filesArray) {
      const original = file.name;

      const fileType = file.mimetype.startsWith("image/")
        ? "image"
        : file.mimetype.startsWith("video/")
        ? "video"
        : "document";

      const safeName = `${execution_id}_${process_id}_${Date.now()}_${original.replace(/\s+/g, "_")}`;

      const uploadDir = path.join("uploads", "execution", fileType);
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

      const savePath = path.join(uploadDir, safeName);
      await file.mv(savePath);

      const dbPath = `execution/${fileType}/${safeName}`;

      values.push([
        execution_id,
        lead_id,
        process_id,
        dbPath,
        fileType,
        remark || null,
        'pending',
        null,
        user?.id || null,
        start_date || null,
        start_time || null,
        end_time || null
      ]);

      uploaded.push({
        execution_id,
        lead_id,
        process_id,
        file_path: dbPath
      });
    }

    if (values.length) {
      await db.query(
        `INSERT INTO execution_documents
        (execution_id, lead_id, process_id, file_path, file_type, remark, manager_status, manager_remark, uploaded_by, start_date, start_time, end_time)
        VALUES ?`,
        [values]
      );
    }

    res.json({
      success: true,
      uploaded
    });

  } catch (err) {
    console.error("EXECUTION UPLOAD ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Upload failed"
    });
  }
};

export const getExecutionDocuments = async (req, res) => {
  try {
    const { execution_id, process_id } = req.params;

    // Check if uploaded_by column exists
    const [columns] = await db.query(
      `SHOW COLUMNS FROM execution_documents WHERE Field = 'uploaded_by'`
    );

    let query;
    if (columns.length > 0) {
      // If uploaded_by column exists, join with users table
      query = `
        SELECT ed.*, u.name as uploaded_by_name
        FROM execution_documents ed
        LEFT JOIN users u ON u.user_id = ed.uploaded_by
        WHERE ed.execution_id = ?
          AND ed.process_id = ?
        ORDER BY ed.created_at DESC
      `;
    } else {
      // If uploaded_by column doesn't exist, just select from execution_documents
      query = `
        SELECT ed.*, NULL as uploaded_by_name
        FROM execution_documents ed
        WHERE ed.execution_id = ?
          AND ed.process_id = ?
        ORDER BY ed.created_at DESC
      `;
    }

    const [rows] = await db.query(query, [execution_id, process_id]);

    res.json({
      success: true,
      data: rows
    });

  } catch (err) {
    console.error("GET EXEC DOC ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch documents",
      error: err.message
    });
  }
};


export const updateDocumentManagerStatus1 = async (req, res) => {
  try {
    const { document_id } = req.params;
    const { manager_status, manager_remark } = req.body;
    const user = req.session.user;

    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Unauthorized - Admin access required"
      });
    }

    await db.query(
      `UPDATE execution_documents 
       SET manager_status = ?, manager_remark = ?
       WHERE id = ?`,
      [manager_status, manager_remark, document_id]
    );

    res.json({
      success: true,
      message: "Document status updated successfully"
    });

  } catch (err) {
    console.error("UPDATE DOCUMENT STATUS ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update document status"
    });
  }
};


export const updateDocumentManagerStatus2 = async (req, res) => {
  try {
    const { document_id } = req.params;
    const { manager_status, manager_remark } = req.body;
    const user = req.session.user;

    // ✅ Allow admin + manager + project_manager
    if (
      user.role !== 'admin' &&
      user.role !== 'project_manager' &&
      user.role !== 'manager'
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized - Access denied"
      });
    }

    await db.query(
      `UPDATE execution_documents 
       SET manager_status = ?, manager_remark = ?
       WHERE id = ?`,
      [manager_status, manager_remark, document_id]
    );

    res.json({
      success: true,
      message: "Document status updated successfully"
    });

  } catch (err) {
    console.error("UPDATE DOCUMENT STATUS ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update document status"
    });
  }
};


export const updateDocumentManagerStatus3 = async (req, res) => {
  try {

    const { document_id } = req.params;

    const {
      manager_status,
      manager_remark
    } = req.body;

    const user = req.session.user;

    // ============================================
    // ROLE CHECK
    // ============================================

    if (
      user.role !== "admin" &&
      user.role !== "project_manager" &&
      user.role !== "manager"
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized - Access denied"
      });
    }

    // ============================================
    // UPDATE DOCUMENT STATUS
    // ============================================

    await db.query(
      `
      UPDATE execution_documents
      SET
        manager_status = ?,
        manager_remark = ?
      WHERE id = ?
      `,
      [
        manager_status,
        manager_remark,
        document_id
      ]
    );

    // ============================================
    // GET DOCUMENT DETAILS
    // ============================================

    const [documentRows] = await db.query(
      `
      SELECT
        execution_id,
        process_id,
        lead_id
      FROM execution_documents
      WHERE id = ?
      `,
      [document_id]
    );

    if (documentRows.length > 0) {

      const {
        execution_id,
        process_id,
        lead_id
      } = documentRows[0];

      // ============================================
      // GET TYPE ID
      // ============================================

      const [typeRows] = await db.query(
        `
        SELECT type_id
        FROM process_type_mapping
        WHERE process_id = ?
        `,
        [process_id]
      );

      if (typeRows.length > 0) {

        const type_id = typeRows[0].type_id;

        // ============================================
        // CHECK IF CURRENT PROCESS FULLY APPROVED
        // ============================================

        const [pendingDocs] = await db.query(
          `
          SELECT id
          FROM execution_documents
          WHERE
            execution_id = ?
            AND process_id = ?
            AND lead_id = ?
            AND manager_status != 'approved'
          `,
          [
            execution_id,
            process_id,
            lead_id
          ]
        );

        // ============================================
        // IF ALL DOCS APPROVED
        // MARK PROCESS COMPLETED
        // ============================================

        if (pendingDocs.length === 0) {

          await db.query(
            `
            UPDATE execution_process_logs
            SET
              process_completion_status = 'completed',
              type_id = ?
            WHERE id = ?
            `,
            [
              type_id,
              execution_id
            ]
          );

          // ============================================
          // NOW CHECK STAGE COMPLETION
          // ============================================

          // TOTAL PROCESS UNDER TYPE
          const [totalProcessRows] = await db.query(
            `
            SELECT COUNT(*) AS total_process
            FROM process_type_mapping
            WHERE type_id = ?
            `,
            [type_id]
          );

          const totalProcess =
            totalProcessRows[0].total_process;

          // COMPLETED PROCESS
          const [completedProcessRows] = await db.query(
            `
            SELECT COUNT(DISTINCT process_id)
            AS completed_process

            FROM execution_process_logs

            WHERE
              lead_id = ?
              AND type_id = ?
              AND process_completion_status = 'completed'
            `,
            [
              lead_id,
              type_id
            ]
          );

          const completedProcess =
            completedProcessRows[0]
              .completed_process;

          // ============================================
          // STAGE COMPLETED
          // ============================================

          if (
            totalProcess === completedProcess
          ) {

            console.log(
              `Stage ${type_id} completed for lead ${lead_id}`
            );

          }
        }
      }
    }

    // ============================================
    // SUCCESS RESPONSE
    // ============================================

    res.json({
      success: true,
      message:
        "Document status updated successfully"
    });

  } catch (err) {

    console.error(
      "UPDATE DOCUMENT STATUS ERROR:",
      err
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to update document status"
    });
  }
};

export const updateDocumentManagerStatus = async (req, res) => {
  try {

    const { document_id } = req.params;

    const {
      manager_status,
      manager_remark
    } = req.body;

    const user = req.session.user;

    // ============================================
    // ROLE CHECK
    // ============================================

    if (
      user.role !== "admin" &&
      user.role !== "project_manager" &&
      user.role !== "manager"
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized - Access denied"
      });
    }

    // ============================================
    // UPDATE DOCUMENT STATUS
    // ============================================

    await db.query(
      `
      UPDATE execution_documents
      SET
        manager_status = ?,
        manager_remark = ?
      WHERE id = ?
      `,
      [
        manager_status,
        manager_remark,
        document_id
      ]
    );

    // ============================================
    // SUCCESS RESPONSE
    // ============================================

    res.json({
      success: true,
      message:
        "Document status updated successfully"
    });

  } catch (err) {

    console.error(
      "UPDATE DOCUMENT STATUS ERROR:",
      err
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to update document status"
    });
  }
};


/* =====================================================
   DELETE EXECUTION DOCUMENT (ADMIN ONLY)
===================================================== */
export const deleteExecutionDocument = async (req, res) => {
  try {
    const { document_id } = req.params;
    const user = req.session.user;

    // Check if user is admin
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Unauthorized - Admin access required"
      });
    }

    // First get the document details to get the file path
    const [documentRows] = await db.query(
      `SELECT file_path FROM execution_documents WHERE id = ?`,
      [document_id]
    );

    if (documentRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Document not found"
      });
    }

    const filePath = documentRows[0].file_path;
    
    // Delete the file from filesystem
    if (filePath) {
      const fullPath = path.join("uploads", filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        console.log(`Deleted file: ${fullPath}`);
      }
    }

    // Delete the database record
    const [result] = await db.query(
      `DELETE FROM execution_documents WHERE id = ?`,
      [document_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Document not found in database"
      });
    }

    res.json({
      success: true,
      message: "Document deleted successfully"
    });

  } catch (err) {
    console.error("DELETE DOCUMENT ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to delete document",
      error: err.message
    });
  }
};


/* =====================================================
   UPDATE EXECUTION DOCUMENT/IMAGE (ADMIN ONLY)
===================================================== */
export const updateExecutionDocument = async (req, res) => {
  try {
    const { document_id } = req.params;
    const { remark } = req.body;
    const user = req.session.user;

    // Check if user is admin
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Unauthorized - Admin access required"
      });
    }

    // First get the existing document details
    const [existingDocs] = await db.query(
      `SELECT * FROM execution_documents WHERE id = ?`,
      [document_id]
    );

    if (existingDocs.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Document not found"
      });
    }

    const existingDoc = existingDocs[0];
    let newFilePath = existingDoc.file_path;
    let fileType = existingDoc.file_type;

    // If new file is uploaded, replace the old one
    if (req.files && req.files.file) {
      const file = req.files.file;
      
      // Delete old file from filesystem
      if (existingDoc.file_path) {
        const oldFilePath = path.join("uploads", existingDoc.file_path);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
          console.log(`Deleted old file: ${oldFilePath}`);
        }
      }

      // Determine file type
      fileType = file.mimetype.startsWith("image/")
        ? "image"
        : file.mimetype.startsWith("video/")
        ? "video"
        : "document";

      // Generate new filename
      const original = file.name;
      const execution_id = existingDoc.execution_id;
      const process_id = existingDoc.process_id;
      const safeName = `${execution_id}_${process_id}_${Date.now()}_${original.replace(/\s+/g, "_")}`;

      // Create directory if it doesn't exist
      const uploadDir = path.join("uploads", "execution", fileType);
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

      // Save new file
      const savePath = path.join(uploadDir, safeName);
      await file.mv(savePath);

      // Update file path for database
      newFilePath = `execution/${fileType}/${safeName}`;
    }

    // Build update query dynamically based on what's being updated
    let updateFields = [];
    let queryParams = [];

    if (newFilePath !== existingDoc.file_path) {
      updateFields.push("file_path = ?");
      queryParams.push(newFilePath);
    }

    if (fileType !== existingDoc.file_type) {
      updateFields.push("file_type = ?");
      queryParams.push(fileType);
    }

    if (remark !== undefined && remark !== existingDoc.remark) {
      updateFields.push("remark = ?");
      queryParams.push(remark || null);
    }

    // Always update the updated_at timestamp
    updateFields.push("updated_at = NOW()");

    if (updateFields.length === 0) {
      return res.json({
        success: true,
        message: "No changes detected",
        data: existingDoc
      });
    }

    // Execute update query
    const query = `UPDATE execution_documents SET ${updateFields.join(', ')} WHERE id = ?`;
    queryParams.push(document_id);

    await db.query(query, queryParams);

    // Fetch the updated document
    const [updatedDocs] = await db.query(
      `SELECT ed.*, u.name as updated_by_name
       FROM execution_documents ed
       LEFT JOIN users u ON u.user_id = ed.uploaded_by
       WHERE ed.id = ?`,
      [document_id]
    );

    res.json({
      success: true,
      message: "Document updated successfully",
      data: updatedDocs[0]
    });

  } catch (err) {
    console.error("UPDATE DOCUMENT ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update document",
      error: err.message
    });
  }
};

/* =====================================================
   GET ALL DOCUMENT UPLOADS WITH MANAGER DETAILS
   Columns: created_at, client name, city, process name,
            updated by, manager remark, manager status,
            action (edit icon - non-functional)
===================================================== */

export const getManagerDocumentDashboard = async (req, res) => {
  try {
    const user = req.session.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Check if user is admin or manager
    const allowedRoles = ['admin', 'sub_admin', 'technical_head', 'manager' , 'av_engineer' , 'acoustic_engineer' , 'acoustic_designer','carpenter',];
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin/Manager only.",
      });
    }

    /* ================= PAGINATION PARAMETERS ================= */
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    /* ================= SEARCH/FILTER PARAMETERS ================= */
    const searchTerm = req.query.search || '';
    const statusFilter = req.query.status || '';
    const clientFilter = req.query.client || '';

    /* ================= BUILD WHERE CLAUSE ================= */
    let whereConditions = [];
    let queryParams = [];

    // Add filters if provided
    if (searchTerm) {
      whereConditions.push(`(rd.name LIKE ? OR pe.process_name LIKE ? OR u.name LIKE ?)`);
      const searchPattern = `%${searchTerm}%`;
      queryParams.push(searchPattern, searchPattern, searchPattern);
    }

    if (statusFilter) {
      whereConditions.push(`ed.manager_status = ?`);
      queryParams.push(statusFilter);
    }

    if (clientFilter) {
      whereConditions.push(`rd.name LIKE ?`);
      queryParams.push(`%${clientFilter}%`);
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : 'WHERE 1=1';

    /* ================= TOTAL COUNT QUERY ================= */
    const countQuery = `
      SELECT COUNT(DISTINCT ed.id) as total
      FROM execution_documents ed
      LEFT JOIN raw_data rd ON rd.master_id = ed.lead_id
      LEFT JOIN process_execution pe ON pe.process_id = ed.process_id
      LEFT JOIN users u ON u.user_id = ed.uploaded_by
      ${whereClause}
    `;

    const [countResult] = await db.query(countQuery, queryParams);
    const total = countResult[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    /* ================= MAIN DATA QUERY ================= */
    const mainQuery = `
      SELECT 
        ed.id,
        ed.created_at,
        ed.manager_status,
        ed.manager_remark,
        ed.file_path,
        ed.file_type,
        ed.remark as user_remark,
        
        rd.master_id as lead_id,
        rd.name as client_name,
        rd.city,
        
        pe.process_id,
        pe.process_name,
        
        u.user_id as updated_by_id,
        u.name as updated_by_name,
        u.role as updated_by_role

      FROM execution_documents ed
      LEFT JOIN raw_data rd ON rd.master_id = ed.lead_id
      LEFT JOIN process_execution pe ON pe.process_id = ed.process_id
      LEFT JOIN users u ON u.user_id = ed.uploaded_by
      ${whereClause}
      ORDER BY ed.created_at DESC
      LIMIT ? OFFSET ?
    `;

    // Add pagination parameters
    const dataParams = [...queryParams, limit, offset];
    const [rows] = await db.query(mainQuery, dataParams);

    /* ================= FORMAT RESPONSE ================= */
    const formattedRows = rows.map(row => ({
      id: row.id,
      created_at: row.created_at,
      client_name: row.client_name || 'Unknown Client',
      city: row.city || 'N/A',
      process_name: row.process_name || 'Unknown Process',
      updated_by: row.updated_by_name || 'System',
      updated_by_role: row.updated_by_role || '',
      manager_remark: row.manager_remark || '',
      manager_status: row.manager_status || 'pending',
      file_path: row.file_path,
      file_type: row.file_type,
      user_remark: row.user_remark || '',
      // Just for display - non-functional edit button
      has_edit_action: true
    }));

    res.json({
      success: true,
      data: formattedRows,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        showingStart: offset + 1,
        showingEnd: Math.min(offset + limit, total)
      }
    });

  } catch (error) {
    console.error("❌ Error in getManagerDocumentDashboard:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch document dashboard data",
      error: error.message
    });
  }
};

/* =====================================================
   GET SINGLE DOCUMENT DETAILS (Optional - for view)
===================================================== */

export const getDocumentDetails = async (req, res) => {
  try {
    const { document_id } = req.params;

    const [rows] = await db.query(
      `
      SELECT 
        ed.*,
        rd.name as client_name,
        rd.city,
        rd.number as client_number,
        rd.email as client_email,
        pe.process_name,
        u.name as uploaded_by_name,
        u.role as uploaded_by_role
      FROM execution_documents ed
      LEFT JOIN raw_data rd ON rd.master_id = ed.lead_id
      LEFT JOIN process_execution pe ON pe.process_id = ed.process_id
      LEFT JOIN users u ON u.user_id = ed.uploaded_by
      WHERE ed.id = ?
      `,
      [document_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Document not found"
      });
    }

    res.json({
      success: true,
      data: rows[0]
    });

  } catch (error) {
    console.error("❌ Error in getDocumentDetails:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch document details",
      error: error.message
    });
  }
};

export const getManagerProcessesByMasterId = async (req, res) => {
  try {
    const user = req.session.user;
    const { masterId } = req.params;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    let query = `
      SELECT 
        ed.lead_id,
        ed.process_id,
        ed.id AS document_id,
        ed.file_path,
        ed.file_type,
        ed.remark,
        ed.manager_status,
        ed.manager_remark,
        ed.uploaded_by,
        u.name AS uploaded_by_name,
        u.role AS uploaded_by_role,
        ed.created_at AS document_created_at,
        ed.start_date,
        ed.start_time,
        ed.end_time,
        pe.process_name,
        pe.description,
        rd.name AS client_name,
        rd.city,
        rd.master_id,
        rd.address,
        rd.number AS mobile,  -- Changed from rd.mobile to rd.number and aliased as mobile
        rd.email
      FROM execution_documents ed
      LEFT JOIN process_execution pe ON pe.process_id = ed.process_id
      LEFT JOIN raw_data rd ON rd.master_id = ed.lead_id
      LEFT JOIN users u ON u.user_id = ed.uploaded_by
      WHERE ed.lead_id = ?
    `;

    let queryParams = [masterId];

    // Role-based filter
    if (user.role !== 'admin' && user.role !== 'project_manager') {
      query += ` AND ed.uploaded_by = ?`;
      queryParams.push(user.id);
    }

    query += ` ORDER BY ed.created_at DESC`;

    const [rows] = await db.query(query, queryParams);

    // Get unique process names for this lead
    const processNames = [...new Set(rows.map(row => row.process_name))];

    // Get client info from first row (has all client details)
    const clientInfo = rows.length > 0 ? {
      master_id: rows[0].master_id,
      client_name: rows[0].client_name,
      city: rows[0].city,
      address: rows[0].address,
      mobile: rows[0].mobile,  // This will now work since we aliased number as mobile
      email: rows[0].email
    } : null;

    res.json({
      success: true,
      data: rows,
      clientInfo: clientInfo,
      processNames: processNames,
      totalDocuments: rows.length,
      user: {
        id: user.id,
        name: user.username,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("getManagerProcessesByMasterId error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getManagerProcesses1 = async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const [rows] = await db.query(`
      SELECT 
        ed.lead_id,
        ed.process_id,

        es.schedule_id,
        es.schedule_name,   -- ✅ added

        epum.created_at,

        rd.name AS client_name,
        rd.city,

        pe.process_name,
        pe.description,

        ed.id AS document_id,
        ed.file_path,
        ed.file_type,
        ed.remark,

        ed.manager_status,
        ed.manager_remark,

        ed.uploaded_by AS updated_by,
        u.name AS updated_by_name,

        ed.created_at AS document_created_at

      FROM execution_documents ed

      -- 🔴 schedule info
      LEFT JOIN execution_start es
        ON es.execution_id = ed.execution_id

      -- 🔴 latest epum
      LEFT JOIN (
          SELECT lead_id, process_id, MAX(created_at) AS created_at
          FROM execution_process_user_map
          GROUP BY lead_id, process_id
      ) epum
        ON epum.lead_id = ed.lead_id
       AND epum.process_id = ed.process_id

      JOIN process_execution pe
        ON pe.process_id = ed.process_id

      LEFT JOIN raw_data rd
        ON rd.master_id = ed.lead_id

      LEFT JOIN users u
        ON u.user_id = ed.uploaded_by

      ORDER BY ed.created_at DESC
    `);

    res.json({
      success: true,
      data: rows,
    });

  } catch (error) {
    console.error("ManagerProcesses error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}; 


export const getManagerProcesses2 = async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const [rows] = await db.query(`
      SELECT 
        ed.lead_id,
        ed.process_id,

        es.schedule_id,
        es.schedule_name,

        rd.name AS client_name,
        rd.city,

        pe.process_name,
        pe.description,

        ed.id AS document_id,
        ed.file_path,
        ed.file_type,
        ed.remark,

        ed.manager_status,
        ed.manager_remark,

        ed.uploaded_by AS updated_by,
        u.name AS updated_by_name,

        ed.created_at AS document_created_at

      FROM execution_documents ed

      LEFT JOIN execution_start es
        ON es.execution_id = ed.execution_id

      LEFT JOIN process_execution pe
        ON pe.process_id = ed.process_id

      LEFT JOIN raw_data rd
        ON rd.master_id = ed.lead_id

      LEFT JOIN users u
        ON u.user_id = ed.uploaded_by

      ORDER BY ed.created_at DESC
    `);

    // Add pagination info
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const start = (page - 1) * limit;
    const end = start + limit;
    
    const paginatedData = rows.slice(start, end);

    res.json({
      success: true,
      data: paginatedData,
      pagination: {
        total: rows.length,
        page,
        limit,
        totalPages: Math.ceil(rows.length / limit)
      }
    });

  } catch (error) {
    console.error("ManagerProcesses error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


export const getManagerProcesses3 = async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    console.log("User session:", user); // For debugging

    let query = `
      SELECT 
        ed.lead_id,
        ed.process_id,

        es.schedule_id,
        es.schedule_name,

        rd.name AS client_name,
        rd.city,

        pe.process_name,
        pe.description,

        ed.id AS document_id,
        ed.file_path,
        ed.file_type,
        ed.remark,

        ed.manager_status,
        ed.manager_remark,

        ed.uploaded_by AS updated_by,
        u.name AS updated_by_name,
        u.role AS updated_by_role,

        ed.created_at AS document_created_at

      FROM execution_documents ed

      LEFT JOIN execution_start es
        ON es.execution_id = ed.execution_id

      LEFT JOIN process_execution pe
        ON pe.process_id = ed.process_id

      LEFT JOIN raw_data rd
        ON rd.master_id = ed.lead_id

      LEFT JOIN users u
        ON u.user_id = ed.uploaded_by
    `;

    let queryParams = [];

    // Apply role-based filtering
    if (user.role === 'admin') {
      // Admin sees all documents
      console.log("Admin user - showing all documents");
      // No additional WHERE clause needed
    } else {
      // Non-admin users (digital_marketing, manager, etc.) see only their own uploaded documents
      console.log(`Non-admin user (${user.role}) - showing only their documents`);
      query += ` WHERE ed.uploaded_by = ?`;
      queryParams.push(user.id);
    }

    query += ` ORDER BY ed.created_at DESC`;

    const [rows] = await db.query(query, queryParams);

    // Add pagination info
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const start = (page - 1) * limit;
    const end = start + limit;
    
    const paginatedData = rows.slice(start, end);

    res.json({
      success: true,
      data: paginatedData,
      pagination: {
        total: rows.length,
        page,
        limit,
        totalPages: Math.ceil(rows.length / limit)
      },
      user: {
        id: user.id,
        name: user.username,
        role: user.role
      }
    });

  } catch (error) {
    console.error("ManagerProcesses error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getManagerProcesses = async (req, res) => {
  try {
    const user = req.session.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    let query = `
      SELECT 
        ed.lead_id,
        ed.process_id,

        es.schedule_id,
        es.schedule_name,

        rd.name AS client_name,
        rd.city,

        pe.process_name,
        pe.description,

        ed.id AS document_id,
        ed.file_path,
        ed.file_type,
        ed.remark,

        ed.manager_status,
        ed.manager_remark,

        ed.uploaded_by AS updated_by,
        u.name AS updated_by_name,
        u.role AS updated_by_role,

        ed.created_at AS document_created_at,

        -- ✅ NEW FIELDS
        ed.start_date,
        ed.start_time,
        ed.end_time

      FROM execution_documents ed

      LEFT JOIN execution_start es
        ON es.execution_id = ed.execution_id

      LEFT JOIN process_execution pe
        ON pe.process_id = ed.process_id

      LEFT JOIN raw_data rd
        ON rd.master_id = ed.lead_id

      LEFT JOIN users u
        ON u.user_id = ed.uploaded_by
    `;

    let queryParams = [];

    // Role-based filter
if (user.role !== 'admin' && user.role !== 'project_manager') {
  query += ` WHERE ed.uploaded_by = ?`;
  queryParams.push(user.id);
}

    query += ` ORDER BY ed.created_at DESC`;

    const [rows] = await db.query(query, queryParams);

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const start = (page - 1) * limit;
    const end = start + limit;

    const paginatedData = rows.slice(start, end);

    res.json({
      success: true,
      data: paginatedData,
      pagination: {
        total: rows.length,
        page,
        limit,
        totalPages: Math.ceil(rows.length / limit),
      },
      user: {
        id: user.id,
        name: user.username,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("ManagerProcesses error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
