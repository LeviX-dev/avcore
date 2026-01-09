// models/userModel.js

import db from '../database/db.js';

// Function to add user to the database using the promise-based MySQL API
export const addUser = async (user) => {
  const query = 'INSERT INTO users (name, contact_no, email, address, role, status, username, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
  const [result] = await db.query(query, user);
  return result;
};

// Function to fetch users from the database
export const getUsers = async () => {
  const query = 'SELECT user_id, name, contact_no, email, address, role, status FROM users ORDER BY user_id DESC';
  const [rows] = await db.query(query);
  return rows;
};

//update user
// export const editUser = async (user_id, user) => {
//   const query = `
//     UPDATE users SET name = ?, contact_no = ?, address = ?, email = ?, role = ?, status = ?
//     WHERE user_id = ?`;
//   const [result] = await db.query(query, [user.name, user.contact, user.address, user.email, user.role, user.status, user_id]);
//   return result;
// };



//edit user model
export const editUser = async (user_id, user) => {
  const query = `
    UPDATE users SET name = ?, contact_no = ?, address = ?, email = ?, role = ?, status = ?
    WHERE user_id = ?`;
  const [result] = await db.query(query, [user.name, user.contact, user.address, user.email, user.role, user.status, user_id]);
  return result;
};


// delete user 
export const deleteUser = async (user_id) => {
  const query = 'DELETE FROM users WHERE user_id = ?';
  const [result] = await db.query(query, [user_id]);
  return result;
};







// // server/models/userModel.js
// import db from '../database/db.js';

// export const addUser = async (user) => {
//   const query = 'INSERT INTO users (name, contact_no, email, address, role, status, username, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
//   const [result] = await db.query(query, user);
//   return result;
// };

// // Add more model functions as needed
