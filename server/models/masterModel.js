import db from '../database/db.js';

// Function to add a category to the database
export const addCategory = async (data) => {
  const query = 'INSERT INTO category (cat_name, created_by_user) VALUES (?, ?)';
  const [result] = await db.query(query, data);
  return result;
};


// Function to fetch categories from the database
export const getCategories = async () => {
  const query = 'SELECT cat_id, cat_name, status FROM category ORDER BY cat_id';
  const [rows] = await db.query(query);
   return rows;
};



//update category 
export const updateCategory = async (cat_id, cat_name, status) => {
  const query = `UPDATE category SET cat_name = ?, status = ? WHERE cat_id = ?`;
  const [result] = await db.query(query, [cat_name, status, cat_id]);
  return result;
};




// delete category 
export const deleteCategory = async (cat_id) => {
  const query = 'DELETE FROM category WHERE cat_id = ?';
  const [result] = await db.query(query, [cat_id]);
  return result;
};
  

// ------------------------------ Product ---------------------------------------------

// Add a new product to the database
export const addProduct = async (product_name, cat_id, product_description, createdByUser , createdAt, status) => {
  const query = `
    INSERT INTO product (product_name, cat_id, product_description, created_by_user, created_at, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const [result] = await db.query(query, [product_name, cat_id, product_description, createdByUser , createdAt, status]);
  return result;
};

//Update product
export const updateProduct = async (product_id, product_name, product_description, status, cat_id) => {
  const query = `
    UPDATE product
    SET product_name = ?, product_description = ?, status = ?, cat_id = ?
    WHERE product_id = ?`;
  const [result] = await db.query(query, [product_name, product_description, status, cat_id, product_id]);
  return result;
}; 


// delete product 
export const deleteProduct = async (product_id) => {
  const query = 'DELETE FROM product WHERE product_id = ?';
  const [result] = await db.query(query, [product_id]);
  return result;
};


// Fetch products with their category names
export const getProducts = async () => {
  const query = `
    SELECT p.product_id, p.product_name, p.product_description, p.status, c.cat_name
    FROM product p
    JOIN category c ON p.cat_id = c.cat_id
    ORDER BY p.product_id;
  `;
  const [rows] = await db.query(query);
  return rows;
};
// ------------------------------ Reference  ---------------------------------------------

// Add a new reference
export const addReference = async (reference_name, createdByUser , createdAt, status) => {
  const query = 'INSERT INTO reference (reference_name, created_by_user, created_at, status) VALUES (?, ?, ?, ?)';
  const [result] = await db.query(query, [reference_name, createdByUser , createdAt, status]);
  return result.insertId;  // Return the ID of the newly inserted reference
};


// Fetch all references
export const getReferences = async () => {
  const query = 'SELECT reference_id, reference_name, status FROM reference ORDER BY reference_id';
  const [rows] = await db.query(query);
  return rows;
};

// Delete a reference by ID
export const deleteReference = async (id) => {
  const query = 'DELETE FROM reference WHERE reference_id = ?';
  await db.query(query, [id]);
};

export const updateReference = (id, data, callback) => {
  db.query("UPDATE reference SET ? WHERE reference_id = ?", [data, id], callback);
};





// ------------------------------ Area--------------------------------------------

// Add a new area
export const addArea = async (area_name, createdByUser , createdAt) => {
  const query = 'INSERT INTO area (area_name, created_by_user, created_at) VALUES (?, ?, ?)';
  const [result] = await db.query(query, [area_name, createdByUser , createdAt]);
  return result.insertId;  // Return the ID of the newly inserted area
};


// Fetch all area
export const getArea = async () => {
  const query = 'SELECT area_id,area_name FROM area ORDER BY area_id';
  const [rows] = await db.query(query);
  return rows;
};

// Delete a area by ID
export const deleteArea = async (id) => {
  const query = 'DELETE FROM area WHERE area_id = ?';
  await db.query(query, [id]);
};

export const updateArea = (id, data, callback) => {
  db.query("UPDATE area SET ? WHERE area_id = ?", [data, id], callback);
};