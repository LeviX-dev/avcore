import XLSX from "xlsx";
// import {  getRawData } from "../models/rawDataModel.js";
import db from "../database/db.js";
import path from 'path';
import fs from 'fs';

import { fileURLToPath } from 'url'; // Add this import

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


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
    // 1️⃣ Fetch raw_data + joins (including latest reassignment)
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

        -- ASSIGNMENT DETAILS (LATEST REASSIGNMENT)
        IFNULL(DATE(lr.reassignment_date), 'Not Available') AS assign_date,
        IFNULL(lr.assignedTo, 'Not Available') AS assigned_to,
        IFNULL(u.user_id, 'Not Available') AS assigned_to_user_id,

        -- DOCUMENT LOCATION LINK
        MAX(d.location_link) AS document_location_link

      FROM raw_data rd
      LEFT JOIN area a ON rd.area_id = a.area_id
      LEFT JOIN category c ON rd.cat_id = c.cat_id
      LEFT JOIN reference r ON rd.reference_id = r.reference_id
      LEFT JOIN assignments asg ON rd.assign_id = asg.assign_id

      -- ✅ LATEST REASSIGNMENT
      LEFT JOIN (
        SELECT r1.*, ROW_NUMBER() OVER (PARTITION BY master_id ORDER BY id DESC) rn
        FROM reassignment r1
      ) lr ON rd.master_id = lr.master_id AND lr.rn = 1

      LEFT JOIN users u ON lr.assignedTo = u.name

      -- DOCUMENTS
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



// export const getAllRawData = async (req, res) => {
//   try {
//     // 1️⃣ Fetch raw_data + joins (including reassignment data)
//     const query = `
//       SELECT 
//         rd.master_id,

//         -- MAIN RAW DATA FIELDS
//         IFNULL(rd.name, 'Not Available') AS name,
//         IFNULL(rd.number, 'Not Available') AS number,
//         IFNULL(rd.alternate_number, 'Not Available') AS alternate_number,
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
//         IFNULL(rd.time_to_complete, 'Not Available') AS time_to_complete,
//         IFNULL(rd.site_visit_date, 'Not Available') AS site_visit_date,
//         IFNULL(rd.demo_date, 'Not Available') AS demo_date,

//         -- ACTIVITY
//         IFNULL(rd.lead_activity, 0) AS lead_activity,

//         -- NUMBERS
//         IFNULL(rd.ar_number, 'Not Available') AS ar_number,
//         IFNULL(rd.architect_name, 'Not Available') AS architect_name,
//         IFNULL(rd.ca_number, 'Not Available') AS ca_number,
//         IFNULL(rd.e_number, 'Not Available') AS e_number,
//         IFNULL(rd.sm_number, 'Not Available') AS sm_number,
//         IFNULL(rd.pop_number, 'Not Available') AS pop_number,
//         IFNULL(rd.other_number, 'Not Available') AS other_number,

//         -- REMARKS
//         IFNULL(rd.quick_remark, 'Not Available') AS quick_remark,
//         IFNULL(rd.detailed_remark, 'Not Available') AS detailed_remark,

//         -- AREA / CATEGORY / REFERENCE
//         IFNULL(a.area_name, 'Not Available') AS area_name,
//         IFNULL(c.cat_name, 'Not Available') AS cat_name,
//         IFNULL(r.reference_name, 'Not Available') AS reference_name,

//         -- ASSIGNMENT DETAILS
//         IFNULL(asg.assign_date, 'Not Available') AS assign_date,
//         IFNULL(asg.target_date, 'Not Available') AS target_date,
//         IFNULL(asg.mode, 'Not Available') AS mode,
//         IFNULL(asg.remark, 'Not Available') AS assignment_remark,
//         IFNULL(asg.assigned_to, 'Not Available') AS assigned_to,
//         IFNULL(asg.assigned_to_user_id, 'Not Available') AS assigned_to_user_id,
//         IFNULL(asg.assign_type, 'Not Available') AS assign_type,

//         -- ✅ NEW: DOCUMENT LOCATION LINK
//         MAX(d.location_link) AS document_location_link

//       FROM raw_data rd
//       LEFT JOIN area a ON rd.area_id = a.area_id
//       LEFT JOIN category c ON rd.cat_id = c.cat_id
//       LEFT JOIN reference r ON rd.reference_id = r.reference_id
//       LEFT JOIN assignments asg ON rd.assign_id = asg.assign_id 

//       -- ✅ NEW: DOCUMENTS JOIN
//       LEFT JOIN documents d ON d.master_id = rd.master_id

//       GROUP BY rd.master_id
//       ORDER BY rd.master_id DESC
//     `;

//     const [rows] = await db.query(query);

//     // 2️⃣ Fetch other inputs
//     const masterIds = rows.map(r => r.master_id);
//     let otherInputsRows = [];

//     if (masterIds.length > 0) {
//       const [otherInputs] = await db.query(
//         `SELECT master_id, cat_id, reference_id, input_text, created_at
//          FROM raw_data_other_inputs
//          WHERE master_id IN (?)
//          ORDER BY created_at DESC`,
//         [masterIds]
//       );
//       otherInputsRows = otherInputs;
//     }

//     // 3️⃣ Fetch reassignment history
//     let reassignmentRows = [];
//     if (masterIds.length > 0) {
//       const [reassignments] = await db.query(
//         `SELECT rm.*, u.name, u.role
//          FROM reassignment rm
//          LEFT JOIN users u ON u.user_id = rm.created_by_user
//          WHERE rm.master_id IN (?)
//          ORDER BY rm.reassignment_date DESC, rm.created_at DESC`,
//         [masterIds]
//       );
//       reassignmentRows = reassignments;
//     }

//     // 4️⃣ Map final data
//     const formattedRows = rows.map(row => {
//       const categoryOther =
//         otherInputsRows.find(
//           oi =>
//             oi.master_id === row.master_id &&
//             oi.cat_id === parseInt(row.cat_id)
//         )?.input_text || '';

//       const referenceOther =
//         otherInputsRows.find(
//           oi =>
//             oi.master_id === row.master_id &&
//             oi.reference_id === parseInt(row.reference_id)
//         )?.input_text || '';

//       const reassignments = reassignmentRows
//         .filter(r => r.master_id === row.master_id)
//         .map(r => ({
//           remark: r.remark || '',
//           assignedTo: r.assignedTo || '',
//           leadStage: r.leadStage || '',
//           created_by_user: r.created_by_user || '',
//           created_at: r.created_at
//             ? new Date(r.created_at).toLocaleString('en-GB')
//             : '',
//           reassignment_date: r.reassignment_date
//             ? new Date(r.reassignment_date).toLocaleString('en-GB')
//             : '',
//           name: r.name || '',
//           role: r.role || ''
//         }));

//       return {
//         ...row,
//         category_other: categoryOther,
//         reference_other: referenceOther,
//         reassignment_remarks: reassignments,
//         latest_assignedTo: reassignments[0]?.assignedTo || '',
//         latest_leadStage: reassignments[0]?.leadStage || ''
//       };
//     });

//     return res.status(200).json(formattedRows);

//   } catch (error) {
//     console.error("❌ Error fetching raw_data:", error);
//     return res.status(500).json({ error: "Failed to fetch raw_data" });
//   }
// };


// ROLE GROUPS


const TELECALLER_ROLES = [
  'tele_caller',
  'digital_marketing',
  'field_marketing_executive',
  'tech_sale_sound_engineer',
  'junior_autocad_designer',
  'senior_autocad_designer',
  'technical_head',
    'av_engineer',
  'acoustic_engineer',
  'acoustic_designer',
   'hr_executive',
     'project_manager',
     'carpenter',
];

const ADMIN_ROLES = ['admin', 'sub_admin'];
const MANAGEMENT_ROLES = ['technical_head']; // if needed

const isTelecallerLike = (role) => TELECALLER_ROLES.includes(role);
const isAdminLike = (role) => ADMIN_ROLES.includes(role);
const isManagementLike = (role) => MANAGEMENT_ROLES.includes(role);



// export const getCompleteRawData = async (req, res) => {
//   try {
//     if (!req.session.user) {
//       return res.status(401).json({ message: "Unauthorized: No session" });
//     }

//     const { id: userId, role } = req.session.user;

//     /* ================= CURRENT USER ================= */
//     const [userResult] = await db.query(
//       "SELECT name FROM users WHERE user_id = ?",
//       [userId]
//     );
//     const currentUserName = userResult[0]?.name || '';

//     /* ================= MAIN QUERY ================= */
//     let query = `
//       SELECT 
//         rd.master_id,

//         -- MAIN RAW DATA
//         IFNULL(rd.name, 'Not Available') AS name,
//         IFNULL(rd.number, 'Not Available') AS number,
//         IFNULL(rd.alternate_number, 'Not Available') AS alternate_number,
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
//         IFNULL(rd.time_to_complete, 'Not Available') AS time_to_complete,
//         IFNULL(rd.site_visit_date, 'Not Available') AS site_visit_date,
//         IFNULL(rd.demo_date, 'Not Available') AS demo_date,

//         -- ACTIVITY
//         IFNULL(rd.lead_activity, 0) AS lead_activity,

//         -- NUMBERS
//         IFNULL(rd.ar_number, 'Not Available') AS ar_number,
//         IFNULL(rd.architect_name, 'Not Available') AS architect_name,
//         IFNULL(rd.ca_number, 'Not Available') AS ca_number,
//         IFNULL(rd.e_number, 'Not Available') AS e_number,
//         IFNULL(rd.sm_number, 'Not Available') AS sm_number,
//         IFNULL(rd.pop_number, 'Not Available') AS pop_number,
//         IFNULL(rd.other_number, 'Not Available') AS other_number,

//         -- REMARKS
//         IFNULL(rd.quick_remark, 'Not Available') AS quick_remark,
//         IFNULL(rd.detailed_remark, 'Not Available') AS detailed_remark,

//         -- AREA / CATEGORY / REFERENCE
//         IFNULL(a.area_name, 'Not Available') AS area_name,
//         IFNULL(c.cat_name, 'Not Available') AS cat_name,
//         IFNULL(ref.reference_name, 'Not Available') AS reference_name,

//         -- ASSIGNMENT DATE
//         IFNULL(DATE(asg.assign_date), 'Not Available') AS assign_date,

//         -- LATEST REASSIGNMENT
//         lr.id AS reassignment_id,
//         lr.reassignment_date,
//         lr.assignedTo AS reassigned_to,
//         lr.remark AS reassignment_remark,
//         lr.leadStage AS reassignment_lead_stage,

//         -- USER
//         IFNULL(u.name, 'Not Available') AS telecaller_name,
//         u.user_id AS assigned_to_user_id,

//         -- CALL / PRODUCT
//         MAX(tct.tc_remark) AS call_remark,
//         MAX(tct.tc_call_duration) AS call_duration,
//         GROUP_CONCAT(p.product_name) AS products,

//         -- ✅ NEW: DOCUMENT LOCATION LINK
//         MAX(d.location_link) AS document_location_link

//       FROM raw_data rd

//       LEFT JOIN area a ON rd.area_id = a.area_id
//       LEFT JOIN category c ON rd.cat_id = c.cat_id
//       LEFT JOIN reference ref ON rd.reference_id = ref.reference_id

//       LEFT JOIN assignments asg ON rd.assign_id = asg.assign_id

//       -- LATEST REASSIGNMENT
//       LEFT JOIN (
//         SELECT r1.*, ROW_NUMBER() OVER (PARTITION BY master_id ORDER BY id DESC) rn
//         FROM reassignment r1
//       ) lr ON rd.master_id = lr.master_id AND lr.rn = 1

//       LEFT JOIN users u ON lr.assignedTo = u.name
//       LEFT JOIN tele_caller_table tct ON rd.master_id = tct.master_id
//       LEFT JOIN product_mapping pm ON rd.master_id = pm.master_id
//       LEFT JOIN product p ON p.product_id = pm.product_id

//       -- ✅ NEW: DOCUMENTS JOIN
//       LEFT JOIN documents d ON d.master_id = rd.master_id
//     `;


// const params = [];


//     /* ================= ROLE FILTER ================= */
//     if (isTelecallerLike(role)) {
//       query += ` WHERE lr.assignedTo = ?`;
//       params.push(currentUserName);
//     } else if (isAdminLike(role)) {
//       query += ` WHERE rd.status IN ('Assigned', 'Not Interested')`;
//     } else if (!isManagementLike(role)) {
//       query += ` WHERE lr.assignedTo = ?`;
//       params.push(currentUserName);
//     }

//     query += ` GROUP BY rd.master_id ORDER BY rd.master_id DESC`;

//     const [rows] = await db.query(query, params);

//     /* ================= OTHER INPUTS ================= */
//     const masterIds = rows.map(r => r.master_id);
//     let otherInputsRows = [];

//     if (masterIds.length) {
//       const [otherInputs] = await db.query(
//         `SELECT master_id, cat_id, reference_id, input_text
//          FROM raw_data_other_inputs
//          WHERE master_id IN (?)
//          ORDER BY created_at DESC`,
//         [masterIds]
//       );
//       otherInputsRows = otherInputs;
//     }

//     /* ================= REASSIGNMENT HISTORY ================= */
//     let reassignmentRows = [];
//     if (masterIds.length) {
//       const [reassignments] = await db.query(
//         `SELECT rm.*, u.name, u.role
//          FROM reassignment rm
//          LEFT JOIN users u ON u.user_id = rm.created_by_user
//          WHERE rm.master_id IN (?)
//          ORDER BY rm.reassignment_date DESC, rm.created_at DESC`,
//         [masterIds]
//       );
//       reassignmentRows = reassignments;
//     }

//     /* ================= FINAL MAP ================= */
//     const formattedRows = rows.map(row => {
//       const rowCatId = parseInt(row.cat_id);
//       const rowRefId = parseInt(row.reference_id);

//       const categoryOther =
//         otherInputsRows.find(
//           oi => oi.master_id === row.master_id && oi.cat_id === rowCatId
//         )?.input_text || '';

//       const referenceOther =
//         otherInputsRows.find(
//           oi => oi.master_id === row.master_id && oi.reference_id === rowRefId
//         )?.input_text || '';

//       const reassignments = reassignmentRows
//         .filter(r => r.master_id === row.master_id)
//         .map(r => ({
//           remark: r.remark || '',
//           assignedTo: r.assignedTo || '',
//           leadStage: r.leadStage || '',
//           created_by_user: r.created_by_user || '',
//           created_at: r.created_at ? new Date(r.created_at).toLocaleString('en-GB') : '',
//           reassignment_date: r.reassignment_date ? new Date(r.reassignment_date).toLocaleString('en-GB') : '',
//           name: r.name || '',
//           role: r.role || ''
//         }));

//       return {
//         ...row,
//         category_other: categoryOther,
//         reference_other: referenceOther,
//         reassignment_remarks: reassignments,
//         latest_assignedTo: reassignments[0]?.assignedTo || '',
//         latest_leadStage: reassignments[0]?.leadStage || '',
//         assign_date: row.assign_date
//       };
//     });

//     return res.status(200).json(formattedRows);

//   } catch (error) {
//     console.error("❌ Error in getCompleteRawData:", error);
//     res.status(500).json({ message: "Failed to fetch data" });
//   }
// };



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

        -- DOCUMENT LOCATION LINK
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
      LEFT JOIN documents d ON d.master_id = rd.master_id

      WHERE 1=1
AND rd.lead_stage NOT IN ('Drop', 'Closed Deal', 'lost')
    `;

    const params = [];

    /* ================= ROLE FILTER ================= */
    if (isTelecallerLike(role)) {
      query += ` AND lr.assignedTo = ?`;
      params.push(currentUserName);
    } 
    else if (isAdminLike(role)) {
      query += ` AND rd.status IN ('Assigned', 'Not Interested')`;
    } 
    else if (!isManagementLike(role)) {
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

//fev 


// Toggle favorite (add/remove)
export const toggleFavorite = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ success: false, message: "Unauthorized: No session" });
        }

        const { master_id } = req.params;
        const user_id = req.session.user.id;

        if (!master_id) {
            return res.status(400).json({ success: false, message: "master_id is required" });
        }

        // Check if favorite exists
        const [existing] = await db.query(
            "SELECT id FROM favorite_leads WHERE master_id = ? AND user_id = ?",
            [master_id, user_id]
        );

        if (existing.length > 0) {
            // Remove favorite
            await db.query(
                "DELETE FROM favorite_leads WHERE master_id = ? AND user_id = ?",
                [master_id, user_id]
            );
            return res.status(200).json({ 
                success: true, 
                is_favorite: false,
                message: "Removed from favorites" 
            });
        } else {
            // Add favorite
            await db.query(
                "INSERT INTO favorite_leads (master_id, user_id) VALUES (?, ?)",
                [master_id, user_id]
            );
            return res.status(200).json({ 
                success: true, 
                is_favorite: true,
                message: "Added to favorites" 
            });
        }

    } catch (error) {
        console.error("❌ Error in toggleFavorite:", error);
        res.status(500).json({ success: false, message: "Failed to toggle favorite" });
    }
};

// Get all favorite leads for current user
export const getFavorites = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ success: false, message: "Unauthorized: No session" });
        }

        const user_id = req.session.user.id;

        const [favorites] = await db.query(
            `SELECT fl.master_id, fl.created_at, 
                    rd.name, rd.number, rd.city, rd.lead_stage, rd.followup_date,
                    lr.assignedTo as assigned_to
             FROM favorite_leads fl
             LEFT JOIN raw_data rd ON fl.master_id = rd.master_id
             LEFT JOIN (SELECT r1.* FROM reassignment r1 
                        INNER JOIN (SELECT master_id, MAX(id) as max_id 
                                    FROM reassignment GROUP BY master_id) r2 
                        ON r1.master_id = r2.master_id AND r1.id = r2.max_id) lr 
             ON rd.master_id = lr.master_id
             WHERE fl.user_id = ?
             ORDER BY fl.created_at DESC`,
            [user_id]
        );

        return res.status(200).json({ 
            success: true, 
            favorites: favorites 
        });

    } catch (error) {
        console.error("❌ Error in getFavorites:", error);
        res.status(500).json({ success: false, message: "Failed to fetch favorites" });
    }
};

// Check if specific lead is favorite
export const checkFavorite = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ success: false, message: "Unauthorized: No session" });
        }

        const { master_id } = req.params;
        const user_id = req.session.user.id;

        const [result] = await db.query(
            "SELECT id FROM favorite_leads WHERE master_id = ? AND user_id = ?",
            [master_id, user_id]
        );

        return res.status(200).json({ 
            success: true, 
            is_favorite: result.length > 0 
        });

    } catch (error) {
        console.error("❌ Error in checkFavorite:", error);
        res.status(500).json({ success: false, message: "Failed to check favorite status" });
    }
};

// Get favorite statuses for multiple leads (for batch checking)
export const getFavoritesBatch = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ success: false, message: "Unauthorized: No session" });
        }

        const { master_ids } = req.body;
        
        if (!master_ids || !Array.isArray(master_ids) || master_ids.length === 0) {
            return res.status(400).json({ success: false, message: "master_ids array is required" });
        }

        const user_id = req.session.user.id;
        
        const placeholders = master_ids.map(() => '?').join(',');
        const [favorites] = await db.query(
            `SELECT master_id FROM favorite_leads 
             WHERE user_id = ? AND master_id IN (${placeholders})`,
            [user_id, ...master_ids]
        );

        const favoriteMap = {};
        favorites.forEach(fav => {
            favoriteMap[fav.master_id] = true;
        });

        return res.status(200).json({ 
            success: true, 
            favorites: favoriteMap 
        });

    } catch (error) {
        console.error("❌ Error in getFavoritesBatch:", error);
        res.status(500).json({ success: false, message: "Failed to fetch favorites batch" });
    }
};



const normalizeName = (name = "") =>
  name
    .toString()
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();


export const importRawData = async (req, res) => {
  try {
    console.log('📥 Import request received');
    
    if (!req.session.user) {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "File is required!" });
    }

    const created_by_user = req.session.user.id;
    console.log('👤 User ID:', created_by_user);

    const workbook = XLSX.read(file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const excelRows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    console.log('📊 Excel rows:', excelRows.length);

    if (!excelRows || excelRows.length === 0) {
      return res.status(400).json({ message: "Excel file is empty!" });
    }

    // 🔥 DEBUG: Log first few rows
    console.log('First 2 rows sample:', excelRows.slice(0, 2));

    const cleanNumber = (num) => {
      if (!num) return "";
      console.log('Cleaning number:', num);
      let x = String(num).replace(/\D/g, "");
      if (x.startsWith("91") && x.length > 10) x = x.slice(2);
      const result = x.slice(-10);
      console.log('Cleaned to:', result);
      return result;
    };

    const parseExcelDate = (value) => {
      if (!value) return null;
      console.log('Parsing date:', value);
      
      // Handle Excel serial numbers
      if (!isNaN(value)) {
        console.log('Excel serial number detected:', value);
        try {
          const d = XLSX.SSF.parse_date_code(value);
          const date = new Date(d.y, d.m - 1, d.d);
          console.log('Parsed serial to date:', date);
          return date;
        } catch (err) {
          console.error('Error parsing Excel date:', err);
          return null;
        }
      }
      
      // Handle string dates
      const parsed = new Date(value);
      const isValid = !isNaN(parsed.getTime());
      console.log('String date parsed:', parsed, 'Valid:', isValid);
      return isValid ? parsed : null;
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

    let successCount = 0;
    let duplicateEntries = [];
    let errorEntries = [];

    console.log('🔍 Starting row processing...');

    for (let i = 0; i < excelRows.length; i++) {
      const excelRow = excelRows[i];
      const rowNumber = i + 1;
      console.log(`\n--- Processing Row ${rowNumber} ---`);
      console.log('Raw row:', excelRow);

      let mapped = {};

      Object.keys(excelRow).forEach((col) => {
        const mappedCol = columnMap[col];
        if (mappedCol) {
          mapped[mappedCol] = excelRow[col];
          console.log(`Mapped "${col}" -> "${mappedCol}": ${excelRow[col]}`);
        } else {
          console.log(`⚠️ Column "${col}" not in mapping`);
        }
      });

      console.log('Mapped data:', mapped);

      // Check for required fields
      if (!mapped.name || !mapped.number) {
        const errorMsg = !mapped.name && !mapped.number 
          ? "Missing both name and contact number" 
          : !mapped.name 
            ? "Missing name" 
            : "Missing contact number";
        
        console.log(`❌ Row ${rowNumber}: ${errorMsg}`);
        
        errorEntries.push({
          row: rowNumber,
          name: mapped.name || 'N/A',
          number: mapped.number || 'N/A',
          reason: errorMsg
        });
        continue;
      }

      const cleanedMobile = cleanNumber(mapped.number);
      console.log(`Cleaned mobile for "${mapped.name}": ${cleanedMobile}`);

      if (cleanedMobile.length !== 10) {
        console.log(`❌ Row ${rowNumber}: Invalid mobile number length: ${cleanedMobile}`);
        
        errorEntries.push({
          row: rowNumber,
          name: mapped.name,
          number: mapped.number,
          reason: `Invalid mobile number (${cleanedMobile}) - must be 10 digits`
        });
        continue;
      }

      if (!mapped.assigned_to) {
        console.log(`❌ Row ${rowNumber}: Missing telecaller name`);
        
        errorEntries.push({
          row: rowNumber,
          name: mapped.name,
          number: cleanedMobile,
          reason: "Telecaller name is required"
        });
        continue;
      }

      console.log(`🔍 Checking telecaller: "${mapped.assigned_to.trim()}"`);
      

      const rawAssignedName = mapped.assigned_to;
const assignedName = normalizeName(rawAssignedName);


const [userCheck] = await db.query(
  `SELECT user_id, role, name
   FROM users
   WHERE LOWER(TRIM(REPLACE(name, '  ', ' '))) = ?
   AND role IN (${TELECALLER_ROLES.map(() => '?').join(',')})
   AND status = 'active'
   LIMIT 1`,
  [assignedName, ...TELECALLER_ROLES]
);





      console.log('Telecaller query result:', userCheck);

     
      if (userCheck.length === 0) {
  const cleanedInput = normalizeName(mapped.assigned_to)
    .replace(/\b\w/g, c => c.toUpperCase());

  errorEntries.push({
    row: rowNumber,
    name: mapped.name,
    number: cleanedMobile,
    reason: `User name mismatch or inactive user. Please check spelling & extra spaces. (Excel: "${mapped.assigned_to}")`
  });
  continue;
}



      const assigned_to_user_id = userCheck[0].user_id;
      console.log(`✅ Telecaller found: ID ${assigned_to_user_id}`);

      // Check for duplicate contact
      console.log(`🔍 Checking duplicate for number: ${cleanedMobile}`);
      
      const [existingContact] = await db.query(
        `SELECT master_id, name FROM raw_data WHERE number = ? LIMIT 1`,
        [cleanedMobile]
      );

      console.log('Duplicate check result:', existingContact);

      if (existingContact.length > 0) {
        console.log(`⚠️ Row ${rowNumber}: Duplicate found for number ${cleanedMobile}`);
        
        duplicateEntries.push({
          row: rowNumber,
          name: mapped.name,
          number: cleanedMobile,
          existingName: existingContact[0].name,
          existingId: existingContact[0].master_id,
          reason: "Contact number already exists"
        });
        continue;
      }

      // Parse dates
      const assignDate = parseExcelDate(mapped.assign_date) || new Date();
      const followDate = parseExcelDate(mapped.followup_date);
      
      console.log(`📅 Dates - Assign: ${assignDate}, Followup: ${followDate}`);

      try {
        console.log(`📝 Inserting into assignments...`);
        
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
        console.log(`✅ Assignment created: ID ${assign_id}`);

        // INSERT INTO raw_data
        console.log(`📝 Inserting into raw_data...`);
        
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
        console.log(`✅ Raw data created: Master ID ${master_id}`);

        // INSERT INTO reassignment
        console.log(`📝 Inserting into reassignment...`);
        
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
            created_by_user,                       
            mapped.assigned_to,
            mapped.lead_stage || "Not Available",
            mapped.remark ?? null,
            followDate || new Date()
          ]
        );

        console.log(`✅ Row ${rowNumber} fully processed!`);
        successCount++;
      } catch (dbError) {
        console.error(`❌ Database error in row ${rowNumber}:`, dbError);
        
        errorEntries.push({
          row: rowNumber,
          name: mapped.name,
          number: cleanedMobile,
          reason: `Database error: ${dbError.message}`
        });
      }
    }

    console.log('\n📊 FINAL RESULTS:');
    console.log(`- Total rows: ${excelRows.length}`);
    console.log(`- Success: ${successCount}`);
    console.log(`- Duplicates: ${duplicateEntries.length}`);
    console.log(`- Errors: ${errorEntries.length}`);
    console.log('First few errors:', errorEntries.slice(0, 3));
    console.log('First few duplicates:', duplicateEntries.slice(0, 3));

    // 🔥 RETURN DETAILED RESPONSE
    res.status(200).json({
      message: `Import completed. Success: ${successCount}, Duplicates: ${duplicateEntries.length}, Errors: ${errorEntries.length}`,
      status: "success",
      summary: {
        total: excelRows.length,
        success: successCount,
        duplicates: duplicateEntries.length,
        errors: errorEntries.length
      },
      duplicates: duplicateEntries,
      errors: errorEntries
    });

  } catch (error) {
    console.error("❌ Import error:", error);
    res.status(500).json({ 
      message: "Server error while importing data.",
      error: error.message 
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
    // DUPLICATE CONTACT CHECK
    // ----------------------------------
    const [existingContact] = await db.query(
      `SELECT master_id, name FROM raw_data WHERE number = ? LIMIT 1`,
      [number]
    );

    if (existingContact.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Contact number already exists in the system",
        duplicate: {
          master_id: existingContact[0].master_id,
          name: existingContact[0].name,
          contact: number
        }
      });
    }

    // ----------------------------------
    // GET ASSIGNED USER
    // ----------------------------------

    const assignedUserId = assigned_to_user_id || created_by_user;
let assignedUserName = "Unknown";

// 🔐 Validate assigned user role
const [userRow] = await db.execute(
  `SELECT name, role 
   FROM users 
   WHERE user_id = ?
   AND role IN (${TELECALLER_ROLES.map(() => '?').join(',')})
   LIMIT 1`,
  [assignedUserId, ...TELECALLER_ROLES]
);

if (!userRow.length) {
  return res.status(400).json({
    success: false,
    message: "Assigned user not found or role not allowed for lead assignment"
  });
}

assignedUserName = userRow[0].name;



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

export const updateRawData1 = async (req, res) => {
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
      followup_date ,
        detailed_remark,  // ← ADD THIS LINE

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
        
        if (sortedPrevious !== sortedNew || (assignedTo && assignedTo.length)) {
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
} else if (quick_remark && quick_remark.trim() !== '') {
  // If detailed_remark is empty but quick_remark is selected, use quick_remark
  finalRemark = quick_remark;
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
      followup_date, followup_time,  // ✅ ADD THIS - Time field
      assign_date,
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
      followup_date,
      followup_time,  // ✅ ADD THIS - Time field
      detailed_remark,
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
        
        if (sortedPrevious !== sortedNew || (assignedTo && assignedTo.length)) {
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
      } else if (quick_remark && quick_remark.trim() !== '') {
        // If detailed_remark is empty but quick_remark is selected, use quick_remark
        finalRemark = quick_remark;
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

// Add this function in your controller
export const updateContactNumbersOnly = async (req, res) => {
  try {
    const { master_id } = req.params;

    if (!master_id) {
      return res.status(400).json({ message: "master_id is required" });
    }

    console.log("📥 Incoming Contact Numbers Update Payload:", req.body);

    const {
      ar_number,      // Architect Number
      architect_name, // Architect Name
      ca_number,      // Carpenter Number
      e_number,       // Electrician Number
      sm_number,      // Site Manager Number
      pop_number,     // POP Number
      other_number    // Other Number
    } = req.body;

    // Build update object with only contact number fields
    const updateFields = [];
    const values = [];

    // Helper function to check if value is valid (not undefined, not null, not empty string)
    const isValidValue = (value) => {
      return value !== undefined && value !== null && value !== '';
    };

    // Add each field if it has a valid value
    if (isValidValue(ar_number)) {
      updateFields.push("ar_number = ?");
      values.push(ar_number);
    }

    if (isValidValue(architect_name)) {
      updateFields.push("architect_name = ?");
      values.push(architect_name);
    }

    if (isValidValue(ca_number)) {
      updateFields.push("ca_number = ?");
      values.push(ca_number);
    }

    if (isValidValue(e_number)) {
      updateFields.push("e_number = ?");
      values.push(e_number);
    }

    if (isValidValue(sm_number)) {
      updateFields.push("sm_number = ?");
      values.push(sm_number);
    }

    if (isValidValue(pop_number)) {
      updateFields.push("pop_number = ?");
      values.push(pop_number);
    }

    if (isValidValue(other_number)) {
      updateFields.push("other_number = ?");
      values.push(other_number);
    }

    // If no fields to update, return early
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update"
      });
    }

    // Update only the contact number fields
    values.push(master_id);
    await db.execute(
      `UPDATE raw_data SET ${updateFields.join(", ")} WHERE master_id = ?`,
      values
    );

    // Fetch updated data to return in response
    const [updatedData] = await db.execute(
      `SELECT master_id, ar_number, architect_name, ca_number, e_number, sm_number, pop_number, other_number 
       FROM raw_data WHERE master_id = ?`,
      [master_id]
    );

    res.status(200).json({
      success: true,
      message: "Contact numbers updated successfully",
      updated_fields: updateFields.map(f => f.split(' = ')[0]),
      data: updatedData[0] || null
    });

  } catch (err) {
    console.error("❌ updateContactNumbersOnly error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};

// ✅ MIME → EXTENSION MAP (FIXES jpeg issue)
const mimeExtensionMap = {
  'image/jpeg': '.jpeg',
  'image/jpg': '.jpg',
  'image/pjpeg': '.jpeg', // Add alternative JPEG MIME types
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/bmp': '.bmp',
  'image/svg+xml': '.svg',

  'video/mp4': '.mp4',
  'video/quicktime': '.mov',
  'video/x-msvideo': '.avi',
  'video/x-matroska': '.mkv',
  'video/webm': '.webm',
  'video/3gpp': '.3gp',

  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.ms-excel': '.xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  'application/vnd.ms-powerpoint': '.ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
  'application/zip': '.zip',
  'application/x-rar-compressed': '.rar',
  'text/plain': '.txt',
  'text/csv': '.csv',
};



// export const uploadDocuments = async (req, res) => {
//   try {
//     const { master_id } = req.params;

//     if (!master_id) {
//       return res.status(400).json({ message: 'master_id is required' });
//     }

//     if (!req.files || !req.files.files) {
//       return res.status(400).json({ message: 'No files uploaded' });
//     }

//     const {
//       location_link,
//       remark,
//       detailed_remark,
//       reassignment_remark,
//       new_remark
//     } = req.body;

//     const finalRemark =
//       detailed_remark ||
//       reassignment_remark ||
//       new_remark ||
//       remark ||
//       null;

//     const filesArray = Array.isArray(req.files.files)
//       ? req.files.files
//       : [req.files.files];

//     const docValues = [];
//     const uploadedDocs = [];

//     for (const file of filesArray) {
//       // ✅ REAL ORIGINAL NAME
//       const originalName = file.name;

//       // ✅ EXTENSION FROM MIME TYPE (NOT filename)
//       const safeExt =
//         mimeExtensionMap[file.mimetype] ||
//         path.extname(originalName).toLowerCase() ||
//         '.bin';

//       // ✅ CLEAN BASE NAME
//       const baseName = path
//         .basename(originalName, path.extname(originalName))
//         .replace(/[^a-zA-Z0-9]/g, '_');

//       // ✅ FINAL SAFE FILE NAME
//       const fileName = `${master_id}_${Date.now()}_${baseName}${safeExt}`;

//       // ✅ FILE TYPE
//       const fileType = file.mimetype.startsWith('image/')
//         ? 'image'
//         : file.mimetype.startsWith('video/')
//         ? 'video'
//         : 'document';

//       // ✅ UPLOAD DIRECTORY
//       const uploadDir = path.join('uploads', fileType);
//       if (!fs.existsSync(uploadDir)) {
//         fs.mkdirSync(uploadDir, { recursive: true });
//       }

//       // ✅ SAVE FILE
//       const savePath = path.join(uploadDir, fileName);
//       await file.mv(savePath);

//       // ✅ PATH FOR DB
//       const dbPath = path.join(fileType, fileName).replace(/\\/g, '/');

//       // ✅ DB VALUES - Match your table columns exactly
//       docValues.push([
//         master_id,           // master_id (varchar)
//         dbPath,              // document_path
//         fileType,            // document_type
//         location_link || null, // location_link
//         finalRemark          // remark
//         // Note: uploaded_at is automatic (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
//       ]);

//       uploadedDocs.push({
//         document_path: dbPath,
//         document_type: fileType,
//         original_name: originalName
//       });
//     }

//     // ✅ BULK INSERT - Match your table columns
//     await db.query(
//       `INSERT INTO documents
//        (master_id, document_path, document_type, location_link, remark)
//        VALUES ?`,
//       [docValues]
//     );

