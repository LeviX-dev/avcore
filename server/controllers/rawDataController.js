import XLSX from "xlsx";
// import {  getRawData } from "../models/rawDataModel.js";
import db from "../database/db.js";
import path from 'path';
import fs from 'fs';



// export const importRawData = async (req, res) => {
//   try {
//     if (!req.session.user) {
//       return res.status(401).json({ message: "Unauthorized. Please log in." });
//     }

//     const file = req.file;
//     if (!file) {
//       return res.status(400).json({ message: "File is required!" });
//     }

//     const created_by_user = req.session.user.id;

//     // READ EXCEL
//     const workbook = XLSX.read(file.buffer, { type: "buffer" });
//     const sheetName = workbook.SheetNames[0];
//     const excelRows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

//     if (!excelRows || excelRows.length === 0) {
//       return res.status(400).json({ message: "Excel file is empty!" });
//     }

//     // CLEAN MOBILE
//     const cleanNumber = (num) => {
//       if (!num) return "";
//       let x = String(num).replace(/\D/g, "");
//       if (x.startsWith("91") && x.length > 10) x = x.slice(2);
//       return x.slice(-10);
//     };

//     // DATE PARSER
//     const parseExcelDate = (value) => {
//       if (!value) return null;
//       if (!isNaN(value)) {
//         const d = XLSX.SSF.parse_date_code(value);
//         return new Date(d.y, d.m - 1, d.d);
//       }
//       const parsed = new Date(value);
//       return isNaN(parsed.getTime()) ? null : parsed;
//     };

//     // MAP EXCEL → DB
//     const columnMap = {
//       "Entry Date": "assign_date",
//       "FollowUp Date": "followup_date",
//       "Name": "name",
//       "Contact number": "number",
//       "City": "city",
//       "Remark": "remark",
//       "User": "assigned_to",
//       "Stage": "lead_stage"   
//     };

//     for (let excelRow of excelRows) {
//       let mapped = {};

//       Object.keys(excelRow).forEach((col) => {
//         const mappedCol = columnMap[col];
//         if (mappedCol) mapped[mappedCol] = excelRow[col];
//       });

//       if (!mapped.name || !mapped.number) continue;

//       // CLEAN NUMBER
//       const cleanedMobile = cleanNumber(mapped.number);
//       if (cleanedMobile.length !== 10) {
//         return res.status(400).json({
//           message: `Invalid mobile number '${mapped.number}'`,
//           cleaned: cleanedMobile
//         });
//       }

//       // TELECALLER VALIDATION
//       if (!mapped.assigned_to) {
//         return res.status(400).json({ message: "User (Telecaller) is required" });
//       }

//       const [userCheck] = await db.query(
//         `SELECT user_id FROM users WHERE name=? AND role='tele_caller' LIMIT 1`,
//         [mapped.assigned_to.trim()]
//       );

//       if (userCheck.length === 0) {
//         return res.status(400).json({
//           message: `Telecaller '${mapped.assigned_to}' not found or not tele_caller`
//         });
//       }

//       const assigned_to_user_id = userCheck[0].user_id;

//       // DATES
//       const assignDate = parseExcelDate(mapped.assign_date) || new Date();
//       const followDate = parseExcelDate(mapped.followup_date);

//       // INSERT INTO assignments
      
//       const [assignRes] = await db.query(
//         `INSERT INTO assignments 
//         (created_by_user, mode, assign_date, assigned_to, assigned_to_user_id, lead_count)
//         VALUES (?, ?, ?, ?, ?, ?)`,
//         [
//           created_by_user,
//           "call",
//           assignDate,
//           mapped.assigned_to,
//           assigned_to_user_id,
//           1
//         ]
//       );

//       const assign_id = assignRes.insertId;

//       // INSERT INTO raw_data

//       await db.query(
//         `INSERT INTO raw_data 
//         (name, number, city, detailed_remark, lead_stage, followup_date, status, created_by_user, assign_id)
//         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//         [
//           mapped.name,
//           cleanedMobile,
//           mapped.city || "",
//           mapped.remark || "",
//           mapped.lead_stage || "Not Available",   
//           followDate,
//           "Assigned",
//           created_by_user,
//           assign_id
//         ]
//       );
//     }

//     res.status(200).json({
//       message: "Excel imported successfully!",
//       status: "success",
//     });

//   } catch (error) {
//     console.error("❌ Import error:", error);
//     res.status(500).json({ message: "Server error while importing data." });
//   }
// };



// export const getAllRawData = async (req, res) => {
//   try {
//     const query = `
//       SELECT 
//         rd.*,
//         a.area_name,
//         c.cat_name,
//         r.reference_name
//       FROM raw_data rd
//       LEFT JOIN area a ON rd.area_id = a.area_id
//       LEFT JOIN category c ON rd.cat_id = c.cat_id
//       LEFT JOIN reference r ON rd.reference_id = r.reference_id
//       WHERE TRIM(LOWER(rd.status)) = 'not assigned'
//       ORDER BY rd.master_id ASC
//     `;

//     const [raw_data] = await db.query(query);
//     res.status(200).json(raw_data);

//   } catch (error) {
//     console.error('❌ Error fetching Master Data:', error);
//     res.status(500).json({ error: 'Failed to fetch Master Data' });
//   }
// };

// export const getAllRawData = async (req, res) => {
//   try {
//     const query = `
//       SELECT 
//         rd.master_id,
//         IFNULL(rd.name, 'Not Available') AS name,
//         IFNULL(rd.number, 'Not Available') AS number,
//         IFNULL(rd.email, 'Not Available') AS email,
//         IFNULL(rd.address, 'Not Available') AS address,
//         IFNULL(rd.city, 'Not Available') AS city,
//         IFNULL(rd.status, 'Not Available') AS status,
//         IFNULL(rd.lead_status, 'Not Available') AS lead_status,
//         IFNULL(rd.created_by_user, 'Not Available') AS created_by_user,
//         IFNULL(rd.assign_id, 'Not Available') AS assign_id,
//         IFNULL(rd.current_stage, 'Not Available') AS current_stage,

//         -- ⭐ FIXED: TAKING lead_stage FROM raw_data
//         IFNULL(rd.lead_stage, 'Not Available') AS lead_stage,

//         IFNULL(rd.followup_date, 'Not Available') AS followup_date,

//         -- ⭐ REMARK FROM RAW_DATA
//         IFNULL(rd.detailed_remark, 'Not Available') AS detailed_remark,
//         IFNULL(rd.quick_remark, 'Not Available') AS quick_remark,

//         -- NUMBERS
//         IFNULL(rd.ar_number, 'Not Available') AS ar_number,
//         IFNULL(rd.ca_number, 'Not Available') AS ca_number,
//         IFNULL(rd.e_number, 'Not Available') AS e_number,
//         IFNULL(rd.sm_number, 'Not Available') AS sm_number,
//         IFNULL(rd.pop_number, 'Not Available') AS pop_number,
//         IFNULL(rd.other_number, 'Not Available') AS other_number,

//         -- AREA
//         IFNULL(a.area_name, 'Not Available') AS area_name,

//         -- CATEGORY
//         IFNULL(c.cat_name, 'Not Available') AS cat_name,

//         -- REFERENCE
//         IFNULL(r.reference_name, 'Not Available') AS reference_name,

//         -- ASSIGNMENT DETAILS
//         IFNULL(asg.assign_date, 'Not Available') AS assign_date,
//         IFNULL(asg.target_date, 'Not Available') AS target_date,
//         IFNULL(asg.mode, 'Not Available') AS mode,

//         -- assignment remark should stay assignment_remark
//         IFNULL(asg.remark, 'Not Available') AS assignment_remark,

//         IFNULL(asg.assigned_to, 'Not Available') AS assigned_to,
//         IFNULL(asg.assigned_to_user_id, 'Not Available') AS assigned_to_user_id,
//         IFNULL(asg.assign_type, 'Not Available') AS assign_type

//       FROM raw_data rd
//       LEFT JOIN area a ON rd.area_id = a.area_id
//       LEFT JOIN category c ON rd.cat_id = c.cat_id
//       LEFT JOIN reference r ON rd.reference_id = r.reference_id
//       LEFT JOIN assignments asg ON rd.assign_id = asg.assign_id

//       ORDER BY rd.master_id ASC
//     `;

//     const [rows] = await db.query(query);

//     return res.status(200).json(rows);

//   } catch (error) {
//     console.error("❌ Error fetching raw_data:", error);
//     res.status(500).json({ error: "Failed to fetch raw_data" });
//   }
// };  


//11-12-25 


// export const importRawData = async (req, res) => {
//   try {
//     if (!req.session.user) {
//       return res.status(401).json({ message: "Unauthorized. Please log in." });
//     }

//     const file = req.file;
//     if (!file) {
//       return res.status(400).json({ message: "File is required!" });
//     }

//     const created_by_user = req.session.user.id;

//     // READ EXCEL
//     const workbook = XLSX.read(file.buffer, { type: "buffer" });
//     const sheetName = workbook.SheetNames[0];
//     const excelRows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

//     if (!excelRows || excelRows.length === 0) {
//       return res.status(400).json({ message: "Excel file is empty!" });
//     }

//     // CLEAN MOBILE
//     const cleanNumber = (num) => {
//       if (!num) return "";
//       let x = String(num).replace(/\D/g, "");
//       if (x.startsWith("91") && x.length > 10) x = x.slice(2);
//       return x.slice(-10);
//     };

//     // DATE PARSER
//     const parseExcelDate = (value) => {
//       if (!value) return null;
//       if (!isNaN(value)) {
//         const d = XLSX.SSF.parse_date_code(value);
//         return new Date(d.y, d.m - 1, d.d);
//       }
//       const parsed = new Date(value);
//       return isNaN(parsed.getTime()) ? null : parsed;
//     };

//     // MAP EXCEL → DB
//     const columnMap = {
//       "Entry Date": "assign_date",
//       "FollowUp Date": "followup_date",
//       "Name": "name",
//       "Contact number": "number",
//       "City": "city",
//       "Remark": "remark",
//       "User": "assigned_to",
//       "Stage": "lead_stage"
//     };

//     for (let excelRow of excelRows) {
//       let mapped = {};

//       Object.keys(excelRow).forEach((col) => {
//         const mappedCol = columnMap[col];
//         if (mappedCol) mapped[mappedCol] = excelRow[col];
//       });

//       if (!mapped.name || !mapped.number) continue;

//       // CLEAN NUMBER
//       const cleanedMobile = cleanNumber(mapped.number);
//       if (cleanedMobile.length !== 10) {
//         return res.status(400).json({
//           message: `Invalid mobile number '${mapped.number}'`,
//           cleaned: cleanedMobile
//         });
//       }

//       // TELECALLER VALIDATION
//       if (!mapped.assigned_to) {
//         return res.status(400).json({ message: "User (Telecaller) is required" });
//       }

//       const [userCheck] = await db.query(
//         `SELECT user_id FROM users WHERE name=? AND role='tele_caller' LIMIT 1`,
//         [mapped.assigned_to.trim()]
//       );

//       if (userCheck.length === 0) {
//         return res.status(400).json({
//           message: `Telecaller '${mapped.assigned_to}' not found or not tele_caller`
//         });
//       }

//       const assigned_to_user_id = userCheck[0].user_id;

//       // DATES
//       const assignDate = parseExcelDate(mapped.assign_date) || new Date();
//       const followDate = parseExcelDate(mapped.followup_date);

//       // INSERT INTO assignments
//       const [assignRes] = await db.query(
//         `INSERT INTO assignments 
//         (created_by_user, mode, assign_date, assigned_to, assigned_to_user_id, lead_count)
//         VALUES (?, ?, ?, ?, ?, ?)`,
//         [
//           created_by_user,
//           "call",
//           assignDate,
//           mapped.assigned_to,
//           assigned_to_user_id,
//           1
//         ]
//       );

//       const assign_id = assignRes.insertId;

//         // INSERT INTO raw_data
// const [rawInsert] = await db.query(
//   `INSERT INTO raw_data 
//   (name, number, city, detailed_remark, lead_stage, followup_date, status, created_by_user, assign_id)
//   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//   [
//     mapped.name,
//     cleanedMobile,
//     mapped.city || "",
//     mapped.remark ?? null,           // ✅ remark stored as NULL
//     mapped.lead_stage ?? null,       // ✅ lead_stage stored correctly
//     followDate,
//     "Assigned",
//     created_by_user,
//     assign_id
//   ]
// );


//       // GET master_id (ONLY CHANGE — NEEDED FOR REASSIGN LOG)
//       const master_id = rawInsert.insertId;

//       // 3️⃣ INSERT INITIAL REASSIGNMENT LOG (NEW)
//      // 3️⃣ INSERT INITIAL REASSIGNMENT LOG (UPDATED)
// await db.query(
//   `INSERT INTO reassignment 
//     (
//       assign_id,
//       master_id,
//       assignedTo,
//       leadStage,
//       remark,
//       reassignment_date
//     )
//    VALUES (?, ?, ?, ?, ?, ?)`,
//   [
//     assign_id,
//     master_id,
//     mapped.assigned_to,                    // Telecaller name
//     mapped.lead_stage || "Not Available",  // Stage
//     mapped.remark ?? null,                 // Remark
//     followDate || new Date()               // ✅ FOLLOWUP DATE STORED HERE
//   ]
// );

//     }

//     res.status(200).json({
//       message: "Excel imported successfully!",
//       status: "success",
//     });

//   } catch (error) {
//     console.error("❌ Import error:", error);
//     res.status(500).json({ message: "Server error while importing data." });
//   }
// };



// export const getAllRawData = async (req, res) => {
//   try {
//     const query = `
//       SELECT 
//         rd.master_id,

//         -- MAIN RAW DATA FIELDS
//         IFNULL(rd.name, 'Not Available') AS name,
//         IFNULL(rd.number, 'Not Available') AS number,
//         IFNULL(rd.email, 'Not Available') AS email,
//         IFNULL(rd.address, 'Not Available') AS address,
//         IFNULL(rd.city, 'Not Available') AS city,
//         IFNULL(rd.status, 'Not Available') AS status,
//         IFNULL(rd.lead_status, 'Not Available') AS lead_status,
//         IFNULL(rd.lead_stage, 'Not Available') AS lead_stage,  
//         IFNULL(rd.current_stage, 'Not Available') AS current_stage,
//         IFNULL(rd.created_by_user, 'Not Available') AS created_by_user,
//         IFNULL(rd.assign_id, 'Not Available') AS assign_id,
//         IFNULL(rd.followup_date, 'Not Available') AS followup_date,

//         -- IDS
//         IFNULL(rd.cat_id, 'Not Available') AS cat_id,
//         IFNULL(rd.reference_id, 'Not Available') AS reference_id,
//         IFNULL(rd.area_id, 'Not Available') AS area_id,

//         -- DIMENSIONS
//         IFNULL(rd.room_length, 'Not Available') AS room_length,
//         IFNULL(rd.room_width, 'Not Available') AS room_width,
//         IFNULL(rd.room_height, 'Not Available') AS room_height,

//         -- EXTRA DETAILS
//         IFNULL(rd.location_link, 'Not Available') AS location_link,
//         IFNULL(rd.p_type, 'Not Available') AS p_type,
//         IFNULL(rd.budget_range, 'Not Available') AS budget_range,
//         IFNULL(rd.room_ready, 'Not Available') AS room_ready,
//         IFNULL(rd.time_to_complete, 'Not Available') AS time_to_complete,
//         IFNULL(rd.site_visit_date, 'Not Available') AS site_visit_date,
//         IFNULL(rd.demo_date, 'Not Available') AS demo_date,

//         -- ACTIVITY
//         IFNULL(rd.lead_activity, 0) AS lead_activity,

//         -- NUMBERS
//         IFNULL(rd.ar_number, 'Not Available') AS ar_number,
//         IFNULL(rd.ca_number, 'Not Available') AS ca_number,
//         IFNULL(rd.e_number, 'Not Available') AS e_number,
//         IFNULL(rd.sm_number, 'Not Available') AS sm_number,
//         IFNULL(rd.pop_number, 'Not Available') AS pop_number,
//         IFNULL(rd.other_number, 'Not Available') AS other_number,

//         -- REMARKS (EXISTING)
//         IFNULL(rd.quick_remark, 'Not Available') AS quick_remark,
//         IFNULL(rd.detailed_remark, 'Not Available') AS detailed_remark,

//         -- AREA / CATEGORY / REFERENCE
//         IFNULL(a.area_name, 'Not Available') AS area_name,
//         IFNULL(c.cat_name, 'Not Available') AS cat_name,
//         IFNULL(r.reference_name, 'Not Available') AS reference_name,

//         -- ASSIGNMENT DETAILS (EXISTING)
//         IFNULL(asg.assign_date, 'Not Available') AS assign_date,
//         IFNULL(asg.target_date, 'Not Available') AS target_date,
//         IFNULL(asg.mode, 'Not Available') AS mode,
//         IFNULL(asg.remark, 'Not Available') AS assignment_remark,
//         IFNULL(asg.assigned_to, 'Not Available') AS assigned_to,
//         IFNULL(asg.assigned_to_user_id, 'Not Available') AS assigned_to_user_id,
//         IFNULL(asg.assign_type, 'Not Available') AS assign_type,

//         -- ✅ NEW: REASSIGNMENT REMARKS (STRING)
//         (
//           SELECT GROUP_CONCAT(
//             IFNULL(rm.remark, '')
//             ORDER BY rm.created_at DESC
//             SEPARATOR '|||'
//           )
//           FROM reassignment rm
//           WHERE rm.master_id = rd.master_id
//         ) AS reassignment_remarks

//       FROM raw_data rd
//       LEFT JOIN area a ON rd.area_id = a.area_id
//       LEFT JOIN category c ON rd.cat_id = c.cat_id
//       LEFT JOIN reference r ON rd.reference_id = r.reference_id
//       LEFT JOIN assignments asg ON rd.assign_id = asg.assign_id
//       ORDER BY rd.master_id DESC
//     `;

//     const [rows] = await db.query(query);

//     // ✅ Convert reassignment_remarks STRING → ARRAY
//     const formattedRows = rows.map(row => ({
//       ...row,
//       reassignment_remarks: row.reassignment_remarks
//         ? row.reassignment_remarks
//             .split('|||')
//             .filter(r => r && r.trim() !== '')
//         : []
//     }));

//     return res.status(200).json(formattedRows);

//   } catch (error) {
//     console.error("❌ Error fetching raw_data:", error);
//     return res.status(500).json({
//       error: "Failed to fetch raw_data"
//     });
//   }
// };


// export const getCompleteRawData = async (req, res) => {
//   try {
//     if (!req.session.user) {
//       return res.status(401).json({ message: "Unauthorized: No session" });
//     }

//     const { id: userId, role } = req.session.user;

//     let query = `
//       SELECT 
//         rd.master_id,

//         -- RAW DATA FIELDS
//         IFNULL(rd.name, 'Not Available') AS name,
//         IFNULL(rd.number, 'Not Available') AS number,
//         IFNULL(rd.email, 'Not Available') AS email,
//         IFNULL(rd.address, 'Not Available') AS address,
//         IFNULL(rd.city, 'Not Available') AS city,
//         IFNULL(rd.status, 'Not Available') AS status,
//         IFNULL(rd.lead_status, 'Not Available') AS lead_status,
//         IFNULL(rd.lead_stage, 'Not Available') AS lead_stage,
//         IFNULL(rd.current_stage, 'Not Available') AS current_stage,
//         IFNULL(rd.created_by_user, 'Not Available') AS created_by_user,
//         IFNULL(rd.assign_id, 'Not Available') AS assign_id,
//         IFNULL(rd.followup_date, 'Not Available') AS followup_date,
//         IFNULL(rd.cat_id, 'Not Available') AS cat_id,
//         IFNULL(rd.reference_id, 'Not Available') AS reference_id,
//         IFNULL(rd.area_id, 'Not Available') AS area_id,

