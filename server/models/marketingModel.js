
import db from '../database/db.js';

// Function to fetch followup data from the database
export const getFollowups = async () => {
    const query = 'SELECT followup_id, client_name,	client_contact,	followup_date,	status FROM followup ORDER BY followup_id';
    const [rows] = await db.query(query);
   
     return rows;
  };
  

  //function to fetch marketing data from the database
  export const getMktProducts = async () => {
    const query = 'SELECT mkt_id, client_name, client_contact, cat_name, product_name, status FROM mkt_Product ORDER BY mkt_id';
    const [rows] = await db.query(query);
       
     return rows;
  };
  
    
// Function to update status by product ID
export const updateStatusById = (id, status) => {
  return new Promise((resolve, reject) => {
    const query = "UPDATE mkt_product SET status = ? WHERE id = ?";
    db.query(query, [status, id], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};