//     return res.status(200).json({
//       success: true,
//       message: 'Documents uploaded successfully',
//       documents: uploadedDocs
//     });

//   } catch (error) {
//     console.error('❌ uploadDocuments error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Server error during upload',
//       error: error.message
//     });
//   }
// };



export const uploadDocuments = async (req, res) => {
  try {
    const { master_id } = req.params;

    if (!master_id) {
      return res.status(400).json({ message: 'master_id is required' });
    }

    if (!req.files || !req.files.files) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const {
      location_link,
      remark,
      detailed_remark,
      reassignment_remark,
      new_remark,
      followup_date,
      leadStage,
      assignedTo
    } = req.body;

    /* ======================================================
       🔹 MINIMAL REQUIRED LOGS
    ====================================================== */
    console.log('UPLOAD REQUEST:', {
      master_id,
      assignedTo,
      followup_date,
      leadStage
    });

    /* ======================================================
       🔹 NORMALIZE assignedTo (🔥 FIX)
    ====================================================== */
    let assignedToArray = [];

    if (Array.isArray(assignedTo)) {
      assignedToArray = assignedTo;
    } else if (typeof assignedTo === 'string' && assignedTo.trim() !== '') {
      assignedToArray = assignedTo.split(',').map(v => v.trim());
    }

    console.log('assignedTo normalized:', assignedToArray);

    const finalRemark =
      detailed_remark ||
      reassignment_remark ||
      new_remark ||
      remark ||
      null;

    const filesArray = Array.isArray(req.files.files)
      ? req.files.files
      : [req.files.files];

    const docValues = [];
    const uploadedDocs = [];

    const updated_fields = {
      raw_data_followup_date: false,
      raw_data_lead_stage: false,
      raw_data_detailed_remark: false,
      reassignments_created: 0,
      documents_created: 0
    };

    /* ======================================================
       🔹 UPDATE raw_data
    ====================================================== */
    if (followup_date) {
      await db.query(
        `UPDATE raw_data SET followup_date = ? WHERE master_id = ?`,
        [followup_date, master_id]
      );
      updated_fields.raw_data_followup_date = true;
    }

    if (leadStage) {
      await db.query(
        `UPDATE raw_data SET lead_stage = ? WHERE master_id = ?`,
        [leadStage, master_id]
      );
      updated_fields.raw_data_lead_stage = true;
    }

    if (detailed_remark && detailed_remark.trim() !== '') {
      await db.query(
        `UPDATE raw_data SET detailed_remark = ? WHERE master_id = ?`,
        [detailed_remark, master_id]
      );
      updated_fields.raw_data_detailed_remark = true;
    }

    /* ======================================================
       🔹 CREATE REASSIGNMENT (FIXED)
    ====================================================== */
    let reassignments = [];

    if (assignedToArray.length > 0) {
      const created_by_user = req.session?.user?.id || 0;

      const [assignData] = await db.query(
        `SELECT assign_id FROM raw_data WHERE master_id = ?`,
        [master_id]
      );

      let assign_id = assignData.length ? assignData[0].assign_id : null;

      if (!assign_id) {
        const [newAssign] = await db.execute(
          `INSERT INTO assignments (assign_date) VALUES (NOW())`
        );
        assign_id = newAssign.insertId;

        await db.execute(
          `UPDATE raw_data SET assign_id = ? WHERE master_id = ?`,
          [assign_id, master_id]
        );
      }

      const reassignment_date =
        followup_date || new Date().toISOString().split('T')[0];

      console.log('Creating reassignment for users:', assignedToArray);

      for (const userId of assignedToArray) {
        if (!userId) continue;

        let assignedName = userId;

        if (!isNaN(userId)) {
          const [userRow] = await db.query(
            `SELECT name FROM users WHERE user_id = ?`,
            [userId]
          );
          if (userRow.length) assignedName = userRow[0].name;
        }

        const reassignmentRemark =
          detailed_remark || finalRemark || 'Document uploaded';

        const [insertRes] = await db.query(
          `INSERT INTO reassignment
           (assign_id, master_id, created_by_user, assignedTo, leadStage, remark, reassignment_date, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
          [
            assign_id,
            master_id,
            created_by_user,
            assignedName,
            leadStage || 'Cold Lead',
            reassignmentRemark,
            reassignment_date
          ]
        );

        reassignments.push({
          id: insertRes.insertId,
          userId,
          assignedName
        });

        updated_fields.reassignments_created++;
      }
    }

    /* ======================================================
       🔹 DOCUMENT UPLOAD
    ====================================================== */
    for (const file of filesArray) {
      const originalName = file.name;
      const ext = path.extname(originalName);
      const safeName = `${master_id}_${Date.now()}_${originalName.replace(/\s+/g, '_')}`;

      const fileType = file.mimetype.startsWith('image/')
        ? 'image'
        : file.mimetype.startsWith('video/')
        ? 'video'
        : 'document';

      const uploadDir = path.join('uploads', fileType);
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

      const savePath = path.join(uploadDir, safeName);
      await file.mv(savePath);

      const dbPath = `${fileType}/${safeName}`;

      docValues.push([
        master_id,
        dbPath,
        fileType,
        location_link || null,
        detailed_remark || finalRemark
      ]);

      uploadedDocs.push({ document_path: dbPath, document_type: fileType });
      updated_fields.documents_created++;
    }

    if (docValues.length) {
      await db.query(
        `INSERT INTO documents
         (master_id, document_path, document_type, location_link, remark)
         VALUES ?`,
        [docValues]
      );
    }

    console.log('SUMMARY:', updated_fields);

    return res.status(200).json({
      success: true,
      summary: {
        files_uploaded: uploadedDocs.length,
        reassignments_added: updated_fields.reassignments_created,
        documents_created: updated_fields.documents_created
      },
      updated_fields,
      reassignments,
      documents: uploadedDocs
    });

  } catch (error) {
    console.error('UPLOAD ERROR:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error during upload'
    });
  }
};

export const updateLocationLink = async (req, res) => {
  try {
    const { master_id } = req.params;
    const { location_link } = req.body;

    if (!master_id) {
      return res.status(400).json({ message: 'master_id is required' });
    }

    if (!location_link) {
      return res.status(400).json({ message: 'location_link is required' });
    }

    // 🔥 FIRST: Check if any document exists for this master_id
    const [existingDocs] = await db.query(
      `SELECT doc_id FROM documents WHERE master_id = ? LIMIT 1`,
      [master_id]
    );

    if (existingDocs.length > 0) {
      // ✅ UPDATE existing document
      await db.query(
        `UPDATE documents SET location_link = ? WHERE master_id = ?`,
        [location_link, master_id]
      );
      console.log(`✅ Updated location_link for master_id: ${master_id}`);
    } else {
      // ✅ CREATE new entry with location_link
      // 🔥 FIX: Use 'uploaded_at' instead of 'created_at'
      await db.query(
        `INSERT INTO documents (master_id, location_link, document_type, uploaded_at) 
         VALUES (?, ?, 'link', NOW())`,
        [master_id, location_link]
      );
      console.log(`✅ Created new location entry for master_id: ${master_id}`);
    }

    return res.status(200).json({
      success: true,
      message: existingDocs.length > 0 
        ? 'Location link updated successfully' 
        : 'Location link created successfully'
    });

  } catch (error) {
    console.error('UPDATE LOCATION ERROR:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error during location update'
    });
  }
};


export const deleteDocument = async (req, res) => {
  try {
    const { doc_id } = req.params; // Correct parameter name from route
    const created_by_user = req.session?.user?.id || null;

    if (!doc_id) {
      return res.status(400).json({ message: "doc_id is required" });
    }

    // First, fetch the document details to get the file path
    const [documentRows] = await db.query(
      `SELECT document_path FROM documents WHERE doc_id = ?`,
      [doc_id]
    );

    if (documentRows.length === 0) {
      return res.status(404).json({ message: "Document not found" });
    }

    const documentPath = documentRows[0].document_path;

    // Delete the physical file from the filesystem
    // Note: Make sure documentPath is relative to your server root
    const fullPath = path.join(__dirname, '..', documentPath);
    
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log(`🗑️ Deleted file: ${fullPath}`);
    } else {
      console.log(`⚠️ File not found at: ${fullPath}`);
    }

    // Delete the record from the database
    await db.query(
      `DELETE FROM documents WHERE doc_id = ?`,
      [doc_id]
    );

    return res.status(200).json({
      success: true,
      message: "Document deleted successfully"
    });

  } catch (error) {
    console.error("❌ deleteDocument error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during deletion",
      error: error.message
    });
  }
};



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
       STEP 1: Resolve assign_id
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
       STEP 3: Previous reassignment
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
       STEP 4: Insert reassignment
    ------------------------------------------------ */
    for (const user of users) {
      if (!user) continue;

      const finalLeadStage = leadStage || previous?.leadStage || null;
      const finalRemark =
        remark && remark.trim() !== ""
          ? remark
          : previous?.remark || "";

      // Duplicate check
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
        skipped.push({ user, leadStage: finalLeadStage });
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

      inserted.push({ id: insertRes.insertId, user });
    }

    /* ------------------------------------------------
       STEP 5: Sync raw_data (IMPORTANT)
    ------------------------------------------------ */
    await db.execute(
      `UPDATE raw_data
       SET lead_stage      = COALESCE(?, lead_stage),
           followup_date   = COALESCE(?, followup_date),
           detailed_remark = COALESCE(?, detailed_remark)
       WHERE master_id = ?`,
      [
        leadStage || null,
        followup_date || reassignment_date || null,
        remark && remark.trim() !== '' ? remark : null,
        master_id
      ]
    );

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



// export const deleteClient = async (req, res) => {
//   const { master_id } = req.params;
//   const connection = await db.getConnection();

//   try {
//     await connection.beginTransaction();

//     // 1. get assign_id before deleting raw_data
//     const [[lead]] = await connection.query(
//       'SELECT assign_id FROM raw_data WHERE master_id = ?',
//       [master_id]
//     );

//     const assign_id = lead?.assign_id;

//     // 2. delete child table records
//     await connection.query(
//       'DELETE FROM raw_data_other_inputs WHERE master_id = ?',
//       [master_id]
//     );

//     await connection.query(
//       'DELETE FROM reassignment WHERE master_id = ?',
//       [master_id]
//     );

//     // 3. delete main lead
//     await connection.query(
//       'DELETE FROM raw_data WHERE master_id = ?',
//       [master_id]
//     );

//     // 4. delete assignment ONLY if no other leads use it
//     if (assign_id) {
//       const [[count]] = await connection.query(
//         'SELECT COUNT(*) AS total FROM raw_data WHERE assign_id = ?',
//         [assign_id]
//       );

//       if (count.total === 0) {
//         await connection.query(
//           'DELETE FROM assignments WHERE assign_id = ?',
//           [assign_id]
//         );
//       }
//     }

//     await connection.commit();
//     res.json({ message: 'Lead and related assignment deleted successfully' });

//   } catch (err) {
//     await connection.rollback();
//     console.error(err);
//     res.status(500).json({ message: 'Error deleting lead data' });
//   } finally {
//     connection.release();
//   }
// };



export const deleteClient1 = async (req, res) => {
  const { ids } = req.body; // array of master_id

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: 'No client IDs provided' });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    for (const master_id of ids) {

      // 1️⃣ Get assign_id (same as deleteClient)
      const [[lead]] = await connection.query(
        'SELECT assign_id FROM raw_data WHERE master_id = ?',
        [master_id]
      );

      if (!lead) continue; // skip if not found

      const assign_id = lead.assign_id;

      // 2️⃣ Delete child table records
      await connection.query(
        'DELETE FROM raw_data_other_inputs WHERE master_id = ?',
        [master_id]
      );

      await connection.query(
        'DELETE FROM reassignment WHERE master_id = ?',
        [master_id]
      );

      // 3️⃣ Delete main lead
      await connection.query(
        'DELETE FROM raw_data WHERE master_id = ?',
        [master_id]
      );

      // 4️⃣ Delete assignment ONLY if unused (same logic)
      if (assign_id) {
        const [[count]] = await connection.query(
          'SELECT COUNT(*) AS total FROM raw_data WHERE assign_id = ?',
          [assign_id]
        );

        if (count.total === 0) {
          await connection.query(
            'DELETE FROM assignments WHERE assign_id = ?',
            [assign_id]
          );
        }
      }
    }

    await connection.commit();
    res.json({ message: 'Selected leads deleted successfully' });

  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ message: 'Error deleting selected leads' });
  } finally {
    connection.release();
  }
}; 

export const deleteClient = async (req, res) => {
  const { master_id } = req.params;  // Get from URL params, not body

  if (!master_id) {
    return res.status(400).json({ message: 'No client ID provided' });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 1️⃣ Get assign_id
    const [[lead]] = await connection.query(
      'SELECT assign_id FROM raw_data WHERE master_id = ?',
      [master_id]
    );

    if (!lead) {
      await connection.rollback();
      return res.status(404).json({ message: 'Record not found' });
    }

    const assign_id = lead.assign_id;

    // 2️⃣ Delete from child tables first (including quotation related tables if needed)
    await connection.query(
      'DELETE FROM raw_data_other_inputs WHERE master_id = ?',
      [master_id]
    );

    await connection.query(
      'DELETE FROM reassignment WHERE master_id = ?',
      [master_id]
    );

    // ⚠️ IMPORTANT: Check if there are quotation records linked to this master_id
    // If quotation has raw_data foreign key, you need to handle that too
    const [quotationRows] = await connection.query(
      'SELECT qt_id FROM quotation WHERE master_id = ?',
      [master_id]
    );
    
    for (const quotation of quotationRows) {
      // Delete quotation_revision first (child of quotation)
      await connection.query(
        'DELETE FROM quotation_revision WHERE qt_id = ?',
        [quotation.qt_id]
      );
      // Then delete quotation
      await connection.query(
        'DELETE FROM quotation WHERE qt_id = ?',
        [quotation.qt_id]
      );
    }

    // 3️⃣ Delete main lead
    await connection.query(
      'DELETE FROM raw_data WHERE master_id = ?',
      [master_id]
    );

    // 4️⃣ Delete assignment ONLY if unused
    if (assign_id) {
      const [[count]] = await connection.query(
        'SELECT COUNT(*) AS total FROM raw_data WHERE assign_id = ?',
        [assign_id]
      );

      if (count.total === 0) {
        await connection.query(
          'DELETE FROM assignments WHERE assign_id = ?',
          [assign_id]
        );
      }
    }

    await connection.commit();
    res.json({ message: 'Lead deleted successfully' });

  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ message: 'Error deleting lead', error: err.message });
  } finally {
    connection.release();
  }
};




export const deleteMultipleClients1 = async (req, res) => {
  const { ids } = req.body; // array of master_id

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: 'No client IDs provided' });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 1. get all assign_ids related to selected master_ids
    const [rows] = await connection.query(
      `SELECT DISTINCT assign_id 
       FROM raw_data 
       WHERE master_id IN (${ids.map(() => '?').join(',')})
       AND assign_id IS NOT NULL`,
      ids
    );

    const assignIds = rows.map(r => r.assign_id);

    // 2. delete child table records
    await connection.query(
      `DELETE FROM raw_data_other_inputs 
       WHERE master_id IN (${ids.map(() => '?').join(',')})`,
      ids
    );

    await connection.query(
      `DELETE FROM reassignment 
       WHERE master_id IN (${ids.map(() => '?').join(',')})`,
      ids
    );

    // 3. delete main raw data
    await connection.query(
      `DELETE FROM raw_data 
       WHERE master_id IN (${ids.map(() => '?').join(',')})`,
      ids
    );

    // 4. cleanup assignments (only unused ones)
    for (const assign_id of assignIds) {
      const [[count]] = await connection.query(
        'SELECT COUNT(*) AS total FROM raw_data WHERE assign_id = ?',
        [assign_id]
      );

      if (count.total === 0) {
        await connection.query(
          'DELETE FROM assignments WHERE assign_id = ?',
          [assign_id]
        );
      }
    }

    await connection.commit();
    res.json({ message: 'Selected leads deleted successfully' });

  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ message: 'Error deleting selected leads' });
  } finally {
    connection.release();
  }
};


export const deleteMultipleClients = async (req, res) => {
  const { ids, master_ids } = req.body;
  
  // Accept both formats
  const deleteIds = master_ids || ids;

  if (!Array.isArray(deleteIds) || deleteIds.length === 0) {
    return res.status(400).json({ message: 'No client IDs provided' });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Get all assign_ids
    const [rows] = await connection.query(
      `SELECT DISTINCT assign_id 
       FROM raw_data 
       WHERE master_id IN (${deleteIds.map(() => '?').join(',')})
       AND assign_id IS NOT NULL`,
      deleteIds
    );

    const assignIds = rows.map(r => r.assign_id);

    // 2. Delete quotation and quotation_revision records for all master_ids
    for (const master_id of deleteIds) {
      // Get all quotations for this master_id
      const [quotations] = await connection.query(
        'SELECT qt_id FROM quotation WHERE master_id = ?',
        [master_id]
      );
      
      for (const quotation of quotations) {
        // Delete quotation_revision first (child)
        await connection.query(
          'DELETE FROM quotation_revision WHERE qt_id = ?',
          [quotation.qt_id]
        );
        // Delete quotation
        await connection.query(
          'DELETE FROM quotation WHERE qt_id = ?',
          [quotation.qt_id]
        );
      }
    }

    // 3. Delete child table records
    await connection.query(
      `DELETE FROM raw_data_other_inputs 
       WHERE master_id IN (${deleteIds.map(() => '?').join(',')})`,
      deleteIds
    );

    await connection.query(
      `DELETE FROM reassignment 
       WHERE master_id IN (${deleteIds.map(() => '?').join(',')})`,
      deleteIds
    );

    // 4. Delete main raw data
    await connection.query(
      `DELETE FROM raw_data 
       WHERE master_id IN (${deleteIds.map(() => '?').join(',')})`,
      deleteIds
    );

    // 5. Cleanup assignments
    for (const assign_id of assignIds) {
      const [[count]] = await connection.query(
        'SELECT COUNT(*) AS total FROM raw_data WHERE assign_id = ?',
        [assign_id]
      );

      if (count.total === 0) {
        await connection.query(
          'DELETE FROM assignments WHERE assign_id = ?',
          [assign_id]
        );
      }
    }

    await connection.commit();
    res.json({ 
      success: true,
      message: `${deleteIds.length} selected leads deleted successfully` 
    });

  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ 
      success: false,
      message: 'Error deleting selected leads',
      error: err.message 
    });
  } finally {
    connection.release();
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







export const getLeadStage1 = async (req, res) => {
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

export const getLeadStage = async (req, res) => {
  try {
    const query = `SHOW COLUMNS FROM raw_data WHERE Field = 'lead_stage'`;
    const [rows] = await db.query(query);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Field not found' });
    }

    const enumStr = rows[0].Type;

    let values = enumStr
      .match(/enum\((.*)\)/)[1]
      .split(',')
      .map((value) => value.trim().replace(/^'(.*)'$/, '$1'));

    // ✅ FILTER OUT UNWANTED STAGES
    const hiddenStages = ['Quotation Created', 'Execution'];

    values = values.filter(stage => !hiddenStages.includes(stage));

    res.status(200).json(values);
  } catch (error) {
    console.error('Error fetching lead_stage enum options:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


export const getQuickRemark1 = async (req, res) => {
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

    // Filter out the values you don't want to show on frontend
    const filteredValues = values.filter(value => 
      value !== 'Interested' && 
      value !== 'Not Interested' && 
      value !== 'Purchase from other'
    );

    res.status(200).json(filteredValues);
  } catch (error) {
    console.error('Error fetching quick_remark enum options:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



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




// In your backend (e.g., dropLeadsController.js)
export const getDropLeadsFullData1 = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Unauthorized: No session" });
    }

    const { id: userId, role } = req.session.user;
    const today = new Date().toISOString().slice(0, 10);
    
    // Get pagination and filter parameters from query
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // Get filter parameters
    const search = req.query.search || '';
    const entryFromDate = req.query.entryFromDate;
    const entryToDate = req.query.entryToDate;
    const followupFromDate = req.query.followupFromDate;
    const followupToDate = req.query.followupToDate;
    const stages = req.query.stages ? req.query.stages.split(',') : [];
    const users = req.query.users ? req.query.users.split(',') : [];
    const cities = req.query.cities ? req.query.cities.split(',') : [];

    /* ================= CURRENT USER ================= */
    const [userResult] = await db.query(
      "SELECT name FROM users WHERE user_id = ?",
      [userId]
    );
    const currentUserName = userResult[0]?.name || '';

    /* ================= COUNT TOTAL RECORDS ================= */
    let countQuery = `
      SELECT COUNT(DISTINCT rd.master_id) as total
      FROM raw_data rd
      LEFT JOIN (
        SELECT r1.*, ROW_NUMBER() OVER (PARTITION BY master_id ORDER BY id DESC) rn
        FROM reassignment r1
      ) lr ON rd.master_id = lr.master_id AND lr.rn = 1
      WHERE (rd.lead_stage = 'Drop' OR lr.leadStage = 'Drop')
    `;

    let countParams = [];

    /* ================= SEARCH FILTER ================= */
    if (search) {
      countQuery += ` AND (
        rd.name LIKE ? OR 
        rd.number LIKE ? OR 
        rd.email LIKE ? OR 
        rd.address LIKE ? OR 
        rd.city LIKE ? OR 
        rd.lead_stage LIKE ? OR 
        lr.assignedTo LIKE ?
      )`;
      const searchPattern = `%${search}%`;
      countParams.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
    }

    /* ================= DATE FILTERS ================= */
    if (entryFromDate) {
      countQuery += ` AND DATE(rd.assign_date) >= ?`;
      countParams.push(entryFromDate);
    }
    if (entryToDate) {
      countQuery += ` AND DATE(rd.assign_date) <= ?`;
      countParams.push(entryToDate);
    }
    if (followupFromDate) {
      countQuery += ` AND DATE(rd.followup_date) >= ?`;
      countParams.push(followupFromDate);
    }
    if (followupToDate) {
      countQuery += ` AND DATE(rd.followup_date) <= ?`;
      countParams.push(followupToDate);
    }

    /* ================= STAGE FILTER ================= */
    if (stages.length > 0) {
      countQuery += ` AND rd.lead_stage IN (?)`;
      countParams.push(stages);
    }

    /* ================= USER FILTER ================= */
    if (users.length > 0) {
      countQuery += ` AND lr.assignedTo IN (?)`;
      countParams.push(users);
    }

    /* ================= CITY FILTER ================= */
    if (cities.length > 0) {
      countQuery += ` AND rd.city IN (?)`;
      countParams.push(cities);
    }

    /* ================= ROLE FILTER FOR COUNT ================= */
    if (isTelecallerLike(role)) {
      countQuery += ` AND lr.assignedTo = ?`;
      countParams.push(currentUserName);
    } else if (isAdminLike(role)) {
      // no filter
    } else if (!isManagementLike(role)) {
      countQuery += ` AND lr.assignedTo = ?`;
      countParams.push(currentUserName);
    }

    const [countResult] = await db.query(countQuery, countParams);
    const total = countResult[0]?.total || 0;

    /* ================= MAIN QUERY WITH PAGINATION ================= */
    let query = `
      SELECT 
        rd.master_id,
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
        IFNULL(rd.cat_id, 'Not Available') AS cat_id,
        IFNULL(rd.reference_id, 'Not Available') AS reference_id,
        IFNULL(rd.area_id, 'Not Available') AS area_id,
        IFNULL(rd.room_length, 'Not Available') AS room_length,
        IFNULL(rd.room_width, 'Not Available') AS room_width,
        IFNULL(rd.room_height, 'Not Available') AS room_height,
        IFNULL(rd.location_link, 'Not Available') AS location_link,
        IFNULL(rd.p_type, 'Not Available') AS p_type,
        IFNULL(rd.budget_range, 'Not Available') AS budget_range,
        IFNULL(rd.time_to_complete, 'Not Available') AS time_to_complete,
        IFNULL(rd.site_visit_date, 'Not Available') AS site_visit_date,
        IFNULL(rd.demo_date, 'Not Available') AS demo_date,
        IFNULL(rd.lead_activity, 0) AS lead_activity,
        IFNULL(rd.ar_number, 'Not Available') AS ar_number,
        IFNULL(rd.architect_name, 'Not Available') AS architect_name,
        IFNULL(rd.ca_number, 'Not Available') AS ca_number,
        IFNULL(rd.e_number, 'Not Available') AS e_number,
        IFNULL(rd.sm_number, 'Not Available') AS sm_number,
        IFNULL(rd.pop_number, 'Not Available') AS pop_number,
        IFNULL(rd.other_number, 'Not Available') AS other_number,
        IFNULL(rd.quick_remark, 'Not Available') AS quick_remark,
        IFNULL(rd.detailed_remark, 'Not Available') AS detailed_remark,
        IFNULL(a.area_name, 'Not Available') AS area_name,
        IFNULL(c.cat_name, 'Not Available') AS cat_name,
        IFNULL(ref.reference_name, 'Not Available') AS reference_name,
        IFNULL(DATE(asg.assign_date), 'Not Available') AS assign_date,
        lr.id AS reassignment_id,
        lr.reassignment_date,
        lr.assignedTo AS reassigned_to,
        lr.remark AS reassignment_remark,
        lr.leadStage AS reassignment_lead_stage,
        IFNULL(u.name, 'Not Available') AS telecaller_name,
        u.user_id AS assigned_to_user_id,
        MAX(tct.tc_remark) AS call_remark,
        MAX(tct.tc_call_duration) AS call_duration,
        GROUP_CONCAT(p.product_name) AS products,
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

      WHERE (rd.lead_stage = 'Drop' OR lr.leadStage = 'Drop')
    `;

    let params = [];

    /* ================= SEARCH FILTER ================= */
    if (search) {
      query += ` AND (
        rd.name LIKE ? OR 
        rd.number LIKE ? OR 
        rd.email LIKE ? OR 
        rd.address LIKE ? OR 
        rd.city LIKE ? OR 
        rd.lead_stage LIKE ? OR 
        lr.assignedTo LIKE ?
      )`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
    }

    /* ================= DATE FILTERS ================= */
    if (entryFromDate) {
      query += ` AND DATE(rd.assign_date) >= ?`;
      params.push(entryFromDate);
    }
    if (entryToDate) {
      query += ` AND DATE(rd.assign_date) <= ?`;
      params.push(entryToDate);
    }
    if (followupFromDate) {
      query += ` AND DATE(rd.followup_date) >= ?`;
      params.push(followupFromDate);
    }
    if (followupToDate) {
      query += ` AND DATE(rd.followup_date) <= ?`;
      params.push(followupToDate);
    }

    /* ================= STAGE FILTER ================= */
    if (stages.length > 0) {
      query += ` AND rd.lead_stage IN (?)`;
      params.push(stages);
    }

    /* ================= USER FILTER ================= */
    if (users.length > 0) {
      query += ` AND lr.assignedTo IN (?)`;
      params.push(users);
    }

    /* ================= CITY FILTER ================= */
    if (cities.length > 0) {
      query += ` AND rd.city IN (?)`;
      params.push(cities);
    }

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

    query += ` GROUP BY rd.master_id ORDER BY rd.master_id DESC LIMIT ? OFFSET ?`;
    
    // Add pagination parameters
    params.push(limit, offset);

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

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      total: total,
      currentPage: page,
      totalPages: totalPages,
      limit: limit,
      dropLeads: formattedRows,
      showing: {
        from: offset + 1,
        to: Math.min(offset + limit, total),
        total: total
      }
    });

  } catch (error) {
    console.error("❌ Error in getDropLeadsFullData:", error);
    res.status(500).json({ message: "Failed to fetch drop leads data" });
  }
};

// In your backend (e.g., dropLeadsController.js)
export const getDropLeadsFullData = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Unauthorized: No session" });
    }

    const { id: userId, role } = req.session.user;
    const today = new Date().toISOString().slice(0, 10);
    
    // Get pagination and filter parameters from query
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // Get filter parameters
    const search = req.query.search || '';
    const entryFromDate = req.query.entryFromDate;
    const entryToDate = req.query.entryToDate;
    const followupFromDate = req.query.followupFromDate;
    const followupToDate = req.query.followupToDate;
    const stages = req.query.stages ? req.query.stages.split(',') : [];
    const users = req.query.users ? req.query.users.split(',') : [];
    const cities = req.query.cities ? req.query.cities.split(',') : [];

    /* ================= CURRENT USER ================= */
    const [userResult] = await db.query(
      "SELECT name FROM users WHERE user_id = ?",
      [userId]
    );
    const currentUserName = userResult[0]?.name || '';

    /* ================= COUNT TOTAL RECORDS ================= */
    let countQuery = `
      SELECT COUNT(DISTINCT rd.master_id) as total
      FROM raw_data rd
      LEFT JOIN (
        SELECT r1.*, ROW_NUMBER() OVER (PARTITION BY master_id ORDER BY id DESC) rn
        FROM reassignment r1
      ) lr ON rd.master_id = lr.master_id AND lr.rn = 1
      WHERE (rd.lead_stage IN ('Drop', 'lost') OR lr.leadStage IN ('Drop', 'lost'))
    `;

    let countParams = [];

    /* ================= SEARCH FILTER ================= */
    if (search) {
      countQuery += ` AND (
        rd.name LIKE ? OR 
        rd.number LIKE ? OR 
        rd.email LIKE ? OR 
        rd.address LIKE ? OR 
        rd.city LIKE ? OR 
        rd.lead_stage LIKE ? OR 
        lr.assignedTo LIKE ?
      )`;
      const searchPattern = `%${search}%`;
      countParams.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
    }

    /* ================= DATE FILTERS ================= */
    if (entryFromDate) {
      countQuery += ` AND DATE(rd.assign_date) >= ?`;
      countParams.push(entryFromDate);
    }
    if (entryToDate) {
      countQuery += ` AND DATE(rd.assign_date) <= ?`;
      countParams.push(entryToDate);
    }
    if (followupFromDate) {
      countQuery += ` AND DATE(rd.followup_date) >= ?`;
      countParams.push(followupFromDate);
    }
    if (followupToDate) {
      countQuery += ` AND DATE(rd.followup_date) <= ?`;
      countParams.push(followupToDate);
    }

    /* ================= STAGE FILTER ================= */
    if (stages.length > 0) {
      countQuery += ` AND rd.lead_stage IN (?)`;
      countParams.push(stages);
    }

    /* ================= USER FILTER ================= */
    if (users.length > 0) {
      countQuery += ` AND lr.assignedTo IN (?)`;
      countParams.push(users);
    }

    /* ================= CITY FILTER ================= */
    if (cities.length > 0) {
      countQuery += ` AND rd.city IN (?)`;
      countParams.push(cities);
    }

    /* ================= ROLE FILTER FOR COUNT ================= */
    if (isTelecallerLike(role)) {
      countQuery += ` AND lr.assignedTo = ?`;
      countParams.push(currentUserName);
    } else if (isAdminLike(role)) {
      // no filter
    } else if (!isManagementLike(role)) {
      countQuery += ` AND lr.assignedTo = ?`;
      countParams.push(currentUserName);
    }

    const [countResult] = await db.query(countQuery, countParams);
    const total = countResult[0]?.total || 0;

    /* ================= MAIN QUERY WITH PAGINATION ================= */
    let query = `
      SELECT 
        rd.master_id,
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
        IFNULL(rd.cat_id, 'Not Available') AS cat_id,
        IFNULL(rd.reference_id, 'Not Available') AS reference_id,
        IFNULL(rd.area_id, 'Not Available') AS area_id,
        IFNULL(rd.room_length, 'Not Available') AS room_length,
        IFNULL(rd.room_width, 'Not Available') AS room_width,
        IFNULL(rd.room_height, 'Not Available') AS room_height,
        IFNULL(rd.location_link, 'Not Available') AS location_link,
        IFNULL(rd.p_type, 'Not Available') AS p_type,
        IFNULL(rd.budget_range, 'Not Available') AS budget_range,
        IFNULL(rd.time_to_complete, 'Not Available') AS time_to_complete,
        IFNULL(rd.site_visit_date, 'Not Available') AS site_visit_date,
        IFNULL(rd.demo_date, 'Not Available') AS demo_date,
        IFNULL(rd.lead_activity, 0) AS lead_activity,
        IFNULL(rd.ar_number, 'Not Available') AS ar_number,
        IFNULL(rd.architect_name, 'Not Available') AS architect_name,
        IFNULL(rd.ca_number, 'Not Available') AS ca_number,
        IFNULL(rd.e_number, 'Not Available') AS e_number,
        IFNULL(rd.sm_number, 'Not Available') AS sm_number,
        IFNULL(rd.pop_number, 'Not Available') AS pop_number,
        IFNULL(rd.other_number, 'Not Available') AS other_number,
        IFNULL(rd.quick_remark, 'Not Available') AS quick_remark,
        IFNULL(rd.detailed_remark, 'Not Available') AS detailed_remark,
        IFNULL(a.area_name, 'Not Available') AS area_name,
        IFNULL(c.cat_name, 'Not Available') AS cat_name,
        IFNULL(ref.reference_name, 'Not Available') AS reference_name,
        IFNULL(DATE(asg.assign_date), 'Not Available') AS assign_date,
        lr.id AS reassignment_id,
        lr.reassignment_date,
        lr.assignedTo AS reassigned_to,
        lr.remark AS reassignment_remark,
        lr.leadStage AS reassignment_lead_stage,
        IFNULL(u.name, 'Not Available') AS telecaller_name,
        u.user_id AS assigned_to_user_id,
        MAX(tct.tc_remark) AS call_remark,
        MAX(tct.tc_call_duration) AS call_duration,
        GROUP_CONCAT(p.product_name) AS products,
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

      WHERE (rd.lead_stage IN ('Drop', 'lost') OR lr.leadStage IN ('Drop', 'lost'))
    `;

    let params = [];

    /* ================= SEARCH FILTER ================= */
    if (search) {
      query += ` AND (
        rd.name LIKE ? OR 
        rd.number LIKE ? OR 
        rd.email LIKE ? OR 
        rd.address LIKE ? OR 
        rd.city LIKE ? OR 
        rd.lead_stage LIKE ? OR 
        lr.assignedTo LIKE ?
      )`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
    }

    /* ================= DATE FILTERS ================= */
    if (entryFromDate) {
      query += ` AND DATE(rd.assign_date) >= ?`;
      params.push(entryFromDate);
    }
    if (entryToDate) {
      query += ` AND DATE(rd.assign_date) <= ?`;
      params.push(entryToDate);
    }
    if (followupFromDate) {
      query += ` AND DATE(rd.followup_date) >= ?`;
      params.push(followupFromDate);
    }
    if (followupToDate) {
      query += ` AND DATE(rd.followup_date) <= ?`;
      params.push(followupToDate);
    }

    /* ================= STAGE FILTER ================= */
    if (stages.length > 0) {
      query += ` AND rd.lead_stage IN (?)`;
      params.push(stages);
    }

    /* ================= USER FILTER ================= */
    if (users.length > 0) {
      query += ` AND lr.assignedTo IN (?)`;
      params.push(users);
    }

    /* ================= CITY FILTER ================= */
    if (cities.length > 0) {
      query += ` AND rd.city IN (?)`;
      params.push(cities);
    }

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

    query += ` GROUP BY rd.master_id ORDER BY rd.master_id DESC LIMIT ? OFFSET ?`;
    
    // Add pagination parameters
    params.push(limit, offset);

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

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      total: total,
      currentPage: page,
      totalPages: totalPages,
      limit: limit,
      dropLeads: formattedRows,
      showing: {
        from: offset + 1,
        to: Math.min(offset + limit, total),
        total: total
      }
    });

  } catch (error) {
    console.error("❌ Error in getDropLeadsFullData:", error);
    res.status(500).json({ message: "Failed to fetch drop leads data" });
  }
};


// export const getClosedLeadsFullData = async (req, res) => {
//   try {
//     if (!req.session.user) {
//       return res.status(401).json({ message: "Unauthorized: No session" });
//     }

//     const { id: userId, role } = req.session.user;

//     /* ================= CURRENT USER ================= */
//     const [userResult] = await db.query(
//       "SELECT name FROM users WHERE user_id = ?",
//       [userId]
//     );
//     const currentUserName = userResult[0]?.name || "";

//     /* ================= MAIN QUERY ================= */
//     let query = `
//       SELECT 
//         rd.master_id,

//         -- MAIN RAW DATA
//         IFNULL(rd.name, 'Not Available') AS name,
//         IFNULL(rd.number, 'Not Available') AS number,
//         IFNULL(rd.alternate_number, 'Not Available') AS alternate_number,
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
//         IFNULL(rd.time_to_complete, 'Not Available') AS time_to_complete,
//         IFNULL(rd.site_visit_date, 'Not Available') AS site_visit_date,
//         IFNULL(rd.demo_date, 'Not Available') AS demo_date,

//         -- ACTIVITY
//         IFNULL(rd.lead_activity, 0) AS lead_activity,

//         -- NUMBERS
//         IFNULL(rd.ar_number, 'Not Available') AS ar_number,
//         IFNULL(rd.architect_name, 'Not Available') AS architect_name,
//         IFNULL(rd.ca_number, 'Not Available') AS ca_number,
//         IFNULL(rd.e_number, 'Not Available') AS e_number,
//         IFNULL(rd.sm_number, 'Not Available') AS sm_number,
//         IFNULL(rd.pop_number, 'Not Available') AS pop_number,
//         IFNULL(rd.other_number, 'Not Available') AS other_number,

//         -- REMARKS
//         IFNULL(rd.quick_remark, 'Not Available') AS quick_remark,
//         IFNULL(rd.detailed_remark, 'Not Available') AS detailed_remark,

//         -- AREA / CATEGORY / REFERENCE
//         IFNULL(a.area_name, 'Not Available') AS area_name,
//         IFNULL(c.cat_name, 'Not Available') AS cat_name,
//         IFNULL(ref.reference_name, 'Not Available') AS reference_name,

//         -- ASSIGN DATE
//         IFNULL(DATE(asg.assign_date), 'Not Available') AS assign_date,

//         -- LATEST REASSIGNMENT
//         lr.id AS reassignment_id,
//         lr.reassignment_date,
//         lr.assignedTo AS reassigned_to,
//         lr.remark AS reassignment_remark,
//         lr.leadStage AS reassignment_lead_stage,

//         -- USER
//         IFNULL(u.name, 'Not Available') AS telecaller_name,
//         u.user_id AS assigned_to_user_id,

//         -- CALL / PRODUCT
//         MAX(tct.tc_remark) AS call_remark,
//         MAX(tct.tc_call_duration) AS call_duration,
//         GROUP_CONCAT(p.product_name) AS products,

//         -- DOCUMENTS
//         MAX(d.location_link) AS document_location_link

//       FROM raw_data rd

//       LEFT JOIN area a ON rd.area_id = a.area_id
//       LEFT JOIN category c ON rd.cat_id = c.cat_id
//       LEFT JOIN reference ref ON rd.reference_id = ref.reference_id
//       LEFT JOIN assignments asg ON rd.assign_id = asg.assign_id

//       LEFT JOIN (
//         SELECT r1.*, ROW_NUMBER() OVER (PARTITION BY master_id ORDER BY id DESC) rn
//         FROM reassignment r1
//       ) lr ON rd.master_id = lr.master_id AND lr.rn = 1

//       LEFT JOIN users u ON lr.assignedTo = u.name
//       LEFT JOIN tele_caller_table tct ON rd.master_id = tct.master_id
//       LEFT JOIN product_mapping pm ON rd.master_id = pm.master_id
//       LEFT JOIN product p ON p.product_id = pm.product_id
//       LEFT JOIN documents d ON d.master_id = rd.master_id
//     `;

//     const params = [];

//     /* ================= CLOSED LEADS FILTER ================= */
//     query += `
//       WHERE rd.lead_stage = 'Closed Deal'
//          OR lr.leadStage = 'Closed Deal'
//     `;

//     if (isTelecallerLike(role)) {
//       query += ` AND lr.assignedTo = ?`;
//       params.push(currentUserName);
//     }

//     query += ` GROUP BY rd.master_id ORDER BY rd.master_id DESC`;

//     const [rows] = await db.query(query, params);

//     /* ================= OTHER INPUTS ================= */
//     const masterIds = rows.map(r => r.master_id);
//     let otherInputsRows = [];

//     if (masterIds.length) {
//       const [otherInputs] = await db.query(
//         `SELECT master_id, cat_id, reference_id, input_text
//          FROM raw_data_other_inputs
//          WHERE master_id IN (?)
//          ORDER BY created_at DESC`,
//         [masterIds]
//       );
//       otherInputsRows = otherInputs;
//     }

//     /* ================= REASSIGNMENT HISTORY ================= */
//     let reassignmentRows = [];
//     if (masterIds.length) {
//       const [reassignments] = await db.query(
//         `SELECT rm.*, u.name, u.role
//          FROM reassignment rm
//          LEFT JOIN users u ON u.user_id = rm.created_by_user
//          WHERE rm.master_id IN (?)
//          ORDER BY rm.reassignment_date DESC, rm.created_at DESC`,
//         [masterIds]
//       );
//       reassignmentRows = reassignments;
//     }

//     /* ================= FINAL MAP ================= */
//     const formattedRows = rows.map(row => {
//       const rowCatId = parseInt(row.cat_id);
//       const rowRefId = parseInt(row.reference_id);

//       const categoryOther =
//         otherInputsRows.find(
//           oi => oi.master_id === row.master_id && oi.cat_id === rowCatId
//         )?.input_text || "";

//       const referenceOther =
//         otherInputsRows.find(
//           oi => oi.master_id === row.master_id && oi.reference_id === rowRefId
//         )?.input_text || "";

//       const reassignments = reassignmentRows
//         .filter(r => r.master_id === row.master_id)
//         .map(r => ({
//           remark: r.remark || "",
//           assignedTo: r.assignedTo || "",
//           leadStage: r.leadStage || "",
//           created_by_user: r.created_by_user || "",
//           created_at: r.created_at
//             ? new Date(r.created_at).toLocaleString("en-GB")
//             : "",
//           reassignment_date: r.reassignment_date
//             ? new Date(r.reassignment_date).toLocaleString("en-GB")
//             : "",
//           name: r.name || "",
//           role: r.role || ""
//         }));

//       return {
//         ...row,
//         category_other: categoryOther,
//         reference_other: referenceOther,
//         reassignment_remarks: reassignments,
//         latest_assignedTo: reassignments[0]?.assignedTo || "",
//         latest_leadStage: reassignments[0]?.leadStage || "",
//         assign_date: row.assign_date
//       };
//     });

//     return res.status(200).json(formattedRows);

//   } catch (error) {
//     console.error("❌ Error in getClosedLeadsFullData:", error);
//     res.status(500).json({ message: "Failed to fetch closed leads data" });
//   }
// };


export const getClosedLeadsFullData1 = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Unauthorized: No session" });
    }

    const { id: userId, role } = req.session.user;

    /* ================= PAGINATION PARAMETERS ================= */
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({ 
        message: "Invalid pagination parameters. Page must be >=1, limit between 1-100" 
      });
    }

    /* ================= CURRENT USER ================= */
    const [userResult] = await db.query(
      "SELECT name FROM users WHERE user_id = ?",
      [userId]
    );
    const currentUserName = userResult[0]?.name || "";

    /* ================= TOTAL COUNT QUERY ================= */
    let countQuery = `
      SELECT COUNT(DISTINCT rd.master_id) as total
      FROM raw_data rd
      LEFT JOIN (
        SELECT r1.*, ROW_NUMBER() OVER (PARTITION BY master_id ORDER BY id DESC) rn
        FROM reassignment r1
      ) lr ON rd.master_id = lr.master_id AND lr.rn = 1
      WHERE rd.lead_stage = 'Closed Deal'
         OR lr.leadStage = 'Closed Deal'
    `;

    const countParams = [];

    if (isTelecallerLike(role)) {
      countQuery += ` AND lr.assignedTo = ?`;
      countParams.push(currentUserName);
    }

    const [countResult] = await db.query(countQuery, countParams);
    const total = countResult[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    /* ================= MAIN QUERY WITH PAGINATION ================= */
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

    // Add GROUP BY, ORDER BY, and PAGINATION
    query += ` GROUP BY rd.master_id ORDER BY rd.master_id DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

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
        [masterIds.length ? masterIds : [0]] // Handle empty array case
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
        [masterIds.length ? masterIds : [0]] // Handle empty array case
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

    /* ================= RESPONSE WITH PAGINATION ================= */
    return res.status(200).json({
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
    console.error("❌ Error in getClosedLeadsFullData:", error);
    res.status(500).json({ 
      message: "Failed to fetch closed leads data",
      error: error.message 
    });
  }
};


export const getClosedLeadsFullData = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Unauthorized: No session" });
    }

    const { id: userId, role } = req.session.user;

    /* ================= PAGINATION PARAMETERS ================= */
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({ 
        message: "Invalid pagination parameters. Page must be >=1, limit between 1-100" 
      });
    }

    /* ================= CURRENT USER ================= */
    const [userResult] = await db.query(
      "SELECT name FROM users WHERE user_id = ?",
      [userId]
    );
    const currentUserName = userResult[0]?.name || "";

    /* ================= CLOSED STAGES ARRAY ================= */
    const closedStages = ['Closed Deal', 'Execution', 'Pre Execution'];

    /* ================= TOTAL COUNT QUERY ================= */
    let countQuery = `
      SELECT COUNT(DISTINCT rd.master_id) as total
      FROM raw_data rd
      LEFT JOIN (
        SELECT r1.*, ROW_NUMBER() OVER (PARTITION BY master_id ORDER BY id DESC) rn
        FROM reassignment r1
      ) lr ON rd.master_id = lr.master_id AND lr.rn = 1
      WHERE rd.lead_stage IN (${closedStages.map(() => '?').join(',')})
         OR lr.leadStage IN (${closedStages.map(() => '?').join(',')})
    `;

    const countParams = [...closedStages, ...closedStages];

    if (isTelecallerLike(role)) {
      countQuery += ` AND lr.assignedTo = ?`;
      countParams.push(currentUserName);
    }

    const [countResult] = await db.query(countQuery, countParams);
    const total = countResult[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    /* ================= MAIN QUERY WITH PAGINATION ================= */
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
      WHERE rd.lead_stage IN (${closedStages.map(() => '?').join(',')})
         OR lr.leadStage IN (${closedStages.map(() => '?').join(',')})
    `;
    
    params.push(...closedStages, ...closedStages);

    if (isTelecallerLike(role)) {
      query += ` AND lr.assignedTo = ?`;
      params.push(currentUserName);
    }

    // Add GROUP BY, ORDER BY, and PAGINATION
    query += ` GROUP BY rd.master_id ORDER BY rd.master_id DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

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
        [masterIds.length ? masterIds : [0]] // Handle empty array case
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
        [masterIds.length ? masterIds : [0]] // Handle empty array case
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

    /* ================= RESPONSE WITH PAGINATION ================= */
    return res.status(200).json({
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
    console.error("❌ Error in getClosedLeadsFullData:", error);
    res.status(500).json({ 
      message: "Failed to fetch closed leads data",
      error: error.message 
    });
  }
};


export const getDemoLeadsFullData = async (req, res) => {
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

    /* ================= DEMO LEADS FILTER ================= */
    query += `
      WHERE rd.lead_stage = 'Demo'
         OR lr.leadStage = 'Demo'
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
    console.error("❌ Error in getDemoLeadsFullData:", error);
    res.status(500).json({ message: "Failed to fetch demo leads data" });
  }
};


// export const getQuotationPendingLeadsFullData = async (req, res) => {
//   try {
//     if (!req.session.user) {
//       return res.status(401).json({ message: "Unauthorized: No session" });
//     }

//     const { id: userId, role } = req.session.user;

//     const [userResult] = await db.query(
//       "SELECT name FROM users WHERE user_id = ?",
//       [userId]
//     );
//     const currentUserName = userResult[0]?.name || "";

//     let query = `
//       SELECT 
//         rd.master_id,
//         IFNULL(rd.name, 'Not Available') AS name,
//         IFNULL(rd.number, 'Not Available') AS number,
//         IFNULL(rd.email, 'Not Available') AS email,
//         IFNULL(rd.address, 'Not Available') AS address,
//         IFNULL(rd.city, 'Not Available') AS city,
//         IFNULL(rd.lead_stage, 'Not Available') AS lead_stage,
//         IFNULL(rd.followup_date, 'Not Available') AS followup_date,
//         IFNULL(a.area_name, 'Not Available') AS area_name,
//         IFNULL(c.cat_name, 'Not Available') AS cat_name,
//         IFNULL(ref.reference_name, 'Not Available') AS reference_name,
//         IFNULL(DATE(asg.assign_date), 'Not Available') AS assign_date,

//         lr.id AS reassignment_id,
//         lr.reassignment_date,
//         lr.assignedTo AS reassigned_to,
//         lr.remark AS reassignment_remark,
//         lr.leadStage AS reassignment_lead_stage,

//         IFNULL(u.name, 'Not Available') AS telecaller_name,
//         MAX(tct.tc_remark) AS call_remark,
//         GROUP_CONCAT(p.product_name) AS products

//       FROM raw_data rd
//       LEFT JOIN area a ON rd.area_id = a.area_id
//       LEFT JOIN category c ON rd.cat_id = c.cat_id
//       LEFT JOIN reference ref ON rd.reference_id = ref.reference_id
//       LEFT JOIN assignments asg ON rd.assign_id = asg.assign_id

//       LEFT JOIN (
//         SELECT r1.*, ROW_NUMBER() OVER (PARTITION BY master_id ORDER BY id DESC) rn
//         FROM reassignment r1
//       ) lr ON rd.master_id = lr.master_id AND lr.rn = 1

//       LEFT JOIN users u ON lr.assignedTo = u.name
//       LEFT JOIN tele_caller_table tct ON rd.master_id = tct.master_id
//       LEFT JOIN product_mapping pm ON rd.master_id = pm.master_id
//       LEFT JOIN product p ON p.product_id = pm.product_id
//     `;

//     const params = [];

//     query += `
//       WHERE rd.lead_stage = 'Quotation Pending'
//          OR lr.leadStage = 'Quotation Pending'
//     `;

//     if (isTelecallerLike(role)) {
//       query += ` AND lr.assignedTo = ?`;
//       params.push(currentUserName);
//     }

//     query += ` GROUP BY rd.master_id ORDER BY rd.master_id DESC`;

//     const [rows] = await db.query(query, params);

//     return res.status(200).json(rows);

//   } catch (error) {
//     console.error("❌ Error in getQuotationPendingLeadsFullData:", error);
//     res.status(500).json({ message: "Failed to fetch quotation pending leads" });
//   }
// };


export const getQuotationFollowupLeadsFullData = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Unauthorized: No session" });
    }

    const { id: userId, role } = req.session.user;

    const [userResult] = await db.query(
      "SELECT name FROM users WHERE user_id = ?",
      [userId]
    );
    const currentUserName = userResult[0]?.name || "";

    let query = `
      SELECT 
        rd.master_id,
        IFNULL(rd.name, 'Not Available') AS name,
        IFNULL(rd.number, 'Not Available') AS number,
        IFNULL(rd.email, 'Not Available') AS email,
        IFNULL(rd.address, 'Not Available') AS address,
        IFNULL(rd.city, 'Not Available') AS city,
        IFNULL(rd.lead_stage, 'Not Available') AS lead_stage,
        IFNULL(rd.followup_date, 'Not Available') AS followup_date,
        IFNULL(a.area_name, 'Not Available') AS area_name,
        IFNULL(c.cat_name, 'Not Available') AS cat_name,
        IFNULL(ref.reference_name, 'Not Available') AS reference_name,
        IFNULL(DATE(asg.assign_date), 'Not Available') AS assign_date,

        lr.id AS reassignment_id,
        lr.reassignment_date,
        lr.assignedTo AS reassigned_to,
        lr.remark AS reassignment_remark,
        lr.leadStage AS reassignment_lead_stage,

        IFNULL(u.name, 'Not Available') AS telecaller_name,
        MAX(tct.tc_remark) AS call_remark,
        GROUP_CONCAT(p.product_name) AS products

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
    `;

    const params = [];

    query += `
      WHERE rd.lead_stage = 'Quotation Follow-up'
         OR lr.leadStage = 'Quotation Follow-up'
    `;

    if (isTelecallerLike(role)) {
      query += ` AND lr.assignedTo = ?`;
      params.push(currentUserName);
    }

    query += ` GROUP BY rd.master_id ORDER BY rd.master_id DESC`;

    const [rows] = await db.query(query, params);

    return res.status(200).json(rows);

  } catch (error) {
    console.error("❌ Error in getQuotationFollowupLeadsFullData:", error);
    res.status(500).json({ message: "Failed to fetch quotation follow-up leads" });
  }
};