//         -- LENGTH/WIDTH/HEIGHT
//         IFNULL(rd.room_length, 'Not Available') AS room_length,
//         IFNULL(rd.room_width, 'Not Available') AS room_width,
//         IFNULL(rd.room_height, 'Not Available') AS room_height,

//         -- EXTRA DETAILS
//         IFNULL(rd.location_link, 'Not Available') AS location_link,
//         IFNULL(rd.p_type, 'Not Available') AS p_type,
//         IFNULL(rd.budget_range, 'Not Available') AS budget_range,
//         IFNULL(rd.room_ready, 'Not Available') AS room_ready,
//         IFNULL(rd.time_to_complete, 'Not Available') AS time_to_complete,
//         IFNULL(rd.site_visit_date, 'Not Available') AS site_visit_date,
//         IFNULL(rd.demo_date, 'Not Available') AS demo_date,

//         -- ACTIVITY
//         IFNULL(rd.lead_activity, 0) AS lead_activity,

//         -- NUMBERS
//         IFNULL(rd.ar_number, 'Not Available') AS ar_number,
//         IFNULL(rd.ca_number, 'Not Available') AS ca_number,
//         IFNULL(rd.e_number, 'Not Available') AS e_number,
//         IFNULL(rd.sm_number, 'Not Available') AS sm_number,
//         IFNULL(rd.pop_number, 'Not Available') AS pop_number,
//         IFNULL(rd.other_number, 'Not Available') AS other_number,

//         -- REMARKS
//         IF(rd.quick_remark IS NULL OR rd.quick_remark = '', 'Assigned', rd.quick_remark) AS quick_remark,
//         IFNULL(rd.detailed_remark, 'Not Available') AS detailed_remark,

//         -- AREA
//         IFNULL(a.area_name, 'Not Available') AS area_name,

//         -- CATEGORY
//         IFNULL(c.cat_name, 'Not Available') AS cat_name,

//         -- REFERENCE
//         IFNULL(r.reference_name, 'Not Available') AS reference_name,

//         -- ASSIGNMENT DETAILS
//         IFNULL(asg.assign_date, 'Not Available') AS assign_date,
//         IFNULL(asg.target_date, 'Not Available') AS target_date,
//         IFNULL(asg.mode, 'Not Available') AS mode,
//         IFNULL(asg.remark, 'Not Available') AS assignment_remark,
//         IFNULL(asg.assigned_to, 'Not Available') AS assigned_to,
//         IFNULL(asg.assigned_to_user_id, 'Not Available') AS assigned_to_user_id,
//         IFNULL(asg.assign_type, 'Not Available') AS assign_type,

//         -- TELECALLER USER NAME
//         IFNULL(u.name, 'Not Available') AS telecaller_name,

//         -- TELECALLER TABLE
//         MAX(tct.tc_remark) AS call_remark,
//         MAX(tct.tc_call_duration) AS call_duration,

//         -- PRODUCTS
//         GROUP_CONCAT(p.product_name) AS products

//       FROM raw_data rd

//       LEFT JOIN area a ON rd.area_id = a.area_id
//       LEFT JOIN category c ON rd.cat_id = c.cat_id
//       LEFT JOIN reference r ON rd.reference_id = r.reference_id

//       INNER JOIN assignments asg 
//         ON rd.assign_id = asg.assign_id

//       LEFT JOIN users u 
//         ON asg.assigned_to_user_id = u.user_id

//       LEFT JOIN tele_caller_table tct 
//         ON rd.master_id = tct.master_id

//       LEFT JOIN product_mapping pm 
//         ON rd.master_id = pm.master_id

//       LEFT JOIN product p 
//         ON p.product_id = pm.product_id

//       WHERE rd.status IN ('Assigned', 'Not Interested')
//     `;

//     const params = [];

//     // SAME LOGIC AS fetchTaleCallerData
//     if (role === "tele_caller") {
//       query += ` AND asg.assigned_to_user_id = ?`;
//       params.push(userId);
//     }

//     query += `
//       GROUP BY rd.master_id
//       ORDER BY rd.master_id DESC
//     `;

//     const [rows] = await db.query(query, params);
//     res.status(200).json(rows);

//   } catch (error) {
//     console.error("❌ Error in getCompleteRawData:", error);
//     res.status(500).json({ message: "Failed to fetch data" });
//   }
// };



// export const updateRawData = async (req, res) => {
//   try {
//     const { master_id } = req.params;

//     if (!master_id) {
//       return res.status(400).json({ message: "master_id is required" });
//     }

//     const {
//       name,
//       number,
//       email,
//       address,
//       area_id,
//       cat_id,
//       reference_id,
//       city,
//       location_link,
//       room_length,
//       room_width,
//       room_height,
//       p_type,
//       budget_range,
//       current_stage,
//       room_ready,
//       time_to_complete,
//       site_visit_date,
//       demo_date,
//       ar_number,
//       ca_number,
//       e_number,
//       sm_number,
//       pop_number,
//       other_number,
//       lead_stage,
//       quick_remark,
//       detailed_remark,
//       status,
//       lead_status,
//     } = req.body;

//     const updateFields = [];
//     const values = [];

//     const addField = (field, value) => {
//       if (value !== undefined && value !== null && value !== '') {
//         updateFields.push(`${field} = ?`);
//         values.push(value);
//       }
//     };

//     addField("name", name);
//     addField("number", number);
//     addField("email", email);
//     addField("address", address);
//     addField("area_id", area_id);
//     addField("cat_id", cat_id);
//     addField("reference_id", reference_id);
//     addField("city", city);
//     addField("location_link", location_link);
//     addField("room_length", room_length);
//     addField("room_width",  room_width);
//     addField("room_height", room_height);
//     addField("p_type", p_type);
//     addField("budget_range", budget_range);
//     addField("current_stage", current_stage);
//     addField("room_ready", room_ready);
//     addField("time_to_complete", time_to_complete);
//     addField("site_visit_date", site_visit_date);
//     addField("demo_date", demo_date);
//     addField("ar_number", ar_number);
//     addField("ca_number", ca_number);
//     addField("e_number", e_number);
//     addField("sm_number", sm_number);
//     addField("pop_number", pop_number);
//     addField("other_number", other_number);
//     addField("lead_stage", lead_stage);
//     addField("quick_remark", quick_remark);
//     addField("detailed_remark", detailed_remark);

//     // 👇 Only update status fields if explicitly provided by the user
//     addField("status", status);
//     addField("lead_status", lead_status);

//     if (updateFields.length === 0) {
//       return res.status(400).json({ message: "No fields to update" });
//     }

//     const query = `
//       UPDATE raw_data SET ${updateFields.join(", ")}
//       WHERE master_id = ?
//     `;

//     values.push(master_id);

//     const [result] = await db.execute(query, values);

//     if (result.affectedRows === 0) {
//       return res.status(404).json({ message: "Record not found" });
//     }

//     return res.status(200).json({ message: "Raw Data updated successfully!" });

//   } catch (error) {
//     console.error("❌ Update Error:", error);
//     return res.status(500).json({ message: "Server error while updating data" });
//   }
// };


// export const updateRawData = async (req, res) => {
//   try {
//     const { master_id } = req.params;

//     if (!master_id) {
//       return res.status(400).json({ message: "master_id is required" });
//     }

//     const {
//       name,
//       number,
//       email,
//       address,
//       area_id,
//       cat_id,
//       reference_id,
//       city,
//       location_link,
//       room_length,
//       room_width,
//       room_height,
//       p_type,
//       budget_range,
//       current_stage,
//       room_ready,
//       time_to_complete,
//       site_visit_date,
//       demo_date,
//       ar_number,
//       ca_number,
//       e_number,
//       sm_number,
//       pop_number,
//       other_number,
//       lead_stage,
//       quick_remark,
//       detailed_remark,
//       status,
//       lead_status,

//       // NEW FIELDS
//       followup_date,      // from raw_data table
//       assign_date         // from assignments table
//     } = req.body;

//     const updateFields = [];
//     const values = [];

//     const addField = (field, value) => {
//       if (value !== undefined && value !== null && value !== '') {
//         updateFields.push(`${field} = ?`);
//         values.push(value);
//       }
//     };

//     // RAW_DATA FIELDS
//     addField("name", name);
//     addField("number", number);
//     addField("email", email);
//     addField("address", address);
//     addField("area_id", area_id);
//     addField("cat_id", cat_id);
//     addField("reference_id", reference_id);
//     addField("city", city);
//     addField("location_link", location_link);
//     addField("room_length", room_length);
//     addField("room_width", room_width);
//     addField("room_height", room_height);
//     addField("p_type", p_type);
//     addField("budget_range", budget_range);
//     addField("current_stage", current_stage);
//     addField("room_ready", room_ready);
//     addField("time_to_complete", time_to_complete);
//     addField("site_visit_date", site_visit_date);
//     addField("demo_date", demo_date);
//     addField("ar_number", ar_number);
//     addField("ca_number", ca_number);
//     addField("e_number", e_number);
//     addField("sm_number", sm_number);
//     addField("pop_number", pop_number);
//     addField("other_number", other_number);
//     addField("lead_stage", lead_stage);
//     addField("quick_remark", quick_remark);
//     addField("detailed_remark", detailed_remark);

//     // NEW → update followup_date
//     addField("followup_date", followup_date);

//     // update status if provided
//     addField("status", status);
//     addField("lead_status", lead_status);

//     if (updateFields.length === 0) {
//       return res.status(400).json({ message: "No fields to update" });
//     }

//     const query = `
//       UPDATE raw_data SET ${updateFields.join(", ")}
//       WHERE master_id = ?
//     `;

//     values.push(master_id);

//     const [result] = await db.execute(query, values);

//     if (result.affectedRows === 0) {
//       return res.status(404).json({ message: "Record not found" });
//     }

//     // ----------------------------------------------------------
//     // NEW: UPDATE assign_date IN assignments TABLE
//     // ----------------------------------------------------------

//     if (assign_date) {
//       await db.execute(
//         `
//         UPDATE assignments 
//         SET assign_date = ?
//         WHERE assign_id = (SELECT assign_id FROM raw_data WHERE master_id = ?)
//         `,
//         [assign_date, master_id]
//       );
//     }

//     return res.status(200).json({
//       message: "Raw Data updated successfully (including followup_date & assign_date)!"
//     });

//   } catch (error) {
//     console.error("❌ Update Error:", error);
//     return res.status(500).json({ message: "Server error while updating data" });
//   }
// };

//08-12-25 



// CONTROLLER - Updated for multiple reassignments


// export const updateRawData = async (req, res) => {
//   try {
//     const { master_id } = req.params;

//     if (!master_id) {
//       return res.status(400).json({ message: "master_id is required" });
//     }

//     console.log("📥 Incoming Payload:", req.body);

//     const {
//       // raw_data fields
//       name, number, email, address, area_id, cat_id, reference_id, city,
//       location_link, room_length, room_width, room_height, p_type, budget_range,
//       current_stage, room_ready, time_to_complete, site_visit_date, demo_date,
//       ar_number, ca_number, e_number, sm_number, pop_number, other_number,
//       lead_stage, quick_remark, detailed_remark, status, lead_status,
//       followup_date, assign_date,

//       // reassignment fields
//       assignedTo,
//       leadStage,
//       remark,
//       assign_id     // ⭐ important: receiving from frontend
//     } = req.body;

//     // ---------------------------------------------------
//     // ⭐ Step 1: Update raw_data dynamically
//     // ---------------------------------------------------
//     const allowed = {
//       name, number, email, address, area_id, cat_id, reference_id, city,
//       location_link, room_length, room_width, room_height, p_type, budget_range,
//       current_stage, room_ready, time_to_complete, site_visit_date, demo_date,
//       ar_number, ca_number, e_number, sm_number, pop_number, other_number,
//       lead_stage, quick_remark, detailed_remark, status, lead_status,
//       followup_date
//     };

//     const updateFields = [];
//     const values = [];

//     Object.entries(allowed).forEach(([k, v]) => {
//       if (v !== undefined && v !== "") {
//         updateFields.push(`${k} = ?`);
//         values.push(v);
//       }
//     });

//     if (updateFields.length) {
//       values.push(master_id);

//       await db.execute(
//         `UPDATE raw_data SET ${updateFields.join(", ")} WHERE master_id = ?`,
//         values
//       );
//     }

//     // ---------------------------------------------------
//     // ⭐ Step 2: Ensure assign_id exists
//     // ---------------------------------------------------
//     let finalAssignId = assign_id;

//     if (!finalAssignId) {
//       // Try fetching from DB
//       const [row] = await db.execute(
//         "SELECT assign_id FROM assignments WHERE master_id = ? ORDER BY assign_id DESC LIMIT 1",
//         [master_id]
//       );

//       finalAssignId = row.length ? row[0].assign_id : null;

//       // Still missing? → Create new assignment
//       if (!finalAssignId) {
//         const [newAssign] = await db.execute(
//           "INSERT INTO assignments (master_id, assign_date) VALUES (?, NOW())",
//           [master_id]
//         );
//         finalAssignId = newAssign.insertId;
//       }
//     }

//     console.log("⭐ FINAL assign_id:", finalAssignId);

//     // ---------------------------------------------------
//     // ⭐ Step 3: Update assignment date
//     // ---------------------------------------------------
//     if (assign_date) {
//       await db.execute(
//         "UPDATE assignments SET assign_date = ? WHERE assign_id = ?",
//         [assign_date, finalAssignId]
//       );
//     }

//     // ---------------------------------------------------
//     // ⭐ Step 4: Insert Reassignment Log (supports multiple users)
//     // ---------------------------------------------------
//     if (assignedTo && leadStage) {
//       const users = Array.isArray(assignedTo)
//         ? assignedTo
//         : assignedTo.toString().split(",");

//         for (const userId of users) {
//   let finalName = "";

//   const [u] = await db.execute(
//     "SELECT name FROM users WHERE user_id = ?",
//     [userId]
//   );

//   if (u.length) {
//     finalName = u[0].name;
//   }

//   await db.execute(
//     `INSERT INTO reassignment 
//      (assign_id, master_id, assignedTo, leadStage, remark, created_at)
//      VALUES (?, ?, ?, ?, ?, NOW())`,
//     [finalAssignId, master_id, finalName, leadStage, remark || ""]
//   );
// }


//     }

//     // ---------------------------------------------------
//     // Response
//     // ---------------------------------------------------
//     res.status(200).json({
//       success: true,
//       message: "Raw data + reassignment updated successfully",
//       assign_id: finalAssignId
//     });

//   } catch (err) {
//     console.error("❌ updateRawData error:", err);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: err.message
//     });
//   }
// };


export const getAllRawData = async (req, res) => {
  try {
    // 1️⃣ Fetch raw_data + joins (including reassignment data)
    const query = `
      SELECT 
        rd.master_id,

        -- MAIN RAW DATA FIELDS
        IFNULL(rd.name, 'Not Available') AS name,
        IFNULL(rd.number, 'Not Available') AS number,
        IFNULL(rd.alternate_number, 'Not Available') AS alternate_number,
        IFNULL(rd.email, 'Not Available') AS email,
        IFNULL(rd.address, 'Not Available') AS address,
        IFNULL(rd.city, 'Not Available') AS city,
        IFNULL(rd.status, 'Not Available') AS status,
        IFNULL(rd.lead_status, 'Not Available') AS lead_status,
        IFNULL(rd.lead_stage, 'Not Available') AS lead_stage,  
        IFNULL(rd.current_stage, 'Not Available') AS current_stage,
        IFNULL(rd.created_by_user, 'Not Available') AS created_by_user,
        IFNULL(rd.assign_id, 'Not Available') AS assign_id,
        IFNULL(rd.followup_date, 'Not Available') AS followup_date,

        -- IDS
        IFNULL(rd.cat_id, 'Not Available') AS cat_id,
        IFNULL(rd.reference_id, 'Not Available') AS reference_id,
        IFNULL(rd.area_id, 'Not Available') AS area_id,

        -- DIMENSIONS
        IFNULL(rd.room_length, 'Not Available') AS room_length,
        IFNULL(rd.room_width, 'Not Available') AS room_width,
        IFNULL(rd.room_height, 'Not Available') AS room_height,

        -- EXTRA DETAILS
        IFNULL(rd.location_link, 'Not Available') AS location_link,
        IFNULL(rd.p_type, 'Not Available') AS p_type,
        IFNULL(rd.budget_range, 'Not Available') AS budget_range,
        IFNULL(rd.time_to_complete, 'Not Available') AS time_to_complete,
        IFNULL(rd.site_visit_date, 'Not Available') AS site_visit_date,
        IFNULL(rd.demo_date, 'Not Available') AS demo_date,

        -- ACTIVITY
        IFNULL(rd.lead_activity, 0) AS lead_activity,

        -- NUMBERS
        IFNULL(rd.ar_number, 'Not Available') AS ar_number,
        IFNULL(rd.architect_name, 'Not Available') AS architect_name,
        IFNULL(rd.ca_number, 'Not Available') AS ca_number,
        IFNULL(rd.e_number, 'Not Available') AS e_number,
        IFNULL(rd.sm_number, 'Not Available') AS sm_number,
        IFNULL(rd.pop_number, 'Not Available') AS pop_number,
        IFNULL(rd.other_number, 'Not Available') AS other_number,

        -- REMARKS
        IFNULL(rd.quick_remark, 'Not Available') AS quick_remark,
        IFNULL(rd.detailed_remark, 'Not Available') AS detailed_remark,

        -- AREA / CATEGORY / REFERENCE
        IFNULL(a.area_name, 'Not Available') AS area_name,
        IFNULL(c.cat_name, 'Not Available') AS cat_name,
        IFNULL(r.reference_name, 'Not Available') AS reference_name,

        -- ASSIGNMENT DETAILS
        IFNULL(asg.assign_date, 'Not Available') AS assign_date,
        IFNULL(asg.target_date, 'Not Available') AS target_date,
        IFNULL(asg.mode, 'Not Available') AS mode,
        IFNULL(asg.remark, 'Not Available') AS assignment_remark,
        IFNULL(asg.assigned_to, 'Not Available') AS assigned_to,
        IFNULL(asg.assigned_to_user_id, 'Not Available') AS assigned_to_user_id,
        IFNULL(asg.assign_type, 'Not Available') AS assign_type,

        -- ✅ NEW: DOCUMENT LOCATION LINK
        MAX(d.location_link) AS document_location_link

      FROM raw_data rd
      LEFT JOIN area a ON rd.area_id = a.area_id
      LEFT JOIN category c ON rd.cat_id = c.cat_id
      LEFT JOIN reference r ON rd.reference_id = r.reference_id
      LEFT JOIN assignments asg ON rd.assign_id = asg.assign_id

      -- ✅ NEW: DOCUMENTS JOIN
      LEFT JOIN documents d ON d.master_id = rd.master_id

      GROUP BY rd.master_id
      ORDER BY rd.master_id DESC
    `;

    const [rows] = await db.query(query);

    // 2️⃣ Fetch other inputs
    const masterIds = rows.map(r => r.master_id);
    let otherInputsRows = [];

    if (masterIds.length > 0) {
      const [otherInputs] = await db.query(
        `SELECT master_id, cat_id, reference_id, input_text, created_at
         FROM raw_data_other_inputs
         WHERE master_id IN (?)
         ORDER BY created_at DESC`,
        [masterIds]
      );
      otherInputsRows = otherInputs;
    }

    // 3️⃣ Fetch reassignment history
    let reassignmentRows = [];
    if (masterIds.length > 0) {
      const [reassignments] = await db.query(
        `SELECT rm.*, u.name, u.role
         FROM reassignment rm
         LEFT JOIN users u ON u.user_id = rm.created_by_user
         WHERE rm.master_id IN (?)
         ORDER BY rm.reassignment_date DESC, rm.created_at DESC`,
        [masterIds]
      );
      reassignmentRows = reassignments;
    }

    // 4️⃣ Map final data
    const formattedRows = rows.map(row => {
      const categoryOther =
        otherInputsRows.find(
          oi =>
            oi.master_id === row.master_id &&
            oi.cat_id === parseInt(row.cat_id)
        )?.input_text || '';

      const referenceOther =
        otherInputsRows.find(
          oi =>
            oi.master_id === row.master_id &&
            oi.reference_id === parseInt(row.reference_id)
        )?.input_text || '';

      const reassignments = reassignmentRows
        .filter(r => r.master_id === row.master_id)
        .map(r => ({
          remark: r.remark || '',
          assignedTo: r.assignedTo || '',
          leadStage: r.leadStage || '',
          created_by_user: r.created_by_user || '',
          created_at: r.created_at
            ? new Date(r.created_at).toLocaleString('en-GB')
            : '',
          reassignment_date: r.reassignment_date
            ? new Date(r.reassignment_date).toLocaleString('en-GB')
            : '',
          name: r.name || '',
          role: r.role || ''
        }));

      return {
        ...row,
        category_other: categoryOther,
        reference_other: referenceOther,
        reassignment_remarks: reassignments,
        latest_assignedTo: reassignments[0]?.assignedTo || '',
        latest_leadStage: reassignments[0]?.leadStage || ''
      };
    });

    return res.status(200).json(formattedRows);

  } catch (error) {
    console.error("❌ Error fetching raw_data:", error);
    return res.status(500).json({ error: "Failed to fetch raw_data" });
  }
};


