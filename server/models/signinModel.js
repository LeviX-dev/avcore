
import db from "../database/db.js";

export const getUserByUsername = async (username) => {
  const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
  return rows[0]; 
};











// user Signin
// export const loginUser = async () =>{
//     const querry ='SELECT * from users WHERE username =?';
//     const[result]= await db.query(querry,[username])
//   }
  