// export const getMissedAssignedFullData = async (req, res) => {
//   try {
//     if (!req.session.user) {
//       return res.status(401).json({ message: "Unauthorized: No session" });
//     }

//     const { id: userId, role } = req.session.user;
//     const today = new Date().toISOString().slice(0, 10);

//     /* ================= CURRENT USER ================= */
//     const [userResult] = await db.query(
//       "SELECT name FROM users WHERE user_id = ?",
//       [userId]
//     );
//     const currentUserName = userResult[0]?.name || '';

//     /* ================= MAIN QUERY ================= */
//     let query = `
//       SELECT 
//         rd.master_id,

//         -- MAIN RAW DATA
//         IFNULL(rd.name, 'Not Available') AS name,
//         IFNULL(rd.number, 'Not Available') AS number,
//         IFNULL(rd.alternate_number, 'Not Available') AS alternate_number,
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
//         IFNULL(rd.time_to_complete, 'Not Available') AS time_to_complete,
//         IFNULL(rd.site_visit_date, 'Not Available') AS site_visit_date,
//         IFNULL(rd.demo_date, 'Not Available') AS demo_date,

//         -- ACTIVITY
//         IFNULL(rd.lead_activity, 0) AS lead_activity,

//         -- NUMBERS
//         IFNULL(rd.ar_number, 'Not Available') AS ar_number,
//         IFNULL(rd.architect_name, 'Not Available') AS architect_name,
//         IFNULL(rd.ca_number, 'Not Available') AS ca_number,
//         IFNULL(rd.e_number, 'Not Available') AS e_number,
//         IFNULL(rd.sm_number, 'Not Available') AS sm_number,
//         IFNULL(rd.pop_number, 'Not Available') AS pop_number,
//         IFNULL(rd.other_number, 'Not Available') AS other_number,

//         -- REMARKS
//         IFNULL(rd.quick_remark, 'Not Available') AS quick_remark,
//         IFNULL(rd.detailed_remark, 'Not Available') AS detailed_remark,

//         -- AREA / CATEGORY / REFERENCE
//         IFNULL(a.area_name, 'Not Available') AS area_name,
//         IFNULL(c.cat_name, 'Not Available') AS cat_name,
//         IFNULL(ref.reference_name, 'Not Available') AS reference_name,

//         -- ASSIGN DATE
//         IFNULL(DATE(asg.assign_date), 'Not Available') AS assign_date,

//         -- LATEST REASSIGNMENT
//         lr.id AS reassignment_id,
//         lr.reassignment_date,
//         lr.assignedTo AS reassigned_to,
//         lr.remark AS reassignment_remark,
//         lr.leadStage AS reassignment_lead_stage,

//         -- USER
//         IFNULL(u.name, 'Not Available') AS telecaller_name,
//         u.user_id AS assigned_to_user_id,

//         -- CALL / PRODUCT
//         MAX(tct.tc_remark) AS call_remark,
//         MAX(tct.tc_call_duration) AS call_duration,
//         GROUP_CONCAT(p.product_name) AS products,

//         -- ✅ NEW: DOCUMENT LOCATION LINK
//         MAX(d.location_link) AS document_location_link

//       FROM raw_data rd

//       LEFT JOIN area a ON rd.area_id = a.area_id
//       LEFT JOIN category c ON rd.cat_id = c.cat_id
//       LEFT JOIN reference ref ON rd.reference_id = ref.reference_id
//       LEFT JOIN assignments asg ON rd.assign_id = asg.assign_id

//       LEFT JOIN (
//         SELECT r1.*, ROW_NUMBER() OVER (PARTITION BY master_id ORDER BY id DESC) rn
//         FROM reassignment r1
//       ) lr ON rd.master_id = lr.master_id AND lr.rn = 1

//       LEFT JOIN users u ON lr.assignedTo = u.name
//       LEFT JOIN tele_caller_table tct ON rd.master_id = tct.master_id
//       LEFT JOIN product_mapping pm ON rd.master_id = pm.master_id
//       LEFT JOIN product p ON p.product_id = pm.product_id

//       -- ✅ NEW: DOCUMENTS JOIN
//       LEFT JOIN documents d ON d.master_id = rd.master_id

//       WHERE rd.followup_date < ?
//     `;

//     const params = [today];

//     /* ================= ROLE FILTER ================= */
//     if (isTelecallerLike(role)) {
//       query += ` AND lr.assignedTo = ?`;
//       params.push(currentUserName);
//     } else if (isAdminLike(role)) {
//       // no filter
//     } else if (!isManagementLike(role)) {
//       query += ` AND lr.assignedTo = ?`;
//       params.push(currentUserName);
//     }

//     query += ` GROUP BY rd.master_id ORDER BY rd.followup_date ASC`;

//     const [rows] = await db.query(query, params);

//     /* ================= OTHER INPUTS ================= */
//     const masterIds = rows.map(r => r.master_id);
//     let otherInputsRows = [];

//     if (masterIds.length) {
//       const [otherInputs] = await db.query(
//         `SELECT master_id, cat_id, reference_id, input_text
//          FROM raw_data_other_inputs
//          WHERE master_id IN (?)
//          ORDER BY created_at DESC`,
//         [masterIds]
//       );
//       otherInputsRows = otherInputs;
//     }

//     /* ================= REASSIGNMENT HISTORY ================= */
//     let reassignmentRows = [];
//     if (masterIds.length) {
//       const [reassignments] = await db.query(
//         `SELECT rm.*, u.name, u.role
//          FROM reassignment rm
//          LEFT JOIN users u ON u.user_id = rm.created_by_user
//          WHERE rm.master_id IN (?)
//          ORDER BY rm.reassignment_date DESC, rm.created_at DESC`,
//         [masterIds]
//       );
//       reassignmentRows = reassignments;
//     }

//     /* ================= FINAL MAP ================= */
//     const formattedRows = rows.map(row => {
//       const rowCatId = parseInt(row.cat_id);
//       const rowRefId = parseInt(row.reference_id);

//       const categoryOther =
//         otherInputsRows.find(
//           oi => oi.master_id === row.master_id && oi.cat_id === rowCatId
//         )?.input_text || '';

//       const referenceOther =
//         otherInputsRows.find(
//           oi => oi.master_id === row.master_id && oi.reference_id === rowRefId
//         )?.input_text || '';

//       const reassignments = reassignmentRows
//         .filter(r => r.master_id === row.master_id)
//         .map(r => ({
//           remark: r.remark || '',
//           assignedTo: r.assignedTo || '',
//           leadStage: r.leadStage || '',
//           created_by_user: r.created_by_user || '',
//           created_at: r.created_at
//             ? new Date(r.created_at).toLocaleString('en-GB')
//             : '',
//           reassignment_date: r.reassignment_date
//             ? new Date(r.reassignment_date).toLocaleString('en-GB')
//             : '',
//           name: r.name || '',
//           role: r.role || ''
//         }));

//       return {
//         ...row,
//         category_other: categoryOther,
//         reference_other: referenceOther,
//         reassignment_remarks: reassignments,
//         latest_assignedTo: reassignments[0]?.assignedTo || '',
//         latest_leadStage: reassignments[0]?.leadStage || '',
//         assign_date: row.assign_date
//       };
//     });

//     return res.status(200).json({
//       success: true,
//       total: formattedRows.length,
//       missedLeads: formattedRows
//     });

//   } catch (error) {
//     console.error("❌ Error in getMissedAssignedFullData:", error);
//     res.status(500).json({ message: "Failed to fetch missed follow-up data" });
//   }
// };


// In your backend API endpoint, update it to handle filter parameters


