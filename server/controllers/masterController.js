import { addCategory, getCategories, updateCategory, deleteCategory, deleteProduct, addReference, addProduct, updateProduct, getProducts, getReferences, deleteReference, updateReference, deleteArea, addArea, getArea } from '../models/masterModel.js';
import db from '../database/db.js';
import path from "path";
import fs from "fs";   // <-- ADD THIS
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Add Category
export const createCategory = async (req, res) => {
  const { cat_name } = req.body;
  // Check session
  if (!req.session.user) {
    return res.status(401).json({ message: 'Unauthorized. Please log in.' });
  }
  const userId = req.session.user.id;
  console.log("userId : ",userId);

  try {
    const result = await addCategory([cat_name, userId]);
    res.status(201).json({ message: 'Category added successfully!', cat_id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while creating the category' });
  }
};


// show category list controller
export const categoryList = async (req, res) => {
  try {
    const category = await getCategories();
    // console.log('Users fetched from DB:', category); 
    res.status(200).json(category);
  } catch (error) {
    console.error('Error fetching categories:', error); 
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};


// update category 
export const updateCategoryController = async (req, res) => {
  const { cat_id } = req.params;
  const { cat_name, status } = req.body;

  if (!cat_name || !status) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    await updateCategory(cat_id, cat_name, status);
    res.status(200).json({ message: "Category updated successfully" });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

  
// remove category controller
export const removeCategory = async (req, res) => {
  const { cat_id } = req.params;
  console.log('Received cat_id:', cat_id);

  try {
    // Ensure the deleteCategory model is called
    const result = await deleteCategory(cat_id);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete Category' });
  }
};


// ------------------------------ product --------------------------------



// ------------------------------ product --------------------------------


export const addProductFull = async (req, res) => {
  try {
    console.log('RAW BODY ===>', req.body);
    console.log('FILES ===>', req.files);

    const { product_type_name, quotation_type, other_quotation_type } =
      req.body;

    if (!product_type_name) {
      return res.status(400).json({ error: 'product_type_name is required' });
    }

    if (!quotation_type) {
      return res.status(400).json({ error: 'quotation_type is required' });
    }

    // if dropdown = Other → store textbox value instead
    const finalQuotationType =
      quotation_type === 'Other' && other_quotation_type
        ? other_quotation_type
        : quotation_type;

    if (!req.body.brands) {
      return res.status(400).json({ error: 'brands is required' });
    }

    let brands;
    try {
      brands = JSON.parse(req.body.brands);
    } catch (e) {
      return res.status(400).json({ error: 'brands must be valid JSON' });
    }

    if (!Array.isArray(brands) || brands.length === 0) {
      return res
        .status(400)
        .json({ error: 'brands must be a non-empty array' });
    }

    // -----------------------------
    // CREATE PRODUCT TYPE  (UPDATED)
    // -----------------------------
    const [pt] = await db.execute(
      `INSERT INTO product_types (product_type_name, quotation_type) 
       VALUES (?, ?)`,
      [product_type_name, finalQuotationType],
    );

    const product_type_id = pt.insertId;

    // -----------------------------
    // LOOP BRANDS (unchanged)
    // -----------------------------
    for (const brand of brands) {
      if (!brand.brand_name) continue;

      const [br] = await db.execute(
        `INSERT INTO brands (brand_name, product_type_id) VALUES (?, ?)`,
        [brand.brand_name, product_type_id],
      );

      const brand_id = br.insertId;

      // -----------------------------
      // LOOP MODELS (unchanged)
      // -----------------------------
      for (const model of brand.models || []) {
        let savedImagePaths = [];

        if (req.files && req.files['model_images[]']) {
          let images = req.files['model_images[]'];
          if (!Array.isArray(images)) images = [images];

          for (const img of images) {
            const fileName = `${Date.now()}_${img.name}`;
            const uploadDir = path.join(__dirname, '../uploads');

            if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

            const fullPath = path.join(uploadDir, fileName);
            await img.mv(fullPath);

            savedImagePaths.push(`/uploads/${fileName}`);
          }
        }

        await db.execute(
          `INSERT INTO models 
            (brand_id, model_no, description, price, image_path)
           VALUES (?, ?, ?, ?, ?)`,
          [
            brand_id,
            model.model_no || '',
            model.description || '',
            model.price || null,
            savedImagePaths[0] || null,
          ],
        );
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Product type + brands + models created successfully',
    });
  } catch (err) {
    console.error('❌ addProductFull Error:', err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// Update product controller

export const updateProductFull1 = async (req, res) => {
  const { product_type_id } = req.params;

  try {
    const { product_type_name, quotation_type, other_quotation_type } =
      req.body;

    if (!product_type_name) {
      return res.status(400).json({ error: 'product_type_name is required' });
    }

    if (!quotation_type) {
      return res.status(400).json({ error: 'quotation_type is required' });
    }

    const finalQuotationType =
      quotation_type === 'Other' && other_quotation_type
        ? other_quotation_type
        : quotation_type;

    if (!req.body.brands) {
      return res.status(400).json({ error: 'brands is required' });
    }

    let brands;

    try {
      brands = JSON.parse(req.body.brands);
    } catch (e) {
      return res.status(400).json({ error: 'brands must be valid JSON' });
    }

    if (!Array.isArray(brands) || brands.length === 0) {
      return res
        .status(400)
        .json({ error: 'brands must be a non-empty array' });
    }

    // --------------------------------
    // UPDATE PRODUCT TYPE
    // --------------------------------
    await db.execute(
      `UPDATE product_types 
       SET product_type_name = ?, quotation_type = ?
       WHERE product_type_id = ?`,
      [product_type_name, finalQuotationType, product_type_id],
    );

    // --------------------------------
    // DELETE OLD BRANDS + MODELS
    // --------------------------------
    await db.execute(
      `DELETE m FROM models m 
       INNER JOIN brands b ON m.brand_id = b.brand_id
       WHERE b.product_type_id = ?`,
      [product_type_id],
    );

    await db.execute(`DELETE FROM brands WHERE product_type_id = ?`, [
      product_type_id,
    ]);

    // --------------------------------
    // RE-CREATE BRANDS + MODELS
    // --------------------------------
    for (const brand of brands) {
      if (!brand.brand_name) continue;

      const [br] = await db.execute(
        `INSERT INTO brands (brand_name, product_type_id)
         VALUES (?, ?)`,
        [brand.brand_name, product_type_id],
      );

      const brand_id = br.insertId;

      for (const model of brand.models || []) {
        let savedImagePaths = [];

        if (req.files && req.files['model_images[]']) {
          let images = req.files['model_images[]'];
          if (!Array.isArray(images)) images = [images];

          for (const img of images) {
            const fileName = `${Date.now()}_${img.name}`;
            const uploadDir = path.join(__dirname, '../uploads');

            if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

            const fullPath = path.join(uploadDir, fileName);
            await img.mv(fullPath);

            savedImagePaths.push(`/uploads/${fileName}`);
          }
        }

        await db.execute(
          `INSERT INTO models 
            (brand_id, model_no, description, price, image_path)
           VALUES (?, ?, ?, ?, ?)`,
          [
            brand_id,
            model.model_no || '',
            model.description || '',
            model.price || null,
            savedImagePaths[0] || null,
          ],
        );
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
    });
  } catch (err) {
    console.error('❌ updateProductFull Error:', err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

export const updateProductFull = async (req, res) => {
  const { product_type_id } = req.params;

  try {
    const { product_type_name, quotation_type, other_quotation_type } =
      req.body;

    if (!product_type_name) {
      return res.status(400).json({ error: 'product_type_name is required' });
    }

    if (!quotation_type) {
      return res.status(400).json({ error: 'quotation_type is required' });
    }

    const finalQuotationType =
      quotation_type === 'Other' && other_quotation_type
        ? other_quotation_type
        : quotation_type;

    if (!req.body.brands) {
      return res.status(400).json({ error: 'brands is required' });
    }

    let brands;

    try {
      brands = JSON.parse(req.body.brands);
    } catch (e) {
      return res.status(400).json({ error: 'brands must be valid JSON' });
    }

    if (!Array.isArray(brands) || brands.length === 0) {
      return res
        .status(400)
        .json({ error: 'brands must be a non-empty array' });
    }

    // --------------------------------
    // UPDATE PRODUCT TYPE
    // --------------------------------
    await db.execute(
      `UPDATE product_types 
       SET product_type_name = ?, quotation_type = ?
       WHERE product_type_id = ?`,
      [product_type_name, finalQuotationType, product_type_id],
    );

    // --------------------------------
    // DELETE OLD BRANDS + MODELS
    // --------------------------------
    await db.execute(
      `DELETE m FROM models m 
       INNER JOIN brands b ON m.brand_id = b.brand_id
       WHERE b.product_type_id = ?`,
      [product_type_id],
    );

    await db.execute(`DELETE FROM brands WHERE product_type_id = ?`, [
      product_type_id,
    ]);

    // --------------------------------
    // RE-CREATE BRANDS + MODELS
    // --------------------------------
    for (const brand of brands) {
      if (!brand.brand_name) continue;

      const [br] = await db.execute(
        `INSERT INTO brands (brand_name, product_type_id)
         VALUES (?, ?)`,
        [brand.brand_name, product_type_id],
      );

      const brand_id = br.insertId;

      for (const model of brand.models || []) {
        let savedImagePaths = [];

        if (req.files && req.files['model_images[]']) {
          let images = req.files['model_images[]'];
          if (!Array.isArray(images)) images = [images];

          for (const img of images) {
            const fileName = `${Date.now()}_${img.name}`;
            const uploadDir = path.join(__dirname, '../uploads');

            if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

            const fullPath = path.join(uploadDir, fileName);
            await img.mv(fullPath);

            savedImagePaths.push(`/uploads/${fileName}`);
          }
        }

        await db.execute(
          `INSERT INTO models 
            (brand_id, model_no, description, price, image_path)
           VALUES (?, ?, ?, ?, ?)`,
          [
            brand_id,
            model.model_no || '',
            model.description || '',
            model.price || null,
            savedImagePaths[0] || null,
          ],
        );
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
    });
  } catch (err) {
    console.error('❌ updateProductFull Error:', err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

export const deleteProductEntity = async (req, res) => {
  try {
    const { entity, id } = req.params;
    const safeId = Number(id);

    if (!entity || isNaN(safeId)) {
      return res.status(400).json({ success: false, error: 'Invalid request' });
    }

    console.log('🟡 Delete requested →', entity, 'ID:', safeId);

    // =========================
    // 🔵 DELETE MODEL
    // =========================
    if (entity === 'model') {
      const [rows] = await db.execute(
        'SELECT image_path, model_no FROM models WHERE model_id = ?',
        [safeId],
      );

      if (!rows.length)
        return res
          .status(404)
          .json({ success: false, error: 'Model not found' });

      const model = rows[0];

      // delete image if exists
      if (model.image_path) {
        const filePath = path.join(process.cwd(), model.image_path);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }

      await db.execute('DELETE FROM models WHERE model_id = ?', [safeId]);

      return res.json({
        success: true,
        message: 'Model deleted successfully',
        deleted: { type: 'model', id: safeId, model_no: model.model_no },
      });
    }

    // =========================
    // 🟢 DELETE BRAND (models cascade)
    // =========================
    if (entity === 'brand') {
      // get all model images for cleanup
      const [models] = await db.execute(
        'SELECT image_path FROM models WHERE brand_id = ?',
        [safeId],
      );

      for (const m of models) {
        if (m?.image_path) {
          const filePath = path.join(process.cwd(), m.image_path);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
      }

      await db.execute('DELETE FROM brands WHERE brand_id = ?', [safeId]);

      return res.json({
        success: true,
        message: 'Brand (and its models) deleted successfully',
        deleted: { type: 'brand', id: safeId },
      });
    }

    // =========================
    // 🟣 DELETE PRODUCT TYPE (brands + models cascade)
    // =========================
    if (entity === 'product-type') {
      // gather all model images first
      const [models] = await db.execute(
        `SELECT m.image_path 
         FROM models m 
         INNER JOIN brands b ON m.brand_id = b.brand_id
         WHERE b.product_type_id = ?`,
        [safeId],
      );

      for (const m of models) {
        if (m?.image_path) {
          const filePath = path.join(process.cwd(), m.image_path);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
      }

      await db.execute('DELETE FROM product_types WHERE product_type_id = ?', [
        safeId,
      ]);

      return res.json({
        success: true,
        message: 'Product type deleted successfully (brands + models removed)',
        deleted: { type: 'product-type', id: safeId },
      });
    }

    return res
      .status(400)
      .json({ success: false, error: 'Invalid entity type' });
  } catch (err) {
    console.error('❌ Delete Error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Fetch products with category names

export const getProductsFull1 = async (req, res) => {
  try {
    // Fetch product types + quotation type
    const [productTypes] = await db.execute(`
      SELECT 
        pt.product_type_id,
        pt.product_type_name,
        pt.quotation_type
      FROM product_types pt
      ORDER BY pt.product_type_id DESC
    `);

    if (productTypes.length === 0) {
      return res.status(200).json([]);
    }

    const productTypeIds = productTypes.map((pt) => pt.product_type_id);

    // Fetch brands under these product types
    const [brands] = await db.execute(
      `
      SELECT 
        b.brand_id,
        b.brand_name,
        b.product_type_id
      FROM brands b
      WHERE b.product_type_id IN (${productTypeIds.map(() => '?').join(',')})
      `,
      productTypeIds,
    );

    const brandIds = brands.map((b) => b.brand_id);

    let models = [];
    if (brandIds.length > 0) {
      // Fetch models under those brands
      const [rows] = await db.execute(
        `
        SELECT 
          m.model_id,
          m.brand_id,
          m.model_no,
          m.description,
          m.price,
          m.image_path
        FROM models m
        WHERE m.brand_id IN (${brandIds.map(() => '?').join(',')})
        `,
        brandIds,
      );

      models = rows;
    }

    // -------------------------
    // BUILD NESTED JSON
    // -------------------------
    const result = productTypes.map((pt) => ({
      product_type_id: pt.product_type_id,
      product_type_name: pt.product_type_name,
      quotation_type: pt.quotation_type,
      brands: brands
        .filter((b) => b.product_type_id === pt.product_type_id)
        .map((b) => ({
          brand_id: b.brand_id,
          brand_name: b.brand_name,
          models: models.filter((m) => m.brand_id === b.brand_id),
        })),
    }));

    return res.status(200).json(result);
  } catch (err) {
    console.error('❌ getProductsFull Error:', err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

export const getProductsFull = async (req, res) => {
  try {
    // --------------------------------
    // FETCH PRODUCT TYPES + CATEGORY
    // --------------------------------
    const [productTypes] = await db.execute(`
      SELECT 
        pt.product_type_id,
        pt.product_type_name,
        pt.cat_id,
        c.cat_name
      FROM product_types pt
      INNER JOIN category c ON c.cat_id = pt.cat_id
      ORDER BY pt.product_type_id DESC
    `);

    if (productTypes.length === 0) {
      return res.status(200).json([]);
    }

    const productTypeIds = productTypes.map((pt) => pt.product_type_id);

    // --------------------------------
    // FETCH BRANDS
    // --------------------------------
    const [brands] = await db.execute(
      `
      SELECT 
        b.brand_id,
        b.brand_name,
        b.product_type_id
      FROM brands b
      WHERE b.product_type_id IN (${productTypeIds.map(() => '?').join(',')})
      `,
      productTypeIds,
    );

    const brandIds = brands.map((b) => b.brand_id);

    // --------------------------------
    // FETCH MODELS
    // --------------------------------
    let models = [];
    if (brandIds.length > 0) {
      const [rows] = await db.execute(
        `
        SELECT 
          m.model_id,
          m.brand_id,
          m.model_no,
          m.description,
          m.price,
          m.image_path
        FROM models m
        WHERE m.brand_id IN (${brandIds.map(() => '?').join(',')})
        `,
        brandIds,
      );

      models = rows;
    }

    // --------------------------------
    // BUILD NESTED RESPONSE
    // --------------------------------
    const result = productTypes.map((pt) => ({
      product_type_id: pt.product_type_id,
      product_type_name: pt.product_type_name,
      cat_id: pt.cat_id,
      cat_name: pt.cat_name,
      brands: brands
        .filter((b) => b.product_type_id === pt.product_type_id)
        .map((b) => ({
          brand_id: b.brand_id,
          brand_name: b.brand_name,
          models: models.filter((m) => m.brand_id === b.brand_id),
        })),
    }));

    return res.status(200).json(result);
  } catch (err) {
    console.error('❌ getProductsFull Error:', err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// Step 1: Create product type only (without brands/models)
export const addProductTypeOnly1 = async (req, res) => {
  try {
    const { product_type_name, quotation_type, other_quotation_type } =
      req.body;

    if (!product_type_name) {
      return res.status(400).json({ error: 'product_type_name is required' });
    }

    if (!quotation_type) {
      return res.status(400).json({ error: 'quotation_type is required' });
    }

    const finalQuotationType =
      quotation_type === 'Other' && other_quotation_type
        ? other_quotation_type
        : quotation_type;

    // Create product type
    const [pt] = await db.execute(
      `INSERT INTO product_types (product_type_name, quotation_type) 
       VALUES (?, ?)`,
      [product_type_name, finalQuotationType],
    );

    return res.status(201).json({
      success: true,
      message: 'Product type created successfully',
      product_type_id: pt.insertId,
      product_type_name,
      quotation_type: finalQuotationType,
    });
  } catch (err) {
    console.error('❌ addProductTypeOnly Error:', err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

export const addProductTypeOnly = async (req, res) => {
  try {
    const { product_type_name, quotation_type, cat_id } = req.body;

    // 🔹 Validation
    if (!product_type_name) {
      return res.status(400).json({ error: 'product_type_name is required' });
    }

    if (!cat_id) {
      return res.status(400).json({ error: 'cat_id is required' });
    }

    // 🔹 Insert product type
    const [pt] = await db.execute(
      `INSERT INTO product_types 
        (product_type_name, cat_id) 
       VALUES (?, ?)`,
      [product_type_name, cat_id],
    );

    return res.status(201).json({
      success: true,
      message: 'Product type created successfully',
      product_type_id: pt.insertId,
      product_type_name,
      cat_id,
    });
  } catch (err) {
    console.error('❌ addProductTypeOnly Error:', err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// Step 2: Add brand to existing product type
export const addBrandToProduct = async (req, res) => {
  try {
    const { product_type_id } = req.params;
    const { brand_name } = req.body;

    if (!brand_name) {
      return res.status(400).json({ error: 'brand_name is required' });
    }

    // Check if product type exists
    const [productType] = await db.execute(
      `SELECT * FROM product_types WHERE product_type_id = ?`,
      [product_type_id],
    );

    if (productType.length === 0) {
      return res.status(404).json({ error: 'Product type not found' });
    }

    // Add brand
    const [br] = await db.execute(
      `INSERT INTO brands (brand_name, product_type_id) VALUES (?, ?)`,
      [brand_name, product_type_id],
    );

    return res.status(201).json({
      success: true,
      message: 'Brand added successfully',
      brand_id: br.insertId,
      brand_name,
    });
  } catch (err) {
    console.error('❌ addBrandToProduct Error:', err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// Step 3: Add model to existing brand
// export const addModelToBrand = async (req, res) => {
//   try {
//     const { brand_id } = req.params;
//     const { model_no, description, price } = req.body;

//     if (!model_no) {
//       return res.status(400).json({ error: "model_no is required" });
//     }

//     if (!price) {
//       return res.status(400).json({ error: "price is required" });
//     }

//     // Check if brand exists
//     const [brand] = await db.execute(
//       `SELECT * FROM brands WHERE brand_id = ?`,
//       [brand_id]
//     );

//     if (brand.length === 0) {
//       return res.status(404).json({ error: "Brand not found" });
//     }

//     let savedImagePath = null;

//     // Handle image upload
//     if (req.files && req.files.model_image) {
//       const image = req.files.model_image;
//       const fileName = `${Date.now()}_${image.name}`;
//       const uploadDir = path.join(__dirname, "../uploads");

//       if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

//       const fullPath = path.join(uploadDir, fileName);
//       await image.mv(fullPath);

//       savedImagePath = `/uploads/${fileName}`;
//     }

//     // Add model
//     const [model] = await db.execute(
//       `INSERT INTO models
//         (brand_id, model_no, description, price, image_path)
//        VALUES (?, ?, ?, ?, ?)`,
//       [
//         brand_id,
//         model_no,
//         description || "",
//         price,
//         savedImagePath
//       ]
//     );

//     return res.status(201).json({
//       success: true,
//       message: "Model added successfully",
//       model_id: model.insertId,
//       model_no,
//       price,
//       image_path: savedImagePath
//     });

//   } catch (err) {
//     console.error("❌ addModelToBrand Error:", err);
//     return res.status(500).json({
//       success: false,
//       error: err.message,
//     });
//   }
// };
export const addModelToBrand = async (req, res) => {
  try {
    const { brand_id } = req.params;
    const { model_no, description, price } = req.body;

    if (!model_no) {
      return res.status(400).json({ error: 'model_no is required' });
    }

    if (!price) {
      return res.status(400).json({ error: 'price is required' });
    }

    /* ✅ PRICE FIX (ONLY CHANGE) */
    const cleanPrice = Number(price.toString().replace(/,/g, ''));

    if (isNaN(cleanPrice)) {
      return res.status(400).json({ error: 'Invalid price format' });
    }
    /* ✅ PRICE FIX END */

    // Check if brand exists
    const [brand] = await db.execute(
      `SELECT * FROM brands WHERE brand_id = ?`,
      [brand_id],
    );

    if (brand.length === 0) {
      return res.status(404).json({ error: 'Brand not found' });
    }

    let savedImagePath = null;

    // Handle image upload
    if (req.files && req.files.model_image) {
      const image = req.files.model_image;
      const fileName = `${Date.now()}_${image.name}`;
      const uploadDir = path.join(__dirname, '../uploads');

      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

      const fullPath = path.join(uploadDir, fileName);
      await image.mv(fullPath);

      savedImagePath = `/uploads/${fileName}`;
    }

    // Add model
    const [model] = await db.execute(
      `INSERT INTO models 
        (brand_id, model_no, description, price, image_path)
       VALUES (?, ?, ?, ?, ?)`,
      [
        brand_id,
        model_no,
        description || '',
        cleanPrice, // ✅ FIXED PRICE USED HERE
        savedImagePath,
      ],
    );

    return res.status(201).json({
      success: true,
      message: 'Model added successfully',
      model_id: model.insertId,
      model_no,
      price: cleanPrice,
      image_path: savedImagePath,
    });
  } catch (err) {
    console.error('❌ addModelToBrand Error:', err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// Get specific product type with all details
export const getProductTypeDetails = async (req, res) => {
  try {
    const { product_type_id } = req.params;

    // Get product type
    const [productTypes] = await db.execute(
      `SELECT * FROM product_types WHERE product_type_id = ?`,
      [product_type_id],
    );

    if (productTypes.length === 0) {
      return res.status(404).json({ error: 'Product type not found' });
    }

    const productType = productTypes[0];

    // Get brands for this product type
    const [brands] = await db.execute(
      `SELECT * FROM brands WHERE product_type_id = ?`,
      [product_type_id],
    );

    const brandIds = brands.map((b) => b.brand_id);

    // Get models for these brands
    let models = [];
    if (brandIds.length > 0) {
      const [rows] = await db.execute(
        `SELECT * FROM models WHERE brand_id IN (${brandIds
          .map(() => '?')
          .join(',')})`,
        brandIds,
      );
      models = rows;
    }

    // Build nested structure
    const result = {
      ...productType,
      brands: brands.map((brand) => ({
        ...brand,
        models: models.filter((model) => model.brand_id === brand.brand_id),
      })),
    };

    return res.status(200).json(result);
  } catch (err) {
    console.error('❌ getProductTypeDetails Error:', err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

export const updateBrand = async (req, res) => {
  try {
    const { brand_id } = req.params;
    const { brand_name } = req.body;

    if (!brand_name) {
      return res.status(400).json({ error: 'brand_name is required' });
    }

    // Update brand
    await db.execute(`UPDATE brands SET brand_name = ? WHERE brand_id = ?`, [
      brand_name,
      brand_id,
    ]);

    return res.status(200).json({
      success: true,
      message: 'Brand updated successfully',
    });
  } catch (err) {
    console.error('❌ updateBrand Error:', err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};



// ------------------------------ References ------------------------------

// Add new reference
export const addReferenceController = async (req, res) => {
  console.log('Session:', req.session); // Log the session to see its contents
  const { reference_name } = req.body;
  if (!req.session.user) {
    return res.status(401).json({ error: 'Unauthorized. Please log in.' });
  }

  if (!reference_name) {
    return res.status(400).json({ error: 'Reference name is required' });
  }

  const createdByUser  = req.session.user.id; // Assuming you have user ID in session
  const createdAt = new Date(); // Get the current timestamp
  const status = 'active'; // Default status

  try {
    const referenceId = await addReference(reference_name, createdByUser , createdAt, status);
    res.status(201).json({ reference_id: referenceId, reference_name });
  } catch (error) {
    console.error("Error adding reference:", error);
    res.status(500).json({ error: 'Failed to add reference' });
  }
};


// Fetch references
export const getReferencesController = async (req, res) => {
  try {
    const references = await getReferences();
    res.status(200).json(references);
  } catch (error) {
    console.error("Error fetching references:", error);
    res.status(500).json({ error: 'Failed to fetch references' });
  }
};1

// Delete reference
export const deleteReferenceController = async (req, res) => {
  const { id } = req.params;
  try {
    await deleteReference(id);
    res.status(200).json({ message: 'Reference deleted successfully' });
  } catch (error) {
    console.error("Error deleting reference:", error);
    res.status(500).json({ error: 'Failed to delete reference' });
  }
};

// uodate reference
export const updateReferenceController = async (req, res) => {
  const id = req.params.id;
  const { reference_name, status } = req.body;

  if (!reference_name && !status) {
    return res.status(400).json({ message: "No valid fields to update" });
  }

  const updateData = {};
  if (reference_name) updateData.reference_name = reference_name;
  if (status) updateData.status = status;

  try {
    const [result] = await db.query(
      "UPDATE reference SET ? WHERE reference_id = ?",
      [updateData, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Reference not found" });
    }

    res.status(200).json({ message: "Reference updated successfully" });
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ message: "Error updating reference" });
  }
};



// ------------------------------ Area ------------------------------

// Add new area controller
export const addAreaController = async (req, res) => {
  console.log('Session:', req.session); 
  const { area_name } = req.body;
  if (!req.session.user) {
    return res.status(401).json({ error: 'Unauthorized. Please log in.' });
  }

  if (!area_name) {
    return res.status(400).json({ error: 'Area name is required' });
  }

  const createdByUser  = req.session.user.id;
  const createdAt = new Date(); 

  try {
    const areaId = await addArea(area_name, createdByUser , createdAt);
    res.status(201).json({ area_id: areaId, area_name });
  } catch (error) {
    console.error("Error adding Area:", error);
    res.status(500).json({ error: 'Failed to add Area' });
  }
};


// Fetch references
export const getAreaController = async (req, res) => {
  try {
    const area = await getArea();
    res.status(200).json(area);
  } catch (error) {
    console.error("Error fetching Area:", error);
    res.status(500).json({ error: 'Failed to fetch Area' });
  }
};1

// Delete area
export const deleteAreaController = async (req, res) => {
  const { id } = req.params;
  try {
    await deleteArea(id);
    res.status(200).json({ message: 'Area deleted successfully' });
  } catch (error) {
    console.error("Error deleting Area:", error);
    res.status(500).json({ error: 'Failed to delete Area' });
  }
};

// update area
export const updateAreaController = async (req, res) => {
  const id = req.params.id;
  const { area_name } = req.body;

  if (!area_name) {
    return res.status(400).json({ message: "No valid fields to update" });
  }

  const updateData = {};
  if (area_name) updateData.area_name = area_name;

  try {
    const [result] = await db.query(
      "UPDATE area SET ? WHERE area_id = ?",
      [updateData, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Area not found" });
    }

    res.status(200).json({ message: "Area updated successfully" });
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ message: "Error updating area" });
  }
};


export const createKit = async (req, res) => {
  const {
    kit_name,
    description = null,
    cat_id,
    status = 'active',
    items = [],
  } = req.body;

  if (!kit_name || !cat_id || items.length === 0) {
    return res.status(400).json({
      message: 'kit_name, cat_id and items are required',
    });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    let totalPrice = 0;

    for (const item of items) {
      const { model_id, qty = 1 } = item;

      if (!item.product_type_id) {
        throw new Error('Invalid kit item data: product_type_id is required');
      }

      if (model_id) {
        const [modelRows] = await connection.query(
          `SELECT price FROM models WHERE model_id = ?`,
          [model_id],
        );

        if (modelRows.length > 0) {
          totalPrice += (modelRows[0].price || 0) * qty;
        }
      }
    }

    const [kitResult] = await connection.query(
      `INSERT INTO kit 
       (kit_name, description, kit_price, cat_id, status)
       VALUES (?, ?, ?, ?, ?)`,
      [kit_name, description, totalPrice, cat_id, status],
    );

    const kit_id = kitResult.insertId;

    for (const item of items) {
      const {
        product_type_id,
        brand_id = null,
        model_id = null,
        qty = 1,
      } = item;

      await connection.query(
        `INSERT INTO kit_mapping
         (kit_id, product_type_id, brand_id, model_id, qty)
         VALUES (?, ?, ?, ?, ?)`,
        [kit_id, product_type_id, brand_id, model_id, qty],
      );
    }

    await connection.commit();

    res.status(201).json({
      message: 'Kit created successfully',
      kit_id,
      kit_price: totalPrice,
    });
  } catch (error) {
    await connection.rollback();
    console.error('❌ Create Kit Error:', error);

    res.status(500).json({
      message: error.message || 'Internal server error',
    });
  } finally {
    connection.release();
  }
};

export const updateKit = async (req, res) => {
  const { id } = req.params;
  const {
    kit_name,
    description = null,
    cat_id,
    status = 'active',
    items = [],
  } = req.body;

  if (!kit_name || !cat_id || items.length === 0) {
    return res.status(400).json({
      message: 'kit_name, cat_id and items are required',
    });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 1️⃣ Fetch existing mappings
    const [existingRows] = await connection.query(
      `SELECT product_type_id, brand_id, model_id FROM kit_mapping WHERE kit_id = ?`,
      [id],
    );

    // Normalize keys
    const existingKeys = existingRows.map(
      (i) => `${i.product_type_id}-${i.brand_id}-${i.model_id}`,
    );

    const incomingKeys = items.map(
      (i) => `${i.product_type_id}-${i.brand_id}-${i.model_id}`,
    );

    // 2️⃣ DELETE removed products
    for (const row of existingRows) {
      const key = `${row.product_type_id}-${row.brand_id}-${row.model_id}`;
      if (!incomingKeys.includes(key)) {
        await connection.query(
          `DELETE FROM kit_mapping 
           WHERE kit_id = ? AND product_type_id = ? AND brand_id <=> ? AND model_id <=> ?`,
          [id, row.product_type_id, row.brand_id, row.model_id],
        );
      }
    }

    // 3️⃣ INSERT or UPDATE products
    for (const item of items) {
      const {
        product_type_id,
        brand_id = null,
        model_id = null,
        qty = 1,
      } = item;

      const [exists] = await connection.query(
        `SELECT kmap_id FROM kit_mapping 
         WHERE kit_id = ? AND product_type_id = ? AND brand_id <=> ? AND model_id <=> ?`,
        [id, product_type_id, brand_id, model_id],
      );

      if (exists.length > 0) {
        // Update qty
        await connection.query(
          `UPDATE kit_mapping SET qty = ? WHERE kmap_id = ?`,
          [qty, exists[0].kmap_id],
        );
      } else {
        // Insert new
        await connection.query(
          `INSERT INTO kit_mapping 
           (kit_id, product_type_id, brand_id, model_id, qty)
           VALUES (?, ?, ?, ?, ?)`,
          [id, product_type_id, brand_id, model_id, qty],
        );
      }
    }

    // 4️⃣ Recalculate kit price
    let totalPrice = 0;
    for (const item of items) {
      if (item.model_id) {
        const [model] = await connection.query(
          `SELECT price FROM models WHERE model_id = ?`,
          [item.model_id],
        );
        if (model.length) {
          totalPrice += (model[0].price || 0) * (item.qty || 1);
        }
      }
    }

    // 5️⃣ Update kit
    await connection.query(
      `UPDATE kit 
       SET kit_name = ?, description = ?, kit_price = ?, cat_id = ?, status = ?
       WHERE kit_id = ?`,
      [kit_name, description, totalPrice, cat_id, status, id],
    );

    await connection.commit();

    res.json({
      message: 'Kit updated successfully',
      kit_id: id,
      kit_price: totalPrice,
    });
  } catch (error) {
    await connection.rollback();
    console.error('❌ Update Kit Error:', error);
    res.status(500).json({ message: error.message });
  } finally {
    connection.release();
  }
};

export const getKits = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        k.kit_id,
        k.kit_name,
        k.description AS kit_description,
        k.kit_price,
        k.status,
        k.created_at,

        k.cat_id,
        c.cat_name,

        km.kmap_id,
        km.qty,

        pt.product_type_id,
        pt.product_type_name,

        b.brand_id,
        b.brand_name,

        m.model_id,
        m.model_no,
        m.price,
        m.description AS model_description

      FROM kit k
      INNER JOIN category c ON c.cat_id = k.cat_id
      LEFT JOIN kit_mapping km ON km.kit_id = k.kit_id
      LEFT JOIN product_types pt ON pt.product_type_id = km.product_type_id
      LEFT JOIN brands b ON b.brand_id = km.brand_id
      LEFT JOIN models m ON m.model_id = km.model_id
      ORDER BY k.kit_id DESC
    `);

    const kitsMap = {};

    rows.forEach((row) => {
      if (!kitsMap[row.kit_id]) {
        kitsMap[row.kit_id] = {
          kit_id: row.kit_id,
          kit_name: row.kit_name,
          description: row.kit_description,
          kit_price: row.kit_price,
          status: row.status,
          created_at: row.created_at,
          cat_id: row.cat_id,
          cat_name: row.cat_name,
          items: [],
        };
      }

      if (row.kmap_id) {
        kitsMap[row.kit_id].items.push({
          kmap_id: row.kmap_id,
          qty: row.qty,

          product_type_id: row.product_type_id,
          product_type_name: row.product_type_name,

          brand_id: row.brand_id,
          brand_name: row.brand_name,

          model_id: row.model_id,
          model_no: row.model_no,
          model_price: row.price,
          model_description: row.model_description,
        });
      }
    });

    res.status(200).json(Object.values(kitsMap));
  } catch (error) {
    console.error('❌ Error fetching kits:', error);
    res.status(500).json({ message: 'Failed to fetch kits' });
  }
};

export const getProductsByCategory = async (req, res) => {
  const { cat_id } = req.params;

  if (!cat_id) {
    return res.status(400).json({ error: 'cat_id is required' });
  }

  try {
    const [productTypes] = await db.execute(
      `
      SELECT 
        pt.product_type_id,
        pt.product_type_name,
        pt.cat_id,
        c.cat_name
      FROM product_types pt
      INNER JOIN category c ON c.cat_id = pt.cat_id
      WHERE pt.cat_id = ?
        AND pt.status = 'active'
      ORDER BY pt.product_type_id DESC
      `,
      [cat_id],
    );

    if (productTypes.length === 0) {
      return res.status(200).json([]);
    }

    const productTypeIds = productTypes.map((pt) => pt.product_type_id);

    const [brands] = await db.execute(
      `
      SELECT 
        b.brand_id,
        b.brand_name,
        b.product_type_id
      FROM brands b
      WHERE b.product_type_id IN (${productTypeIds.map(() => '?').join(',')})
      `,
      productTypeIds,
    );

    const brandIds = brands.map((b) => b.brand_id);

    let models = [];
    if (brandIds.length > 0) {
      const [rows] = await db.execute(
        `
        SELECT 
          m.model_id,
          m.brand_id,
          m.model_no,
          m.description,
          m.price,      
          m.image_path
        FROM models m
        WHERE m.brand_id IN (${brandIds.map(() => '?').join(',')})
        `,
        brandIds,
      );
      models = rows;
    }

    // 4️⃣ Build nested response
    const result = productTypes.map((pt) => ({
      product_type_id: pt.product_type_id,
      product_type_name: pt.product_type_name,
      cat_id: pt.cat_id,
      cat_name: pt.cat_name,
      brands: brands
        .filter((b) => b.product_type_id === pt.product_type_id)
        .map((b) => ({
          brand_id: b.brand_id,
          brand_name: b.brand_name,
          models: models
            .filter((m) => m.brand_id === b.brand_id)
            .map((m) => ({
              model_id: m.model_id,
              model_no: m.model_no,
              description: m.description,
              price: m.price,
              image_path: m.image_path,
            })),
        })),
    }));

    return res.status(200).json(result);
  } catch (err) {
    console.error('❌ getProductsByCategory Error:', err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

export const getKitById = async (req, res) => {
  const { id } = req.params;

  try {
    // 1️⃣ Kit master
    const [kitRows] = await db.query(
      `SELECT 
         kit_id,
         kit_name,
         description,
         cat_id,
         status,
         kit_price
       FROM kit
       WHERE kit_id = ?`,
      [id],
    );

    if (!kitRows.length) {
      return res.status(404).json({ message: 'Kit not found' });
    }

    // 2️⃣ Kit items with NAMES
    const [items] = await db.query(
      `SELECT 
         km.kmap_id,
         km.product_type_id,
         pt.product_type_name,
         km.brand_id,
         b.brand_name,
         km.model_id,
         m.model_no,
         m.price,
         km.qty
       FROM kit_mapping km
       LEFT JOIN product_types pt 
         ON pt.product_type_id = km.product_type_id
       LEFT JOIN brands b 
         ON b.brand_id = km.brand_id
       LEFT JOIN models m 
         ON m.model_id = km.model_id
       WHERE km.kit_id = ?`,
      [id],
    );

    res.json({
      ...kitRows[0],
      items,
    });
  } catch (err) {
    console.error('❌ getKitById Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const toggleKitStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['active', 'inactive'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  const connection = await db.getConnection();

  try {
    await connection.query(`UPDATE kit SET status = ? WHERE kit_id = ?`, [
      status,
      id,
    ]);

    res
      .status(200)
      .json({ message: `Kit status updated to ${status}`, kit_id: id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    connection.release();
  }
};

export const getProductsAndKitsByCategory = async (req, res) => {
  try {
    const { cat_id } = req.params;

    if (!cat_id) {
      return res.status(400).json({ message: 'Category ID is required' });
    }

    /* ---------------- PRODUCTS ---------------- */
    const [products] = await db.query(
      `
      SELECT 
        product_type_id,
        product_type_name,
        quotation_type
      FROM product_types
      WHERE cat_id = ?
        AND status = 'active'
      ORDER BY product_type_name
      `,
      [cat_id],
    );

    /* ---------------- KITS WITH FULL DETAILS ---------------- */
    const [rows] = await db.query(
      `
      SELECT 
        k.kit_id,
        k.kit_name,
        k.description AS kit_description,
        k.kit_price,

        km.kmap_id,
        km.qty,

        pt.product_type_id,
        pt.product_type_name,

        b.brand_id,
        b.brand_name,

        m.model_id,
        m.model_no,
        m.description AS model_description,
        m.price,
        m.image_path

      FROM kit k
      LEFT JOIN kit_mapping km 
        ON km.kit_id = k.kit_id

      LEFT JOIN product_types pt 
        ON pt.product_type_id = km.product_type_id

      LEFT JOIN brands b 
        ON b.brand_id = km.brand_id
        AND b.status = 'active'

      LEFT JOIN models m 
        ON m.model_id = km.model_id
        AND m.status = 'active'

      WHERE k.cat_id = ?
        AND k.status = 'active'

      ORDER BY k.kit_id DESC
      `,
      [cat_id],
    );

    /* ---------------- TRANSFORM DATA ---------------- */
    const kitsMap = {};

    rows.forEach((row) => {
      if (!kitsMap[row.kit_id]) {
        kitsMap[row.kit_id] = {
          kit_id: row.kit_id,
          kit_name: row.kit_name,
          description: row.kit_description,
          kit_price: row.kit_price,
          items: [],
        };
      }

      if (row.kmap_id) {
        kitsMap[row.kit_id].items.push({
          kmap_id: row.kmap_id,
          qty: row.qty,

          product_type_id: row.product_type_id,
          product_type_name: row.product_type_name,

          brand_id: row.brand_id,
          brand_name: row.brand_name,

          model_id: row.model_id,
          model: row.model_no,
          model_description: row.model_description,
          price: row.price,
          image: row.image_path,
        });
      }
    });

    res.status(200).json({
      products,
      kits: Object.values(kitsMap),
    });
  } catch (error) {
    console.error('❌ Error fetching products & kits:', error);
    res.status(500).json({ message: 'Server error' });
  }
};



export const createQuotation = async (req, res) => {
  const connection = await db.getConnection();
  try {
    // session user
    const user = req.session?.user;
    if (!user) return res.status(401).json({ message: "User not authenticated" });

    const created_by = user.id; // get user_id from session

    const {
      qt_number,
      type,
      master_id = null,
      items = [],
      additional_prices = [],
      gst_percent = 18,
    } = req.body;

    if (!qt_number || !type || items.length === 0) {
      return res.status(400).json({
        message: "qt_number, type and items required",
      });
    }

    await connection.beginTransaction();

    // ---- CALCULATE TOTAL ----
    let totalQuotationItemsPrice = 0;
    let totalAdditionalPrice = 0;

    for (const item of items) {
      const { products = [], kit_qty = 1, kit_id } = item;

      for (const p of products) {
        const price = Number(p.model_price || 0);
        const qty = Number(p.model_qty || 0);
        const multiplier = kit_id ? Number(kit_qty) : 1;
        totalQuotationItemsPrice += price * qty * multiplier;
      }
    }

    if (additional_prices?.length > 0) {
      for (const a of additional_prices) {
        totalAdditionalPrice += Number(a.price || 0);
      }
    }

    const baseTotal = totalQuotationItemsPrice + totalAdditionalPrice;

    const withGSTValue = type === "with_gst" ? baseTotal * (1 + gst_percent / 100) : 0;
    const withoutGSTValue = type === "without_gst" ? baseTotal : 0;

    // ---- INSERT QUOTATION HEADER ----
    const [qInsert] = await connection.query(
      `INSERT INTO quotation 
        (qt_number, type, master_id, total_price, without_gst_total, with_gst_total, created_flag, created_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        qt_number,
        type,
        master_id,
        baseTotal,
        withoutGSTValue,
        withGSTValue,
        1,          // created_flag
        created_by  // from session
      ]
    );

    const qtId = qInsert.insertId;

    // ---- INSERT LINE ITEMS ----
    for (const item of items) {
      const {
        cat_id,
        kit_id = null,
        kit_qty = 1,
        products = [],
        current_revision = 1,
      } = item;

      for (const p of products) {
        await connection.query(
          `INSERT INTO quotation_mapped
           (qt_id, cat_id, kit_id, model_id, kit_qty, model_qty, model_price, current_revision, created_by, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
          [
            qtId,
            cat_id,
            kit_id,
            p.model_id,
            kit_id ? Number(kit_qty) : 1,
            Number(p.model_qty || 0),
            Number(p.model_price || 0),
            current_revision,
            created_by
          ]
        );
      }
    }

    // ---- INSERT ADDITIONAL PRICES (optional store created_by) ----
    if (additional_prices?.length > 0) {
      for (const a of additional_prices) {
        await connection.query(
          `INSERT INTO additional_price
           (qt_id, add_price_name, price,  created_at)
           VALUES (?, ?, ?,  NOW())`,
          [qtId, a.add_price_name, a.price, created_by]
        );
      }
    }

    await connection.commit();

    res.json({ message: "Quotation Created", qt_id: qtId });

  } catch (err) {
    await connection.rollback();
    console.error("Quotation Create Error:", err);
    res.status(500).json({ message: err.message });
  } finally {
    connection.release();
  }
};


export const getQuotationByMasterId1 = async (req, res) => {
  const { master_id } = req.params;

  if (!master_id) {
    return res.status(400).json({ message: 'master_id is required' });
  }

  const connection = await db.getConnection();

  try {
    // 👉 Fetch basic raw_data info (name, number, city)
    const [[leadInfo]] = await connection.query(
      `SELECT name, number, city
       FROM raw_data
       WHERE master_id = ?`,
      [master_id]
    );

    // 1️⃣ Fetch all quotations for this master_id
    const [quotations] = await connection.query(
      `SELECT qt.qt_id, qt.master_id, qt.qt_desc, qt.total_price, qt.total_kit_price, qt.created_at
       FROM quotation qt
       WHERE qt.master_id = ?`,
      [master_id]
    );

    if (!quotations.length) {
      return res.status(404).json({ message: 'No quotations found for this lead' });
    }

    // 2️⃣ For each quotation, fetch mapped kits & kit items
    for (let qt of quotations) {

      // a) Kits mapped to this quotation
      const [mappedKits] = await connection.query(
        `SELECT qm.qm_id, qm.cat_id, qm.kit_id, qm.kit_qty,
                k.kit_name, k.kit_price, k.description
         FROM quotation_mapped qm
         JOIN kit k ON k.kit_id = qm.kit_id
         WHERE qm.qt_id = ?`,
        [qt.qt_id]
      );

      // b) Items inside kit (models, brand...)
      for (let kit of mappedKits) {
        const [kitItems] = await connection.query(
          `SELECT km.kmap_id, km.qty AS kit_item_qty,
                  m.model_id, m.model_no, m.price AS model_price, m.image_path, m.description AS model_description,
                  b.brand_id, b.brand_name
           FROM kit_mapping km
           JOIN models m ON m.model_id = km.model_id
           JOIN brands b ON b.brand_id = m.brand_id
           WHERE km.kit_id = ?`,
          [kit.kit_id]
        );

        kit.items = kitItems;
      }

      qt.kits = mappedKits;

      // 3️⃣ Additional Prices
      const [additionalPrices] = await connection.query(
        `SELECT add_id, add_price_name, price
         FROM additional_price
         WHERE qt_id = ?`,
        [qt.qt_id]
      );

      qt.additional_prices = additionalPrices;
    }

    return res.status(200).json({
      master_id,
      lead: leadInfo || null, // 👉 name, number, city
      quotations
    });

  } catch (error) {
    console.error('❌ Get Quotation By Master ID Error:', error);
    return res.status(500).json({ message: 'Failed to fetch quotation details' });
  } finally {
    connection.release();
  }
};


export const getQuotationByMasterId = async (req, res) => {
  const { master_id } = req.params;

  if (!master_id) {
    return res.status(400).json({ message: "master_id is required" });
  }

  const connection = await db.getConnection();

  try {
    // Lead info
    const [[lead]] = await connection.query(
      `SELECT name, number, city FROM raw_data WHERE master_id = ?`,
      [master_id]
    );

    // Quotations
    const [quotations] = await connection.query(
      `SELECT qt_id, master_id, qt_number, type, total_price, without_gst_total, with_gst_total, created_at
       FROM quotation
       WHERE master_id = ?`,
      [master_id]
    );

    if (!quotations.length) {
      return res.status(404).json({ message: "No quotations found" });
    }

    for (let qt of quotations) {
      // Fetch mapped items grouped by kit
 // Fetch mapped items grouped by kit
const [mapped] = await connection.query(
  `SELECT 
      qm.qm_id,
      qm.qt_id,
      qm.cat_id,
      qm.kit_id,
      k.kit_name,          -- ADDED kit_name
      qm.model_id,
      qm.kit_qty,
      qm.model_qty,
      qm.model_price,
      m.model_no AS model,
      m.price AS model_unit_price,
      m.image_path,
      m.description AS model_description,
      b.brand_id,
      b.brand_name,
      pt.product_type_id,
      pt.product_type_name
   FROM quotation_mapped qm
   LEFT JOIN kit k ON k.kit_id = qm.kit_id    -- JOIN kit table
   JOIN models m ON m.model_id = qm.model_id
   LEFT JOIN brands b ON b.brand_id = m.brand_id
   LEFT JOIN product_types pt ON pt.product_type_id = (
       SELECT product_type_id 
       FROM kit_mapping 
       WHERE model_id = qm.model_id 
       LIMIT 1
   )
   WHERE qm.qt_id = ?
   ORDER BY qm.kit_id`,
  [qt.qt_id]
);


      // Group by kit_id
      const kitsMap = {};

      for (let row of mapped) {
        if (!kitsMap[row.kit_id]) {
          kitsMap[row.kit_id] = {
            qm_id: row.qm_id,
            cat_id: row.cat_id,
            kit_id: row.kit_id,
             kit_name: row.kit_name, 
            kit_qty: row.kit_qty,
            items: []
          };
        }

        kitsMap[row.kit_id].items.push({
          model_id: row.model_id,
          model: row.model,
          prod_qty: row.model_qty,
          prod_price: row.model_price,
          kit_qty: row.kit_qty,
          brand_id: row.brand_id,
          brand_name: row.brand_name,
          product_type_id: row.product_type_id,
          product_type_name: row.product_type_name,
          image_path: row.image_path,
          model_description: row.model_description
        });
      }

      qt.kits = Object.values(kitsMap);

      // Additional prices
      const [additionalPrices] = await connection.query(
        `SELECT add_id, add_price_name, price
         FROM additional_price
         WHERE qt_id = ?`,
        [qt.qt_id]
      );

      qt.additional_prices = additionalPrices;
    }

    return res.status(200).json({
      master_id,
      lead: lead || null,
      quotations
    });

  } catch (error) {
    console.error("❌ getQuotationByMasterId Error:", error);
    return res.status(500).json({ message: "Failed to fetch quotation details" });
  } finally {
    connection.release();
  }
};