// ROLE GROUPS
const TELECALLER_ROLES = [
  'tele_caller',
  'digital_marketing',
  'field_marketing_executive',
  'tech_sale_sound_engineer',
  'junior_autocad_designer',
  'senior_autocad_designer',
  'technical_head',
];

const ADMIN_ROLES = ['admin', 'sub_admin'];
const MANAGEMENT_ROLES = ['technical_head']; // if needed

const isTelecallerLike = (role) => TELECALLER_ROLES.includes(role);
const isAdminLike = (role) => ADMIN_ROLES.includes(role);
const isManagementLike = (role) => MANAGEMENT_ROLES.includes(role);



export const getCompleteRawData = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Unauthorized: No session" });
    }

    const { id: userId, role } = req.session.user;

    /* ================= CURRENT USER ================= */
    const [userResult] = await db.query(
      "SELECT name FROM users WHERE user_id = ?",
      [userId]
    );
    const currentUserName = userResult[0]?.name || '';

    /* ================= MAIN QUERY ================= */
    let query = `
      SELECT 
        rd.master_id,

        -- MAIN RAW DATA
        IFNULL(rd.name, 'Not Available') AS name,
        IFNULL(rd.number, 'Not Available') AS number,
        IFNULL(rd.alternate_number, 'Not Available') AS alternate_number,
        IFNULL(rd.email, 'Not Available') AS email,
        IFNULL(rd.address, 'Not Available') AS address,
        IFNULL(rd.city, 'Not Available') AS city,
        IFNULL(rd.status, 'Not Available') AS status,
        IFNULL(rd.lead_status, 'Not Available') AS lead_status,
        IFNULL(rd.lead_stage, 'Not Available') AS lead_stage,
        IFNULL(rd.current_stage, 'Not Available') AS current_stage,
        IFNULL(rd.created_by_user, 'Not Available') AS created_by_user,
        IFNULL(rd.assign_id, 'Not Available') AS assign_id,
        IFNULL(rd.followup_date, 'Not Available') AS followup_date,

        -- IDS
        IFNULL(rd.cat_id, 'Not Available') AS cat_id,
        IFNULL(rd.reference_id, 'Not Available') AS reference_id,
        IFNULL(rd.area_id, 'Not Available') AS area_id,

        -- DIMENSIONS
        IFNULL(rd.room_length, 'Not Available') AS room_length,
        IFNULL(rd.room_width, 'Not Available') AS room_width,
        IFNULL(rd.room_height, 'Not Available') AS room_height,

        -- EXTRA DETAILS
        IFNULL(rd.location_link, 'Not Available') AS location_link,
        IFNULL(rd.p_type, 'Not Available') AS p_type,
        IFNULL(rd.budget_range, 'Not Available') AS budget_range,
        IFNULL(rd.time_to_complete, 'Not Available') AS time_to_complete,
        IFNULL(rd.site_visit_date, 'Not Available') AS site_visit_date,
        IFNULL(rd.demo_date, 'Not Available') AS demo_date,

        -- ACTIVITY
        IFNULL(rd.lead_activity, 0) AS lead_activity,

        -- NUMBERS
        IFNULL(rd.ar_number, 'Not Available') AS ar_number,
        IFNULL(rd.architect_name, 'Not Available') AS architect_name,
        IFNULL(rd.ca_number, 'Not Available') AS ca_number,
        IFNULL(rd.e_number, 'Not Available') AS e_number,
        IFNULL(rd.sm_number, 'Not Available') AS sm_number,
        IFNULL(rd.pop_number, 'Not Available') AS pop_number,
        IFNULL(rd.other_number, 'Not Available') AS other_number,

        -- REMARKS
        IFNULL(rd.quick_remark, 'Not Available') AS quick_remark,
        IFNULL(rd.detailed_remark, 'Not Available') AS detailed_remark,

        -- AREA / CATEGORY / REFERENCE
        IFNULL(a.area_name, 'Not Available') AS area_name,
        IFNULL(c.cat_name, 'Not Available') AS cat_name,
        IFNULL(ref.reference_name, 'Not Available') AS reference_name,

        -- ASSIGNMENT DATE
        IFNULL(DATE(asg.assign_date), 'Not Available') AS assign_date,

        -- LATEST REASSIGNMENT
        lr.id AS reassignment_id,
        lr.reassignment_date,
        lr.assignedTo AS reassigned_to,
        lr.remark AS reassignment_remark,
        lr.leadStage AS reassignment_lead_stage,

        -- USER
        IFNULL(u.name, 'Not Available') AS telecaller_name,
        u.user_id AS assigned_to_user_id,

        -- CALL / PRODUCT
        MAX(tct.tc_remark) AS call_remark,
        MAX(tct.tc_call_duration) AS call_duration,
        GROUP_CONCAT(p.product_name) AS products,

        -- ✅ NEW: DOCUMENT LOCATION LINK
        MAX(d.location_link) AS document_location_link

      FROM raw_data rd

      LEFT JOIN area a ON rd.area_id = a.area_id
      LEFT JOIN category c ON rd.cat_id = c.cat_id
      LEFT JOIN reference ref ON rd.reference_id = ref.reference_id

      LEFT JOIN assignments asg ON rd.assign_id = asg.assign_id

      -- LATEST REASSIGNMENT
      LEFT JOIN (
        SELECT r1.*, ROW_NUMBER() OVER (PARTITION BY master_id ORDER BY id DESC) rn
        FROM reassignment r1
      ) lr ON rd.master_id = lr.master_id AND lr.rn = 1

      LEFT JOIN users u ON lr.assignedTo = u.name
      LEFT JOIN tele_caller_table tct ON rd.master_id = tct.master_id
      LEFT JOIN product_mapping pm ON rd.master_id = pm.master_id
      LEFT JOIN product p ON p.product_id = pm.product_id

      -- ✅ NEW: DOCUMENTS JOIN
      LEFT JOIN documents d ON d.master_id = rd.master_id
    `;

    const params = [];

    /* ================= ROLE FILTER ================= */
    if (isTelecallerLike(role)) {
      query += ` WHERE lr.assignedTo = ?`;
      params.push(currentUserName);
    } else if (isAdminLike(role)) {
      query += ` WHERE rd.status IN ('Assigned', 'Not Interested')`;
    } else if (!isManagementLike(role)) {
      query += ` WHERE lr.assignedTo = ?`;
      params.push(currentUserName);
    }

    query += ` GROUP BY rd.master_id ORDER BY rd.master_id DESC`;

    const [rows] = await db.query(query, params);

    /* ================= OTHER INPUTS ================= */
    const masterIds = rows.map(r => r.master_id);
    let otherInputsRows = [];

    if (masterIds.length) {
      const [otherInputs] = await db.query(
        `SELECT master_id, cat_id, reference_id, input_text
         FROM raw_data_other_inputs
         WHERE master_id IN (?)
         ORDER BY created_at DESC`,
        [masterIds]
      );
      otherInputsRows = otherInputs;
    }

    /* ================= REASSIGNMENT HISTORY ================= */
    let reassignmentRows = [];
    if (masterIds.length) {
      const [reassignments] = await db.query(
        `SELECT rm.*, u.name, u.role
         FROM reassignment rm
         LEFT JOIN users u ON u.user_id = rm.created_by_user
         WHERE rm.master_id IN (?)
         ORDER BY rm.reassignment_date DESC, rm.created_at DESC`,
        [masterIds]
      );
      reassignmentRows = reassignments;
    }

    /* ================= FINAL MAP ================= */
    const formattedRows = rows.map(row => {
      const rowCatId = parseInt(row.cat_id);
      const rowRefId = parseInt(row.reference_id);

      const categoryOther =
        otherInputsRows.find(
          oi => oi.master_id === row.master_id && oi.cat_id === rowCatId
        )?.input_text || '';

      const referenceOther =
        otherInputsRows.find(
          oi => oi.master_id === row.master_id && oi.reference_id === rowRefId
        )?.input_text || '';

      const reassignments = reassignmentRows
        .filter(r => r.master_id === row.master_id)
        .map(r => ({
          remark: r.remark || '',
          assignedTo: r.assignedTo || '',
          leadStage: r.leadStage || '',
          created_by_user: r.created_by_user || '',
          created_at: r.created_at ? new Date(r.created_at).toLocaleString('en-GB') : '',
          reassignment_date: r.reassignment_date ? new Date(r.reassignment_date).toLocaleString('en-GB') : '',
          name: r.name || '',
          role: r.role || ''
        }));

      return {
        ...row,
        category_other: categoryOther,
        reference_other: referenceOther,
        reassignment_remarks: reassignments,
        latest_assignedTo: reassignments[0]?.assignedTo || '',
        latest_leadStage: reassignments[0]?.leadStage || '',
        assign_date: row.assign_date
      };
    });

    return res.status(200).json(formattedRows);

  } catch (error) {
    console.error("❌ Error in getCompleteRawData:", error);
    res.status(500).json({ message: "Failed to fetch data" });
  }
};



//controller 

// export const updateRawData = async (req, res) => {
//   try {
//     const { master_id } = req.params;

//     if (!master_id) {
//       return res.status(400).json({ message: "master_id is required" });
//     }

//     console.log("📥 Incoming Payload:", req.body);

//     const {
//       name, number, email, address, area_id, cat_id, reference_id, city,
//       location_link, room_length, room_width, room_height, p_type, budget_range,
//       current_stage, room_ready, time_to_complete, site_visit_date, demo_date,
//       ar_number, ca_number, e_number, sm_number, pop_number, other_number,
//       lead_stage, quick_remark, detailed_remark, status, lead_status,
//       followup_date, assign_date,
//       assignedTo, leadStage, remark, assign_id,
//       reassignment_date,

//       // 🔹 Other text inputs
//       category_other,
//       reference_other
//     } = req.body;

//     // ------------------------------------------------
//     // STEP 1: Update raw_data (NO CHANGE)
//     // ------------------------------------------------
//     const allowed = {
//       name, number, email, address, area_id, cat_id, reference_id, city,
//       location_link, room_length, room_width, room_height, p_type, budget_range,
//       current_stage, room_ready, time_to_complete, site_visit_date, demo_date,
//       ar_number, ca_number, e_number, sm_number, pop_number, other_number,
//       lead_stage, quick_remark, detailed_remark, status, lead_status,
//       followup_date
//     };

//     const updateFields = [];
//     const values = [];

//     Object.entries(allowed).forEach(([k, v]) => {
//       if (v !== undefined && v !== "") {
//         updateFields.push(`${k} = ?`);
//         values.push(v);
//       }
//     });

//     if (updateFields.length) {
//       values.push(master_id);
//       await db.execute(
//         `UPDATE raw_data SET ${updateFields.join(", ")} WHERE master_id = ?`,
//         values
//       );
//     }

//     // ------------------------------------------------
//     // STEP 2: CATEGORY OTHER (UPSERT + MOVE LOGIC)
//     // ------------------------------------------------
//     if (category_other) {
//       // ❌ Remove wrong/old category entries for this master
//       await db.execute(
//         `DELETE FROM raw_data_other_inputs 
//          WHERE master_id = ? AND reference_id IS NULL AND cat_id != ?`,
//         [master_id, cat_id]
//       );

//       // 🔍 Check if correct row already exists
//       const [existingCat] = await db.execute(
//         `SELECT id FROM raw_data_other_inputs 
//          WHERE master_id = ? AND cat_id = ? AND reference_id IS NULL`,
//         [master_id, cat_id]
//       );

//       if (existingCat.length) {
//         // 🔁 UPDATE TEXT
//         await db.execute(
//           `UPDATE raw_data_other_inputs
//            SET input_text = ?, created_at = NOW()
//            WHERE id = ?`,
//           [category_other, existingCat[0].id]
//         );
//       } else {
//         // ➕ INSERT NEW
//         await db.execute(
//           `INSERT INTO raw_data_other_inputs
//            (master_id, cat_id, reference_id, input_text)
//            VALUES (?, ?, NULL, ?)`,
//           [master_id, cat_id, category_other]
//         );
//       }
//     }

//     // ------------------------------------------------
//     // STEP 3: REFERENCE OTHER (UPSERT + MOVE LOGIC)
//     // ------------------------------------------------
//     if (reference_other) {
//       // ❌ Remove wrong/old reference entries for this master
//       await db.execute(
//         `DELETE FROM raw_data_other_inputs 
//          WHERE master_id = ? AND cat_id IS NULL AND reference_id != ?`,
//         [master_id, reference_id]
//       );

//       // 🔍 Check if correct row already exists
//       const [existingRef] = await db.execute(
//         `SELECT id FROM raw_data_other_inputs
//          WHERE master_id = ? AND reference_id = ? AND cat_id IS NULL`,
//         [master_id, reference_id]
//       );

//       if (existingRef.length) {
//         // 🔁 UPDATE TEXT
//         await db.execute(
//           `UPDATE raw_data_other_inputs
//            SET input_text = ?, created_at = NOW()
//            WHERE id = ?`,
//           [reference_other, existingRef[0].id]
//         );
//       } else {
//         // ➕ INSERT NEW
//         await db.execute(
//           `INSERT INTO raw_data_other_inputs
//            (master_id, cat_id, reference_id, input_text)
//            VALUES (?, NULL, ?, ?)`,
//           [master_id, reference_id, reference_other]
//         );
//       }
//     }

//     // ------------------------------------------------
//     // STEP 4: Assignment logic (UNCHANGED)
//     // ------------------------------------------------
//     let finalAssignId = assign_id;

//    if (!finalAssignId) {
//   const [row] = await db.execute(
//     "SELECT assign_id FROM raw_data WHERE master_id = ?",
//     [master_id]
//   );

//   finalAssignId = row.length ? row[0].assign_id : null;
// }

// // ✅ If still no assign_id, create new assignment
// if (!finalAssignId) {
//   const [newAssign] = await db.execute(
//     "INSERT INTO assignments (assign_date) VALUES (NOW())"
//   );

//   finalAssignId = newAssign.insertId;

//   // 🔁 Update raw_data with new assign_id
//   await db.execute(
//     "UPDATE raw_data SET assign_id = ? WHERE master_id = ?",
//     [finalAssignId, master_id]
//   );
// }

// // ✅ Update assign_date if provided
// if (assign_date && finalAssignId) {
//   await db.execute(
//     "UPDATE assignments SET assign_date = ? WHERE assign_id = ?",
//     [assign_date, finalAssignId]
//   );
// }
//     // ------------------------------------------------
//     // STEP 5: Reassignment log (UNCHANGED)
//     // ------------------------------------------------
//     const inserted = [];
//     const skipped = [];

//     if (assignedTo && leadStage) {
//       const users = Array.isArray(assignedTo)
//         ? assignedTo
//         : assignedTo.toString().split(",");

//         let reassDate = reassignment_date
//   ? new Date(reassignment_date)
//   : followup_date
//     ? new Date(followup_date)
//     : new Date();


//       for (const userId of users) {
//         const [u] = await db.execute(
//           "SELECT name FROM users WHERE user_id = ?",
//           [userId]
//         );

//         const finalName = u.length ? u[0].name : "";

//         const [existing] = await db.execute(
//           `SELECT id FROM reassignment
//            WHERE assign_id = ? AND master_id = ? AND assignedTo = ? AND leadStage = ?`,
//           [finalAssignId, master_id, finalName, leadStage]
//         );

//         if (existing.length) {
//           skipped.push({ finalName, leadStage });
//           continue;
//         }

//      const finalRemark = detailed_remark || remark || "";


//         const [insertRes] = await db.execute(
//   `INSERT INTO reassignment
//    (assign_id, master_id, assignedTo, leadStage, remark, reassignment_date, created_at)
//    VALUES (?, ?, ?, ?, ?, ?, NOW())`,
//   [finalAssignId, master_id, finalName, leadStage, finalRemark, reassDate]
// );



//         inserted.push(insertRes.insertId);
//       }
//     }

//     // ------------------------------------------------
//     // RESPONSE
//     // ------------------------------------------------
//     res.status(200).json({
//       success: true,
//       message: "Raw data updated successfully.",
//       assign_id: finalAssignId,
//       inserted,
//       skipped
//     });

//   } catch (err) {
//     console.error("❌ updateRawData error:", err);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: err.message
//     });
//   }
// };