export const getMissedAssignedFullData = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Unauthorized: No session" });
    }

    const { id: userId, role } = req.session.user;
    const today = new Date().toISOString().slice(0, 10);
    
    // Get pagination and filter parameters from query
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // Get filter parameters
    const search = req.query.search || '';
    const entryFromDate = req.query.entryFromDate;
    const entryToDate = req.query.entryToDate;
    const followupFromDate = req.query.followupFromDate;
    const followupToDate = req.query.followupToDate;
    const stages = req.query.stages ? req.query.stages.split(',') : [];
    const users = req.query.users ? req.query.users.split(',') : [];
    const cities = req.query.cities ? req.query.cities.split(',') : [];

    /* ================= CURRENT USER ================= */
    const [userResult] = await db.query(
      "SELECT name FROM users WHERE user_id = ?",
      [userId]
    );
    const currentUserName = userResult[0]?.name || '';

    /* ================= COUNT TOTAL RECORDS ================= */
    let countQuery = `
      SELECT COUNT(DISTINCT rd.master_id) as total
      FROM raw_data rd
      LEFT JOIN (
        SELECT r1.*, ROW_NUMBER() OVER (PARTITION BY master_id ORDER BY id DESC) rn
        FROM reassignment r1
      ) lr ON rd.master_id = lr.master_id AND lr.rn = 1
      WHERE rd.followup_date < ?
      AND rd.lead_stage NOT IN ('Drop','Closed Deal')
    `;

    let countParams = [today];

    /* ================= SEARCH FILTER ================= */
    if (search) {
      countQuery += ` AND (
        rd.name LIKE ? OR 
        rd.number LIKE ? OR 
        rd.email LIKE ? OR 
        rd.address LIKE ? OR 
        rd.city LIKE ? OR 
        rd.lead_stage LIKE ? OR 
        lr.assignedTo LIKE ?
      )`;
      const searchPattern = `%${search}%`;
      countParams.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
    }

    /* ================= DATE FILTERS ================= */
    if (entryFromDate) {
      countQuery += ` AND DATE(rd.assign_date) >= ?`;
      countParams.push(entryFromDate);
    }
    if (entryToDate) {
      countQuery += ` AND DATE(rd.assign_date) <= ?`;
      countParams.push(entryToDate);
    }
    if (followupFromDate) {
      countQuery += ` AND DATE(rd.followup_date) >= ?`;
      countParams.push(followupFromDate);
    }
    if (followupToDate) {
      countQuery += ` AND DATE(rd.followup_date) <= ?`;
      countParams.push(followupToDate);
    }

    /* ================= STAGE FILTER ================= */
    if (stages.length > 0) {
      countQuery += ` AND rd.lead_stage IN (?)`;
      countParams.push(stages);
    }

    /* ================= USER FILTER ================= */
    if (users.length > 0) {
      countQuery += ` AND lr.assignedTo IN (?)`;
      countParams.push(users);
    }

    /* ================= CITY FILTER ================= */
    if (cities.length > 0) {
      countQuery += ` AND rd.city IN (?)`;
      countParams.push(cities);
    }

    /* ================= ROLE FILTER FOR COUNT ================= */
    if (isTelecallerLike(role)) {
      countQuery += ` AND lr.assignedTo = ?`;
      countParams.push(currentUserName);
    } else if (isAdminLike(role)) {
      // no filter
    } else if (!isManagementLike(role)) {
      countQuery += ` AND lr.assignedTo = ?`;
      countParams.push(currentUserName);
    }

    const [countResult] = await db.query(countQuery, countParams);
    const total = countResult[0]?.total || 0;

    /* ================= MAIN QUERY WITH PAGINATION ================= */
    let query = `
      SELECT 
        rd.master_id,
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
        IFNULL(rd.cat_id, 'Not Available') AS cat_id,
        IFNULL(rd.reference_id, 'Not Available') AS reference_id,
        IFNULL(rd.area_id, 'Not Available') AS area_id,
        IFNULL(rd.room_length, 'Not Available') AS room_length,
        IFNULL(rd.room_width, 'Not Available') AS room_width,
        IFNULL(rd.room_height, 'Not Available') AS room_height,
        IFNULL(rd.location_link, 'Not Available') AS location_link,
        IFNULL(rd.p_type, 'Not Available') AS p_type,
        IFNULL(rd.budget_range, 'Not Available') AS budget_range,
        IFNULL(rd.time_to_complete, 'Not Available') AS time_to_complete,
        IFNULL(rd.site_visit_date, 'Not Available') AS site_visit_date,
        IFNULL(rd.demo_date, 'Not Available') AS demo_date,
        IFNULL(rd.lead_activity, 0) AS lead_activity,
        IFNULL(rd.ar_number, 'Not Available') AS ar_number,
        IFNULL(rd.architect_name, 'Not Available') AS architect_name,
        IFNULL(rd.ca_number, 'Not Available') AS ca_number,
        IFNULL(rd.e_number, 'Not Available') AS e_number,
        IFNULL(rd.sm_number, 'Not Available') AS sm_number,
        IFNULL(rd.pop_number, 'Not Available') AS pop_number,
        IFNULL(rd.other_number, 'Not Available') AS other_number,
        IFNULL(rd.quick_remark, 'Not Available') AS quick_remark,
        IFNULL(rd.detailed_remark, 'Not Available') AS detailed_remark,
        IFNULL(a.area_name, 'Not Available') AS area_name,
        IFNULL(c.cat_name, 'Not Available') AS cat_name,
        IFNULL(ref.reference_name, 'Not Available') AS reference_name,
        IFNULL(DATE(asg.assign_date), 'Not Available') AS assign_date,
        lr.id AS reassignment_id,
        lr.reassignment_date,
        lr.assignedTo AS reassigned_to,
        lr.remark AS reassignment_remark,
        lr.leadStage AS reassignment_lead_stage,
        IFNULL(u.name, 'Not Available') AS telecaller_name,
        u.user_id AS assigned_to_user_id,
        MAX(tct.tc_remark) AS call_remark,
        MAX(tct.tc_call_duration) AS call_duration,
        GROUP_CONCAT(p.product_name) AS products,
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

      WHERE rd.followup_date < ?
      AND rd.lead_stage NOT IN ('Drop','Closed Deal')
    `;

    let params = [today];

    /* ================= SEARCH FILTER ================= */
    if (search) {
      query += ` AND (
        rd.name LIKE ? OR 
        rd.number LIKE ? OR 
        rd.email LIKE ? OR 
        rd.address LIKE ? OR 
        rd.city LIKE ? OR 
        rd.lead_stage LIKE ? OR 
        lr.assignedTo LIKE ?
      )`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
    }

    /* ================= DATE FILTERS ================= */
    if (entryFromDate) {
      query += ` AND DATE(rd.assign_date) >= ?`;
      params.push(entryFromDate);
    }
    if (entryToDate) {
      query += ` AND DATE(rd.assign_date) <= ?`;
      params.push(entryToDate);
    }
    if (followupFromDate) {
      query += ` AND DATE(rd.followup_date) >= ?`;
      params.push(followupFromDate);
    }
    if (followupToDate) {
      query += ` AND DATE(rd.followup_date) <= ?`;
      params.push(followupToDate);
    }

    /* ================= STAGE FILTER ================= */
    if (stages.length > 0) {
      query += ` AND rd.lead_stage IN (?)`;
      params.push(stages);
    }

    /* ================= USER FILTER ================= */
    if (users.length > 0) {
      query += ` AND lr.assignedTo IN (?)`;
      params.push(users);
    }

    /* ================= CITY FILTER ================= */
    if (cities.length > 0) {
      query += ` AND rd.city IN (?)`;
      params.push(cities);
    }

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

    query += ` GROUP BY rd.master_id ORDER BY rd.followup_date ASC LIMIT ? OFFSET ?`;
    
    // Add pagination parameters
    params.push(limit, offset);

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

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      total: total,
      currentPage: page,
      totalPages: totalPages,
      limit: limit,
      missedLeads: formattedRows,
      showing: {
        from: offset + 1,
        to: Math.min(offset + limit, total),
        total: total
      }
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




// export const getUpcomingAssignedFullData = async (req, res) => {
//   try {
//     if (!req.session.user) {
//       return res.status(401).json({ message: "Unauthorized: No session" });
//     }

//     const { id: userId, role } = req.session.user;

//     /* ================= CURRENT USER ================= */
//     const [userResult] = await db.query(
//       "SELECT name FROM users WHERE user_id = ?",
//       [userId]
//     );
//     const currentUserName = userResult[0]?.name || '';

//     /* ================= MAIN QUERY ================= */
//     let query = `
//       SELECT 
//         rd.master_id,

//         -- MAIN RAW DATA
//         IFNULL(rd.name, 'Not Available') AS name,
//         IFNULL(rd.number, 'Not Available') AS number,
//         IFNULL(rd.alternate_number, 'Not Available') AS alternate_number,
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
//         IFNULL(rd.time_to_complete, 'Not Available') AS time_to_complete,
//         IFNULL(rd.site_visit_date, 'Not Available') AS site_visit_date,
//         IFNULL(rd.demo_date, 'Not Available') AS demo_date,

//         -- ACTIVITY
//         IFNULL(rd.lead_activity, 0) AS lead_activity,

//         -- NUMBERS
//         IFNULL(rd.ar_number, 'Not Available') AS ar_number,
//         IFNULL(rd.architect_name, 'Not Available') AS architect_name,
//         IFNULL(rd.ca_number, 'Not Available') AS ca_number,
//         IFNULL(rd.e_number, 'Not Available') AS e_number,
//         IFNULL(rd.sm_number, 'Not Available') AS sm_number,
//         IFNULL(rd.pop_number, 'Not Available') AS pop_number,
//         IFNULL(rd.other_number, 'Not Available') AS other_number,

//         -- REMARKS
//         IFNULL(rd.quick_remark, 'Not Available') AS quick_remark,
//         IFNULL(rd.detailed_remark, 'Not Available') AS detailed_remark,

//         -- AREA / CATEGORY / REFERENCE
//         IFNULL(a.area_name, 'Not Available') AS area_name,
//         IFNULL(c.cat_name, 'Not Available') AS cat_name,
//         IFNULL(ref.reference_name, 'Not Available') AS reference_name,

//         -- ASSIGN DATE
//         IFNULL(DATE(asg.assign_date), 'Not Available') AS assign_date,

//         -- LATEST REASSIGNMENT
//         lr.id AS reassignment_id,
//         lr.reassignment_date,
//         lr.assignedTo AS reassigned_to,
//         lr.remark AS reassignment_remark,
//         lr.leadStage AS reassignment_lead_stage,

//         -- USER
//         IFNULL(u.name, 'Not Available') AS telecaller_name,
//         u.user_id AS assigned_to_user_id,

//         -- ✅ NEW: DOCUMENT LOCATION LINK
//         MAX(d.location_link) AS document_location_link

//       FROM raw_data rd

//       LEFT JOIN area a ON rd.area_id = a.area_id
//       LEFT JOIN category c ON rd.cat_id = c.cat_id
//       LEFT JOIN reference ref ON rd.reference_id = ref.reference_id
//       LEFT JOIN assignments asg ON rd.assign_id = asg.assign_id

//       -- LATEST REASSIGNMENT
//       LEFT JOIN (
//         SELECT r1.*, ROW_NUMBER() OVER (PARTITION BY master_id ORDER BY id DESC) rn
//         FROM reassignment r1
//       ) lr ON rd.master_id = lr.master_id AND lr.rn = 1

//       LEFT JOIN users u ON lr.assignedTo = u.name

//       -- ✅ NEW: DOCUMENTS JOIN
//       LEFT JOIN documents d ON d.master_id = rd.master_id
//     `;

//     const params = [];

//     /* ================= UPCOMING CONDITION ================= */
//     query += `
//       WHERE (
//         rd.followup_date > CURDATE()
//         OR DATE(lr.reassignment_date) > CURDATE()
//       )
//     `;

//     /* ================= ROLE FILTER ================= */
//     if (isTelecallerLike(role)) {
//       query += ` AND lr.assignedTo = ?`;
//       params.push(currentUserName);
//     } else if (isAdminLike(role)) {
//       query += ` AND rd.status IN ('Assigned', 'Not Interested')`;
//     } else if (!isManagementLike(role)) {
//       query += ` AND lr.assignedTo = ?`;
//       params.push(currentUserName);
//     }

//     query += ` GROUP BY rd.master_id ORDER BY rd.followup_date ASC`;

//     const [rows] = await db.query(query, params);

//     if (!rows.length) {
//       return res.status(200).json({ success: true, total: 0, upcomingLeads: [] });
//     }

//     /* ================= MASTER IDS ================= */
//     const masterIds = rows.map(r => r.master_id);

//     /* ================= OTHER INPUTS ================= */
//     const [otherInputs] = await db.query(
//       `SELECT master_id, cat_id, reference_id, input_text
//        FROM raw_data_other_inputs
//        WHERE master_id IN (?)
//        ORDER BY created_at DESC`,
//       [masterIds]
//     );

//     /* ================= REASSIGNMENT HISTORY ================= */
//     const [reassignments] = await db.query(
//       `SELECT rm.*, u.name, u.role
//        FROM reassignment rm
//        LEFT JOIN users u ON u.user_id = rm.created_by_user
//        WHERE rm.master_id IN (?)
//        ORDER BY rm.reassignment_date DESC, rm.created_at DESC`,
//       [masterIds]
//     );

//     /* ================= FINAL MAP ================= */
//     const finalResult = rows.map(row => {
//       const rowCatId = parseInt(row.cat_id);
//       const rowRefId = parseInt(row.reference_id);

//       const category_other =
//         otherInputs.find(
//           oi => oi.master_id === row.master_id && oi.cat_id === rowCatId
//         )?.input_text || '';

//       const reference_other =
//         otherInputs.find(
//           oi => oi.master_id === row.master_id && oi.reference_id === rowRefId
//         )?.input_text || '';

//       const reassignment_remarks = reassignments
//         .filter(r => r.master_id === row.master_id)
//         .map(r => ({
//           remark: r.remark || '',
//           assignedTo: r.assignedTo || '',
//           leadStage: r.leadStage || '',
//           created_at: r.created_at
//             ? new Date(r.created_at).toLocaleString('en-GB')
//             : '',
//           reassignment_date: r.reassignment_date
//             ? new Date(r.reassignment_date).toLocaleString('en-GB')
//             : '',
//           name: r.name || '',
//           role: r.role || ''
//         }));

//       return {
//         ...row,
//         category_other,
//         reference_other,
//         reassignment_remarks,
//         latest_assignedTo: reassignment_remarks[0]?.assignedTo || '',
//         latest_leadStage: reassignment_remarks[0]?.leadStage || ''
//       };
//     });

//     return res.status(200).json({
//       success: true,
//       total: finalResult.length,
//       upcomingLeads: finalResult
//     });

