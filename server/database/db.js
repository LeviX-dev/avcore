//database/db.js

import mysql from 'mysql2/promise'; 

// Create a connection pool

// const db = mysql.createPool({
//   host: '127.0.0.1',
//   user: 'root',
//   password: '',
//   database: 'db_mms',
//     port: 3308,
// });

const db = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'db_mms_newdb',
  // database: 'db_mms',
  port: 3308,
});


// Connect to the database
const connectToDatabase = async () => {
  try {
    await db.getConnection();
    console.log('Connected to MySQL database');
  } catch (err) {
    console.error('Error connecting to MySQL database:', err);
  }
};

connectToDatabase();

export default db; 













// const mysql = require('mysql2');
// const dotenv = require('dotenv');
// dotenv.config();

// const db = mysql.createPool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   waitForConnections: true,
//   connectionLimit: 10,     // Adjust based on traffic
//   queueLimit: 0
// });

// // Optional: log connection success
// pool.getConnection((err, connection) => {
//   if (err) {
//     console.error('Error connecting to MySQL database:', err);
//   } else {
//     console.log('Connected to MySQL Database!');
//     connection.release(); // release the initial test connection
//   }
// });

// // This allows you to keep using: connection.query(...)
// export default db;