export const importRawData = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "File is required!" });
    }

    const created_by_user = req.session.user.id;

    const workbook = XLSX.read(file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const excelRows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (!excelRows || excelRows.length === 0) {
      return res.status(400).json({ message: "Excel file is empty!" });
    }

    const cleanNumber = (num) => {
      if (!num) return "";
      let x = String(num).replace(/\D/g, "");
      if (x.startsWith("91") && x.length > 10) x = x.slice(2);
      return x.slice(-10);
    };

    const parseExcelDate = (value) => {
      if (!value) return null;
      if (!isNaN(value)) {
        const d = XLSX.SSF.parse_date_code(value);
        return new Date(d.y, d.m - 1, d.d);
      }
      const parsed = new Date(value);
      return isNaN(parsed.getTime()) ? null : parsed;
    };

    const columnMap = {
      "Entry Date": "assign_date",
      "FollowUp Date": "followup_date",
      "Name": "name",
      "Contact number": "number",
      "City": "city",
      "Remark": "remark",
      "User": "assigned_to",
      "Stage": "lead_stage"
    };

    for (let excelRow of excelRows) {
      let mapped = {};

      Object.keys(excelRow).forEach((col) => {
        const mappedCol = columnMap[col];
        if (mappedCol) mapped[mappedCol] = excelRow[col];
      });

      if (!mapped.name || !mapped.number) continue;

      const cleanedMobile = cleanNumber(mapped.number);
      if (cleanedMobile.length !== 10) {
        return res.status(400).json({
          message: `Invalid mobile number '${mapped.number}'`,
          cleaned: cleanedMobile
        });
      }

      if (!mapped.assigned_to) {
        return res.status(400).json({ message: "User (Telecaller) is required" });
      }

      const [userCheck] = await db.query(
        `SELECT user_id FROM users WHERE name=? AND role='tele_caller' LIMIT 1`,
        [mapped.assigned_to.trim()]
      );

      if (userCheck.length === 0) {
        return res.status(400).json({
          message: `Telecaller '${mapped.assigned_to}' not found or not tele_caller`
        });
      }

      const assigned_to_user_id = userCheck[0].user_id;

      const assignDate = parseExcelDate(mapped.assign_date) || new Date();
      const followDate = parseExcelDate(mapped.followup_date);

      // INSERT INTO assignments
      const [assignRes] = await db.query(
        `INSERT INTO assignments 
        (created_by_user, mode, assign_date, assigned_to, assigned_to_user_id, lead_count)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
          created_by_user,
          "call",
          assignDate,
          mapped.assigned_to,
          assigned_to_user_id,
          1
        ]
      );

      const assign_id = assignRes.insertId;

      // INSERT INTO raw_data
      const [rawInsert] = await db.query(
        `INSERT INTO raw_data 
        (name, number, city, detailed_remark, lead_stage, followup_date, status, created_by_user, assign_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          mapped.name,
          cleanedMobile,
          mapped.city || "",
          mapped.remark ?? null,
          mapped.lead_stage ?? null,
          followDate,
          "Assigned",
          created_by_user,
          assign_id
        ]
      );

      const master_id = rawInsert.insertId;

      // 🔥 INSERT INTO reassignment WITH created_by_user
      await db.query(
        `INSERT INTO reassignment 
          (
            assign_id,
            master_id,
            created_by_user,
            assignedTo,
            leadStage,
            remark,
            reassignment_date
          )
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          assign_id,
          master_id,
          created_by_user,                       // 👈 ADDED HERE
          mapped.assigned_to,
          mapped.lead_stage || "Not Available",
          mapped.remark ?? null,
          followDate || new Date()
        ]
      );
    }

    res.status(200).json({
      message: "Excel imported successfully!",
      status: "success",
    });

  } catch (error) {
    console.error("❌ Import error:", error);
    res.status(500).json({ message: "Server error while importing data." });
  }
};


export const updateRawData = async (req, res) => {
  try {
    const { master_id } = req.params;

    if (!master_id) {
      return res.status(400).json({ message: "master_id is required" });
    }

    const created_by_user = req.session?.user?.id || null;

    console.log("📥 Incoming Payload:", req.body);

    const {
      // Your existing fields...
      name, number, email, address, area_id, cat_id, reference_id, city,
      location_link, room_length, room_width, room_height, p_type, budget_range,
      current_stage, time_to_complete, site_visit_date, demo_date,
      ar_number, architect_name, ca_number, e_number, sm_number, pop_number, other_number,
      lead_stage, quick_remark, detailed_remark, status, lead_status,
      followup_date, assign_date,
      alternate_number,
      
      // reassignment params
      assignedTo, leadStage, remark, assign_id, reassignment_date,
      
      // NEW: Other inputs
      category_other,
      reference_other,
      
      // NEW: Update mode flag
      update_mode = 'updateWithReassignment'
    } = req.body;

    // ------------------------------------------------
    // STEP 1: Update raw_data (PATCH behavior)
    // ------------------------------------------------
    const allowed = {
      name, 
      number,
      alternate_number,
      email, 
      address, 
      area_id, 
      cat_id, 
      reference_id, 
      city,
      location_link, 
      room_length: room_length ? parseFloat(room_length) : null,
      room_width: room_width ? parseFloat(room_width) : null,
      room_height: room_height ? parseFloat(room_height) : null,
      p_type, 
      budget_range,
      current_stage, 
      time_to_complete, 
      site_visit_date, 
      demo_date,
      ar_number,
      architect_name,
      ca_number, 
      e_number, 
      sm_number, 
      pop_number, 
      other_number,
      lead_stage, 
      quick_remark,
      status, 
      lead_status,
      followup_date
    };

    const updateFields = [];
    const values = [];

    Object.entries(allowed).forEach(([k, v]) => {
      if (v !== undefined && v !== "") {
        updateFields.push(`${k} = ?`);
        values.push(v);
      }
    });

    if (updateFields.length) {
      values.push(master_id);
      await db.execute(
        `UPDATE raw_data SET ${updateFields.join(", ")} WHERE master_id = ?`,
        values
      );
    }

    // ------------------------------------------------
    // STEP 2: Handle Other Inputs - FIXED (no updated_at column)
    // ------------------------------------------------
    // For Category Other
    if (category_other !== undefined) {
      if (category_other && category_other.trim() !== '') {
        // Check if entry exists
        const [existingCat] = await db.execute(
          `SELECT id FROM raw_data_other_inputs 
           WHERE master_id = ? AND cat_id = ?`,
          [master_id, cat_id]
        );
        
        if (existingCat.length > 0) {
          // Update existing (use created_at if no updated_at column)
          await db.execute(
            `UPDATE raw_data_other_inputs 
             SET input_text = ?, created_at = NOW()
             WHERE master_id = ? AND cat_id = ?`,
            [category_other, master_id, cat_id]
          );
        } else {
          // Insert new
          await db.execute(
            `INSERT INTO raw_data_other_inputs 
             (master_id, cat_id, input_text, created_at) 
             VALUES (?, ?, ?, NOW())`,
            [master_id, cat_id, category_other]
          );
        }
      } else {
        // Delete if empty
        await db.execute(
          `DELETE FROM raw_data_other_inputs 
           WHERE master_id = ? AND cat_id = ?`,
          [master_id, cat_id]
        );
      }
    }

    // For Reference Other
    if (reference_other !== undefined) {
      if (reference_other && reference_other.trim() !== '') {
        // Check if entry exists
        const [existingRef] = await db.execute(
          `SELECT id FROM raw_data_other_inputs 
           WHERE master_id = ? AND reference_id = ?`,
          [master_id, reference_id]
        );
        
        if (existingRef.length > 0) {
          // Update existing (use created_at if no updated_at column)
          await db.execute(
            `UPDATE raw_data_other_inputs 
             SET input_text = ?, created_at = NOW()
             WHERE master_id = ? AND reference_id = ?`,
            [reference_other, master_id, reference_id]
          );
        } else {
          // Insert new
          await db.execute(
            `INSERT INTO raw_data_other_inputs 
             (master_id, reference_id, input_text, created_at) 
             VALUES (?, ?, ?, NOW())`,
            [master_id, reference_id, reference_other]
          );
        }
      } else {
        // Delete if empty
        await db.execute(
          `DELETE FROM raw_data_other_inputs 
           WHERE master_id = ? AND reference_id = ?`,
          [master_id, reference_id]
        );
      }
    }

    // ------------------------------------------------
    // STEP 3: Assignment logic
    // ------------------------------------------------
    let finalAssignId = assign_id;

    if (!finalAssignId) {
      const [row] = await db.execute(
        "SELECT assign_id FROM raw_data WHERE master_id = ?",
        [master_id]
      );
      finalAssignId = row.length ? row[0].assign_id : null;
    }

    if (!finalAssignId) {
      const [newAssign] = await db.execute(
        "INSERT INTO assignments (assign_date) VALUES (NOW())"
      );
      finalAssignId = newAssign.insertId;

      await db.execute(
        "UPDATE raw_data SET assign_id = ? WHERE master_id = ?",
        [finalAssignId, master_id]
      );
    }

    // ------------------------------------------------
    // STEP 4: IMPROVED Reassignment logic
    // ------------------------------------------------
    const inserted = [];
    const skipped = [];
    let users = [];

    // Get previous assignments for comparison
    const [previousAssignments] = await db.execute(
      `SELECT assignedTo, leadStage, remark 
       FROM reassignment 
       WHERE master_id = ? AND assign_id = ?
       ORDER BY created_at DESC
       LIMIT 1`,
      [master_id, finalAssignId]
    );

    const previousAssignment = previousAssignments.length > 0 ? previousAssignments[0] : null;
    const previousUsers = previousAssignment?.assignedTo ? previousAssignment.assignedTo.toString().split(",").map(u => u.trim()) : [];

    // Determine if we should create new reassignment
    let shouldCreateReassignment = false;
    let reassignmentReason = '';

    // Only check reassignment if update_mode includes it
    if (update_mode === 'updateWithReassignment') {
      // Check if assignedTo has changed
      if (assignedTo) {
        const newUsers = Array.isArray(assignedTo) 
          ? assignedTo.map(u => u.toString().trim())
          : assignedTo.toString().split(",").map(u => u.trim());
        
        // Check if the list of users has actually changed
        const sortedPrevious = [...previousUsers].sort().join(",");
        const sortedNew = [...newUsers].sort().join(",");
        
        if (sortedPrevious !== sortedNew) {
          shouldCreateReassignment = true;
          reassignmentReason = 'assignedTo_changed';
          users = newUsers;
        } else {
          // Use previous users if no change
          users = previousUsers;
        }
      } else {
        users = previousUsers;
      }

      // Check if we have a NEW detailed remark (not just copying from quick_remark or previous)
      const hasNewDetailedRemark = detailed_remark && 
        detailed_remark.trim() !== '' && 
        previousAssignment?.remark !== detailed_remark.trim();

      // Check if lead stage changed
      const hasLeadStageChanged = (leadStage || lead_stage) && 
        previousAssignment?.leadStage !== (leadStage || lead_stage);

      if (hasNewDetailedRemark && !shouldCreateReassignment) {
        shouldCreateReassignment = true;
        reassignmentReason = 'new_remark';
        users = previousUsers; // Keep same users if only remark changed
      }

      if (hasLeadStageChanged && !shouldCreateReassignment) {
        shouldCreateReassignment = true;
        reassignmentReason = 'leadStage_changed';
        users = previousUsers; // Keep same users if only stage changed
      }
    }

    // Create reassignment only if there are actual changes and mode allows it
    if (shouldCreateReassignment && update_mode === 'updateWithReassignment') {
      const reassDate = reassignment_date
        ? new Date(reassignment_date)
        : followup_date
          ? new Date(followup_date)
          : new Date();

      // Determine the remark to use
      let finalRemark = '';
      if (detailed_remark && detailed_remark.trim() !== '') {
        finalRemark = detailed_remark;
      } else if (reassignmentReason === 'leadStage_changed') {
        finalRemark = `Lead stage changed to ${leadStage || lead_stage}`;
      }

      // Determine the lead stage to use
      let finalLeadStage = leadStage || lead_stage || previousAssignment?.leadStage || null;

      for (const user of users) {
        if (!user || user.trim() === '') continue;

        let finalName = user;

        // If user is an ID, get the name
        if (!isNaN(user) && reassignmentReason === 'assignedTo_changed') {
          const [u] = await db.execute(
            "SELECT name FROM users WHERE user_id = ?",
            [user]
          );
          finalName = u.length ? u[0].name : user.toString();
        }

        // Check for duplicate reassignment (same day, same user, same stage)
        const [existingReassignment] = await db.execute(
          `SELECT id FROM reassignment 
           WHERE master_id = ? AND assign_id = ? AND assignedTo = ? 
           AND leadStage = ? 
           AND DATE(reassignment_date) = DATE(?)
           ORDER BY created_at DESC
           LIMIT 1`,
          [
            master_id,
            finalAssignId,
            finalName,
            finalLeadStage,
            reassDate
          ]
        );

        if (existingReassignment.length > 0) {
          // Skip duplicate - only if remark is also the same
          const [checkRemark] = await db.execute(
            `SELECT remark FROM reassignment WHERE id = ?`,
            [existingReassignment[0].id]
          );
          
          if (checkRemark.length > 0 && checkRemark[0].remark === finalRemark) {
            skipped.push({
              userId: user,
              userName: finalName,
              leadStage: finalLeadStage,
              reason: 'duplicate'
            });
            continue;
          }
        }

        // Create new reassignment
        const [insertRes] = await db.execute(
          `INSERT INTO reassignment
           (assign_id, master_id, created_by_user, assignedTo, leadStage, remark, reassignment_date, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
          [
            finalAssignId,
            master_id,
            created_by_user,
            finalName,
            finalLeadStage,
            finalRemark,
            reassDate
          ]
        );

        inserted.push({
          id: insertRes.insertId,
          userId: user,
          userName: finalName,
          leadStage: finalLeadStage,
          remark: finalRemark
        });
      }
    }

    // ------------------------------------------------
    // RESPONSE
    // ------------------------------------------------
    res.status(200).json({
      success: true,
      message: update_mode === 'updateWithReassignment' 
        ? "Raw data updated with reassignment" 
        : "Raw data updated without reassignment",
      assign_id: finalAssignId,
      inserted_count: inserted.length,
      skipped_count: skipped.length,
      inserted,
      skipped,
      reassignment_created: shouldCreateReassignment,
      reassignment_reason: reassignmentReason,
      update_mode
    });

  } catch (err) {
    console.error("❌ updateRawData error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};


export const addSingleRawData = async (req, res) => {
  try {
    // ----------------------------------
    // AUTH CHECK
    // ----------------------------------
    if (!req.session?.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const created_by_user = req.session.user.id;

    // ----------------------------------
    // INPUTS (DB-SAFE DEFAULTS)
    // ----------------------------------
    const {
      name,
      number,
      cat_id,
      reference_id,
      email = "",
      address = "",
      area_id = "",
      city = null,
      lead_stage = "Fresh Lead",
      quick_remark = null,
      detailed_remark = null,
      assigned_to_user_id = null,
      followup_date = null,
      assign_date = null,
      
      // ADD THESE NEW FIELDS
      category_other,
      reference_other,
      
      // Optional other fields that might come from frontend
      alternate_number = null,
      location_link = null,
      room_length = null,
      room_width = null,
      room_height = null,
      p_type = null,
      budget_range = null,
      current_stage = null,
      time_to_complete = null,
      site_visit_date = null,
      demo_date = null,
      ar_number = null,
      architect_name = null,
      ca_number = null,
      e_number = null,
      sm_number = null,
      pop_number = null,
      other_number = null
    } = req.body;

    // ----------------------------------
    // VALIDATION
    // ----------------------------------
    if (!name || !number || !cat_id || !reference_id) {
      return res.status(400).json({
        message: "Name, Contact, Category & Reference are required"
      });
    }

    // ----------------------------------
    // GET ASSIGNED USER
    // ----------------------------------
    const assignedUserId = assigned_to_user_id || created_by_user;
    let assignedUserName = "Unknown";

    const [userRow] = await db.execute(
      "SELECT name FROM users WHERE user_id = ? LIMIT 1",
      [assignedUserId]
    );

    if (userRow.length) {
      assignedUserName = userRow[0].name;
    }

    // ----------------------------------
    // ASSIGNMENT INSERT
    // ----------------------------------
    const assignDateToUse = assign_date ? new Date(assign_date) : new Date();

    const [assignRes] = await db.execute(
      `INSERT INTO assignments
       (created_by_user, mode, assign_date, assigned_to, assigned_to_user_id, lead_count, assign_type)
       VALUES (?, 'call', ?, ?, ?, 1, 'manual')`,
      [
        created_by_user,
        assignDateToUse,
        assignedUserName,
        assignedUserId
      ]
    );

    const assign_id = assignRes.insertId;

    // ----------------------------------
    // RAW DATA INSERT (DB SAFE)
    // ----------------------------------
    const [rawRes] = await db.execute(
      `INSERT INTO raw_data (
        name,
        number,
        alternate_number,
        email,
        address,
        area_id,
        cat_id,
        reference_id,
        status,
        lead_status,
        assign_id,
        created_by_user,
        city,
        location_link,
        room_length,
        room_width,
        room_height,
        p_type,
        budget_range,
        current_stage,
        time_to_complete,
        site_visit_date,
        demo_date,
        ar_number,
        architect_name,
        ca_number,
        e_number,
        sm_number,
        pop_number,
        other_number,
        lead_stage,
        quick_remark,
        detailed_remark,
        followup_date
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Assigned', 'Inactive', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        number,
        alternate_number,
        email || "",
        address || "",
        area_id || "",
        cat_id,
        reference_id,
        assign_id,
        created_by_user,
        city,
        location_link,
        room_length ? parseFloat(room_length) : null,
        room_width ? parseFloat(room_width) : null,
        room_height ? parseFloat(room_height) : null,
        p_type,
        budget_range,
        current_stage,
        time_to_complete,
        site_visit_date,
        demo_date,
        ar_number,
        architect_name,
        ca_number,
        e_number,
        sm_number,
        pop_number,
        other_number,
        lead_stage,
        quick_remark,
        detailed_remark,
        followup_date
      ]
    );

    const master_id = rawRes.insertId;

    // ------------------------------------------------
    // STEP: Handle Other Inputs - SAME LOGIC AS updateRawData
    // ------------------------------------------------
    
    // For Category Other
    if (category_other !== undefined && category_other && category_other.trim() !== '') {
      // Insert into raw_data_other_inputs for category
      await db.execute(
        `INSERT INTO raw_data_other_inputs 
         (master_id, cat_id, input_text, created_at) 
         VALUES (?, ?, ?, NOW())`,
        [master_id, cat_id, category_other]
      );
    }
    // Note: No need to delete for new records since they don't exist yet

    // For Reference Other
    if (reference_other !== undefined && reference_other && reference_other.trim() !== '') {
      // Insert into raw_data_other_inputs for reference
      await db.execute(
        `INSERT INTO raw_data_other_inputs 
         (master_id, reference_id, input_text, created_at) 
         VALUES (?, ?, ?, NOW())`,
        [master_id, reference_id, reference_other]
      );
    }
    // Note: No need to delete for new records since they don't exist yet

    // ----------------------------------
    // INITIAL REASSIGNMENT
    // ----------------------------------
    const reassignmentDate = followup_date ? new Date(followup_date) : new Date();

    await db.execute(
      `INSERT INTO reassignment (
        assign_id,
        master_id,
        created_by_user,
        assignedTo,
        leadStage,
        remark,
        reassignment_date,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        assign_id,
        master_id,
        created_by_user,
        assignedUserName,
        lead_stage,
        detailed_remark,
        reassignmentDate
      ]
    );

    // ----------------------------------
    // RESPONSE
    // ----------------------------------
    return res.status(200).json({
      success: true,
      message: "Lead created successfully",
      master_id,
      assign_id,
      assigned_to: assignedUserName,
      category_other_saved: category_other !== undefined,
      reference_other_saved: reference_other !== undefined
    });

  } catch (err) {
    console.error("❌ addSingleRawData error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};

export const uploadDocuments = async (req, res) => {
  try {
    const { master_id } = req.params;

    // ✅ NEW — safely read created_by_user (no behavior change)
    const created_by_user = req.session?.user?.id || null;

    if (!master_id) {
      return res.status(400).json({ message: "master_id is required" });
    }

    if (!req.files || !req.files.files) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const {
      location_link,
      remark,
      detailed_remark,
      assignedTo,
      leadStage,
      lead_stage,
      followup_date,
      assign_date,
      reassignment_date,
      reassignment_remark,
      new_remark
    } = req.body;

    console.log("📝 uploadDocuments REQUEST BODY:", {
      master_id,
      assignedTo,
      leadStage,
      lead_stage,
      followup_date,
      detailed_remark,
      location_link,
      remark,
      reassignment_remark,
      new_remark
    });
    
    console.log("📋 All request body keys:", Object.keys(req.body));
    console.log("📦 assignedTo type:", typeof assignedTo, "value:", assignedTo);
    
    if (req.body['assignedTo[]']) {
      console.log("🔍 Found assignedTo[]:", req.body['assignedTo[]']);
      console.log("🔍 assignedTo[] type:", typeof req.body['assignedTo[]']);
    }

    const finalRemark =
      detailed_remark ||
      reassignment_remark ||
      new_remark ||
      remark ||
      null;

    const filesArray = Array.isArray(req.files.files)
      ? req.files.files
      : [req.files.files];

    const allowedExtensions = [
      ".pdf", ".jpg", ".jpeg", ".png", ".dwg",
      ".mp4", ".mov", ".avi", ".mkv"
    ];

    const docValues = [];
    const uploadedDocs = [];

    for (const file of filesArray) {
      const ext = path.extname(file.name).toLowerCase();

      if (!allowedExtensions.includes(ext)) {
        return res.status(400).json({
          message: `File type not allowed: ${file.name}`
        });
      }

      const fileType =
        [".jpg", ".jpeg", ".png"].includes(ext)
          ? "image"
          : [".mp4", ".mov", ".avi", ".mkv"].includes(ext)
          ? "video"
          : "document";

      const uploadDir = path.join("uploads", fileType);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const fileName = `${master_id}_${Date.now()}_${file.name}`;
      const savePath = path.join(uploadDir, fileName);
      await file.mv(savePath);

      const dbPath = savePath.replace(/\\/g, "/");

      docValues.push([
        master_id,
        dbPath,
        fileType,
        location_link || null,
        remark || null
      ]);

      uploadedDocs.push({
        document_path: dbPath,
        document_type: fileType
      });
    }

    await db.query(
      `INSERT INTO documents
       (master_id, document_path, document_type, location_link, remark)
       VALUES ?`,
      [docValues]
    );

    const rawUpdates = [];
    const rawValues = [];

    if (followup_date) {
      rawUpdates.push("followup_date = ?");
      rawValues.push(followup_date);
    }

    const finalLeadStage = leadStage || lead_stage;
    if (finalLeadStage) {
      rawUpdates.push("lead_stage = ?");
      rawValues.push(finalLeadStage);
    }

    if (finalRemark) {
      rawUpdates.push("detailed_remark = ?");
      rawValues.push(finalRemark);
    }

    if (rawUpdates.length) {
      rawValues.push(master_id);
      await db.execute(
        `UPDATE raw_data SET ${rawUpdates.join(", ")} WHERE master_id = ?`,
        rawValues
      );
    }

    let finalAssignId = null;

    const [rawRow] = await db.execute(
      "SELECT assign_id FROM raw_data WHERE master_id = ?",
      [master_id]
    );

    finalAssignId = rawRow.length ? rawRow[0].assign_id : null;

    if (!finalAssignId) {
      const [newAssign] = await db.execute(
        "INSERT INTO assignments (assign_date) VALUES (NOW())"
      );

      finalAssignId = newAssign.insertId;

      await db.execute(
        "UPDATE raw_data SET assign_id = ? WHERE master_id = ?",
        [finalAssignId, master_id]
      );
    }

    let assignedToArray = [];

    if (req.body['assignedTo[]']) {
      if (Array.isArray(req.body['assignedTo[]'])) {
        assignedToArray = req.body['assignedTo[]'].map(u => String(u).trim()).filter(u => u !== '');
      } else if (typeof req.body['assignedTo[]'] === 'string' && req.body['assignedTo[]'].trim() !== '') {
        const str = req.body['assignedTo[]'].trim();
        assignedToArray = str.includes(',')
          ? str.split(',').map(u => u.trim()).filter(u => u !== '')
          : [str];
      }
    } else if (assignedTo) {
      if (Array.isArray(assignedTo)) {
        assignedToArray = assignedTo.map(u => String(u).trim()).filter(u => u !== '');
      } else if (typeof assignedTo === 'string' && assignedTo.trim() !== '') {
        assignedToArray = assignedTo.includes(',')
          ? assignedTo.split(',').map(u => u.trim()).filter(u => u !== '')
          : [assignedTo.trim()];
      }
    }

    const inserted = [];
    const skipped = [];

    if (assignedToArray.length > 0 && finalLeadStage) {
      let reassDate = new Date();
      if (reassignment_date) reassDate = new Date(reassignment_date);
      else if (followup_date) reassDate = new Date(followup_date);

      for (const user of assignedToArray) {
        let finalUserName = user;
        let userId = null;

        if (!isNaN(user) && Number.isInteger(Number(user)) && user !== '') {
          userId = parseInt(user);
          try {
            const [uRow] = await db.execute(
              "SELECT name, user_id FROM users WHERE user_id = ?",
              [userId]
            );
            if (uRow.length) finalUserName = uRow[0].name;
          } catch {}
        }

        try {
          const [exists] = await db.execute(
            `SELECT id FROM reassignment
             WHERE master_id = ?
               AND assignedTo = ?
               AND leadStage = ?`,
            [master_id, finalUserName, finalLeadStage]
          );

          if (exists.length > 0) {
            skipped.push({
              assignedTo: finalUserName,
              leadStage: finalLeadStage,
              userId,
              reason: "Duplicate assignment"
            });
            continue;
          }

          // ✅ ONLY CHANGE IS HERE → add created_by_user
          const [ins] = await db.execute(
            `INSERT INTO reassignment
             (assign_id, master_id, created_by_user, assignedTo, leadStage, remark, reassignment_date, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
              finalAssignId,
              master_id,
              created_by_user,   // 👈 NEW FIELD
              finalUserName,
              finalLeadStage,
              finalRemark,
              reassDate
            ]
          );

          inserted.push({
            id: ins.insertId,
            assignedTo: finalUserName,
            leadStage: finalLeadStage,
            userId,
            reassignment_date: reassDate
          });

        } catch (insertError) {
          console.error(insertError);
        }
      }
    }

    if (assign_date) {
      await db.execute(
        "UPDATE assignments SET assign_date = ? WHERE assign_id = ?",
        [assign_date, finalAssignId]
      );
    }

    let updatedRawData = null;
    try {
      const [updatedData] = await db.execute(
        "SELECT lead_stage, followup_date, assigned_to, detailed_remark FROM raw_data WHERE master_id = ?",
        [master_id]
      );
      if (updatedData.length) updatedRawData = updatedData[0];
    } catch {}

    return res.status(200).json({
      success: true,
      message: inserted.length > 0 
        ? "Documents uploaded and reassignments processed successfully" 
        : "Documents uploaded successfully",
      documents: uploadedDocs,
      raw_data_updated: rawUpdates.length > 0,
      assign_id: finalAssignId,
      inserted_reassignments: inserted,
      skipped_reassignments: skipped,
      updated_raw_data: updatedRawData
    });

  } catch (error) {
    console.error("❌ uploadDocuments error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during upload",
      error: error.message
    });
  }
};


export const addReassignment = async (req, res) => {
  try {
    console.log("📥 Incoming Request Body:", req.body);

    if (!req.session?.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const created_by_user = req.session.user.id;

    const {
      master_id,
      assignedTo,
      leadStage,
      remark,
      assign_id,
      reassignment_date,
      followup_date
    } = req.body;

    if (!master_id || !assignedTo) {
      return res.status(400).json({ message: "master_id and assignedTo required" });
    }

    /* ------------------------------------------------
       STEP 1: Resolve assign_id (same as updateRawData)
    ------------------------------------------------ */
    let finalAssignId = assign_id;

    if (!finalAssignId) {
      const [row] = await db.execute(
        "SELECT assign_id FROM raw_data WHERE master_id = ?",
        [master_id]
      );
      finalAssignId = row.length ? row[0].assign_id : null;
    }

    if (!finalAssignId) {
      const [newAssign] = await db.execute(
        "INSERT INTO assignments (assign_date) VALUES (NOW())"
      );
      finalAssignId = newAssign.insertId;

      await db.execute(
        "UPDATE raw_data SET assign_id = ? WHERE master_id = ?",
        [finalAssignId, master_id]
      );
    }

    /* ------------------------------------------------
       STEP 2: Normalize users
    ------------------------------------------------ */
    const users = Array.isArray(assignedTo)
      ? assignedTo.map(u => u.toString().trim())
      : assignedTo.toString().split(",").map(u => u.trim());

    /* ------------------------------------------------
       STEP 3: Get last reassignment (for duplicate logic)
    ------------------------------------------------ */
    const [last] = await db.execute(
      `SELECT assignedTo, leadStage, remark
       FROM reassignment
       WHERE master_id = ? AND assign_id = ?
       ORDER BY created_at DESC
       LIMIT 1`,
      [master_id, finalAssignId]
    );

    const previous = last.length ? last[0] : null;

    const reassDate = reassignment_date
      ? new Date(reassignment_date)
      : followup_date
        ? new Date(followup_date)
        : new Date();

    const inserted = [];
    const skipped = [];

    /* ------------------------------------------------
       STEP 4: Insert reassignment (same logic as updateRawData)
    ------------------------------------------------ */
    for (const user of users) {
      if (!user) continue;

      const finalLeadStage =
        leadStage || previous?.leadStage || null;

      const finalRemark =
        remark && remark.trim() !== ""
          ? remark
          : previous?.remark || "";

      // Duplicate check (same day + same stage + same user)
      const [dup] = await db.execute(
        `SELECT id, remark FROM reassignment
         WHERE master_id = ?
           AND assign_id = ?
           AND assignedTo = ?
           AND leadStage = ?
           AND DATE(reassignment_date) = DATE(?)
         ORDER BY created_at DESC
         LIMIT 1`,
        [master_id, finalAssignId, user, finalLeadStage, reassDate]
      );

      if (dup.length && dup[0].remark === finalRemark) {
        skipped.push({
          user,
          leadStage: finalLeadStage,
          reason: "duplicate"
        });
        continue;
      }

      const [insertRes] = await db.execute(
        `INSERT INTO reassignment
          (assign_id, master_id, created_by_user, assignedTo, leadStage, remark, reassignment_date, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          finalAssignId,
          master_id,
          created_by_user,
          user,
          finalLeadStage,
          finalRemark,
          reassDate
        ]
      );

      inserted.push({
        id: insertRes.insertId,
        user,
        leadStage: finalLeadStage
      });
    }

    /* ------------------------------------------------
       STEP 5: Update raw_data (sync)
    ------------------------------------------------ */
    if (leadStage || followup_date) {
      await db.execute(
        `UPDATE raw_data
         SET lead_stage = COALESCE(?, lead_stage),
             followup_date = COALESCE(?, followup_date)
         WHERE master_id = ?`,
        [leadStage || null, followup_date || null, master_id]
      );
    }

    res.status(200).json({
      success: true,
      message: "Reassignment added",
      assign_id: finalAssignId,
      inserted_count: inserted.length,
      skipped_count: skipped.length,
      inserted,
      skipped
    });

  } catch (err) {
    console.error("❌ addReassignment error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};



export const addBulkReassignment = async (req, res) => {
  try {
    console.log("📥 Bulk Request:", req.body);

    if (!req.session?.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const created_by_user = req.session.user.id;
    const { assignments } = req.body;

    if (!Array.isArray(assignments) || assignments.length === 0) {
      return res.status(400).json({ message: "No assignments provided" });
    }

    const inserted = [];
    const skipped = [];

    for (const item of assignments) {
      const {
        master_id,
        assignedTo,
        leadStage,
        remark,
        assign_id,
        reassignment_date,
        followup_date
      } = item;

      if (!master_id || !assignedTo) {
        skipped.push({ master_id, reason: "missing_fields" });
        continue;
      }

      /* Resolve assign_id */
      let finalAssignId = assign_id;
      if (!finalAssignId) {
        const [r] = await db.execute(
          "SELECT assign_id FROM raw_data WHERE master_id = ?",
          [master_id]
        );
        finalAssignId = r.length ? r[0].assign_id : null;
      }

      if (!finalAssignId) {
        const [a] = await db.execute(
          "INSERT INTO assignments (assign_date) VALUES (NOW())"
        );
        finalAssignId = a.insertId;
        await db.execute(
          "UPDATE raw_data SET assign_id = ? WHERE master_id = ?",
          [finalAssignId, master_id]
        );
      }

      const users = Array.isArray(assignedTo)
        ? assignedTo
        : assignedTo.toString().split(",");

      const reassDate = reassignment_date
        ? new Date(reassignment_date)
        : followup_date
          ? new Date(followup_date)
          : new Date();

      for (const user of users) {
        if (!user) continue;

        const [dup] = await db.execute(
          `SELECT id FROM reassignment
           WHERE master_id = ?
             AND assign_id = ?
             AND assignedTo = ?
             AND leadStage = ?
             AND DATE(reassignment_date) = DATE(?)
           LIMIT 1`,
          [master_id, finalAssignId, user.trim(), leadStage, reassDate]
        );

        if (dup.length) {
          skipped.push({ master_id, user, reason: "duplicate" });
          continue;
        }

        const [resInsert] = await db.execute(
          `INSERT INTO reassignment
           (assign_id, master_id, created_by_user, assignedTo, leadStage, remark, reassignment_date, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
          [
            finalAssignId,
            master_id,
            created_by_user,
            user.trim(),
            leadStage || null,
            remark || "",
            reassDate
          ]
        );

        inserted.push(resInsert.insertId);
      }

      if (leadStage || followup_date) {
        await db.execute(
          `UPDATE raw_data
           SET lead_stage = COALESCE(?, lead_stage),
               followup_date = COALESCE(?, followup_date)
           WHERE master_id = ?`,
          [leadStage || null, followup_date || null, master_id]
        );
      }
    }

    res.status(200).json({
      success: true,
      message: "Bulk reassignment completed",
      inserted_count: inserted.length,
      skipped_count: skipped.length,
      inserted,
      skipped
    });

  } catch (err) {
    console.error("❌ addBulkReassignment error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};



export const deleteClient = async (req, res) => {
  const { master_id } = req.params;

  try {
    await db.query('DELETE FROM raw_data WHERE master_id = ?', [master_id]);
    res.json({ message: 'Client deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting client' });
  }
};


// delete raw datat entries from raw data table
export const deleteMultipleClients = async (req, res) => {
  const { ids } = req.body; // Corrected: use req.body, not req.params

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: 'No client IDs provided' });
  }

  try {
    const placeholders = ids.map(() => '?').join(',');
    await db.query(`DELETE FROM raw_data WHERE master_id IN (${placeholders})`, ids);
    res.json({ message: 'Selected entries deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting the selected entries' });
  }
};



// export const addSingleRawData = async (req, res) => {
  
//   try {
//     if (!req.session.user) {
//       return res.status(401).json({ message: 'Unauthorized. Please log in.' });
//     }

//     const { name, contact, email, address, cat_id, reference, area_id } = req.body;
//     const created_by_user = req.session.user.id;

//     // VALIDATION
//     if (!name || !contact || !email || !address || !cat_id || !reference || !area_id) {
//       return res.status(400).json({ message: "All fields are required!" });
//     }

//     // CHECK EMAIL
//     const [emailExists] = await db.query(
//       'SELECT master_id FROM raw_data WHERE email = ?',
//       [email]
//     );

//     // CHECK CONTACT (COLUMN NAME = number)
//     const [contactExists] = await db.query(
//       'SELECT master_id FROM raw_data WHERE number = ?',
//       [contact]
//     );

//     // BOTH EXIST
//     if (emailExists.length > 0 && contactExists.length > 0) {
//       return res.status(409).json({
//         message: "Duplicate entry found",
//         duplicates: [
//           {
//             row: 1,
//             name,
//             email,
//             number: contact,
//             issue: "Email & Contact both exist"
//           }
//         ]
//       });
//     }

//     // ONLY EMAIL
//     if (emailExists.length > 0) {
//       return res.status(409).json({
//         message: "Duplicate entry found",
//         duplicates: [
//           {
//             row: 1,
//             name,
//             email,
//             number: contact,
//             issue: "Email exists"
//           }
//         ]
//       });
//     }

//     // ONLY CONTACT
//     if (contactExists.length > 0) {
//       return res.status(409).json({
//         message: "Duplicate entry found",
//         duplicates: [
//           {
//             row: 1,
//             name,
//             email,
//             number: contact,
//             issue: "Contact exists"
//           }
//         ]
//       });
//     }

    
//     const singleData = {
//       name,
//       number: contact,       
//       email,
//       address,
//       area_id,
//       cat_id,
//       reference_id: reference,
//       created_by_user
//     };

//     await insertRawData([singleData]);

//     res.status(200).json({ message: "Data added successfully!" });

//   } catch (error) {
//     console.error("Error adding single data:", error);
//     res.status(500).json({ message: "Server error while adding data." });
//   }
// };





// export const addSingleRawData = async (req, res) => {
//   try {
//     // -------------------------------
//     // 1️⃣ Check session
//     // -------------------------------
//     if (!req.session.user) {
//       return res.status(401).json({ message: "Unauthorized. Please log in." });
//     }

//     const created_by_user = req.session.user.id;

//     // -------------------------------
//     // 2️⃣ Extract payload
//     // -------------------------------
//     const {
//       name,
//       contact,
//       email,
//       cat_id,
//       reference,
//       assigned_to_user_id, // optional: assign to a specific tele_caller
//       address = null,
//       area_id,
//       city = null,
//       location_link = null,
//       room_length = null,
//       room_width = null,
//       room_height = null,
//       p_type = null,
//       budget_range = null,
//       current_stage = null,
//       room_ready = null,
//       time_to_complete = null,
//       site_visit_date = null,
//       demo_date = null,
//       ar_number = null,
//       ca_number = null,
//       e_number = null,
//       sm_number = null,
//       pop_number = null,
//       other_number = null,
//       lead_stage = null,
//       quick_remark = null,
//       detailed_remark = null
//     } = req.body;

//     // -------------------------------
//     // 3️⃣ Validation
//     // -------------------------------
//     if (!name || !cat_id || !reference || !contact) {
//       return res.status(400).json({
//         message: "Name, category, reference, and contact are required!"
//       });
//     }

//     // -------------------------------
//     // 4️⃣ Duplicate check
//     // -------------------------------
//     const [emailExists] = await db.query("SELECT master_id FROM raw_data WHERE email=?", [email]);
//     const [contactExists] = await db.query("SELECT master_id FROM raw_data WHERE number=?", [contact]);

//     if (emailExists.length > 0 || contactExists.length > 0) {
//       return res.status(409).json({
//         message: "Duplicate entry found",
//         emailExists: emailExists.length > 0,
//         contactExists: contactExists.length > 0
//       });
//     }

//     // -------------------------------
//     // 5️⃣ Determine assigned_to username
//     // -------------------------------
//     let assigned_to_name = null;
//     let assignedUserId = assigned_to_user_id || created_by_user;

//     if (assigned_to_user_id) {
//       const [userCheck] = await db.query(
//         "SELECT name FROM users WHERE user_id=? AND role='tele_caller' LIMIT 1",
//         [assigned_to_user_id]
//       );
//       if (userCheck.length === 0) {
//         return res.status(400).json({ message: "Assigned tele_caller not found" });
//       }
//       assigned_to_name = userCheck[0].name;
//     } else {
//       // fallback: assign to logged-in user
//       const [userCheck] = await db.query(
//         "SELECT name FROM users WHERE user_id=? LIMIT 1",
//         [created_by_user]
//       );
//       assigned_to_name = userCheck.length ? userCheck[0].name : null;
//     }

//     // -------------------------------
//     // 6️⃣ Insert into assignments
//     // -------------------------------
//     const assignDate = new Date(); // current date

//     const [assignRes] = await db.query(
//       `INSERT INTO assignments 
//         (created_by_user, mode, assign_date, assigned_to, assigned_to_user_id, lead_count)
//        VALUES (?, ?, ?, ?, ?, ?)`,
//       [created_by_user, "call", assignDate, assigned_to_name, assignedUserId, 1]
//     );

//     const assign_id = assignRes.insertId;
//     console.log("Assignment inserted with ID:", assign_id, "assigned_to:", assigned_to_name);

//     // -------------------------------
//     // 7️⃣ Insert into raw_data
//     // -------------------------------
//     await db.query(
//       `INSERT INTO raw_data (
//         name, number, email, address, area_id, cat_id, reference_id,
//         status, lead_status, assign_id, created_by_user,
//         city, location_link, room_length, room_width, room_height,
//         p_type, budget_range, current_stage, room_ready, time_to_complete,
//         site_visit_date, demo_date, ar_number, ca_number, e_number,
//         sm_number, pop_number, other_number, lead_stage, quick_remark, detailed_remark
//       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//       [
//         name, contact, email, address, area_id, cat_id, reference,
//         "Assigned", "Inactive", assign_id, created_by_user,
//         city, location_link, room_length, room_width, room_height,
//         p_type, budget_range, current_stage, room_ready, time_to_complete,
//         site_visit_date, demo_date, ar_number, ca_number, e_number,
//         sm_number, pop_number, other_number, lead_stage, quick_remark, detailed_remark
//       ]
//     );

//     // -------------------------------
//     // 8️⃣ Response
//     // -------------------------------
//     return res.status(200).json({
//       message: "Data added successfully and assigned!",
//       assign_id,
//       assigned_to: assigned_to_name
//     });

//   } catch (error) {
//     console.error("❌ Error adding single raw data:", error);
//     return res.status(500).json({ message: "Server error while adding data." });
//   }
// };


//


//


// export const addSingleRawData = async (req, res) => {
//   try {
//     if (!req.session.user) {
//       return res.status(401).json({ message: "Unauthorized. Please log in." });
//     }

//     const created_by_user = req.session.user.id;

//     const {
//       name,
//       number,
//       cat_id,
//       reference_id,

//       category_other,
//       reference_other,

//       email = "",
//       address = "",
//       area_id = "",

//       city = null,
//       location_link = null,
//       room_length = null,
//       room_width = null,
//       room_height = null,
//       p_type = null,
//       budget_range = null,
//       current_stage = null,
//       room_ready = null,
//       time_to_complete = null,
//       site_visit_date = null,
//       demo_date = null,
//       followup_date = null,
//       ar_number = null,
//       ca_number = null,
//       e_number = null,
//       sm_number = null,
//       pop_number = null,
//       other_number = null,
//       assigned_to = [],
//       lead_stage = "Fresh Lead",
//       quick_remark = null,
//       detailed_remark = null,
//       assignment_remark = null,
//       assign_date = null
//     } = req.body;

//     // -------------------------------
//     // VALIDATION
//     // -------------------------------
//     if (!name || !cat_id || !reference_id || !number) {
//       return res.status(400).json({
//         message: "Name, Category, Resources, and Contact Number are required!"
//       });
//     }

//     const cleanValue = (val) =>
//       val === "" || val === undefined ? null : val;

//     // -------------------------------
//     // DUPLICATE CHECK
//     // -------------------------------
//     let duplicateCheck = [];

//     if (email) {
//       const [emailExists] = await db.query(
//         "SELECT master_id FROM raw_data WHERE email=? LIMIT 1",
//         [email]
//       );
//       if (emailExists.length) duplicateCheck.push(emailExists[0]);
//     }

//     if (number) {
//       const [contactExists] = await db.query(
//         "SELECT master_id FROM raw_data WHERE number=? LIMIT 1",
//         [number]
//       );
//       if (contactExists.length) duplicateCheck.push(contactExists[0]);
//     }

//     if (duplicateCheck.length) {
//       return res.status(409).json({
//         message: "Duplicate entry found",
//         duplicates: duplicateCheck
//       });
//     }

//     // -------------------------------
//     // ASSIGNMENT USER
//     // -------------------------------
//     let assigned_to_name = null;
//     let assignedUserId = created_by_user;

//     if (assigned_to && assigned_to.length > 0) {
//       assignedUserId = assigned_to[0];
//       const [u] = await db.query(
//         "SELECT name FROM users WHERE user_id=? LIMIT 1",
//         [assignedUserId]
//       );
//       if (u.length) assigned_to_name = u[0].name;
//     }

//     if (!assigned_to_name) {
//       const [me] = await db.query(
//         "SELECT name FROM users WHERE user_id=? LIMIT 1",
//         [created_by_user]
//       );
//       assigned_to_name = me.length ? me[0].name : "Unknown";
//     }

//     // -------------------------------
//     // ASSIGNMENTS INSERT
//     // -------------------------------
//     const assignDateToUse = assign_date ? new Date(assign_date) : new Date();

//     const [assignRes] = await db.query(
//       `INSERT INTO assignments
//        (created_by_user, mode, assign_date, assigned_to, assigned_to_user_id, lead_count, assign_type)
//        VALUES (?, ?, ?, ?, ?, ?, ?)`,
//       [
//         created_by_user,
//         "call",
//         assignDateToUse,
//         assigned_to_name,
//         assignedUserId,
//         1,
//         "manual"
//       ]
//     );

//     const assign_id = assignRes.insertId;

//     // -------------------------------
//     // RAW DATA INSERT
//     // -------------------------------
//     const [rawInsert] = await db.query(
//       `INSERT INTO raw_data (
//         name, number, email, address, area_id, cat_id, reference_id,
//         status, lead_status, assign_id, created_by_user,
//         city, location_link, room_length, room_width, room_height,
//         p_type, budget_range, current_stage, room_ready, time_to_complete,
//         site_visit_date, demo_date, followup_date,
//         ar_number, ca_number, e_number, sm_number, pop_number, other_number,
//         lead_stage, quick_remark, detailed_remark
//       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,

//       [
//         name,
//         number,
//         email || "",
//         address || "",
//         area_id || "",
//         cat_id,
//         reference_id,
//         "Assigned",
//         "Inactive",
//         assign_id,
//         created_by_user,
//         cleanValue(city),
//         cleanValue(location_link),
//         cleanValue(room_length),
//         cleanValue(room_width),
//         cleanValue(room_height),
//         cleanValue(p_type),
//         cleanValue(budget_range),
//         cleanValue(current_stage),
//         cleanValue(room_ready),
//         cleanValue(time_to_complete),
//         cleanValue(site_visit_date),
//         cleanValue(demo_date),
//         cleanValue(followup_date),
//         cleanValue(ar_number),
//         cleanValue(ca_number),
//         cleanValue(e_number),
//         cleanValue(sm_number),
//         cleanValue(pop_number),
//         cleanValue(other_number),
//         lead_stage,
//         cleanValue(quick_remark),
//         cleanValue(detailed_remark)
//       ]
//     );

//     const master_id = rawInsert.insertId;

//     // -------------------------------
//     // FOLLOW-UP DATE
//     // -------------------------------
//     const followupDateToUse = followup_date
//       ? new Date(followup_date)
//       : new Date();

//     // -------------------------------
//     // INITIAL REASSIGNMENT  ✅ UPDATED
//     // -------------------------------
//     await db.query(
//       `INSERT INTO reassignment
//        (
//          assign_id,
//          master_id,
//          created_by_user,
//          assignedTo,
//          leadStage,
//          remark,
//          reassignment_date,
//          created_at
//        )
//        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
//       [
//         assign_id,
//         master_id,
//         created_by_user,
//         assigned_to_name,
//         lead_stage,
//         cleanValue(detailed_remark) || cleanValue(assignment_remark),
//         followupDateToUse
//       ]
//     );

//     // -------------------------------
//     // RESPONSE
//     // -------------------------------
//     return res.status(200).json({
//       success: true,
//       message: "Data added successfully and assigned!",
//       assign_id,
//       master_id,
//       assigned_to: assigned_to_name,
//       assign_date: assignDateToUse.toISOString().split("T")[0]
//     });

//   } catch (error) {
//     console.error("❌ Error adding single raw data:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server error while adding data.",
//       error: error.message
//     });
//   }
// };





// export const uploadDocuments = async (req, res) => {
//   try {
//     const { master_id } = req.params;
//     const { location_link, remark } = req.body;

//     if (!master_id) {
//       return res.status(400).json({ message: "master_id is required" });
//     }

//     if (!req.files || !req.files.files) {
//       return res.status(400).json({ message: "No files uploaded" });
//     }

//     const filesArray = Array.isArray(req.files.files)
//       ? req.files.files
//       : [req.files.files];

//     const allowedExtensions = [
//       ".pdf", ".jpg", ".jpeg", ".png", ".dwg",
//       ".mp4", ".mov", ".avi", ".mkv"
//     ];

//     const uploadedDocs = [];
//     const values = [];

//     for (const file of filesArray) {
//       const ext = path.extname(file.name).toLowerCase();
//       if (!allowedExtensions.includes(ext)) {
//         return res.status(400).json({
//           message: `File type not allowed: ${file.name}`,
//         });
//       }

//       const fileType =
//         [".jpg", ".jpeg", ".png"].includes(ext) ? "image" :
//         [".mp4", ".mov", ".avi", ".mkv"].includes(ext) ? "video" :
//         "document"; // DB enum is ('image','document','video')

//       const uploadDir = path.join("uploads", fileType);
//       if (!fs.existsSync(uploadDir)) {
//         fs.mkdirSync(uploadDir, { recursive: true });
//       }

//       const fileName = `${master_id}_${Date.now()}_${file.name}`;
//       const savePath = path.join(uploadDir, fileName);

//       await file.mv(savePath);

//       const dbPath = `${uploadDir}/${fileName}`.replace(/\\/g, '/');

//       // Insert values according to your table structure
//       values.push([
//         master_id,
//         dbPath,
//         fileType,
//         location_link || null,
//         remark || null
//       ]);

//       uploadedDocs.push({
//         master_id,
//         document_path: dbPath,
//         document_type: fileType,
//         location_link,
//         remark
//       });
//     }

//     const query = `
//       INSERT INTO documents 
//       (master_id, document_path, document_type, location_link, remark)
//       VALUES ?
//     `;

//     await db.query(query, [values]);

//     return res.status(200).json({
//       message: `${uploadedDocs.length} file(s) uploaded successfully!`,
//       documents: uploadedDocs,
//     });

//   } catch (error) {
//     console.error('Upload error:', error);
//     return res.status(500).json({
//       message: "Server error",
//       error: error.message,
//     });
//   }
// };




// Get all documents/images for a master_id
// Get all documents/images for a master_id






export const getDocumentsByMasterId = async (req, res) => {
  try {
    const { master_id } = req.params;

    if (!master_id) {
      return res.status(400).json({ message: "master_id is required" });
    }

    // Updated query to include doc_id, location_link, and remark
    const query = `
      SELECT doc_id, document_path, document_type, location_link, remark, uploaded_at 
      FROM documents 
      WHERE master_id = ?
      ORDER BY uploaded_at DESC
    `;
    
    const [rows] = await db.query(query, [master_id]);

    // Return structured response
    return res.status(200).json({
      master_id,
      documents: rows.map(row => ({
        doc_id: row.doc_id,
        document_path: row.document_path, 
        document_type: row.document_type, // 'image' or 'documents' or 'video'
        location_link: row.location_link,
        remark: row.remark,
        uploaded_at: row.uploaded_at
      }))
    });
  } catch (error) {
    console.error("❌ Get Documents Error:", error);
    return res.status(500).json({
      message: "Server error while fetching documents",
      error: error.message
    });
  }
};



export const getLeadStage = async (req, res) => {
  try {
    const query = `SHOW COLUMNS FROM raw_data WHERE Field = 'lead_stage'`;
    const [rows] = await db.query(query);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Field not found' });
    }

    const enumStr = rows[0].Type; 

    const values = enumStr
      .match(/enum\((.*)\)/)[1]   
      .split(',')
      .map((value) => value.trim().replace(/^'(.*)'$/, '$1')); 

    res.status(200).json(values);
  } catch (error) {
    console.error('Error fetching lead_stage enum options:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getQuickRemark = async (req, res) => {
  try {
    const query = `SHOW COLUMNS FROM raw_data WHERE Field = 'quick_remark'`;
    const [rows] = await db.query(query);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Field not found' });
    }

    const enumStr = rows[0].Type; 

    const values = enumStr
      .match(/enum\((.*)\)/)[1]   
      .split(',')
      .map((value) => value.trim().replace(/^'(.*)'$/, '$1')); 

    res.status(200).json(values);
  } catch (error) {
    console.error('Error fetching quick_remark enum options:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



export const getInactiveLeadDetails = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Unauthorized: No session" });
    }

    const { id: userId, role } = req.session.user;

    let query = `
      SELECT 
        rd.master_id,
        rd.name,
        rd.city,
        rd.number AS contact,

        -- Assignment
        asg.assign_date,
        asg.assigned_to AS assign_user,

        -- Call Status
        COALESCE(rd.quick_remark, 'Not Available') AS call_status,

        -- Final Telecaller Remark OR Raw Detailed Remark
        COALESCE(
            (SELECT tct.tc_remark 
             FROM tele_caller_table tct 
             WHERE tct.master_id = rd.master_id 
             ORDER BY tct.tct_id DESC LIMIT 1),
             rd.detailed_remark,
             'Not Available'
        ) AS remark

      FROM raw_data rd
      INNER JOIN assignments asg ON rd.assign_id = asg.assign_id
    `;

    const conditions = [`rd.lead_status = 'Inactive'`];
    const params = [];

    // Telecaller sees only their assigned leads
    if (role === "tele_caller") {
      conditions.push(`asg.assigned_to_user_id = ?`);
      params.push(userId);
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(" AND ");
    }

    query += ` ORDER BY rd.master_id DESC`;

    const [rows] = await db.query(query, params);

    res.status(200).json(rows);

  } catch (error) {
    console.error("❌ Error in getInactiveLeadDetails:", error);
    res.status(500).json({ message: "Failed to fetch data" });
  }
};



// export const addReassignment = async (req, res) => {
//   try {
//     console.log("📥 Incoming Request Body:", req.body);

//     const { master_id, assignedTo, leadStage, remark, assign_id, reassignment_date } = req.body;

//     if (!master_id || !assignedTo || !leadStage || !assign_id) {
//       return res.status(400).json({ message: "Missing required fields" });
//     }

//     const assignedToArray = Array.isArray(assignedTo) ? assignedTo : [assignedTo];

//     // ⭐ CLEAN NAME: remove role written inside parentheses
//     const cleanName = (str) => str.replace(/\s*\(.*?\)\s*/g, "").trim();

//     // ⭐ Convert input date → MySQL DATETIME (YYYY-MM-DD HH:mm:ss)
//     const toMySQLDateTime = (date) => {
//       const d = new Date(date);
//       if (isNaN(d.getTime())) return null;
//       const pad = (n) => (n < 10 ? "0" + n : n);
//       return (
//         d.getFullYear() +
//         "-" +
//         pad(d.getMonth() + 1) +
//         "-" +
//         pad(d.getDate()) +
//         " " +
//         pad(d.getHours()) +
//         ":" +
//         pad(d.getMinutes()) +
//         ":" +
//         pad(d.getSeconds())
//       );
//     };

//     // ⭐ Use reassignment date or today
//     const formattedDate =
//       toMySQLDateTime(reassignment_date) || toMySQLDateTime(new Date());

//     console.log("📅 Using Datetime for BOTH tables:", formattedDate);

//     // -----------------------------------------------------
//     // 1️⃣ UPDATE raw_data.followup_date + lead_stage
//     // -----------------------------------------------------
//     await db.query(
//       `UPDATE raw_data 
//        SET lead_stage = ?, followup_date = ?
//        WHERE master_id = ?`,
//       [leadStage, formattedDate, master_id]
//     );
//     console.log("🔄 raw_data lead_stage & followup_date updated →", leadStage, formattedDate);

//     // -----------------------------------------------------
//     // 2️⃣ PROCESS MULTIPLE ASSIGNEES
//     // -----------------------------------------------------
//     const insertPromises = assignedToArray.map(async (assignee) => {
//       const finalName = cleanName(assignee);

//       // -----------------------------------------------------
//       // 3️⃣ CHECK DUPLICATE
//       // -----------------------------------------------------
//       const [duplicate] = await db.query(
//         `SELECT id 
//          FROM reassignment
//          WHERE master_id = ? AND assignedTo = ? AND leadStage = ?`,
//         [master_id, finalName, leadStage]
//       );

//       if (duplicate.length > 0) {
//         console.log("⚠ Duplicate found, skipping insert:", finalName);
//         return { skipped: true, finalName, message: `Duplicate: Lead already assigned to ${finalName}` };
//       }

//       // -----------------------------------------------------
//       // 4️⃣ INSERT INTO REASSIGNMENT TABLE
//       // -----------------------------------------------------
//       const [insertRes] = await db.query(
//         `INSERT INTO reassignment 
//           (assign_id, master_id, assignedTo, leadStage, remark, reassignment_date, created_at)
//          VALUES (?, ?, ?, ?, ?, ?, NOW())`,
//         [
//           assign_id,
//           master_id,
//           finalName,
//           leadStage,
//           remark || "",
//           formattedDate, // ✅ Same as raw_data.followup_date
//         ]
//       );

//       console.log("✅ Inserted reassignment:", finalName, formattedDate);
//       return { skipped: false, finalName, insertId: insertRes.insertId };
//     });

//     const results = await Promise.all(insertPromises);

//     res.status(200).json({
//       success: true,
//       message: "Reassignment processed",
//       updated_lead_stage: leadStage,
//       inserted: results.filter(r => !r.skipped),
//       skipped: results.filter(r => r.skipped),
//       total_inserted: results.filter(r => !r.skipped).length,
//       total_skipped: results.filter(r => r.skipped).length,
//       followup_date_used: formattedDate,
//     });

//   } catch (error) {
//     console.error("❌ addReassignment Error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to save reassignment",
//       error: error.message,
//     });
//   }
// };






// New bulk assignment endpoint





// 📜 FETCH REASSIGNMENT HISTORY

export const getReassignmentByMaster = async (req, res) => {
  try {
    const { master_id } = req.params;

    if (!master_id) {
      return res.status(400).json({ message: "master_id is required" });
    }

    const [rows] = await db.query(`
      SELECT rh.*, 
             old_user.name AS old_user_name,
             new_user.name AS new_user_name
      FROM reassignment_history rh
      LEFT JOIN users old_user ON rh.old_user_id = old_user.user_id
      LEFT JOIN users new_user ON rh.new_user_id = new_user.user_id
      WHERE rh.master_id = ?
      ORDER BY rh.id DESC
    `, [master_id]);

    res.status(200).json(rows);

  } catch (error) {
    console.error("❌ getReassignmentByMaster Error:", error);
    res.status(500).json({ message: "Failed to fetch reassignment history" });
  }
};




export const getDropLeadsFullData = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Unauthorized: No session" });
    }

    const { id: userId, role } = req.session.user;

    /* ================= CURRENT USER ================= */
    const [userResult] = await db.query(
      "SELECT name FROM users WHERE user_id = ?",
      [userId]
    );
    const currentUserName = userResult[0]?.name || "";

    /* ================= MAIN QUERY ================= */
    let query = `
      SELECT 
        rd.master_id,

        -- MAIN RAW DATA
        IFNULL(rd.name, 'Not Available') AS name,
        IFNULL(rd.number, 'Not Available') AS number,
        IFNULL(rd.alternate_number, 'Not Available') AS alternate_number,
        IFNULL(rd.email, 'Not Available') AS email,
        IFNULL(rd.address, 'Not Available') AS address,
        IFNULL(rd.city, 'Not Available') AS city,
        IFNULL(rd.status, 'Not Available') AS status,
        IFNULL(rd.lead_status, 'Not Available') AS lead_status,
        IFNULL(rd.lead_stage, 'Not Available') AS lead_stage,
        IFNULL(rd.current_stage, 'Not Available') AS current_stage,
        IFNULL(rd.created_by_user, 'Not Available') AS created_by_user,
        IFNULL(rd.assign_id, 'Not Available') AS assign_id,
        IFNULL(rd.followup_date, 'Not Available') AS followup_date,

        -- IDS
        IFNULL(rd.cat_id, 'Not Available') AS cat_id,
        IFNULL(rd.reference_id, 'Not Available') AS reference_id,
        IFNULL(rd.area_id, 'Not Available') AS area_id,

        -- DIMENSIONS
        IFNULL(rd.room_length, 'Not Available') AS room_length,
        IFNULL(rd.room_width, 'Not Available') AS room_width,
        IFNULL(rd.room_height, 'Not Available') AS room_height,

        -- EXTRA DETAILS
        IFNULL(rd.location_link, 'Not Available') AS location_link,
        IFNULL(rd.p_type, 'Not Available') AS p_type,
        IFNULL(rd.budget_range, 'Not Available') AS budget_range,
        IFNULL(rd.time_to_complete, 'Not Available') AS time_to_complete,
        IFNULL(rd.site_visit_date, 'Not Available') AS site_visit_date,
        IFNULL(rd.demo_date, 'Not Available') AS demo_date,

        -- ACTIVITY
        IFNULL(rd.lead_activity, 0) AS lead_activity,

        -- NUMBERS
        IFNULL(rd.ar_number, 'Not Available') AS ar_number,
        IFNULL(rd.architect_name, 'Not Available') AS architect_name,
        IFNULL(rd.ca_number, 'Not Available') AS ca_number,
        IFNULL(rd.e_number, 'Not Available') AS e_number,
        IFNULL(rd.sm_number, 'Not Available') AS sm_number,
        IFNULL(rd.pop_number, 'Not Available') AS pop_number,
        IFNULL(rd.other_number, 'Not Available') AS other_number,

        -- REMARKS
        IFNULL(rd.quick_remark, 'Not Available') AS quick_remark,
        IFNULL(rd.detailed_remark, 'Not Available') AS detailed_remark,

        -- AREA / CATEGORY / REFERENCE
        IFNULL(a.area_name, 'Not Available') AS area_name,
        IFNULL(c.cat_name, 'Not Available') AS cat_name,
        IFNULL(ref.reference_name, 'Not Available') AS reference_name,

        -- ASSIGN DATE
        IFNULL(DATE(asg.assign_date), 'Not Available') AS assign_date,

        -- LATEST REASSIGNMENT
        lr.id AS reassignment_id,
        lr.reassignment_date,
        lr.assignedTo AS reassigned_to,
        lr.remark AS reassignment_remark,
        lr.leadStage AS reassignment_lead_stage,

        -- USER
        IFNULL(u.name, 'Not Available') AS telecaller_name,
        u.user_id AS assigned_to_user_id,

        -- CALL / PRODUCT
        MAX(tct.tc_remark) AS call_remark,
        MAX(tct.tc_call_duration) AS call_duration,
        GROUP_CONCAT(p.product_name) AS products,

        -- ✅ NEW: DOCUMENT LOCATION LINK
        MAX(d.location_link) AS document_location_link

      FROM raw_data rd

      LEFT JOIN area a ON rd.area_id = a.area_id
      LEFT JOIN category c ON rd.cat_id = c.cat_id
      LEFT JOIN reference ref ON rd.reference_id = ref.reference_id
      LEFT JOIN assignments asg ON rd.assign_id = asg.assign_id

      LEFT JOIN (
        SELECT r1.*, ROW_NUMBER() OVER (PARTITION BY master_id ORDER BY id DESC) rn
        FROM reassignment r1
      ) lr ON rd.master_id = lr.master_id AND lr.rn = 1

      LEFT JOIN users u ON lr.assignedTo = u.name
      LEFT JOIN tele_caller_table tct ON rd.master_id = tct.master_id
      LEFT JOIN product_mapping pm ON rd.master_id = pm.master_id
      LEFT JOIN product p ON p.product_id = pm.product_id

      -- ✅ NEW: DOCUMENTS JOIN
      LEFT JOIN documents d ON d.master_id = rd.master_id
    `;

    const params = [];

    /* ================= DROP LEADS FILTER ================= */
    query += `
      WHERE rd.lead_stage = 'Drop'
         OR lr.leadStage = 'Drop'
    `;

    if (isTelecallerLike(role)) {
      query += ` AND lr.assignedTo = ?`;
      params.push(currentUserName);
    }

    query += ` GROUP BY rd.master_id ORDER BY rd.master_id DESC`;

    const [rows] = await db.query(query, params);

    /* ================= OTHER INPUTS ================= */
    const masterIds = rows.map(r => r.master_id);
    let otherInputsRows = [];

    if (masterIds.length) {
      const [otherInputs] = await db.query(
        `SELECT master_id, cat_id, reference_id, input_text
         FROM raw_data_other_inputs
         WHERE master_id IN (?)
         ORDER BY created_at DESC`,
        [masterIds]
      );
      otherInputsRows = otherInputs;
    }

    /* ================= REASSIGNMENT HISTORY ================= */
    let reassignmentRows = [];
    if (masterIds.length) {
      const [reassignments] = await db.query(
        `SELECT rm.*, u.name, u.role
         FROM reassignment rm
         LEFT JOIN users u ON u.user_id = rm.created_by_user
         WHERE rm.master_id IN (?)
         ORDER BY rm.reassignment_date DESC, rm.created_at DESC`,
        [masterIds]
      );
      reassignmentRows = reassignments;
    }

    /* ================= FINAL MAP ================= */
    const formattedRows = rows.map(row => {
      const rowCatId = parseInt(row.cat_id);
      const rowRefId = parseInt(row.reference_id);

      const categoryOther =
        otherInputsRows.find(
          oi =>
            oi.master_id === row.master_id &&
            oi.cat_id !== null &&
            oi.cat_id === rowCatId
        )?.input_text || "";

      const referenceOther =
        otherInputsRows.find(
          oi =>
            oi.master_id === row.master_id &&
            oi.reference_id !== null &&
            oi.reference_id === rowRefId
        )?.input_text || "";

      const reassignments = reassignmentRows
        .filter(r => r.master_id === row.master_id)
        .map(r => ({
          remark: r.remark || "",
          assignedTo: r.assignedTo || "",
          leadStage: r.leadStage || "",
          created_by_user: r.created_by_user || "",
          created_at: r.created_at
            ? new Date(r.created_at).toLocaleString("en-GB")
            : "",
          reassignment_date: r.reassignment_date
            ? new Date(r.reassignment_date).toLocaleString("en-GB")
            : "",
          name: r.name || "",
          role: r.role || ""
        }));

      return {
        ...row,
        category_other: categoryOther,
        reference_other: referenceOther,
        reassignment_remarks: reassignments,
        latest_assignedTo: reassignments[0]?.assignedTo || "",
        latest_leadStage: reassignments[0]?.leadStage || "",
        assign_date: row.assign_date
      };
    });

    return res.status(200).json(formattedRows);

  } catch (error) {
    console.error("❌ Error in getDropLeadsFullData:", error);
    res.status(500).json({ message: "Failed to fetch drop leads data" });
  }
};



export const getClosedLeadsFullData = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Unauthorized: No session" });
    }

    const { id: userId, role } = req.session.user;

    /* ================= CURRENT USER ================= */
    const [userResult] = await db.query(
      "SELECT name FROM users WHERE user_id = ?",
      [userId]
    );
    const currentUserName = userResult[0]?.name || "";

    /* ================= MAIN QUERY ================= */
    let query = `
      SELECT 
        rd.master_id,

        -- MAIN RAW DATA
        IFNULL(rd.name, 'Not Available') AS name,
        IFNULL(rd.number, 'Not Available') AS number,
        IFNULL(rd.alternate_number, 'Not Available') AS alternate_number,
        IFNULL(rd.email, 'Not Available') AS email,
        IFNULL(rd.address, 'Not Available') AS address,
        IFNULL(rd.city, 'Not Available') AS city,
        IFNULL(rd.status, 'Not Available') AS status,
        IFNULL(rd.lead_status, 'Not Available') AS lead_status,
        IFNULL(rd.lead_stage, 'Not Available') AS lead_stage,
        IFNULL(rd.current_stage, 'Not Available') AS current_stage,
        IFNULL(rd.created_by_user, 'Not Available') AS created_by_user,
        IFNULL(rd.assign_id, 'Not Available') AS assign_id,
        IFNULL(rd.followup_date, 'Not Available') AS followup_date,

        -- IDS
        IFNULL(rd.cat_id, 'Not Available') AS cat_id,
        IFNULL(rd.reference_id, 'Not Available') AS reference_id,
        IFNULL(rd.area_id, 'Not Available') AS area_id,

        -- DIMENSIONS
        IFNULL(rd.room_length, 'Not Available') AS room_length,
        IFNULL(rd.room_width, 'Not Available') AS room_width,
        IFNULL(rd.room_height, 'Not Available') AS room_height,

        -- EXTRA DETAILS
        IFNULL(rd.location_link, 'Not Available') AS location_link,
        IFNULL(rd.p_type, 'Not Available') AS p_type,
        IFNULL(rd.budget_range, 'Not Available') AS budget_range,
        IFNULL(rd.time_to_complete, 'Not Available') AS time_to_complete,
        IFNULL(rd.site_visit_date, 'Not Available') AS site_visit_date,
        IFNULL(rd.demo_date, 'Not Available') AS demo_date,

        -- ACTIVITY
        IFNULL(rd.lead_activity, 0) AS lead_activity,

        -- NUMBERS
        IFNULL(rd.ar_number, 'Not Available') AS ar_number,
        IFNULL(rd.architect_name, 'Not Available') AS architect_name,
        IFNULL(rd.ca_number, 'Not Available') AS ca_number,
        IFNULL(rd.e_number, 'Not Available') AS e_number,
        IFNULL(rd.sm_number, 'Not Available') AS sm_number,
        IFNULL(rd.pop_number, 'Not Available') AS pop_number,
        IFNULL(rd.other_number, 'Not Available') AS other_number,

        -- REMARKS
        IFNULL(rd.quick_remark, 'Not Available') AS quick_remark,
        IFNULL(rd.detailed_remark, 'Not Available') AS detailed_remark,

        -- AREA / CATEGORY / REFERENCE
        IFNULL(a.area_name, 'Not Available') AS area_name,
        IFNULL(c.cat_name, 'Not Available') AS cat_name,
        IFNULL(ref.reference_name, 'Not Available') AS reference_name,

        -- ASSIGN DATE
        IFNULL(DATE(asg.assign_date), 'Not Available') AS assign_date,

        -- LATEST REASSIGNMENT
        lr.id AS reassignment_id,
        lr.reassignment_date,
        lr.assignedTo AS reassigned_to,
        lr.remark AS reassignment_remark,
        lr.leadStage AS reassignment_lead_stage,

        -- USER
        IFNULL(u.name, 'Not Available') AS telecaller_name,
        u.user_id AS assigned_to_user_id,

        -- CALL / PRODUCT
        MAX(tct.tc_remark) AS call_remark,
        MAX(tct.tc_call_duration) AS call_duration,
        GROUP_CONCAT(p.product_name) AS products,

        -- DOCUMENTS
        MAX(d.location_link) AS document_location_link

      FROM raw_data rd

      LEFT JOIN area a ON rd.area_id = a.area_id
      LEFT JOIN category c ON rd.cat_id = c.cat_id
      LEFT JOIN reference ref ON rd.reference_id = ref.reference_id
      LEFT JOIN assignments asg ON rd.assign_id = asg.assign_id

      LEFT JOIN (
        SELECT r1.*, ROW_NUMBER() OVER (PARTITION BY master_id ORDER BY id DESC) rn
        FROM reassignment r1
      ) lr ON rd.master_id = lr.master_id AND lr.rn = 1

      LEFT JOIN users u ON lr.assignedTo = u.name
      LEFT JOIN tele_caller_table tct ON rd.master_id = tct.master_id
      LEFT JOIN product_mapping pm ON rd.master_id = pm.master_id
      LEFT JOIN product p ON p.product_id = pm.product_id
      LEFT JOIN documents d ON d.master_id = rd.master_id
    `;

    const params = [];

    /* ================= CLOSED LEADS FILTER ================= */
    query += `
      WHERE rd.lead_stage = 'Closed Deal'
         OR lr.leadStage = 'Closed Deal'
    `;

    if (isTelecallerLike(role)) {
      query += ` AND lr.assignedTo = ?`;
      params.push(currentUserName);
    }

    query += ` GROUP BY rd.master_id ORDER BY rd.master_id DESC`;

    const [rows] = await db.query(query, params);

    /* ================= OTHER INPUTS ================= */
    const masterIds = rows.map(r => r.master_id);
    let otherInputsRows = [];

    if (masterIds.length) {
      const [otherInputs] = await db.query(
        `SELECT master_id, cat_id, reference_id, input_text
         FROM raw_data_other_inputs
         WHERE master_id IN (?)
         ORDER BY created_at DESC`,
        [masterIds]
      );
      otherInputsRows = otherInputs;
    }

    /* ================= REASSIGNMENT HISTORY ================= */
    let reassignmentRows = [];
    if (masterIds.length) {
      const [reassignments] = await db.query(
        `SELECT rm.*, u.name, u.role
         FROM reassignment rm
         LEFT JOIN users u ON u.user_id = rm.created_by_user
         WHERE rm.master_id IN (?)
         ORDER BY rm.reassignment_date DESC, rm.created_at DESC`,
        [masterIds]
      );
      reassignmentRows = reassignments;
    }

    /* ================= FINAL MAP ================= */
    const formattedRows = rows.map(row => {
      const rowCatId = parseInt(row.cat_id);
      const rowRefId = parseInt(row.reference_id);

      const categoryOther =
        otherInputsRows.find(
          oi => oi.master_id === row.master_id && oi.cat_id === rowCatId
        )?.input_text || "";

      const referenceOther =
        otherInputsRows.find(
          oi => oi.master_id === row.master_id && oi.reference_id === rowRefId
        )?.input_text || "";

      const reassignments = reassignmentRows
        .filter(r => r.master_id === row.master_id)
        .map(r => ({
          remark: r.remark || "",
          assignedTo: r.assignedTo || "",
          leadStage: r.leadStage || "",
          created_by_user: r.created_by_user || "",
          created_at: r.created_at
            ? new Date(r.created_at).toLocaleString("en-GB")
            : "",
          reassignment_date: r.reassignment_date
            ? new Date(r.reassignment_date).toLocaleString("en-GB")
            : "",
          name: r.name || "",
          role: r.role || ""
        }));

      return {
        ...row,
        category_other: categoryOther,
        reference_other: referenceOther,
        reassignment_remarks: reassignments,
        latest_assignedTo: reassignments[0]?.assignedTo || "",
        latest_leadStage: reassignments[0]?.leadStage || "",
        assign_date: row.assign_date
      };
    });

    return res.status(200).json(formattedRows);

  } catch (error) {
    console.error("❌ Error in getClosedLeadsFullData:", error);
    res.status(500).json({ message: "Failed to fetch closed leads data" });
  }
};




export const getMissedAssignedFullData = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Unauthorized: No session" });
    }

    const { id: userId, role } = req.session.user;
    const today = new Date().toISOString().slice(0, 10);

    /* ================= CURRENT USER ================= */
    const [userResult] = await db.query(
      "SELECT name FROM users WHERE user_id = ?",
      [userId]
    );
    const currentUserName = userResult[0]?.name || '';

    /* ================= MAIN QUERY ================= */
    let query = `
      SELECT 
        rd.master_id,

        -- MAIN RAW DATA
        IFNULL(rd.name, 'Not Available') AS name,
        IFNULL(rd.number, 'Not Available') AS number,
        IFNULL(rd.alternate_number, 'Not Available') AS alternate_number,
        IFNULL(rd.email, 'Not Available') AS email,
        IFNULL(rd.address, 'Not Available') AS address,
        IFNULL(rd.city, 'Not Available') AS city,
        IFNULL(rd.status, 'Not Available') AS status,
        IFNULL(rd.lead_status, 'Not Available') AS lead_status,
        IFNULL(rd.lead_stage, 'Not Available') AS lead_stage,
        IFNULL(rd.current_stage, 'Not Available') AS current_stage,
        IFNULL(rd.created_by_user, 'Not Available') AS created_by_user,
        IFNULL(rd.assign_id, 'Not Available') AS assign_id,
        IFNULL(rd.followup_date, 'Not Available') AS followup_date,

        -- IDS
        IFNULL(rd.cat_id, 'Not Available') AS cat_id,
        IFNULL(rd.reference_id, 'Not Available') AS reference_id,
        IFNULL(rd.area_id, 'Not Available') AS area_id,

        -- DIMENSIONS
        IFNULL(rd.room_length, 'Not Available') AS room_length,
        IFNULL(rd.room_width, 'Not Available') AS room_width,
        IFNULL(rd.room_height, 'Not Available') AS room_height,

        -- EXTRA DETAILS
        IFNULL(rd.location_link, 'Not Available') AS location_link,
        IFNULL(rd.p_type, 'Not Available') AS p_type,
        IFNULL(rd.budget_range, 'Not Available') AS budget_range,
        IFNULL(rd.time_to_complete, 'Not Available') AS time_to_complete,
        IFNULL(rd.site_visit_date, 'Not Available') AS site_visit_date,
        IFNULL(rd.demo_date, 'Not Available') AS demo_date,

        -- ACTIVITY
        IFNULL(rd.lead_activity, 0) AS lead_activity,

        -- NUMBERS
        IFNULL(rd.ar_number, 'Not Available') AS ar_number,
        IFNULL(rd.architect_name, 'Not Available') AS architect_name,
        IFNULL(rd.ca_number, 'Not Available') AS ca_number,
        IFNULL(rd.e_number, 'Not Available') AS e_number,
        IFNULL(rd.sm_number, 'Not Available') AS sm_number,
        IFNULL(rd.pop_number, 'Not Available') AS pop_number,
        IFNULL(rd.other_number, 'Not Available') AS other_number,

        -- REMARKS
        IFNULL(rd.quick_remark, 'Not Available') AS quick_remark,
        IFNULL(rd.detailed_remark, 'Not Available') AS detailed_remark,

        -- AREA / CATEGORY / REFERENCE
        IFNULL(a.area_name, 'Not Available') AS area_name,
        IFNULL(c.cat_name, 'Not Available') AS cat_name,
        IFNULL(ref.reference_name, 'Not Available') AS reference_name,

        -- ASSIGN DATE
        IFNULL(DATE(asg.assign_date), 'Not Available') AS assign_date,

        -- LATEST REASSIGNMENT
        lr.id AS reassignment_id,
        lr.reassignment_date,
        lr.assignedTo AS reassigned_to,
        lr.remark AS reassignment_remark,
        lr.leadStage AS reassignment_lead_stage,

        -- USER
        IFNULL(u.name, 'Not Available') AS telecaller_name,
        u.user_id AS assigned_to_user_id,

        -- CALL / PRODUCT
        MAX(tct.tc_remark) AS call_remark,
        MAX(tct.tc_call_duration) AS call_duration,
        GROUP_CONCAT(p.product_name) AS products,

        -- ✅ NEW: DOCUMENT LOCATION LINK
        MAX(d.location_link) AS document_location_link

      FROM raw_data rd

      LEFT JOIN area a ON rd.area_id = a.area_id
      LEFT JOIN category c ON rd.cat_id = c.cat_id
      LEFT JOIN reference ref ON rd.reference_id = ref.reference_id
      LEFT JOIN assignments asg ON rd.assign_id = asg.assign_id

      LEFT JOIN (
        SELECT r1.*, ROW_NUMBER() OVER (PARTITION BY master_id ORDER BY id DESC) rn
        FROM reassignment r1
      ) lr ON rd.master_id = lr.master_id AND lr.rn = 1

      LEFT JOIN users u ON lr.assignedTo = u.name
      LEFT JOIN tele_caller_table tct ON rd.master_id = tct.master_id
      LEFT JOIN product_mapping pm ON rd.master_id = pm.master_id
      LEFT JOIN product p ON p.product_id = pm.product_id

      -- ✅ NEW: DOCUMENTS JOIN
      LEFT JOIN documents d ON d.master_id = rd.master_id

      WHERE rd.followup_date < ?
    `;

    const params = [today];

    /* ================= ROLE FILTER ================= */
    if (isTelecallerLike(role)) {
      query += ` AND lr.assignedTo = ?`;
      params.push(currentUserName);
    } else if (isAdminLike(role)) {
      // no filter
    } else if (!isManagementLike(role)) {
      query += ` AND lr.assignedTo = ?`;
      params.push(currentUserName);
    }

    query += ` GROUP BY rd.master_id ORDER BY rd.followup_date ASC`;

    const [rows] = await db.query(query, params);

    /* ================= OTHER INPUTS ================= */
    const masterIds = rows.map(r => r.master_id);
    let otherInputsRows = [];

    if (masterIds.length) {
      const [otherInputs] = await db.query(
        `SELECT master_id, cat_id, reference_id, input_text
         FROM raw_data_other_inputs
         WHERE master_id IN (?)
         ORDER BY created_at DESC`,
        [masterIds]
      );
      otherInputsRows = otherInputs;
    }

    /* ================= REASSIGNMENT HISTORY ================= */
    let reassignmentRows = [];
    if (masterIds.length) {
      const [reassignments] = await db.query(
        `SELECT rm.*, u.name, u.role
         FROM reassignment rm
         LEFT JOIN users u ON u.user_id = rm.created_by_user
         WHERE rm.master_id IN (?)
         ORDER BY rm.reassignment_date DESC, rm.created_at DESC`,
        [masterIds]
      );
      reassignmentRows = reassignments;
    }

    /* ================= FINAL MAP ================= */
    const formattedRows = rows.map(row => {
      const rowCatId = parseInt(row.cat_id);
      const rowRefId = parseInt(row.reference_id);

      const categoryOther =
        otherInputsRows.find(
          oi => oi.master_id === row.master_id && oi.cat_id === rowCatId
        )?.input_text || '';

      const referenceOther =
        otherInputsRows.find(
          oi => oi.master_id === row.master_id && oi.reference_id === rowRefId
        )?.input_text || '';

      const reassignments = reassignmentRows
        .filter(r => r.master_id === row.master_id)
        .map(r => ({
          remark: r.remark || '',
          assignedTo: r.assignedTo || '',
          leadStage: r.leadStage || '',
          created_by_user: r.created_by_user || '',
          created_at: r.created_at
            ? new Date(r.created_at).toLocaleString('en-GB')
            : '',
          reassignment_date: r.reassignment_date
            ? new Date(r.reassignment_date).toLocaleString('en-GB')
            : '',
          name: r.name || '',
          role: r.role || ''
        }));

      return {
        ...row,
        category_other: categoryOther,
        reference_other: referenceOther,
        reassignment_remarks: reassignments,
        latest_assignedTo: reassignments[0]?.assignedTo || '',
        latest_leadStage: reassignments[0]?.leadStage || '',
        assign_date: row.assign_date
      };
    });

    return res.status(200).json({
      success: true,
      total: formattedRows.length,
      missedLeads: formattedRows
    });

  } catch (error) {
    console.error("❌ Error in getMissedAssignedFullData:", error);
    res.status(500).json({ message: "Failed to fetch missed follow-up data" });
  }
};



export const getTodaysAssignedLeadsFullData = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Unauthorized: No session" });
    }

    const { id: userId, role } = req.session.user;

    /* ================= CURRENT USER ================= */
    const [userResult] = await db.query(
      "SELECT name FROM users WHERE user_id = ?",
      [userId]
    );
    const currentUserName = userResult[0]?.name || '';

    /* ================= MAIN QUERY ================= */
    let query = `
      SELECT 
        rd.master_id,

        -- MAIN RAW DATA
        IFNULL(rd.name, 'Not Available') AS name,
        IFNULL(rd.number, 'Not Available') AS number,
        IFNULL(rd.alternate_number, 'Not Available') AS alternate_number,
        IFNULL(rd.email, 'Not Available') AS email,
        IFNULL(rd.address, 'Not Available') AS address,
        IFNULL(rd.city, 'Not Available') AS city,
        IFNULL(rd.status, 'Not Available') AS status,
        IFNULL(rd.lead_status, 'Not Available') AS lead_status,
        IFNULL(rd.lead_stage, 'Not Available') AS lead_stage,
        IFNULL(rd.current_stage, 'Not Available') AS current_stage,
        IFNULL(rd.created_by_user, 'Not Available') AS created_by_user,
        IFNULL(rd.assign_id, 'Not Available') AS assign_id,
        IFNULL(rd.followup_date, 'Not Available') AS followup_date,

        -- IDS
        IFNULL(rd.cat_id, 'Not Available') AS cat_id,
        IFNULL(rd.reference_id, 'Not Available') AS reference_id,
        IFNULL(rd.area_id, 'Not Available') AS area_id,

        -- DIMENSIONS
        IFNULL(rd.room_length, 'Not Available') AS room_length,
        IFNULL(rd.room_width, 'Not Available') AS room_width,
        IFNULL(rd.room_height, 'Not Available') AS room_height,

        -- EXTRA DETAILS
        IFNULL(rd.location_link, 'Not Available') AS location_link,
        IFNULL(rd.p_type, 'Not Available') AS p_type,
        IFNULL(rd.budget_range, 'Not Available') AS budget_range,
        IFNULL(rd.time_to_complete, 'Not Available') AS time_to_complete,
        IFNULL(rd.site_visit_date, 'Not Available') AS site_visit_date,
        IFNULL(rd.demo_date, 'Not Available') AS demo_date,

        -- ACTIVITY
        IFNULL(rd.lead_activity, 0) AS lead_activity, 

        -- NUMBERS
        IFNULL(rd.ar_number, 'Not Available') AS ar_number,
        IFNULL(rd.architect_name, 'Not Available') AS architect_name,
        IFNULL(rd.ca_number, 'Not Available') AS ca_number,
        IFNULL(rd.e_number, 'Not Available') AS e_number,
        IFNULL(rd.sm_number, 'Not Available') AS sm_number,
        IFNULL(rd.pop_number, 'Not Available') AS pop_number,
        IFNULL(rd.other_number, 'Not Available') AS other_number,

        -- REMARKS
        IFNULL(rd.quick_remark, 'Not Available') AS quick_remark,
        IFNULL(rd.detailed_remark, 'Not Available') AS detailed_remark,

        -- AREA / CATEGORY / REFERENCE
        IFNULL(a.area_name, 'Not Available') AS area_name,
        IFNULL(c.cat_name, 'Not Available') AS cat_name,
        IFNULL(ref.reference_name, 'Not Available') AS reference_name,

        -- ASSIGN DATE
        IFNULL(DATE(asg.assign_date), 'Not Available') AS assign_date,

        -- LATEST REASSIGNMENT
        lr.id AS reassignment_id,
        lr.reassignment_date,
        lr.assignedTo AS reassigned_to,
        lr.remark AS reassignment_remark,
        lr.leadStage AS reassignment_lead_stage,

        -- USER
        IFNULL(u.name, 'Not Available') AS telecaller_name,
        u.user_id AS assigned_to_user_id,

        -- ✅ NEW: DOCUMENT LOCATION LINK
        MAX(d.location_link) AS document_location_link

      FROM raw_data rd
      LEFT JOIN area a ON rd.area_id = a.area_id
      LEFT JOIN category c ON rd.cat_id = c.cat_id
      LEFT JOIN reference ref ON rd.reference_id = ref.reference_id
      LEFT JOIN assignments asg ON rd.assign_id = asg.assign_id

      -- LATEST REASSIGNMENT
      LEFT JOIN (
        SELECT r1.*, ROW_NUMBER() OVER (PARTITION BY master_id ORDER BY id DESC) rn
        FROM reassignment r1
      ) lr ON rd.master_id = lr.master_id AND lr.rn = 1

      LEFT JOIN users u ON lr.assignedTo = u.name

      -- ✅ NEW: DOCUMENTS JOIN
      LEFT JOIN documents d ON d.master_id = rd.master_id
    `;

    const params = [];

    /* ================= TODAY CONDITION ================= */
    query += `
      WHERE (
        rd.followup_date = CURDATE()
        OR DATE(lr.reassignment_date) = CURDATE()
      )
    `;

    /* ================= ROLE FILTER ================= */
    if (isTelecallerLike(role)) {
      query += ` AND lr.assignedTo = ?`;
      params.push(currentUserName);
    } else if (isAdminLike(role)) {
      query += ` AND rd.status IN ('Assigned', 'Not Interested')`;
    } else if (!isManagementLike(role)) {
      query += ` AND lr.assignedTo = ?`;
      params.push(currentUserName);
    }

    query += ` GROUP BY rd.master_id ORDER BY rd.followup_date ASC`;

    const [rows] = await db.query(query, params);

    if (!rows.length) {
      return res.status(200).json({ success: true, total: 0, leads: [] });
    }

    /* ================= MASTER IDS ================= */
    const masterIds = rows.map(r => r.master_id);

    /* ================= OTHER INPUTS ================= */
    const [otherInputs] = await db.query(
      `SELECT master_id, cat_id, reference_id, input_text
       FROM raw_data_other_inputs
       WHERE master_id IN (?)
       ORDER BY created_at DESC`,
      [masterIds]
    );

    /* ================= REASSIGNMENT HISTORY ================= */
    const [reassignments] = await db.query(
      `SELECT rm.*, u.name, u.role
       FROM reassignment rm
       LEFT JOIN users u ON u.user_id = rm.created_by_user
       WHERE rm.master_id IN (?)
       ORDER BY rm.reassignment_date DESC, rm.created_at DESC`,
      [masterIds]
    );

    /* ================= FINAL MAP ================= */
    const finalResult = rows.map(row => {
      const rowCatId = parseInt(row.cat_id);
      const rowRefId = parseInt(row.reference_id);

      const category_other =
        otherInputs.find(
          oi => oi.master_id === row.master_id && oi.cat_id === rowCatId
        )?.input_text || '';

      const reference_other =
        otherInputs.find(
          oi => oi.master_id === row.master_id && oi.reference_id === rowRefId
        )?.input_text || '';

      const reassignment_remarks = reassignments
        .filter(r => r.master_id === row.master_id)
        .map(r => ({
          remark: r.remark || '',
          assignedTo: r.assignedTo || '',
          leadStage: r.leadStage || '',
          created_at: r.created_at
            ? new Date(r.created_at).toLocaleString('en-GB')
            : '',
          reassignment_date: r.reassignment_date
            ? new Date(r.reassignment_date).toLocaleString('en-GB')
            : '',
          name: r.name || '',
          role: r.role || ''
        }));

      return {
        ...row,
        category_other,
        reference_other,
        reassignment_remarks,
        latest_assignedTo: reassignment_remarks[0]?.assignedTo || '',
        latest_leadStage: reassignment_remarks[0]?.leadStage || ''
      };
    });

    return res.status(200).json({
      success: true,
      total: finalResult.length,
      leads: finalResult
    });

  } catch (error) {
    console.error("❌ Error in getTodaysAssignedLeadsFullData:", error);
    res.status(500).json({ message: "Failed to fetch today's leads" });
  }
};





export const getUpcomingAssignedFullData = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Unauthorized: No session" });
    }

    const { id: userId, role } = req.session.user;

    /* ================= CURRENT USER ================= */
    const [userResult] = await db.query(
      "SELECT name FROM users WHERE user_id = ?",
      [userId]
    );
    const currentUserName = userResult[0]?.name || '';

    /* ================= MAIN QUERY ================= */
    let query = `
      SELECT 
        rd.master_id,

        -- MAIN RAW DATA
        IFNULL(rd.name, 'Not Available') AS name,
        IFNULL(rd.number, 'Not Available') AS number,
        IFNULL(rd.alternate_number, 'Not Available') AS alternate_number,
        IFNULL(rd.email, 'Not Available') AS email,
        IFNULL(rd.address, 'Not Available') AS address,
        IFNULL(rd.city, 'Not Available') AS city,
        IFNULL(rd.status, 'Not Available') AS status,
        IFNULL(rd.lead_status, 'Not Available') AS lead_status,
        IFNULL(rd.lead_stage, 'Not Available') AS lead_stage,
        IFNULL(rd.current_stage, 'Not Available') AS current_stage,
        IFNULL(rd.created_by_user, 'Not Available') AS created_by_user,
        IFNULL(rd.assign_id, 'Not Available') AS assign_id,
        IFNULL(rd.followup_date, 'Not Available') AS followup_date,

        -- IDS
        IFNULL(rd.cat_id, 'Not Available') AS cat_id,
        IFNULL(rd.reference_id, 'Not Available') AS reference_id,
        IFNULL(rd.area_id, 'Not Available') AS area_id,

        -- DIMENSIONS
        IFNULL(rd.room_length, 'Not Available') AS room_length,
        IFNULL(rd.room_width, 'Not Available') AS room_width,
        IFNULL(rd.room_height, 'Not Available') AS room_height,

        -- EXTRA DETAILS
        IFNULL(rd.location_link, 'Not Available') AS location_link,
        IFNULL(rd.p_type, 'Not Available') AS p_type,
        IFNULL(rd.budget_range, 'Not Available') AS budget_range,
        IFNULL(rd.time_to_complete, 'Not Available') AS time_to_complete,
        IFNULL(rd.site_visit_date, 'Not Available') AS site_visit_date,
        IFNULL(rd.demo_date, 'Not Available') AS demo_date,

        -- ACTIVITY
        IFNULL(rd.lead_activity, 0) AS lead_activity,

        -- NUMBERS
        IFNULL(rd.ar_number, 'Not Available') AS ar_number,
        IFNULL(rd.architect_name, 'Not Available') AS architect_name,
        IFNULL(rd.ca_number, 'Not Available') AS ca_number,
        IFNULL(rd.e_number, 'Not Available') AS e_number,
        IFNULL(rd.sm_number, 'Not Available') AS sm_number,
        IFNULL(rd.pop_number, 'Not Available') AS pop_number,
        IFNULL(rd.other_number, 'Not Available') AS other_number,

        -- REMARKS
        IFNULL(rd.quick_remark, 'Not Available') AS quick_remark,
        IFNULL(rd.detailed_remark, 'Not Available') AS detailed_remark,

        -- AREA / CATEGORY / REFERENCE
        IFNULL(a.area_name, 'Not Available') AS area_name,
        IFNULL(c.cat_name, 'Not Available') AS cat_name,
        IFNULL(ref.reference_name, 'Not Available') AS reference_name,

        -- ASSIGN DATE
        IFNULL(DATE(asg.assign_date), 'Not Available') AS assign_date,

        -- LATEST REASSIGNMENT
        lr.id AS reassignment_id,
        lr.reassignment_date,
        lr.assignedTo AS reassigned_to,
        lr.remark AS reassignment_remark,
        lr.leadStage AS reassignment_lead_stage,

        -- USER
        IFNULL(u.name, 'Not Available') AS telecaller_name,
        u.user_id AS assigned_to_user_id,

        -- ✅ NEW: DOCUMENT LOCATION LINK
        MAX(d.location_link) AS document_location_link

      FROM raw_data rd

      LEFT JOIN area a ON rd.area_id = a.area_id
      LEFT JOIN category c ON rd.cat_id = c.cat_id
      LEFT JOIN reference ref ON rd.reference_id = ref.reference_id
      LEFT JOIN assignments asg ON rd.assign_id = asg.assign_id

      -- LATEST REASSIGNMENT
      LEFT JOIN (
        SELECT r1.*, ROW_NUMBER() OVER (PARTITION BY master_id ORDER BY id DESC) rn
        FROM reassignment r1
      ) lr ON rd.master_id = lr.master_id AND lr.rn = 1

      LEFT JOIN users u ON lr.assignedTo = u.name

      -- ✅ NEW: DOCUMENTS JOIN
      LEFT JOIN documents d ON d.master_id = rd.master_id
    `;

    const params = [];

    /* ================= UPCOMING CONDITION ================= */
    query += `
      WHERE (
        rd.followup_date > CURDATE()
        OR DATE(lr.reassignment_date) > CURDATE()
      )
    `;

    /* ================= ROLE FILTER ================= */
    if (isTelecallerLike(role)) {
      query += ` AND lr.assignedTo = ?`;
      params.push(currentUserName);
    } else if (isAdminLike(role)) {
      query += ` AND rd.status IN ('Assigned', 'Not Interested')`;
    } else if (!isManagementLike(role)) {
      query += ` AND lr.assignedTo = ?`;
      params.push(currentUserName);
    }

    query += ` GROUP BY rd.master_id ORDER BY rd.followup_date ASC`;

    const [rows] = await db.query(query, params);

    if (!rows.length) {
      return res.status(200).json({ success: true, total: 0, upcomingLeads: [] });
    }

    /* ================= MASTER IDS ================= */
    const masterIds = rows.map(r => r.master_id);

    /* ================= OTHER INPUTS ================= */
    const [otherInputs] = await db.query(
      `SELECT master_id, cat_id, reference_id, input_text
       FROM raw_data_other_inputs
       WHERE master_id IN (?)
       ORDER BY created_at DESC`,
      [masterIds]
    );

    /* ================= REASSIGNMENT HISTORY ================= */
    const [reassignments] = await db.query(
      `SELECT rm.*, u.name, u.role
       FROM reassignment rm
       LEFT JOIN users u ON u.user_id = rm.created_by_user
       WHERE rm.master_id IN (?)
       ORDER BY rm.reassignment_date DESC, rm.created_at DESC`,
      [masterIds]
    );

    /* ================= FINAL MAP ================= */
    const finalResult = rows.map(row => {
      const rowCatId = parseInt(row.cat_id);
      const rowRefId = parseInt(row.reference_id);

      const category_other =
        otherInputs.find(
          oi => oi.master_id === row.master_id && oi.cat_id === rowCatId
        )?.input_text || '';

      const reference_other =
        otherInputs.find(
          oi => oi.master_id === row.master_id && oi.reference_id === rowRefId
        )?.input_text || '';

      const reassignment_remarks = reassignments
        .filter(r => r.master_id === row.master_id)
        .map(r => ({
          remark: r.remark || '',
          assignedTo: r.assignedTo || '',
          leadStage: r.leadStage || '',
          created_at: r.created_at
            ? new Date(r.created_at).toLocaleString('en-GB')
            : '',
          reassignment_date: r.reassignment_date
            ? new Date(r.reassignment_date).toLocaleString('en-GB')
            : '',
          name: r.name || '',
          role: r.role || ''
        }));

      return {
        ...row,
        category_other,
        reference_other,
        reassignment_remarks,
        latest_assignedTo: reassignment_remarks[0]?.assignedTo || '',
        latest_leadStage: reassignment_remarks[0]?.leadStage || ''
      };
    });

    return res.status(200).json({
      success: true,
      total: finalResult.length,
      upcomingLeads: finalResult
    });

  } catch (error) {
    console.error("❌ Error in getUpcomingAssignedFullData:", error);
    res.status(500).json({ message: "Failed to fetch upcoming leads" });
  }
};





export const getEmployeeLeadWorkReport = async (req, res) => {
  try {
    if (!req.session?.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const query = `
      WITH ranked AS (
        SELECT
          r.master_id,
          r.assignedTo AS employee_name,
          COALESCE(NULLIF(r.leadStage, ''), 'Fresh Lead') AS leadStage,
          r.created_at,

          ROW_NUMBER() OVER (
            PARTITION BY r.master_id, r.assignedTo
            ORDER BY r.created_at ASC
          ) AS rn_first,

          ROW_NUMBER() OVER (
            PARTITION BY r.master_id, r.assignedTo
            ORDER BY r.created_at DESC
          ) AS rn_last

        FROM reassignment r
      ),

      aggregated AS (
        SELECT
          master_id,
          employee_name,

          MIN(created_at) AS start_time,
          MAX(created_at) AS end_time,

          MAX(CASE WHEN rn_first = 1 THEN leadStage END) AS initial_stage,
          MAX(CASE WHEN rn_last  = 1 THEN leadStage END) AS final_stage

        FROM ranked
        GROUP BY master_id, employee_name
      )

      SELECT
        a.master_id,
        rd.name   AS lead_name,
        rd.number,
        a.employee_name,

        a.initial_stage,
        a.final_stage,

        CASE
          WHEN a.initial_stage <> a.final_stage THEN 1
          ELSE 0
        END AS is_converted,

        a.start_time,
        COALESCE(a.end_time, NOW()) AS end_time,

        ROUND(
          TIMESTAMPDIFF(MINUTE, a.start_time, COALESCE(a.end_time, NOW())) / 60,
          2
        ) AS hours_spent,

        ROUND(
          TIMESTAMPDIFF(MINUTE, a.start_time, COALESCE(a.end_time, NOW())) / 1440,
          2
        ) AS days_spent

      FROM aggregated a
      LEFT JOIN raw_data rd ON rd.master_id = a.master_id
      ORDER BY a.employee_name, a.master_id;
    `;

    const [rows] = await db.query(query);

    return res.status(200).json({
      success: true,
      total: rows.length,
      data: rows
    });

  } catch (error) {
    console.error("❌ Employee lead work report error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate employee report"
    });
  }
};


