import db from '../database/db.js';


// export const insertRawData = async (records) => {
//   try {
//     const query = `
//       INSERT INTO raw_data (
//         name,
//         number,
//         email,
//         address,
//         area_id,
//         cat_id,
//         reference_id,
//         created_by_user
//       )
//       VALUES ?
//     `;

//     const values = records.map(record => [
//       record.name || "",
//       record.number || "", // ✅ Ensures no NULL goes to DB
//       record.email || "",
//       record.address || "",
//       record.area_id,
//       record.cat_id,
//       record.reference_id,
//       record.created_by_user,
//     ]);

//     await db.query(query, [values]);
//   } catch (error) {
//     console.error("❌ Error inserting into raw_data:", error);
//     throw error;
//   }
// };



// export const insertRawData = async (data) => {
//   const sql = `
//     INSERT INTO raw_data (
//       name,
//       number,          
//       email,
//       address,
//       area_id,
//       cat_id,
//       reference_id,
//       created_by_user
//     ) VALUES ?
//       `;

//   const formattedData = data.map((row) => [
//     row.name,
//     row.contact,
//     row.email,
//     row.address,
//     row.area_id,
//     row.cat_id,
//     row.reference_id, 
//     'Not Assigned',  // status
//     'Inactive',      // lead_status
//     null,            // assign_id
//     row.created_by_user,
//     new Date(),      // created_at
//     0,               // lead_activity
//   ]);

//   const [result] = await db.query(sql, [formattedData]);
//   return result;
// };


/// retrieve master data from database modal.
// export const getRawData = async () => {
//   const query = `
//     SELECT 
//       rd.master_id,
//       rd.name,
//       rd.number,
//       rd.email,
//       rd.address,
//       rd.area_id,
//       a.area_name,
//       rd.cat_id,
//       c.cat_name,
//       rd.reference_id,
//       r.reference_name,
//       rd.status,
//       rd.assign_id,
//       rd.created_by_user
//     FROM raw_data rd 
//     JOIN category c ON rd.cat_id = c.cat_id
//     JOIN area a ON rd.area_id = a.area_id
//     LEFT JOIN reference r ON rd.reference_id = r.reference_id
//     WHERE rd.status = 'Not Assigned'
//     ORDER BY rd.master_id ASC
//   `;
  
//   const [rows] = await db.query(query);
//   return rows;
// };