//   } catch (error) {
//     console.error("❌ Error in getUpcomingAssignedFullData:", error);
//     res.status(500).json({ message: "Failed to fetch upcoming leads" });
//   }
// };


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

        -- DOCUMENT LOCATION
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
      LEFT JOIN documents d ON d.master_id = rd.master_id
    `;

    const params = [];

    /* ================= UPCOMING CONDITION ================= */
    query += `
      WHERE (
        rd.followup_date > CURDATE()
        OR DATE(lr.reassignment_date) > CURDATE()
      )
      AND rd.lead_stage NOT IN ('Drop','Closed Deal')
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
          TRIM(LOWER(r.assignedTo)) AS employee_name,
          COALESCE(NULLIF(r.leadStage, ''), 'Fresh Lead') AS leadStage,
          r.created_at,

          ROW_NUMBER() OVER (
            PARTITION BY r.master_id, TRIM(LOWER(r.assignedTo))
            ORDER BY r.created_at ASC
          ) AS rn_first,

          ROW_NUMBER() OVER (
            PARTITION BY r.master_id, TRIM(LOWER(r.assignedTo))
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

export const getDashboardLeadOverview = async (req, res) => {
  try {
    if (!req.session?.user) {
      return res.status(401).json({ success: false });
    }

    const { employeeName } = req.query;

    let employeeFilter = "";
    const params = [];

    if (employeeName) {
      employeeFilter = ` AND TRIM(LOWER(s.employee_name)) = TRIM(LOWER(?)) `;
      params.push(employeeName);
    }

    const query = `
    WITH ranked AS (
      SELECT
        r.*,
        ROW_NUMBER() OVER (PARTITION BY r.master_id ORDER BY r.created_at DESC) AS rn
      FROM reassignment r
    ),

    stages AS (
      SELECT
        rd.master_id,
        rd.name,
        rd.number,
        rd.email,
        rd.city,
        rd.created_at,

        a.assign_date,

        MAX(CASE WHEN ranked.rn = 1 THEN ranked.leadStage END) AS current_stage,
        MAX(CASE WHEN ranked.rn = 2 THEN ranked.leadStage END) AS previous_stage,
        MAX(CASE WHEN ranked.rn = 1 THEN ranked.assignedTo END) AS employee_name

      FROM raw_data rd
      LEFT JOIN ranked ON ranked.master_id = rd.master_id
      LEFT JOIN assignments a ON a.assign_id = rd.assign_id

      GROUP BY
        rd.master_id,
        rd.name,
        rd.number,
        rd.email,
        rd.city,
        rd.created_at,
        a.assign_date
    )

    SELECT
      /* TOTAL LEADS (GLOBAL) */
      (SELECT COUNT(DISTINCT master_id) FROM raw_data) AS total_leads,

      /* ASSIGNED */
      COUNT(DISTINCT CASE
        WHEN s.current_stage NOT IN ('Drop','Closed Deal')
        THEN s.master_id
      END) AS assigned_leads,

      /* TODAY + MISSED */
      COUNT(DISTINCT CASE
        WHEN s.current_stage NOT IN ('Drop','Closed Deal')
         AND DATE(s.assign_date) <= CURDATE()
        THEN s.master_id
      END) AS today_missed,

      /* COMPLETED */
      COUNT(DISTINCT CASE
        WHEN s.current_stage = 'Closed Deal'
        THEN s.master_id
      END) AS completed_work,

      /* NOT COMPLETED */
      COUNT(DISTINCT CASE
        WHEN s.current_stage IS NOT NULL
         AND s.current_stage != 'Closed Deal'
        THEN s.master_id
      END) AS not_completed_work

    FROM stages s
    WHERE 1=1
    ${employeeFilter}
    `;

    const [rows] = await db.query(query, params);

    res.json({
      success: true,
      data: rows[0] || {
        total_leads: 0,
        assigned_leads: 0,
        today_missed: 0,
        completed_work: 0,
        not_completed_work: 0
      }
    });

  } catch (err) {
    console.error("❌ Dashboard overview error:", err);
    res.status(500).json({ success: false });
  }
};



export const getSimpleLeadReport = async (req, res) => {
  try {
    if (!req.session?.user) {
      return res.status(401).json({ success: false });
    }

    const query = `
    WITH ranked AS (
      SELECT
        r.*,
        ROW_NUMBER() OVER (PARTITION BY r.master_id ORDER BY r.created_at DESC) AS rn
      FROM reassignment r
    ),

    stages AS (
      SELECT
        rd.master_id,
        rd.name   AS lead_name,
        rd.number AS lead_phone,
        rd.email  AS lead_email,
        rd.city   AS city,
        rd.created_at AS lead_created,

        a.assign_date,                     -- ✅ SAME SOURCE AS HISTORY

        MAX(CASE WHEN ranked.rn = 1 THEN ranked.leadStage END) AS current_stage,
        MAX(CASE WHEN ranked.rn = 2 THEN ranked.leadStage END) AS previous_stage,

        MAX(CASE WHEN ranked.rn = 1 THEN ranked.assignedTo END) AS employee_name

      FROM raw_data rd

      LEFT JOIN ranked 
        ON ranked.master_id = rd.master_id

      LEFT JOIN assignments a               -- ✅ JOIN ADDED
        ON a.assign_id = rd.assign_id       -- ✅ SAME REF AS getLeadHistory

      GROUP BY
        rd.master_id,
        rd.name,
        rd.number,
        rd.email,
        rd.city,
        rd.created_at,
        a.assign_date                       -- ✅ GROUPED
    )

    SELECT
      s.*,
      u.role AS employee_role,

      CASE
        WHEN u.role = 'tele_caller'
         AND s.previous_stage IN ('Fresh Lead','Cold Lead','On Hold','Positive Lead')
         AND s.current_stage IN ('Pre Site Visit','Demo','Quotation Pending')
        THEN 'Converted'

        WHEN u.role = 'field_marketing_executive'
         AND s.previous_stage = 'Pre Site Visit'
         AND s.current_stage = 'Quotation Pending'
        THEN 'Converted'

        WHEN u.role = 'junior_autocad_designer'
         AND s.previous_stage = 'Quotation Pending'
         AND s.current_stage = 'Quotation Follow-up'
        THEN 'Converted'

        WHEN u.role = 'tech_sale_sound_engineer'
         AND s.previous_stage = 'Quotation Follow-up'
         AND s.current_stage IN ('Demo','Pre Site Visit','Projection List')
        THEN 'Converted'

        WHEN u.role = 'technical_head'
         AND s.previous_stage = 'Post Site Visit'
         AND s.current_stage = 'Projection List'
        THEN 'Converted'

        ELSE 'Not Converted'
      END AS conversion_status

    FROM stages s
    LEFT JOIN users u 
      ON u.name = s.employee_name

    ORDER BY s.master_id DESC
    `;

    const [rows] = await db.query(query);

    const employees = [
      ...new Map(
        rows
          .filter(r => r.employee_name)
          .map(r => [
            r.employee_name,
            {
              employee_name: r.employee_name,
              role: r.employee_role
            }
          ])
      ).values()
    ];

    res.json({
      success: true,
      total: rows.length,
      data: rows,
      employees
    });

  } catch (e) {
    console.log("Simple Lead Report Error:", e);
    res.status(500).json({ success: false });
  }
};



export const getLeadHistory = async (req, res) => {
  try {
    const { master_id } = req.params;

    const [rows] = await db.query(`
SELECT
  a.assign_date,                                   -- ✅ from raw_data → assignments

  u.name AS created_by_user,
  u.role AS employee_role,

  r.assignedTo,
  r.reassignment_date,

  r.leadStage AS current_stage,                    -- ✅ STAGE FROM reassignment
  r.remark,

  u2.role AS assigned_role,

  CASE
    WHEN u2.role = 'tele_caller'
     AND r.leadStage IN ('Pre Site Visit','Demo','Quotation Pending')
    THEN 'Converted'

    WHEN u2.role = 'field_marketing_executive'
     AND r.leadStage = 'Quotation Pending'
    THEN 'Converted'

    WHEN u2.role = 'junior_autocad_designer'
     AND r.leadStage = 'Quotation Follow-up'
    THEN 'Converted'

    WHEN u2.role = 'tech_sale_sound_engineer'
     AND r.leadStage IN ('Demo','Pre Site Visit','Projection List')
    THEN 'Converted'

    WHEN u2.role = 'technical_head'
     AND r.leadStage = 'Projection List'
    THEN 'Converted'

    ELSE 'Not Converted'
  END AS conversion_status

FROM reassignment r

LEFT JOIN raw_data rd 
  ON rd.master_id = r.master_id

LEFT JOIN assignments a 
  ON a.assign_id = rd.assign_id                  -- ✅ correct assign_date

LEFT JOIN users u 
  ON u.user_id = r.created_by_user

LEFT JOIN users u2 
  ON u2.name = r.assignedTo

WHERE r.master_id = ?

ORDER BY r.reassignment_date ASC
    `, [master_id]);

    res.json({ success: true, data: rows });

  } catch (err) {
    console.error("Lead History Error:", err);
    res.status(500).json({ success: false });
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



// export const getEmployeeWiseAssignedLeadCount = async (req, res) => {
//   try {
//     if (!req.session.user) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     const { role } = req.session.user;

//     if (!isAdminLike(role) && !isManagementLike(role)) {
//       return res.status(403).json({ message: "Access denied" });
//     }

//     // 🔹 Latest reassignment per lead
//     const [latestReassignments] = await db.query(`
//       SELECT master_id, MAX(id) AS latest_id
//       FROM reassignment
//       GROUP BY master_id
//     `);

//     if (latestReassignments.length === 0) {
//       return res.status(200).json({
//         success: true,
//         totalEmployees: 0,
//         data: []
//       });
//     }

//     const latestIds = latestReassignments.map(r => r.latest_id);

//     const query = `
//       SELECT 
//         u.name AS employee_name,
//         u.role,

//         -- ✅ EXISTING COUNTS (UNCHANGED)
//         COUNT(DISTINCT rd.master_id) AS total_assigned,

//         COUNT(DISTINCT CASE 
//           WHEN rd.followup_date = CURDATE()
//             OR DATE(re.reassignment_date) = CURDATE()
//           THEN rd.master_id
//         END) AS today_assigned,

//         COUNT(DISTINCT CASE 
//           WHEN rd.followup_date > CURDATE()
//             OR DATE(re.reassignment_date) > CURDATE()
//           THEN rd.master_id
//         END) AS upcoming_assigned,

//         COUNT(DISTINCT CASE 
//           WHEN rd.followup_date < CURDATE()
//           THEN rd.master_id
//         END) AS missed_assigned,

//         COUNT(DISTINCT CASE 
//           WHEN rd.lead_stage = 'Drop'
//           THEN rd.master_id
//         END) AS drop_count,

//         COUNT(DISTINCT CASE 
//           WHEN rd.lead_stage = 'Closed Deal'
//           THEN rd.master_id
//         END) AS closed_count,

//         -- 🆕 Lead stage details (MariaDB compatible)
//         CONCAT(
//           '[',
//           GROUP_CONCAT(
//             DISTINCT JSON_OBJECT(
//               'master_id', rd.master_id,
//               'lead_name', rd.name,
//               'current_stage', rd.lead_stage,
//               'stage_history', (
//                 SELECT CONCAT(
//                   '[',
//                   GROUP_CONCAT(
//                     JSON_OBJECT(
//                       'stage', rs.leadStage,
//                       'assignedTo', rs.assignedTo,
//                       'remark', rs.remark,
//                       'date', rs.reassignment_date
//                     )
//                     ORDER BY rs.id
//                   ),
//                   ']'
//                 )
//                 FROM reassignment rs
//                 WHERE rs.master_id = rd.master_id
//               )
//             )
//           ),
//           ']'
//         ) AS lead_details

//       FROM reassignment re
//       INNER JOIN raw_data rd ON rd.master_id = re.master_id
//       INNER JOIN users u ON u.name = re.assignedTo
//       WHERE re.id IN (?)
//       GROUP BY u.name, u.role
//       ORDER BY total_assigned DESC
//     `;

//     const [rows] = await db.query(query, [latestIds]);

//     res.status(200).json({
//       success: true,
//       totalEmployees: rows.length,
//       data: rows
//     });

//   } catch (error) {
//     console.error("❌ Employee-wise lead count error:", error);
//     res.status(500).json({
//       message: "Failed to fetch employee-wise assigned lead counts"
//     });
//   }
// };







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



// export const getEmployeeWiseAssignedLeadCount = async (req, res) => {
//   try {
//     if (!req.session?.user) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     const { role } = req.session.user;

//     if (!isAdminLike(role) && !isManagementLike(role)) {
//       return res.status(403).json({ message: "Access denied" });
//     }

//     const query = `
//     WITH latest_assignment AS (
//         SELECT 
//             r.*,
//             ROW_NUMBER() OVER (
//                 PARTITION BY r.master_id, r.assignedTo
//                 ORDER BY r.created_at DESC
//             ) AS rn
//         FROM reassignment r
//     )

//     SELECT 
//         u.name AS employee_name,
//         u.role,

//         /* UNIQUE ASSIGNED LEADS */
//         COUNT(DISTINCT la.master_id) AS total_assigned,

//         /* CONVERTED LEADS */
//         COUNT(DISTINCT CASE

//             WHEN u.role = 'tele_caller'
//              AND la.leadStage = 'Pre Site Visit'
//             THEN la.master_id

//             WHEN u.role = 'field_marketing_executive'
//              AND la.leadStage = 'Quotation Pending'
//             THEN la.master_id

//             WHEN u.role = 'junior_autocad_designer'
//              AND la.leadStage = 'Quotation Follow-up'
//             THEN la.master_id

//             WHEN u.role = 'tech_sale_sound_engineer'
//              AND la.leadStage IN ('Demo','Pre Site Visit','Projection List')
//             THEN la.master_id

//             WHEN u.role = 'technical_head'
//              AND la.leadStage = 'Projection List'
//             THEN la.master_id

//         END) AS converted_count,

//         /* NOT CONVERTED */
//         COUNT(DISTINCT la.master_id)
//         -
//         COUNT(DISTINCT CASE

//             WHEN u.role = 'tele_caller'
//              AND la.leadStage = 'Pre Site Visit'
//             THEN la.master_id

//             WHEN u.role = 'field_marketing_executive'
//              AND la.leadStage = 'Quotation Pending'
//             THEN la.master_id

//             WHEN u.role = 'junior_autocad_designer'
//              AND la.leadStage = 'Quotation Follow-up'
//             THEN la.master_id

//             WHEN u.role = 'tech_sale_sound_engineer'
//              AND la.leadStage IN ('Demo','Pre Site Visit','Projection List')
//             THEN la.master_id

//             WHEN u.role = 'technical_head'
//              AND la.leadStage = 'Projection List'
//             THEN la.master_id

//         END) AS not_converted_count

//     FROM latest_assignment la

//     INNER JOIN users u 
//         ON u.name = la.assignedTo

//     /* VALIDATE LEAD EXISTS */
//     INNER JOIN raw_data rd 
//         ON rd.master_id = la.master_id

//     WHERE la.rn = 1

//     GROUP BY u.name, u.role
//     ORDER BY total_assigned DESC
//     `;

//     const [rows] = await db.query(query);

//     res.status(200).json({
//       success: true,
//       totalEmployees: rows.length,
//       data: rows
//     });

//   } catch (error) {
//     console.error("❌ Employee-wise lead count error:", error);
//     res.status(500).json({
//       message: "Failed to fetch employee-wise assigned lead counts"
//     });
//   }
// };


export const getEmployeeDetailedReport1 = async (req, res) => {
  try {
    if (!req.session?.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { role } = req.session.user;

    if (!isAdminLike(role) && !isManagementLike(role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const query = `
    WITH latest_assignment AS (
        SELECT 
            r.*,
            ROW_NUMBER() OVER (
                PARTITION BY r.master_id, r.assignedTo
                ORDER BY r.created_at DESC
            ) AS rn
        FROM reassignment r
    ),

    lead_conversion_status AS (
        SELECT 
            la.master_id,
            la.assignedTo,
            la.leadStage,
            CASE
                WHEN u.role = 'tele_caller' AND la.leadStage = 'Pre Site Visit' THEN 1
                WHEN u.role = 'field_marketing_executive' AND la.leadStage = 'Quotation Pending' THEN 1
                WHEN u.role = 'junior_autocad_designer' AND la.leadStage = 'Quotation Follow-up' THEN 1
                WHEN u.role = 'tech_sale_sound_engineer' AND la.leadStage IN ('Demo','Pre Site Visit','Projection List') THEN 1
                WHEN u.role = 'technical_head' AND la.leadStage = 'Projection List' THEN 1
                ELSE 0
            END AS is_converted
        FROM latest_assignment la
        INNER JOIN users u ON u.name = la.assignedTo
        WHERE la.rn = 1
    )

    SELECT
        u.name AS employee_name,
        u.role,
        rd.master_id,
        rd.name AS lead_name,
        rd.number,
        rd.email,
        rd.city,
        a.assign_date,
        la.leadStage AS stage,
        la.remark,
        la.reassignment_date,
        IFNULL(lcs.is_converted,0) AS is_converted
    FROM latest_assignment la

    INNER JOIN users u 
        ON u.name = la.assignedTo

    INNER JOIN raw_data rd
        ON rd.master_id = la.master_id

    LEFT JOIN assignments a
        ON a.assign_id = la.assign_id

    LEFT JOIN lead_conversion_status lcs
        ON la.master_id = lcs.master_id 
        AND la.assignedTo = lcs.assignedTo

    WHERE la.rn = 1

    ORDER BY u.name, la.reassignment_date DESC
    `;

    const [rows] = await db.query(query);

    // 🔹 Group data by employee
    const employeeMap = {};

    rows.forEach(row => {

      if (!employeeMap[row.employee_name]) {
        employeeMap[row.employee_name] = {
          employee_name: row.employee_name,
          role: row.role,
          total_assigned: 0,
          converted_count: 0,
          not_converted_count: 0,
          lead_details: []
        };
      }

      const employee = employeeMap[row.employee_name];

      employee.total_assigned += 1;

      if (row.is_converted === 1) {
        employee.converted_count += 1;
      } else {
        employee.not_converted_count += 1;
      }

      employee.lead_details.push({
        master_id: row.master_id,
        lead_name: row.lead_name,
        number: row.number,
        email: row.email,
        city: row.city,
        assign_date: row.assign_date,
        stage: row.stage,
        remark: row.remark,
        reassignment_date: row.reassignment_date,
        is_converted: row.is_converted,
        conversion_status: row.is_converted ? "Converted" : "Not Converted"
      });

    });

    const result = Object.values(employeeMap);

    res.status(200).json({
      success: true,
      totalEmployees: result.length,
      data: result
    });

  } catch (error) {
    console.error("❌ Employee detailed report error:", error);

    res.status(500).json({
      message: "Failed to fetch employee report",
      error: error.message
    });
  }
};

export const getEmployeeDetailedReport2 = async (req, res) => {
  try {
    if (!req.session?.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { role } = req.session.user;

    if (!isAdminLike(role) && !isManagementLike(role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const query = `
    WITH latest_assignment AS (
        SELECT 
            r.*,
            ROW_NUMBER() OVER (
                PARTITION BY r.master_id, r.assignedTo
                ORDER BY r.created_at DESC
            ) AS rn
        FROM reassignment r
    ),

    lead_conversion_status AS (
        SELECT 
            la.master_id,
            la.assignedTo,
            la.leadStage,
            CASE
                WHEN u.role = 'tele_caller' AND la.leadStage = 'Pre Site Visit' THEN 1
                WHEN u.role = 'field_marketing_executive' AND la.leadStage = 'Quotation Pending' THEN 1
                WHEN u.role = 'junior_autocad_designer' AND la.leadStage = 'Quotation Follow-up' THEN 1
                WHEN u.role = 'tech_sale_sound_engineer' AND la.leadStage IN ('Demo','Pre Site Visit','Projection List') THEN 1
                WHEN u.role = 'technical_head' AND la.leadStage = 'Projection List' THEN 1
                ELSE 0
            END AS is_converted
        FROM latest_assignment la
        INNER JOIN users u ON u.name = la.assignedTo
        WHERE la.rn = 1
    ),

    -- Track Drop and Loss leads
    drop_loss_status AS (
        SELECT 
            la.master_id,
            la.assignedTo,
            la.leadStage,
            CASE 
                WHEN la.leadStage = 'Drop' THEN 'Drop'
                WHEN la.leadStage = 'lost' THEN 'Lost'
                ELSE NULL
            END AS drop_loss_type,
            la.reassignment_date AS drop_loss_date,
            la.remark AS drop_loss_remark
        FROM latest_assignment la
        WHERE la.rn = 1 
          AND (la.leadStage = 'Drop' OR la.leadStage = 'lost')
    )

    SELECT
        u.name AS employee_name,
        u.role,
        rd.master_id,
        rd.name AS lead_name,
        rd.number,
        rd.email,
        rd.city,
        a.assign_date,
        la.leadStage AS stage,
        la.remark,
        la.reassignment_date,
        IFNULL(lcs.is_converted,0) AS is_converted,
        -- Add drop/loss information
        dl.drop_loss_type,
        dl.drop_loss_date,
        dl.drop_loss_remark,
        -- Track if this lead was ever dropped or lost
        CASE 
            WHEN dl.drop_loss_type IS NOT NULL THEN 1 
            ELSE 0 
        END AS is_dropped_or_lost
    FROM latest_assignment la

    INNER JOIN users u 
        ON u.name = la.assignedTo

    INNER JOIN raw_data rd
        ON rd.master_id = la.master_id

    LEFT JOIN assignments a
        ON a.assign_id = la.assign_id

    LEFT JOIN lead_conversion_status lcs
        ON la.master_id = lcs.master_id 
        AND la.assignedTo = lcs.assignedTo

    LEFT JOIN drop_loss_status dl
        ON la.master_id = dl.master_id 
        AND la.assignedTo = dl.assignedTo

    WHERE la.rn = 1

    ORDER BY u.name, la.reassignment_date DESC
    `;

    const [rows] = await db.query(query);

    // 🔹 Group data by employee
    const employeeMap = {};

    rows.forEach(row => {
      if (!employeeMap[row.employee_name]) {
        employeeMap[row.employee_name] = {
          employee_name: row.employee_name,
          role: row.role,
          total_assigned: 0,
          converted_count: 0,
          not_converted_count: 0,
          // Add drop/loss tracking
          drop_count: 0,
          loss_count: 0,
          total_dropped_lost: 0,
          lead_details: []
        };
      }

      const employee = employeeMap[row.employee_name];

      employee.total_assigned += 1;

      // Track conversions
      if (row.is_converted === 1) {
        employee.converted_count += 1;
      } else {
        employee.not_converted_count += 1;
      }

      // Track drop and loss
      if (row.drop_loss_type === 'Drop') {
        employee.drop_count += 1;
        employee.total_dropped_lost += 1;
      } else if (row.drop_loss_type === 'Lost') {
        employee.loss_count += 1;
        employee.total_dropped_lost += 1;
      }

      employee.lead_details.push({
        master_id: row.master_id,
        lead_name: row.lead_name,
        number: row.number,
        email: row.email,
        city: row.city,
        assign_date: row.assign_date,
        stage: row.stage,
        remark: row.remark,
        reassignment_date: row.reassignment_date,
        is_converted: row.is_converted,
        conversion_status: row.is_converted ? "Converted" : "Not Converted",
        // Add drop/loss details
        is_dropped_or_lost: row.is_dropped_or_lost,
        drop_loss_type: row.drop_loss_type,
        drop_loss_date: row.drop_loss_date,
        drop_loss_remark: row.drop_loss_remark,
        drop_loss_status: row.drop_loss_type ? 
          (row.drop_loss_type === 'Drop' ? 'Dropped' : 'Lost') : 'Active'
      });
    });

    const result = Object.values(employeeMap);

    // Calculate summary statistics
    const summary = {
      total_employees: result.length,
      total_leads_assigned: result.reduce((sum, emp) => sum + emp.total_assigned, 0),
      total_converted: result.reduce((sum, emp) => sum + emp.converted_count, 0),
      total_not_converted: result.reduce((sum, emp) => sum + emp.not_converted_count, 0),
      total_dropped: result.reduce((sum, emp) => sum + emp.drop_count, 0),
      total_lost: result.reduce((sum, emp) => sum + emp.loss_count, 0),
      total_dropped_lost: result.reduce((sum, emp) => sum + emp.total_dropped_lost, 0),
      conversion_rate: ((result.reduce((sum, emp) => sum + emp.converted_count, 0) / 
                         result.reduce((sum, emp) => sum + emp.total_assigned, 0)) * 100).toFixed(2),
      drop_loss_rate: ((result.reduce((sum, emp) => sum + emp.total_dropped_lost, 0) / 
                        result.reduce((sum, emp) => sum + emp.total_assigned, 0)) * 100).toFixed(2)
    };

    res.status(200).json({
      success: true,
      totalEmployees: result.length,
      summary: summary,
      data: result
    });

  } catch (error) {
    console.error("❌ Employee detailed report error:", error);

    res.status(500).json({
      message: "Failed to fetch employee report",
      error: error.message
    });
  }
};


export const getEmployeeDetailedReport = async (req, res) => {
  try {
    if (!req.session?.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { role } = req.session.user;

    if (!isAdminLike(role) && !isManagementLike(role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    // ✅ GET DATE FILTER FROM FRONTEND
    const { fromDate, toDate } = req.query;

    let dateFilter = "";

    // ✅ APPLY ONLY IF BOTH DATES EXIST
    if (fromDate && toDate) {
      dateFilter = `AND DATE(r.created_at) BETWEEN '${fromDate}' AND '${toDate}'`;
    }

    const query = `
    WITH latest_assignment AS (
        SELECT 
            r.*,
            ROW_NUMBER() OVER (
                PARTITION BY r.master_id, r.assignedTo
                ORDER BY r.created_at DESC
            ) AS rn
        FROM reassignment r
        WHERE 1=1 ${dateFilter}
    ),

    lead_conversion_status AS (
        SELECT 
            la.master_id,
            la.assignedTo,
            la.leadStage,
            CASE
                WHEN u.role = 'tele_caller' AND la.leadStage = 'Pre Site Visit' THEN 1
                WHEN u.role = 'field_marketing_executive' AND la.leadStage = 'Quotation Pending' THEN 1
                WHEN u.role = 'junior_autocad_designer' AND la.leadStage = 'Quotation Follow-up' THEN 1
                WHEN u.role = 'tech_sale_sound_engineer' AND la.leadStage IN ('Demo','Pre Site Visit','Projection List') THEN 1
                WHEN u.role = 'technical_head' AND la.leadStage = 'Projection List' THEN 1
                ELSE 0
            END AS is_converted
        FROM latest_assignment la
        INNER JOIN users u ON u.name = la.assignedTo
        WHERE la.rn = 1
    ),

    drop_loss_status AS (
        SELECT 
            la.master_id,
            la.assignedTo,
            la.leadStage,
            CASE 
                WHEN la.leadStage = 'Drop' THEN 'Drop'
                WHEN la.leadStage = 'lost' THEN 'Lost'
                ELSE NULL
            END AS drop_loss_type,
            la.reassignment_date AS drop_loss_date,
            la.remark AS drop_loss_remark
        FROM latest_assignment la
        WHERE la.rn = 1 
          AND (la.leadStage = 'Drop' OR la.leadStage = 'lost')
    )

    SELECT
        u.name AS employee_name,
        u.role,
        rd.master_id,
        rd.name AS lead_name,
        rd.number,
        rd.email,
        rd.city,
        a.assign_date,
        la.leadStage AS stage,
        la.remark,
        la.reassignment_date,
        IFNULL(lcs.is_converted,0) AS is_converted,
        dl.drop_loss_type,
        dl.drop_loss_date,
        dl.drop_loss_remark,
        CASE 
            WHEN dl.drop_loss_type IS NOT NULL THEN 1 
            ELSE 0 
        END AS is_dropped_or_lost
    FROM latest_assignment la

    INNER JOIN users u 
        ON u.name = la.assignedTo

    INNER JOIN raw_data rd
        ON rd.master_id = la.master_id

    LEFT JOIN assignments a
        ON a.assign_id = la.assign_id

    LEFT JOIN lead_conversion_status lcs
        ON la.master_id = lcs.master_id 
        AND la.assignedTo = lcs.assignedTo

    LEFT JOIN drop_loss_status dl
        ON la.master_id = dl.master_id 
        AND la.assignedTo = dl.assignedTo

    WHERE la.rn = 1

    ORDER BY u.name, la.reassignment_date DESC
    `;

    const [rows] = await db.query(query);

    // 🔹 Group data by employee
    const employeeMap = {};

    rows.forEach(row => {
      if (!employeeMap[row.employee_name]) {
        employeeMap[row.employee_name] = {
          employee_name: row.employee_name,
          role: row.role,
          total_assigned: 0,
          converted_count: 0,
          not_converted_count: 0,
          drop_count: 0,
          loss_count: 0,
          total_dropped_lost: 0,
          lead_details: []
        };
      }

      const employee = employeeMap[row.employee_name];

      employee.total_assigned += 1;

      if (row.is_converted === 1) {
        employee.converted_count += 1;
      } else {
        employee.not_converted_count += 1;
      }

      if (row.drop_loss_type === 'Drop') {
        employee.drop_count += 1;
        employee.total_dropped_lost += 1;
      } else if (row.drop_loss_type === 'Lost') {
        employee.loss_count += 1;
        employee.total_dropped_lost += 1;
      }

      employee.lead_details.push({
        master_id: row.master_id,
        lead_name: row.lead_name,
        number: row.number,
        email: row.email,
        city: row.city,
        assign_date: row.assign_date,
        stage: row.stage,
        remark: row.remark,
        reassignment_date: row.reassignment_date,
        is_converted: row.is_converted,
        conversion_status: row.is_converted ? "Converted" : "Not Converted",
        is_dropped_or_lost: row.is_dropped_or_lost,
        drop_loss_type: row.drop_loss_type,
        drop_loss_date: row.drop_loss_date,
        drop_loss_remark: row.drop_loss_remark,
        drop_loss_status: row.drop_loss_type 
          ? (row.drop_loss_type === 'Drop' ? 'Dropped' : 'Lost') 
          : 'Active'
      });
    });

    const result = Object.values(employeeMap);

    // 🔹 Summary
    const totalAssigned = result.reduce((sum, emp) => sum + emp.total_assigned, 0);
    const totalConverted = result.reduce((sum, emp) => sum + emp.converted_count, 0);
    const totalDroppedLost = result.reduce((sum, emp) => sum + emp.total_dropped_lost, 0);

    const summary = {
      total_employees: result.length,
      total_leads_assigned: totalAssigned,
      total_converted: totalConverted,
      total_not_converted: result.reduce((sum, emp) => sum + emp.not_converted_count, 0),
      total_dropped: result.reduce((sum, emp) => sum + emp.drop_count, 0),
      total_lost: result.reduce((sum, emp) => sum + emp.loss_count, 0),
      total_dropped_lost: totalDroppedLost,
      conversion_rate: totalAssigned > 0 
        ? ((totalConverted / totalAssigned) * 100).toFixed(2)
        : "0.00",
      drop_loss_rate: totalAssigned > 0 
        ? ((totalDroppedLost / totalAssigned) * 100).toFixed(2)
        : "0.00"
    };

    res.status(200).json({
      success: true,
      totalEmployees: result.length,
      summary,
      data: result
    });

  } catch (error) {
    console.error("❌ Employee detailed report error:", error);

    res.status(500).json({
      message: "Failed to fetch employee report",
      error: error.message
    });
  }
};



export const getEmployeeLeadList = async (req, res) => {
  try {

    if (!req.session?.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { employee, type } = req.params;

    const query = `
    WITH latest_assignment AS (
        SELECT 
            r.*,
            ROW_NUMBER() OVER (
                PARTITION BY r.master_id, r.assignedTo
                ORDER BY r.created_at DESC
            ) AS rn
        FROM reassignment r
    )

    SELECT
        la.master_id,
        la.assignedTo AS employee,
        rd.name AS lead_name,
        rd.number,
        rd.email,
        rd.city,
        la.leadStage AS stage,
        la.remark,
        a.assign_date,
        la.reassignment_date,

        CASE
            WHEN u.role = 'tele_caller'
             AND la.leadStage = 'Pre Site Visit'
            THEN 'Converted'

            WHEN u.role = 'field_marketing_executive'
             AND la.leadStage = 'Quotation Pending'
            THEN 'Converted'

            WHEN u.role = 'junior_autocad_designer'
             AND la.leadStage = 'Quotation Follow-up'
            THEN 'Converted'

            WHEN u.role = 'tech_sale_sound_engineer'
             AND la.leadStage IN ('Demo','Pre Site Visit','Projection List')
            THEN 'Converted'

            WHEN u.role = 'technical_head'
             AND la.leadStage = 'Projection List'
            THEN 'Converted'

            ELSE 'Not Converted'
        END AS conversion_status

    FROM latest_assignment la

    INNER JOIN raw_data rd
      ON rd.master_id = la.master_id

    LEFT JOIN assignments a
      ON a.assign_id = la.assign_id

    INNER JOIN users u
      ON u.name = la.assignedTo

    WHERE la.rn = 1
    AND la.assignedTo = ?

    `;

    let finalQuery = query;

    if (type === "converted") {
      finalQuery += ` HAVING conversion_status = 'Converted'`;
    }

    if (type === "not_converted") {
      finalQuery += ` HAVING conversion_status = 'Not Converted'`;
    }

    finalQuery += ` ORDER BY a.assign_date DESC`;

    const [rows] = await db.query(finalQuery, [employee]);

    res.status(200).json({
      success: true,
      total: rows.length,
      data: rows
    });

  } catch (error) {
    console.error("❌ Employee lead list error:", error);

    res.status(500).json({
      message: "Failed to fetch employee lead list"
    });
  }
};



export const getEmployeeLeadsWithHistory = async (req, res) => {
  try {
    if (!req.session?.user) {
      return res.status(401).json({ success: false });
    }

    const { employee } = req.params;

    const query = `
      WITH ranked AS (
        SELECT r.*,
               ROW_NUMBER() OVER (PARTITION BY r.master_id ORDER BY r.created_at DESC) rn
        FROM reassignment r
      ),

      stages AS (
        SELECT
          rd.master_id,
          MAX(CASE WHEN ranked.rn = 1 THEN ranked.leadStage END) current_stage,
          MAX(CASE WHEN ranked.rn = 1 THEN ranked.assignedTo END) employee_name,
          MAX(CASE WHEN ranked.rn = 1 THEN ranked.reassignment_date END) latest_reassignment_date
        FROM raw_data rd
        LEFT JOIN ranked ON ranked.master_id = rd.master_id
        GROUP BY rd.master_id
      )

      SELECT
        rd.master_id,
        rd.name AS lead_name,
        rd.number,
        rd.email,
        rd.city,
        a.assign_date,
        s.latest_reassignment_date AS reassignment_date,

        CASE
          WHEN u.role = 'tele_caller'
           AND s.current_stage IN ('Pre Site Visit','Demo','Quotation Pending') THEN 'Converted'
          WHEN u.role = 'field_marketing_executive'
           AND s.current_stage = 'Quotation Pending' THEN 'Converted'
          WHEN u.role = 'junior_autocad_designer'
           AND s.current_stage = 'Quotation Follow-up' THEN 'Converted'
          WHEN u.role = 'tech_sale_sound_engineer'
           AND s.current_stage IN ('Demo','Pre Site Visit','Projection List') THEN 'Converted'
          WHEN u.role = 'technical_head'
           AND s.current_stage = 'Projection List' THEN 'Converted'
          ELSE 'Not Converted'
        END AS converted_status,

        CONCAT(
          '[',
          GROUP_CONCAT(
            CONCAT(
              '{',
                '"stage":"', IFNULL(re.leadStage,''), '",',
                '"assignedTo":"', IFNULL(re.assignedTo,''), '",',
                '"remark":"', REPLACE(IFNULL(re.remark,''), '"',''), '",',
                '"date":"', IFNULL(re.reassignment_date,''), '"',
              '}'
            )
            ORDER BY re.reassignment_date
            SEPARATOR ','
          ),
          ']'
        ) AS stage_history

      FROM reassignment re
      INNER JOIN raw_data rd ON rd.master_id = re.master_id
      LEFT JOIN assignments a ON a.assign_id = re.assign_id
      INNER JOIN users u ON u.name = re.assignedTo
      LEFT JOIN stages s ON s.master_id = rd.master_id

      WHERE re.assignedTo = ?

      GROUP BY
        rd.master_id,
        rd.name,
        rd.number,
        rd.email,
        rd.city,
        a.assign_date,
        s.latest_reassignment_date,
        u.role,
        s.current_stage

      ORDER BY rd.master_id DESC
    `;

    const [rows] = await db.query(query, [employee]);

    res.json({ success: true, data: rows });

  } catch (err) {
    console.error("❌ Employee leads error:", err.sqlMessage || err);
    res.status(500).json({ success: false });
  }
};


export const getQuotationPendingLeads1 = async (req, res) => {
  const connection = await db.getConnection();

  try {
    /* ================= MAIN LEADS ================= */
    const [rows] = await connection.query(`
      SELECT 
        rd.master_id,
        rd.name,
        rd.number,
        rd.email,
        rd.address,
        rd.city,
        rd.status,
        rd.lead_status,
        rd.lead_stage,
        rd.current_stage,
        rd.created_by_user,
        rd.assign_id,
        rd.followup_date,
        rd.cat_id,
        rd.reference_id,
        rd.area_id,
        rd.room_length,
        rd.room_width,
        rd.room_height,
        rd.location_link,
        rd.p_type,
        rd.budget_range,
        rd.time_to_complete,
        rd.site_visit_date,
        rd.demo_date,
        rd.lead_activity,
        rd.ar_number,
        rd.ca_number,
        rd.e_number,
        rd.sm_number,
        rd.pop_number,
        rd.other_number,
        rd.quick_remark,
        rd.detailed_remark,

        a.area_name,
        c.cat_name,
        r.reference_name,

        asg.assign_date,
        asg.target_date,
        asg.mode,
        asg.remark AS assignment_remark,
        asg.assigned_to,
        asg.assigned_to_user_id,
        asg.assign_type,

        CASE WHEN q.qt_id IS NOT NULL THEN 1 ELSE 0 END AS created_flag

      FROM raw_data rd
      LEFT JOIN area a ON rd.area_id = a.area_id
      LEFT JOIN category c ON rd.cat_id = c.cat_id
      LEFT JOIN reference r ON rd.reference_id = r.reference_id
      LEFT JOIN assignments asg ON rd.assign_id = asg.assign_id
      LEFT JOIN quotation q ON rd.master_id = q.master_id

      WHERE rd.lead_stage IN ('Quotation Pending', 'Quotation Created')

      ORDER BY rd.master_id DESC
    `);

    /* ================= REASSIGNMENTS ================= */
    const masterIds = rows.map((r) => r.master_id);
    let reassignmentRows = [];

    if (masterIds.length > 0) {
      const [reassignments] = await connection.query(
        `
        SELECT 
          rm.*, 
          u.name, 
          u.role
        FROM reassignment rm
        LEFT JOIN users u ON u.user_id = rm.created_by_user
        WHERE rm.master_id IN (?)
        ORDER BY rm.reassignment_date DESC, rm.created_at DESC
        `,
        [masterIds],
      );

      reassignmentRows = reassignments;
    }

    /* ================= FORMAT RESPONSE ================= */
    const formattedRows = rows.map((row) => {
      const reassignments = reassignmentRows
        .filter((r) => r.master_id === row.master_id)
        .map((r) => ({
          remark: r.remark,
          assignedTo: r.assignedTo,
          leadStage: r.leadStage,
          created_by_user: r.created_by_user,
          created_at: r.created_at
            ? new Date(r.created_at).toLocaleString('en-GB')
            : null,
          reassignment_date: r.reassignment_date
            ? new Date(r.reassignment_date).toLocaleString('en-GB')
            : null,
          name: r.name,
          role: r.role,
        }));

      return {
        ...row,
        reassignment_remarks: reassignments,
        latest_assignedTo: reassignments.length
          ? reassignments[0].assignedTo
          : null,
        latest_leadStage: reassignments.length
          ? reassignments[0].leadStage
          : null,
      };
    });

    return res.status(200).json(formattedRows);
  } catch (error) {
    console.error('❌ Error fetching quotation leads:', error);
    return res.status(500).json({
      message: 'Failed to fetch quotation leads',
    });
  } finally {
    connection.release();
  }
}; 

export const getQuotationPendingLeads2 = async (req, res) => {
  const connection = await db.getConnection();

  try {
    /* ================= MAIN LEADS ================= */
    const [rows] = await connection.query(`
      SELECT 
        rd.master_id,
        rd.name,
        rd.number,
        rd.email,
        rd.address,
        rd.city,
        rd.status,
        rd.lead_status,
        rd.lead_stage,
        rd.current_stage,
        rd.created_by_user,
        rd.assign_id,
        rd.followup_date,
        rd.cat_id,
        rd.reference_id,
        rd.area_id,
        rd.room_length,
        rd.room_width,
        rd.room_height,
        rd.location_link,
        rd.p_type,
        rd.budget_range,
        rd.time_to_complete,
        rd.site_visit_date,
        rd.demo_date,
        rd.lead_activity,
        rd.ar_number,
        rd.ca_number,
        rd.e_number,
        rd.sm_number,
        rd.pop_number,
        rd.other_number,
        rd.quick_remark,
        rd.detailed_remark,

        a.area_name,
        c.cat_name,
        r.reference_name,

        asg.assign_date,
        asg.target_date,
        asg.mode,
        asg.remark AS assignment_remark,
        asg.assigned_to,
        asg.assigned_to_user_id,
        asg.assign_type,

        CASE WHEN q.qt_id IS NOT NULL THEN 1 ELSE 0 END AS created_flag

      FROM raw_data rd
      LEFT JOIN area a ON rd.area_id = a.area_id
      LEFT JOIN category c ON rd.cat_id = c.cat_id
      LEFT JOIN reference r ON rd.reference_id = r.reference_id
      LEFT JOIN assignments asg ON rd.assign_id = asg.assign_id
      LEFT JOIN quotation q ON rd.master_id = q.master_id

      WHERE rd.lead_stage IN ('Quotation Pending', 'Quotation Created')

      ORDER BY 
        CASE WHEN q.qt_id IS NOT NULL THEN 1 ELSE 0 END DESC,
        rd.master_id DESC
    `);

    /* ================= REASSIGNMENTS ================= */
    const masterIds = rows.map((r) => r.master_id);
    let reassignmentRows = [];

    if (masterIds.length > 0) {
      const [reassignments] = await connection.query(
        `
        SELECT 
          rm.*, 
          u.name, 
          u.role
        FROM reassignment rm
        LEFT JOIN users u ON u.user_id = rm.created_by_user
        WHERE rm.master_id IN (?)
        ORDER BY rm.reassignment_date DESC, rm.created_at DESC
        `,
        [masterIds],
      );

      reassignmentRows = reassignments;
    }

    /* ================= FORMAT RESPONSE ================= */
    const formattedRows = rows.map((row) => {
      const reassignments = reassignmentRows
        .filter((r) => r.master_id === row.master_id)
        .map((r) => ({
          remark: r.remark,
          assignedTo: r.assignedTo,
          leadStage: r.leadStage,
          created_by_user: r.created_by_user,
          created_at: r.created_at
            ? new Date(r.created_at).toLocaleString('en-GB')
            : null,
          reassignment_date: r.reassignment_date
            ? new Date(r.reassignment_date).toLocaleString('en-GB')
            : null,
          name: r.name,
          role: r.role,
        }));

      return {
        ...row,
        reassignment_remarks: reassignments,
        latest_assignedTo: reassignments.length
          ? reassignments[0].assignedTo
          : null,
        latest_leadStage: reassignments.length
          ? reassignments[0].leadStage
          : null,
      };
    });

    return res.status(200).json(formattedRows);
  } catch (error) {
    console.error('❌ Error fetching quotation leads:', error);
    return res.status(500).json({
      message: 'Failed to fetch quotation leads',
    });
  } finally {
    connection.release();
  }
};



export const getQuotationPendingLeads = async (req, res) => {
  const connection = await db.getConnection();

  try {
    /* ================= MAIN LEADS ================= */
  const [rows] = await connection.query(`
  SELECT 
    rd.master_id,
    rd.name,
    rd.number,
    rd.email,
    rd.address,
    rd.city,
    rd.status,
    rd.lead_status,
    rd.lead_stage,
    rd.current_stage,
    rd.created_by_user,
    rd.assign_id,
    rd.followup_date,
    rd.cat_id,
    rd.reference_id,
    rd.area_id,
    rd.room_length,
    rd.room_width,
    rd.room_height,
    rd.location_link,
    rd.p_type,
    rd.budget_range,
    rd.time_to_complete,
    rd.site_visit_date,
    rd.demo_date,
    rd.lead_activity,
    rd.ar_number,
    rd.ca_number,
    rd.e_number,
    rd.sm_number,
    rd.pop_number,
    rd.other_number,
    rd.quick_remark,
    rd.detailed_remark,

    a.area_name,
    c.cat_name,
    r.reference_name,

    asg.assign_date,
    asg.target_date,
    asg.mode,
    asg.remark AS assignment_remark,
    asg.assigned_to,
    asg.assigned_to_user_id,
    asg.assign_type,

    CASE WHEN q.qt_id IS NOT NULL THEN 1 ELSE 0 END AS created_flag,
    q.created_at AS quotation_created_date

  FROM raw_data rd
  LEFT JOIN area a ON rd.area_id = a.area_id
  LEFT JOIN category c ON rd.cat_id = c.cat_id
  LEFT JOIN reference r ON rd.reference_id = r.reference_id
  LEFT JOIN assignments asg ON rd.assign_id = asg.assign_id
  LEFT JOIN quotation q ON rd.master_id = q.master_id

  WHERE rd.lead_stage IN ('Quotation Pending', 'Quotation Created', 'Execution', 'Pre Execution', 'Quotation Follow-up')
  
  ORDER BY 
    q.created_at DESC,
    CASE WHEN q.qt_id IS NOT NULL THEN 1 ELSE 0 END DESC,
    rd.master_id DESC
`);
    /* ================= REASSIGNMENTS ================= */
    const masterIds = rows.map((r) => r.master_id);
    let reassignmentRows = [];

    if (masterIds.length > 0) {
      const [reassignments] = await connection.query(
        `
        SELECT 
          rm.*, 
          u.name, 
          u.role
        FROM reassignment rm
        LEFT JOIN users u ON u.user_id = rm.created_by_user
        WHERE rm.master_id IN (?)
        ORDER BY rm.reassignment_date DESC, rm.created_at DESC
        `,
        [masterIds],
      );

      reassignmentRows = reassignments;
    }

    /* ================= FORMAT RESPONSE ================= */
    const formattedRows = rows.map((row) => {
      const reassignments = reassignmentRows
        .filter((r) => r.master_id === row.master_id)
        .map((r) => ({
          remark: r.remark,
          assignedTo: r.assignedTo,
          leadStage: r.leadStage,
          created_by_user: r.created_by_user,
          created_at: r.created_at
            ? new Date(r.created_at).toLocaleString('en-GB')
            : null,
          reassignment_date: r.reassignment_date
            ? new Date(r.reassignment_date).toLocaleString('en-GB')
            : null,
          name: r.name,
          role: r.role,
        }));

      return {
        ...row,
        reassignment_remarks: reassignments,
        latest_assignedTo: reassignments.length
          ? reassignments[0].assignedTo
          : null,
        latest_leadStage: reassignments.length
          ? reassignments[0].leadStage
          : null,
      };
    });

    return res.status(200).json(formattedRows);
  } catch (error) {
    console.error('❌ Error fetching quotation leads:', error);
    return res.status(500).json({
      message: 'Failed to fetch quotation leads',
    });
  } finally {
    connection.release();
  }
};



export const getAssignedMissTodaysLeadsFullData1 = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Unauthorized: No session" });
    }

    const { id: userId, role } = req.session.user;
    const today = new Date().toISOString().slice(0, 10);
    
    // Get pagination and filter parameters from query
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // Get filter parameters
    const search = req.query.search || '';
    const entryFromDate = req.query.entryFromDate;
    const entryToDate = req.query.entryToDate;
    const followupFromDate = req.query.followupFromDate;
    const followupToDate = req.query.followupToDate;
    const stages = req.query.stages ? req.query.stages.split(',') : [];
    const users = req.query.users ? req.query.users.split(',') : [];
    const cities = req.query.cities ? req.query.cities.split(',') : [];

    /* ================= CURRENT USER ================= */
    const [userResult] = await db.query(
      "SELECT name FROM users WHERE user_id = ?",
      [userId]
    );
    const currentUserName = userResult[0]?.name || '';

    /* ================= GET LATEST REASSIGNMENT IDS ================= */
    const [latestReassignments] = await db.query(`
      SELECT master_id, MAX(id) as latest_id
      FROM reassignment
      GROUP BY master_id
    `);
    
    const latestReassignmentIds = latestReassignments.map(r => r.latest_id);

    /* ================= PART 1: GET COUNTS (like your count controller) ================= */
    let countQuery = `
      SELECT 
        COUNT(DISTINCT CASE 
          WHEN (rd.followup_date = CURDATE() OR DATE(re.reassignment_date) = CURDATE()) 
          AND rd.lead_stage NOT IN ('Drop', 'Closed Deal')
          THEN rd.master_id 
        END) AS today_count,
        
        COUNT(DISTINCT CASE 
          WHEN rd.followup_date < ? 
          AND rd.lead_stage NOT IN ('Drop', 'Closed Deal')
          THEN rd.master_id 
        END) AS missed_count
        
      FROM raw_data rd
      LEFT JOIN reassignment re ON rd.master_id = re.master_id
      WHERE re.id IN (?)
    `;

    let countParams = [today, latestReassignmentIds];

    // Add search filter to counts
    if (search) {
      countQuery += ` AND (
        rd.name LIKE ? OR 
        rd.number LIKE ? OR 
        rd.email LIKE ? OR 
        rd.address LIKE ? OR 
        rd.city LIKE ? OR 
        rd.lead_stage LIKE ? OR 
        re.assignedTo LIKE ?
      )`;
      const searchPattern = `%${search}%`;
      countParams.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
    }

    // Add date filters to counts
    if (entryFromDate) {
      countQuery += ` AND DATE(rd.assign_date) >= ?`;
      countParams.push(entryFromDate);
    }
    if (entryToDate) {
      countQuery += ` AND DATE(rd.assign_date) <= ?`;
      countParams.push(entryToDate);
    }
    if (followupFromDate) {
      countQuery += ` AND DATE(rd.followup_date) >= ?`;
      countParams.push(followupFromDate);
    }
    if (followupToDate) {
      countQuery += ` AND DATE(rd.followup_date) <= ?`;
      countParams.push(followupToDate);
    }

    // Add stage filter
    if (stages.length > 0) {
      countQuery += ` AND rd.lead_stage IN (?)`;
      countParams.push(stages);
    }

    // Add user filter
    if (users.length > 0) {
      countQuery += ` AND re.assignedTo IN (?)`;
      countParams.push(users);
    }

    // Add city filter
    if (cities.length > 0) {
      countQuery += ` AND rd.city IN (?)`;
      countParams.push(cities);
    }

    // Role filter for counts
    if (isTelecallerLike(role)) {
      countQuery += ` AND re.assignedTo = ?`;
      countParams.push(currentUserName);
    } else if (isAdminLike(role) || isManagementLike(role)) {
      // Admin/Management see all
    } else {
      countQuery += ` AND re.assignedTo = ?`;
      countParams.push(currentUserName);
    }

    const [countResult] = await db.query(countQuery, countParams);
    const todayTotal = countResult[0]?.today_count || 0;
    const missedTotal = countResult[0]?.missed_count || 0;

    /* ================= PART 2: MISSED LEADS DATA (with pagination) ================= */
    let missedQuery = `
      SELECT 
        rd.master_id,
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
        IFNULL(rd.cat_id, 'Not Available') AS cat_id,
        IFNULL(rd.reference_id, 'Not Available') AS reference_id,
        IFNULL(rd.area_id, 'Not Available') AS area_id,
        IFNULL(rd.room_length, 'Not Available') AS room_length,
        IFNULL(rd.room_width, 'Not Available') AS room_width,
        IFNULL(rd.room_height, 'Not Available') AS room_height,
        IFNULL(rd.location_link, 'Not Available') AS location_link,
        IFNULL(rd.p_type, 'Not Available') AS p_type,
        IFNULL(rd.budget_range, 'Not Available') AS budget_range,
        IFNULL(rd.time_to_complete, 'Not Available') AS time_to_complete,
        IFNULL(rd.site_visit_date, 'Not Available') AS site_visit_date,
        IFNULL(rd.demo_date, 'Not Available') AS demo_date,
        IFNULL(rd.lead_activity, 0) AS lead_activity,
        IFNULL(rd.ar_number, 'Not Available') AS ar_number,
        IFNULL(rd.architect_name, 'Not Available') AS architect_name,
        IFNULL(rd.ca_number, 'Not Available') AS ca_number,
        IFNULL(rd.e_number, 'Not Available') AS e_number,
        IFNULL(rd.sm_number, 'Not Available') AS sm_number,
        IFNULL(rd.pop_number, 'Not Available') AS pop_number,
        IFNULL(rd.other_number, 'Not Available') AS other_number,
        IFNULL(rd.quick_remark, 'Not Available') AS quick_remark,
        IFNULL(rd.detailed_remark, 'Not Available') AS detailed_remark,
        IFNULL(a.area_name, 'Not Available') AS area_name,
        IFNULL(c.cat_name, 'Not Available') AS cat_name,
        IFNULL(ref.reference_name, 'Not Available') AS reference_name,
        IFNULL(DATE(asg.assign_date), 'Not Available') AS assign_date,
        lr.id AS reassignment_id,
        lr.reassignment_date,
        lr.assignedTo AS reassigned_to,
        lr.remark AS reassignment_remark,
        lr.leadStage AS reassignment_lead_stage,
        IFNULL(u.name, 'Not Available') AS telecaller_name,
        u.user_id AS assigned_to_user_id,
        MAX(tct.tc_remark) AS call_remark,
        MAX(tct.tc_call_duration) AS call_duration,
        GROUP_CONCAT(p.product_name) AS products,
        MAX(d.location_link) AS document_location_link,
        'missed' AS data_type

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
      LEFT JOIN reassignment re ON rd.master_id = re.master_id

      WHERE rd.followup_date < ?
      AND rd.lead_stage NOT IN ('Drop','Closed Deal')
      AND re.id IN (?)
    `;

    let missedParams = [today, latestReassignmentIds];

    // Add filters to missed query
    if (search) {
      missedQuery += ` AND (
        rd.name LIKE ? OR 
        rd.number LIKE ? OR 
        rd.email LIKE ? OR 
        rd.address LIKE ? OR 
        rd.city LIKE ? OR 
        rd.lead_stage LIKE ? OR 
        lr.assignedTo LIKE ?
      )`;
      const searchPattern = `%${search}%`;
      missedParams.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
    }

    if (entryFromDate) {
      missedQuery += ` AND DATE(rd.assign_date) >= ?`;
      missedParams.push(entryFromDate);
    }
    if (entryToDate) {
      missedQuery += ` AND DATE(rd.assign_date) <= ?`;
      missedParams.push(entryToDate);
    }
    if (followupFromDate) {
      missedQuery += ` AND DATE(rd.followup_date) >= ?`;
      missedParams.push(followupFromDate);
    }
    if (followupToDate) {
      missedQuery += ` AND DATE(rd.followup_date) <= ?`;
      missedParams.push(followupToDate);
    }

    if (stages.length > 0) {
      missedQuery += ` AND rd.lead_stage IN (?)`;
      missedParams.push(stages);
    }

    if (users.length > 0) {
      missedQuery += ` AND lr.assignedTo IN (?)`;
      missedParams.push(users);
    }

    if (cities.length > 0) {
      missedQuery += ` AND rd.city IN (?)`;
      missedParams.push(cities);
    }

    if (isTelecallerLike(role)) {
      missedQuery += ` AND lr.assignedTo = ?`;
      missedParams.push(currentUserName);
    } else if (!isAdminLike(role) && !isManagementLike(role)) {
      missedQuery += ` AND lr.assignedTo = ?`;
      missedParams.push(currentUserName);
    }

    missedQuery += ` GROUP BY rd.master_id ORDER BY rd.followup_date ASC LIMIT ? OFFSET ?`;
    missedParams.push(limit, offset);

    const [missedRows] = await db.query(missedQuery, missedParams);

    /* ================= PART 3: TODAY'S LEADS DATA (NO PAGINATION) ================= */
    let todaysQuery = `
      SELECT 
        rd.master_id,
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
        IFNULL(rd.cat_id, 'Not Available') AS cat_id,
        IFNULL(rd.reference_id, 'Not Available') AS reference_id,
        IFNULL(rd.area_id, 'Not Available') AS area_id,
        IFNULL(rd.room_length, 'Not Available') AS room_length,
        IFNULL(rd.room_width, 'Not Available') AS room_width,
        IFNULL(rd.room_height, 'Not Available') AS room_height,
        IFNULL(rd.location_link, 'Not Available') AS location_link,
        IFNULL(rd.p_type, 'Not Available') AS p_type,
        IFNULL(rd.budget_range, 'Not Available') AS budget_range,
        IFNULL(rd.time_to_complete, 'Not Available') AS time_to_complete,
        IFNULL(rd.site_visit_date, 'Not Available') AS site_visit_date,
        IFNULL(rd.demo_date, 'Not Available') AS demo_date,
        IFNULL(rd.lead_activity, 0) AS lead_activity,
        IFNULL(rd.ar_number, 'Not Available') AS ar_number,
        IFNULL(rd.architect_name, 'Not Available') AS architect_name,
        IFNULL(rd.ca_number, 'Not Available') AS ca_number,
        IFNULL(rd.e_number, 'Not Available') AS e_number,
        IFNULL(rd.sm_number, 'Not Available') AS sm_number,
        IFNULL(rd.pop_number, 'Not Available') AS pop_number,
        IFNULL(rd.other_number, 'Not Available') AS other_number,
        IFNULL(rd.quick_remark, 'Not Available') AS quick_remark,
        IFNULL(rd.detailed_remark, 'Not Available') AS detailed_remark,
        IFNULL(a.area_name, 'Not Available') AS area_name,
        IFNULL(c.cat_name, 'Not Available') AS cat_name,
        IFNULL(ref.reference_name, 'Not Available') AS reference_name,
        IFNULL(DATE(asg.assign_date), 'Not Available') AS assign_date,
        lr.id AS reassignment_id,
        lr.reassignment_date,
        lr.assignedTo AS reassigned_to,
        lr.remark AS reassignment_remark,
        lr.leadStage AS reassignment_lead_stage,
        IFNULL(u.name, 'Not Available') AS telecaller_name,
        u.user_id AS assigned_to_user_id,
        MAX(d.location_link) AS document_location_link,
        'todays' AS data_type

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
      LEFT JOIN documents d ON d.master_id = rd.master_id
      LEFT JOIN reassignment re ON rd.master_id = re.master_id

      WHERE (rd.followup_date = CURDATE() OR DATE(re.reassignment_date) = CURDATE())
      AND rd.lead_stage NOT IN ('Drop', 'Closed Deal')
      AND re.id IN (?)
    `;

    let todaysParams = [latestReassignmentIds];

    // Add filters to today's query
    if (search) {
      todaysQuery += ` AND (
        rd.name LIKE ? OR 
        rd.number LIKE ? OR 
        rd.email LIKE ? OR 
        rd.address LIKE ? OR 
        rd.city LIKE ? OR 
        rd.lead_stage LIKE ? OR 
        lr.assignedTo LIKE ?
      )`;
      const searchPattern = `%${search}%`;
      todaysParams.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
    }

    if (entryFromDate) {
      todaysQuery += ` AND DATE(rd.assign_date) >= ?`;
      todaysParams.push(entryFromDate);
    }
    if (entryToDate) {
      todaysQuery += ` AND DATE(rd.assign_date) <= ?`;
      todaysParams.push(entryToDate);
    }

    if (stages.length > 0) {
      todaysQuery += ` AND rd.lead_stage IN (?)`;
      todaysParams.push(stages);
    }

    if (users.length > 0) {
      todaysQuery += ` AND lr.assignedTo IN (?)`;
      todaysParams.push(users);
    }

    if (cities.length > 0) {
      todaysQuery += ` AND rd.city IN (?)`;
      todaysParams.push(cities);
    }

    if (isTelecallerLike(role)) {
      todaysQuery += ` AND lr.assignedTo = ?`;
      todaysParams.push(currentUserName);
    } else if (isAdminLike(role)) {
      todaysQuery += ` AND rd.status IN ('Assigned', 'Not Interested')`;
    } else if (!isManagementLike(role)) {
      todaysQuery += ` AND lr.assignedTo = ?`;
      todaysParams.push(currentUserName);
    }

    todaysQuery += ` GROUP BY rd.master_id ORDER BY rd.followup_date ASC`;

    const [todaysRows] = await db.query(todaysQuery, todaysParams);

    /* ================= COMBINE ALL MASTER IDS for other data ================= */
    const allRows = [...missedRows, ...todaysRows];
    const masterIds = allRows.map(r => r.master_id);

    /* ================= OTHER INPUTS ================= */
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

    /* ================= FORMAT MISSED ROWS ================= */
    const formattedMissedRows = missedRows.map(row => {
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

    /* ================= FORMAT TODAY'S ROWS ================= */
    const formattedTodaysRows = todaysRows.map(row => {
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

    // Calculate pagination info
    const missedTotalPages = Math.ceil(missedTotal / limit);

    return res.status(200).json({
      success: true,
      // Counts (matching your count controller)
      todayCount: todayTotal,
      missedCount: missedTotal,
      totalCount: todayTotal + missedTotal,
      
      // Missed assignments data with pagination
      missed: {
        total: missedTotal,
        currentPage: page,
        totalPages: missedTotalPages,
        limit: limit,
        leads: formattedMissedRows,
        showing: {
          from: offset + 1,
          to: Math.min(offset + limit, missedTotal),
          total: missedTotal
        }
      },
      
      // Today's assignments data
      today: {
        total: todayTotal,
        leads: formattedTodaysRows
      }
    });

  } catch (error) {
    console.error("❌ Error in getAssignedMissTodaysLeadsFullData:", error);
    res.status(500).json({ message: "Failed to fetch dashboard data" });
  }
};

export const getAssignedMissTodaysLeadsFullData2 = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Unauthorized: No session" });
    }

    const { id: userId, role } = req.session.user;
    const today = new Date().toISOString().slice(0, 10);
    
    // Get pagination and filter parameters from query
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;
    
    // Get filter parameters
    const search = req.query.search || '';
    const entryFromDate = req.query.entryFromDate;
    const entryToDate = req.query.entryToDate;
    const followupFromDate = req.query.followupFromDate;
    const followupToDate = req.query.followupToDate;
    const stages = req.query.stages ? req.query.stages.split(',') : [];
    const users = req.query.users ? req.query.users.split(',') : [];
    const cities = req.query.cities ? req.query.cities.split(',') : [];

    /* ================= CURRENT USER ================= */
    const [userResult] = await db.query(
      "SELECT name FROM users WHERE user_id = ?",
      [userId]
    );
    const currentUserName = userResult[0]?.name || '';

    /* ================= GET LATEST REASSIGNMENT IDS ================= */
    const [latestReassignments] = await db.query(`
      SELECT master_id, MAX(id) as latest_id
      FROM reassignment
      GROUP BY master_id
    `);
    
    const latestReassignmentIds = latestReassignments.map(r => r.latest_id);

    /* ================= GET TOTAL COUNT FOR PAGINATION ================= */
    let countQuery = `
      SELECT COUNT(DISTINCT rd.master_id) AS total_count
      FROM raw_data rd
      LEFT JOIN reassignment re ON rd.master_id = re.master_id
      LEFT JOIN (
        SELECT r1.*, ROW_NUMBER() OVER (PARTITION BY master_id ORDER BY id DESC) rn
        FROM reassignment r1
      ) lr ON rd.master_id = lr.master_id AND lr.rn = 1
      WHERE (rd.followup_date < ? OR rd.followup_date = CURDATE() OR DATE(re.reassignment_date) = CURDATE())
AND rd.lead_stage NOT IN ('Drop', 'Closed Deal', 'Execution', 'Pre Execution')
      AND re.id IN (?)
    `;

    let countParams = [today, latestReassignmentIds];

    // Add search filter to count
    if (search) {
      countQuery += ` AND (
        rd.name LIKE ? OR 
        rd.number LIKE ? OR 
        rd.email LIKE ? OR 
        rd.address LIKE ? OR 
        rd.city LIKE ? OR 
        rd.lead_stage LIKE ? OR 
        lr.assignedTo LIKE ?
      )`;
      const searchPattern = `%${search}%`;
      countParams.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
    }

    // Add date filters to count
    if (entryFromDate) {
      countQuery += ` AND DATE(rd.assign_date) >= ?`;
      countParams.push(entryFromDate);
    }
    if (entryToDate) {
      countQuery += ` AND DATE(rd.assign_date) <= ?`;
      countParams.push(entryToDate);
    }
    if (followupFromDate) {
      countQuery += ` AND DATE(rd.followup_date) >= ?`;
      countParams.push(followupFromDate);
    }
    if (followupToDate) {
      countQuery += ` AND DATE(rd.followup_date) <= ?`;
      countParams.push(followupToDate);
    }

    // Add stage filter
    if (stages.length > 0) {
      countQuery += ` AND rd.lead_stage IN (?)`;
      countParams.push(stages);
    }

    // Add user filter
    if (users.length > 0) {
      countQuery += ` AND lr.assignedTo IN (?)`;
      countParams.push(users);
    }

    // Add city filter
    if (cities.length > 0) {
      countQuery += ` AND rd.city IN (?)`;
      countParams.push(cities);
    }

    // Role filter for count
    if (isTelecallerLike(role)) {
      countQuery += ` AND lr.assignedTo = ?`;
      countParams.push(currentUserName);
    } else if (isAdminLike(role) || isManagementLike(role)) {
      // Admin/Management see all
    } else {
      countQuery += ` AND lr.assignedTo = ?`;
      countParams.push(currentUserName);
    }

    const [countResult] = await db.query(countQuery, countParams);
    const totalCount = countResult[0]?.total_count || 0;

    /* ================= GET COMBINED LEADS DATA WITH PAGINATION ================= */
    let leadsQuery = `
      SELECT 
        rd.master_id,
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
        IFNULL(rd.cat_id, 'Not Available') AS cat_id,
        IFNULL(rd.reference_id, 'Not Available') AS reference_id,
        IFNULL(rd.area_id, 'Not Available') AS area_id,
        IFNULL(rd.room_length, 'Not Available') AS room_length,
        IFNULL(rd.room_width, 'Not Available') AS room_width,
        IFNULL(rd.room_height, 'Not Available') AS room_height,
        IFNULL(rd.location_link, 'Not Available') AS location_link,
        IFNULL(rd.p_type, 'Not Available') AS p_type,
        IFNULL(rd.budget_range, 'Not Available') AS budget_range,
        IFNULL(rd.time_to_complete, 'Not Available') AS time_to_complete,
        IFNULL(rd.site_visit_date, 'Not Available') AS site_visit_date,
        IFNULL(rd.demo_date, 'Not Available') AS demo_date,
        IFNULL(rd.lead_activity, 0) AS lead_activity,
        IFNULL(rd.ar_number, 'Not Available') AS ar_number,
        IFNULL(rd.architect_name, 'Not Available') AS architect_name,
        IFNULL(rd.ca_number, 'Not Available') AS ca_number,
        IFNULL(rd.e_number, 'Not Available') AS e_number,
        IFNULL(rd.sm_number, 'Not Available') AS sm_number,
        IFNULL(rd.pop_number, 'Not Available') AS pop_number,
        IFNULL(rd.other_number, 'Not Available') AS other_number,
        IFNULL(rd.quick_remark, 'Not Available') AS quick_remark,
        IFNULL(rd.detailed_remark, 'Not Available') AS detailed_remark,
        IFNULL(a.area_name, 'Not Available') AS area_name,
        IFNULL(c.cat_name, 'Not Available') AS cat_name,
        IFNULL(ref.reference_name, 'Not Available') AS reference_name,
        IFNULL(DATE(asg.assign_date), 'Not Available') AS assign_date,
        lr.id AS reassignment_id,
        lr.reassignment_date,
        lr.assignedTo AS reassigned_to,
        lr.remark AS reassignment_remark,
        lr.leadStage AS reassignment_lead_stage,
        IFNULL(u.name, 'Not Available') AS telecaller_name,
        u.user_id AS assigned_to_user_id,
        MAX(d.location_link) AS document_location_link,
        CASE 
          WHEN rd.followup_date < ? THEN 'missed'
          ELSE 'todays'
        END AS data_type

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
      LEFT JOIN documents d ON d.master_id = rd.master_id
      LEFT JOIN reassignment re ON rd.master_id = re.master_id

      WHERE (rd.followup_date < ? OR rd.followup_date = CURDATE() OR DATE(re.reassignment_date) = CURDATE())
AND rd.lead_stage NOT IN ('Drop','Closed Deal','Execution','Pre Execution')
      AND re.id IN (?)
    `;

    let leadsParams = [today, today, latestReassignmentIds];

    // Add filters to leads query
    if (search) {
      leadsQuery += ` AND (
        rd.name LIKE ? OR 
        rd.number LIKE ? OR 
        rd.email LIKE ? OR 
        rd.address LIKE ? OR 
        rd.city LIKE ? OR 
        rd.lead_stage LIKE ? OR 
        lr.assignedTo LIKE ?
      )`;
      const searchPattern = `%${search}%`;
      leadsParams.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
    }

    if (entryFromDate) {
      leadsQuery += ` AND DATE(rd.assign_date) >= ?`;
      leadsParams.push(entryFromDate);
    }
    if (entryToDate) {
      leadsQuery += ` AND DATE(rd.assign_date) <= ?`;
      leadsParams.push(entryToDate);
    }
    if (followupFromDate) {
      leadsQuery += ` AND DATE(rd.followup_date) >= ?`;
      leadsParams.push(followupFromDate);
    }
    if (followupToDate) {
      leadsQuery += ` AND DATE(rd.followup_date) <= ?`;
      leadsParams.push(followupToDate);
    }

    if (stages.length > 0) {
      leadsQuery += ` AND rd.lead_stage IN (?)`;
      leadsParams.push(stages);
    }

    if (users.length > 0) {
      leadsQuery += ` AND lr.assignedTo IN (?)`;
      leadsParams.push(users);
    }

    if (cities.length > 0) {
      leadsQuery += ` AND rd.city IN (?)`;
      leadsParams.push(cities);
    }

    if (isTelecallerLike(role)) {
      leadsQuery += ` AND lr.assignedTo = ?`;
      leadsParams.push(currentUserName);
    } else if (!isAdminLike(role) && !isManagementLike(role)) {
      leadsQuery += ` AND lr.assignedTo = ?`;
      leadsParams.push(currentUserName);
    }

    leadsQuery += ` GROUP BY rd.master_id ORDER BY rd.followup_date ASC LIMIT ? OFFSET ?`;
    leadsParams.push(limit, offset);

    const [leadsRows] = await db.query(leadsQuery, leadsParams);

    /* ================= GET COUNTS FOR TODAY/MISSED SEPARATELY ================= */
    let todayCountQuery = `
      SELECT COUNT(DISTINCT rd.master_id) AS count
      FROM raw_data rd
      LEFT JOIN reassignment re ON rd.master_id = re.master_id
      WHERE (rd.followup_date = CURDATE() OR DATE(re.reassignment_date) = CURDATE())
AND rd.lead_stage NOT IN ('Drop','Closed Deal','Execution','Pre Execution') 
     AND re.id IN (?)
    `;
    
    let missedCountQuery = `
      SELECT COUNT(DISTINCT rd.master_id) AS count
      FROM raw_data rd
      LEFT JOIN reassignment re ON rd.master_id = re.master_id
      WHERE rd.followup_date < ?
AND rd.lead_stage NOT IN ('Drop','Closed Deal','Execution','Pre Execution')
      AND re.id IN (?)
    `;

    const [todayCountResult] = await db.query(todayCountQuery, [latestReassignmentIds]);
    const [missedCountResult] = await db.query(missedCountQuery, [today, latestReassignmentIds]);
    
    const todayTotal = todayCountResult[0]?.count || 0;
    const missedTotal = missedCountResult[0]?.count || 0;

    /* ================= GET OTHER DATA (same as before) ================= */
    const masterIds = leadsRows.map(r => r.master_id);

    // Get other inputs
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

    // Get reassignment history
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

    // Format the leads
    const formattedLeads = leadsRows.map(row => {
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

    // Separate missed and today's leads
    const missedLeads = formattedLeads.filter(lead => lead.data_type === 'missed');
    const todaysLeads = formattedLeads.filter(lead => lead.data_type === 'todays');

    const totalPages = Math.ceil(totalCount / limit);

    return res.status(200).json({
      success: true,
      todayCount: todayTotal,
      missedCount: missedTotal,
      totalCount: totalCount,
      
      // Paginated combined results
      leads: {
        total: totalCount,
        currentPage: page,
        totalPages: totalPages,
        limit: limit,
        data: formattedLeads,
        showing: {
          from: offset + 1,
          to: Math.min(offset + limit, totalCount),
          total: totalCount
        }
      },
      
      // Separate counts (for UI badges)
      today: {
        total: todayTotal,
        leads: todaysLeads
      },
      
      missed: {
        total: missedTotal,
        leads: missedLeads
      }
    });

  } catch (error) {
    console.error("❌ Error in getAssignedMissTodaysLeadsFullData:", error);
    res.status(500).json({ message: "Failed to fetch dashboard data" });
  }
};


export const getAssignedMissTodaysLeadsFullData3 = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Unauthorized: No session" });
    }

    const { id: userId, role } = req.session.user;
    const today = new Date().toISOString().slice(0, 10);
    
    // Get pagination and filter parameters from query
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;
    
    // Get filter parameters
    const search = req.query.search || '';
    const entryFromDate = req.query.entryFromDate;
    const entryToDate = req.query.entryToDate;
    const followupFromDate = req.query.followupFromDate;
    const followupToDate = req.query.followupToDate;
    const stages = req.query.stages ? req.query.stages.split(',') : [];
    const users = req.query.users ? req.query.users.split(',') : [];
    const cities = req.query.cities ? req.query.cities.split(',') : [];

    /* ================= CURRENT USER ================= */
    const [userResult] = await db.query(
      "SELECT name FROM users WHERE user_id = ?",
      [userId]
    );
    const currentUserName = userResult[0]?.name || '';

    /* ================= GET LATEST REASSIGNMENT IDS ================= */
    const [latestReassignments] = await db.query(`
      SELECT master_id, MAX(id) as latest_id
      FROM reassignment
      GROUP BY master_id
    `);
    
    const latestReassignmentIds = latestReassignments.map(r => r.latest_id);

    /* ================= GET TOTAL COUNT FOR PAGINATION ================= */
    let countQuery = `
      SELECT COUNT(DISTINCT rd.master_id) AS total_count
      FROM raw_data rd
      LEFT JOIN reassignment re ON rd.master_id = re.master_id
      LEFT JOIN (
        SELECT r1.*, ROW_NUMBER() OVER (PARTITION BY master_id ORDER BY id DESC) rn
        FROM reassignment r1
      ) lr ON rd.master_id = lr.master_id AND lr.rn = 1
      WHERE (rd.followup_date < ? OR rd.followup_date = CURDATE() OR DATE(re.reassignment_date) = CURDATE())
AND rd.lead_stage NOT IN ('Drop', 'Closed Deal', 'Execution', 'Pre Execution')
      AND re.id IN (?)
    `;

    let countParams = [today, latestReassignmentIds];

    // Add search filter to count
    if (search) {
      countQuery += ` AND (
        rd.name LIKE ? OR 
        rd.number LIKE ? OR 
        rd.email LIKE ? OR 
        rd.address LIKE ? OR 
        rd.city LIKE ? OR 
        rd.lead_stage LIKE ? OR 
        lr.assignedTo LIKE ?
      )`;
      const searchPattern = `%${search}%`;
      countParams.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
    }

    // Add date filters to count
    if (entryFromDate) {
      countQuery += ` AND DATE(rd.assign_date) >= ?`;
      countParams.push(entryFromDate);
    }
    if (entryToDate) {
      countQuery += ` AND DATE(rd.assign_date) <= ?`;
      countParams.push(entryToDate);
    }
    if (followupFromDate) {
      countQuery += ` AND DATE(rd.followup_date) >= ?`;
      countParams.push(followupFromDate);
    }
    if (followupToDate) {
      countQuery += ` AND DATE(rd.followup_date) <= ?`;
      countParams.push(followupToDate);
    }

    // Add stage filter
    if (stages.length > 0) {
      countQuery += ` AND rd.lead_stage IN (?)`;
      countParams.push(stages);
    }

    // Add user filter
    if (users.length > 0) {
      countQuery += ` AND lr.assignedTo IN (?)`;
      countParams.push(users);
    }

    // Add city filter
    if (cities.length > 0) {
      countQuery += ` AND rd.city IN (?)`;
      countParams.push(cities);
    }

    // Role filter for count
    if (isTelecallerLike(role)) {
      countQuery += ` AND lr.assignedTo = ?`;
      countParams.push(currentUserName);
    } else if (isAdminLike(role) || isManagementLike(role)) {
      // Admin/Management see all
    } else {
      countQuery += ` AND lr.assignedTo = ?`;
      countParams.push(currentUserName);
    }

    const [countResult] = await db.query(countQuery, countParams);
    const totalCount = countResult[0]?.total_count || 0;

    /* ================= GET COMBINED LEADS DATA WITH PAGINATION ================= */
    let leadsQuery = `
      SELECT 
        rd.master_id,
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
        IFNULL(rd.cat_id, 'Not Available') AS cat_id,
        IFNULL(rd.reference_id, 'Not Available') AS reference_id,
        IFNULL(rd.area_id, 'Not Available') AS area_id,
        IFNULL(rd.room_length, 'Not Available') AS room_length,
        IFNULL(rd.room_width, 'Not Available') AS room_width,
        IFNULL(rd.room_height, 'Not Available') AS room_height,
        IFNULL(rd.location_link, 'Not Available') AS location_link,
        IFNULL(rd.p_type, 'Not Available') AS p_type,
        IFNULL(rd.budget_range, 'Not Available') AS budget_range,
        IFNULL(rd.time_to_complete, 'Not Available') AS time_to_complete,
        IFNULL(rd.site_visit_date, 'Not Available') AS site_visit_date,
        IFNULL(rd.demo_date, 'Not Available') AS demo_date,
        IFNULL(rd.lead_activity, 0) AS lead_activity,
        IFNULL(rd.ar_number, 'Not Available') AS ar_number,
        IFNULL(rd.architect_name, 'Not Available') AS architect_name,
        IFNULL(rd.ca_number, 'Not Available') AS ca_number,
        IFNULL(rd.e_number, 'Not Available') AS e_number,
        IFNULL(rd.sm_number, 'Not Available') AS sm_number,
        IFNULL(rd.pop_number, 'Not Available') AS pop_number,
        IFNULL(rd.other_number, 'Not Available') AS other_number,
        IFNULL(rd.quick_remark, 'Not Available') AS quick_remark,
        IFNULL(rd.detailed_remark, 'Not Available') AS detailed_remark,
        IFNULL(a.area_name, 'Not Available') AS area_name,
        IFNULL(c.cat_name, 'Not Available') AS cat_name,
        IFNULL(ref.reference_name, 'Not Available') AS reference_name,
        IFNULL(DATE(asg.assign_date), 'Not Available') AS assign_date,
        lr.id AS reassignment_id,
        lr.reassignment_date,
        lr.assignedTo AS reassigned_to,
        lr.remark AS reassignment_remark,
        lr.leadStage AS reassignment_lead_stage,
        IFNULL(u.name, 'Not Available') AS telecaller_name,
        u.user_id AS assigned_to_user_id,
        MAX(d.location_link) AS document_location_link,
        CASE 
          WHEN rd.followup_date < ? THEN 'missed'
          ELSE 'todays'
        END AS data_type

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
      LEFT JOIN documents d ON d.master_id = rd.master_id
      LEFT JOIN reassignment re ON rd.master_id = re.master_id

      WHERE (rd.followup_date < ? OR rd.followup_date = CURDATE() OR DATE(re.reassignment_date) = CURDATE())
AND rd.lead_stage NOT IN ('Drop','Closed Deal','Execution','Pre Execution')
      AND re.id IN (?)
    `;

    let leadsParams = [today, today, latestReassignmentIds];

    // Add filters to leads query
    if (search) {
      leadsQuery += ` AND (
        rd.name LIKE ? OR 
        rd.number LIKE ? OR 
        rd.email LIKE ? OR 
        rd.address LIKE ? OR 
        rd.city LIKE ? OR 
        rd.lead_stage LIKE ? OR 
        lr.assignedTo LIKE ?
      )`;
      const searchPattern = `%${search}%`;
      leadsParams.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
    }

    if (entryFromDate) {
      leadsQuery += ` AND DATE(rd.assign_date) >= ?`;
      leadsParams.push(entryFromDate);
    }
    if (entryToDate) {
      leadsQuery += ` AND DATE(rd.assign_date) <= ?`;
      leadsParams.push(entryToDate);
    }
    if (followupFromDate) {
      leadsQuery += ` AND DATE(rd.followup_date) >= ?`;
      leadsParams.push(followupFromDate);
    }
    if (followupToDate) {
      leadsQuery += ` AND DATE(rd.followup_date) <= ?`;
      leadsParams.push(followupToDate);
    }

    if (stages.length > 0) {
      leadsQuery += ` AND rd.lead_stage IN (?)`;
      leadsParams.push(stages);
    }

    if (users.length > 0) {
      leadsQuery += ` AND lr.assignedTo IN (?)`;
      leadsParams.push(users);
    }

    if (cities.length > 0) {
      leadsQuery += ` AND rd.city IN (?)`;
      leadsParams.push(cities);
    }

    if (isTelecallerLike(role)) {
      leadsQuery += ` AND lr.assignedTo = ?`;
      leadsParams.push(currentUserName);
    } else if (!isAdminLike(role) && !isManagementLike(role)) {
      leadsQuery += ` AND lr.assignedTo = ?`;
      leadsParams.push(currentUserName);
    }

    leadsQuery += ` GROUP BY rd.master_id ORDER BY rd.followup_date ASC LIMIT ? OFFSET ?`;
    leadsParams.push(limit, offset);

    const [leadsRows] = await db.query(leadsQuery, leadsParams);

    /* ================= GET COUNTS FOR TODAY/MISSED SEPARATELY ================= */
    let todayCountQuery = `
      SELECT COUNT(DISTINCT rd.master_id) AS count
      FROM raw_data rd
      LEFT JOIN reassignment re ON rd.master_id = re.master_id
      LEFT JOIN (
        SELECT r1.*, ROW_NUMBER() OVER (PARTITION BY master_id ORDER BY id DESC) rn
        FROM reassignment r1
      ) lr ON rd.master_id = lr.master_id AND lr.rn = 1
      WHERE (rd.followup_date = CURDATE() OR DATE(re.reassignment_date) = CURDATE())
AND rd.lead_stage NOT IN ('Drop','Closed Deal','Execution','Pre Execution') 
     AND re.id IN (?)
    `;
    
    let missedCountQuery = `
      SELECT COUNT(DISTINCT rd.master_id) AS count
      FROM raw_data rd
      LEFT JOIN reassignment re ON rd.master_id = re.master_id
      LEFT JOIN (
        SELECT r1.*, ROW_NUMBER() OVER (PARTITION BY master_id ORDER BY id DESC) rn
        FROM reassignment r1
      ) lr ON rd.master_id = lr.master_id AND lr.rn = 1
      WHERE rd.followup_date < ?
AND rd.lead_stage NOT IN ('Drop','Closed Deal','Execution','Pre Execution')
      AND re.id IN (?)
    `;

    // Add role filters to count queries
    if (isTelecallerLike(role)) {
      todayCountQuery += ` AND lr.assignedTo = ?`;
      missedCountQuery += ` AND lr.assignedTo = ?`;
    } else if (!isAdminLike(role) && !isManagementLike(role)) {
      todayCountQuery += ` AND lr.assignedTo = ?`;
      missedCountQuery += ` AND lr.assignedTo = ?`;
    }

    let todayCountParams = [latestReassignmentIds];
    let missedCountParams = [today, latestReassignmentIds];

    if (isTelecallerLike(role) || (!isAdminLike(role) && !isManagementLike(role))) {
      todayCountParams.push(currentUserName);
      missedCountParams.push(currentUserName);
    }

    const [todayCountResult] = await db.query(todayCountQuery, todayCountParams);
    const [missedCountResult] = await db.query(missedCountQuery, missedCountParams);
    
    const todayTotal = todayCountResult[0]?.count || 0;
    const missedTotal = missedCountResult[0]?.count || 0;

    /* ================= GET OTHER DATA (same as before) ================= */
    const masterIds = leadsRows.map(r => r.master_id);

    // Get other inputs
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

    // Get reassignment history
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

    // Format the leads
    const formattedLeads = leadsRows.map(row => {
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

    // Separate missed and today's leads
    const missedLeads = formattedLeads.filter(lead => lead.data_type === 'missed');
    const todaysLeads = formattedLeads.filter(lead => lead.data_type === 'todays');

    const totalPages = Math.ceil(totalCount / limit);

    return res.status(200).json({
      success: true,
      todayCount: todayTotal,
      missedCount: missedTotal,
      totalCount: totalCount,
      
      // Paginated combined results
      leads: {
        total: totalCount,
        currentPage: page,
        totalPages: totalPages,
        limit: limit,
        data: formattedLeads,
        showing: {
          from: offset + 1,
          to: Math.min(offset + limit, totalCount),
          total: totalCount
        }
      },
      
      // Separate counts (for UI badges)
      today: {
        total: todayTotal,
        leads: todaysLeads
      },
      
      missed: {
        total: missedTotal,
        leads: missedLeads
      }
    });

  } catch (error) {
    console.error("❌ Error in getAssignedMissTodaysLeadsFullData:", error);
    res.status(500).json({ message: "Failed to fetch dashboard data" });
  }
};


export const getAssignedMissTodaysLeadsFullData4 = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Unauthorized: No session" });
    }

    const { id: userId, role } = req.session.user;
    const today = new Date().toISOString().slice(0, 10);
    
    // Get pagination and filter parameters from query
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;
    
    // Get filter parameters
    const search = req.query.search || '';
    const entryFromDate = req.query.entryFromDate;
    const entryToDate = req.query.entryToDate;
    const followupFromDate = req.query.followupFromDate;
    const followupToDate = req.query.followupToDate;
    const stages = req.query.stages ? req.query.stages.split(',') : [];
    const users = req.query.users ? req.query.users.split(',') : [];
    const cities = req.query.cities ? req.query.cities.split(',') : [];

    /* ================= CURRENT USER ================= */
    const [userResult] = await db.query(
      "SELECT name FROM users WHERE user_id = ?",
      [userId]
    );
    const currentUserName = userResult[0]?.name || '';

    /* ================= GET LATEST REASSIGNMENT IDS ================= */
    const [latestReassignments] = await db.query(`
      SELECT master_id, MAX(id) as latest_id
      FROM reassignment
      GROUP BY master_id
    `);
    
    const latestReassignmentIds = latestReassignments.map(r => r.latest_id);

    /* ================= GET TOTAL COUNT FOR PAGINATION ================= */
    let countQuery = `
      SELECT COUNT(DISTINCT rd.master_id) AS total_count
      FROM raw_data rd
      LEFT JOIN reassignment re ON rd.master_id = re.master_id
      LEFT JOIN (
        SELECT r1.*, ROW_NUMBER() OVER (PARTITION BY master_id ORDER BY id DESC) rn
        FROM reassignment r1
      ) lr ON rd.master_id = lr.master_id AND lr.rn = 1
      WHERE (rd.followup_date < ? OR rd.followup_date = CURDATE() OR DATE(re.reassignment_date) = CURDATE())
AND rd.lead_stage NOT IN ('Drop', 'Closed Deal', 'Execution', 'Pre Execution')
      AND re.id IN (?)
    `;

    let countParams = [today, latestReassignmentIds];

    // Add search filter to count
    if (search) {
      countQuery += ` AND (
        rd.name LIKE ? OR 
        rd.number LIKE ? OR 
        rd.email LIKE ? OR 
        rd.address LIKE ? OR 
        rd.city LIKE ? OR 
        rd.lead_stage LIKE ? OR 
        lr.assignedTo LIKE ?
      )`;
      const searchPattern = `%${search}%`;
      countParams.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
    }

    // Add date filters to count
    if (entryFromDate) {
      countQuery += ` AND DATE(rd.assign_date) >= ?`;
      countParams.push(entryFromDate);
    }
    if (entryToDate) {
      countQuery += ` AND DATE(rd.assign_date) <= ?`;
      countParams.push(entryToDate);
    }
    if (followupFromDate) {
      countQuery += ` AND DATE(rd.followup_date) >= ?`;
      countParams.push(followupFromDate);
    }
    if (followupToDate) {
      countQuery += ` AND DATE(rd.followup_date) <= ?`;
      countParams.push(followupToDate);
    }

    // Add stage filter
    if (stages.length > 0) {
      countQuery += ` AND rd.lead_stage IN (?)`;
      countParams.push(stages);
    }

    // Add user filter
    if (users.length > 0) {
      countQuery += ` AND lr.assignedTo IN (?)`;
      countParams.push(users);
    }

    // Add city filter
    if (cities.length > 0) {
      countQuery += ` AND rd.city IN (?)`;
      countParams.push(cities);
    }

    // Role filter for count
    if (isTelecallerLike(role)) {
      countQuery += ` AND lr.assignedTo = ?`;
      countParams.push(currentUserName);
    } else if (isAdminLike(role) || isManagementLike(role)) {
      // Admin/Management see all
    } else {
      countQuery += ` AND lr.assignedTo = ?`;
      countParams.push(currentUserName);
    }

    const [countResult] = await db.query(countQuery, countParams);
    const totalCount = countResult[0]?.total_count || 0;

    /* ================= GET COMBINED LEADS DATA WITH PAGINATION ================= */
    let leadsQuery = `
      SELECT 
        rd.master_id,
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
        IFNULL(rd.cat_id, 'Not Available') AS cat_id,
        IFNULL(rd.reference_id, 'Not Available') AS reference_id,
        IFNULL(rd.area_id, 'Not Available') AS area_id,
        IFNULL(rd.room_length, 'Not Available') AS room_length,
        IFNULL(rd.room_width, 'Not Available') AS room_width,
        IFNULL(rd.room_height, 'Not Available') AS room_height,
        IFNULL(rd.location_link, 'Not Available') AS location_link,
        IFNULL(rd.p_type, 'Not Available') AS p_type,
        IFNULL(rd.budget_range, 'Not Available') AS budget_range,
        IFNULL(rd.time_to_complete, 'Not Available') AS time_to_complete,
        IFNULL(rd.site_visit_date, 'Not Available') AS site_visit_date,
        IFNULL(rd.demo_date, 'Not Available') AS demo_date,
        IFNULL(rd.lead_activity, 0) AS lead_activity,
        IFNULL(rd.ar_number, 'Not Available') AS ar_number,
        IFNULL(rd.architect_name, 'Not Available') AS architect_name,
        IFNULL(rd.ca_number, 'Not Available') AS ca_number,
        IFNULL(rd.e_number, 'Not Available') AS e_number,
        IFNULL(rd.sm_number, 'Not Available') AS sm_number,
        IFNULL(rd.pop_number, 'Not Available') AS pop_number,
        IFNULL(rd.other_number, 'Not Available') AS other_number,
        IFNULL(rd.quick_remark, 'Not Available') AS quick_remark,
        IFNULL(rd.detailed_remark, 'Not Available') AS detailed_remark,
        IFNULL(a.area_name, 'Not Available') AS area_name,
        IFNULL(c.cat_name, 'Not Available') AS cat_name,
        IFNULL(ref.reference_name, 'Not Available') AS reference_name,
        IFNULL(DATE(asg.assign_date), 'Not Available') AS assign_date,
        lr.id AS reassignment_id,
        lr.reassignment_date,
        lr.assignedTo AS reassigned_to,
        lr.remark AS reassignment_remark,
        lr.leadStage AS reassignment_lead_stage,
        IFNULL(u.name, 'Not Available') AS telecaller_name,
        u.user_id AS assigned_to_user_id,
        MAX(d.location_link) AS document_location_link,
        CASE 
          WHEN rd.followup_date < ? THEN 'missed'
          ELSE 'todays'
        END AS data_type

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
      LEFT JOIN documents d ON d.master_id = rd.master_id
      LEFT JOIN reassignment re ON rd.master_id = re.master_id

      WHERE (rd.followup_date < ? OR rd.followup_date = CURDATE() OR DATE(re.reassignment_date) = CURDATE())
AND rd.lead_stage NOT IN ('Drop','Closed Deal','Execution','Pre Execution')
      AND re.id IN (?)
    `;

    let leadsParams = [today, today, latestReassignmentIds];

    // Add filters to leads query
    if (search) {
      leadsQuery += ` AND (
        rd.name LIKE ? OR 
        rd.number LIKE ? OR 
        rd.email LIKE ? OR 
        rd.address LIKE ? OR 
        rd.city LIKE ? OR 
        rd.lead_stage LIKE ? OR 
        lr.assignedTo LIKE ?
      )`;
      const searchPattern = `%${search}%`;
      leadsParams.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
    }

    if (entryFromDate) {
      leadsQuery += ` AND DATE(rd.assign_date) >= ?`;
      leadsParams.push(entryFromDate);
    }
    if (entryToDate) {
      leadsQuery += ` AND DATE(rd.assign_date) <= ?`;
      leadsParams.push(entryToDate);
    }
    if (followupFromDate) {
      leadsQuery += ` AND DATE(rd.followup_date) >= ?`;
      leadsParams.push(followupFromDate);
    }
    if (followupToDate) {
      leadsQuery += ` AND DATE(rd.followup_date) <= ?`;
      leadsParams.push(followupToDate);
    }

    if (stages.length > 0) {
      leadsQuery += ` AND rd.lead_stage IN (?)`;
      leadsParams.push(stages);
    }

    if (users.length > 0) {
      leadsQuery += ` AND lr.assignedTo IN (?)`;
      leadsParams.push(users);
    }

    if (cities.length > 0) {
      leadsQuery += ` AND rd.city IN (?)`;
      leadsParams.push(cities);
    }

    if (isTelecallerLike(role)) {
      leadsQuery += ` AND lr.assignedTo = ?`;
      leadsParams.push(currentUserName);
    } else if (!isAdminLike(role) && !isManagementLike(role)) {
      leadsQuery += ` AND lr.assignedTo = ?`;
      leadsParams.push(currentUserName);
    }

    leadsQuery += ` ORDER BY rd.followup_date ASC, rd.followup_time IS NULL, rd.followup_time ASC LIMIT ? OFFSET ?`;
    leadsParams.push(limit, offset);

    const [leadsRows] = await db.query(leadsQuery, leadsParams);

    /* ================= GET COUNTS FOR TODAY/MISSED SEPARATELY ================= */
    let todayCountQuery = `
      SELECT COUNT(DISTINCT rd.master_id) AS count
      FROM raw_data rd
      LEFT JOIN reassignment re ON rd.master_id = re.master_id
      LEFT JOIN (
        SELECT r1.*, ROW_NUMBER() OVER (PARTITION BY master_id ORDER BY id DESC) rn
        FROM reassignment r1
      ) lr ON rd.master_id = lr.master_id AND lr.rn = 1
      WHERE (rd.followup_date = CURDATE() OR DATE(re.reassignment_date) = CURDATE())
AND rd.lead_stage NOT IN ('Drop','Closed Deal','Execution','Pre Execution') 
     AND re.id IN (?)
    `;
    
    let missedCountQuery = `
      SELECT COUNT(DISTINCT rd.master_id) AS count
      FROM raw_data rd
      LEFT JOIN reassignment re ON rd.master_id = re.master_id
      LEFT JOIN (
        SELECT r1.*, ROW_NUMBER() OVER (PARTITION BY master_id ORDER BY id DESC) rn
        FROM reassignment r1
      ) lr ON rd.master_id = lr.master_id AND lr.rn = 1
      WHERE rd.followup_date < ?
AND rd.lead_stage NOT IN ('Drop','Closed Deal','Execution','Pre Execution')
      AND re.id IN (?)
    `;

    // Add role filters to count queries
    if (isTelecallerLike(role)) {
      todayCountQuery += ` AND lr.assignedTo = ?`;
      missedCountQuery += ` AND lr.assignedTo = ?`;
    } else if (!isAdminLike(role) && !isManagementLike(role)) {
      todayCountQuery += ` AND lr.assignedTo = ?`;
      missedCountQuery += ` AND lr.assignedTo = ?`;
    }

    let todayCountParams = [latestReassignmentIds];
    let missedCountParams = [today, latestReassignmentIds];

    if (isTelecallerLike(role) || (!isAdminLike(role) && !isManagementLike(role))) {
      todayCountParams.push(currentUserName);
      missedCountParams.push(currentUserName);
    }

    const [todayCountResult] = await db.query(todayCountQuery, todayCountParams);
    const [missedCountResult] = await db.query(missedCountQuery, missedCountParams);
    
    const todayTotal = todayCountResult[0]?.count || 0;
    const missedTotal = missedCountResult[0]?.count || 0;

    /* ================= GET OTHER DATA (same as before) ================= */
    const masterIds = leadsRows.map(r => r.master_id);

    // Get other inputs
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

    // Get reassignment history
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

    // Format the leads
    const formattedLeads = leadsRows.map(row => {
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

    // Separate missed and today's leads
    const missedLeads = formattedLeads.filter(lead => lead.data_type === 'missed');
    const todaysLeads = formattedLeads.filter(lead => lead.data_type === 'todays');

    const totalPages = Math.ceil(totalCount / limit);

    return res.status(200).json({
      success: true,
      todayCount: todayTotal,
      missedCount: missedTotal,
      totalCount: totalCount,
      
      // Paginated combined results
      leads: {
        total: totalCount,
        currentPage: page,
        totalPages: totalPages,
        limit: limit,
        data: formattedLeads,
        showing: {
          from: offset + 1,
          to: Math.min(offset + limit, totalCount),
          total: totalCount
        }
      },
      
      // Separate counts (for UI badges)
      today: {
        total: todayTotal,
        leads: todaysLeads
      },
      
      missed: {
        total: missedTotal,
        leads: missedLeads
      }
    });

  } catch (error) {
    console.error("❌ Error in getAssignedMissTodaysLeadsFullData:", error);
    res.status(500).json({ message: "Failed to fetch dashboard data" });
  }
};

export const getAssignedMissTodaysLeadsFullData5 = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Unauthorized: No session" });
    }

    const { id: userId, role } = req.session.user;
    const today = new Date().toISOString().slice(0, 10);
    
    // Get pagination and filter parameters from query
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;
    
    // Get filter parameters
    const search = req.query.search || '';
    const entryFromDate = req.query.entryFromDate;
    const entryToDate = req.query.entryToDate;
    const followupFromDate = req.query.followupFromDate;
    const followupToDate = req.query.followupToDate;
    const stages = req.query.stages ? req.query.stages.split(',') : [];
    const users = req.query.users ? req.query.users.split(',') : [];
    const cities = req.query.cities ? req.query.cities.split(',') : [];

    /* ================= CURRENT USER ================= */
    const [userResult] = await db.query(
      "SELECT name FROM users WHERE user_id = ?",
      [userId]
    );
    const currentUserName = userResult[0]?.name || '';

    /* ================= GET LATEST REASSIGNMENT IDS ================= */
    const [latestReassignments] = await db.query(`
      SELECT master_id, MAX(id) as latest_id
      FROM reassignment
      GROUP BY master_id
    `);
    
    const latestReassignmentIds = latestReassignments.map(r => r.latest_id);

    /* ================= GET TOTAL COUNT FOR PAGINATION ================= */
    let countQuery = `
      SELECT COUNT(DISTINCT rd.master_id) AS total_count
      FROM raw_data rd
      LEFT JOIN reassignment re ON rd.master_id = re.master_id
      LEFT JOIN (
        SELECT r1.*, ROW_NUMBER() OVER (PARTITION BY master_id ORDER BY id DESC) rn
        FROM reassignment r1
      ) lr ON rd.master_id = lr.master_id AND lr.rn = 1
      WHERE (rd.followup_date < ? OR rd.followup_date = CURDATE() OR DATE(re.reassignment_date) = CURDATE())
AND rd.lead_stage NOT IN ('Drop', 'Closed Deal', 'Execution', 'Pre Execution')
      AND re.id IN (?)
    `;

    let countParams = [today, latestReassignmentIds];

    // Add search filter to count
    if (search) {
      countQuery += ` AND (
        rd.name LIKE ? OR 
        rd.number LIKE ? OR 
        rd.email LIKE ? OR 
        rd.address LIKE ? OR 
        rd.city LIKE ? OR 
        rd.lead_stage LIKE ? OR 
        lr.assignedTo LIKE ?
      )`;
      const searchPattern = `%${search}%`;
      countParams.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
    }

    // Add date filters to count
    if (entryFromDate) {
      countQuery += ` AND DATE(rd.assign_date) >= ?`;
      countParams.push(entryFromDate);
    }
    if (entryToDate) {
      countQuery += ` AND DATE(rd.assign_date) <= ?`;
      countParams.push(entryToDate);
    }
    if (followupFromDate) {
      countQuery += ` AND DATE(rd.followup_date) >= ?`;
      countParams.push(followupFromDate);
    }
    if (followupToDate) {
      countQuery += ` AND DATE(rd.followup_date) <= ?`;
      countParams.push(followupToDate);
    }

    // Add stage filter
    if (stages.length > 0) {
      countQuery += ` AND rd.lead_stage IN (?)`;
      countParams.push(stages);
    }

    // Add user filter
    if (users.length > 0) {
      countQuery += ` AND lr.assignedTo IN (?)`;
      countParams.push(users);
    }

    // Add city filter
    if (cities.length > 0) {
      countQuery += ` AND rd.city IN (?)`;
      countParams.push(cities);
    }

    // Role filter for count
    if (isTelecallerLike(role)) {
      countQuery += ` AND lr.assignedTo = ?`;
      countParams.push(currentUserName);
    } else if (isAdminLike(role) || isManagementLike(role)) {
      // Admin/Management see all
    } else {
      countQuery += ` AND lr.assignedTo = ?`;
      countParams.push(currentUserName);
    }

    const [countResult] = await db.query(countQuery, countParams);
    const totalCount = countResult[0]?.total_count || 0;

    /* ================= GET COMBINED LEADS DATA WITH PAGINATION ================= */
    let leadsQuery = `
      SELECT 
        rd.master_id,
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
        IFNULL(rd.followup_time, 'Not Available') AS followup_time,  /* ✅ ADD THIS LINE */
        IFNULL(rd.cat_id, 'Not Available') AS cat_id,
        IFNULL(rd.reference_id, 'Not Available') AS reference_id,
        IFNULL(rd.area_id, 'Not Available') AS area_id,
        IFNULL(rd.room_length, 'Not Available') AS room_length,
        IFNULL(rd.room_width, 'Not Available') AS room_width,
        IFNULL(rd.room_height, 'Not Available') AS room_height,
        IFNULL(rd.location_link, 'Not Available') AS location_link,
        IFNULL(rd.p_type, 'Not Available') AS p_type,
        IFNULL(rd.budget_range, 'Not Available') AS budget_range,
        IFNULL(rd.time_to_complete, 'Not Available') AS time_to_complete,
        IFNULL(rd.site_visit_date, 'Not Available') AS site_visit_date,
        IFNULL(rd.demo_date, 'Not Available') AS demo_date,
        IFNULL(rd.lead_activity, 0) AS lead_activity,
        IFNULL(rd.ar_number, 'Not Available') AS ar_number,
        IFNULL(rd.architect_name, 'Not Available') AS architect_name,
        IFNULL(rd.ca_number, 'Not Available') AS ca_number,
        IFNULL(rd.e_number, 'Not Available') AS e_number,
        IFNULL(rd.sm_number, 'Not Available') AS sm_number,
        IFNULL(rd.pop_number, 'Not Available') AS pop_number,
        IFNULL(rd.other_number, 'Not Available') AS other_number,
        IFNULL(rd.quick_remark, 'Not Available') AS quick_remark,
        IFNULL(rd.detailed_remark, 'Not Available') AS detailed_remark,
        IFNULL(a.area_name, 'Not Available') AS area_name,
        IFNULL(c.cat_name, 'Not Available') AS cat_name,
        IFNULL(ref.reference_name, 'Not Available') AS reference_name,
        IFNULL(DATE(asg.assign_date), 'Not Available') AS assign_date,
        lr.id AS reassignment_id,
        lr.reassignment_date,
        lr.assignedTo AS reassigned_to,
        lr.remark AS reassignment_remark,
        lr.leadStage AS reassignment_lead_stage,
        IFNULL(u.name, 'Not Available') AS telecaller_name,
        u.user_id AS assigned_to_user_id,
        MAX(d.location_link) AS document_location_link,
        CASE 
          WHEN rd.followup_date < ? THEN 'missed'
          ELSE 'todays'
        END AS data_type

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
      LEFT JOIN documents d ON d.master_id = rd.master_id
      LEFT JOIN reassignment re ON rd.master_id = re.master_id

      WHERE (rd.followup_date < ? OR rd.followup_date = CURDATE() OR DATE(re.reassignment_date) = CURDATE())
AND rd.lead_stage NOT IN ('Drop','Closed Deal','Execution','Pre Execution')
      AND re.id IN (?)
    `;

    let leadsParams = [today, today, latestReassignmentIds];

    // Add filters to leads query
    if (search) {
      leadsQuery += ` AND (
        rd.name LIKE ? OR 
        rd.number LIKE ? OR 
        rd.email LIKE ? OR 
        rd.address LIKE ? OR 
        rd.city LIKE ? OR 
        rd.lead_stage LIKE ? OR 
        lr.assignedTo LIKE ?
      )`;
      const searchPattern = `%${search}%`;
      leadsParams.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
    }

    if (entryFromDate) {
      leadsQuery += ` AND DATE(rd.assign_date) >= ?`;
      leadsParams.push(entryFromDate);
    }
    if (entryToDate) {
      leadsQuery += ` AND DATE(rd.assign_date) <= ?`;
      leadsParams.push(entryToDate);
    }
    if (followupFromDate) {
      leadsQuery += ` AND DATE(rd.followup_date) >= ?`;
      leadsParams.push(followupFromDate);
    }
    if (followupToDate) {
      leadsQuery += ` AND DATE(rd.followup_date) <= ?`;
      leadsParams.push(followupToDate);
    }

    if (stages.length > 0) {
      leadsQuery += ` AND rd.lead_stage IN (?)`;
      leadsParams.push(stages);
    }

    if (users.length > 0) {
      leadsQuery += ` AND lr.assignedTo IN (?)`;
      leadsParams.push(users);
    }

    if (cities.length > 0) {
      leadsQuery += ` AND rd.city IN (?)`;
      leadsParams.push(cities);
    }

    if (isTelecallerLike(role)) {
      leadsQuery += ` AND lr.assignedTo = ?`;
      leadsParams.push(currentUserName);
    } else if (!isAdminLike(role) && !isManagementLike(role)) {
      leadsQuery += ` AND lr.assignedTo = ?`;
      leadsParams.push(currentUserName);
    }

    leadsQuery += ` GROUP BY rd.master_id ORDER BY rd.followup_date ASC LIMIT ? OFFSET ?`;
    leadsParams.push(limit, offset);

    const [leadsRows] = await db.query(leadsQuery, leadsParams);

    /* ================= GET COUNTS FOR TODAY/MISSED SEPARATELY ================= */
    let todayCountQuery = `
      SELECT COUNT(DISTINCT rd.master_id) AS count
      FROM raw_data rd
      LEFT JOIN reassignment re ON rd.master_id = re.master_id
      LEFT JOIN (
        SELECT r1.*, ROW_NUMBER() OVER (PARTITION BY master_id ORDER BY id DESC) rn
        FROM reassignment r1
      ) lr ON rd.master_id = lr.master_id AND lr.rn = 1
      WHERE (rd.followup_date = CURDATE() OR DATE(re.reassignment_date) = CURDATE())
AND rd.lead_stage NOT IN ('Drop','Closed Deal','Execution','Pre Execution') 
     AND re.id IN (?)
    `;
    
    let missedCountQuery = `
      SELECT COUNT(DISTINCT rd.master_id) AS count
      FROM raw_data rd
      LEFT JOIN reassignment re ON rd.master_id = re.master_id
      LEFT JOIN (
        SELECT r1.*, ROW_NUMBER() OVER (PARTITION BY master_id ORDER BY id DESC) rn
        FROM reassignment r1
      ) lr ON rd.master_id = lr.master_id AND lr.rn = 1
      WHERE rd.followup_date < ?
AND rd.lead_stage NOT IN ('Drop','Closed Deal','Execution','Pre Execution')
      AND re.id IN (?)
    `;

    // Add role filters to count queries
    if (isTelecallerLike(role)) {
      todayCountQuery += ` AND lr.assignedTo = ?`;
      missedCountQuery += ` AND lr.assignedTo = ?`;
    } else if (!isAdminLike(role) && !isManagementLike(role)) {
      todayCountQuery += ` AND lr.assignedTo = ?`;
      missedCountQuery += ` AND lr.assignedTo = ?`;
    }

    let todayCountParams = [latestReassignmentIds];
    let missedCountParams = [today, latestReassignmentIds];

    if (isTelecallerLike(role) || (!isAdminLike(role) && !isManagementLike(role))) {
      todayCountParams.push(currentUserName);
      missedCountParams.push(currentUserName);
    }

    const [todayCountResult] = await db.query(todayCountQuery, todayCountParams);
    const [missedCountResult] = await db.query(missedCountQuery, missedCountParams);
    
    const todayTotal = todayCountResult[0]?.count || 0;
    const missedTotal = missedCountResult[0]?.count || 0;

    /* ================= GET OTHER DATA (same as before) ================= */
    const masterIds = leadsRows.map(r => r.master_id);

    // Get other inputs
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

    // Get reassignment history
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

    // Format the leads
    const formattedLeads = leadsRows.map(row => {
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

    // Separate missed and today's leads
    const missedLeads = formattedLeads.filter(lead => lead.data_type === 'missed');
    const todaysLeads = formattedLeads.filter(lead => lead.data_type === 'todays');

    const totalPages = Math.ceil(totalCount / limit);

    return res.status(200).json({
      success: true,
      todayCount: todayTotal,
      missedCount: missedTotal,
      totalCount: totalCount,
      
      // Paginated combined results
      leads: {
        total: totalCount,
        currentPage: page,
        totalPages: totalPages,
        limit: limit,
        data: formattedLeads,
        showing: {
          from: offset + 1,
          to: Math.min(offset + limit, totalCount),
          total: totalCount
        }
      },
      
      // Separate counts (for UI badges)
      today: {
        total: todayTotal,
        leads: todaysLeads
      },
      
      missed: {
        total: missedTotal,
        leads: missedLeads
      }
    });

  } catch (error) {
    console.error("❌ Error in getAssignedMissTodaysLeadsFullData:", error);
    res.status(500).json({ message: "Failed to fetch dashboard data" });
  }
};


export const getAssignedMissTodaysLeadsFullData = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Unauthorized: No session" });
    }

    const { id: userId, role } = req.session.user;
    const today = new Date().toISOString().slice(0, 10);
    
    // Get pagination and filter parameters from query
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;
    
    // Get filter parameters
    const search = req.query.search || '';
    const entryFromDate = req.query.entryFromDate;
    const entryToDate = req.query.entryToDate;
    const followupFromDate = req.query.followupFromDate;
    const followupToDate = req.query.followupToDate;
    const stages = req.query.stages ? req.query.stages.split(',') : [];
    const users = req.query.users ? req.query.users.split(',') : [];
    const cities = req.query.cities ? req.query.cities.split(',') : [];
    
    // ✅ NEW: Time-based filter parameters
    const timeSlot = req.query.timeSlot; // 'morning', 'afternoon', 'evening', 'overdue'
    const followupTime = req.query.followupTime; // specific time like '17:00'
    const sortByTime = req.query.sortByTime === 'true'; // sort by time instead of date

    /* ================= CURRENT USER ================= */
    const [userResult] = await db.query(
      "SELECT name FROM users WHERE user_id = ?",
      [userId]
    );
    const currentUserName = userResult[0]?.name || '';

    /* ================= GET LATEST REASSIGNMENT IDS ================= */
    const [latestReassignments] = await db.query(`
      SELECT master_id, MAX(id) as latest_id
      FROM reassignment
      GROUP BY master_id
    `);
    
    const latestReassignmentIds = latestReassignments.map(r => r.latest_id);

    /* ================= GET TOTAL COUNT FOR PAGINATION ================= */
    let countQuery = `
      SELECT COUNT(DISTINCT rd.master_id) AS total_count
      FROM raw_data rd
      LEFT JOIN reassignment re ON rd.master_id = re.master_id
      LEFT JOIN (
        SELECT r1.*, ROW_NUMBER() OVER (PARTITION BY master_id ORDER BY id DESC) rn
        FROM reassignment r1
      ) lr ON rd.master_id = lr.master_id AND lr.rn = 1
      WHERE (rd.followup_date < ? OR rd.followup_date = CURDATE() OR DATE(re.reassignment_date) = CURDATE())
      AND rd.lead_stage NOT IN ('Drop', 'Closed Deal', 'Execution', 'Pre Execution')
      AND re.id IN (?)
    `;

    let countParams = [today, latestReassignmentIds];

    // Add search filter to count
    if (search) {
      countQuery += ` AND (
        rd.name LIKE ? OR 
        rd.number LIKE ? OR 
        rd.email LIKE ? OR 
        rd.address LIKE ? OR 
        rd.city LIKE ? OR 
        rd.lead_stage LIKE ? OR 
        lr.assignedTo LIKE ?
      )`;
      const searchPattern = `%${search}%`;
      countParams.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
    }

    // Add date filters to count
    if (entryFromDate) {
      countQuery += ` AND DATE(rd.assign_date) >= ?`;
      countParams.push(entryFromDate);
    }
    if (entryToDate) {
      countQuery += ` AND DATE(rd.assign_date) <= ?`;
      countParams.push(entryToDate);
    }
    if (followupFromDate) {
      countQuery += ` AND DATE(rd.followup_date) >= ?`;
      countParams.push(followupFromDate);
    }
    if (followupToDate) {
      countQuery += ` AND DATE(rd.followup_date) <= ?`;
      countParams.push(followupToDate);
    }

    // ✅ NEW: Add time slot filter to count
    if (timeSlot === 'morning') {
      countQuery += ` AND TIME(rd.followup_time) IS NOT NULL AND TIME(rd.followup_time) < '12:00:00'`;
    } else if (timeSlot === 'afternoon') {
      countQuery += ` AND TIME(rd.followup_time) IS NOT NULL AND TIME(rd.followup_time) BETWEEN '12:00:00' AND '17:00:00'`;
    } else if (timeSlot === 'evening') {
      countQuery += ` AND TIME(rd.followup_time) IS NOT NULL AND TIME(rd.followup_time) >= '17:00:00'`;
    } else if (timeSlot === 'overdue') {
      countQuery += ` AND rd.followup_date = CURDATE() AND TIME(rd.followup_time) IS NOT NULL AND TIME(rd.followup_time) < CURTIME()`;
    }
    
    // ✅ NEW: Add specific time filter to count
    if (followupTime) {
      countQuery += ` AND TIME(rd.followup_time) = ?`;
      countParams.push(followupTime);
    }

    // Add stage filter
    if (stages.length > 0) {
      countQuery += ` AND rd.lead_stage IN (?)`;
      countParams.push(stages);
    }

    // Add user filter
    if (users.length > 0) {
      countQuery += ` AND lr.assignedTo IN (?)`;
      countParams.push(users);
    }

    // Add city filter
    if (cities.length > 0) {
      countQuery += ` AND rd.city IN (?)`;
      countParams.push(cities);
    }

    // Role filter for count
    if (isTelecallerLike(role)) {
      countQuery += ` AND lr.assignedTo = ?`;
      countParams.push(currentUserName);
    } else if (isAdminLike(role) || isManagementLike(role)) {
      // Admin/Management see all
    } else {
      countQuery += ` AND lr.assignedTo = ?`;
      countParams.push(currentUserName);
    }

    const [countResult] = await db.query(countQuery, countParams);
    const totalCount = countResult[0]?.total_count || 0;

    /* ================= GET COMBINED LEADS DATA WITH PAGINATION ================= */
    let leadsQuery = `
      SELECT 
        rd.master_id,
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
        IFNULL(rd.followup_time, 'Not Available') AS followup_time,
        IFNULL(rd.cat_id, 'Not Available') AS cat_id,
        IFNULL(rd.reference_id, 'Not Available') AS reference_id,
        IFNULL(rd.area_id, 'Not Available') AS area_id,
        IFNULL(rd.room_length, 'Not Available') AS room_length,
        IFNULL(rd.room_width, 'Not Available') AS room_width,
        IFNULL(rd.room_height, 'Not Available') AS room_height,
        IFNULL(rd.location_link, 'Not Available') AS location_link,
        IFNULL(rd.p_type, 'Not Available') AS p_type,
        IFNULL(rd.budget_range, 'Not Available') AS budget_range,
        IFNULL(rd.time_to_complete, 'Not Available') AS time_to_complete,
        IFNULL(rd.site_visit_date, 'Not Available') AS site_visit_date,
        IFNULL(rd.demo_date, 'Not Available') AS demo_date,
        IFNULL(rd.lead_activity, 0) AS lead_activity,
        IFNULL(rd.ar_number, 'Not Available') AS ar_number,
        IFNULL(rd.architect_name, 'Not Available') AS architect_name,
        IFNULL(rd.ca_number, 'Not Available') AS ca_number,
        IFNULL(rd.e_number, 'Not Available') AS e_number,
        IFNULL(rd.sm_number, 'Not Available') AS sm_number,
        IFNULL(rd.pop_number, 'Not Available') AS pop_number,
        IFNULL(rd.other_number, 'Not Available') AS other_number,
        IFNULL(rd.quick_remark, 'Not Available') AS quick_remark,
        IFNULL(rd.detailed_remark, 'Not Available') AS detailed_remark,
        IFNULL(a.area_name, 'Not Available') AS area_name,
        IFNULL(c.cat_name, 'Not Available') AS cat_name,
        IFNULL(ref.reference_name, 'Not Available') AS reference_name,
        IFNULL(DATE(asg.assign_date), 'Not Available') AS assign_date,
        lr.id AS reassignment_id,
        lr.reassignment_date,
        lr.assignedTo AS reassigned_to,
        lr.remark AS reassignment_remark,
        lr.leadStage AS reassignment_lead_stage,
        IFNULL(u.name, 'Not Available') AS telecaller_name,
        u.user_id AS assigned_to_user_id,
        MAX(d.location_link) AS document_location_link,
        CASE 
          WHEN rd.followup_date < ? THEN 'missed'
          ELSE 'todays'
        END AS data_type,
        /* ✅ NEW: Add time status for frontend */
        CASE 
          WHEN rd.followup_date = CURDATE() AND TIME(rd.followup_time) < CURTIME() THEN 'overdue'
          WHEN rd.followup_date = CURDATE() AND TIME(rd.followup_time) BETWEEN CURTIME() AND ADDTIME(CURTIME(), '01:00:00') THEN 'urgent'
          WHEN rd.followup_date = CURDATE() THEN 'today'
          ELSE 'future'
        END AS time_status

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
      LEFT JOIN documents d ON d.master_id = rd.master_id
      LEFT JOIN reassignment re ON rd.master_id = re.master_id

      WHERE (rd.followup_date < ? OR rd.followup_date = CURDATE() OR DATE(re.reassignment_date) = CURDATE())
      AND rd.lead_stage NOT IN ('Drop','Closed Deal','Execution','Pre Execution')
      AND re.id IN (?)
    `;

    let leadsParams = [today, today, latestReassignmentIds];

    // Add filters to leads query
    if (search) {
      leadsQuery += ` AND (
        rd.name LIKE ? OR 
        rd.number LIKE ? OR 
        rd.email LIKE ? OR 
        rd.address LIKE ? OR 
        rd.city LIKE ? OR 
        rd.lead_stage LIKE ? OR 
        lr.assignedTo LIKE ?
      )`;
      const searchPattern = `%${search}%`;
      leadsParams.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
    }

    if (entryFromDate) {
      leadsQuery += ` AND DATE(rd.assign_date) >= ?`;
      leadsParams.push(entryFromDate);
    }
    if (entryToDate) {
      leadsQuery += ` AND DATE(rd.assign_date) <= ?`;
      leadsParams.push(entryToDate);
    }
    if (followupFromDate) {
      leadsQuery += ` AND DATE(rd.followup_date) >= ?`;
      leadsParams.push(followupFromDate);
    }
    if (followupToDate) {
      leadsQuery += ` AND DATE(rd.followup_date) <= ?`;
      leadsParams.push(followupToDate);
    }

    // ✅ NEW: Add time slot filter to leads query
    if (timeSlot === 'morning') {
      leadsQuery += ` AND TIME(rd.followup_time) IS NOT NULL AND TIME(rd.followup_time) < '12:00:00'`;
    } else if (timeSlot === 'afternoon') {
      leadsQuery += ` AND TIME(rd.followup_time) IS NOT NULL AND TIME(rd.followup_time) BETWEEN '12:00:00' AND '17:00:00'`;
    } else if (timeSlot === 'evening') {
      leadsQuery += ` AND TIME(rd.followup_time) IS NOT NULL AND TIME(rd.followup_time) >= '17:00:00'`;
    } else if (timeSlot === 'overdue') {
      leadsQuery += ` AND rd.followup_date = CURDATE() AND TIME(rd.followup_time) IS NOT NULL AND TIME(rd.followup_time) < CURTIME()`;
    }
    
    // ✅ NEW: Add specific time filter to leads query
    if (followupTime) {
      leadsQuery += ` AND TIME(rd.followup_time) = ?`;
      leadsParams.push(followupTime);
    }

    if (stages.length > 0) {
      leadsQuery += ` AND rd.lead_stage IN (?)`;
      leadsParams.push(stages);
    }

    if (users.length > 0) {
      leadsQuery += ` AND lr.assignedTo IN (?)`;
      leadsParams.push(users);
    }

    if (cities.length > 0) {
      leadsQuery += ` AND rd.city IN (?)`;
      leadsParams.push(cities);
    }

    if (isTelecallerLike(role)) {
      leadsQuery += ` AND lr.assignedTo = ?`;
      leadsParams.push(currentUserName);
    } else if (!isAdminLike(role) && !isManagementLike(role)) {
      leadsQuery += ` AND lr.assignedTo = ?`;
      leadsParams.push(currentUserName);
    }

    // ✅ MODIFIED: ORDER BY - support sorting by time if requested
    leadsQuery += ` GROUP BY rd.master_id `;
    
    if (sortByTime) {
      // Sort by time first (morning to evening), then by date
      leadsQuery += ` ORDER BY TIME(rd.followup_time) ASC, rd.followup_date ASC`;
    } else {
      // Default: sort by date (existing behavior)
      leadsQuery += ` ORDER BY rd.followup_date ASC`;
    }
    
    leadsQuery += ` LIMIT ? OFFSET ?`;
    leadsParams.push(limit, offset);

    const [leadsRows] = await db.query(leadsQuery, leadsParams);

    /* ================= GET COUNTS FOR TODAY/MISSED SEPARATELY ================= */
    let todayCountQuery = `
      SELECT COUNT(DISTINCT rd.master_id) AS count
      FROM raw_data rd
      LEFT JOIN reassignment re ON rd.master_id = re.master_id
      LEFT JOIN (
        SELECT r1.*, ROW_NUMBER() OVER (PARTITION BY master_id ORDER BY id DESC) rn
        FROM reassignment r1
      ) lr ON rd.master_id = lr.master_id AND lr.rn = 1
      WHERE (rd.followup_date = CURDATE() OR DATE(re.reassignment_date) = CURDATE())
      AND rd.lead_stage NOT IN ('Drop','Closed Deal','Execution','Pre Execution') 
      AND re.id IN (?)
    `;
    
    let missedCountQuery = `
      SELECT COUNT(DISTINCT rd.master_id) AS count
      FROM raw_data rd
      LEFT JOIN reassignment re ON rd.master_id = re.master_id
      LEFT JOIN (
        SELECT r1.*, ROW_NUMBER() OVER (PARTITION BY master_id ORDER BY id DESC) rn
        FROM reassignment r1
      ) lr ON rd.master_id = lr.master_id AND lr.rn = 1
      WHERE rd.followup_date < ?
      AND rd.lead_stage NOT IN ('Drop','Closed Deal','Execution','Pre Execution')
      AND re.id IN (?)
    `;

    // Add role filters to count queries
    if (isTelecallerLike(role)) {
      todayCountQuery += ` AND lr.assignedTo = ?`;
      missedCountQuery += ` AND lr.assignedTo = ?`;
    } else if (!isAdminLike(role) && !isManagementLike(role)) {
      todayCountQuery += ` AND lr.assignedTo = ?`;
      missedCountQuery += ` AND lr.assignedTo = ?`;
    }

    let todayCountParams = [latestReassignmentIds];
    let missedCountParams = [today, latestReassignmentIds];

    if (isTelecallerLike(role) || (!isAdminLike(role) && !isManagementLike(role))) {
      todayCountParams.push(currentUserName);
      missedCountParams.push(currentUserName);
    }

    const [todayCountResult] = await db.query(todayCountQuery, todayCountParams);
    const [missedCountResult] = await db.query(missedCountQuery, missedCountParams);
    
    const todayTotal = todayCountResult[0]?.count || 0;
    const missedTotal = missedCountResult[0]?.count || 0;

    /* ================= GET OTHER DATA (same as before) ================= */
    const masterIds = leadsRows.map(r => r.master_id);

    // Get other inputs
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

    // Get reassignment history
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

    // Format the leads
    const formattedLeads = leadsRows.map(row => {
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

    // Separate missed and today's leads
    const missedLeads = formattedLeads.filter(lead => lead.data_type === 'missed');
    const todaysLeads = formattedLeads.filter(lead => lead.data_type === 'todays');

    const totalPages = Math.ceil(totalCount / limit);

    // ✅ NEW: Calculate time-based statistics for dashboard
    const timeStats = {
      morning: formattedLeads.filter(lead => {
        const time = lead.followup_time;
        return time && time !== 'Not Available' && time < '12:00:00';
      }).length,
      afternoon: formattedLeads.filter(lead => {
        const time = lead.followup_time;
        return time && time !== 'Not Available' && time >= '12:00:00' && time < '17:00:00';
      }).length,
      evening: formattedLeads.filter(lead => {
        const time = lead.followup_time;
        return time && time !== 'Not Available' && time >= '17:00:00';
      }).length,
      overdue: formattedLeads.filter(lead => {
        return lead.time_status === 'overdue';
      }).length,
      urgent: formattedLeads.filter(lead => {
        return lead.time_status === 'urgent';
      }).length
    };

    return res.status(200).json({
      success: true,
      todayCount: todayTotal,
      missedCount: missedTotal,
      totalCount: totalCount,
      
      // ✅ NEW: Time statistics
      timeStats: timeStats,
      
      // Paginated combined results
      leads: {
        total: totalCount,
        currentPage: page,
        totalPages: totalPages,
        limit: limit,
        data: formattedLeads,
        showing: {
          from: offset + 1,
          to: Math.min(offset + limit, totalCount),
          total: totalCount
        }
      },
      
      // Separate counts (for UI badges)
      today: {
        total: todayTotal,
        leads: todaysLeads
      },
      
      missed: {
        total: missedTotal,
        leads: missedLeads
      }
    });

  } catch (error) {
    console.error("❌ Error in getAssignedMissTodaysLeadsFullData:", error);
    res.status(500).json({ message: "Failed to fetch dashboard data" });
  }
};

export const getQuotationClosedLeads1 = async (req, res) => {
  const connection = await db.getConnection();

  try {
    /* ================= MAIN LEADS ================= */
    const [rows] = await connection.query(`
      SELECT 
        rd.master_id,
        rd.name,
        rd.number,
        rd.email,
        rd.address,
        rd.city,
        rd.status,
        rd.lead_status,
        rd.lead_stage,
        rd.current_stage,
        rd.created_by_user,
        rd.assign_id,
        rd.followup_date,
        rd.cat_id,
        rd.reference_id,
        rd.area_id,
        rd.room_length,
        rd.room_width,
        rd.room_height,
        rd.location_link,
        rd.p_type,
        rd.budget_range,
        rd.time_to_complete,
        rd.site_visit_date,
        rd.demo_date,
        rd.lead_activity,
        rd.ar_number,
        rd.ca_number,
        rd.e_number,
        rd.sm_number,
        rd.pop_number,
        rd.other_number,
        rd.quick_remark,
        rd.detailed_remark,

        a.area_name,
        c.cat_name,
        r.reference_name,

        asg.assign_date,
        asg.target_date,
        asg.mode,
        asg.remark AS assignment_remark,
        asg.assigned_to,
        asg.assigned_to_user_id,
        asg.assign_type,

        CASE WHEN q.qt_id IS NOT NULL THEN 1 ELSE 0 END AS created_flag

FROM raw_data rd
LEFT JOIN area a ON rd.area_id = a.area_id
LEFT JOIN category c ON rd.cat_id = c.cat_id
LEFT JOIN reference r ON rd.reference_id = r.reference_id
LEFT JOIN assignments asg ON rd.assign_id = asg.assign_id
LEFT JOIN quotation q ON rd.master_id = q.master_id

WHERE rd.lead_stage IN ('Quotation Created', 'Closed Deal', 'Execution')
ORDER BY rd.master_id DESC
    `);

    /* ================= REASSIGNMENTS ================= */
    const masterIds = rows.map((r) => r.master_id);
    let reassignmentRows = [];

    if (masterIds.length > 0) {
      const [reassignments] = await connection.query(
        `
        SELECT 
          rm.*, 
          u.name, 
          u.role
        FROM reassignment rm
        LEFT JOIN users u ON u.user_id = rm.created_by_user
        WHERE rm.master_id IN (?)
        ORDER BY rm.reassignment_date DESC, rm.created_at DESC
        `,
        [masterIds],
      );

      reassignmentRows = reassignments;
    }

    /* ================= FORMAT RESPONSE ================= */
    const formattedRows = rows.map((row) => {
      const reassignments = reassignmentRows
        .filter((r) => r.master_id === row.master_id)
        .map((r) => ({
          remark: r.remark,
          assignedTo: r.assignedTo,
          leadStage: r.leadStage,
          created_by_user: r.created_by_user,
          created_at: r.created_at
            ? new Date(r.created_at).toLocaleString('en-GB')
            : null,
          reassignment_date: r.reassignment_date
            ? new Date(r.reassignment_date).toLocaleString('en-GB')
            : null,
          name: r.name,
          role: r.role,
        }));

      return {
        ...row,
        reassignment_remarks: reassignments,
        latest_assignedTo: reassignments.length
          ? reassignments[0].assignedTo
          : null,
        latest_leadStage: reassignments.length
          ? reassignments[0].leadStage
          : null,
      };
    });

    return res.status(200).json(formattedRows);
  } catch (error) {
    console.error('❌ Error fetching quotation leads:', error);
    return res.status(500).json({
      message: 'Failed to fetch quotation leads',
    });
  } finally {
    connection.release();
  }
};


export const getQuotationClosedLeads2 = async (req, res) => {
  const connection = await db.getConnection();

  try {
    /* ================= MAIN LEADS ================= */
    const [rows] = await connection.query(`
      SELECT 
        rd.master_id,
        rd.name,
        rd.number,
        rd.email,
        rd.address,
        rd.city,
        rd.status,
        rd.lead_status,
        rd.lead_stage,
        rd.current_stage,
        rd.created_by_user,
        rd.assign_id,
        rd.followup_date,
        rd.cat_id,
        rd.reference_id,
        rd.area_id,
        rd.room_length,
        rd.room_width,
        rd.room_height,
        rd.location_link,
        rd.p_type,
        rd.budget_range,
        rd.time_to_complete,
        rd.site_visit_date,
        rd.demo_date,
        rd.lead_activity,
        rd.ar_number,
        rd.ca_number,
        rd.e_number,
        rd.sm_number,
        rd.pop_number,
        rd.other_number,
        rd.quick_remark,
        rd.detailed_remark,

        a.area_name,
        c.cat_name,
        r.reference_name,

        asg.assign_date,
        asg.target_date,
        asg.mode,
        asg.remark AS assignment_remark,
        asg.assigned_to,
        asg.assigned_to_user_id,
        asg.assign_type,

        CASE WHEN q.qt_id IS NOT NULL THEN 1 ELSE 0 END AS created_flag

      FROM raw_data rd
      LEFT JOIN area a ON rd.area_id = a.area_id
      LEFT JOIN category c ON rd.cat_id = c.cat_id
      LEFT JOIN reference r ON rd.reference_id = r.reference_id
      LEFT JOIN assignments asg ON rd.assign_id = asg.assign_id
      LEFT JOIN quotation q ON rd.master_id = q.master_id

      WHERE rd.lead_stage IN ('Quotation Created', 'Closed Deal', 'Execution')
      
      ORDER BY 
        CASE WHEN q.qt_id IS NOT NULL THEN 1 ELSE 0 END DESC,
        rd.master_id DESC
    `);

    /* ================= REASSIGNMENTS ================= */
    const masterIds = rows.map((r) => r.master_id);
    let reassignmentRows = [];

    if (masterIds.length > 0) {
      const [reassignments] = await connection.query(
        `
        SELECT 
          rm.*, 
          u.name, 
          u.role
        FROM reassignment rm
        LEFT JOIN users u ON u.user_id = rm.created_by_user
        WHERE rm.master_id IN (?)
        ORDER BY rm.reassignment_date DESC, rm.created_at DESC
        `,
        [masterIds],
      );

      reassignmentRows = reassignments;
    }

    /* ================= FORMAT RESPONSE ================= */
    const formattedRows = rows.map((row) => {
      const reassignments = reassignmentRows
        .filter((r) => r.master_id === row.master_id)
        .map((r) => ({
          remark: r.remark,
          assignedTo: r.assignedTo,
          leadStage: r.leadStage,
          created_by_user: r.created_by_user,
          created_at: r.created_at
            ? new Date(r.created_at).toLocaleString('en-GB')
            : null,
          reassignment_date: r.reassignment_date
            ? new Date(r.reassignment_date).toLocaleString('en-GB')
            : null,
          name: r.name,
          role: r.role,
        }));

      return {
        ...row,
        reassignment_remarks: reassignments,
        latest_assignedTo: reassignments.length
          ? reassignments[0].assignedTo
          : null,
        latest_leadStage: reassignments.length
          ? reassignments[0].leadStage
          : null,
      };
    });

    return res.status(200).json(formattedRows);
  } catch (error) {
    console.error('❌ Error fetching quotation leads:', error);
    return res.status(500).json({
      message: 'Failed to fetch quotation leads',
    });
  } finally {
    connection.release();
  }
};

export const getQuotationClosedLeads = async (req, res) => {
  const connection = await db.getConnection();

  try {
    /* ================= MAIN LEADS ================= */
    const [rows] = await connection.query(`
      SELECT 
        rd.master_id,
        rd.name,
        rd.number,
        rd.email,
        rd.address,
        rd.city,
        rd.status,
        rd.lead_status,
        rd.lead_stage,
        rd.current_stage,
        rd.created_by_user,
        rd.assign_id,
        rd.followup_date,
        rd.cat_id,
        rd.reference_id,
        rd.area_id,
        rd.room_length,
        rd.room_width,
        rd.room_height,
        rd.location_link,
        rd.p_type,
        rd.budget_range,
        rd.time_to_complete,
        rd.site_visit_date,
        rd.demo_date,
        rd.lead_activity,
        rd.ar_number,
        rd.ca_number,
        rd.e_number,
        rd.sm_number,
        rd.pop_number,
        rd.other_number,
        rd.quick_remark,
        rd.detailed_remark,

        a.area_name,
        c.cat_name,
        r.reference_name,

        asg.assign_date,
        asg.target_date,
        asg.mode,
        asg.remark AS assignment_remark,
        asg.assigned_to,
        asg.assigned_to_user_id,
        asg.assign_type,

        CASE WHEN q.qt_id IS NOT NULL THEN 1 ELSE 0 END AS created_flag,
        q.created_at AS quotation_created_date

      FROM raw_data rd
      LEFT JOIN area a ON rd.area_id = a.area_id
      LEFT JOIN category c ON rd.cat_id = c.cat_id
      LEFT JOIN reference r ON rd.reference_id = r.reference_id
      LEFT JOIN assignments asg ON rd.assign_id = asg.assign_id
      LEFT JOIN quotation q ON rd.master_id = q.master_id

      WHERE rd.lead_stage IN ('Quotation Created', 'Closed Deal', 'Execution')
      
      ORDER BY 
        q.created_at DESC,
        CASE WHEN q.qt_id IS NOT NULL THEN 1 ELSE 0 END DESC,
        rd.master_id DESC
    `);

    /* ================= REASSIGNMENTS ================= */
    const masterIds = rows.map((r) => r.master_id);
    let reassignmentRows = [];

    if (masterIds.length > 0) {
      const [reassignments] = await connection.query(
        `
        SELECT 
          rm.*, 
          u.name, 
          u.role
        FROM reassignment rm
        LEFT JOIN users u ON u.user_id = rm.created_by_user
        WHERE rm.master_id IN (?)
        ORDER BY rm.reassignment_date DESC, rm.created_at DESC
        `,
        [masterIds],
      );

      reassignmentRows = reassignments;
    }

    /* ================= FORMAT RESPONSE ================= */
    const formattedRows = rows.map((row) => {
      const reassignments = reassignmentRows
        .filter((r) => r.master_id === row.master_id)
        .map((r) => ({
          remark: r.remark,
          assignedTo: r.assignedTo,
          leadStage: r.leadStage,
          created_by_user: r.created_by_user,
          created_at: r.created_at
            ? new Date(r.created_at).toLocaleString('en-GB')
            : null,
          reassignment_date: r.reassignment_date
            ? new Date(r.reassignment_date).toLocaleString('en-GB')
            : null,
          name: r.name,
          role: r.role,
        }));

      return {
        ...row,
        reassignment_remarks: reassignments,
        latest_assignedTo: reassignments.length
          ? reassignments[0].assignedTo
          : null,
        latest_leadStage: reassignments.length
          ? reassignments[0].leadStage
          : null,
      };
    });

    return res.status(200).json(formattedRows);
  } catch (error) {
    console.error('❌ Error fetching quotation leads:', error);
    return res.status(500).json({
      message: 'Failed to fetch quotation leads',
    });
  } finally {
    connection.release();
  }
};


export const getEmployeeWorkReport1 = async (req, res) => {
  try {
    const query = `
      SELECT
        rd.master_id,
        rd.name AS client_name,
        rd.number,
        rd.city,
        rd.lead_stage AS current_stage,

        c.cat_name AS category,
        ref.reference_name AS reference_name,

        u_from.name AS assigned_by,
        rs.assignedTo AS assigned_to,

        rs.leadStage AS reassigned_stage,
        rs.remark,
        rs.created_at

      FROM reassignment rs
      JOIN raw_data rd ON rd.master_id = rs.master_id
      LEFT JOIN category c ON c.cat_id = rd.cat_id
      LEFT JOIN reference ref ON ref.reference_id = rd.reference_id
      LEFT JOIN users u_from ON u_from.user_id = rs.created_by_user
    WHERE rs.created_at >= NOW() - INTERVAL 30 DAY

      ORDER BY rs.created_at DESC
    `;

    const [rows] = await db.query(query);

    res.json({
      success: true,
      total: rows.length,
      data: rows
    });

  } catch (error) {
    console.error("EmployeeWorkReport error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch employee work report"
    });
  }
};


export const getEmployeeWorkReport2 = async (req, res) => {
  try {
    const { fromDate, toDate, search, city, assigned_to, reassigned_stage } = req.query;
    
    let query = `
      SELECT
        rd.master_id,
        rd.name AS client_name,
        rd.number,
        rd.city,
        rd.lead_stage AS current_stage,

        c.cat_name AS category,
        ref.reference_name AS reference_name,

        u_from.name AS assigned_by,
        rs.assignedTo AS assigned_to,

        rs.leadStage AS reassigned_stage,
        rs.remark,
        rs.created_at

      FROM reassignment rs
      JOIN raw_data rd ON rd.master_id = rs.master_id
      LEFT JOIN category c ON c.cat_id = rd.cat_id
      LEFT JOIN reference ref ON ref.reference_id = rd.reference_id
      LEFT JOIN users u_from ON u_from.user_id = rs.created_by_user
      WHERE 1=1
    `;

    const queryParams = [];

    // Apply 30-day filter ONLY if no date filters are applied
    if (!fromDate && !toDate) {
      query += ` AND rs.created_at >= NOW() - INTERVAL 30 DAY`;
    }

    // Apply date filters if provided
    if (fromDate) {
      query += ` AND DATE(rs.created_at) >= ?`;
      queryParams.push(fromDate);
    }
    
    if (toDate) {
      query += ` AND DATE(rs.created_at) <= ?`;
      queryParams.push(toDate);
    }

    // Apply other filters
    if (city) {
      query += ` AND rd.city = ?`;
      queryParams.push(city);
    }

    if (assigned_to) {
      query += ` AND rs.assignedTo = ?`;
      queryParams.push(assigned_to);
    }

    if (reassigned_stage) {
      query += ` AND rs.leadStage = ?`;
      queryParams.push(reassigned_stage);
    }

    if (search) {
      query += ` AND (rd.name LIKE ? OR rd.number LIKE ? OR rd.city LIKE ? OR rs.assignedTo LIKE ?)`;
      const searchPattern = `%${search}%`;
      queryParams.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    query += ` ORDER BY rs.created_at DESC`;

    // Add pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    
    // Get total count for pagination
    const countQuery = query.replace(
      /SELECT[\s\S]*?FROM/,
      'SELECT COUNT(*) as total FROM'
    ).replace(/ORDER BY[\s\S]*$/, '');
    
    const [countResult] = await db.query(countQuery, queryParams);
    const total = countResult[0]?.total || 0;

    // Add pagination to main query
    query += ` LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);

    const [rows] = await db.query(query, queryParams);

    res.json({
      success: true,
      total: total,
      data: rows
    });

  } catch (error) {
    console.error("EmployeeWorkReport error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch employee work report"
    });
  }
};


export const getEmployeeWorkReport = async (req, res) => {
  try {
    /* ================= AUTH ================= */
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

    /* ================= QUERY PARAMS ================= */
    const { fromDate, toDate, search, city, assigned_to, reassigned_stage } = req.query;

    /* ================= MAIN QUERY ================= */
    let query = `
      SELECT
        rd.master_id,
        rd.name AS client_name,
        rd.number,
        rd.city,
        rd.lead_stage AS current_stage,

        c.cat_name AS category,
        ref.reference_name AS reference_name,

        u_from.name AS worked_by,  -- ✅ FIXED (actual worker)
        rs.assignedTo AS assigned_to,

        rs.leadStage AS reassigned_stage,
        rs.remark,
        rs.created_at

      FROM reassignment rs
      JOIN raw_data rd ON rd.master_id = rs.master_id
      LEFT JOIN category c ON c.cat_id = rd.cat_id
      LEFT JOIN reference ref ON ref.reference_id = rd.reference_id
      LEFT JOIN users u_from ON u_from.user_id = rs.created_by_user

      WHERE 1=1

      -- ✅ REMOVE FAKE WORK
      AND rs.remark IS NOT NULL
      AND rs.remark NOT LIKE 'created_time:%'

      -- ✅ REMOVE PURE ASSIGNMENT (Fresh Lead without real action)
      AND NOT (
        rs.leadStage = 'Fresh Lead'
        AND rs.remark LIKE 'created_time:%'
      )
    `;

    const queryParams = [];

    /* ================= ROLE FILTER ================= */
    // 🚨 IMPORTANT CHANGE: filter by worked_by (NOT assignedTo)
    if (isTelecallerLike(role)) {
      query += ` AND u_from.name = ?`;
      queryParams.push(currentUserName);
    } 
    else if (isAdminLike(role)) {
      // no restriction
    } 
    else if (!isManagementLike(role)) {
      query += ` AND u_from.name = ?`;
      queryParams.push(currentUserName);
    }

    /* ================= DATE FILTER ================= */
    if (!fromDate && !toDate) {
      query += ` AND rs.created_at >= NOW() - INTERVAL 30 DAY`;
    }

    if (fromDate) {
      query += ` AND DATE(rs.created_at) >= ?`;
      queryParams.push(fromDate);
    }

    if (toDate) {
      query += ` AND DATE(rs.created_at) <= ?`;
      queryParams.push(toDate);
    }

    /* ================= OTHER FILTERS ================= */
    if (city) {
      query += ` AND rd.city = ?`;
      queryParams.push(city);
    }

    if (assigned_to) {
      query += ` AND rs.assignedTo = ?`;
      queryParams.push(assigned_to);
    }

    if (reassigned_stage) {
      query += ` AND rs.leadStage = ?`;
      queryParams.push(reassigned_stage);
    }

    if (search) {
      query += ` AND (
        rd.name LIKE ? OR 
        rd.number LIKE ? OR 
        rd.city LIKE ? OR 
        u_from.name LIKE ?
      )`;
      const s = `%${search}%`;
      queryParams.push(s, s, s, s);
    }

    query += ` ORDER BY rs.created_at DESC`;

    /* ================= PAGINATION ================= */
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const countQuery = query
      .replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(*) as total FROM')
      .replace(/ORDER BY[\s\S]*$/, '');

    const [countResult] = await db.query(countQuery, queryParams);
    const total = countResult[0]?.total || 0;

    query += ` LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);

    const [rows] = await db.query(query, queryParams);

    /* ================= SUMMARY (ADMIN ONLY) ================= */
    let summary = {};

    if (isAdminLike(role)) {
      let summaryParams = [];
      let summaryWhere = `
        WHERE 1=1
        AND rs.remark IS NOT NULL
        AND rs.remark NOT LIKE 'created_time:%'
      `;

      if (fromDate) {
        summaryWhere += ` AND DATE(rs.created_at) >= ?`;
        summaryParams.push(fromDate);
      }

      if (toDate) {
        summaryWhere += ` AND DATE(rs.created_at) <= ?`;
        summaryParams.push(toDate);
      }

      /* ===== USER WISE (FIXED) ===== */
      const [userWise] = await db.query(`
        SELECT u_from.name AS worked_by, COUNT(*) as total
        FROM reassignment rs
        LEFT JOIN users u_from ON u_from.user_id = rs.created_by_user
        ${summaryWhere}
        GROUP BY u_from.name
        ORDER BY total DESC
      `, summaryParams);

      /* ===== ROLE WISE (FIXED) ===== */
      const [roleWise] = await db.query(`
        SELECT u.role, COUNT(*) as total
        FROM reassignment rs
        JOIN users u ON u.user_id = rs.created_by_user
        ${summaryWhere}
        GROUP BY u.role
        ORDER BY total DESC
      `, summaryParams);

      summary = {
        userWise,
        roleWise
      };
    }

    /* ================= RESPONSE ================= */
    res.json({
      success: true,
      total,
      data: rows,
      summary
    });

  } catch (error) {
    console.error("EmployeeWorkReport error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch employee work report"
    });
  }
};


export const getEmployeeWorkReportFilters = async (req, res) => {
  try {
    // Get unique cities from raw_data
    const [cities] = await db.query(`
      SELECT DISTINCT city 
      FROM raw_data 
      WHERE city IS NOT NULL AND city != '' 
      ORDER BY city
    `);

    // Get unique assigned_to users from reassignment
    const [assignedTo] = await db.query(`
      SELECT DISTINCT rs.assignedTo 
      FROM reassignment rs
      WHERE rs.assignedTo IS NOT NULL AND rs.assignedTo != ''
      ORDER BY rs.assignedTo
    `);

    // Get unique reassigned stages (leadStage) from reassignment
    const [stages] = await db.query(`
      SELECT DISTINCT rs.leadStage 
      FROM reassignment rs
      WHERE rs.leadStage IS NOT NULL AND rs.leadStage != ''
      ORDER BY rs.leadStage
    `);

    res.json({
      cities: cities.map(c => c.city),
      assigned_to: assignedTo.map(a => a.assignedTo),
      reassigned_stages: stages.map(s => s.leadStage)
    });

  } catch (error) {
    console.error("EmployeeWorkReportFilters error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch filter options"
    });
  }
};
