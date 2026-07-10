import db from "./db.js";

try {
  const [rows] = await db.query(`
    SELECT
      @@hostname AS hostname,
      @@port AS port,
      @@sql_mode AS mode,
      VERSION() AS version,
      DATABASE() AS database_name
  `);

  console.table(rows);
} catch (err) {
  console.error(err);
}