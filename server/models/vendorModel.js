// models/vendorModel.js

import db from '../database/db.js';

// Function to add Vendor in the database
export const addVendor = async (vendor) =>{
const query = 'INSERT INTO vendors (vendor_name, vendor_email, vendor_phone, vendor_address) VALUES (?,?,?,?)'
    const[result] = await db.query(query, vendor)
    return result;
}   


export const vendorList = async ()=>{
    try {
        const query = 'SELECT vendor_id AS id, vendor_name AS name, vendor_email AS email, vendor_phone AS phone, vendor_address AS address FROM vendors';
        const [result] = await db.query(query);
        // console.log('Query Result:', result);
        return result;
      } catch (error) {
        console.error('Error executing query:', error);
        throw error;
      }
}


//update Vendor
export const editVendor= async (id, vendor) => {
  const query = `
    UPDATE vendors SET vendor_name = ?, vendor_email = ?, vendor_phone = ?, vendor_address = ?
    WHERE vendor_id = ?`;
  const [result] = await db.query(query, [vendor.name, vendor.email, vendor.phone, vendor.address, id]);
  return result;
};

