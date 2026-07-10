
import db from '../database/db.js';

// Add Client
export const addClient = async (clientData) => {
  const {
    clientName,
    clientContact,
    contactPersonName,
    contactPersonContact,
    contactPersonEmail,
    userId,
  } = clientData;

  console.log("Received clientData:", clientData);
  
  if (!clientData.userId) {
    throw new Error("User ID is missing");
  }

  const query = `
    INSERT INTO client (
      client_name,
      client_contact,
      contact_person_name,
      contact_person_number,
      contact_person_email,
      created_by_user
    ) VALUES (?, ?, ?, ?, ?, ?)
  `;

  const values = [
    clientName,
    clientContact,
    contactPersonName,
    contactPersonContact,
    contactPersonEmail,
    userId,
  ];

  try {
    const [result] = await db.execute(query, values);
    return { insertId: result.insertId }; // Return inserted clientId
  } catch (error) {
    throw new Error(`Database Error: ${error.message}`);
  }
};

// Add Followup
export const addFollowup = async (clientData) => {
  const {
    clientId,
    clientName,
    clientContact,
    followupDate,
    remark,
    status,
    userId,
  } = clientData;

  const query = `
    INSERT INTO followup (
      client_id,
      client_name,
      client_contact,
      followup_date,
      remark,
      status,
      created_by_user
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    clientId,
    clientName,
    clientContact,
    followupDate,
    remark,
    status,
    userId,
  ];

  try {
    const [result] = await db.execute(query, values);
    return result;
  } catch (error) {
    throw new Error(`Database Error: ${error.message}`);
  }
};

// Add Marketing
export const addMarketing = async (clientData) => {
  const {
    clientId,
    clientName,
    clientContact,
    category,
    product,
    status,
    mode,
    reference,
    userId,
  } = clientData;

  const query = `
    INSERT INTO mkt_product (
      client_id,
      client_name,
      client_contact,
      cat_name,
      product_name,
      status,
      mode,
      reference,
      created_by_user
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    clientId,
    clientName,
    clientContact,
    category,
    product,
    status,
    mode,
    reference,
    userId,
  ];

  try {
    const [result] = await db.execute(query, values);
    return result;
  } catch (error) {
    throw new Error(`Database Error: ${error.message}`);
  }
};

// Fetch products by category ID
export const getProductsByCategory = async (cat_id) => {
  try {
    console.log('Fetching products for cat_id:', cat_id); // Log to debug
    const [products] = await db.query('SELECT * FROM product WHERE cat_id = ?', [cat_id]);
    console.log('Products fetched:', products); // Log the fetched products
    return products;
  } catch (error) {
    console.error('Database query failed:', error.message);  // Log the error
    throw new Error('Database query failed');
  }
};
