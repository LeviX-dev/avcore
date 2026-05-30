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
export const categoryList1 = async (req, res) => {
  try {
    const category = await getCategories();
    // console.log('Users fetched from DB:', category); 
    res.status(200).json(category);
  } catch (error) {
    console.error('Error fetching categories:', error); 
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

// show category list controller (excludes Customised Quotation categories)
export const categoryList = async (req, res) => {
  try {
    const category = await getCategories();
    
    // Filter out categories that contain both "Customised" and "Quotation"
    const filteredCategories = category.filter(category => {
      const catName = category.cat_name || '';
      // Exclude if it contains both "Customised" AND "Quotation"
      return !(catName.includes('Customised') && catName.includes('Quotation'));
    });
    
    res.status(200).json(filteredCategories);
  } catch (error) {
    console.error('Error fetching categories:', error); 
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

// Add this controller function after your existing categoryList controller

// Get only Customised Quotation categories
export const customisedCategoryList = async (req, res) => {
  try {
    const categories = await getCategories();
    
    // Filter categories that contain both "Customised" and "Quotation" in their name
    const customisedCategories = categories.filter(category => {
      const catName = category.cat_name || '';
      return catName.includes('Customised') && catName.includes('Quotation');
    });
    
    console.log('Customised categories fetched:', customisedCategories); 
    res.status(200).json(customisedCategories);
  } catch (error) {
    console.error('Error fetching customised categories:', error); 
    res.status(500).json({ error: 'Failed to fetch customised categories' });
  }
};


// Add this controller
export const getAllCategories = async (req, res) => {
  try {
    const categories = await getCategories();
    
    // Filter regular categories (excludes Customised Quotation)
    const regularCategories = categories.filter(category => {
      const catName = category.cat_name || '';
      return !(catName.includes('Customised') && catName.includes('Quotation'));
    });
    
    // Filter Customised Quotation categories
    const customisedCategories = categories.filter(category => {
      const catName = category.cat_name || '';
      return catName.includes('Customised') && catName.includes('Quotation');
    });
    
    // Return both in a single response
    res.status(200).json({
      success: true,
      regularCategories: regularCategories,
      customisedCategories: customisedCategories,
      allCategories: categories, // This shows ALL categories
      counts: {
        regular: regularCategories.length,
        customised: customisedCategories.length,
        total: categories.length
      }
    });
    
  } catch (error) {
    console.error('Error fetching all categories:', error); 
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch categories' 
    });
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




// ==================== PRODUCT CONTROLLERS ====================

// Get all products with complete nested structure
export const getProductsFull = async (req, res) => {
  try {
    // FETCH PRODUCT TYPES WITH CATEGORY
    const [productTypes] = await db.execute(`
      SELECT 
        pt.product_type_id,
        pt.product_type_name,
        pt.quotation_type,
        pt.cat_id,
        c.cat_name,
        pt.status,
        pt.created_at
      FROM product_types pt
      LEFT JOIN category c ON c.cat_id = pt.cat_id
      ORDER BY pt.product_type_id DESC
    `);

    if (productTypes.length === 0) {
      return res.status(200).json([]);
    }

    const productTypeIds = productTypes.map((pt) => pt.product_type_id).filter(id => id);

    // FETCH BRANDS
    let brands = [];
    if (productTypeIds.length > 0) {
      const [brandRows] = await db.execute(
        `SELECT 
          b.brand_id,
          b.brand_name,
          b.product_type_id
        FROM brands b
        WHERE b.product_type_id IN (${productTypeIds.map(() => '?').join(',')})`,
        productTypeIds,
      );
      brands = brandRows;
    }

    const brandIds = brands.map((b) => b.brand_id).filter(id => id);

    // FETCH MODELS
    let models = [];
    if (brandIds.length > 0) {
      const [rows] = await db.execute(
        `SELECT 
          m.model_id,
          m.brand_id,
          m.model_no,
          m.description,
          m.price,
          m.image_path,
          m.status
        FROM models m
        WHERE m.brand_id IN (${brandIds.map(() => '?').join(',')})`,
        brandIds,
      );
      models = rows;
    }

    // BUILD NESTED RESPONSE
    const result = productTypes.map((pt) => ({
      product_type_id: pt.product_type_id,
      product_type_name: pt.product_type_name,
      quotation_type: pt.quotation_type,
      cat_id: pt.cat_id || null,
      cat_name: pt.cat_name || '-',
      status: pt.status,
      created_at: pt.created_at,
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

// Get specific product type with all details
export const getProductTypeDetails = async (req, res) => {
  try {
    const { product_type_id } = req.params;

    // Get product type with category info
    const [productTypes] = await db.execute(
      `SELECT 
        pt.*, 
        c.cat_name 
      FROM product_types pt
      LEFT JOIN category c ON c.cat_id = pt.cat_id
      WHERE pt.product_type_id = ?`,
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
        `SELECT * FROM models WHERE brand_id IN (${brandIds.map(() => '?').join(',')})`,
        brandIds,
      );
      models = rows;
    }

    // Build nested structure with cat_id and cat_name
    const result = {
      product_type_id: productType.product_type_id,
      product_type_name: productType.product_type_name,
      quotation_type: productType.quotation_type,
      cat_id: productType.cat_id,
      cat_name: productType.cat_name || '-',
      status: productType.status,
      created_at: productType.created_at,
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

// Create full product (type + brands + models)
export const addProductFull = async (req, res) => {
  try {
    console.log('RAW BODY ===>', req.body);
    console.log('FILES ===>', req.files);

    const { product_type_name, quotation_type, other_quotation_type, cat_id } = req.body;

    if (!product_type_name) {
      return res.status(400).json({ error: 'product_type_name is required' });
    }

    if (!cat_id) {
      return res.status(400).json({ error: 'cat_id is required' });
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

    // CREATE PRODUCT TYPE
    const [pt] = await db.execute(
      `INSERT INTO product_types (product_type_name, quotation_type, cat_id, status) 
       VALUES (?, ?, ?, 'active')`,
      [product_type_name, finalQuotationType, cat_id],
    );

    const product_type_id = pt.insertId;

    // LOOP BRANDS
    for (const brand of brands) {
      if (!brand.brand_name) continue;

      const [br] = await db.execute(
        `INSERT INTO brands (brand_name, product_type_id) VALUES (?, ?)`,
        [brand.brand_name, product_type_id],
      );

      const brand_id = br.insertId;

      // LOOP MODELS
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
            (brand_id, model_no, description, price, image_path, status)
           VALUES (?, ?, ?, ?, ?, 'active')`,
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
      product_type_id: product_type_id,
    });
  } catch (err) {
    console.error('❌ addProductFull Error:', err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// Update product (preserves existing data where not changed)
export const updateProductFull = async (req, res) => {
  const { product_type_id } = req.params;

  try {
    const { product_type_name, quotation_type, other_quotation_type, cat_id } = req.body;

    if (!product_type_name) {
      return res.status(400).json({
        error: 'product_type_name is required',
      });
    }

    if (!cat_id) {
      return res.status(400).json({
        error: 'cat_id is required',
      });
    }

    if (!quotation_type) {
      return res.status(400).json({
        error: 'quotation_type is required',
      });
    }

    const finalQuotationType =
      quotation_type === 'Other' && other_quotation_type
        ? other_quotation_type
        : quotation_type;

    if (!req.body.brands) {
      return res.status(400).json({
        error: 'brands is required',
      });
    }

    let brands;
    try {
      brands = JSON.parse(req.body.brands);
    } catch (e) {
      return res.status(400).json({
        error: 'brands must be valid JSON',
      });
    }

    if (!Array.isArray(brands) || brands.length === 0) {
      return res.status(400).json({
        error: 'brands must be a non-empty array',
      });
    }

    // FETCH EXISTING MODELS
    const [existingModels] = await db.execute(
      `SELECT 
          m.model_id,
          m.image_path,
          m.description,
          m.price,
          m.brand_id
       FROM models m
       INNER JOIN brands b ON m.brand_id = b.brand_id
       WHERE b.product_type_id = ?`,
      [product_type_id]
    );

    const existingModelMap = new Map();
    existingModels.forEach((model) => {
      existingModelMap.set(model.model_id, model);
    });

    // UPDATE PRODUCT TYPE
    await db.execute(
      `UPDATE product_types
       SET
         product_type_name = ?,
         quotation_type = ?,
         cat_id = ?
       WHERE product_type_id = ?`,
      [
        product_type_name,
        finalQuotationType,
        cat_id,
        product_type_id,
      ]
    );

    // PARSE MODEL POSITIONS
    let modelPositions = [];
    if (req.body.model_positions) {
      try {
        modelPositions = JSON.parse(req.body.model_positions);
      } catch (e) {
        console.log('Failed to parse model_positions');
      }
    }

    // GET UPLOADED IMAGES
    let uploadedImages = [];
    if (req.files && req.files['model_images[]']) {
      uploadedImages = req.files['model_images[]'];
      if (!Array.isArray(uploadedImages)) {
        uploadedImages = [uploadedImages];
      }
    }

    // GET EXISTING BRANDS TO COMPARE
    const [existingBrands] = await db.execute(
      `SELECT brand_id, brand_name FROM brands WHERE product_type_id = ?`,
      [product_type_id]
    );
    const existingBrandMap = new Map();
    existingBrands.forEach(brand => {
      existingBrandMap.set(brand.brand_id, brand);
    });

    // TRACK BRANDS TO DELETE (those not in incoming data)
    const incomingBrandIds = brands.filter(b => b.brand_id).map(b => b.brand_id);
    const brandsToDelete = existingBrands.filter(b => !incomingBrandIds.includes(b.brand_id));

    // DELETE MODELS FOR BRANDS THAT WILL BE REMOVED
    for (const brandToDelete of brandsToDelete) {
      // Get models for this brand to delete images
      const [modelsToDelete] = await db.execute(
        `SELECT image_path FROM models WHERE brand_id = ?`,
        [brandToDelete.brand_id]
      );
      
      for (const model of modelsToDelete) {
        if (model.image_path) {
          const filePath = path.join(process.cwd(), model.image_path);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      }
      
      await db.execute(
        `DELETE FROM models WHERE brand_id = ?`,
        [brandToDelete.brand_id]
      );
    }

    // DELETE BRANDS THAT ARE REMOVED
    if (brandsToDelete.length > 0) {
      await db.execute(
        `DELETE FROM brands WHERE brand_id IN (${brandsToDelete.map(() => '?').join(',')})`,
        brandsToDelete.map(b => b.brand_id)
      );
    }

    // UPDATE / INSERT BRANDS + MODELS
    for (const brand of brands) {
      if (!brand.brand_name) continue;

      let brand_id = brand.brand_id;

      // UPDATE EXISTING BRAND OR INSERT NEW
      if (brand_id && existingBrandMap.has(brand_id)) {
        await db.execute(
          `UPDATE brands SET brand_name = ? WHERE brand_id = ?`,
          [brand.brand_name, brand_id]
        );
      } else if (brand_id && !existingBrandMap.has(brand_id)) {
        // This shouldn't happen, but just in case, insert it
        const [br] = await db.execute(
          `INSERT INTO brands (brand_name, product_type_id) VALUES (?, ?)`,
          [brand.brand_name, product_type_id]
        );
        brand_id = br.insertId;
      } else {
        // INSERT NEW BRAND
        const [br] = await db.execute(
          `INSERT INTO brands (brand_name, product_type_id) VALUES (?, ?)`,
          [brand.brand_name, product_type_id]
        );
        brand_id = br.insertId;
      }

      // GET EXISTING MODELS FOR THIS BRAND
      const [existingModelsForBrand] = await db.execute(
        `SELECT model_id, model_no, description, price, image_path FROM models WHERE brand_id = ?`,
        [brand_id]
      );
      const existingModelMapForBrand = new Map();
      existingModelsForBrand.forEach(model => {
        existingModelMapForBrand.set(model.model_id, model);
      });

      // TRACK MODELS TO KEEP
      const incomingModelIds = brand.models.filter(m => m.model_id).map(m => m.model_id);
      const modelsToDelete = existingModelsForBrand.filter(m => !incomingModelIds.includes(m.model_id));

      // DELETE MODELS THAT ARE REMOVED
      if (modelsToDelete.length > 0) {
        // Delete image files for removed models
        for (const modelToDelete of modelsToDelete) {
          if (modelToDelete.image_path) {
            const filePath = path.join(process.cwd(), modelToDelete.image_path);
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
          }
        }
        await db.execute(
          `DELETE FROM models WHERE model_id IN (${modelsToDelete.map(() => '?').join(',')})`,
          modelsToDelete.map(m => m.model_id)
        );
      }

      // PROCESS MODELS
      for (let idx = 0; idx < (brand.models || []).length; idx++) {
        const model = brand.models[idx];
        let savedImagePath = null;

        // CHECK FOR NEW IMAGE UPLOAD
        const matchingPosition = modelPositions.find(
          (pos) => pos.brandIndex === brand.brand_index && pos.modelIndex === idx
        );

        if (matchingPosition && uploadedImages.length > 0) {
          const imageIndex = modelPositions.findIndex(
            (pos) => pos.brandIndex === brand.brand_index && pos.modelIndex === idx
          );

          if (imageIndex !== -1 && uploadedImages[imageIndex]) {
            const img = uploadedImages[imageIndex];
            const fileName = `${Date.now()}_${img.name}`;
            const uploadDir = path.join(__dirname, '../uploads');

            if (!fs.existsSync(uploadDir)) {
              fs.mkdirSync(uploadDir);
            }

            const fullPath = path.join(uploadDir, fileName);
            await img.mv(fullPath);
            savedImagePath = `/uploads/${fileName}`;

            // Delete old image if exists
            if (model.model_id && existingModelMapForBrand.get(model.model_id)?.image_path) {
              const oldImagePath = path.join(process.cwd(), existingModelMapForBrand.get(model.model_id).image_path);
              if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
              }
            }
          }
        }

        // UPDATE OR INSERT MODEL
        if (model.model_id && existingModelMapForBrand.has(model.model_id)) {
          const existingModel = existingModelMapForBrand.get(model.model_id);
          
          if (!savedImagePath) {
            savedImagePath = existingModel?.image_path || null;
          }

          await db.execute(
            `UPDATE models
             SET
               model_no = ?,
               description = ?,
               price = ?,
               image_path = ?
             WHERE model_id = ?`,
            [
              model.model_no || '',
              model.description || '',
              model.price || null,
              savedImagePath,
              model.model_id,
            ]
          );
        } else {
          // INSERT NEW MODEL
          await db.execute(
            `INSERT INTO models
              (brand_id, model_no, description, price, image_path, status)
             VALUES (?, ?, ?, ?, ?, 'active')`,
            [
              brand_id,
              model.model_no || '',
              model.description || '',
              model.price || null,
              savedImagePath || null,
            ]
          );
        }
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

// Delete product entity (model, brand, or product type)
export const deleteProductEntity = async (req, res) => {
  try {
    const { entity, id } = req.params;
    const safeId = Number(id);

    if (!entity || isNaN(safeId)) {
      return res.status(400).json({ success: false, error: 'Invalid request' });
    }

    console.log('🟡 Delete requested →', entity, 'ID:', safeId);

    // DELETE MODEL
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

    // DELETE BRAND (models cascade)
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

      await db.execute('DELETE FROM models WHERE brand_id = ?', [safeId]);
      await db.execute('DELETE FROM brands WHERE brand_id = ?', [safeId]);

      return res.json({
        success: true,
        message: 'Brand (and its models) deleted successfully',
        deleted: { type: 'brand', id: safeId },
      });
    }

    // DELETE PRODUCT TYPE (brands + models cascade)
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

      // Delete models first
      await db.execute(
        `DELETE m FROM models m 
         INNER JOIN brands b ON m.brand_id = b.brand_id
         WHERE b.product_type_id = ?`,
        [safeId]
      );
      
      // Delete brands
      await db.execute(`DELETE FROM brands WHERE product_type_id = ?`, [safeId]);
      
      // Delete product type
      await db.execute('DELETE FROM product_types WHERE product_type_id = ?', [safeId]);

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

// ==================== STEP-BY-STEP CONTROLLERS ====================

// Step 1: Create product type only
export const addProductTypeOnly = async (req, res) => {
  try {
    const { product_type_name, quotation_type, other_quotation_type, cat_id } = req.body;

    // Validation
    if (!product_type_name) {
      return res.status(400).json({ error: 'product_type_name is required' });
    }

    if (!cat_id) {
      return res.status(400).json({ error: 'cat_id is required' });
    }

    if (!quotation_type) {
      return res.status(400).json({ error: 'quotation_type is required' });
    }

    const finalQuotationType =
      quotation_type === 'Other' && other_quotation_type
        ? other_quotation_type
        : quotation_type;

    // Insert product type
    const [pt] = await db.execute(
      `INSERT INTO product_types 
        (product_type_name, quotation_type, cat_id, status) 
       VALUES (?, ?, ?, 'active')`,
      [product_type_name, finalQuotationType, cat_id],
    );

    return res.status(201).json({
      success: true,
      message: 'Product type created successfully',
      product_type_id: pt.insertId,
      product_type_name,
      quotation_type: finalQuotationType,
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

    // Clean price (remove commas)
    const cleanPrice = Number(price.toString().replace(/,/g, ''));

    if (isNaN(cleanPrice)) {
      return res.status(400).json({ error: 'Invalid price format' });
    }

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
        (brand_id, model_no, description, price, image_path, status)
       VALUES (?, ?, ?, ?, ?, 'active')`,
      [
        brand_id,
        model_no,
        description || '',
        cleanPrice,
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

// Update brand
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

// export const createQuotation = async (req, res) => {
//   const connection = await db.getConnection();
//   try {
//     const user = req.session?.user;
//     if (!user)
//       return res.status(401).json({ message: 'User not authenticated' });

//     const created_by = user.id;

//     const {
//       qt_number,
//       type,
//       master_id = null,
//       items = [],
//       additional_prices = [],
//       gst_percent = 18,
//     } = req.body;

//     if (!qt_number || !type || items.length === 0) {
//       return res.status(400).json({
//         message: 'qt_number, type and items required',
//       });
//     }

//     await connection.beginTransaction();

//     // ---- CALCULATE TOTAL ----
//     let totalQuotationItemsPrice = 0;
//     let totalAdditionalPrice = 0;

//     for (const item of items) {
//       const { products = [], kit_qty = 1, kit_id } = item;

//       for (const p of products) {
//         const price = Number(p.model_price || 0);
//         const qty = Number(p.model_qty || 0);
//         const multiplier = kit_id ? Number(kit_qty) : 1;
//         totalQuotationItemsPrice += price * qty * multiplier;
//       }
//     }

//     if (additional_prices?.length > 0) {
//       for (const a of additional_prices) {
//         totalAdditionalPrice += Number(a.price || 0);
//       }
//     }

//     const baseTotal = totalQuotationItemsPrice + totalAdditionalPrice;

//     const withGSTValue = type === 'with_gst'
//       ? baseTotal * (1 + gst_percent / 100)
//       : 0;

//     const withoutGSTValue = type === 'without_gst'
//       ? baseTotal
//       : 0;

//     // ---- INSERT QUOTATION HEADER ----
//     const [qInsert] = await connection.query(
//       `INSERT INTO quotation
//         (qt_number, type, master_id, total_price, without_gst_total, with_gst_total, created_flag, created_by, created_at)
//        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
//       [
//         qt_number,
//         type,
//         master_id,
//         baseTotal,
//         withoutGSTValue,
//         withGSTValue,
//         1,
//         created_by,
//       ]
//     );

//     const qtId = qInsert.insertId;

//     // ---- INSERT REVISION ENTRY ----
//     const revisionNo = 1;

//     const [revInsert] = await connection.query(
//       `INSERT INTO quotation_revision
//          (qt_id, revision, total_without_gst, total_with_gst, created_at)
//        VALUES (?, ?, ?, ?, NOW())`,
//       [
//         qtId,
//         revisionNo,
//         withoutGSTValue,
//         withGSTValue,
//       ]
//     );

//     const revId = revInsert.insertId;

//     // ---- INSERT LINE ITEMS ----
//     for (const item of items) {
//       const {
//         cat_id,
//         kit_id = null,
//         kit_qty = 1,
//         products = [],
//       } = item;

//       for (const p of products) {
//         await connection.query(
//           `INSERT INTO quotation_mapped
//              (qt_id, cat_id, kit_id, model_id, kit_qty, model_qty, model_price, current_revision, created_by, created_at)
//            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
//           [
//             qtId,
//             cat_id,
//             kit_id,
//             p.model_id,
//             kit_id ? Number(kit_qty) : 1,
//             Number(p.model_qty || 0),
//             Number(p.model_price || 0),
//             revisionNo,
//             created_by,
//           ]
//         );
//       }
//     }

//     // ---- INSERT ADDITIONAL PRICE ----
//     if (additional_prices?.length > 0) {
//       for (const a of additional_prices) {
//         await connection.query(
//           `INSERT INTO additional_price
//              (qt_id, add_price_name, price, created_at)
//            VALUES (?, ?, ?, NOW())`,
//           [
//             qtId,
//             a.add_price_name,
//             a.price
//           ]
//         );
//       }
//     }

//     await connection.commit();

//     res.json({
//       message: 'Quotation Created',
//       qt_id: qtId,
//       revision: revisionNo,
//       rev_id: revId
//     });

//   } catch (err) {
//     await connection.rollback();
//     console.error('Quotation Create Error:', err);
//     res.status(500).json({ message: err.message });
//   } finally {
//     connection.release();
//   }
// };

export const createQuotation1 = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const user = req.session?.user;
    if (!user)
      return res.status(401).json({ message: 'User not authenticated' });

    const created_by = user.id;

    const {
      type,
      master_id = null,
      items = [],
      additional_prices = [],
      gst_percent = 18,
    } = req.body;

    if (!type || items.length === 0) {
      return res.status(400).json({
        message: 'type and items required',
      });
    }

    await connection.beginTransaction();

    // Get next auto increment to prebuild qt_number
    const [[ai]] = await connection.query(
      `SELECT AUTO_INCREMENT FROM INFORMATION_SCHEMA.TABLES 
       WHERE TABLE_NAME = 'quotation'`,
    );

    const nextId = ai.AUTO_INCREMENT;
    const qt_number = `QT${nextId.toString().padStart(6, '0')}`;

    // ---- TOTALS ----
    let totalItems = 0,
      totalAdditional = 0;

    for (const item of items) {
      const { products = [], kit_qty = 1, kit_id } = item;
      for (const p of products) {
        totalItems +=
          Number(p.model_price || 0) *
          Number(p.model_qty || 0) *
          (kit_id ? Number(kit_qty) : 1);
      }
    }

    for (const a of additional_prices) {
      totalAdditional += Number(a.price || 0);
    }

    const baseTotal = totalItems + totalAdditional;

    const withGSTValue =
      type === 'with_gst' ? baseTotal * (1 + gst_percent / 100) : 0;
    const withoutGSTValue = type === 'without_gst' ? baseTotal : 0;

    // ---- INSERT HEADER ----
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
        1,
        created_by,
      ],
    );

    const qtId = qInsert.insertId;

    // ---- REVISION ----
    const revNo = 1;
    const [revInsert] = await connection.query(
      `INSERT INTO quotation_revision
         (qt_id, revision, total_without_gst, total_with_gst, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [qtId, revNo, withoutGSTValue, withGSTValue],
    );

    const revId = revInsert.insertId;

    // ---- LINE ITEMS ----
    for (const item of items) {
      const { cat_id, kit_id = null, kit_qty = 1, products = [] } = item;
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
            revNo,
            created_by,
          ],
        );
      }
    }

    // ---- ADDITIONAL PRICES ----
    for (const a of additional_prices) {
      await connection.query(
        `INSERT INTO additional_price
           (qt_id, add_price_name, price, created_at)
         VALUES (?, ?, ?, NOW())`,
        [qtId, a.add_price_name, a.price || 0],
      );
    }

    await connection.commit();

    return res.json({
      message: 'Quotation Created',
      qt_id: qtId,
      qt_number,
      revision: revNo,
      rev_id: revId,
    });
  } catch (err) {
    await connection.rollback();
    console.error('Quotation Create Error:', err);
    res.status(500).json({ message: err.message });
  } finally {
    connection.release();
  }
};


export const createQuotation2 = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const user = req.session?.user;
    if (!user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const created_by = user.id;

    const {
      type,
      master_id = null,
      items = [],
      additional_prices = [],
      gst_percent = 18,
      gst_app_amt = 0,
      acoustic_terms = null,
    } = req.body;

    if (!type || items.length === 0) {
      return res.status(400).json({
        message: "type and items required",
      });
    }

    await connection.beginTransaction();

    /* =====================================================
       GENERATE QT NUMBER
    ===================================================== */

    const [[ai]] = await connection.query(
      `SELECT AUTO_INCREMENT 
       FROM INFORMATION_SCHEMA.TABLES 
       WHERE TABLE_NAME = 'quotation'`
    );

    const nextId = ai.AUTO_INCREMENT;
    const qt_number = `QT${nextId.toString().padStart(6, "0")}`;

    /* =====================================================
       CALCULATE PRODUCTS TOTAL
    ===================================================== */

    let productsTotal = 0;

    for (const item of items) {
      const { products = [], kit_qty = 1, kit_id } = item;

      for (const p of products) {
        productsTotal +=
          Number(p.model_price || 0) *
          Number(p.model_qty || 0) *
          (kit_id ? Number(kit_qty) : 1);
      }
    }

    /* =====================================================
       CALCULATE ADDITIONAL TOTAL
    ===================================================== */

    let additionalTotal = 0;

    for (const a of additional_prices) {
      additionalTotal += Number(a.price || 0);
    }

    /* =====================================================
       GST CALCULATION (ONLY ON gst_app_amt)
    ===================================================== */

    let gstAmount = 0;

    if (type === "with_gst" && Number(gst_app_amt) > 0) {
      gstAmount = Number(gst_app_amt) * (gst_percent / 100);
    }

    /* =====================================================
       FINAL PROJECT TOTAL
       products + additional + gst
    ===================================================== */

    const finalTotal =
      productsTotal +
      additionalTotal +
      (type === "with_gst" ? gstAmount : 0);

    /* =====================================================
       INSERT QUOTATION HEADER
    ===================================================== */

    const [qInsert] = await connection.query(
      `INSERT INTO quotation 
        (qt_number, type, master_id, acoustic_terms,
         total_price, without_gst_total, with_gst_total,
         created_flag, created_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        qt_number,
        type,
        master_id,
        acoustic_terms,

        productsTotal, // TOTAL COST (PRODUCTS ONLY)
        productsTotal,
        type === "with_gst" ? finalTotal : productsTotal + additionalTotal,

        1,
        created_by,
      ]
    );

    const qtId = qInsert.insertId;

    /* =====================================================
       UPDATE LEAD STAGE
    ===================================================== */

    if (master_id) {
      await connection.query(
        `UPDATE raw_data 
         SET lead_stage = 'Quotation Created'
         WHERE master_id = ?`,
        [master_id]
      );
    }

    /* =====================================================
       INSERT REVISION (REVISION 1)
    ===================================================== */

    const revNo = 1;

    const [revInsert] = await connection.query(
      `INSERT INTO quotation_revision
         (qt_id, revision, total_without_gst, total_with_gst, gst_app_amt, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [
        qtId,
        revNo,
        productsTotal, // ONLY PRODUCTS TOTAL
        finalTotal, // FINAL PROJECT TOTAL
        type === "with_gst" ? Number(gst_app_amt) : 0,
      ]
    );

    const revId = revInsert.insertId;

    /* =====================================================
       INSERT LINE ITEMS
    ===================================================== */

    for (const item of items) {
      const { cat_id, kit_id = null, kit_qty = 1, products = [] } = item;

      for (const p of products) {
        await connection.query(
          `INSERT INTO quotation_mapped
             (qt_id, cat_id, kit_id, model_id, kit_qty,
              model_qty, model_price, current_revision,
              created_by, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
          [
            qtId,
            cat_id,
            kit_id,
            p.model_id,
            kit_id ? Number(kit_qty) : 1,
            Number(p.model_qty || 0),
            Number(p.model_price || 0),
            revNo,
            created_by,
          ]
        );
      }
    }

    /* =====================================================
       INSERT ADDITIONAL PRICES
    ===================================================== */

    for (const a of additional_prices) {
      await connection.query(
        `INSERT INTO additional_price
           (qt_id, add_price_name, price, created_at)
         VALUES (?, ?, ?, NOW())`,
        [qtId, a.add_price_name, Number(a.price || 0)]
      );
    }

    await connection.commit();

    /* =====================================================
       RESPONSE
    ===================================================== */

    return res.json({
      message: "Quotation Created Successfully",
      qt_id: qtId,
      qt_number,
      revision: revNo,
      rev_id: revId,

      productsTotal,
      additionalTotal,
      gst_app_amt: type === "with_gst" ? gst_app_amt : 0,
      gstAmount,
      finalTotal,
    });

  } catch (err) {
    await connection.rollback();
    console.error("Quotation Create Error:", err);
    return res.status(500).json({ message: err.message });
  } finally {
    connection.release();
  }
};


export const createQuotation3 = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const user = req.session?.user;
    if (!user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const created_by = user.id;

    const {
      type,
      master_id = null,
      items = [],
      additional_prices = [],
      gst_percent = 18,
      gst_app_amt = 0,
      acoustic_terms = null,

      installments = [] // ✅ NEW
    } = req.body;

    if (!type || items.length === 0) {
      return res.status(400).json({
        message: "type and items required",
      });
    }

    await connection.beginTransaction();

    /* =====================================================
       GENERATE QT NUMBER
    ===================================================== */

    const [[ai]] = await connection.query(
      `SELECT AUTO_INCREMENT 
       FROM INFORMATION_SCHEMA.TABLES 
       WHERE TABLE_NAME = 'quotation'`
    );

    const nextId = ai.AUTO_INCREMENT;
    const qt_number = `QT${nextId.toString().padStart(6, "0")}`;

    /* =====================================================
       CALCULATE PRODUCTS TOTAL
    ===================================================== */

    let productsTotal = 0;

    for (const item of items) {
      const { products = [], kit_qty = 1, kit_id } = item;

      for (const p of products) {
        productsTotal +=
          Number(p.model_price || 0) *
          Number(p.model_qty || 0) *
          (kit_id ? Number(kit_qty) : 1);
      }
    }

    /* =====================================================
       CALCULATE ADDITIONAL TOTAL
    ===================================================== */

    let additionalTotal = 0;

    for (const a of additional_prices) {
      additionalTotal += Number(a.price || 0);
    }

    /* =====================================================
       GST CALCULATION
    ===================================================== */

    let gstAmount = 0;

    if (type === "with_gst" && Number(gst_app_amt) > 0) {
      gstAmount = Number(gst_app_amt) * (gst_percent / 100);
    }

    /* =====================================================
       FINAL TOTAL
    ===================================================== */

    const finalTotal =
      productsTotal +
      additionalTotal +
      (type === "with_gst" ? gstAmount : 0);

    /* =====================================================
       INSERT QUOTATION
    ===================================================== */

    const [qInsert] = await connection.query(
      `INSERT INTO quotation 
        (qt_number, type, master_id, acoustic_terms,
         total_price, without_gst_total, with_gst_total,
         created_flag, created_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        qt_number,
        type,
        master_id,
        acoustic_terms,

        productsTotal,
        productsTotal,
        type === "with_gst" ? finalTotal : productsTotal + additionalTotal,

        1,
        created_by,
      ]
    );

    const qtId = qInsert.insertId;

    /* =====================================================
       UPDATE LEAD STAGE
    ===================================================== */

    if (master_id) {
      await connection.query(
        `UPDATE raw_data 
         SET lead_stage = 'Quotation Created'
         WHERE master_id = ?`,
        [master_id]
      );
    }

    /* =====================================================
       INSERT REVISION
    ===================================================== */

    const revNo = 1;

    const [revInsert] = await connection.query(
      `INSERT INTO quotation_revision
         (qt_id, revision, total_without_gst, total_with_gst, gst_app_amt, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [
        qtId,
        revNo,
        productsTotal,
        finalTotal,
        type === "with_gst" ? Number(gst_app_amt) : 0,
      ]
    );

    const revId = revInsert.insertId;

    /* =====================================================
       INSERT LINE ITEMS
    ===================================================== */

    for (const item of items) {
      const { cat_id, kit_id = null, kit_qty = 1, products = [] } = item;

      for (const p of products) {
        await connection.query(
          `INSERT INTO quotation_mapped
             (qt_id, cat_id, kit_id, model_id, kit_qty,
              model_qty, model_price, current_revision,
              created_by, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
          [
            qtId,
            cat_id,
            kit_id,
            p.model_id,
            kit_id ? Number(kit_qty) : 1,
            Number(p.model_qty || 0),
            Number(p.model_price || 0),
            revNo,
            created_by,
          ]
        );
      }
    }

    /* =====================================================
       INSERT ADDITIONAL PRICES
    ===================================================== */

    for (const a of additional_prices) {
      await connection.query(
        `INSERT INTO additional_price
           (qt_id, add_price_name, price, created_at)
         VALUES (?, ?, ?, NOW())`,
        [qtId, a.add_price_name, Number(a.price || 0)]
      );
    }

    /* =====================================================
       ✅ INSERT INSTALLMENTS (NEW FEATURE)
    ===================================================== */

    if (installments.length > 0) {
      let totalPercent = 0;

      for (const inst of installments) {
        totalPercent += Number(inst.percentage || 0);
      }

      if (totalPercent > 100) {
        throw new Error("Installment percentage cannot exceed 100%");
      }

      for (const inst of installments) {
        await connection.query(
          `INSERT INTO quotation_installments
             (qt_id, description, percentage, amount, created_at)
           VALUES (?, ?, ?, ?, NOW())`,
          [
            qtId,
            inst.description || '',
            Number(inst.percentage || 0),
            Number(inst.amount || 0),
          ]
        );
      }
    }

    await connection.commit();

    /* =====================================================
       RESPONSE
    ===================================================== */

    return res.json({
      message: "Quotation Created Successfully",
      qt_id: qtId,
      qt_number,
      revision: revNo,
      rev_id: revId,

      productsTotal,
      additionalTotal,
      gst_app_amt: type === "with_gst" ? gst_app_amt : 0,
      gstAmount,
      finalTotal,

      installments // ✅ NEW
    });

  } catch (err) {
    await connection.rollback();
    console.error("Quotation Create Error:", err);
    return res.status(500).json({ message: err.message });
  } finally {
    connection.release();
  }
};


//contrller 

export const createQuotation4 = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const user = req.session?.user;
    if (!user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const created_by = user.id;

    const {
      type,
      master_id = null,
      items = [],
      additional_prices = [],
      gst_percent = 18,
      gst_app_amt = 0,
      acoustic_terms = null,

      installments = [], // ✅ NEW
      final_offer = null // ✅ NEW - Final Best Offer
    } = req.body;

    if (!type || items.length === 0) {
      return res.status(400).json({
        message: "type and items required",
      });
    }

    await connection.beginTransaction();

    /* =====================================================
       GENERATE QT NUMBER
    ===================================================== */

    const [[ai]] = await connection.query(
      `SELECT AUTO_INCREMENT 
       FROM INFORMATION_SCHEMA.TABLES 
       WHERE TABLE_NAME = 'quotation'`
    );

    const nextId = ai.AUTO_INCREMENT;
    const qt_number = `QT${nextId.toString().padStart(6, "0")}`;

    /* =====================================================
       CALCULATE PRODUCTS TOTAL
    ===================================================== */

    let productsTotal = 0;

    for (const item of items) {
      const { products = [], kit_qty = 1, kit_id } = item;

      for (const p of products) {
        productsTotal +=
          Number(p.model_price || 0) *
          Number(p.model_qty || 0) *
          (kit_id ? Number(kit_qty) : 1);
      }
    }

    /* =====================================================
       CALCULATE ADDITIONAL TOTAL
    ===================================================== */

    let additionalTotal = 0;

    for (const a of additional_prices) {
      additionalTotal += Number(a.price || 0);
    }

    /* =====================================================
       GST CALCULATION
    ===================================================== */

    let gstAmount = 0;

    if (type === "with_gst" && Number(gst_app_amt) > 0) {
      gstAmount = Number(gst_app_amt) * (gst_percent / 100);
    }

    /* =====================================================
       FINAL TOTAL
    ===================================================== */

    const finalTotal =
      productsTotal +
      additionalTotal +
      (type === "with_gst" ? gstAmount : 0);

    /* =====================================================
       INSERT QUOTATION
    ===================================================== */

    const [qInsert] = await connection.query(
      `INSERT INTO quotation 
        (qt_number, type, master_id, acoustic_terms,
         total_price, without_gst_total, with_gst_total,
         created_flag, created_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        qt_number,
        type,
        master_id,
        acoustic_terms,

        productsTotal,
        productsTotal,
        type === "with_gst" ? finalTotal : productsTotal + additionalTotal,

        1,
        created_by,
      ]
    );

    const qtId = qInsert.insertId;

    /* =====================================================
       UPDATE LEAD STAGE
    ===================================================== */

    if (master_id) {
      await connection.query(
        `UPDATE raw_data 
         SET lead_stage = 'Quotation Created'
         WHERE master_id = ?`,
        [master_id]
      );
    }

    /* =====================================================
       INSERT REVISION
    ===================================================== */

    const revNo = 1;

    const [revInsert] = await connection.query(
      `INSERT INTO quotation_revision
         (qt_id, revision, total_without_gst, total_with_gst, gst_app_amt, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [
        qtId,
        revNo,
        productsTotal,
        finalTotal,
        type === "with_gst" ? Number(gst_app_amt) : 0,
      ]
    );

    const revId = revInsert.insertId;

    /* =====================================================
       INSERT LINE ITEMS
    ===================================================== */

    for (const item of items) {
      const { cat_id, kit_id = null, kit_qty = 1, products = [] } = item;

      for (const p of products) {
        await connection.query(
          `INSERT INTO quotation_mapped
             (qt_id, cat_id, kit_id, model_id, kit_qty,
              model_qty, model_price, current_revision,
              created_by, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
          [
            qtId,
            cat_id,
            kit_id,
            p.model_id,
            kit_id ? Number(kit_qty) : 1,
            Number(p.model_qty || 0),
            Number(p.model_price || 0),
            revNo,
            created_by,
          ]
        );
      }
    }

    /* =====================================================
       INSERT ADDITIONAL PRICES
    ===================================================== */

    for (const a of additional_prices) {
      await connection.query(
        `INSERT INTO additional_price
           (qt_id, add_price_name, price, created_at)
         VALUES (?, ?, ?, NOW())`,
        [qtId, a.add_price_name, Number(a.price || 0)]
      );
    }

    /* =====================================================
       ✅ INSERT INSTALLMENTS (NEW FEATURE)
    ===================================================== */

    if (installments.length > 0) {
      let totalPercent = 0;

      for (const inst of installments) {
        totalPercent += Number(inst.percentage || 0);
      }

      if (totalPercent > 100) {
        throw new Error("Installment percentage cannot exceed 100%");
      }

      for (const inst of installments) {
        await connection.query(
          `INSERT INTO quotation_installments
             (qt_id, description, percentage, amount, created_at)
           VALUES (?, ?, ?, ?, NOW())`,
          [
            qtId,
            inst.description || '',
            Number(inst.percentage || 0),
            Number(inst.amount || 0),
          ]
        );
      }
    }

    /* =====================================================
       ✅ INSERT FINAL BEST OFFER (NEW FEATURE)
    ===================================================== */

    // Check if final_offer is provided and has valid data
    if (final_offer && (final_offer.percentage > 0 || final_offer.amount > 0)) {
      // Validate percentage doesn't exceed 100
      if (final_offer.percentage > 100) {
        throw new Error("Final offer percentage cannot exceed 100%");
      }

      // Calculate amount if not provided or if percentage is provided
      let offerAmount = final_offer.amount;
      let offerPercentage = final_offer.percentage;

      if (offerPercentage > 0 && (!offerAmount || offerAmount === 0)) {
        offerAmount = (finalTotal * offerPercentage) / 100;
      } else if (offerAmount > 0 && (!offerPercentage || offerPercentage === 0)) {
        offerPercentage = (offerAmount / finalTotal) * 100;
      }

      // If no percentage or amount provided, use default (100%)
      if (offerPercentage === 0 && offerAmount === 0) {
        offerPercentage = 100;
        offerAmount = finalTotal;
      }

      await connection.query(
        `INSERT INTO quotation_final_offer
           (qt_id, description, percentage, amount, is_default, created_at)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [
          qtId,
          final_offer.description || 'FINAL BEST OFFER (OPTIONAL)',
          Number(offerPercentage),
          Number(offerAmount),
          final_offer.is_default || (offerPercentage === 100 ? 1 : 0),
        ]
      );
    } else {
      // Optional: Insert default final offer if you want it for every quotation
      // Uncomment the following lines if you want default offer for all quotations
      /*
      await connection.query(
        `INSERT INTO quotation_final_offer
           (qt_id, description, percentage, amount, is_default, created_at)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [
          qtId,
          'FINAL BEST OFFER (OPTIONAL)',
          100,
          finalTotal,
          1,
        ]
      );
      */
    }

    await connection.commit();

    /* =====================================================
       RESPONSE
    ===================================================== */

    return res.json({
      message: "Quotation Created Successfully",
      qt_id: qtId,
      qt_number,
      revision: revNo,
      rev_id: revId,

      productsTotal,
      additionalTotal,
      gst_app_amt: type === "with_gst" ? gst_app_amt : 0,
      gstAmount,
      finalTotal,

      installments, // ✅ NEW
      final_offer: final_offer || null // ✅ NEW
    });

  } catch (err) {
    await connection.rollback();
    console.error("Quotation Create Error:", err);
    return res.status(500).json({ message: err.message });
  } finally {
    connection.release();
  }
};




export const createQuotation5 = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const user = req.session?.user;
    if (!user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const created_by = user.id;

    const {
      type,
      master_id = null,
      items = [],
      additional_prices = [],
      gst_percent = 18,
      gst_app_amt = 0,
      acoustic_terms = null,

      installments = [], // ✅ NEW
      final_offer = null // ✅ NEW - Final Best Offer
    } = req.body;

    if (!type || items.length === 0) {
      return res.status(400).json({
        message: "type and items required",
      });
    }

    await connection.beginTransaction();

    /* =====================================================
       GENERATE QT NUMBER
    ===================================================== */

    const [[ai]] = await connection.query(
      `SELECT AUTO_INCREMENT 
       FROM INFORMATION_SCHEMA.TABLES 
       WHERE TABLE_NAME = 'quotation'`
    );

    const nextId = ai.AUTO_INCREMENT;
    const qt_number = `QT${nextId.toString().padStart(6, "0")}`;

    /* =====================================================
       CALCULATE PRODUCTS TOTAL
    ===================================================== */

    let productsTotal = 0;

    for (const item of items) {
      const { products = [], kit_qty = 1, kit_id } = item;

      for (const p of products) {
        productsTotal +=
          Number(p.model_price || 0) *
          Number(p.model_qty || 0) *
          (kit_id ? Number(kit_qty) : 1);
      }
    }

    /* =====================================================
       CALCULATE ADDITIONAL TOTAL
    ===================================================== */

    let additionalTotal = 0;

    for (const a of additional_prices) {
      additionalTotal += Number(a.price || 0);
    }

    /* =====================================================
       GST CALCULATION
    ===================================================== */

    let gstAmount = 0;

    if (type === "with_gst" && Number(gst_app_amt) > 0) {
      gstAmount = Number(gst_app_amt) * (gst_percent / 100);
    }

    /* =====================================================
       ORIGINAL FINAL TOTAL (WITHOUT DISCOUNT)
    ===================================================== */

    const originalFinalTotal =
      productsTotal +
      additionalTotal +
      (type === "with_gst" ? gstAmount : 0);

    /* =====================================================
       CALCULATE DISCOUNT VALUES IF FINAL OFFER EXISTS
    ===================================================== */

    let discountedTotal = originalFinalTotal;
    let discountPercentage = 0;
    let discountAmount = 0;

    if (final_offer && (final_offer.percentage > 0 || final_offer.amount > 0)) {
      // Validate percentage doesn't exceed 100
      if (final_offer.percentage > 100) {
        throw new Error("Final offer percentage cannot exceed 100%");
      }

      // Calculate discount values
      if (final_offer.percentage > 0) {
        discountPercentage = Number(final_offer.percentage);
        discountAmount = (originalFinalTotal * discountPercentage) / 100;
        discountedTotal = originalFinalTotal - discountAmount;
      } else if (final_offer.amount > 0) {
        discountAmount = Number(final_offer.amount);
        discountPercentage = (discountAmount / originalFinalTotal) * 100;
        discountedTotal = originalFinalTotal - discountAmount;
      }
    }

    /* =====================================================
       INSERT QUOTATION (WITH NEW DISCOUNT COLUMNS)
    ===================================================== */

    const [qInsert] = await connection.query(
      `INSERT INTO quotation 
        (qt_number, type, master_id, acoustic_terms,
         total_price, without_gst_total, with_gst_total,
         discounted_total, discount_percentage, discount_amount,
         created_flag, created_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        qt_number,
        type,
        master_id,
        acoustic_terms,

        productsTotal,  // total_price (original)
        productsTotal,  // without_gst_total (original)
        type === "with_gst" ? originalFinalTotal : productsTotal + additionalTotal, // with_gst_total (original)
        
        discountedTotal,      // discounted_total (new)
        discountPercentage,   // discount_percentage (new)
        discountAmount,       // discount_amount (new)

        1,
        created_by,
      ]
    );

    const qtId = qInsert.insertId;

    /* =====================================================
       UPDATE LEAD STAGE
    ===================================================== */

    if (master_id) {
      await connection.query(
        `UPDATE raw_data 
         SET lead_stage = 'Quotation Created'
         WHERE master_id = ?`,
        [master_id]
      );
    }

    /* =====================================================
       INSERT REVISION (STORE ORIGINAL TOTAL)
    ===================================================== */

    const revNo = 1;

    const [revInsert] = await connection.query(
      `INSERT INTO quotation_revision
         (qt_id, revision, total_without_gst, total_with_gst, gst_app_amt, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [
        qtId,
        revNo,
        productsTotal,
        originalFinalTotal, // Store original total in revision
        type === "with_gst" ? Number(gst_app_amt) : 0,
      ]
    );

    const revId = revInsert.insertId;

    /* =====================================================
       INSERT LINE ITEMS
    ===================================================== */

    for (const item of items) {
      const { cat_id, kit_id = null, kit_qty = 1, products = [] } = item;

      for (const p of products) {
        await connection.query(
          `INSERT INTO quotation_mapped
             (qt_id, cat_id, kit_id, model_id, kit_qty,
              model_qty, model_price, current_revision,
              created_by, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
          [
            qtId,
            cat_id,
            kit_id,
            p.model_id,
            kit_id ? Number(kit_qty) : 1,
            Number(p.model_qty || 0),
            Number(p.model_price || 0),
            revNo,
            created_by,
          ]
        );
      }
    }

    /* =====================================================
       INSERT ADDITIONAL PRICES
    ===================================================== */

    for (const a of additional_prices) {
      await connection.query(
        `INSERT INTO additional_price
           (qt_id, add_price_name, price, created_at)
         VALUES (?, ?, ?, NOW())`,
        [qtId, a.add_price_name, Number(a.price || 0)]
      );
    }

    /* =====================================================
       ✅ INSERT INSTALLMENTS (USING DISCOUNTED TOTAL IF APPLICABLE)
    ===================================================== */

    if (installments.length > 0) {
      let totalPercent = 0;

      for (const inst of installments) {
        totalPercent += Number(inst.percentage || 0);
      }

      if (totalPercent > 100) {
        throw new Error("Installment percentage cannot exceed 100%");
      }

      // Use discounted total for installment calculations if offer exists
      const installmentBaseTotal = discountedTotal;

      for (const inst of installments) {
        await connection.query(
          `INSERT INTO quotation_installments
             (qt_id, description, percentage, amount, created_at)
           VALUES (?, ?, ?, ?, NOW())`,
          [
            qtId,
            inst.description || '',
            Number(inst.percentage || 0),
            (installmentBaseTotal * Number(inst.percentage || 0)) / 100,
          ]
        );
      }
    }

    /* =====================================================
       ✅ INSERT FINAL BEST OFFER
    ===================================================== */

    if (final_offer && (final_offer.percentage > 0 || final_offer.amount > 0)) {
      // Validate percentage doesn't exceed 100
      if (final_offer.percentage > 100) {
        throw new Error("Final offer percentage cannot exceed 100%");
      }

      let offerAmount = final_offer.amount;
      let offerPercentage = final_offer.percentage;

      if (offerPercentage > 0 && (!offerAmount || offerAmount === 0)) {
        offerAmount = (originalFinalTotal * offerPercentage) / 100;
      } else if (offerAmount > 0 && (!offerPercentage || offerPercentage === 0)) {
        offerPercentage = (offerAmount / originalFinalTotal) * 100;
      }

      // If no percentage or amount provided, use default (0%)
      if (offerPercentage === 0 && offerAmount === 0) {
        offerPercentage = 0;
        offerAmount = 0;
      }

      await connection.query(
        `INSERT INTO quotation_final_offer
           (qt_id, description, percentage, amount, is_default, created_at)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [
          qtId,
          final_offer.description || 'FINAL BEST OFFER (OPTIONAL)',
          Number(offerPercentage),
          Number(offerAmount),
          final_offer.is_default || 0,
        ]
      );
    }

    await connection.commit();

    /* =====================================================
       RESPONSE
    ===================================================== */

    return res.json({
      message: "Quotation Created Successfully",
      qt_id: qtId,
      qt_number,
      revision: revNo,
      rev_id: revId,

      productsTotal,
      additionalTotal,
      gst_app_amt: type === "with_gst" ? gst_app_amt : 0,
      gstAmount,
      originalFinalTotal,
      discountedTotal,
      discountPercentage,
      discountAmount,

      installments,
      final_offer: final_offer || null
    });

  } catch (err) {
    await connection.rollback();
    console.error("Quotation Create Error:", err);
    return res.status(500).json({ message: err.message });
  } finally {
    connection.release();
  }
}; 

// Add this to your existing controller file

// ─────────────────────────────────────────────────────────────
//  HELPER — calculate all totals for one option object
// ─────────────────────────────────────────────────────────────
function calcOptionTotals(option = {}, quoteType = 'without_gst') {
  const {
    items = [],
    additional_prices = [],
    gst_percent = 18,
    gst_app_amt = 0,
    final_offer = null,
  } = option;
 
  // products subtotal
  let productsTotal = 0;
  for (const item of items) {
    const { products = [], kit_qty = 1, kit_id } = item;
    for (const p of products) {
      productsTotal +=
        Number(p.model_price || 0) *
        Number(p.model_qty || 0) *
        (kit_id ? Number(kit_qty) : 1);
    }
  }
 
  // additional charges subtotal
  const additionalTotal = additional_prices.reduce(
    (sum, a) => sum + Number(a.price || 0),
    0
  );
 
  // gst
  let gstAmount = 0;
  if (quoteType === 'with_gst' && Number(gst_app_amt) > 0) {
    gstAmount = Number(gst_app_amt) * (Number(gst_percent) / 100);
  }
 
  // original total (before any final offer discount)
  const originalFinalTotal =
    productsTotal + additionalTotal + (quoteType === 'with_gst' ? gstAmount : 0);
 
  // discount
  let discountedTotal = originalFinalTotal;
  let discountPercentage = 0;
  let discountAmount = 0;
 
  if (
    final_offer &&
    (Number(final_offer.percentage) > 0 || Number(final_offer.amount) > 0)
  ) {
    if (Number(final_offer.percentage) > 100) {
      throw new Error('Final offer percentage cannot exceed 100%');
    }
    if (Number(final_offer.percentage) > 0) {
      discountPercentage = Number(final_offer.percentage);
      discountAmount = (originalFinalTotal * discountPercentage) / 100;
      discountedTotal = originalFinalTotal - discountAmount;
    } else if (Number(final_offer.amount) > 0) {
      discountAmount = Number(final_offer.amount);
      discountPercentage =
        originalFinalTotal > 0 ? (discountAmount / originalFinalTotal) * 100 : 0;
      discountedTotal = originalFinalTotal - discountAmount;
    }
  }
 
  return {
    productsTotal,
    additionalTotal,
    gstAmount,
    originalFinalTotal,
    discountedTotal,
    discountPercentage,
    discountAmount,
  };
}
 
// ─────────────────────────────────────────────────────────────
//  HELPER — normalise request body into options array
//  Handles both new multi-option format and old flat format
// ─────────────────────────────────────────────────────────────
function resolveOptions(body) {
  const {
    options = [],
    // legacy flat fields
    items: legacyItems = [],
    categories: legacyCategories = [],
    additional_prices: legacyAdditional = [],
    gst_percent: legacyGstPercent = 18,
    gst_app_amt: legacyGstAmt = 0,
    final_offer: legacyFinalOffer = null,
  } = body;
 
  if (options && options.length > 0) return options;
 
  // legacy flat — wrap into single option
  const flatItems = legacyItems.length > 0 ? legacyItems : legacyCategories;
  if (flatItems.length > 0) {
    return [
      {
        option_name: 'OPTION 1',
        items: flatItems,
        additional_prices: legacyAdditional,
        gst_percent: legacyGstPercent,
        gst_app_amt: legacyGstAmt,
        final_offer: legacyFinalOffer,
      },
    ];
  }
 
  return [];
}
 
// ─────────────────────────────────────────────────────────────
//  HELPER — insert products for one option
// ─────────────────────────────────────────────────────────────
async function insertOptionProducts(connection, qtId, optionId, items, revNo, createdBy) {
  for (const item of items) {
    const { cat_id, kit_id = null, kit_qty = 1, products = [] } = item;
    for (const p of products) {
      await connection.query(
        `INSERT INTO quotation_mapped
           (qt_id, option_id, cat_id, kit_id, model_id, kit_qty,
            model_qty, model_price, current_revision, created_by, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          qtId, optionId, cat_id, kit_id,
          p.model_id,
          kit_id ? Number(kit_qty) : 1,
          Number(p.model_qty || 0),
          Number(p.model_price || 0),
          revNo, createdBy,
        ]
      );
    }
  }
}
 
// ─────────────────────────────────────────────────────────────
//  HELPER — insert additional prices for one option
// ─────────────────────────────────────────────────────────────
async function insertOptionAdditional(connection, qtId, optionId, additional_prices) {
  for (const a of additional_prices) {
    await connection.query(
      `INSERT INTO additional_price (qt_id, option_id, add_price_name, price, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [qtId, optionId, a.add_price_name, Number(a.price || 0)]
    );
  }
}
 
// ─────────────────────────────────────────────────────────────
//  HELPER — insert final offer for one option
// ─────────────────────────────────────────────────────────────
async function insertOptionFinalOffer(connection, qtId, optionId, final_offer, originalFinalTotal) {
  if (
    !final_offer ||
    (Number(final_offer.percentage) === 0 && Number(final_offer.amount) === 0)
  ) return;
 
  if (Number(final_offer.percentage) > 100) {
    throw new Error('Final offer percentage cannot exceed 100%');
  }
 
  let offerAmount = Number(final_offer.amount || 0);
  let offerPercentage = Number(final_offer.percentage || 0);
 
  if (offerPercentage > 0 && offerAmount === 0) {
    offerAmount = (originalFinalTotal * offerPercentage) / 100;
  } else if (offerAmount > 0 && offerPercentage === 0) {
    offerPercentage =
      originalFinalTotal > 0 ? (offerAmount / originalFinalTotal) * 100 : 0;
  }
 
  await connection.query(
    `INSERT INTO quotation_final_offer
       (qt_id, option_id, description, percentage, amount, is_default, created_at)
     VALUES (?, ?, ?, ?, ?, ?, NOW())`,
    [
      qtId, optionId,
      final_offer.description || 'FINAL BEST OFFER (OPTIONAL)',
      Number(offerPercentage),
      Number(offerAmount),
      final_offer.is_default || 0,
    ]
  );
}

// ─────────────────────────────────────────────────────────────
//  HELPER — insert installments for specific options
// ─────────────────────────────────────────────────────────────
// Add this to your existing controller file - update the insertOptionInstallments function

async function insertOptionInstallments(connection, qtId, optionId, installments, discountedTotal) {
  if (!installments || installments.length === 0) return;
  
  const totalPercent = installments.reduce((s, i) => s + Number(i.percentage || 0), 0);
  if (totalPercent > 100) throw new Error('Installment percentage cannot exceed 100%');
 
  for (const inst of installments) {
    await connection.query(
      `INSERT INTO quotation_installments
         (qt_id, option_id, description, percentage, amount, payment_mode, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [
        qtId,
        optionId,
        inst.description || '',
        Number(inst.percentage || 0),
        (discountedTotal * Number(inst.percentage || 0)) / 100,
        inst.payment_mode || 'Online'  // Add payment mode with default
      ]
    );
  }
}
 

// ─────────────────────────────────────────────────────────────
//  HELPER — insert additional prices for one option (with revision)
// ─────────────────────────────────────────────────────────────
async function insertOptionAdditionalWithRevision(connection, qtId, optionId, additional_prices, revision) {
  if (!additional_prices || additional_prices.length === 0) return;
  
  for (const a of additional_prices) {
    if (a.add_price_name && a.price) {
      await connection.query(
        `INSERT INTO additional_price (qt_id, option_id, add_price_name, price, revision, created_at)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [qtId, optionId, a.add_price_name, Number(a.price || 0), revision]
      );
    }
  }
}

// ─────────────────────────────────────────────────────────────
//  HELPER — insert final offer for one option (with revision)
// ─────────────────────────────────────────────────────────────
async function insertOptionFinalOfferWithRevision(connection, qtId, optionId, final_offer, originalFinalTotal, revision) {
  if (
    !final_offer ||
    (Number(final_offer.percentage) === 0 && Number(final_offer.amount) === 0)
  ) return;
 
  if (Number(final_offer.percentage) > 100) {
    throw new Error('Final offer percentage cannot exceed 100%');
  }
 
  let offerAmount = Number(final_offer.amount || 0);
  let offerPercentage = Number(final_offer.percentage || 0);
 
  if (offerPercentage > 0 && offerAmount === 0) {
    offerAmount = (originalFinalTotal * offerPercentage) / 100;
  } else if (offerAmount > 0 && offerPercentage === 0) {
    offerPercentage =
      originalFinalTotal > 0 ? (offerAmount / originalFinalTotal) * 100 : 0;
  }
 
  await connection.query(
    `INSERT INTO quotation_final_offer
       (qt_id, option_id, description, percentage, amount, is_default, revision, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
    [
      qtId, optionId,
      final_offer.description || 'FINAL BEST OFFER (OPTIONAL)',
      Number(offerPercentage),
      Number(offerAmount),
      final_offer.is_default || 0,
      revision,
    ]
  );
}

// ─────────────────────────────────────────────────────────────
//  HELPER — insert installments for one option (with revision)
// ─────────────────────────────────────────────────────────────
async function insertOptionInstallmentsWithRevision(connection, qtId, optionId, installments, discountedTotal, revision) {
  if (!installments || installments.length === 0) return;
  
  const totalPercent = installments.reduce((s, i) => s + Number(i.percentage || 0), 0);
  if (totalPercent > 100) throw new Error('Installment percentage cannot exceed 100%');
 
  for (const inst of installments) {
    await connection.query(
      `INSERT INTO quotation_installments
         (qt_id, option_id, description, percentage, amount, payment_mode, revision, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        qtId,
        optionId,
        inst.description || '',
        Number(inst.percentage || 0),
        (discountedTotal * Number(inst.percentage || 0)) / 100,
        inst.payment_mode || 'Online',
        revision,
      ]
    );
  }
}



// ============================================================
//  CREATE QUOTATION
//  POST /api/quotation
// ============================================================
export const createQuotation9 = async (req, res) => {
  const connection = await db.getConnection();
 
  try {
    const user = req.session?.user;
    if (!user) return res.status(401).json({ message: 'User not authenticated' });
    const created_by = user.id;
 
const { type, master_id = null, acoustic_terms = null, installments_config = [], subject = null } = req.body; 

    const resolvedOptions = resolveOptions(req.body);
 
    if (!type || resolvedOptions.length === 0) {
      return res.status(400).json({
        message: 'type and at least one option with items are required',
      });
    }
 
    await connection.beginTransaction();
 
    /* ── generate QT number ── */
    const [[ai]] = await connection.query(
      `SELECT AUTO_INCREMENT FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'quotation'`
    );
    const qt_number = `QT${String(ai.AUTO_INCREMENT).padStart(6, '0')}`;
 
    /* ── use option 1 totals for the quotation header row ── */
    const opt1 = resolvedOptions[0];
    const opt1Totals = calcOptionTotals(opt1, type);
 
    /* ── insert quotation header ── */
const [qInsert] = await connection.query(
  `INSERT INTO quotation
     (qt_number, type, master_id, acoustic_terms, subject,
      total_price, without_gst_total, with_gst_total,
      discounted_total, discount_percentage, discount_amount,
      created_flag, created_by, created_at)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
  [
    qt_number, type, master_id, acoustic_terms, subject,
    opt1Totals.productsTotal,
    opt1Totals.productsTotal,
    type === 'with_gst'
      ? opt1Totals.originalFinalTotal
      : opt1Totals.productsTotal + opt1Totals.additionalTotal,
    opt1Totals.discountedTotal,
    opt1Totals.discountPercentage,
    opt1Totals.discountAmount,
    1, created_by,
  ]
);
    const qtId = qInsert.insertId;
 
    /* ── update lead stage ── */
    if (master_id) {
      await connection.query(
        `UPDATE raw_data SET lead_stage = 'Quotation Created' WHERE master_id = ?`,
        [master_id]
      );
    }
 
    /* ── insert revision (based on option 1 for backward compat) ── */
    const revNo = 1;
    const [revInsert] = await connection.query(
      `INSERT INTO quotation_revision
         (qt_id, revision, total_without_gst, total_with_gst, gst_app_amt, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [
        qtId, revNo,
        opt1Totals.productsTotal,
        opt1Totals.originalFinalTotal,
        type === 'with_gst' ? Number(opt1.gst_app_amt || 0) : 0,
      ]
    );
    const revId = revInsert.insertId;
 
    /* ── insert each option ── */
    const insertedOptions = [];
 
    for (let i = 0; i < resolvedOptions.length; i++) {
      const option = resolvedOptions[i];
      const {
        option_name = `OPTION ${i + 1}`,
        items = [],
        additional_prices = [],
        final_offer = null,
      } = option;
 
      /* insert quotation_options record */
      const [optInsert] = await connection.query(
        `INSERT INTO quotation_options (qt_id, option_name, option_order, created_at)
         VALUES (?, ?, ?, NOW())`,
        [qtId, option_name, i + 1]
      );
      const optionId = optInsert.insertId;
 
      const totals = calcOptionTotals(option, type);
 
      await insertOptionProducts(connection, qtId, optionId, items, revNo, created_by);
      await insertOptionAdditional(connection, qtId, optionId, additional_prices);
      await insertOptionFinalOffer(connection, qtId, optionId, final_offer, totals.originalFinalTotal);
      
      // Insert installments for this specific option if configured
      const optionInstallmentConfig = installments_config.find(cfg => cfg.option_id === i || cfg.option_index === i);
      if (optionInstallmentConfig && optionInstallmentConfig.installments && optionInstallmentConfig.installments.length > 0) {
        await insertOptionInstallments(connection, qtId, optionId, optionInstallmentConfig.installments, totals.discountedTotal);
      }
 
      insertedOptions.push({
        option_id: optionId,
        option_name,
        option_order: i + 1,
        finalized_total: totals.discountedTotal,
        ...totals,
      });
    }
 
    await connection.commit();
 
    return res.json({
      message: 'Quotation Created Successfully',
      qt_id: qtId,
      qt_number,
      revision: revNo,
      rev_id: revId,
      options: insertedOptions,
    });
 
  } catch (err) {
    await connection.rollback();
    console.error('Quotation Create Error:', err);
    return res.status(500).json({ message: err.message });
  } finally {
    connection.release();
  }
};


export const createQuotation10 = async (req, res) => {
  const connection = await db.getConnection();
 
  try {
    const user = req.session?.user;
    if (!user) return res.status(401).json({ message: 'User not authenticated' });
    const created_by = user.id;
 
    const { 
      type, 
      master_id = null, 
      acoustic_terms = null, 
      installments_config = [], 
      subject = null,
      selected_options_for_summary = null
    } = req.body; 

    console.log('Received selected_options_for_summary:', selected_options_for_summary);

    const resolvedOptions = resolveOptions(req.body);
 
    if (!type || resolvedOptions.length === 0) {
      return res.status(400).json({
        message: 'type and at least one option with items are required',
      });
    }
 
    await connection.beginTransaction();
 
    /* ── generate QT number ── */
    const [[ai]] = await connection.query(
      `SELECT AUTO_INCREMENT FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'quotation'`
    );
    const qt_number = `QT${String(ai.AUTO_INCREMENT).padStart(6, '0')}`;
 
    /* ── use option 1 totals for the quotation header row ── */
    const opt1 = resolvedOptions[0];
    const opt1Totals = calcOptionTotals(opt1, type);
 
    // Convert selected_options_for_summary to JSON string
    const selectedOptionsJson = selected_options_for_summary && Array.isArray(selected_options_for_summary) && selected_options_for_summary.length > 0 
      ? JSON.stringify(selected_options_for_summary) 
      : null;
    
    console.log('Saving to DB as JSON:', selectedOptionsJson);
 
    /* ── insert quotation header ── */
    const [qInsert] = await connection.query(
      `INSERT INTO quotation
         (qt_number, type, master_id, acoustic_terms, subject,
          total_price, without_gst_total, with_gst_total,
          discounted_total, discount_percentage, discount_amount,
          selected_options_for_summary,
          created_flag, created_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        qt_number, 
        type, 
        master_id, 
        acoustic_terms, 
        subject,
        opt1Totals.productsTotal,
        opt1Totals.productsTotal,
        type === 'with_gst'
          ? opt1Totals.originalFinalTotal
          : opt1Totals.productsTotal + opt1Totals.additionalTotal,
        opt1Totals.discountedTotal,
        opt1Totals.discountPercentage,
        opt1Totals.discountAmount,
        selectedOptionsJson,
        1,
        created_by,
      ]
    );
    const qtId = qInsert.insertId;
    
    console.log('Quotation created with ID:', qtId);
 
    /* ── update lead stage ── */
    if (master_id) {
      await connection.query(
        `UPDATE raw_data SET lead_stage = 'Quotation Created' WHERE master_id = ?`,
        [master_id]
      );
    }
 
    /* ── insert revision (based on option 1 for backward compat) ── */
    const revNo = 1;
    const [revInsert] = await connection.query(
      `INSERT INTO quotation_revision
         (qt_id, revision, total_without_gst, total_with_gst, gst_app_amt, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [
        qtId, revNo,
        opt1Totals.productsTotal,
        opt1Totals.originalFinalTotal,
        type === 'with_gst' ? Number(opt1.gst_app_amt || 0) : 0,
      ]
    );
    const revId = revInsert.insertId;
 
    /* ── insert each option ── */
    const insertedOptions = [];
 
    for (let i = 0; i < resolvedOptions.length; i++) {
      const option = resolvedOptions[i];
      const {
        option_name = `OPTION ${i + 1}`,
        items = [],
        additional_prices = [],
        final_offer = null,
      } = option;
 
      /* insert quotation_options record */
      const [optInsert] = await connection.query(
        `INSERT INTO quotation_options (qt_id, option_name, option_order, created_at)
         VALUES (?, ?, ?, NOW())`,
        [qtId, option_name, i + 1]
      );
      const optionId = optInsert.insertId;
 
      const totals = calcOptionTotals(option, type);
 
      await insertOptionProducts(connection, qtId, optionId, items, revNo, created_by);
      await insertOptionAdditional(connection, qtId, optionId, additional_prices);
      await insertOptionFinalOffer(connection, qtId, optionId, final_offer, totals.originalFinalTotal);
      
      // Insert installments for this specific option if configured
      const optionInstallmentConfig = installments_config.find(cfg => cfg.option_id === i || cfg.option_index === i);
      if (optionInstallmentConfig && optionInstallmentConfig.installments && optionInstallmentConfig.installments.length > 0) {
        await insertOptionInstallments(connection, qtId, optionId, optionInstallmentConfig.installments, totals.discountedTotal);
      }
 
      insertedOptions.push({
        option_id: optionId,
        option_name,
        option_order: i + 1,
        finalized_total: totals.discountedTotal,
        ...totals,
      });
    }
 
    await connection.commit();
 
    return res.json({
      message: 'Quotation Created Successfully',
      qt_id: qtId,
      qt_number,
      revision: revNo,
      rev_id: revId,
      options: insertedOptions,
    });
 
  } catch (err) {
    await connection.rollback();
    console.error('Quotation Create Error:', err);
    return res.status(500).json({ message: err.message });
  } finally {
    connection.release();
  }
};

export const createQuotation11 = async (req, res) => {
  const connection = await db.getConnection();
 
  try {
    const user = req.session?.user;
    if (!user) return res.status(401).json({ message: 'User not authenticated' });
    const created_by = user.id;
 
    const { 
      type, 
      master_id = null, 
      acoustic_terms = null, 
      installments_config = [], 
      subject = null,
      selected_options_for_summary = null
    } = req.body; 

    console.log('Received selected_options_for_summary:', selected_options_for_summary);

    const resolvedOptions = resolveOptions(req.body);
 
    if (!type || resolvedOptions.length === 0) {
      return res.status(400).json({
        message: 'type and at least one option with items are required',
      });
    }
 
    await connection.beginTransaction();
 
    /* ── generate QT number ── */
    const [[ai]] = await connection.query(
      `SELECT AUTO_INCREMENT FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'quotation'`
    );
    const qt_number = `QT${String(ai.AUTO_INCREMENT).padStart(6, '0')}`;
 
    /* ── use option 1 totals for the quotation header row ── */
    const opt1 = resolvedOptions[0];
    const opt1Totals = calcOptionTotals(opt1, type);
 
    // Convert selected_options_for_summary to JSON string
    const selectedOptionsJson = selected_options_for_summary && Array.isArray(selected_options_for_summary) && selected_options_for_summary.length > 0 
      ? JSON.stringify(selected_options_for_summary) 
      : null;
    
    console.log('Saving to DB as JSON:', selectedOptionsJson);
 
    /* ── insert quotation header ── */
    const [qInsert] = await connection.query(
      `INSERT INTO quotation
         (qt_number, type, master_id, acoustic_terms, subject,
          total_price, without_gst_total, with_gst_total,
          discounted_total, discount_percentage, discount_amount,
          selected_options_for_summary,
          created_flag, created_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        qt_number, 
        type, 
        master_id, 
        acoustic_terms, 
        subject,
        opt1Totals.productsTotal,
        opt1Totals.productsTotal,
        type === 'with_gst'
          ? opt1Totals.originalFinalTotal
          : opt1Totals.productsTotal + opt1Totals.additionalTotal,
        opt1Totals.discountedTotal,
        opt1Totals.discountPercentage,
        opt1Totals.discountAmount,
        selectedOptionsJson,
        1,
        created_by,
      ]
    );
    const qtId = qInsert.insertId;
    
    console.log('Quotation created with ID:', qtId);
 
    /* ── update lead stage ── */
    if (master_id) {
      await connection.query(
        `UPDATE raw_data SET lead_stage = 'Quotation Created' WHERE master_id = ?`,
        [master_id]
      );
    }
 
    /* ── insert revision (based on option 1 for backward compat) ── */
    const revNo = 1;
    const [revInsert] = await connection.query(
      `INSERT INTO quotation_revision
         (qt_id, revision, total_without_gst, total_with_gst, gst_app_amt, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [
        qtId, revNo,
        opt1Totals.productsTotal,
        opt1Totals.originalFinalTotal,
        type === 'with_gst' ? Number(opt1.gst_app_amt || 0) : 0,
      ]
    );
    const revId = revInsert.insertId;
 
    /* ── insert each option ── */
    const insertedOptions = [];
 
    for (let i = 0; i < resolvedOptions.length; i++) {
      const option = resolvedOptions[i];
      const {
        option_name = `OPTION ${i + 1}`,
        subject = null,           // ← ADDED: option-specific subject
        subject_type = 'master',  // ← ADDED: 'master' or 'custom'
        items = [],
        additional_prices = [],
        final_offer = null,
      } = option;
 
      /* insert quotation_options record with subject fields */
      const [optInsert] = await connection.query(
        `INSERT INTO quotation_options (qt_id, option_name, option_order, subject, subject_type, created_at)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [qtId, option_name, i + 1, subject, subject_type]
      );
      const optionId = optInsert.insertId;
 
      const totals = calcOptionTotals(option, type);
 
      await insertOptionProducts(connection, qtId, optionId, items, revNo, created_by);
      await insertOptionAdditional(connection, qtId, optionId, additional_prices);
      await insertOptionFinalOffer(connection, qtId, optionId, final_offer, totals.originalFinalTotal);
      
      // Insert installments for this specific option if configured
      const optionInstallmentConfig = installments_config.find(cfg => cfg.option_id === i || cfg.option_index === i);
      if (optionInstallmentConfig && optionInstallmentConfig.installments && optionInstallmentConfig.installments.length > 0) {
        await insertOptionInstallments(connection, qtId, optionId, optionInstallmentConfig.installments, totals.discountedTotal);
      }
 
      insertedOptions.push({
        option_id: optionId,
        option_name,
        subject: subject,
        subject_type: subject_type,
        option_order: i + 1,
        finalized_total: totals.discountedTotal,
        ...totals,
      });
    }
 
    await connection.commit();
 
    return res.json({
      message: 'Quotation Created Successfully',
      qt_id: qtId,
      qt_number,
      revision: revNo,
      rev_id: revId,
      options: insertedOptions,
    });
 
  } catch (err) {
    await connection.rollback();
    console.error('Quotation Create Error:', err);
    return res.status(500).json({ message: err.message });
  } finally {
    connection.release();
  }
};


export const createQuotation = async (req, res) => {
  const connection = await db.getConnection();
 
  try {
    const user = req.session?.user;
    if (!user) return res.status(401).json({ message: 'User not authenticated' });
    const created_by = user.id;
 
    const { 
      type, 
      master_id = null, 
      acoustic_terms = null, 
      installments_config = [], 
      subject = null,
      selected_options_for_summary = null,
      quotation_type = 'demo'
    } = req.body; 

    const resolvedOptions = resolveOptions(req.body);
 
    if (!type || resolvedOptions.length === 0) {
      return res.status(400).json({
        message: 'type and at least one option with items are required',
      });
    }
 
    await connection.beginTransaction();
 
    // generate QT number
    const [[ai]] = await connection.query(
      `SELECT AUTO_INCREMENT FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'quotation'`
    );
    const qt_number = `QT${String(ai.AUTO_INCREMENT).padStart(6, '0')}`;
 
    // Calculate totals for ALL options
    let totalProductsCost = 0;
    let totalWithGST = 0;
    let totalDiscounted = 0;
    let totalGSTAmount = 0;
    let totalDiscountAmount = 0;
    
    for (let i = 0; i < resolvedOptions.length; i++) {
      const option = resolvedOptions[i];
      const optionTotals = calcOptionTotals(option, type);
      
      totalProductsCost += optionTotals.productsTotal;
      totalWithGST += optionTotals.originalFinalTotal;
      totalDiscounted += optionTotals.discountedTotal;
      totalGSTAmount += optionTotals.gstAmount;
      totalDiscountAmount += optionTotals.discountAmount;
    }
    
    const overallDiscountPercentage = totalWithGST > 0 
      ? (totalDiscountAmount / totalWithGST) * 100 
      : 0;
    
    // Convert selected_options_for_summary to JSON string for revision storage
    const selectedOptionsJson = selected_options_for_summary && Array.isArray(selected_options_for_summary) && selected_options_for_summary.length > 0 
      ? JSON.stringify(selected_options_for_summary) 
      : null;
 
    // insert quotation header with quotation_type (NO COMMENTS IN SQL)
    const [qInsert] = await connection.query(
      `INSERT INTO quotation
         (qt_number, type, master_id, acoustic_terms, subject,
          total_price, without_gst_total, with_gst_total,
          discounted_total, discount_percentage, discount_amount,
          quotation_type,
          created_flag, created_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        qt_number, 
        type, 
        master_id, 
        acoustic_terms, 
        subject,
        totalProductsCost,
        totalProductsCost,
        totalWithGST,
        totalDiscounted,
        overallDiscountPercentage,
        totalDiscountAmount,
        quotation_type,
        1,
        created_by,
      ]
    );
    const qtId = qInsert.insertId;
 
    // update lead stage
    if (master_id) {
      await connection.query(
        `UPDATE raw_data SET lead_stage = 'Quotation Created' WHERE master_id = ?`,
        [master_id]
      );
    }
 
    // insert revision
    const revNo = 1;
    const [revInsert] = await connection.query(
      `INSERT INTO quotation_revision
         (qt_id, revision, total_without_gst, total_with_gst, gst_app_amt, selected_options_for_summary, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [
        qtId, revNo,
        totalProductsCost,
        totalDiscounted,
        type === 'with_gst' ? (totalGSTAmount / 0.18) : 0,
        selectedOptionsJson,
      ]
    );
    const revId = revInsert.insertId;
 
    // insert each option
    const insertedOptions = [];
 
    for (let i = 0; i < resolvedOptions.length; i++) {
      const option = resolvedOptions[i];
      const {
        option_name = `OPTION ${i + 1}`,
        subject = null,
        subject_type = 'master',
        floor_name = null,
        room_name = null,
        items = [],
        additional_prices = [],
        final_offer = null,
      } = option;
 
      const [optInsert] = await connection.query(
        `INSERT INTO quotation_options 
           (qt_id, option_name, option_order, revision, subject, subject_type, floor_name, room_name, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [qtId, option_name, i + 1, revNo, subject, subject_type, floor_name, room_name]
      );
      const optionId = optInsert.insertId;
 
      const totals = calcOptionTotals(option, type);
 
      await insertOptionProducts(connection, qtId, optionId, items, revNo, created_by);
      await insertOptionAdditionalWithRevision(connection, qtId, optionId, additional_prices, revNo);
      await insertOptionFinalOfferWithRevision(connection, qtId, optionId, final_offer, totals.originalFinalTotal, revNo);
      
      const optionInstallmentConfig = installments_config.find(cfg => cfg.option_index === i);
      if (optionInstallmentConfig && optionInstallmentConfig.selected && optionInstallmentConfig.installments && optionInstallmentConfig.installments.length > 0) {
        await insertOptionInstallmentsWithRevision(connection, qtId, optionId, optionInstallmentConfig.installments, totals.discountedTotal, revNo);
      }
 
      insertedOptions.push({
        option_id: optionId,
        option_name,
        subject: subject,
        subject_type: subject_type,
        floor_name: floor_name,
        room_name: room_name,
        option_order: i + 1,
        revision: revNo,
        finalized_total: totals.discountedTotal,
        ...totals,
      });
    }
 
    await connection.commit();
 
    return res.json({
      message: 'Quotation Created Successfully',
      qt_id: qtId,
      qt_number,
      revision: revNo,
      rev_id: revId,
      quotation_type: quotation_type,
      options: insertedOptions,
    });
 
  } catch (err) {
    await connection.rollback();
    console.error('Quotation Create Error:', err);
    return res.status(500).json({ message: err.message });
  } finally {
    connection.release();
  }
};


// export const getQuotationByMasterId1 = async (req, res) => {
//   const { master_id } = req.params;

//   if (!master_id) {
//     return res.status(400).json({ message: 'master_id is required' });
//   }

//   const connection = await db.getConnection();

//   try {
//     /* ================= LEAD INFO ================= */
//     const [[lead]] = await connection.query(
//       `SELECT name, number, city
//        FROM raw_data
//        WHERE master_id = ?`,
//       [master_id],
//     );

//     /* ================= QUOTATIONS ================= */
//     const [quotations] = await connection.query(
//       `SELECT
//           qt_id,
//           master_id,
//           qt_number,
//           type,
//           total_price,
//           without_gst_total,
//           with_gst_total,
//           created_at
//        FROM quotation
//        WHERE master_id = ?`,
//       [master_id],
//     );

//     if (!quotations.length) {
//       return res.status(404).json({ message: 'No quotations found' });
//     }

//     /* ================= LOOP QUOTATIONS ================= */
//     for (let qt of quotations) {
//       /* ===== GET LATEST REVISION ===== */
//       const [[revRow]] = await connection.query(
//         `SELECT MAX(current_revision) AS latest_revision
//          FROM quotation_mapped
//          WHERE qt_id = ?`,
//         [qt.qt_id],
//       );

//       const latestRevision = revRow.latest_revision;

//       if (!latestRevision) {
//         qt.current_revision = null;
//         qt.kits = [];
//         qt.additional_prices = [];
//         continue;
//       }

//       qt.current_revision = latestRevision;

//       /* ===== FETCH ONLY LATEST REVISION ITEMS ===== */
//       const [mapped] = await connection.query(
//         `SELECT
//             qm.qm_id,
//             qm.qt_id,
//             qm.cat_id,
//             qm.kit_id,
//             k.kit_name,
//             qm.model_id,
//             qm.kit_qty,
//             qm.model_qty,
//             qm.model_price,
//             m.model_no AS model,
//             m.price AS model_unit_price,
//             m.image_path,
//             m.description AS model_description,
//             b.brand_id,
//             b.brand_name,
//             pt.product_type_id,
//             pt.product_type_name
//          FROM quotation_mapped qm
//          LEFT JOIN kit k ON k.kit_id = qm.kit_id
//          JOIN models m ON m.model_id = qm.model_id
//          LEFT JOIN brands b ON b.brand_id = m.brand_id
//          LEFT JOIN product_types pt ON pt.product_type_id = (
//              SELECT product_type_id
//              FROM kit_mapping
//              WHERE model_id = qm.model_id
//              LIMIT 1
//          )
//          WHERE qm.qt_id = ?
//            AND qm.current_revision = ?
//          ORDER BY qm.kit_id`,
//         [qt.qt_id, latestRevision],
//       );

//       /* ===== GROUP BY KIT ===== */
//       const kitsMap = {};

//       for (let row of mapped) {
//         const key = row.kit_id ?? 'single';

//         if (!kitsMap[key]) {
//           kitsMap[key] = {
//             qm_id: row.qm_id,
//             cat_id: row.cat_id,
//             kit_id: row.kit_id,
//             kit_name: row.kit_name,
//             kit_qty: row.kit_qty,
//             items: [],
//           };
//         }

//         kitsMap[key].items.push({
//           model_id: row.model_id,
//           model: row.model,
//           prod_qty: row.model_qty,
//           prod_price: row.model_price,
//           kit_qty: row.kit_qty,
//           brand_id: row.brand_id,
//           brand_name: row.brand_name,
//           product_type_id: row.product_type_id,
//           product_type_name: row.product_type_name,
//           image_path: row.image_path,
//           model_description: row.model_description,
//         });
//       }

//       qt.kits = Object.values(kitsMap);

//       /* ===== ADDITIONAL PRICES ===== */
//       const [additionalPrices] = await connection.query(
//         `SELECT add_id, add_price_name, price
//          FROM additional_price
//          WHERE qt_id = ?`,
//         [qt.qt_id],
//       );

//       qt.additional_prices = additionalPrices;
//     }

//     /* ================= RESPONSE ================= */
//     return res.status(200).json({
//       master_id,
//       lead: lead || null,
//       quotations,
//     });
//   } catch (error) {
//     console.error('❌ getQuotationByMasterId Error:', error);
//     return res
//       .status(500)
//       .json({ message: 'Failed to fetch quotation details' });
//   } finally {
//     connection.release();
//   }
// };

export const getQuotationByMasterId1 = async (req, res) => {
  const { master_id, revision } = req.params;

  if (!master_id || !revision) {
    return res.status(400).json({ message: 'master_id & revision required' });
  }

  const connection = await db.getConnection();

  try {
    /* ================= LEAD ================= */
    const [[lead]] = await connection.query(
      `SELECT name, number, city 
       FROM raw_data 
       WHERE master_id = ?`,
      [master_id],
    );

    /* ================= QUOTATIONS ================= */
    const [quotations] = await connection.query(
      `SELECT 
          qt_id,
          master_id,
          qt_number,
          type
       FROM quotation
       WHERE master_id = ?`,
      [master_id],
    );

    if (!quotations.length) {
      return res.status(404).json({ message: 'No quotations found' });
    }

    /* ================= FETCH ALL CATEGORIES ================= */
    const [categories] = await connection.query(
      `SELECT cat_id, cat_name FROM category`,
    );
    const categoryMap = {};
    categories.forEach((c) => {
      categoryMap[c.cat_id] = c.cat_name;
    });

    /* ================= LOOP AND FETCH REVISION DATA ================= */
    for (let qt of quotations) {
      /* ===== ITEMS FOR REVISION ===== */
      const [mapped] = await connection.query(
        `SELECT 
            qm.qm_id,
            qm.cat_id,
            qm.kit_id,
            qm.model_id,
            qm.model_qty AS qty,
            qm.model_price AS price,
            k.kit_name,
            m.model_no AS model,
            m.image_path,
            b.brand_name,
            pt.product_type_name
         FROM quotation_mapped qm
         LEFT JOIN kit k ON k.kit_id = qm.kit_id
         JOIN models m ON m.model_id = qm.model_id
         LEFT JOIN brands b ON b.brand_id = m.brand_id
         LEFT JOIN product_types pt ON pt.product_type_id = (
            SELECT product_type_id 
            FROM kit_mapping 
            WHERE model_id = qm.model_id LIMIT 1
         )
         WHERE qm.qt_id = ? AND qm.current_revision = ?
         ORDER BY qm.kit_id`,
        [qt.qt_id, revision],
      );

      /* ===== ADD CATEGORY NAME ===== */
      mapped.forEach((row) => {
        row.cat_name = categoryMap[row.cat_id] || 'Unknown';
      });

      /* ===== GROUP ITEMS BY KIT ===== */
      const kitsMap = {};
      for (let row of mapped) {
        const key = row.kit_id ?? 'single';

        if (!kitsMap[key]) {
          kitsMap[key] = {
            kit_id: row.kit_id,
            kit_name: row.kit_name,
            items: [],
          };
        }

        kitsMap[key].items.push(row);
      }

      qt.items = Object.values(kitsMap);

      /* ===== REVISION TOTAL ===== */
      const [[revTotal]] = await connection.query(
        `SELECT total_without_gst, total_with_gst 
         FROM quotation_revision 
         WHERE qt_id = ? AND revision = ?`,
        [qt.qt_id, revision],
      );

      qt.totals = revTotal || {};

      /* ===== ADDITIONAL PRICES ===== */
      const [additional] = await connection.query(
        `SELECT add_price_name, price 
         FROM additional_price 
         WHERE qt_id = ?`,
        [qt.qt_id],
      );

      qt.additional_prices = additional;
    }

    return res.status(200).json({
      master_id,
      revision,
      lead,
      quotations,
    });
  } catch (error) {
    console.error('getQuotationByMasterIdAndRevision Error:', error);
    return res.status(500).json({ message: 'Failed to fetch quotation' });
  } finally {
    connection.release();
  }
};


export const getQuotationByMasterId2 = async (req, res) => {
  const { master_id, revision } = req.params;

  if (!master_id || !revision) {
    return res.status(400).json({ message: "master_id & revision required" });
  }

  const revisionNumber = Number(revision); 

  const connection = await db.getConnection();

  try {
   
    const [[lead]] = await connection.query(
      `SELECT name, number, city 
       FROM raw_data 
       WHERE master_id = ?`,
      [master_id]
    );

    
    const [[quotation]] = await connection.query(
      `SELECT 
         qt_id,
         master_id,
         qt_number,
         type,
         created_at,
         acoustic_terms
       FROM quotation
       WHERE master_id = ?
       LIMIT 1`,
      [master_id]
    );

    if (!quotation) {
      return res.status(404).json({ message: "No quotation found" });
    }

    /* ================= REVISION DATA ================= */
    const [[revisionData]] = await connection.query(
      `SELECT 
          total_without_gst, 
          total_with_gst, 
          gst_app_amt
       FROM quotation_revision
       WHERE qt_id = ? AND revision = ?`,
      [quotation.qt_id, revisionNumber] 
    );

    if (!revisionData) {
      return res.status(404).json({
        message: `Revision ${revisionNumber} not found`,
      });
    }

    /* ================= FETCH ALL CATEGORIES ================= */
    const [categories] = await connection.query(
      `SELECT cat_id, cat_name FROM category`
    );

    const categoryMap = {};
    categories.forEach((c) => {
      categoryMap[c.cat_id] = c.cat_name;
    });

    /* ================= FETCH ITEMS FOR REVISION ================= */
    const [mapped] = await connection.query(
      `SELECT 
          qm.qm_id,
          qm.cat_id,
          qm.kit_id,
          qm.model_id,
          qm.model_qty AS qty,
          qm.model_price AS price,
          qm.current_revision,
          k.kit_name,
          m.model_no AS model,
          m.image_path,
          m.description,
          m.price AS model_original_price,
          b.brand_name,
          pt.product_type_name
       FROM quotation_mapped qm
       LEFT JOIN kit k ON k.kit_id = qm.kit_id
       JOIN models m ON m.model_id = qm.model_id
       LEFT JOIN brands b ON b.brand_id = m.brand_id
       LEFT JOIN product_types pt ON pt.product_type_id = (
          SELECT product_type_id 
          FROM kit_mapping 
          WHERE model_id = qm.model_id LIMIT 1
       )
       WHERE qm.qt_id = ? AND qm.current_revision = ?
       ORDER BY qm.kit_id`,
      [quotation.qt_id, revisionNumber] // ✅ FIX
    );

    mapped.forEach((row) => {
      row.cat_name = categoryMap[row.cat_id] || "Unknown";
      row.price = Number(row.price || 0);
      row.model_original_price = Number(row.model_original_price || 0);
    });

    /* ================= GROUP BY KIT ================= */
    const kitsMap = {};

    for (let row of mapped) {
      const key = row.kit_id ?? "single";

      if (!kitsMap[key]) {
        kitsMap[key] = {
          kit_id: row.kit_id,
          kit_name: row.kit_name,
          items: [],
        };
      }

      kitsMap[key].items.push(row);
    }

    /* ================= ADDITIONAL PRICES ================= */
    const [additional] = await connection.query(
      `SELECT add_price_name, price 
       FROM additional_price 
       WHERE qt_id = ?`,
      [quotation.qt_id]
    );

    const additional_prices = additional.map((a) => ({
      add_price_name: a.add_price_name,
      price: Number(a.price || 0),
    }));

    /* ================= GST CALCULATION ================= */
    const GST_PERCENT = 18;
    const gstBase = Number(revisionData.gst_app_amt || 0);
    const gstCalculated = (gstBase * GST_PERCENT) / 100;

    /* ================= FINAL RESPONSE ================= */
    return res.status(200).json({
      master_id,
      revision: revisionNumber, // ✅ FIX
      lead,
      quotation: {
        qt_id: quotation.qt_id,
        qt_number: quotation.qt_number,
        type: quotation.type,
        acoustic_terms: quotation.acoustic_terms,
        created_at: quotation.created_at,

        items: Object.values(kitsMap),

        revision_details: {
          total_without_gst: Number(revisionData.total_without_gst || 0),
          total_with_gst: Number(revisionData.total_with_gst || 0),
          gst_app_amt: gstBase,
          gst_percent: GST_PERCENT,
          gst_calculated_amount: gstCalculated,
        },

        additional_prices,
      },
    });

  } catch (error) {
    console.error("getQuotationByMasterId Error:", error);
    return res.status(500).json({ message: "Failed to fetch quotation" });
  } finally {
    connection.release();
  }
};


export const getQuotationByMasterId3 = async (req, res) => {
  const { master_id, revision } = req.params;

  if (!master_id || !revision) {
    return res.status(400).json({ message: "master_id & revision required" });
  }

  const revisionNumber = Number(revision); 

  const connection = await db.getConnection();

  try {
   
    const [[lead]] = await connection.query(
      `SELECT name, number, city 
       FROM raw_data 
       WHERE master_id = ?`,
      [master_id]
    );

    
    const [[quotation]] = await connection.query(
      `SELECT 
         qt_id,
         master_id,
         qt_number,
         type,
         created_at,
         acoustic_terms
       FROM quotation
       WHERE master_id = ?
       LIMIT 1`,
      [master_id]
    );

    if (!quotation) {
      return res.status(404).json({ message: "No quotation found" });
    }

    /* ================= REVISION DATA ================= */
    const [[revisionData]] = await connection.query(
      `SELECT 
          total_without_gst, 
          total_with_gst, 
          gst_app_amt
       FROM quotation_revision
       WHERE qt_id = ? AND revision = ?`,
      [quotation.qt_id, revisionNumber] 
    );

    if (!revisionData) {
      return res.status(404).json({
        message: `Revision ${revisionNumber} not found`,
      });
    }

    /* ================= FETCH INSTALLMENTS ================= */
    const [installments] = await connection.query(
      `SELECT description, percentage
       FROM quotation_installments
       WHERE qt_id = ?
       ORDER BY inst_id ASC`,
      [quotation.qt_id]
    );

    /* ================= FETCH ALL CATEGORIES ================= */
    const [categories] = await connection.query(
      `SELECT cat_id, cat_name FROM category`
    );

    const categoryMap = {};
    categories.forEach((c) => {
      categoryMap[c.cat_id] = c.cat_name;
    });

    /* ================= FETCH ITEMS FOR REVISION ================= */
    const [mapped] = await connection.query(
      `SELECT 
          qm.qm_id,
          qm.cat_id,
          qm.kit_id,
          qm.model_id,
          qm.model_qty AS qty,
          qm.model_price AS price,
          qm.current_revision,
          k.kit_name,
          m.model_no AS model,
          m.image_path,
          m.description,
          m.price AS model_original_price,
          b.brand_name,
          pt.product_type_name
       FROM quotation_mapped qm
       LEFT JOIN kit k ON k.kit_id = qm.kit_id
       JOIN models m ON m.model_id = qm.model_id
       LEFT JOIN brands b ON b.brand_id = m.brand_id
       LEFT JOIN product_types pt ON pt.product_type_id = (
          SELECT product_type_id 
          FROM kit_mapping 
          WHERE model_id = qm.model_id LIMIT 1
       )
       WHERE qm.qt_id = ? AND qm.current_revision = ?
       ORDER BY qm.kit_id`,
      [quotation.qt_id, revisionNumber]
    );

    mapped.forEach((row) => {
      row.cat_name = categoryMap[row.cat_id] || "Unknown";
      row.price = Number(row.price || 0);
      row.model_original_price = Number(row.model_original_price || 0);
    });

    /* ================= GROUP BY KIT ================= */
    const kitsMap = {};

    for (let row of mapped) {
      const key = row.kit_id ?? "single";

      if (!kitsMap[key]) {
        kitsMap[key] = {
          kit_id: row.kit_id,
          kit_name: row.kit_name,
          items: [],
        };
      }

      kitsMap[key].items.push(row);
    }

    /* ================= ADDITIONAL PRICES ================= */
    const [additional] = await connection.query(
      `SELECT add_price_name, price 
       FROM additional_price 
       WHERE qt_id = ?`,
      [quotation.qt_id]
    );

    const additional_prices = additional.map((a) => ({
      add_price_name: a.add_price_name,
      price: Number(a.price || 0),
    }));

    /* ================= GST CALCULATION ================= */
    const GST_PERCENT = 18;
    const gstBase = Number(revisionData.gst_app_amt || 0);
    const gstCalculated = (gstBase * GST_PERCENT) / 100;

    /* ================= FINAL RESPONSE ================= */
    return res.status(200).json({
      master_id,
      revision: revisionNumber,
      lead,
      quotation: {
        qt_id: quotation.qt_id,
        qt_number: quotation.qt_number,
        type: quotation.type,
        acoustic_terms: quotation.acoustic_terms,
        created_at: quotation.created_at,

        items: Object.values(kitsMap),

        revision_details: {
          total_without_gst: Number(revisionData.total_without_gst || 0),
          total_with_gst: Number(revisionData.total_with_gst || 0),
          gst_app_amt: gstBase,
          gst_percent: GST_PERCENT,
          gst_calculated_amount: gstCalculated,
        },

        additional_prices,
        installments: installments.map(i => ({
          description: i.description,
          percentage: Number(i.percentage || 0)
        }))
      },
    });

  } catch (error) {
    console.error("getQuotationByMasterId Error:", error);
    return res.status(500).json({ message: "Failed to fetch quotation" });
  } finally {
    connection.release();
  }
};


export const getQuotationByMasterId4 = async (req, res) => {
  const { master_id, revision } = req.params;

  if (!master_id || !revision) {
    return res.status(400).json({ message: "master_id & revision required" });
  }

  const revisionNumber = Number(revision); 

  const connection = await db.getConnection();

  try {
   
    const [[lead]] = await connection.query(
      `SELECT name, number, city 
       FROM raw_data 
       WHERE master_id = ?`,
      [master_id]
    );

    
    const [[quotation]] = await connection.query(
      `SELECT 
         qt_id,
         master_id,
         qt_number,
         type,
         created_at,
         acoustic_terms
       FROM quotation
       WHERE master_id = ?
       LIMIT 1`,
      [master_id]
    );

    if (!quotation) {
      return res.status(404).json({ message: "No quotation found" });
    }

    /* ================= REVISION DATA ================= */
    const [[revisionData]] = await connection.query(
      `SELECT 
          total_without_gst, 
          total_with_gst, 
          gst_app_amt
       FROM quotation_revision
       WHERE qt_id = ? AND revision = ?`,
      [quotation.qt_id, revisionNumber] 
    );

    if (!revisionData) {
      return res.status(404).json({
        message: `Revision ${revisionNumber} not found`,
      });
    }

    /* ================= FETCH INSTALLMENTS ================= */
    const [installments] = await connection.query(
      `SELECT description, percentage
       FROM quotation_installments
       WHERE qt_id = ?
       ORDER BY inst_id ASC`,
      [quotation.qt_id]
    );

    /* ================= FETCH FINAL BEST OFFER ================= */
    const [finalOffer] = await connection.query(
      `SELECT description, percentage, amount, is_default
       FROM quotation_final_offer
       WHERE qt_id = ?
       LIMIT 1`,
      [quotation.qt_id]
    );

    /* ================= FETCH ALL CATEGORIES ================= */
    const [categories] = await connection.query(
      `SELECT cat_id, cat_name FROM category`
    );

    const categoryMap = {};
    categories.forEach((c) => {
      categoryMap[c.cat_id] = c.cat_name;
    });

    /* ================= FETCH ITEMS FOR REVISION ================= */
    const [mapped] = await connection.query(
      `SELECT 
          qm.qm_id,
          qm.cat_id,
          qm.kit_id,
          qm.model_id,
          qm.model_qty AS qty,
          qm.model_price AS price,
          qm.current_revision,
          k.kit_name,
          m.model_no AS model,
          m.image_path,
          m.description,
          m.price AS model_original_price,
          b.brand_name,
          pt.product_type_name
       FROM quotation_mapped qm
       LEFT JOIN kit k ON k.kit_id = qm.kit_id
       JOIN models m ON m.model_id = qm.model_id
       LEFT JOIN brands b ON b.brand_id = m.brand_id
       LEFT JOIN product_types pt ON pt.product_type_id = (
          SELECT product_type_id 
          FROM kit_mapping 
          WHERE model_id = qm.model_id LIMIT 1
       )
       WHERE qm.qt_id = ? AND qm.current_revision = ?
       ORDER BY qm.kit_id`,
      [quotation.qt_id, revisionNumber]
    );

    mapped.forEach((row) => {
      row.cat_name = categoryMap[row.cat_id] || "Unknown";
      row.price = Number(row.price || 0);
      row.model_original_price = Number(row.model_original_price || 0);
    });

    /* ================= GROUP BY KIT ================= */
    const kitsMap = {};

    for (let row of mapped) {
      const key = row.kit_id ?? "single";

      if (!kitsMap[key]) {
        kitsMap[key] = {
          kit_id: row.kit_id,
          kit_name: row.kit_name,
          items: [],
        };
      }

      kitsMap[key].items.push(row);
    }

    /* ================= ADDITIONAL PRICES ================= */
    const [additional] = await connection.query(
      `SELECT add_price_name, price 
       FROM additional_price 
       WHERE qt_id = ?`,
      [quotation.qt_id]
    );

    const additional_prices = additional.map((a) => ({
      add_price_name: a.add_price_name,
      price: Number(a.price || 0),
    }));

    /* ================= GST CALCULATION ================= */
    const GST_PERCENT = 18;
    const gstBase = Number(revisionData.gst_app_amt || 0);
    const gstCalculated = (gstBase * GST_PERCENT) / 100;

    /* ================= CALCULATE FINAL OFFER VALUES ================= */
    let finalOfferData = null;
    let finalOfferAmount = 0;
    let finalizedTotal = Number(revisionData.total_with_gst || 0);

    if (finalOffer && finalOffer.length > 0 && finalOffer[0].amount > 0) {
      finalOfferData = {
        description: finalOffer[0].description || 'FINAL BEST OFFER (OPTIONAL)',
        percentage: Number(finalOffer[0].percentage || 0),
        amount: Number(finalOffer[0].amount || 0),
      };
      finalOfferAmount = Number(finalOffer[0].amount || 0);
      finalizedTotal = Number(revisionData.total_with_gst || 0) - finalOfferAmount;
    }

    /* ================= FINAL RESPONSE ================= */
    return res.status(200).json({
      master_id,
      revision: revisionNumber,
      lead,
      quotation: {
        qt_id: quotation.qt_id,
        qt_number: quotation.qt_number,
        type: quotation.type,
        acoustic_terms: quotation.acoustic_terms,
        created_at: quotation.created_at,

        items: Object.values(kitsMap),

        revision_details: {
          total_without_gst: Number(revisionData.total_without_gst || 0),
          total_with_gst: Number(revisionData.total_with_gst || 0),
          gst_app_amt: gstBase,
          gst_percent: GST_PERCENT,
          gst_calculated_amount: gstCalculated,
        },

        additional_prices,
        installments: installments.map(i => ({
          description: i.description,
          percentage: Number(i.percentage || 0)
        })),
        
        // NEW: Final Offer Data
        final_offer: finalOfferData,
        final_offer_amount: finalOfferAmount,
        finalized_total: finalizedTotal,
      },
    });

  } catch (error) {
    console.error("getQuotationByMasterId Error:", error);
    return res.status(500).json({ message: "Failed to fetch quotation" });
  } finally {
    connection.release();
  }
};



// ============================================================
//  GET QUOTATION BY MASTER ID  (for View + PDF)
//  GET /api/quotation/:master_id/:revision
// ============================================================
export const getQuotationByMasterId5 = async (req, res) => {
  const { master_id, revision } = req.params;
  if (!master_id || !revision) {
    return res.status(400).json({ message: 'master_id & revision required' });
  }
 
  const revisionNumber = Number(revision);
  const connection = await db.getConnection();
 
  try {
    /* ── lead ── */
    const [[lead]] = await connection.query(
      `SELECT name, number, city, address FROM raw_data WHERE master_id = ?`,
      [master_id]
    );
 
    /* ── quotation header ── */
const [[quotation]] = await connection.query(
  `SELECT qt_id, master_id, qt_number, type, created_at, acoustic_terms, subject
   FROM quotation WHERE master_id = ? LIMIT 1`,
  [master_id]
);
    if (!quotation) return res.status(404).json({ message: 'No quotation found' });
 
    /* ── revision data ── */
    const [[revisionData]] = await connection.query(
      `SELECT total_without_gst, total_with_gst, gst_app_amt
       FROM quotation_revision WHERE qt_id = ? AND revision = ?`,
      [quotation.qt_id, revisionNumber]
    );
    if (!revisionData) {
      return res.status(404).json({ message: `Revision ${revisionNumber} not found` });
    }
 
    /* ── category map ── */
    const [categories] = await connection.query(`SELECT cat_id, cat_name FROM category`);
    const categoryMap = {};
    categories.forEach(c => { categoryMap[c.cat_id] = c.cat_name; });
 
    /* ── options ── */
    const [optionRows] = await connection.query(
      `SELECT option_id, option_name, option_order
       FROM quotation_options WHERE qt_id = ? ORDER BY option_order ASC`,
      [quotation.qt_id]
    );
 
    const GST_PERCENT = 18;
    const gstBase = Number(revisionData.gst_app_amt || 0);
 
    const builtOptions = [];
 
    for (const opt of optionRows) {
      /* products */
      const [mapped] = await connection.query(
        `SELECT
            qm.qm_id, qm.cat_id, qm.kit_id, qm.model_id,
            qm.model_qty AS qty,
            qm.model_price AS price,
            qm.current_revision, qm.kit_qty,
            k.kit_name,
            m.model_no AS model,
            m.image_path,
            m.description,
            m.price AS model_original_price,
            b.brand_name,
            pt.product_type_name
         FROM quotation_mapped qm
         LEFT JOIN kit k ON k.kit_id = qm.kit_id
         JOIN models m ON m.model_id = qm.model_id
         LEFT JOIN brands b ON b.brand_id = m.brand_id
         LEFT JOIN product_types pt ON pt.product_type_id = (
           SELECT product_type_id FROM kit_mapping WHERE model_id = qm.model_id LIMIT 1
         )
         WHERE qm.qt_id = ? AND qm.option_id = ? AND qm.current_revision = ?
         ORDER BY qm.kit_id`,
        [quotation.qt_id, opt.option_id, revisionNumber]
      );
 
      mapped.forEach(row => {
        row.cat_name = categoryMap[row.cat_id] || 'Unknown';
        row.price = Number(row.price || 0);
        row.model_original_price = Number(row.model_original_price || 0);
      });
 
      /* group by kit */
      const kitsMap = {};
      for (const row of mapped) {
        const key = row.kit_id ?? 'single';
        if (!kitsMap[key]) {
          kitsMap[key] = { kit_id: row.kit_id, kit_name: row.kit_name, items: [] };
        }
        kitsMap[key].items.push(row);
      }
 
      /* additional prices */
      const [additional] = await connection.query(
        `SELECT add_price_name, price FROM additional_price
         WHERE qt_id = ? AND option_id = ?`,
        [quotation.qt_id, opt.option_id]
      );
      const additional_prices = additional.map(a => ({
        add_price_name: a.add_price_name,
        price: Number(a.price || 0),
      }));
 
      /* final offer */
      const [finalOfferRows] = await connection.query(
        `SELECT description, percentage, amount, is_default
         FROM quotation_final_offer WHERE qt_id = ? AND option_id = ? LIMIT 1`,
        [quotation.qt_id, opt.option_id]
      );
      
      /* installments for this option */
      const [installmentRows] = await connection.query(
        `SELECT description, percentage, amount 
         FROM quotation_installments WHERE qt_id = ? AND option_id = ?`,
        [quotation.qt_id, opt.option_id]
      );
 
      /* per-option totals */
      const optProductsTotal = mapped.reduce(
        (sum, row) => sum + Number(row.price) * Number(row.qty),
        0
      );
      const optAdditionalTotal = additional_prices.reduce((s, a) => s + a.price, 0);
      const optGst = quotation.type === 'with_gst' ? (gstBase * GST_PERCENT) / 100 : 0;
      const optTotalWithGST = optProductsTotal + optAdditionalTotal + optGst;
 
      let finalOfferData = null;
      let finalOfferAmount = 0;
 
      if (finalOfferRows.length > 0 && Number(finalOfferRows[0].amount) > 0) {
        finalOfferData = {
          description: finalOfferRows[0].description || 'FINAL BEST OFFER (OPTIONAL)',
          percentage: Number(finalOfferRows[0].percentage || 0),
          amount: Number(finalOfferRows[0].amount || 0),
        };
        finalOfferAmount = Number(finalOfferRows[0].amount || 0);
      }
 
      const finalizedTotal = optTotalWithGST - finalOfferAmount;
 
      builtOptions.push({
        option_id: opt.option_id,
        option_name: opt.option_name,
        option_order: opt.option_order,
        items: Object.values(kitsMap),
        additional_prices,
        installments: installmentRows.map(i => ({
          description: i.description,
          percentage: Number(i.percentage || 0),
          amount: Number(i.amount || 0),
        })),
        revision_details: {
          total_without_gst: optProductsTotal,
          total_with_gst: optTotalWithGST,
          gst_app_amt: gstBase,
          gst_percent: GST_PERCENT,
          gst_calculated_amount: optGst,
        },
        final_offer: finalOfferData,
        final_offer_amount: finalOfferAmount,
        finalized_total: finalizedTotal,
      });
    }
 
    return res.status(200).json({
      master_id,
      revision: revisionNumber,
      lead,
      quotation: {
        qt_id: quotation.qt_id,
        qt_number: quotation.qt_number,
        type: quotation.type,
        acoustic_terms: quotation.acoustic_terms,
            subject: quotation.subject, 
        created_at: quotation.created_at,
        options: builtOptions,
      },
    });
 
  } catch (error) {
    console.error('getQuotationByMasterId Error:', error);
    return res.status(500).json({ message: 'Failed to fetch quotation' });
  } finally {
    connection.release();
  }
};

export const getQuotationByMasterId6 = async (req, res) => {
  const { master_id, revision } = req.params;
  if (!master_id || !revision) {
    return res.status(400).json({ message: 'master_id & revision required' });
  }
 
  const revisionNumber = Number(revision);
  const connection = await db.getConnection();
 
  try {
    /* ── lead ── */
    const [[lead]] = await connection.query(
      `SELECT name, number, city, address FROM raw_data WHERE master_id = ?`,
      [master_id]
    );
 
    /* ── quotation header ── */
    const [[quotation]] = await connection.query(
      `SELECT qt_id, master_id, qt_number, type, created_at, acoustic_terms, subject, selected_options_for_summary
       FROM quotation WHERE master_id = ? LIMIT 1`,
      [master_id]
    );
    if (!quotation) return res.status(404).json({ message: 'No quotation found' });
 
    console.log('Raw selected_options_for_summary from DB:', quotation.selected_options_for_summary);
 
    // Parse selected_options_for_summary
    let selectedOptionsForSummary = null;
    if (quotation.selected_options_for_summary) {
      if (typeof quotation.selected_options_for_summary === 'object') {
        selectedOptionsForSummary = quotation.selected_options_for_summary;
      } 
      else if (typeof quotation.selected_options_for_summary === 'string') {
        try {
          selectedOptionsForSummary = JSON.parse(quotation.selected_options_for_summary);
          console.log('Parsed selected options:', selectedOptionsForSummary);
        } catch (e) {
          console.error('Error parsing selected_options_for_summary:', e);
          selectedOptionsForSummary = null;
        }
      }
    }
 
    /* ── revision data ── */
    const [[revisionData]] = await connection.query(
      `SELECT total_without_gst, total_with_gst, gst_app_amt
       FROM quotation_revision WHERE qt_id = ? AND revision = ?`,
      [quotation.qt_id, revisionNumber]
    );
    if (!revisionData) {
      return res.status(404).json({ message: `Revision ${revisionNumber} not found` });
    }
 
    /* ── category map ── */
    const [categories] = await connection.query(`SELECT cat_id, cat_name FROM category`);
    const categoryMap = {};
    categories.forEach(c => { categoryMap[c.cat_id] = c.cat_name; });
 
    /* ── options ── */
    const [optionRows] = await connection.query(
      `SELECT option_id, option_name, option_order
       FROM quotation_options WHERE qt_id = ? ORDER BY option_order ASC`,
      [quotation.qt_id]
    );
 
    const GST_PERCENT = 18;
    const gstBase = Number(revisionData.gst_app_amt || 0);
 
    const builtOptions = [];
 
    for (const opt of optionRows) {
      /* products */
      const [mapped] = await connection.query(
        `SELECT
            qm.qm_id, qm.cat_id, qm.kit_id, qm.model_id,
            qm.model_qty AS qty,
            qm.model_price AS price,
            qm.current_revision, qm.kit_qty,
            k.kit_name,
            m.model_no AS model,
            m.image_path,
            m.description,
            m.price AS model_original_price,
            b.brand_name,
            pt.product_type_name
         FROM quotation_mapped qm
         LEFT JOIN kit k ON k.kit_id = qm.kit_id
         JOIN models m ON m.model_id = qm.model_id
         LEFT JOIN brands b ON b.brand_id = m.brand_id
         LEFT JOIN product_types pt ON pt.product_type_id = (
           SELECT product_type_id FROM kit_mapping WHERE model_id = qm.model_id LIMIT 1
         )
         WHERE qm.qt_id = ? AND qm.option_id = ? AND qm.current_revision = ?
         ORDER BY qm.kit_id`,
        [quotation.qt_id, opt.option_id, revisionNumber]
      );
 
      mapped.forEach(row => {
        row.cat_name = categoryMap[row.cat_id] || 'Unknown';
        row.price = Number(row.price || 0);
        row.model_original_price = Number(row.model_original_price || 0);
      });
 
      /* group by kit */
      const kitsMap = {};
      for (const row of mapped) {
        const key = row.kit_id ?? 'single';
        if (!kitsMap[key]) {
          kitsMap[key] = { kit_id: row.kit_id, kit_name: row.kit_name, items: [] };
        }
        kitsMap[key].items.push(row);
      }
 
      /* additional prices */
      const [additional] = await connection.query(
        `SELECT add_price_name, price FROM additional_price
         WHERE qt_id = ? AND option_id = ?`,
        [quotation.qt_id, opt.option_id]
      );
      const additional_prices = additional.map(a => ({
        add_price_name: a.add_price_name,
        price: Number(a.price || 0),
      }));
 
      /* final offer */
      const [finalOfferRows] = await connection.query(
        `SELECT description, percentage, amount, is_default
         FROM quotation_final_offer WHERE qt_id = ? AND option_id = ? LIMIT 1`,
        [quotation.qt_id, opt.option_id]
      );
      
      /* installments for this option */
      const [installmentRows] = await connection.query(
        `SELECT description, percentage, amount 
         FROM quotation_installments WHERE qt_id = ? AND option_id = ?`,
        [quotation.qt_id, opt.option_id]
      );
 
      /* per-option totals */
      const optProductsTotal = mapped.reduce(
        (sum, row) => sum + Number(row.price) * Number(row.qty),
        0
      );
      const optAdditionalTotal = additional_prices.reduce((s, a) => s + a.price, 0);
      const optGst = quotation.type === 'with_gst' ? (gstBase * GST_PERCENT) / 100 : 0;
      const optTotalWithGST = optProductsTotal + optAdditionalTotal + optGst;
 
      let finalOfferData = null;
      let finalOfferAmount = 0;
 
      if (finalOfferRows.length > 0 && Number(finalOfferRows[0].amount) > 0) {
        finalOfferData = {
          description: finalOfferRows[0].description || 'FINAL BEST OFFER (OPTIONAL)',
          percentage: Number(finalOfferRows[0].percentage || 0),
          amount: Number(finalOfferRows[0].amount || 0),
        };
        finalOfferAmount = Number(finalOfferRows[0].amount || 0);
      }
 
      const finalizedTotal = optTotalWithGST - finalOfferAmount;
 
      builtOptions.push({
        option_id: opt.option_id,
        option_name: opt.option_name,
        option_order: opt.option_order,
        items: Object.values(kitsMap),
        additional_prices,
        installments: installmentRows.map(i => ({
          description: i.description,
          percentage: Number(i.percentage || 0),
          amount: Number(i.amount || 0),
        })),
        revision_details: {
          total_without_gst: optProductsTotal,
          total_with_gst: optTotalWithGST,
          gst_app_amt: gstBase,
          gst_percent: GST_PERCENT,
          gst_calculated_amount: optGst,
        },
        final_offer: finalOfferData,
        final_offer_amount: finalOfferAmount,
        finalized_total: finalizedTotal,
      });
    }
 
    return res.status(200).json({
      master_id,
      revision: revisionNumber,
      lead,
      quotation: {
        qt_id: quotation.qt_id,
        qt_number: quotation.qt_number,
        type: quotation.type,
        acoustic_terms: quotation.acoustic_terms,
        subject: quotation.subject,
        selected_options_for_summary: selectedOptionsForSummary,
        created_at: quotation.created_at,
        options: builtOptions,
      },
    });
 
  } catch (error) {
    console.error('getQuotationByMasterId Error:', error);
    return res.status(500).json({ message: 'Failed to fetch quotation' });
  } finally {
    connection.release();
  }
};


export const getQuotationByMasterId7 = async (req, res) => {
  const { master_id, revision } = req.params;
  if (!master_id || !revision) {
    return res.status(400).json({ message: 'master_id & revision required' });
  }
 
  const revisionNumber = Number(revision);
  const connection = await db.getConnection();
 
  try {
    /* ── lead ── */
    const [[lead]] = await connection.query(
      `SELECT name, number, city, address FROM raw_data WHERE master_id = ?`,
      [master_id]
    );
 
    /* ── quotation header ── */
    const [[quotation]] = await connection.query(
      `SELECT qt_id, master_id, qt_number, type, created_at, acoustic_terms, subject, selected_options_for_summary
       FROM quotation WHERE master_id = ? LIMIT 1`,
      [master_id]
    );
    if (!quotation) return res.status(404).json({ message: 'No quotation found' });
 
    // Parse selected_options_for_summary
    let selectedOptionsForSummary = null;
    if (quotation.selected_options_for_summary) {
      if (typeof quotation.selected_options_for_summary === 'object') {
        selectedOptionsForSummary = quotation.selected_options_for_summary;
      } 
      else if (typeof quotation.selected_options_for_summary === 'string') {
        try {
          selectedOptionsForSummary = JSON.parse(quotation.selected_options_for_summary);
        } catch (e) {
          console.error('Error parsing selected_options_for_summary:', e);
          selectedOptionsForSummary = null;
        }
      }
    }
 
    /* ── revision data ── */
    const [[revisionData]] = await connection.query(
      `SELECT total_without_gst, total_with_gst, gst_app_amt
       FROM quotation_revision WHERE qt_id = ? AND revision = ?`,
      [quotation.qt_id, revisionNumber]
    );
    if (!revisionData) {
      return res.status(404).json({ message: `Revision ${revisionNumber} not found` });
    }
 
    /* ── category map ── */
    const [categories] = await connection.query(`SELECT cat_id, cat_name FROM category`);
    const categoryMap = {};
    categories.forEach(c => { categoryMap[c.cat_id] = c.cat_name; });
 
    /* ── options with revision filter ── */
    const [optionRows] = await connection.query(
      `SELECT option_id, option_name, option_order
       FROM quotation_options 
       WHERE qt_id = ? AND revision = ?
       ORDER BY option_order ASC`,
      [quotation.qt_id, revisionNumber]
    );
 
    const GST_PERCENT = 18;
    const gstBase = Number(revisionData.gst_app_amt || 0);
 
    const builtOptions = [];
 
    for (const opt of optionRows) {
      /* products */
      const [mapped] = await connection.query(
        `SELECT
            qm.qm_id, qm.cat_id, qm.kit_id, qm.model_id,
            qm.model_qty AS qty,
            qm.model_price AS price,
            qm.current_revision, qm.kit_qty,
            k.kit_name,
            m.model_no AS model,
            m.image_path,
            m.description,
            m.price AS model_original_price,
            b.brand_name,
            pt.product_type_name
         FROM quotation_mapped qm
         LEFT JOIN kit k ON k.kit_id = qm.kit_id
         JOIN models m ON m.model_id = qm.model_id
         LEFT JOIN brands b ON b.brand_id = m.brand_id
         LEFT JOIN product_types pt ON pt.product_type_id = (
           SELECT product_type_id FROM kit_mapping WHERE model_id = qm.model_id LIMIT 1
         )
         WHERE qm.qt_id = ? AND qm.option_id = ? AND qm.current_revision = ?
         ORDER BY qm.kit_id`,
        [quotation.qt_id, opt.option_id, revisionNumber]
      );
 
      mapped.forEach(row => {
        row.cat_name = categoryMap[row.cat_id] || 'Unknown';
        row.price = Number(row.price || 0);
        row.model_original_price = Number(row.model_original_price || 0);
      });
 
      /* group by kit */
      const kitsMap = {};
      for (const row of mapped) {
        const key = row.kit_id ?? 'single';
        if (!kitsMap[key]) {
          kitsMap[key] = { kit_id: row.kit_id, kit_name: row.kit_name, items: [] };
        }
        kitsMap[key].items.push(row);
      }
 
      /* additional prices with revision filter */
      const [additional] = await connection.query(
        `SELECT add_price_name, price FROM additional_price
         WHERE qt_id = ? AND option_id = ? AND revision = ?`,
        [quotation.qt_id, opt.option_id, revisionNumber]
      );
      const additional_prices = additional.map(a => ({
        add_price_name: a.add_price_name,
        price: Number(a.price || 0),
      }));
 
      /* final offer with revision filter */
      const [finalOfferRows] = await connection.query(
        `SELECT description, percentage, amount, is_default
         FROM quotation_final_offer 
         WHERE qt_id = ? AND option_id = ? AND revision = ?
         LIMIT 1`,
        [quotation.qt_id, opt.option_id, revisionNumber]
      );
      
      /* installments with revision filter */
      const [installmentRows] = await connection.query(
        `SELECT description, percentage, amount 
         FROM quotation_installments 
         WHERE qt_id = ? AND option_id = ? AND revision = ?`,
        [quotation.qt_id, opt.option_id, revisionNumber]
      );
 
      /* per-option totals */
      const optProductsTotal = mapped.reduce(
        (sum, row) => sum + Number(row.price) * Number(row.qty),
        0
      );
      const optAdditionalTotal = additional_prices.reduce((s, a) => s + a.price, 0);
      const optGst = quotation.type === 'with_gst' ? (gstBase * GST_PERCENT) / 100 : 0;
      const optTotalWithGST = optProductsTotal + optAdditionalTotal + optGst;
 
      let finalOfferData = null;
      let finalOfferAmount = 0;
 
      if (finalOfferRows.length > 0 && Number(finalOfferRows[0].amount) > 0) {
        finalOfferData = {
          description: finalOfferRows[0].description || 'FINAL BEST OFFER (OPTIONAL)',
          percentage: Number(finalOfferRows[0].percentage || 0),
          amount: Number(finalOfferRows[0].amount || 0),
        };
        finalOfferAmount = Number(finalOfferRows[0].amount || 0);
      }
 
      const finalizedTotal = optTotalWithGST - finalOfferAmount;
 
      builtOptions.push({
        option_id: opt.option_id,
        option_name: opt.option_name,
        option_order: opt.option_order,
        items: Object.values(kitsMap),
        additional_prices,
        installments: installmentRows.map(i => ({
          description: i.description,
          percentage: Number(i.percentage || 0),
          amount: Number(i.amount || 0),
        })),
        revision_details: {
          total_without_gst: optProductsTotal,
          total_with_gst: optTotalWithGST,
          gst_app_amt: gstBase,
          gst_percent: GST_PERCENT,
          gst_calculated_amount: optGst,
        },
        final_offer: finalOfferData,
        final_offer_amount: finalOfferAmount,
        finalized_total: finalizedTotal,
      });
    }
 
    return res.status(200).json({
      master_id,
      revision: revisionNumber,
      lead,
      quotation: {
        qt_id: quotation.qt_id,
        qt_number: quotation.qt_number,
        type: quotation.type,
        acoustic_terms: quotation.acoustic_terms,
        subject: quotation.subject,
        selected_options_for_summary: selectedOptionsForSummary,
        created_at: quotation.created_at,
        options: builtOptions,
      },
    });
 
  } catch (error) {
    console.error('getQuotationByMasterId Error:', error);
    return res.status(500).json({ message: 'Failed to fetch quotation' });
  } finally {
    connection.release();
  }
};

export const getQuotationByMasterId8 = async (req, res) => {
  const { master_id, revision } = req.params;
  if (!master_id || !revision) {
    return res.status(400).json({ message: 'master_id & revision required' });
  }
 
  const revisionNumber = Number(revision);
  const connection = await db.getConnection();
 
  try {
    /* ── lead ── */
    const [[lead]] = await connection.query(
      `SELECT name, number, city, address FROM raw_data WHERE master_id = ?`,
      [master_id]
    );
 
    /* ── quotation header ── */
    const [[quotation]] = await connection.query(
      `SELECT qt_id, master_id, qt_number, type, created_at, acoustic_terms, subject, selected_options_for_summary
       FROM quotation WHERE master_id = ? LIMIT 1`,
      [master_id]
    );
    if (!quotation) return res.status(404).json({ message: 'No quotation found' });
 
    // Parse selected_options_for_summary
    let selectedOptionsForSummary = null;
    if (quotation.selected_options_for_summary) {
      if (typeof quotation.selected_options_for_summary === 'object') {
        selectedOptionsForSummary = quotation.selected_options_for_summary;
      } 
      else if (typeof quotation.selected_options_for_summary === 'string') {
        try {
          selectedOptionsForSummary = JSON.parse(quotation.selected_options_for_summary);
        } catch (e) {
          console.error('Error parsing selected_options_for_summary:', e);
          selectedOptionsForSummary = null;
        }
      }
    }
 
    /* ── revision data ── */
    const [[revisionData]] = await connection.query(
      `SELECT total_without_gst, total_with_gst, gst_app_amt
       FROM quotation_revision WHERE qt_id = ? AND revision = ?`,
      [quotation.qt_id, revisionNumber]
    );
    if (!revisionData) {
      return res.status(404).json({ message: `Revision ${revisionNumber} not found` });
    }
 
    /* ── category map ── */
    const [categories] = await connection.query(`SELECT cat_id, cat_name FROM category`);
    const categoryMap = {};
    categories.forEach(c => { categoryMap[c.cat_id] = c.cat_name; });
 
    /* ── options with revision filter and subject fields ── */
    const [optionRows] = await connection.query(
      `SELECT option_id, option_name, option_order, subject, subject_type
       FROM quotation_options 
       WHERE qt_id = ? AND revision = ?
       ORDER BY option_order ASC`,
      [quotation.qt_id, revisionNumber]
    );
 
    const GST_PERCENT = 18;
    const gstBase = Number(revisionData.gst_app_amt || 0);
 
    const builtOptions = [];
 
    for (const opt of optionRows) {
      /* products */
      const [mapped] = await connection.query(
        `SELECT
            qm.qm_id, qm.cat_id, qm.kit_id, qm.model_id,
            qm.model_qty AS qty,
            qm.model_price AS price,
            qm.current_revision, qm.kit_qty,
            k.kit_name,
            m.model_no AS model,
            m.image_path,
            m.description,
            m.price AS model_original_price,
            b.brand_name,
            pt.product_type_name
         FROM quotation_mapped qm
         LEFT JOIN kit k ON k.kit_id = qm.kit_id
         JOIN models m ON m.model_id = qm.model_id
         LEFT JOIN brands b ON b.brand_id = m.brand_id
         LEFT JOIN product_types pt ON pt.product_type_id = (
           SELECT product_type_id FROM kit_mapping WHERE model_id = qm.model_id LIMIT 1
         )
         WHERE qm.qt_id = ? AND qm.option_id = ? AND qm.current_revision = ?
         ORDER BY qm.kit_id`,
        [quotation.qt_id, opt.option_id, revisionNumber]
      );
 
      mapped.forEach(row => {
        row.cat_name = categoryMap[row.cat_id] || 'Unknown';
        row.price = Number(row.price || 0);
        row.model_original_price = Number(row.model_original_price || 0);
      });
 
      /* group by kit */
      const kitsMap = {};
      for (const row of mapped) {
        const key = row.kit_id ?? 'single';
        if (!kitsMap[key]) {
          kitsMap[key] = { kit_id: row.kit_id, kit_name: row.kit_name, items: [] };
        }
        kitsMap[key].items.push(row);
      }
 
      /* additional prices with revision filter */
      const [additional] = await connection.query(
        `SELECT add_price_name, price FROM additional_price
         WHERE qt_id = ? AND option_id = ? AND revision = ?`,
        [quotation.qt_id, opt.option_id, revisionNumber]
      );
      const additional_prices = additional.map(a => ({
        add_price_name: a.add_price_name,
        price: Number(a.price || 0),
      }));
 
      /* final offer with revision filter */
      const [finalOfferRows] = await connection.query(
        `SELECT description, percentage, amount, is_default
         FROM quotation_final_offer 
         WHERE qt_id = ? AND option_id = ? AND revision = ?
         LIMIT 1`,
        [quotation.qt_id, opt.option_id, revisionNumber]
      );
      
      /* installments with revision filter */
const [installmentRows] = await connection.query(
  `SELECT description, percentage, amount, payment_mode 
   FROM quotation_installments 
   WHERE qt_id = ? AND option_id = ? AND revision = ?`,
  [quotation.qt_id, opt.option_id, revisionNumber]
);
 
      /* per-option totals */
      const optProductsTotal = mapped.reduce(
        (sum, row) => sum + Number(row.price) * Number(row.qty),
        0
      );
      const optAdditionalTotal = additional_prices.reduce((s, a) => s + a.price, 0);
      const optGst = quotation.type === 'with_gst' ? (gstBase * GST_PERCENT) / 100 : 0;
      const optTotalWithGST = optProductsTotal + optAdditionalTotal + optGst;
 
      let finalOfferData = null;
      let finalOfferAmount = 0;
 
      if (finalOfferRows.length > 0 && Number(finalOfferRows[0].amount) > 0) {
        finalOfferData = {
          description: finalOfferRows[0].description || 'FINAL BEST OFFER (OPTIONAL)',
          percentage: Number(finalOfferRows[0].percentage || 0),
          amount: Number(finalOfferRows[0].amount || 0),
        };
        finalOfferAmount = Number(finalOfferRows[0].amount || 0);
      }
 
      const finalizedTotal = optTotalWithGST - finalOfferAmount;
 
      builtOptions.push({
        option_id: opt.option_id,
        option_name: opt.option_name,
        subject: opt.subject || null,          
        subject_type: opt.subject_type || 'master',  
        option_order: opt.option_order,
        items: Object.values(kitsMap),
        additional_prices,
installments: installmentRows.map(i => ({
  description: i.description,
  percentage: Number(i.percentage || 0),
  amount: Number(i.amount || 0),
  payment_mode: i.payment_mode || 'Online',  // Add payment mode
})),
        revision_details: {
          total_without_gst: optProductsTotal,
          total_with_gst: optTotalWithGST,
          gst_app_amt: gstBase,
          gst_percent: GST_PERCENT,
          gst_calculated_amount: optGst,
        },
        final_offer: finalOfferData,
        final_offer_amount: finalOfferAmount,
        finalized_total: finalizedTotal,
      });
    }
 
    return res.status(200).json({
      master_id,
      revision: revisionNumber,
      lead,
      quotation: {
        qt_id: quotation.qt_id,
        qt_number: quotation.qt_number,
        type: quotation.type,
        acoustic_terms: quotation.acoustic_terms,
        subject: quotation.subject,
        selected_options_for_summary: selectedOptionsForSummary,
        created_at: quotation.created_at,
        options: builtOptions,
      },
    });
 
  } catch (error) {
    console.error('getQuotationByMasterId Error:', error);
    return res.status(500).json({ message: 'Failed to fetch quotation' });
  } finally {
    connection.release();
  }
};


export const getQuotationByMasterId = async (req, res) => {
  const { master_id, revision } = req.params;
  if (!master_id || !revision) {
    return res.status(400).json({ message: 'master_id & revision required' });
  }
 
  const revisionNumber = Number(revision);
  const connection = await db.getConnection();
 
  try {
    const [[lead]] = await connection.query(
      `SELECT name, number, city, address FROM raw_data WHERE master_id = ?`,
      [master_id]
    );
 
    const [[quotation]] = await connection.query(
      `SELECT qt_id, master_id, qt_number, type, quotation_type, created_at, acoustic_terms, subject
       FROM quotation WHERE master_id = ? LIMIT 1`,
      [master_id]
    );
    if (!quotation) return res.status(404).json({ message: 'No quotation found' });
 
    const [[revisionData]] = await connection.query(
      `SELECT total_without_gst, total_with_gst, gst_app_amt, selected_options_for_summary
       FROM quotation_revision WHERE qt_id = ? AND revision = ?`,
      [quotation.qt_id, revisionNumber]
    );
    if (!revisionData) {
      return res.status(404).json({ message: `Revision ${revisionNumber} not found` });
    }
 
    let selectedOptionsForSummary = null;
    if (revisionData.selected_options_for_summary) {
      if (typeof revisionData.selected_options_for_summary === 'object') {
        selectedOptionsForSummary = revisionData.selected_options_for_summary;
      } else if (typeof revisionData.selected_options_for_summary === 'string') {
        try {
          selectedOptionsForSummary = JSON.parse(revisionData.selected_options_for_summary);
        } catch (e) {
          console.error('Error parsing selected_options_for_summary:', e);
          selectedOptionsForSummary = null;
        }
      }
    }
 
    const [categories] = await connection.query(`SELECT cat_id, cat_name FROM category`);
    const categoryMap = {};
    categories.forEach(c => { categoryMap[c.cat_id] = c.cat_name; });
 
    const [optionRows] = await connection.query(
      `SELECT option_id, option_name, option_order, subject, subject_type, floor_name, room_name
       FROM quotation_options 
       WHERE qt_id = ? AND revision = ?
       ORDER BY option_order ASC`,
      [quotation.qt_id, revisionNumber]
    );
 
    const GST_PERCENT = 18;
    const gstBase = Number(revisionData.gst_app_amt || 0);
 
    const builtOptions = [];
 
    for (const opt of optionRows) {
      const [mapped] = await connection.query(
        `SELECT
            qm.qm_id, qm.cat_id, qm.kit_id, qm.model_id,
            qm.model_qty AS qty,
            qm.model_price AS price,
            qm.current_revision, qm.kit_qty,
            k.kit_name,
            m.model_no AS model,
            m.image_path,
            m.description,
            m.price AS model_original_price,
            b.brand_name,
            pt.product_type_name
         FROM quotation_mapped qm
         LEFT JOIN kit k ON k.kit_id = qm.kit_id
         JOIN models m ON m.model_id = qm.model_id
         LEFT JOIN brands b ON b.brand_id = m.brand_id
         LEFT JOIN product_types pt ON pt.product_type_id = (
           SELECT product_type_id FROM kit_mapping WHERE model_id = qm.model_id LIMIT 1
         )
         WHERE qm.qt_id = ? AND qm.option_id = ? AND qm.current_revision = ?
         ORDER BY qm.kit_id`,
        [quotation.qt_id, opt.option_id, revisionNumber]
      );
 
      mapped.forEach(row => {
        row.cat_name = categoryMap[row.cat_id] || 'Unknown';
        row.price = Number(row.price || 0);
        row.model_original_price = Number(row.model_original_price || 0);
      });
 
      const kitsMap = {};
      for (const row of mapped) {
        const key = row.kit_id ?? 'single';
        if (!kitsMap[key]) {
          kitsMap[key] = { kit_id: row.kit_id, kit_name: row.kit_name, items: [] };
        }
        kitsMap[key].items.push(row);
      }
 
      const [additional] = await connection.query(
        `SELECT add_price_name, price FROM additional_price
         WHERE qt_id = ? AND option_id = ? AND revision = ?`,
        [quotation.qt_id, opt.option_id, revisionNumber]
      );
      const additional_prices = additional.map(a => ({
        add_price_name: a.add_price_name,
        price: Number(a.price || 0),
      }));
 
      const [finalOfferRows] = await connection.query(
        `SELECT description, percentage, amount, is_default
         FROM quotation_final_offer 
         WHERE qt_id = ? AND option_id = ? AND revision = ?
         LIMIT 1`,
        [quotation.qt_id, opt.option_id, revisionNumber]
      );
      
      const [installmentRows] = await connection.query(
        `SELECT description, percentage, amount, payment_mode 
         FROM quotation_installments 
         WHERE qt_id = ? AND option_id = ? AND revision = ?`,
        [quotation.qt_id, opt.option_id, revisionNumber]
      );
 
      const optProductsTotal = mapped.reduce(
        (sum, row) => sum + Number(row.price) * Number(row.qty),
        0
      );
      const optAdditionalTotal = additional_prices.reduce((s, a) => s + a.price, 0);
      const optGst = quotation.type === 'with_gst' ? (gstBase * GST_PERCENT) / 100 : 0;
      const optTotalWithGST = optProductsTotal + optAdditionalTotal + optGst;
 
      let finalOfferData = null;
      let finalOfferAmount = 0;
 
      if (finalOfferRows.length > 0 && Number(finalOfferRows[0].amount) > 0) {
        finalOfferData = {
          description: finalOfferRows[0].description || 'FINAL BEST OFFER (OPTIONAL)',
          percentage: Number(finalOfferRows[0].percentage || 0),
          amount: Number(finalOfferRows[0].amount || 0),
        };
        finalOfferAmount = Number(finalOfferRows[0].amount || 0);
      }
 
      const finalizedTotal = optTotalWithGST - finalOfferAmount;
 
      builtOptions.push({
        option_id: opt.option_id,
        option_name: opt.option_name,
        subject: opt.subject || null,
        subject_type: opt.subject_type || 'master',
        floor_name: opt.floor_name || null,
        room_name: opt.room_name || null,
        option_order: opt.option_order,
        items: Object.values(kitsMap),
        additional_prices,
        installments: installmentRows.map(i => ({
          description: i.description,
          percentage: Number(i.percentage || 0),
          amount: Number(i.amount || 0),
          payment_mode: i.payment_mode || 'Online',
        })),
        revision_details: {
          total_without_gst: optProductsTotal,
          total_with_gst: optTotalWithGST,
          gst_app_amt: gstBase,
          gst_percent: GST_PERCENT,
          gst_calculated_amount: optGst,
        },
        final_offer: finalOfferData,
        final_offer_amount: finalOfferAmount,
        finalized_total: finalizedTotal,
      });
    }
 
    return res.status(200).json({
      master_id,
      revision: revisionNumber,
      lead,
      quotation: {
        qt_id: quotation.qt_id,
        qt_number: quotation.qt_number,
        type: quotation.type,
        quotation_type: quotation.quotation_type || 'demo',  
        acoustic_terms: quotation.acoustic_terms,
        subject: quotation.subject,
        selected_options_for_summary: selectedOptionsForSummary,
        created_at: quotation.created_at,
        options: builtOptions,
      },
    });
 
  } catch (error) {
    console.error('getQuotationByMasterId Error:', error);
    return res.status(500).json({ message: 'Failed to fetch quotation' });
  } finally {
    connection.release();
  }
};




export const getQuotationRevisionsByMasterId1 = async (req, res) => {
  const { master_id } = req.params;

  if (!master_id) {
    return res.status(400).json({ message: 'master_id is required' });
  }

  const connection = await db.getConnection();

  try {
    /** LEAD DETAILS **/
    const [[lead]] = await connection.query(
      `SELECT name, number, city FROM raw_data WHERE master_id = ?`,
      [master_id],
    );

    if (!lead) {
      return res.status(200).json({
        master_id,
        lead: null,
        quotations: [],
        message: 'No data found for this master_id'
      });
    }

    /** QUOTATIONS **/
    const [quotations] = await connection.query(
      `SELECT 
         q.qt_id,
         q.qt_number,
         q.type,
         q.created_at,
         q.updated_at,
         q.created_by,
         q.updated_by,
         uc.name AS created_by_name,
         uu.name AS updated_by_name
       FROM quotation q
       LEFT JOIN users uc ON uc.user_id = q.created_by
       LEFT JOIN users uu ON uu.user_id = q.updated_by
       WHERE q.master_id = ?
       ORDER BY q.qt_id DESC`,
      [master_id],
    );

    // Process quotations only if they exist
    if (quotations.length > 0) {
      for (let qt of quotations) {
        /** REVISION META (quotation_revision) **/
        const [revisionMeta] = await connection.query(
          `SELECT revision, total_without_gst, total_with_gst, created_at
           FROM quotation_revision
           WHERE qt_id = ?
           ORDER BY revision ASC`,
          [qt.qt_id],
        );

        /** DISTINCT REVISION NUMBERS FROM MAPPED **/
        const [mappedRevisions] = await connection.query(
          `SELECT DISTINCT current_revision
           FROM quotation_mapped
           WHERE qt_id = ?
           ORDER BY current_revision ASC`,
          [qt.qt_id],
        );

        qt.revisions = [];

        for (let rev of mappedRevisions) {
          const revisionNumber = rev.current_revision;

          /** MAPPED DETAILS **/
          const [mapped] = await connection.query(
            `SELECT 
               qm.qm_id,
               qm.cat_id,
               qm.kit_id,
               k.kit_name,
               qm.kit_qty,
               qm.model_id,
               qm.model_qty,
               qm.model_price,
               qm.current_revision,
               m.model_no AS model,
               m.image_path,
               m.description AS model_description,
               b.brand_id,
               b.brand_name,
               pt.product_type_id,
               pt.product_type_name
             FROM quotation_mapped qm
             LEFT JOIN kit k ON k.kit_id = qm.kit_id
             JOIN models m ON m.model_id = qm.model_id
             LEFT JOIN brands b ON b.brand_id = m.brand_id
             LEFT JOIN product_types pt ON pt.product_type_id = (
               SELECT product_type_id 
               FROM kit_mapping 
               WHERE model_id = qm.model_id 
               LIMIT 1
             )
             WHERE qm.qt_id = ?
               AND qm.current_revision = ?
             ORDER BY qm.kit_id`,
            [qt.qt_id, revisionNumber],
          );

          /** KIT GROUPING **/
          const kitsMap = {};
          for (let row of mapped) {
            const key = row.kit_id ?? 'single';
            if (!kitsMap[key]) {
              kitsMap[key] = {
                kit_id: row.kit_id,
                kit_name: row.kit_name,
                kit_qty: row.kit_qty,
                items: [],
              };
            }

            kitsMap[key].items.push({
              model_id: row.model_id,
              model: row.model,
              model_qty: row.model_qty,
              model_price: row.model_price,
              brand_id: row.brand_id,
              brand_name: row.brand_name,
              product_type_id: row.product_type_id,
              product_type_name: row.product_type_name,
              image_path: row.image_path,
              model_description: row.model_description,
            });
          }

          /** FIND TOTALS FROM quotation_revision **/
          const totals =
            revisionMeta.find((r) => r.revision === revisionNumber) || null;

          /** ADDITIONAL PRICES **/
          const [additional] = await connection.query(
            `SELECT add_id, add_price_name, price 
             FROM additional_price 
             WHERE qt_id = ?`,
            [qt.qt_id],
          );

          qt.revisions.push({
            revision: revisionNumber,
            kits: Object.values(kitsMap),
            additional_prices: additional,
            totals: totals
              ? {
                  without_gst: totals.total_without_gst,
                  with_gst: totals.total_with_gst,
                }
              : null,
            created_at: totals?.created_at || qt.created_at,
            is_latest:
              revisionNumber ===
              Math.max(...mappedRevisions.map((x) => x.current_revision)),
          });
        }
      }
    }

    return res.status(200).json({
      master_id,
      lead: lead || null,
      quotations: quotations || [],
      message: quotations.length === 0 ? 'No quotations found for this lead' : 'Quotations retrieved successfully'
    });
  } catch (error) {
    console.error('❌ getQuotationRevisionsByMasterId Error:', error);
    return res
      .status(500)
      .json({ message: 'Failed to fetch quotation revisions' });
  } finally {
    connection.release();
  }
};


export const getQuotationRevisionsByMasterId = async (req, res) => {
  const { master_id } = req.params;

  if (!master_id) {
    return res.status(400).json({ message: 'master_id is required' });
  }

  const connection = await db.getConnection();

  try {
    /** LEAD DETAILS **/
    const [[lead]] = await connection.query(
      `SELECT name, number, city FROM raw_data WHERE master_id = ?`,
      [master_id],
    );

    if (!lead) {
      return res.status(200).json({
        master_id,
        lead: null,
        quotations: [],
        message: 'No data found for this master_id'
      });
    }

    /** QUOTATIONS **/
    const [quotations] = await connection.query(
      `SELECT 
         q.qt_id,
         q.qt_number,
         q.type,
         q.quotation_type,  
         q.created_at,
         q.updated_at,
         q.created_by,
         q.updated_by,
         uc.name AS created_by_name,
         uu.name AS updated_by_name
       FROM quotation q
       LEFT JOIN users uc ON uc.user_id = q.created_by
       LEFT JOIN users uu ON uu.user_id = q.updated_by
       WHERE q.master_id = ?
       ORDER BY q.qt_id DESC`,
      [master_id],
    );

    if (quotations.length > 0) {
      for (let qt of quotations) {
        /** REVISION META **/
        const [revisionMeta] = await connection.query(
          `SELECT revision, total_without_gst, total_with_gst, created_at, selected_options_for_summary
           FROM quotation_revision
           WHERE qt_id = ?
           ORDER BY revision ASC`,
          [qt.qt_id],
        );

        /** DISTINCT REVISION NUMBERS FROM MAPPED **/
        const [mappedRevisions] = await connection.query(
          `SELECT DISTINCT current_revision
           FROM quotation_mapped
           WHERE qt_id = ?
           ORDER BY current_revision ASC`,
          [qt.qt_id],
        );

        qt.revisions = [];

        for (let rev of mappedRevisions) {
          const revisionNumber = rev.current_revision;
          
          const revMeta = revisionMeta.find(r => r.revision === revisionNumber);
          
          let selectedOptionsForSummary = null;
          if (revMeta && revMeta.selected_options_for_summary) {
            try {
              selectedOptionsForSummary = typeof revMeta.selected_options_for_summary === 'string'
                ? JSON.parse(revMeta.selected_options_for_summary)
                : revMeta.selected_options_for_summary;
            } catch (e) {
              console.error('Error parsing selected_options_for_summary:', e);
            }
          }

          const [mapped] = await connection.query(
            `SELECT 
               qm.qm_id,
               qm.cat_id,
               qm.kit_id,
               k.kit_name,
               qm.kit_qty,
               qm.model_id,
               qm.model_qty,
               qm.model_price,
               qm.current_revision,
               m.model_no AS model,
               m.image_path,
               m.description AS model_description,
               b.brand_id,
               b.brand_name,
               pt.product_type_id,
               pt.product_type_name
             FROM quotation_mapped qm
             LEFT JOIN kit k ON k.kit_id = qm.kit_id
             JOIN models m ON m.model_id = qm.model_id
             LEFT JOIN brands b ON b.brand_id = m.brand_id
             LEFT JOIN product_types pt ON pt.product_type_id = (
               SELECT product_type_id 
               FROM kit_mapping 
               WHERE model_id = qm.model_id 
               LIMIT 1
             )
             WHERE qm.qt_id = ?
               AND qm.current_revision = ?
             ORDER BY qm.kit_id`,
            [qt.qt_id, revisionNumber],
          );

          const kitsMap = {};
          for (let row of mapped) {
            const key = row.kit_id ?? 'single';
            if (!kitsMap[key]) {
              kitsMap[key] = {
                kit_id: row.kit_id,
                kit_name: row.kit_name,
                kit_qty: row.kit_qty,
                items: [],
              };
            }

            kitsMap[key].items.push({
              model_id: row.model_id,
              model: row.model,
              model_qty: row.model_qty,
              model_price: row.model_price,
              brand_id: row.brand_id,
              brand_name: row.brand_name,
              product_type_id: row.product_type_id,
              product_type_name: row.product_type_name,
              image_path: row.image_path,
              model_description: row.model_description,
            });
          }

          const totals = revMeta || null;

          const [additional] = await connection.query(
            `SELECT add_id, add_price_name, price 
             FROM additional_price 
             WHERE qt_id = ? AND revision = ?`,
            [qt.qt_id, revisionNumber],
          );

          qt.revisions.push({
            revision: revisionNumber,
            kits: Object.values(kitsMap),
            additional_prices: additional,
            selected_options_for_summary: selectedOptionsForSummary,
            totals: totals
              ? {
                  without_gst: totals.total_without_gst,
                  with_gst: totals.total_with_gst,
                }
              : null,
            created_at: totals?.created_at || qt.created_at,
            is_latest:
              revisionNumber ===
              Math.max(...mappedRevisions.map((x) => x.current_revision)),
          });
        }
      }
    }

    return res.status(200).json({
      master_id,
      lead: lead || null,
      quotations: quotations || [],
      message: quotations.length === 0 ? 'No quotations found for this lead' : 'Quotations retrieved successfully'
    });
  } catch (error) {
    console.error('❌ getQuotationRevisionsByMasterId Error:', error);
    return res.status(500).json({ message: 'Failed to fetch quotation revisions' });
  } finally {
    connection.release();
  }
};


// export const updateQuotationWithRevision = async (req, res) => {
//   const { qt_id } = req.params;
//   const { qt_number, type, categories = [], additional_prices = [] } = req.body;

//   if (!qt_id) {
//     return res.status(400).json({ message: 'qt_id is required' });
//   }

//   const connection = await db.getConnection();

//   try {
//     await connection.beginTransaction();

//     const userId = req.session?.user?.id;
//     if (!userId) {
//       return res.status(401).json({ message: 'User not authenticated' });
//     }

//     // Fetch quotation
//     const [[quotation]] = await connection.query(
//       `SELECT qt_id, master_id FROM quotation WHERE qt_id = ?`,
//       [qt_id]
//     );
//     if (!quotation) {
//       await connection.rollback();
//       return res.status(404).json({ message: 'Quotation not found' });
//     }

//     // Get new revision number
//     const [[revRow]] = await connection.query(
//       `SELECT MAX(current_revision) AS lastRevision FROM quotation_mapped WHERE qt_id = ?`,
//       [qt_id]
//     );
//     const newRevision = (revRow.lastRevision || 0) + 1;

//     // ================== GET EXISTING PRODUCTS ==================
//     const [existingProducts] = await connection.query(
//       `SELECT * FROM quotation_mapped WHERE qt_id = ? AND current_revision = ?`,
//       [qt_id, revRow.lastRevision || 0]
//     );

//     // ================== MERGE EXISTING + NEW PRODUCTS ==================
//     const allProducts = [];

//     // Add existing products
//     existingProducts.forEach(p => {
//       allProducts.push({
//         qt_id,
//         cat_id: p.cat_id,
//         kit_id: p.kit_id,
//         model_id: p.model_id,
//         kit_qty: p.kit_qty,
//         model_qty: p.model_qty,
//         model_price: p.model_price,
//         created_by: p.created_by,
//       });
//     });

//     // Add new products from payload
//     for (const cat of categories) {
//       for (const prod of cat.products) {
//         allProducts.push({
//           qt_id,
//           cat_id: cat.cat_id || null,
//           kit_id: cat.kit_id || null,
//           model_id: prod.model_id,
//           kit_qty: cat.kit_qty || 1,
//           model_qty: prod.model_qty,
//           model_price: prod.model_price,
//           created_by: userId,
//         });
//       }
//     }

//     // ================== CALCULATE TOTALS ==================
//     let baseTotal = allProducts.reduce(
//       (sum, p) => sum + Number(p.model_qty) * Number(p.model_price) * (Number(p.kit_qty) || 1),
//       0
//     );

//     const additionalTotal = additional_prices.reduce((sum, a) => sum + Number(a.price || 0), 0);
//     const grandTotal = baseTotal + additionalTotal;

//     const totalWithoutGST = type === 'without_gst' ? grandTotal : null;
//     const totalWithGST = type === 'with_gst' ? grandTotal * 1.18 : null;

//     // ================== INSERT INTO NEW REVISION ==================
//     const [revInsert] = await connection.query(
//       `INSERT INTO quotation_revision
//        (qt_id, revision, total_without_gst, total_with_gst, created_at)
//        VALUES (?, ?, ?, ?, NOW())`,
//       [qt_id, newRevision, totalWithoutGST || 0, totalWithGST || 0]
//     );

//     // Insert all products into quotation_mapped with new revision
//     for (const p of allProducts) {
//       await connection.query(
//         `INSERT INTO quotation_mapped
//          (qt_id, cat_id, kit_id, model_id, kit_qty, model_qty, model_price, current_revision, created_by)
//          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//         [
//           p.qt_id,
//           p.cat_id,
//           p.kit_id,
//           p.model_id,
//           p.kit_qty,
//           p.model_qty,
//           p.model_price,
//           newRevision,
//           p.created_by,
//         ]
//       );
//     }

//     // ================== UPDATE QUOTATION HEADER ==================
//     await connection.query(
//       `UPDATE quotation
//        SET qt_number = ?,
//            type = ?,
//            total_price = ?,
//            without_gst_total = ?,
//            with_gst_total = ?,
//            updated_by = ?,
//            updated_at = NOW()
//        WHERE qt_id = ?`,
//       [
//         qt_number,
//         type,
//         grandTotal,
//         totalWithoutGST,
//         totalWithGST,
//         userId,
//         qt_id,
//       ]
//     );

//     // ================== UPDATE ADDITIONAL PRICES ==================
//     await connection.query(`DELETE FROM additional_price WHERE qt_id = ?`, [qt_id]);
//     for (const ap of additional_prices) {
//       await connection.query(
//         `INSERT INTO additional_price
//          (qt_id, add_price_name, price, created_at)
//          VALUES (?, ?, ?, NOW())`,
//         [qt_id, ap.add_price_name, ap.price]
//       );
//     }

//     await connection.commit();

//     return res.status(200).json({
//       message: 'Quotation updated successfully',
//       qt_id,
//       new_revision: newRevision,
//       rev_id: revInsert.insertId,
//     });

//   } catch (error) {
//     await connection.rollback();
//     console.error('❌ updateQuotationWithRevision Error:', error);
//     return res.status(500).json({ message: 'Failed to update quotation' });
//   } finally {
//     connection.release();
//   }
// };



export const updateQuotationWithRevision1 = async (req, res) => {
  const { qt_id } = req.params;
  const { qt_number, type, categories = [], additional_prices = [] } = req.body;

  if (!qt_id) return res.status(400).json({ message: 'qt_id is required' });

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const userId = req.session?.user?.id;
    if (!userId)
      return res.status(401).json({ message: 'User not authenticated' });

    // Check quotation exists
    const [[quotation]] = await connection.query(
      `SELECT qt_id FROM quotation WHERE qt_id = ?`,
      [qt_id],
    );
    if (!quotation) {
      await connection.rollback();
      return res.status(404).json({ message: 'Quotation not found' });
    }

    // Fetch last revision
    const [[revRow]] = await connection.query(
      `SELECT MAX(current_revision) AS lastRevision FROM quotation_mapped WHERE qt_id = ?`,
      [qt_id],
    );
    const lastRevision = revRow?.lastRevision || 0;
    const newRevision = lastRevision + 1;

    // ===========================
    // NO MERGE — PAYLOAD ONLY
    // ===========================
    const finalRows = [];

    categories.forEach((cat) => {
      (cat.products || []).forEach((prod) => {
        finalRows.push({
          qt_id,
          cat_id: cat.cat_id || null,
          kit_id: cat.kit_id || null,
          model_id: prod.model_id,
          kit_qty: cat.kit_qty || 1,
          model_qty: prod.model_qty || 0,
          model_price: prod.model_price || 0,
          created_by: userId,
        });
      });
    });

    // ===========================
    // CALCULATE TOTALS
    // ===========================
    const baseTotal = finalRows.reduce(
      (sum, p) => sum + p.model_qty * p.model_price * (p.kit_qty || 1),
      0,
    );

    const additionalTotal = additional_prices.reduce(
      (sum, a) => sum + Number(a.price || 0),
      0,
    );

    const grandTotal = baseTotal + additionalTotal;

    const totalWithoutGST = type === 'without_gst' ? grandTotal : 0;
    const totalWithGST = type === 'with_gst' ? grandTotal * 1.18 : null;

    // Insert revision header
    const [revInsert] = await connection.query(
      `
      INSERT INTO quotation_revision
      (qt_id, revision, total_without_gst, total_with_gst, created_at)
      VALUES (?, ?, ?, ?, NOW())
      `,
      [qt_id, newRevision, totalWithoutGST, totalWithGST],
    );

    // Insert payload-only mapped rows
    for (const p of finalRows) {
      await connection.query(
        `
        INSERT INTO quotation_mapped
        (qt_id, cat_id, kit_id, model_id, kit_qty, model_qty, model_price, current_revision, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          p.qt_id,
          p.cat_id,
          p.kit_id,
          p.model_id,
          p.kit_qty,
          p.model_qty,
          p.model_price,
          newRevision,
          p.created_by,
        ],
      );
    }

    // Update additional prices (overwrite)
    await connection.query(`DELETE FROM additional_price WHERE qt_id = ?`, [
      qt_id,
    ]);

    for (const ap of additional_prices) {
      await connection.query(
        `
        INSERT INTO additional_price
        (qt_id, add_price_name, price, created_at)
        VALUES (?, ?, ?, NOW())
        `,
        [qt_id, ap.add_price_name, ap.price],
      );
    }

    // Update main quotation header
    await connection.query(
      `
      UPDATE quotation
      SET qt_number = ?, type = ?, total_price = ?, without_gst_total = ?, with_gst_total = ?, updated_by = ?, updated_at = NOW()
      WHERE qt_id = ?
      `,
      [
        qt_number,
        type,
        grandTotal,
        totalWithoutGST,
        totalWithGST,
        userId,
        qt_id,
      ],
    );

    await connection.commit();

    return res.status(200).json({
      message: 'Quotation updated + revision created',
      qt_id,
      revision: newRevision,
      rev_id: revInsert.insertId,
    });
  } catch (err) {
    await connection.rollback();
    console.error('updateQuotationWithRevision ERROR:', err);
    return res.status(500).json({ message: 'Failed to update quotation' });
  } finally {
    connection.release();
  }
};

export const updateQuotationWithRevision2 = async (req, res) => {
  const { qt_id } = req.params;

  const {
    qt_number,
    type,
    categories = [],
    additional_prices = [],

    // 🔴 NEW
    acoustic_terms = null,
  } = req.body;

  if (!qt_id) return res.status(400).json({ message: 'qt_id is required' });

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const userId = req.session?.user?.id;
    if (!userId)
      return res.status(401).json({ message: 'User not authenticated' });

    // Fetch quotation (also get existing acoustic_terms)
    const [[quotation]] = await connection.query(
      `SELECT qt_number, acoustic_terms FROM quotation WHERE qt_id = ?`,
      [qt_id],
    );

    if (!quotation) {
      await connection.rollback();
      return res.status(404).json({ message: 'Quotation not found' });
    }

    const originalQtNumber = quotation.qt_number;

    // 🔴 Preserve old acoustic terms if frontend sends nothing
    const finalAcousticTerms =
      acoustic_terms !== null ? acoustic_terms : quotation.acoustic_terms;

    // Fetch last revision
    const [[revRow]] = await connection.query(
      `SELECT MAX(current_revision) AS lastRevision FROM quotation_mapped WHERE qt_id = ?`,
      [qt_id],
    );

    const lastRevision = revRow?.lastRevision || 0;
    const newRevision = lastRevision + 1;

    // Build mapped rows
    const finalRows = [];
    categories.forEach((cat) => {
      (cat.products || []).forEach((prod) => {
        finalRows.push({
          qt_id,
          cat_id: cat.cat_id || null,
          kit_id: cat.kit_id || null,
          model_id: prod.model_id,
          kit_qty: cat.kit_qty || 1,
          model_qty: prod.model_qty || 0,
          model_price: prod.model_price || 0,
          created_by: userId,
        });
      });
    });

    // Totals
    const baseTotal = finalRows.reduce(
      (sum, p) => sum + p.model_qty * p.model_price * (p.kit_qty || 1),
      0,
    );

    const additionalTotal = additional_prices.reduce(
      (sum, a) => sum + Number(a.price || 0),
      0,
    );

    const grandTotal = baseTotal + additionalTotal;

    const totalWithoutGST = type === 'without_gst' ? grandTotal : 0;
    const totalWithGST = type === 'with_gst' ? grandTotal * 1.18 : null;

    // Insert revision header
    const [revInsert] = await connection.query(
      `
      INSERT INTO quotation_revision
      (qt_id, revision, total_without_gst, total_with_gst, created_at)
      VALUES (?, ?, ?, ?, NOW())
      `,
      [qt_id, newRevision, totalWithoutGST, totalWithGST],
    );

    // Insert mapped rows
    for (const p of finalRows) {
      await connection.query(
        `
        INSERT INTO quotation_mapped
        (qt_id, cat_id, kit_id, model_id, kit_qty, model_qty, model_price, current_revision, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          p.qt_id,
          p.cat_id,
          p.kit_id,
          p.model_id,
          p.kit_qty,
          p.model_qty,
          p.model_price,
          newRevision,
          p.created_by,
        ],
      );
    }

    // Replace additional prices
    await connection.query(`DELETE FROM additional_price WHERE qt_id = ?`, [
      qt_id,
    ]);

    for (const ap of additional_prices) {
      await connection.query(
        `
        INSERT INTO additional_price
        (qt_id, add_price_name, price, created_at)
        VALUES (?, ?, ?, NOW())
        `,
        [qt_id, ap.add_price_name, ap.price],
      );
    }

    // 🔴 Update quotation header INCLUDING acoustic_terms
    await connection.query(
      `
      UPDATE quotation
      SET
        type = ?,
        acoustic_terms = ?,
        total_price = ?,
        without_gst_total = ?,
        with_gst_total = ?,
        updated_by = ?,
        updated_at = NOW()
      WHERE qt_id = ?
      `,
      [
        type,
        finalAcousticTerms,
        grandTotal,
        totalWithoutGST,
        totalWithGST,
        userId,
        qt_id,
      ],
    );

    await connection.commit();

    return res.status(200).json({
      message: 'Quotation updated + revision created',
      qt_id,
      qt_number: originalQtNumber,
      revision: newRevision,
      rev_id: revInsert.insertId,
    });
  } catch (err) {
    await connection.rollback();
    console.error('updateQuotationWithRevision ERROR:', err);
    return res.status(500).json({ message: 'Failed to update quotation' });
  } finally {
    connection.release();
  }
}; 

export const updateQuotationWithRevision3 = async (req, res) => {
  const { qt_id } = req.params;

  const {
    type,
    categories = [],
    additional_prices = [],
    gst_percent = 18,
    gst_app_amt = 0,
    acoustic_terms = null,
  } = req.body;

  if (!qt_id)
    return res.status(400).json({ message: "qt_id is required" });

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const userId = req.session?.user?.id;
    if (!userId)
      return res.status(401).json({ message: "User not authenticated" });

    /* ===============================
       FETCH QUOTATION
    =============================== */

    const [[quotation]] = await connection.query(
      `SELECT qt_number, acoustic_terms 
       FROM quotation 
       WHERE qt_id = ?`,
      [qt_id]
    );

    if (!quotation) {
      await connection.rollback();
      return res.status(404).json({ message: "Quotation not found" });
    }

    const originalQtNumber = quotation.qt_number;

    const finalAcousticTerms =
      acoustic_terms !== null ? acoustic_terms : quotation.acoustic_terms;

    /* ===============================
       GET LAST REVISION
    =============================== */

    const [[revRow]] = await connection.query(
      `SELECT MAX(current_revision) AS lastRevision
       FROM quotation_mapped
       WHERE qt_id = ?`,
      [qt_id]
    );

    const lastRevision = revRow?.lastRevision || 0;
    const newRevision = lastRevision + 1;

    /* ===============================
       BUILD FINAL ROWS
    =============================== */

    const finalRows = [];

    categories.forEach((cat) => {
      (cat.products || []).forEach((prod) => {
        finalRows.push({
          qt_id,
          cat_id: cat.cat_id || null,
          kit_id: cat.kit_id || null,
          model_id: prod.model_id,
          kit_qty: cat.kit_qty || 1,
          model_qty: prod.model_qty || 0,
          model_price: prod.model_price || 0,
          created_by: userId,
        });
      });
    });

    /* ===============================
       PRODUCTS TOTAL
    =============================== */

    let productsTotal = 0;

    for (const row of finalRows) {
      productsTotal +=
        Number(row.model_price || 0) *
        Number(row.model_qty || 0) *
        Number(row.kit_qty || 1);
    }

    /* ===============================
       ADDITIONAL TOTAL
    =============================== */

    const additionalTotal = additional_prices.reduce(
      (sum, a) => sum + Number(a.price || 0),
      0
    );

    /* ===============================
       GST CALCULATION
    =============================== */

    let gstAmount = 0;

    if (type === "with_gst" && Number(gst_app_amt) > 0) {
      gstAmount = Number(gst_app_amt) * (gst_percent / 100);
    }

    /* ===============================
       FINAL PROJECT TOTAL
    =============================== */

    const finalTotal =
      productsTotal +
      additionalTotal +
      (type === "with_gst" ? gstAmount : 0);

    /* ===============================
       INSERT REVISION
    =============================== */

    const [revInsert] = await connection.query(
      `INSERT INTO quotation_revision
        (qt_id, revision, total_without_gst, total_with_gst, gst_app_amt, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [
        qt_id,
        newRevision,
        productsTotal,
        finalTotal,
        type === "with_gst" ? Number(gst_app_amt) : 0,
      ]
    );

    const rev_id = revInsert.insertId;

    /* ===============================
       INSERT PRODUCTS
    =============================== */

    for (const p of finalRows) {
      await connection.query(
        `INSERT INTO quotation_mapped
          (qt_id, cat_id, kit_id, model_id,
           kit_qty, model_qty, model_price,
           current_revision, created_by, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          p.qt_id,
          p.cat_id,
          p.kit_id,
          p.model_id,
          Number(p.kit_qty),
          Number(p.model_qty),
          Number(p.model_price),
          newRevision,
          p.created_by,
        ]
      );
    }

    /* ===============================
       REPLACE ADDITIONAL PRICES
    =============================== */

    await connection.query(
      `DELETE FROM additional_price WHERE qt_id = ?`,
      [qt_id]
    );

    for (const ap of additional_prices) {
      await connection.query(
        `INSERT INTO additional_price
          (qt_id, add_price_name, price, created_at)
         VALUES (?, ?, ?, NOW())`,
        [qt_id, ap.add_price_name, Number(ap.price || 0)]
      );
    }

    /* ===============================
       UPDATE QUOTATION HEADER
    =============================== */

    await connection.query(
      `UPDATE quotation
       SET
         type = ?,
         acoustic_terms = ?,
         total_price = ?, 
         without_gst_total = ?, 
         with_gst_total = ?, 
         updated_by = ?,
         updated_at = NOW()
       WHERE qt_id = ?`,
      [
        type,
        finalAcousticTerms,
        productsTotal,
        productsTotal,
        finalTotal,
        userId,
        qt_id,
      ]
    );

    await connection.commit();

    return res.status(200).json({
      message: "Quotation updated + revision created",
      qt_id,
      qt_number: originalQtNumber,
      revision: newRevision,
      rev_id,

      productsTotal,
      additionalTotal,
      gst_app_amt: type === "with_gst" ? gst_app_amt : 0,
      gstAmount,
      finalTotal,
    });

  } catch (err) {
    await connection.rollback();
    console.error("updateQuotationWithRevision ERROR:", err);
    return res.status(500).json({ message: "Failed to update quotation" });
  } finally {
    connection.release();
  }
};


export const updateQuotationWithRevision5 = async (req, res) => {
  const { qt_id } = req.params;

  const {
    type,
    categories = [],
    additional_prices = [],
    gst_percent = 18,
    gst_app_amt = 0,
    acoustic_terms = null,

    installments = [] // ✅ NEW
  } = req.body;

  if (!qt_id)
    return res.status(400).json({ message: "qt_id is required" });

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const userId = req.session?.user?.id;
    if (!userId)
      return res.status(401).json({ message: "User not authenticated" });

    /* ===============================
       FETCH QUOTATION
    =============================== */

    const [[quotation]] = await connection.query(
      `SELECT qt_number, acoustic_terms 
       FROM quotation 
       WHERE qt_id = ?`,
      [qt_id]
    );

    if (!quotation) {
      await connection.rollback();
      return res.status(404).json({ message: "Quotation not found" });
    }

    const originalQtNumber = quotation.qt_number;

    const finalAcousticTerms =
      acoustic_terms !== null ? acoustic_terms : quotation.acoustic_terms;

    /* ===============================
       GET LAST REVISION
    =============================== */

    const [[revRow]] = await connection.query(
      `SELECT MAX(current_revision) AS lastRevision
       FROM quotation_mapped
       WHERE qt_id = ?`,
      [qt_id]
    );

    const lastRevision = revRow?.lastRevision || 0;
    const newRevision = lastRevision + 1;

    /* ===============================
       BUILD FINAL ROWS
    =============================== */

    const finalRows = [];

    categories.forEach((cat) => {
      (cat.products || []).forEach((prod) => {
        finalRows.push({
          qt_id,
          cat_id: cat.cat_id || null,
          kit_id: cat.kit_id || null,
          model_id: prod.model_id,
          kit_qty: cat.kit_qty || 1,
          model_qty: prod.model_qty || 0,
          model_price: prod.model_price || 0,
          created_by: userId,
        });
      });
    });

    /* ===============================
       PRODUCTS TOTAL
    =============================== */

    let productsTotal = 0;

    for (const row of finalRows) {
      productsTotal +=
        Number(row.model_price || 0) *
        Number(row.model_qty || 0) *
        Number(row.kit_qty || 1);
    }

    /* ===============================
       ADDITIONAL TOTAL
    =============================== */

    const additionalTotal = additional_prices.reduce(
      (sum, a) => sum + Number(a.price || 0),
      0
    );

    /* ===============================
       GST CALCULATION
    =============================== */

    let gstAmount = 0;

    if (type === "with_gst" && Number(gst_app_amt) > 0) {
      gstAmount = Number(gst_app_amt) * (gst_percent / 100);
    }

    /* ===============================
       FINAL PROJECT TOTAL
    =============================== */

    const finalTotal =
      productsTotal +
      additionalTotal +
      (type === "with_gst" ? gstAmount : 0);

    /* ===============================
       INSERT REVISION
    =============================== */

    const [revInsert] = await connection.query(
      `INSERT INTO quotation_revision
        (qt_id, revision, total_without_gst, total_with_gst, gst_app_amt, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [
        qt_id,
        newRevision,
        productsTotal,
        finalTotal,
        type === "with_gst" ? Number(gst_app_amt) : 0,
      ]
    );

    const rev_id = revInsert.insertId;

    /* ===============================
       INSERT PRODUCTS
    =============================== */

    for (const p of finalRows) {
      await connection.query(
        `INSERT INTO quotation_mapped
          (qt_id, cat_id, kit_id, model_id,
           kit_qty, model_qty, model_price,
           current_revision, created_by, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          p.qt_id,
          p.cat_id,
          p.kit_id,
          p.model_id,
          Number(p.kit_qty),
          Number(p.model_qty),
          Number(p.model_price),
          newRevision,
          p.created_by,
        ]
      );
    }

    /* ===============================
       REPLACE ADDITIONAL PRICES
    =============================== */

    await connection.query(
      `DELETE FROM additional_price WHERE qt_id = ?`,
      [qt_id]
    );

    for (const ap of additional_prices) {
      await connection.query(
        `INSERT INTO additional_price
          (qt_id, add_price_name, price, created_at)
         VALUES (?, ?, ?, NOW())`,
        [qt_id, ap.add_price_name, Number(ap.price || 0)]
      );
    }

    /* ===============================
       ✅ REPLACE INSTALLMENTS (NEW)
    =============================== */

    await connection.query(
      `DELETE FROM quotation_installments WHERE qt_id = ?`,
      [qt_id]
    );

    if (installments.length > 0) {
      let totalPercent = 0;

      for (const inst of installments) {
        totalPercent += Number(inst.percentage || 0);
      }

      if (totalPercent > 100) {
        throw new Error("Installment percentage cannot exceed 100%");
      }

      for (const inst of installments) {
        await connection.query(
          `INSERT INTO quotation_installments
             (qt_id, description, percentage, amount, created_at)
           VALUES (?, ?, ?, ?, NOW())`,
          [
            qt_id,
            inst.description || '',
            Number(inst.percentage || 0),
            Number(inst.amount || 0),
          ]
        );
      }
    }

    /* ===============================
       UPDATE QUOTATION HEADER
    =============================== */

    await connection.query(
      `UPDATE quotation
       SET
         type = ?,
         acoustic_terms = ?,
         total_price = ?, 
         without_gst_total = ?, 
         with_gst_total = ?, 
         updated_by = ?,
         updated_at = NOW()
       WHERE qt_id = ?`,
      [
        type,
        finalAcousticTerms,
        productsTotal,
        productsTotal,
        finalTotal,
        userId,
        qt_id,
      ]
    );

    await connection.commit();

    return res.status(200).json({
      message: "Quotation updated + revision created",
      qt_id,
      qt_number: originalQtNumber,
      revision: newRevision,
      rev_id,

      productsTotal,
      additionalTotal,
      gst_app_amt: type === "with_gst" ? gst_app_amt : 0,
      gstAmount,
      finalTotal,

      installments // ✅ NEW
    });

  } catch (err) {
    await connection.rollback();
    console.error("updateQuotationWithRevision ERROR:", err);
    return res.status(500).json({ message: err.message });
  } finally {
    connection.release();
  }
};


export const updateQuotationWithRevision6 = async (req, res) => {
  const { qt_id } = req.params;

  const {
    type,
    categories = [],
    additional_prices = [],
    gst_percent = 18,
    gst_app_amt = 0,
    acoustic_terms = null,

    installments = [] // ✅ NEW
  } = req.body;

  if (!qt_id)
    return res.status(400).json({ message: "qt_id is required" });

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const userId = req.session?.user?.id;
    if (!userId)
      return res.status(401).json({ message: "User not authenticated" });

    /* ===============================
       FETCH QUOTATION
    =============================== */

    const [[quotation]] = await connection.query(
      `SELECT qt_number, acoustic_terms 
       FROM quotation 
       WHERE qt_id = ?`,
      [qt_id]
    );

    if (!quotation) {
      await connection.rollback();
      return res.status(404).json({ message: "Quotation not found" });
    }

    const originalQtNumber = quotation.qt_number;

    const finalAcousticTerms =
      acoustic_terms !== null ? acoustic_terms : quotation.acoustic_terms;

    /* ===============================
       GET LAST REVISION
    =============================== */

    const [[revRow]] = await connection.query(
      `SELECT MAX(current_revision) AS lastRevision
       FROM quotation_mapped
       WHERE qt_id = ?`,
      [qt_id]
    );

    const lastRevision = revRow?.lastRevision || 0;
    const newRevision = lastRevision + 1;

    /* ===============================
       BUILD FINAL ROWS
    =============================== */

    const finalRows = [];

    categories.forEach((cat) => {
      (cat.products || []).forEach((prod) => {
        finalRows.push({
          qt_id,
          cat_id: cat.cat_id || null,
          kit_id: cat.kit_id || null,
          model_id: prod.model_id,
          kit_qty: cat.kit_qty || 1,
          model_qty: prod.model_qty || 0,
          model_price: prod.model_price || 0,
          created_by: userId,
        });
      });
    });

    /* ===============================
       PRODUCTS TOTAL
    =============================== */

    let productsTotal = 0;

    for (const row of finalRows) {
      productsTotal +=
        Number(row.model_price || 0) *
        Number(row.model_qty || 0) *
        Number(row.kit_qty || 1);
    }

    /* ===============================
       ADDITIONAL TOTAL
    =============================== */

    const additionalTotal = additional_prices.reduce(
      (sum, a) => sum + Number(a.price || 0),
      0
    );

    /* ===============================
       GST CALCULATION
    =============================== */

    let gstAmount = 0;

    if (type === "with_gst" && Number(gst_app_amt) > 0) {
      gstAmount = Number(gst_app_amt) * (gst_percent / 100);
    }

    /* ===============================
       FINAL PROJECT TOTAL
    =============================== */

    const finalTotal =
      productsTotal +
      additionalTotal +
      (type === "with_gst" ? gstAmount : 0);

    /* ===============================
       INSERT REVISION
    =============================== */

    const [revInsert] = await connection.query(
      `INSERT INTO quotation_revision
        (qt_id, revision, total_without_gst, total_with_gst, gst_app_amt, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [
        qt_id,
        newRevision,
        productsTotal,
        finalTotal,
        type === "with_gst" ? Number(gst_app_amt) : 0,
      ]
    );

    const rev_id = revInsert.insertId;

    /* ===============================
       INSERT PRODUCTS
    =============================== */

    for (const p of finalRows) {
      await connection.query(
        `INSERT INTO quotation_mapped
          (qt_id, cat_id, kit_id, model_id,
           kit_qty, model_qty, model_price,
           current_revision, created_by, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          p.qt_id,
          p.cat_id,
          p.kit_id,
          p.model_id,
          Number(p.kit_qty),
          Number(p.model_qty),
          Number(p.model_price),
          newRevision,
          p.created_by,
        ]
      );
    }

    /* ===============================
       REPLACE ADDITIONAL PRICES
    =============================== */

    await connection.query(
      `DELETE FROM additional_price WHERE qt_id = ?`,
      [qt_id]
    );

    for (const ap of additional_prices) {
      await connection.query(
        `INSERT INTO additional_price
          (qt_id, add_price_name, price, created_at)
         VALUES (?, ?, ?, NOW())`,
        [qt_id, ap.add_price_name, Number(ap.price || 0)]
      );
    }

    /* ===============================
       REPLACE INSTALLMENTS
    =============================== */

    // STEP 1: DELETE OLD
    await connection.query(
      `DELETE FROM quotation_installments WHERE qt_id = ?`,
      [qt_id]
    );

    // STEP 2: VALIDATE + INSERT NEW
    if (installments.length > 0) {
      let totalPercent = 0;

      for (const inst of installments) {
        totalPercent += Number(inst.percentage || 0);
      }

      if (totalPercent > 100) {
        throw new Error("Installment percentage cannot exceed 100%");
      }

      for (const inst of installments) {
        await connection.query(
          `INSERT INTO quotation_installments
             (qt_id, description, percentage, amount, created_at)
           VALUES (?, ?, ?, ?, NOW())`,
          [
            qt_id,
            inst.description || '',
            Number(inst.percentage || 0),
            Number(inst.amount || 0),
          ]
        );
      }
    }

    /* ===============================
       UPDATE QUOTATION HEADER
    =============================== */

    await connection.query(
      `UPDATE quotation
       SET
         type = ?,
         acoustic_terms = ?,
         total_price = ?, 
         without_gst_total = ?, 
         with_gst_total = ?, 
         updated_by = ?,
         updated_at = NOW()
       WHERE qt_id = ?`,
      [
        type,
        finalAcousticTerms,
        productsTotal,
        productsTotal,
        finalTotal,
        userId,
        qt_id,
      ]
    );

    await connection.commit();

    return res.status(200).json({
      message: "Quotation updated + revision created",
      qt_id,
      qt_number: originalQtNumber,
      revision: newRevision,
      rev_id,

      productsTotal,
      additionalTotal,
      gst_app_amt: type === "with_gst" ? gst_app_amt : 0,
      gstAmount,
      finalTotal,

      installments // ✅ NEW
    });

  } catch (err) {
    await connection.rollback();
    console.error("updateQuotationWithRevision ERROR:", err);
    return res.status(500).json({ message: err.message });
  } finally {
    connection.release();
  }
};


export const updateQuotationWithRevision7 = async (req, res) => {
  const { qt_id } = req.params;

  const {
    type,
    categories = [],
    additional_prices = [],
    gst_percent = 18,
    gst_app_amt = 0,
    acoustic_terms = null,

    installments = [], // ✅ NEW
    final_offer = null // ✅ NEW - Final Best Offer
  } = req.body;

  if (!qt_id)
    return res.status(400).json({ message: "qt_id is required" });

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const userId = req.session?.user?.id;
    if (!userId)
      return res.status(401).json({ message: "User not authenticated" });

    /* ===============================
       FETCH QUOTATION
    =============================== */

    const [[quotation]] = await connection.query(
      `SELECT qt_number, acoustic_terms 
       FROM quotation 
       WHERE qt_id = ?`,
      [qt_id]
    );

    if (!quotation) {
      await connection.rollback();
      return res.status(404).json({ message: "Quotation not found" });
    }

    const originalQtNumber = quotation.qt_number;

    const finalAcousticTerms =
      acoustic_terms !== null ? acoustic_terms : quotation.acoustic_terms;

    /* ===============================
       GET LAST REVISION
    =============================== */

    const [[revRow]] = await connection.query(
      `SELECT MAX(current_revision) AS lastRevision
       FROM quotation_mapped
       WHERE qt_id = ?`,
      [qt_id]
    );

    const lastRevision = revRow?.lastRevision || 0;
    const newRevision = lastRevision + 1;

    /* ===============================
       BUILD FINAL ROWS
    =============================== */

    const finalRows = [];

    categories.forEach((cat) => {
      (cat.products || []).forEach((prod) => {
        finalRows.push({
          qt_id,
          cat_id: cat.cat_id || null,
          kit_id: cat.kit_id || null,
          model_id: prod.model_id,
          kit_qty: cat.kit_qty || 1,
          model_qty: prod.model_qty || 0,
          model_price: prod.model_price || 0,
          created_by: userId,
        });
      });
    });

    /* ===============================
       PRODUCTS TOTAL
    =============================== */

    let productsTotal = 0;

    for (const row of finalRows) {
      productsTotal +=
        Number(row.model_price || 0) *
        Number(row.model_qty || 0) *
        Number(row.kit_qty || 1);
    }

    /* ===============================
       ADDITIONAL TOTAL
    =============================== */

    const additionalTotal = additional_prices.reduce(
      (sum, a) => sum + Number(a.price || 0),
      0
    );

    /* ===============================
       GST CALCULATION
    =============================== */

    let gstAmount = 0;

    if (type === "with_gst" && Number(gst_app_amt) > 0) {
      gstAmount = Number(gst_app_amt) * (gst_percent / 100);
    }

    /* ===============================
       FINAL PROJECT TOTAL
    =============================== */

    const finalTotal =
      productsTotal +
      additionalTotal +
      (type === "with_gst" ? gstAmount : 0);

    /* ===============================
       INSERT REVISION
    =============================== */

    const [revInsert] = await connection.query(
      `INSERT INTO quotation_revision
        (qt_id, revision, total_without_gst, total_with_gst, gst_app_amt, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [
        qt_id,
        newRevision,
        productsTotal,
        finalTotal,
        type === "with_gst" ? Number(gst_app_amt) : 0,
      ]
    );

    const rev_id = revInsert.insertId;

    /* ===============================
       INSERT PRODUCTS
    =============================== */

    for (const p of finalRows) {
      await connection.query(
        `INSERT INTO quotation_mapped
          (qt_id, cat_id, kit_id, model_id,
           kit_qty, model_qty, model_price,
           current_revision, created_by, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          p.qt_id,
          p.cat_id,
          p.kit_id,
          p.model_id,
          Number(p.kit_qty),
          Number(p.model_qty),
          Number(p.model_price),
          newRevision,
          p.created_by,
        ]
      );
    }

    /* ===============================
       REPLACE ADDITIONAL PRICES
    =============================== */

    await connection.query(
      `DELETE FROM additional_price WHERE qt_id = ?`,
      [qt_id]
    );

    for (const ap of additional_prices) {
      await connection.query(
        `INSERT INTO additional_price
          (qt_id, add_price_name, price, created_at)
         VALUES (?, ?, ?, NOW())`,
        [qt_id, ap.add_price_name, Number(ap.price || 0)]
      );
    }

    /* ===============================
       REPLACE INSTALLMENTS
    =============================== */

    // STEP 1: DELETE OLD
    await connection.query(
      `DELETE FROM quotation_installments WHERE qt_id = ?`,
      [qt_id]
    );

    // STEP 2: VALIDATE + INSERT NEW
    if (installments.length > 0) {
      let totalPercent = 0;

      for (const inst of installments) {
        totalPercent += Number(inst.percentage || 0);
      }

      if (totalPercent > 100) {
        throw new Error("Installment percentage cannot exceed 100%");
      }

      for (const inst of installments) {
        await connection.query(
          `INSERT INTO quotation_installments
             (qt_id, description, percentage, amount, created_at)
           VALUES (?, ?, ?, ?, NOW())`,
          [
            qt_id,
            inst.description || '',
            Number(inst.percentage || 0),
            Number(inst.amount || 0),
          ]
        );
      }
    }

    /* ===============================
       ✅ REPLACE FINAL BEST OFFER (NEW FEATURE)
    =============================== */

    // STEP 1: DELETE OLD FINAL OFFER
    await connection.query(
      `DELETE FROM quotation_final_offer WHERE qt_id = ?`,
      [qt_id]
    );

    // STEP 2: INSERT NEW FINAL OFFER IF PROVIDED
    if (final_offer && (final_offer.percentage > 0 || final_offer.amount > 0)) {
      // Validate percentage doesn't exceed 100
      if (final_offer.percentage > 100) {
        throw new Error("Final offer percentage cannot exceed 100%");
      }

      // Calculate amount if not provided or if percentage is provided
      let offerAmount = final_offer.amount;
      let offerPercentage = final_offer.percentage;

      if (offerPercentage > 0 && (!offerAmount || offerAmount === 0)) {
        offerAmount = (finalTotal * offerPercentage) / 100;
      } else if (offerAmount > 0 && (!offerPercentage || offerPercentage === 0)) {
        offerPercentage = (offerAmount / finalTotal) * 100;
      }

      // If no percentage or amount provided, use default (100%)
      if (offerPercentage === 0 && offerAmount === 0) {
        offerPercentage = 100;
        offerAmount = finalTotal;
      }

      await connection.query(
        `INSERT INTO quotation_final_offer
           (qt_id, description, percentage, amount, is_default, created_at)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [
          qt_id,
          final_offer.description || 'FINAL BEST OFFER (OPTIONAL)',
          Number(offerPercentage),
          Number(offerAmount),
          final_offer.is_default || (offerPercentage === 100 ? 1 : 0),
        ]
      );
    }

    /* ===============================
       UPDATE QUOTATION HEADER
    =============================== */

    await connection.query(
      `UPDATE quotation
       SET
         type = ?,
         acoustic_terms = ?,
         total_price = ?, 
         without_gst_total = ?, 
         with_gst_total = ?, 
         updated_by = ?,
         updated_at = NOW()
       WHERE qt_id = ?`,
      [
        type,
        finalAcousticTerms,
        productsTotal,
        productsTotal,
        finalTotal,
        userId,
        qt_id,
      ]
    );

    await connection.commit();

    return res.status(200).json({
      message: "Quotation updated + revision created",
      qt_id,
      qt_number: originalQtNumber,
      revision: newRevision,
      rev_id,

      productsTotal,
      additionalTotal,
      gst_app_amt: type === "with_gst" ? gst_app_amt : 0,
      gstAmount,
      finalTotal,

      installments, // ✅ NEW
      final_offer: final_offer || null // ✅ NEW
    });

  } catch (err) {
    await connection.rollback();
    console.error("updateQuotationWithRevision ERROR:", err);
    return res.status(500).json({ message: err.message });
  } finally {
    connection.release();
  }
};



export const updateQuotationWithRevision8 = async (req, res) => {
  const { qt_id } = req.params;

  const {
    type,
    categories = [],
    additional_prices = [],
    gst_percent = 18,
    gst_app_amt = 0,
    acoustic_terms = null,

    installments = [],
    final_offer = null
  } = req.body;

  if (!qt_id)
    return res.status(400).json({ message: "qt_id is required" });

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const userId = req.session?.user?.id;
    if (!userId)
      return res.status(401).json({ message: "User not authenticated" });

    /* ===============================
       FETCH QUOTATION
    =============================== */

    const [[quotation]] = await connection.query(
      `SELECT qt_number, acoustic_terms 
       FROM quotation 
       WHERE qt_id = ?`,
      [qt_id]
    );

    if (!quotation) {
      await connection.rollback();
      return res.status(404).json({ message: "Quotation not found" });
    }

    const originalQtNumber = quotation.qt_number;

    const finalAcousticTerms =
      acoustic_terms !== null ? acoustic_terms : quotation.acoustic_terms;

    /* ===============================
       GET LAST REVISION
    =============================== */

    const [[revRow]] = await connection.query(
      `SELECT MAX(current_revision) AS lastRevision
       FROM quotation_mapped
       WHERE qt_id = ?`,
      [qt_id]
    );

    const lastRevision = revRow?.lastRevision || 0;
    const newRevision = lastRevision + 1;

    /* ===============================
       BUILD FINAL ROWS
    =============================== */

    const finalRows = [];

    categories.forEach((cat) => {
      (cat.products || []).forEach((prod) => {
        finalRows.push({
          qt_id,
          cat_id: cat.cat_id || null,
          kit_id: cat.kit_id || null,
          model_id: prod.model_id,
          kit_qty: cat.kit_qty || 1,
          model_qty: prod.model_qty || 0,
          model_price: prod.model_price || 0,
          created_by: userId,
        });
      });
    });

    /* ===============================
       PRODUCTS TOTAL
    =============================== */

    let productsTotal = 0;

    for (const row of finalRows) {
      productsTotal +=
        Number(row.model_price || 0) *
        Number(row.model_qty || 0) *
        Number(row.kit_qty || 1);
    }

    /* ===============================
       ADDITIONAL TOTAL
    =============================== */

    const additionalTotal = additional_prices.reduce(
      (sum, a) => sum + Number(a.price || 0),
      0
    );

    /* ===============================
       GST CALCULATION
    =============================== */

    let gstAmount = 0;

    if (type === "with_gst" && Number(gst_app_amt) > 0) {
      gstAmount = Number(gst_app_amt) * (gst_percent / 100);
    }

    /* ===============================
       ORIGINAL FINAL TOTAL (WITHOUT DISCOUNT)
    =============================== */

    const originalFinalTotal =
      productsTotal +
      additionalTotal +
      (type === "with_gst" ? gstAmount : 0);

    /* ===============================
       CALCULATE DISCOUNT VALUES IF FINAL OFFER EXISTS
    =============================== */

    let discountedTotal = originalFinalTotal;
    let discountPercentage = 0;
    let discountAmount = 0;

    if (final_offer && (final_offer.percentage > 0 || final_offer.amount > 0)) {
      if (final_offer.percentage > 100) {
        throw new Error("Final offer percentage cannot exceed 100%");
      }

      if (final_offer.percentage > 0) {
        discountPercentage = Number(final_offer.percentage);
        discountAmount = (originalFinalTotal * discountPercentage) / 100;
        discountedTotal = originalFinalTotal - discountAmount;
      } else if (final_offer.amount > 0) {
        discountAmount = Number(final_offer.amount);
        discountPercentage = (discountAmount / originalFinalTotal) * 100;
        discountedTotal = originalFinalTotal - discountAmount;
      }
    }

    /* ===============================
       INSERT REVISION (STORE ORIGINAL TOTAL)
    =============================== */

    const [revInsert] = await connection.query(
      `INSERT INTO quotation_revision
        (qt_id, revision, total_without_gst, total_with_gst, gst_app_amt, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [
        qt_id,
        newRevision,
        productsTotal,
        originalFinalTotal,
        type === "with_gst" ? Number(gst_app_amt) : 0,
      ]
    );

    const rev_id = revInsert.insertId;

    /* ===============================
       INSERT PRODUCTS
    =============================== */

    for (const p of finalRows) {
      await connection.query(
        `INSERT INTO quotation_mapped
          (qt_id, cat_id, kit_id, model_id,
           kit_qty, model_qty, model_price,
           current_revision, created_by, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          p.qt_id,
          p.cat_id,
          p.kit_id,
          p.model_id,
          Number(p.kit_qty),
          Number(p.model_qty),
          Number(p.model_price),
          newRevision,
          p.created_by,
        ]
      );
    }

    /* ===============================
       REPLACE ADDITIONAL PRICES
    =============================== */

    await connection.query(
      `DELETE FROM additional_price WHERE qt_id = ?`,
      [qt_id]
    );

    for (const ap of additional_prices) {
      await connection.query(
        `INSERT INTO additional_price
          (qt_id, add_price_name, price, created_at)
         VALUES (?, ?, ?, NOW())`,
        [qt_id, ap.add_price_name, Number(ap.price || 0)]
      );
    }

    /* ===============================
       REPLACE INSTALLMENTS (USING DISCOUNTED TOTAL IF APPLICABLE)
    =============================== */

    await connection.query(
      `DELETE FROM quotation_installments WHERE qt_id = ?`,
      [qt_id]
    );

    if (installments.length > 0) {
      let totalPercent = 0;

      for (const inst of installments) {
        totalPercent += Number(inst.percentage || 0);
      }

      if (totalPercent > 100) {
        throw new Error("Installment percentage cannot exceed 100%");
      }

      const installmentBaseTotal = discountedTotal;

      for (const inst of installments) {
        await connection.query(
          `INSERT INTO quotation_installments
             (qt_id, description, percentage, amount, created_at)
           VALUES (?, ?, ?, ?, NOW())`,
          [
            qt_id,
            inst.description || '',
            Number(inst.percentage || 0),
            (installmentBaseTotal * Number(inst.percentage || 0)) / 100,
          ]
        );
      }
    }

    /* ===============================
       REPLACE FINAL BEST OFFER
    =============================== */

    await connection.query(
      `DELETE FROM quotation_final_offer WHERE qt_id = ?`,
      [qt_id]
    );

    if (final_offer && (final_offer.percentage > 0 || final_offer.amount > 0)) {
      if (final_offer.percentage > 100) {
        throw new Error("Final offer percentage cannot exceed 100%");
      }

      let offerAmount = final_offer.amount;
      let offerPercentage = final_offer.percentage;

      if (offerPercentage > 0 && (!offerAmount || offerAmount === 0)) {
        offerAmount = (originalFinalTotal * offerPercentage) / 100;
      } else if (offerAmount > 0 && (!offerPercentage || offerPercentage === 0)) {
        offerPercentage = (offerAmount / originalFinalTotal) * 100;
      }

      await connection.query(
        `INSERT INTO quotation_final_offer
           (qt_id, description, percentage, amount, is_default, created_at)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [
          qt_id,
          final_offer.description || 'FINAL BEST OFFER (OPTIONAL)',
          Number(offerPercentage),
          Number(offerAmount),
          final_offer.is_default || 0,
        ]
      );
    }

    /* ===============================
       UPDATE QUOTATION HEADER (WITH NEW DISCOUNT COLUMNS)
    =============================== */

    await connection.query(
      `UPDATE quotation
       SET
         type = ?,
         acoustic_terms = ?,
         total_price = ?, 
         without_gst_total = ?, 
         with_gst_total = ?,
         discounted_total = ?,
         discount_percentage = ?,
         discount_amount = ?,
         updated_by = ?,
         updated_at = NOW()
       WHERE qt_id = ?`,
      [
        type,
        finalAcousticTerms,
        productsTotal,
        productsTotal,
        originalFinalTotal,
        discountedTotal,
        discountPercentage,
        discountAmount,
        userId,
        qt_id,
      ]
    );

    await connection.commit();

    return res.status(200).json({
      message: "Quotation updated + revision created",
      qt_id,
      qt_number: originalQtNumber,
      revision: newRevision,
      rev_id,

      productsTotal,
      additionalTotal,
      gst_app_amt: type === "with_gst" ? gst_app_amt : 0,
      gstAmount,
      originalFinalTotal,
      discountedTotal,
      discountPercentage,
      discountAmount,

      installments,
      final_offer: final_offer || null
    });

  } catch (err) {
    await connection.rollback();
    console.error("updateQuotationWithRevision ERROR:", err);
    return res.status(500).json({ message: err.message });
  } finally {
    connection.release();
  }
};

// ============================================================
//  UPDATE QUOTATION  (creates new revision)
//  PUT /api/quotation/:qt_id
// ============================================================
export const updateQuotationWithRevision9 = async (req, res) => {
  const { qt_id } = req.params;
  if (!qt_id) return res.status(400).json({ message: 'qt_id is required' });
 
  const connection = await db.getConnection();
 
  try {
    await connection.beginTransaction();
 
    const userId = req.session?.user?.id;
    if (!userId) return res.status(401).json({ message: 'User not authenticated' });
 
    const { type, acoustic_terms = null, installments_config = [] } = req.body;
    const resolvedOptions = resolveOptions(req.body);
 
    /* ── fetch quotation ── */
    const [[quotation]] = await connection.query(
      `SELECT qt_number, acoustic_terms FROM quotation WHERE qt_id = ?`,
      [qt_id]
    );
    if (!quotation) {
      await connection.rollback();
      return res.status(404).json({ message: 'Quotation not found' });
    }
 
    const finalAcousticTerms =
      acoustic_terms !== null ? acoustic_terms : quotation.acoustic_terms;
 
    /* ── get next revision number ── */
    const [[revRow]] = await connection.query(
      `SELECT MAX(current_revision) AS lastRevision FROM quotation_mapped WHERE qt_id = ?`,
      [qt_id]
    );
    const newRevision = (revRow?.lastRevision || 0) + 1;
 
    /* ── option 1 totals for header + revision row ── */
    const opt1 = resolvedOptions[0] || {};
    const opt1Totals = calcOptionTotals(opt1, type);
 
    /* ── insert revision ── */
    const [revInsert] = await connection.query(
      `INSERT INTO quotation_revision
         (qt_id, revision, total_without_gst, total_with_gst, gst_app_amt, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [
        qt_id, newRevision,
        opt1Totals.productsTotal,
        opt1Totals.originalFinalTotal,
        type === 'with_gst' ? Number(opt1.gst_app_amt || 0) : 0,
      ]
    );
    const rev_id = revInsert.insertId;
 
    /* ── clean up old option-level data ── */
    const [oldOptions] = await connection.query(
      `SELECT option_id FROM quotation_options WHERE qt_id = ?`,
      [qt_id]
    );
    if (oldOptions.length > 0) {
      const oldIds = oldOptions.map(o => o.option_id);
      await connection.query(
        `DELETE FROM additional_price WHERE qt_id = ? AND option_id IN (?)`,
        [qt_id, oldIds]
      );
      await connection.query(
        `DELETE FROM quotation_final_offer WHERE qt_id = ? AND option_id IN (?)`,
        [qt_id, oldIds]
      );
      await connection.query(
        `DELETE FROM quotation_installments WHERE qt_id = ? AND option_id IN (?)`,
        [qt_id, oldIds]
      );
    }
    await connection.query(`DELETE FROM quotation_options WHERE qt_id = ?`, [qt_id]);
 
    /* ── insert updated options ── */
    const insertedOptions = [];
 
    for (let i = 0; i < resolvedOptions.length; i++) {
      const option = resolvedOptions[i];
      const {
        option_name = `OPTION ${i + 1}`,
        items = [],
        additional_prices = [],
        final_offer = null,
      } = option;
 
      /* insert option record */
      const [optInsert] = await connection.query(
        `INSERT INTO quotation_options (qt_id, option_name, option_order, created_at)
         VALUES (?, ?, ?, NOW())`,
        [qt_id, option_name, i + 1]
      );
      const optionId = optInsert.insertId;
 
      const totals = calcOptionTotals(option, type);
 
      await insertOptionProducts(connection, qt_id, optionId, items, newRevision, userId);
      await insertOptionAdditional(connection, qt_id, optionId, additional_prices);
      await insertOptionFinalOffer(connection, qt_id, optionId, final_offer, totals.originalFinalTotal);
      
      // Insert installments for this specific option if configured
      const optionInstallmentConfig = installments_config.find(cfg => cfg.option_id === i || cfg.option_index === i);
      if (optionInstallmentConfig && optionInstallmentConfig.installments && optionInstallmentConfig.installments.length > 0) {
        await insertOptionInstallments(connection, qt_id, optionId, optionInstallmentConfig.installments, totals.discountedTotal);
      }
 
      insertedOptions.push({
        option_id: optionId,
        option_name,
        option_order: i + 1,
        finalized_total: totals.discountedTotal,
        ...totals,
      });
    }
 
    /* ── update quotation header ── */
    await connection.query(
      `UPDATE quotation SET
         type = ?, acoustic_terms = ?,
         total_price = ?, without_gst_total = ?, with_gst_total = ?,
         discounted_total = ?, discount_percentage = ?, discount_amount = ?,
         updated_by = ?, updated_at = NOW()
       WHERE qt_id = ?`,
      [
        type, finalAcousticTerms,
        opt1Totals.productsTotal,
        opt1Totals.productsTotal,
        opt1Totals.originalFinalTotal,
        opt1Totals.discountedTotal,
        opt1Totals.discountPercentage,
        opt1Totals.discountAmount,
        userId, qt_id,
      ]
    );
 
    await connection.commit();
 
    return res.status(200).json({
      message: 'Quotation updated + revision created',
      qt_id,
      qt_number: quotation.qt_number,
      revision: newRevision,
      rev_id,
      options: insertedOptions,
    });
 
  } catch (err) {
    await connection.rollback();
    console.error('updateQuotationWithRevision ERROR:', err);
    return res.status(500).json({ message: err.message });
  } finally {
    connection.release();
  }
};





export const updateQuotationWithRevision10 = async (req, res) => {
  const { qt_id } = req.params;
  if (!qt_id) return res.status(400).json({ message: 'qt_id is required' });
 
  const connection = await db.getConnection();
 
  try {
    await connection.beginTransaction();
 
    const userId = req.session?.user?.id;
    if (!userId) return res.status(401).json({ message: 'User not authenticated' });
 
const { type, acoustic_terms = null, installments_config = [], subject = null } = req.body;
    const resolvedOptions = resolveOptions(req.body);
 
    /* ── fetch quotation ── */
    const [[quotation]] = await connection.query(
      `SELECT qt_number, acoustic_terms FROM quotation WHERE qt_id = ?`,
      [qt_id]
    );
    if (!quotation) {
      await connection.rollback();
      return res.status(404).json({ message: 'Quotation not found' });
    }
 
    const finalAcousticTerms =
      acoustic_terms !== null ? acoustic_terms : quotation.acoustic_terms;
 
    /* ── get next revision number ── */
    const [[revRow]] = await connection.query(
      `SELECT MAX(current_revision) AS lastRevision FROM quotation_mapped WHERE qt_id = ?`,
      [qt_id]
    );
    const newRevision = (revRow?.lastRevision || 0) + 1;
 
    /* ✅ FIX: Calculate totals for ALL options, not just option 1 */
    let totalProductsCost = 0;
    let totalWithGST = 0;
    let totalDiscounted = 0;
    let totalGSTAmount = 0;
    let totalDiscountAmount = 0;
    
    // Calculate totals for each option
    for (let i = 0; i < resolvedOptions.length; i++) {
      const option = resolvedOptions[i];
      const optionTotals = calcOptionTotals(option, type);
      
      totalProductsCost += optionTotals.productsTotal;
      totalWithGST += optionTotals.originalFinalTotal;
      totalDiscounted += optionTotals.discountedTotal;
      totalGSTAmount += optionTotals.gstAmount;
      totalDiscountAmount += optionTotals.discountAmount;
    }
    
    // Calculate overall discount percentage
    const overallDiscountPercentage = totalWithGST > 0 
      ? (totalDiscountAmount / totalWithGST) * 100 
      : 0;
 
    /* ── insert revision with CORRECT totals ── */
    const [revInsert] = await connection.query(
      `INSERT INTO quotation_revision
         (qt_id, revision, total_without_gst, total_with_gst, gst_app_amt, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [
        qt_id, newRevision,
        totalProductsCost,  // ✅ Use total from all options
        totalDiscounted,    // ✅ Use discounted total from all options
        type === 'with_gst' ? (totalGSTAmount / 0.18) : 0,  // ✅ Calculate GST base
      ]
    );
    const rev_id = revInsert.insertId;
 
    /* ── clean up old option-level data ── */
    const [oldOptions] = await connection.query(
      `SELECT option_id FROM quotation_options WHERE qt_id = ?`,
      [qt_id]
    );
    if (oldOptions.length > 0) {
      const oldIds = oldOptions.map(o => o.option_id);
      await connection.query(
        `DELETE FROM additional_price WHERE qt_id = ? AND option_id IN (?)`,
        [qt_id, oldIds]
      );
      await connection.query(
        `DELETE FROM quotation_final_offer WHERE qt_id = ? AND option_id IN (?)`,
        [qt_id, oldIds]
      );
      await connection.query(
        `DELETE FROM quotation_installments WHERE qt_id = ? AND option_id IN (?)`,
        [qt_id, oldIds]
      );
    }
    await connection.query(`DELETE FROM quotation_options WHERE qt_id = ?`, [qt_id]);
 
    /* ── insert updated options ── */
    const insertedOptions = [];
 
    for (let i = 0; i < resolvedOptions.length; i++) {
      const option = resolvedOptions[i];
      const {
        option_name = `OPTION ${i + 1}`,
        items = [],
        additional_prices = [],
        final_offer = null,
      } = option;
 
      /* insert option record */
      const [optInsert] = await connection.query(
        `INSERT INTO quotation_options (qt_id, option_name, option_order, created_at)
         VALUES (?, ?, ?, NOW())`,
        [qt_id, option_name, i + 1]
      );
      const optionId = optInsert.insertId;
 
      const totals = calcOptionTotals(option, type);
 
      await insertOptionProducts(connection, qt_id, optionId, items, newRevision, userId);
      await insertOptionAdditional(connection, qt_id, optionId, additional_prices);
      await insertOptionFinalOffer(connection, qt_id, optionId, final_offer, totals.originalFinalTotal);
      
      // Insert installments for this specific option if configured
      const optionInstallmentConfig = installments_config.find(cfg => cfg.option_id === i || cfg.option_index === i);
      if (optionInstallmentConfig && optionInstallmentConfig.installments && optionInstallmentConfig.installments.length > 0) {
        await insertOptionInstallments(connection, qt_id, optionId, optionInstallmentConfig.installments, totals.discountedTotal);
      }
 
      insertedOptions.push({
        option_id: optionId,
        option_name,
        option_order: i + 1,
        finalized_total: totals.discountedTotal,
        ...totals,
      });
    }
 
    /* ── update quotation header with CORRECT totals ── */
await connection.query(
  `UPDATE quotation SET
     type = ?, acoustic_terms = ?, subject = ?,
     total_price = ?, without_gst_total = ?, with_gst_total = ?,
     discounted_total = ?, discount_percentage = ?, discount_amount = ?,
     updated_by = ?, updated_at = NOW()
   WHERE qt_id = ?`,
  [
    type, finalAcousticTerms, subject,
    totalProductsCost,
    totalProductsCost,
    totalWithGST,
    totalDiscounted,
    overallDiscountPercentage,
    totalDiscountAmount,
    userId, qt_id,
  ]
);
 
    await connection.commit();
 
    return res.status(200).json({
      message: 'Quotation updated + revision created',
      qt_id,
      qt_number: quotation.qt_number,
      revision: newRevision,
      rev_id,
      options: insertedOptions,
      totals: {
        products_total: totalProductsCost,
        with_gst_total: totalWithGST,
        discounted_total: totalDiscounted,
        discount_amount: totalDiscountAmount,
        discount_percentage: overallDiscountPercentage
      }
    });
 
  } catch (err) {
    await connection.rollback();
    console.error('updateQuotationWithRevision ERROR:', err);
    return res.status(500).json({ message: err.message });
  } finally {
    connection.release();
  }
};


export const updateQuotationWithRevision11 = async (req, res) => {
  const { qt_id } = req.params;
  if (!qt_id) return res.status(400).json({ message: 'qt_id is required' });
 
  const connection = await db.getConnection();
 
  try {
    await connection.beginTransaction();
 
    const userId = req.session?.user?.id;
    if (!userId) return res.status(401).json({ message: 'User not authenticated' });
 
    const { 
      type, 
      acoustic_terms = null, 
      installments_config = [], 
      subject = null,
      selected_options_for_summary = null  // ← ADD THIS
    } = req.body;
    
    const resolvedOptions = resolveOptions(req.body);
 
    /* ── fetch quotation ── */
    const [[quotation]] = await connection.query(
      `SELECT qt_number, acoustic_terms FROM quotation WHERE qt_id = ?`,
      [qt_id]
    );
    if (!quotation) {
      await connection.rollback();
      return res.status(404).json({ message: 'Quotation not found' });
    }
 
    const finalAcousticTerms =
      acoustic_terms !== null ? acoustic_terms : quotation.acoustic_terms;
 
    /* ── get next revision number ── */
    const [[revRow]] = await connection.query(
      `SELECT MAX(current_revision) AS lastRevision FROM quotation_mapped WHERE qt_id = ?`,
      [qt_id]
    );
    const newRevision = (revRow?.lastRevision || 0) + 1;
 
    // Calculate totals for ALL options
    let totalProductsCost = 0;
    let totalWithGST = 0;
    let totalDiscounted = 0;
    let totalGSTAmount = 0;
    let totalDiscountAmount = 0;
    
    for (let i = 0; i < resolvedOptions.length; i++) {
      const option = resolvedOptions[i];
      const optionTotals = calcOptionTotals(option, type);
      
      totalProductsCost += optionTotals.productsTotal;
      totalWithGST += optionTotals.originalFinalTotal;
      totalDiscounted += optionTotals.discountedTotal;
      totalGSTAmount += optionTotals.gstAmount;
      totalDiscountAmount += optionTotals.discountAmount;
    }
    
    const overallDiscountPercentage = totalWithGST > 0 
      ? (totalDiscountAmount / totalWithGST) * 100 
      : 0;
    
    // Convert selected_options_for_summary to JSON string
    const selectedOptionsJson = selected_options_for_summary && Array.isArray(selected_options_for_summary) && selected_options_for_summary.length > 0 
      ? JSON.stringify(selected_options_for_summary) 
      : null;
    
    console.log('Updating with selected_options_for_summary:', selectedOptionsJson);
 
    /* ── insert revision ── */
    const [revInsert] = await connection.query(
      `INSERT INTO quotation_revision
         (qt_id, revision, total_without_gst, total_with_gst, gst_app_amt, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [
        qt_id, newRevision,
        totalProductsCost,
        totalDiscounted,
        type === 'with_gst' ? (totalGSTAmount / 0.18) : 0,
      ]
    );
    const rev_id = revInsert.insertId;
 
    /* ── clean up old option-level data ── */
    const [oldOptions] = await connection.query(
      `SELECT option_id FROM quotation_options WHERE qt_id = ?`,
      [qt_id]
    );
    if (oldOptions.length > 0) {
      const oldIds = oldOptions.map(o => o.option_id);
      await connection.query(
        `DELETE FROM additional_price WHERE qt_id = ? AND option_id IN (?)`,
        [qt_id, oldIds]
      );
      await connection.query(
        `DELETE FROM quotation_final_offer WHERE qt_id = ? AND option_id IN (?)`,
        [qt_id, oldIds]
      );
      await connection.query(
        `DELETE FROM quotation_installments WHERE qt_id = ? AND option_id IN (?)`,
        [qt_id, oldIds]
      );
    }
    await connection.query(`DELETE FROM quotation_options WHERE qt_id = ?`, [qt_id]);
 
    /* ── insert updated options ── */
    const insertedOptions = [];
 
    for (let i = 0; i < resolvedOptions.length; i++) {
      const option = resolvedOptions[i];
      const {
        option_name = `OPTION ${i + 1}`,
        items = [],
        additional_prices = [],
        final_offer = null,
      } = option;
 
      const [optInsert] = await connection.query(
        `INSERT INTO quotation_options (qt_id, option_name, option_order, created_at)
         VALUES (?, ?, ?, NOW())`,
        [qt_id, option_name, i + 1]
      );
      const optionId = optInsert.insertId;
 
      const totals = calcOptionTotals(option, type);
 
      await insertOptionProducts(connection, qt_id, optionId, items, newRevision, userId);
      await insertOptionAdditional(connection, qt_id, optionId, additional_prices);
      await insertOptionFinalOffer(connection, qt_id, optionId, final_offer, totals.originalFinalTotal);
      
      const optionInstallmentConfig = installments_config.find(cfg => cfg.option_id === i || cfg.option_index === i);
      if (optionInstallmentConfig && optionInstallmentConfig.installments && optionInstallmentConfig.installments.length > 0) {
        await insertOptionInstallments(connection, qt_id, optionId, optionInstallmentConfig.installments, totals.discountedTotal);
      }
 
      insertedOptions.push({
        option_id: optionId,
        option_name,
        option_order: i + 1,
        finalized_total: totals.discountedTotal,
        ...totals,
      });
    }
 
    /* ── update quotation header with totals AND selected_options_for_summary ── */
    await connection.query(
      `UPDATE quotation SET
         type = ?, acoustic_terms = ?, subject = ?,
         total_price = ?, without_gst_total = ?, with_gst_total = ?,
         discounted_total = ?, discount_percentage = ?, discount_amount = ?,
         selected_options_for_summary = ?,
         updated_by = ?, updated_at = NOW()
       WHERE qt_id = ?`,
      [
        type, finalAcousticTerms, subject,
        totalProductsCost,
        totalProductsCost,
        totalWithGST,
        totalDiscounted,
        overallDiscountPercentage,
        totalDiscountAmount,
        selectedOptionsJson,  // ← ADD THIS
        userId, qt_id,
      ]
    );
 
    await connection.commit();
 
    return res.status(200).json({
      message: 'Quotation updated + revision created',
      qt_id,
      qt_number: quotation.qt_number,
      revision: newRevision,
      rev_id,
      options: insertedOptions,
      totals: {
        products_total: totalProductsCost,
        with_gst_total: totalWithGST,
        discounted_total: totalDiscounted,
        discount_amount: totalDiscountAmount,
        discount_percentage: overallDiscountPercentage
      }
    });
 
  } catch (err) {
    await connection.rollback();
    console.error('updateQuotationWithRevision ERROR:', err);
    return res.status(500).json({ message: err.message });
  } finally {
    connection.release();
  }
};



export const updateQuotationWithRevision12 = async (req, res) => {
  const { qt_id } = req.params;
  if (!qt_id) return res.status(400).json({ message: 'qt_id is required' });
 
  const connection = await db.getConnection();
 
  try {
    await connection.beginTransaction();
 
    const userId = req.session?.user?.id;
    if (!userId) return res.status(401).json({ message: 'User not authenticated' });
 
    const { 
      type, 
      acoustic_terms = null, 
      installments_config = [], 
      subject = null,
      selected_options_for_summary = null
    } = req.body;
    
    const resolvedOptions = resolveOptions(req.body);
 
    /* ── fetch quotation ── */
    const [[quotation]] = await connection.query(
      `SELECT qt_number, acoustic_terms FROM quotation WHERE qt_id = ?`,
      [qt_id]
    );
    if (!quotation) {
      await connection.rollback();
      return res.status(404).json({ message: 'Quotation not found' });
    }
 
    const finalAcousticTerms =
      acoustic_terms !== null ? acoustic_terms : quotation.acoustic_terms;
 
    /* ── get next revision number from quotation_revision ── */
    const [[maxRev]] = await connection.query(
      `SELECT MAX(revision) AS lastRevision FROM quotation_revision WHERE qt_id = ?`,
      [qt_id]
    );
    const newRevision = (maxRev?.lastRevision || 0) + 1;
 
    // Calculate totals for ALL options
    let totalProductsCost = 0;
    let totalWithGST = 0;
    let totalDiscounted = 0;
    let totalGSTAmount = 0;
    let totalDiscountAmount = 0;
    
    for (let i = 0; i < resolvedOptions.length; i++) {
      const option = resolvedOptions[i];
      const optionTotals = calcOptionTotals(option, type);
      
      totalProductsCost += optionTotals.productsTotal;
      totalWithGST += optionTotals.originalFinalTotal;
      totalDiscounted += optionTotals.discountedTotal;
      totalGSTAmount += optionTotals.gstAmount;
      totalDiscountAmount += optionTotals.discountAmount;
    }
    
    const overallDiscountPercentage = totalWithGST > 0 
      ? (totalDiscountAmount / totalWithGST) * 100 
      : 0;
    
    // Convert selected_options_for_summary to JSON string
    const selectedOptionsJson = selected_options_for_summary && Array.isArray(selected_options_for_summary) && selected_options_for_summary.length > 0 
      ? JSON.stringify(selected_options_for_summary) 
      : null;
    
    console.log('Creating revision:', newRevision);
    console.log('Selected options for summary:', selectedOptionsJson);
 
    /* ── insert revision record ── */
    const [revInsert] = await connection.query(
      `INSERT INTO quotation_revision
         (qt_id, revision, total_without_gst, total_with_gst, gst_app_amt, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [
        qt_id, newRevision,
        totalProductsCost,
        totalDiscounted,
        type === 'with_gst' ? (totalGSTAmount / 0.18) : 0,
      ]
    );
    const rev_id = revInsert.insertId;
 
    /* ── IMPORTANT: Don't delete old options! Keep them for previous revisions ── */
    // We only insert NEW options for this revision
    
    /* ── insert updated options for THIS revision only ── */
    const insertedOptions = [];
 
    for (let i = 0; i < resolvedOptions.length; i++) {
      const option = resolvedOptions[i];
      const {
        option_name = `OPTION ${i + 1}`,
        items = [],
        additional_prices = [],
        final_offer = null,
      } = option;
 
      // ✅ NOW saving revision in quotation_options
      const [optInsert] = await connection.query(
        `INSERT INTO quotation_options (qt_id, option_name, option_order, revision, created_at)
         VALUES (?, ?, ?, ?, NOW())`,
        [qt_id, option_name, i + 1, newRevision]  // ← Added revision
      );
      const optionId = optInsert.insertId;
 
      const totals = calcOptionTotals(option, type);
 
      // Insert products with current_revision
      await insertOptionProducts(connection, qt_id, optionId, items, newRevision, userId);
      
      // Insert additional prices with revision
      await insertOptionAdditionalWithRevision(connection, qt_id, optionId, additional_prices, newRevision);
      
      // Insert final offer with revision
      await insertOptionFinalOfferWithRevision(connection, qt_id, optionId, final_offer, totals.originalFinalTotal, newRevision);
      
      // Insert installments with revision
      const optionInstallmentConfig = installments_config.find(cfg => cfg.option_id === i || cfg.option_index === i);
      if (optionInstallmentConfig && optionInstallmentConfig.installments && optionInstallmentConfig.installments.length > 0) {
        await insertOptionInstallmentsWithRevision(connection, qt_id, optionId, optionInstallmentConfig.installments, totals.discountedTotal, newRevision);
      }
 
      insertedOptions.push({
        option_id: optionId,
        option_name,
        option_order: i + 1,
        revision: newRevision,
        finalized_total: totals.discountedTotal,
        ...totals,
      });
    }
 
    /* ── update quotation header ── */
    await connection.query(
      `UPDATE quotation SET
         type = ?, acoustic_terms = ?, subject = ?,
         total_price = ?, without_gst_total = ?, with_gst_total = ?,
         discounted_total = ?, discount_percentage = ?, discount_amount = ?,
         selected_options_for_summary = ?,
         current_revision = ?,  /* ← Update current revision */
         updated_by = ?, updated_at = NOW()
       WHERE qt_id = ?`,
      [
        type, finalAcousticTerms, subject,
        totalProductsCost,
        totalProductsCost,
        totalWithGST,
        totalDiscounted,
        overallDiscountPercentage,
        totalDiscountAmount,
        selectedOptionsJson,
        newRevision,  // ← Update current_revision
        userId, qt_id,
      ]
    );
 
    await connection.commit();
 
    return res.status(200).json({
      message: 'Quotation updated + revision created',
      qt_id,
      qt_number: quotation.qt_number,
      revision: newRevision,
      rev_id,
      options: insertedOptions,
      totals: {
        products_total: totalProductsCost,
        with_gst_total: totalWithGST,
        discounted_total: totalDiscounted,
        discount_amount: totalDiscountAmount,
        discount_percentage: overallDiscountPercentage
      }
    });
 
  } catch (err) {
    await connection.rollback();
    console.error('updateQuotationWithRevision ERROR:', err);
    return res.status(500).json({ message: err.message });
  } finally {
    connection.release();
  }
};


export const updateQuotationWithRevision13 = async (req, res) => {
  const { qt_id } = req.params;
  if (!qt_id) return res.status(400).json({ message: 'qt_id is required' });
 
  const connection = await db.getConnection();
 
  try {
    await connection.beginTransaction();
 
    const userId = req.session?.user?.id;
    if (!userId) return res.status(401).json({ message: 'User not authenticated' });
 
    const { 
      type, 
      acoustic_terms = null, 
      installments_config = [], 
      subject = null,
      selected_options_for_summary = null
    } = req.body;
    
    const resolvedOptions = resolveOptions(req.body);
 
    /* ── fetch quotation ── */
    const [[quotation]] = await connection.query(
      `SELECT qt_number, acoustic_terms FROM quotation WHERE qt_id = ?`,
      [qt_id]
    );
    if (!quotation) {
      await connection.rollback();
      return res.status(404).json({ message: 'Quotation not found' });
    }
 
    const finalAcousticTerms =
      acoustic_terms !== null ? acoustic_terms : quotation.acoustic_terms;
 
    /* ── get next revision number from quotation_revision ── */
    const [[maxRev]] = await connection.query(
      `SELECT MAX(revision) AS lastRevision FROM quotation_revision WHERE qt_id = ?`,
      [qt_id]
    );
    const newRevision = (maxRev?.lastRevision || 0) + 1;
 
    // Calculate totals for ALL options
    let totalProductsCost = 0;
    let totalWithGST = 0;
    let totalDiscounted = 0;
    let totalGSTAmount = 0;
    let totalDiscountAmount = 0;
    
    for (let i = 0; i < resolvedOptions.length; i++) {
      const option = resolvedOptions[i];
      const optionTotals = calcOptionTotals(option, type);
      
      totalProductsCost += optionTotals.productsTotal;
      totalWithGST += optionTotals.originalFinalTotal;
      totalDiscounted += optionTotals.discountedTotal;
      totalGSTAmount += optionTotals.gstAmount;
      totalDiscountAmount += optionTotals.discountAmount;
    }
    
    const overallDiscountPercentage = totalWithGST > 0 
      ? (totalDiscountAmount / totalWithGST) * 100 
      : 0;
    
    // Convert selected_options_for_summary to JSON string
    const selectedOptionsJson = selected_options_for_summary && Array.isArray(selected_options_for_summary) && selected_options_for_summary.length > 0 
      ? JSON.stringify(selected_options_for_summary) 
      : null;
    
    console.log('Creating revision:', newRevision);
    console.log('Selected options for summary:', selectedOptionsJson);
 
    /* ── insert revision record ── */
    const [revInsert] = await connection.query(
      `INSERT INTO quotation_revision
         (qt_id, revision, total_without_gst, total_with_gst, gst_app_amt, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [
        qt_id, newRevision,
        totalProductsCost,
        totalDiscounted,
        type === 'with_gst' ? (totalGSTAmount / 0.18) : 0,
      ]
    );
    const rev_id = revInsert.insertId;
 
    /* ── insert updated options for THIS revision only ── */
    const insertedOptions = [];
 
    for (let i = 0; i < resolvedOptions.length; i++) {
      const option = resolvedOptions[i];
      const {
        option_name = `OPTION ${i + 1}`,
        subject = null,           // ← ADDED: option subject
        subject_type = 'master',  // ← ADDED: subject type
        items = [],
        additional_prices = [],
        final_offer = null,
      } = option;
 
      // ✅ Saving revision + subject in quotation_options
      const [optInsert] = await connection.query(
        `INSERT INTO quotation_options (qt_id, option_name, option_order, revision, subject, subject_type, created_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [qt_id, option_name, i + 1, newRevision, subject, subject_type]
      );
      const optionId = optInsert.insertId;
 
      const totals = calcOptionTotals(option, type);
 
      // Insert products with current_revision
      await insertOptionProducts(connection, qt_id, optionId, items, newRevision, userId);
      
      // Insert additional prices with revision
      await insertOptionAdditionalWithRevision(connection, qt_id, optionId, additional_prices, newRevision);
      
      // Insert final offer with revision
      await insertOptionFinalOfferWithRevision(connection, qt_id, optionId, final_offer, totals.originalFinalTotal, newRevision);
      
      // Insert installments with revision
      const optionInstallmentConfig = installments_config.find(cfg => cfg.option_id === i || cfg.option_index === i);
      if (optionInstallmentConfig && optionInstallmentConfig.installments && optionInstallmentConfig.installments.length > 0) {
        await insertOptionInstallmentsWithRevision(connection, qt_id, optionId, optionInstallmentConfig.installments, totals.discountedTotal, newRevision);
      }
 
      insertedOptions.push({
        option_id: optionId,
        option_name,
        subject: subject,
        subject_type: subject_type,
        option_order: i + 1,
        revision: newRevision,
        finalized_total: totals.discountedTotal,
        ...totals,
      });
    }
 
    /* ── update quotation header ── */
    await connection.query(
      `UPDATE quotation SET
         type = ?, acoustic_terms = ?, subject = ?,
         total_price = ?, without_gst_total = ?, with_gst_total = ?,
         discounted_total = ?, discount_percentage = ?, discount_amount = ?,
         selected_options_for_summary = ?,
         current_revision = ?,
         updated_by = ?, updated_at = NOW()
       WHERE qt_id = ?`,
      [
        type, finalAcousticTerms, subject,
        totalProductsCost,
        totalProductsCost,
        totalWithGST,
        totalDiscounted,
        overallDiscountPercentage,
        totalDiscountAmount,
        selectedOptionsJson,
        newRevision,
        userId, qt_id,
      ]
    );
 
    await connection.commit();
 
    return res.status(200).json({
      message: 'Quotation updated + revision created',
      qt_id,
      qt_number: quotation.qt_number,
      revision: newRevision,
      rev_id,
      options: insertedOptions,
      totals: {
        products_total: totalProductsCost,
        with_gst_total: totalWithGST,
        discounted_total: totalDiscounted,
        discount_amount: totalDiscountAmount,
        discount_percentage: overallDiscountPercentage
      }
    });
 
  } catch (err) {
    await connection.rollback();
    console.error('updateQuotationWithRevision ERROR:', err);
    return res.status(500).json({ message: err.message });
  } finally {
    connection.release();
  }
};


export const updateQuotationWithRevision = async (req, res) => {
  const { qt_id } = req.params;
  if (!qt_id) return res.status(400).json({ message: 'qt_id is required' });
 
  const connection = await db.getConnection();
 
  try {
    await connection.beginTransaction();
 
    const userId = req.session?.user?.id;
    if (!userId) return res.status(401).json({ message: 'User not authenticated' });
 
    const { 
      type, 
      acoustic_terms = null, 
      installments_config = [], 
      subject = null,
      selected_options_for_summary = null,
      quotation_type = 'demo'  
    } = req.body;
    
    const resolvedOptions = resolveOptions(req.body);
 
    /* ── fetch quotation ── */
    const [[quotation]] = await connection.query(
      `SELECT qt_number, acoustic_terms, quotation_type FROM quotation WHERE qt_id = ?`,
      [qt_id]
    );
    if (!quotation) {
      await connection.rollback();
      return res.status(404).json({ message: 'Quotation not found' });
    }
 
    const finalAcousticTerms =
      acoustic_terms !== null ? acoustic_terms : quotation.acoustic_terms;
    
    const finalQuotationType = quotation_type || quotation.quotation_type || 'demo';
 
    /* ── get next revision number from quotation_revision ── */
    const [[maxRev]] = await connection.query(
      `SELECT MAX(revision) AS lastRevision FROM quotation_revision WHERE qt_id = ?`,
      [qt_id]
    );
    const newRevision = (maxRev?.lastRevision || 0) + 1;
 
    // Calculate totals for ALL options
    let totalProductsCost = 0;
    let totalWithGST = 0;
    let totalDiscounted = 0;
    let totalGSTAmount = 0;
    let totalDiscountAmount = 0;
    
    for (let i = 0; i < resolvedOptions.length; i++) {
      const option = resolvedOptions[i];
      const optionTotals = calcOptionTotals(option, type);
      
      totalProductsCost += optionTotals.productsTotal;
      totalWithGST += optionTotals.originalFinalTotal;
      totalDiscounted += optionTotals.discountedTotal;
      totalGSTAmount += optionTotals.gstAmount;
      totalDiscountAmount += optionTotals.discountAmount;
    }
    
    const overallDiscountPercentage = totalWithGST > 0 
      ? (totalDiscountAmount / totalWithGST) * 100 
      : 0;
    
    // Convert selected_options_for_summary to JSON string (store in revision)
    const selectedOptionsJson = selected_options_for_summary && Array.isArray(selected_options_for_summary) && selected_options_for_summary.length > 0 
      ? JSON.stringify(selected_options_for_summary) 
      : null;
 
    /* ── insert revision record ── */
    const [revInsert] = await connection.query(
      `INSERT INTO quotation_revision
         (qt_id, revision, total_without_gst, total_with_gst, gst_app_amt, selected_options_for_summary, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [
        qt_id, newRevision,
        totalProductsCost,
        totalDiscounted,
        type === 'with_gst' ? (totalGSTAmount / 0.18) : 0,
        selectedOptionsJson,
      ]
    );
    const rev_id = revInsert.insertId;
 
    /* ── insert updated options for THIS revision only ── */
    const insertedOptions = [];
 
    for (let i = 0; i < resolvedOptions.length; i++) {
      const option = resolvedOptions[i];
      const {
        option_name = `OPTION ${i + 1}`,
        subject = null,
        subject_type = 'master',
        floor_name = null,
        room_name = null,
        items = [],
        additional_prices = [],
        final_offer = null,
      } = option;
 
      const [optInsert] = await connection.query(
        `INSERT INTO quotation_options 
           (qt_id, option_name, option_order, revision, subject, subject_type, floor_name, room_name, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [qt_id, option_name, i + 1, newRevision, subject, subject_type, floor_name, room_name]
      );
      const optionId = optInsert.insertId;
 
      const totals = calcOptionTotals(option, type);
 
      await insertOptionProducts(connection, qt_id, optionId, items, newRevision, userId);
      await insertOptionAdditionalWithRevision(connection, qt_id, optionId, additional_prices, newRevision);
      await insertOptionFinalOfferWithRevision(connection, qt_id, optionId, final_offer, totals.originalFinalTotal, newRevision);
      
      const optionInstallmentConfig = installments_config.find(cfg => cfg.option_index === i);
      if (optionInstallmentConfig && optionInstallmentConfig.selected && optionInstallmentConfig.installments && optionInstallmentConfig.installments.length > 0) {
        await insertOptionInstallmentsWithRevision(connection, qt_id, optionId, optionInstallmentConfig.installments, totals.discountedTotal, newRevision);
      }
 
      insertedOptions.push({
        option_id: optionId,
        option_name,
        subject: subject,
        subject_type: subject_type,
        floor_name: floor_name,
        room_name: room_name,
        option_order: i + 1,
        revision: newRevision,
        finalized_total: totals.discountedTotal,
        ...totals,
      });
    }
 
    /* ── update quotation header with quotation_type ── */
    await connection.query(
      `UPDATE quotation SET
         type = ?, acoustic_terms = ?, subject = ?,
         total_price = ?, without_gst_total = ?, with_gst_total = ?,
         discounted_total = ?, discount_percentage = ?, discount_amount = ?,
         quotation_type = ?,  
         current_revision = ?,
         updated_by = ?, updated_at = NOW()
       WHERE qt_id = ?`,
      [
        type, finalAcousticTerms, subject,
        totalProductsCost,
        totalProductsCost,
        totalWithGST,
        totalDiscounted,
        overallDiscountPercentage,
        totalDiscountAmount,
        finalQuotationType,  
        newRevision,
        userId, qt_id,
      ]
    );
 
    await connection.commit();
 
    return res.status(200).json({
      message: 'Quotation updated + revision created',
      qt_id,
      qt_number: quotation.qt_number,
      revision: newRevision,
      rev_id,
      quotation_type: finalQuotationType, 
      options: insertedOptions,
      totals: {
        products_total: totalProductsCost,
        with_gst_total: totalWithGST,
        discounted_total: totalDiscounted,
        discount_amount: totalDiscountAmount,
        discount_percentage: overallDiscountPercentage
      }
    });
 
  } catch (err) {
    await connection.rollback();
    console.error('updateQuotationWithRevision ERROR:', err);
    return res.status(500).json({ message: err.message });
  } finally {
    connection.release();
  }
};





// export const getQuotationForEdit = async (req, res) => {
//   const { qt_id, revision } = req.params;

//   if (!qt_id || !revision) {
//     return res.status(400).json({ message: 'qt_id & revision required' });
//   }

//   const connection = await db.getConnection();

//   try {
//     /* ===== QUOTATION BASIC ===== */
//     const [[quotation]] = await connection.query(
//       `SELECT qt_id, qt_number, type, master_id
//        FROM quotation
//        WHERE qt_id = ?`,
//       [qt_id],
//     );

//     if (!quotation) {
//       return res.status(404).json({ message: 'Quotation not found' });
//     }

//     /* ===== LEAD ===== */
//     const [[lead]] = await connection.query(
//       `SELECT name
//        FROM raw_data
//        WHERE master_id = ?`,
//       [quotation.master_id],
//     );

//     /* ===== REVISION DATA ===== */
//     const [rows] = await connection.query(
//       `SELECT
//           qm.cat_id,
//           qm.kit_id,
//           k.kit_name,
//           qm.kit_qty,
//           qm.model_id,
//           qm.model_qty,
//           qm.model_price,
//           m.model_no AS model,
//           m.description AS model_description,
//           b.brand_name,
//           pt.product_type_name
//        FROM quotation_mapped qm
//        LEFT JOIN kit k ON k.kit_id = qm.kit_id
//        JOIN models m ON m.model_id = qm.model_id
//        LEFT JOIN brands b ON b.brand_id = m.brand_id
//        LEFT JOIN product_types pt ON pt.product_type_id = (
//          SELECT product_type_id
//          FROM kit_mapping
//          WHERE model_id = qm.model_id
//          LIMIT 1
//        )
//        WHERE qm.qt_id = ?
//          AND qm.current_revision = ?
//        ORDER BY qm.kit_id`,
//       [qt_id, revision],
//     );

//     /* ===== GROUP BY KIT ===== */
//     const kitsMap = {};

//     for (const row of rows) {
//       const key = row.kit_id ?? 'single';

//       if (!kitsMap[key]) {
//         kitsMap[key] = {
//           cat_id: row.cat_id,
//           kit_id: row.kit_id,
//           kit_name: row.kit_name,
//           kit_qty: row.kit_qty,
//           items: [],
//         };
//       }

//       kitsMap[key].items.push({
//         model_id: row.model_id,
//         model: row.model,
//         model_qty: row.model_qty,
//         model_price: row.model_price,
//         brand_name: row.brand_name,
//         product_type_name: row.product_type_name,
//         model_description: row.model_description,
//       });
//     }

//     /* ===== ADDITIONAL PRICES ===== */
//     const [additionalPrices] = await connection.query(
//       `SELECT add_price_name, price
//        FROM additional_price
//        WHERE qt_id = ?`,
//       [qt_id],
//     );

//     return res.status(200).json({
//       qt_id: quotation.qt_id,
//       qt_number: quotation.qt_number,
//       type: quotation.type,
//       lead: lead || null,
//       revisions: [
//         {
//           revision: Number(revision),
//           kits: Object.values(kitsMap),
//         },
//       ],
//       additional_prices: additionalPrices,
//     });
//   } catch (error) {
//     console.error('❌ getQuotationForEdit error:', error);
//     return res.status(500).json({ message: 'Failed to fetch quotation' });
//   } finally {
//     connection.release();
//   }
// };

export const getQuotationForEdit1 = async (req, res) => {
  const { qt_id, revision } = req.params;

  if (!qt_id || !revision) {
    return res.status(400).json({ message: "qt_id & revision required" });
  }

  const connection = await db.getConnection();

  try {
    /* ===== QUOTATION HEADER ===== */
    const [[quotation]] = await connection.query(
      `SELECT qt_id, qt_number, type, acoustic_terms 
       FROM quotation 
       WHERE qt_id = ?`,
      [qt_id]
    );

    if (!quotation) {
      return res.status(404).json({ message: "Quotation not found" });
    }

    /* ===== REVISION FINANCIAL DATA (INCLUDING GST) ===== */
 const [[revisionData]] = await connection.query(
  `SELECT total_without_gst, total_with_gst, gst_app_amt
   FROM quotation_revision
   WHERE qt_id = ? AND revision = ?`,
  [qt_id, revision],
);
    if (!revisionData) {
      return res.status(404).json({ message: "Revision not found" });
    }

    /* ===== REVISION PRODUCT DATA ===== */
    const [rows] = await connection.query(
      `
      SELECT 
          qm.cat_id,
          qm.kit_id,
          k.kit_name,
          qm.kit_qty,
          qm.model_id,
          qm.model_qty,
          qm.model_price,
          m.model_no AS model,
          m.description AS model_description,
          b.brand_name,
          pt.product_type_name
      FROM quotation_mapped qm
      LEFT JOIN kit k ON k.kit_id = qm.kit_id
      JOIN models m ON m.model_id = qm.model_id
      LEFT JOIN brands b ON b.brand_id = m.brand_id
      LEFT JOIN product_types pt ON pt.product_type_id = (
        SELECT product_type_id
        FROM kit_mapping
        WHERE model_id = qm.model_id
        LIMIT 1
      )
      WHERE qm.qt_id = ?
        AND qm.current_revision = ?
      ORDER BY qm.kit_id
      `,
      [qt_id, revision]
    );

    /* ===== GROUP INTO KITS ===== */
    const kitsMap = {};

    for (const row of rows) {
      const key = row.kit_id ?? "single";

      if (!kitsMap[key]) {
        kitsMap[key] = {
          cat_id: row.cat_id,
          kit_id: row.kit_id,
          kit_name: row.kit_name,
          kit_qty: row.kit_qty,
          items: [],
        };
      }

      kitsMap[key].items.push({
        model_id: row.model_id,
        model: row.model,
        model_qty: Number(row.model_qty),
        model_price: Number(row.model_price),
        brand_name: row.brand_name,
        product_type_name: row.product_type_name,
        model_description: row.model_description,
      });
    }

    /* ===== ADDITIONAL PRICES ===== */
    const [additionalPrices] = await connection.query(
      `SELECT add_price_name, price 
       FROM additional_price 
       WHERE qt_id = ?`,
      [qt_id]
    );

    /* ===== FINAL RESPONSE ===== */
    return res.status(200).json({
      qt_id: quotation.qt_id,
      qt_number: quotation.qt_number,
      type: quotation.type,
      acoustic_terms: quotation.acoustic_terms,

    revisions: [
  {
    revision: Number(revision),
    gst_app_amt: Number(revisionData?.gst_app_amt || 0),
    total_without_gst: Number(revisionData?.total_without_gst || 0),
    total_with_gst: Number(revisionData?.total_with_gst || 0),
    kits: Object.values(kitsMap),
    additional_prices: additionalPrices,
  },
],
    });

  } catch (error) {
    console.error("❌ getQuotationForEdit error:", error);
    return res.status(500).json({ message: "Failed to fetch quotation" });
  } finally {
    connection.release();
  }
};


export const getQuotationForEdit2 = async (req, res) => {
  const { qt_id, revision } = req.params;

  if (!qt_id || !revision) {
    return res.status(400).json({ message: "qt_id & revision required" });
  }

  const connection = await db.getConnection();

  try {
    /* ===== QUOTATION HEADER ===== */
    const [[quotation]] = await connection.query(
      `SELECT qt_id, qt_number, type, acoustic_terms 
       FROM quotation 
       WHERE qt_id = ?`,
      [qt_id]
    );

    if (!quotation) {
      return res.status(404).json({ message: "Quotation not found" });
    }

    /* ===== REVISION DATA ===== */
    const [[revisionData]] = await connection.query(
      `SELECT total_without_gst, total_with_gst, gst_app_amt
       FROM quotation_revision
       WHERE qt_id = ? AND revision = ?`,
      [qt_id, revision]
    );

    /* ===== PRODUCTS ===== */
    const [rows] = await connection.query(
      `
      SELECT 
          qm.cat_id,
          qm.kit_id,
          k.kit_name,
          qm.kit_qty,
          qm.model_id,
          qm.model_qty,
          qm.model_price,
          m.model_no AS model,
          m.description AS model_description,
          b.brand_name,
          pt.product_type_name
      FROM quotation_mapped qm
      LEFT JOIN kit k ON k.kit_id = qm.kit_id
      JOIN models m ON m.model_id = qm.model_id
      LEFT JOIN brands b ON b.brand_id = m.brand_id
      LEFT JOIN product_types pt ON pt.product_type_id = (
        SELECT product_type_id
        FROM kit_mapping
        WHERE model_id = qm.model_id
        LIMIT 1
      )
      WHERE qm.qt_id = ?
        AND qm.current_revision = ?
      `,
      [qt_id, revision]
    );

    /* ===== GROUP KITS ===== */
    const kitsMap = {};

    rows.forEach((row) => {
      const key = row.kit_id ?? "single";

      if (!kitsMap[key]) {
        kitsMap[key] = {
          cat_id: row.cat_id,
          kit_id: row.kit_id,
          kit_name: row.kit_name,
          kit_qty: row.kit_qty,
          items: [],
        };
      }

      kitsMap[key].items.push({
        model_id: row.model_id,
        model: row.model,
        model_qty: Number(row.model_qty),
        model_price: Number(row.model_price),
        brand_name: row.brand_name,
        product_type_name: row.product_type_name,
        model_description: row.model_description,
      });
    });

    /* ===== ADDITIONAL PRICES ===== */
    const [additionalPrices] = await connection.query(
      `SELECT add_price_name, price 
       FROM additional_price 
       WHERE qt_id = ?`,
      [qt_id]
    );

    /* ===== INSTALLMENTS (🔥 FIXED TABLE) ===== */
    const [installments] = await connection.query(
      `SELECT description, percentage, amount
       FROM quotation_installments
       WHERE qt_id = ?`,
      [qt_id]
    );

    /* ===== RESPONSE ===== */
    return res.status(200).json({
      qt_id: quotation.qt_id,
      qt_number: quotation.qt_number,
      type: quotation.type,
      acoustic_terms: quotation.acoustic_terms,

      installments: installments.map((i) => ({
        description: i.description,
        percentage: Number(i.percentage),
        amount: Number(i.amount),
      })),

      revisions: [
        {
          revision: Number(revision),
          gst_app_amt: Number(revisionData?.gst_app_amt || 0),
          total_without_gst: Number(revisionData?.total_without_gst || 0),
          total_with_gst: Number(revisionData?.total_with_gst || 0),
          kits: Object.values(kitsMap),
          additional_prices: additionalPrices,
        },
      ],
    });

  } catch (error) {
    console.error("❌ getQuotationForEdit error:", error);
    return res.status(500).json({ message: "Failed to fetch quotation" });
  } finally {
    connection.release();
  }
};


export const getQuotationForEdit3 = async (req, res) => {
  const { qt_id, revision } = req.params;

  if (!qt_id || !revision) {
    return res.status(400).json({ message: "qt_id & revision required" });
  }

  const connection = await db.getConnection();

  try {
    /* ===== QUOTATION HEADER ===== */
    const [[quotation]] = await connection.query(
      `SELECT qt_id, qt_number, type, acoustic_terms 
       FROM quotation 
       WHERE qt_id = ?`,
      [qt_id]
    );

    if (!quotation) {
      return res.status(404).json({ message: "Quotation not found" });
    }

    /* ===== REVISION DATA ===== */
    const [[revisionData]] = await connection.query(
      `SELECT total_without_gst, total_with_gst, gst_app_amt
       FROM quotation_revision
       WHERE qt_id = ? AND revision = ?`,
      [qt_id, revision]
    );

    /* ===== PRODUCTS ===== */
    const [rows] = await connection.query(
      `
      SELECT 
          qm.cat_id,
          qm.kit_id,
          k.kit_name,
          qm.kit_qty,
          qm.model_id,
          qm.model_qty,
          qm.model_price,
          m.model_no AS model,
          m.description AS model_description,
          b.brand_name,
          pt.product_type_name
      FROM quotation_mapped qm
      LEFT JOIN kit k ON k.kit_id = qm.kit_id
      JOIN models m ON m.model_id = qm.model_id
      LEFT JOIN brands b ON b.brand_id = m.brand_id
      LEFT JOIN product_types pt ON pt.product_type_id = (
        SELECT product_type_id
        FROM kit_mapping
        WHERE model_id = qm.model_id
        LIMIT 1
      )
      WHERE qm.qt_id = ?
        AND qm.current_revision = ?
      `,
      [qt_id, revision]
    );

    /* ===== GROUP KITS ===== */
    const kitsMap = {};

    rows.forEach((row) => {
      const key = row.kit_id ?? "single";

      if (!kitsMap[key]) {
        kitsMap[key] = {
          cat_id: row.cat_id,
          kit_id: row.kit_id,
          kit_name: row.kit_name,
          kit_qty: row.kit_qty,
          items: [],
        };
      }

      kitsMap[key].items.push({
        model_id: row.model_id,
        model: row.model,
        model_qty: Number(row.model_qty),
        model_price: Number(row.model_price),
        brand_name: row.brand_name,
        product_type_name: row.product_type_name,
        model_description: row.model_description,
      });
    });

    /* ===== ADDITIONAL PRICES ===== */
    const [additionalPrices] = await connection.query(
      `SELECT add_price_name, price 
       FROM additional_price 
       WHERE qt_id = ?`,
      [qt_id]
    );

    /* ===== INSTALLMENTS ===== */
    const [installments] = await connection.query(
      `SELECT description, percentage, amount
       FROM quotation_installments
       WHERE qt_id = ?`,
      [qt_id]
    );

    /* ===== ✅ FINAL BEST OFFER (NEW) ===== */
    const [finalOffer] = await connection.query(
      `SELECT description, percentage, amount, is_default
       FROM quotation_final_offer
       WHERE qt_id = ?`,
      [qt_id]
    );

    /* ===== RESPONSE ===== */
    return res.status(200).json({
      qt_id: quotation.qt_id,
      qt_number: quotation.qt_number,
      type: quotation.type,
      acoustic_terms: quotation.acoustic_terms,

      installments: installments.map((i) => ({
        description: i.description,
        percentage: Number(i.percentage),
        amount: Number(i.amount),
      })),

      final_offer: finalOffer.length > 0 ? {
        description: finalOffer[0].description,
        percentage: Number(finalOffer[0].percentage),
        amount: Number(finalOffer[0].amount),
        is_default: finalOffer[0].is_default
      } : null,

      revisions: [
        {
          revision: Number(revision),
          gst_app_amt: Number(revisionData?.gst_app_amt || 0),
          total_without_gst: Number(revisionData?.total_without_gst || 0),
          total_with_gst: Number(revisionData?.total_with_gst || 0),
          kits: Object.values(kitsMap),
          additional_prices: additionalPrices,
        },
      ],
    });

  } catch (error) {
    console.error("❌ getQuotationForEdit error:", error);
    return res.status(500).json({ message: "Failed to fetch quotation" });
  } finally {
    connection.release();
  }
};


export const getQuotationForEdit4 = async (req, res) => {
  const { qt_id, revision } = req.params;

  if (!qt_id || !revision) {
    return res.status(400).json({ message: "qt_id & revision required" });
  }

  const connection = await db.getConnection();

  try {
    /* ===== QUOTATION HEADER (INCLUDING DISCOUNT FIELDS) ===== */
    const [[quotation]] = await connection.query(
      `SELECT qt_id, qt_number, type, acoustic_terms,
              discounted_total, discount_percentage, discount_amount
       FROM quotation 
       WHERE qt_id = ?`,
      [qt_id]
    );

    if (!quotation) {
      return res.status(404).json({ message: "Quotation not found" });
    }

    /* ===== REVISION DATA ===== */
    const [[revisionData]] = await connection.query(
      `SELECT total_without_gst, total_with_gst, gst_app_amt
       FROM quotation_revision
       WHERE qt_id = ? AND revision = ?`,
      [qt_id, revision]
    );

    /* ===== PRODUCTS ===== */
    const [rows] = await connection.query(
      `
      SELECT 
          qm.cat_id,
          qm.kit_id,
          k.kit_name,
          qm.kit_qty,
          qm.model_id,
          qm.model_qty,
          qm.model_price,
          m.model_no AS model,
          m.description AS model_description,
          b.brand_name,
          pt.product_type_name
      FROM quotation_mapped qm
      LEFT JOIN kit k ON k.kit_id = qm.kit_id
      JOIN models m ON m.model_id = qm.model_id
      LEFT JOIN brands b ON b.brand_id = m.brand_id
      LEFT JOIN product_types pt ON pt.product_type_id = (
        SELECT product_type_id
        FROM kit_mapping
        WHERE model_id = qm.model_id
        LIMIT 1
      )
      WHERE qm.qt_id = ?
        AND qm.current_revision = ?
      `,
      [qt_id, revision]
    );

    /* ===== GROUP KITS ===== */
    const kitsMap = {};

    rows.forEach((row) => {
      const key = row.kit_id ?? "single";

      if (!kitsMap[key]) {
        kitsMap[key] = {
          cat_id: row.cat_id,
          kit_id: row.kit_id,
          kit_name: row.kit_name,
          kit_qty: row.kit_qty,
          items: [],
        };
      }

      kitsMap[key].items.push({
        model_id: row.model_id,
        model: row.model,
        model_qty: Number(row.model_qty),
        model_price: Number(row.model_price),
        brand_name: row.brand_name,
        product_type_name: row.product_type_name,
        model_description: row.model_description,
      });
    });

    /* ===== ADDITIONAL PRICES ===== */
    const [additionalPrices] = await connection.query(
      `SELECT add_price_name, price 
       FROM additional_price 
       WHERE qt_id = ?`,
      [qt_id]
    );

    /* ===== INSTALLMENTS ===== */
    const [installments] = await connection.query(
      `SELECT description, percentage, amount
       FROM quotation_installments
       WHERE qt_id = ?`,
      [qt_id]
    );

    /* ===== FINAL BEST OFFER ===== */
    const [finalOffer] = await connection.query(
      `SELECT description, percentage, amount, is_default
       FROM quotation_final_offer
       WHERE qt_id = ?`,
      [qt_id]
    );

    /* ===== RESPONSE ===== */
    return res.status(200).json({
      qt_id: quotation.qt_id,
      qt_number: quotation.qt_number,
      type: quotation.type,
      acoustic_terms: quotation.acoustic_terms,
      
      // Discount information
      discounted_total: Number(quotation.discounted_total || 0),
      discount_percentage: Number(quotation.discount_percentage || 0),
      discount_amount: Number(quotation.discount_amount || 0),

      installments: installments.map((i) => ({
        description: i.description,
        percentage: Number(i.percentage),
        amount: Number(i.amount),
      })),

      final_offer: finalOffer.length > 0 ? {
        description: finalOffer[0].description,
        percentage: Number(finalOffer[0].percentage),
        amount: Number(finalOffer[0].amount),
        is_default: finalOffer[0].is_default
      } : null,

      revisions: [
        {
          revision: Number(revision),
          gst_app_amt: Number(revisionData?.gst_app_amt || 0),
          total_without_gst: Number(revisionData?.total_without_gst || 0),
          total_with_gst: Number(revisionData?.total_with_gst || 0),
          kits: Object.values(kitsMap),
          additional_prices: additionalPrices,
        },
      ],
    });

  } catch (error) {
    console.error("❌ getQuotationForEdit error:", error);
    return res.status(500).json({ message: "Failed to fetch quotation" });
  } finally {
    connection.release();
  }
}; 


// ============================================================
//  GET QUOTATION FOR EDIT
//  GET /api/quotation/:qt_id/revision/:revision
//
//  Response includes options[] array — each option has its own
//  kits[], additional_prices[], final_offer
// ============================================================
export const getQuotationForEdit5 = async (req, res) => {
  const { qt_id, revision } = req.params;
  if (!qt_id || !revision) {
    return res.status(400).json({ message: 'qt_id & revision required' });
  }
 
  const connection = await db.getConnection();
 
  try {
    /* ── quotation header ── */
const [[quotation]] = await connection.query(
  `SELECT qt_id, qt_number, type, acoustic_terms, subject,
          discounted_total, discount_percentage, discount_amount
   FROM quotation WHERE qt_id = ?`,
  [qt_id]
);
    if (!quotation) return res.status(404).json({ message: 'Quotation not found' });
 
    /* ── revision data ── */
    const [[revisionData]] = await connection.query(
      `SELECT total_without_gst, total_with_gst, gst_app_amt
       FROM quotation_revision WHERE qt_id = ? AND revision = ?`,
      [qt_id, revision]
    );
 
    /* ── all options ── */
    const [optionRows] = await connection.query(
      `SELECT option_id, option_name, option_order
       FROM quotation_options WHERE qt_id = ? ORDER BY option_order ASC`,
      [qt_id]
    );
 
    /* ── build options array ── */
    const options = [];
 
    for (const opt of optionRows) {
      /* products */
      const [rows] = await connection.query(
        `SELECT
            qm.cat_id, qm.kit_id, qm.kit_qty,
            k.kit_name,
            qm.model_id, qm.model_qty, qm.model_price,
            m.model_no AS model,
            m.description AS model_description,
            b.brand_name,
            pt.product_type_name
         FROM quotation_mapped qm
         LEFT JOIN kit k ON k.kit_id = qm.kit_id
         JOIN models m ON m.model_id = qm.model_id
         LEFT JOIN brands b ON b.brand_id = m.brand_id
         LEFT JOIN product_types pt ON pt.product_type_id = (
           SELECT product_type_id FROM kit_mapping WHERE model_id = qm.model_id LIMIT 1
         )
         WHERE qm.qt_id = ? AND qm.option_id = ? AND qm.current_revision = ?`,
        [qt_id, opt.option_id, revision]
      );
 
      /* group products into kits */
      const kitsMap = {};
      rows.forEach(row => {
        const key = row.kit_id ?? 'single';
        if (!kitsMap[key]) {
          kitsMap[key] = {
            cat_id: row.cat_id,
            kit_id: row.kit_id,
            kit_name: row.kit_name,
            kit_qty: row.kit_qty,
            items: [],
          };
        }
        kitsMap[key].items.push({
          model_id: row.model_id,
          model: row.model,
          model_qty: Number(row.model_qty),
          model_price: Number(row.model_price),
          brand_name: row.brand_name,
          product_type_name: row.product_type_name,
          model_description: row.model_description,
        });
      });
 
      /* additional prices for this option */
      const [additionalPrices] = await connection.query(
        `SELECT add_price_name, price FROM additional_price
         WHERE qt_id = ? AND option_id = ?`,
        [qt_id, opt.option_id]
      );
 
      /* final offer for this option */
      const [finalOfferRows] = await connection.query(
        `SELECT description, percentage, amount, is_default
         FROM quotation_final_offer WHERE qt_id = ? AND option_id = ?`,
        [qt_id, opt.option_id]
      );
      
      /* installments for this option */
      const [installmentRows] = await connection.query(
        `SELECT description, percentage, amount 
         FROM quotation_installments WHERE qt_id = ? AND option_id = ?`,
        [qt_id, opt.option_id]
      );
 
      options.push({
        option_id: opt.option_id,
        option_name: opt.option_name,
        option_order: opt.option_order,
        gst_app_amt: Number(revisionData?.gst_app_amt || 0),
        kits: Object.values(kitsMap),
        additional_prices: additionalPrices.map(a => ({
          add_price_name: a.add_price_name,
          price: Number(a.price),
        })),
        final_offer: finalOfferRows.length > 0 ? {
          description: finalOfferRows[0].description,
          percentage: Number(finalOfferRows[0].percentage),
          amount: Number(finalOfferRows[0].amount),
          is_default: finalOfferRows[0].is_default,
        } : null,
        installments: installmentRows.map(i => ({
          description: i.description,
          percentage: Number(i.percentage),
          amount: Number(i.amount),
        })),
      });
    }
 
    return res.status(200).json({
      qt_id: quotation.qt_id,
      qt_number: quotation.qt_number,
      type: quotation.type,
      acoustic_terms: quotation.acoustic_terms,
        subject: quotation.subject,  // Add this line
      discounted_total: Number(quotation.discounted_total || 0),
      discount_percentage: Number(quotation.discount_percentage || 0),
      discount_amount: Number(quotation.discount_amount || 0),
      installments_config: options.map((opt, idx) => ({
        option_id: opt.option_id,
        option_index: idx,
        option_name: opt.option_name,
        installments: opt.installments || [],
      })),
      revisions: [
        {
          revision: Number(revision),
          gst_app_amt: Number(revisionData?.gst_app_amt || 0),
          total_without_gst: Number(revisionData?.total_without_gst || 0),
          total_with_gst: Number(revisionData?.total_with_gst || 0),
          options,
        },
      ],
    });
 
  } catch (error) {
    console.error('getQuotationForEdit error:', error);
    return res.status(500).json({ message: 'Failed to fetch quotation' });
  } finally {
    connection.release();
  }
};


export const getQuotationForEdit6 = async (req, res) => {
  const { qt_id, revision } = req.params;
  if (!qt_id || !revision) {
    return res.status(400).json({ message: 'qt_id & revision required' });
  }
 
  const connection = await db.getConnection();
 
  try {
    /* ── quotation header ── */
    const [[quotation]] = await connection.query(
      `SELECT qt_id, qt_number, type, acoustic_terms, subject,
              discounted_total, discount_percentage, discount_amount,
              selected_options_for_summary  -- ← ADD THIS
       FROM quotation WHERE qt_id = ?`,
      [qt_id]
    );
    if (!quotation) return res.status(404).json({ message: 'Quotation not found' });
 
    // Parse selected_options_for_summary
    let selectedOptionsForSummary = quotation.selected_options_for_summary;
    if (selectedOptionsForSummary && typeof selectedOptionsForSummary === 'string') {
      try {
        selectedOptionsForSummary = JSON.parse(selectedOptionsForSummary);
      } catch (e) {
        selectedOptionsForSummary = null;
      }
    }
 
    /* ── revision data ── */
    const [[revisionData]] = await connection.query(
      `SELECT total_without_gst, total_with_gst, gst_app_amt
       FROM quotation_revision WHERE qt_id = ? AND revision = ?`,
      [qt_id, revision]
    );
 
    /* ── all options ── */
    const [optionRows] = await connection.query(
      `SELECT option_id, option_name, option_order
       FROM quotation_options WHERE qt_id = ? ORDER BY option_order ASC`,
      [qt_id]
    );
 
    /* ── build options array ── */
    const options = [];
 
    for (const opt of optionRows) {
      /* products */
      const [rows] = await connection.query(
        `SELECT
            qm.cat_id, qm.kit_id, qm.kit_qty,
            k.kit_name,
            qm.model_id, qm.model_qty, qm.model_price,
            m.model_no AS model,
            m.description AS model_description,
            b.brand_name,
            pt.product_type_name
         FROM quotation_mapped qm
         LEFT JOIN kit k ON k.kit_id = qm.kit_id
         JOIN models m ON m.model_id = qm.model_id
         LEFT JOIN brands b ON b.brand_id = m.brand_id
         LEFT JOIN product_types pt ON pt.product_type_id = (
           SELECT product_type_id FROM kit_mapping WHERE model_id = qm.model_id LIMIT 1
         )
         WHERE qm.qt_id = ? AND qm.option_id = ? AND qm.current_revision = ?`,
        [qt_id, opt.option_id, revision]
      );
 
      /* group products into kits */
      const kitsMap = {};
      rows.forEach(row => {
        const key = row.kit_id ?? 'single';
        if (!kitsMap[key]) {
          kitsMap[key] = {
            cat_id: row.cat_id,
            kit_id: row.kit_id,
            kit_name: row.kit_name,
            kit_qty: row.kit_qty,
            items: [],
          };
        }
        kitsMap[key].items.push({
          model_id: row.model_id,
          model: row.model,
          model_qty: Number(row.model_qty),
          model_price: Number(row.model_price),
          brand_name: row.brand_name,
          product_type_name: row.product_type_name,
          model_description: row.model_description,
        });
      });
 
      /* additional prices for this option */
      const [additionalPrices] = await connection.query(
        `SELECT add_price_name, price FROM additional_price
         WHERE qt_id = ? AND option_id = ?`,
        [qt_id, opt.option_id]
      );
 
      /* final offer for this option */
      const [finalOfferRows] = await connection.query(
        `SELECT description, percentage, amount, is_default
         FROM quotation_final_offer WHERE qt_id = ? AND option_id = ?`,
        [qt_id, opt.option_id]
      );
      
      /* installments for this option */
      const [installmentRows] = await connection.query(
        `SELECT description, percentage, amount 
         FROM quotation_installments WHERE qt_id = ? AND option_id = ?`,
        [qt_id, opt.option_id]
      );
 
      options.push({
        option_id: opt.option_id,
        option_name: opt.option_name,
        option_order: opt.option_order,
        gst_app_amt: Number(revisionData?.gst_app_amt || 0),
        kits: Object.values(kitsMap),
        additional_prices: additionalPrices.map(a => ({
          add_price_name: a.add_price_name,
          price: Number(a.price),
        })),
        final_offer: finalOfferRows.length > 0 ? {
          description: finalOfferRows[0].description,
          percentage: Number(finalOfferRows[0].percentage),
          amount: Number(finalOfferRows[0].amount),
          is_default: finalOfferRows[0].is_default,
        } : null,
        installments: installmentRows.map(i => ({
          description: i.description,
          percentage: Number(i.percentage),
          amount: Number(i.amount),
        })),
      });
    }
 
    return res.status(200).json({
      qt_id: quotation.qt_id,
      qt_number: quotation.qt_number,
      type: quotation.type,
      acoustic_terms: quotation.acoustic_terms,
      subject: quotation.subject,
      selected_options_for_summary: selectedOptionsForSummary,  // ← ADD THIS
      discounted_total: Number(quotation.discounted_total || 0),
      discount_percentage: Number(quotation.discount_percentage || 0),
      discount_amount: Number(quotation.discount_amount || 0),
      installments_config: options.map((opt, idx) => ({
        option_id: opt.option_id,
        option_index: idx,
        option_name: opt.option_name,
        installments: opt.installments || [],
      })),
      revisions: [
        {
          revision: Number(revision),
          gst_app_amt: Number(revisionData?.gst_app_amt || 0),
          total_without_gst: Number(revisionData?.total_without_gst || 0),
          total_with_gst: Number(revisionData?.total_with_gst || 0),
          options,
        },
      ],
    });
 
  } catch (error) {
    console.error('getQuotationForEdit error:', error);
    return res.status(500).json({ message: 'Failed to fetch quotation' });
  } finally {
    connection.release();
  }
};


export const getQuotationForEdit7 = async (req, res) => {
  const { qt_id, revision } = req.params;
  if (!qt_id || !revision) {
    return res.status(400).json({ message: 'qt_id & revision required' });
  }
 
  const connection = await db.getConnection();
 
  try {
    /* ── quotation header ── */
    const [[quotation]] = await connection.query(
      `SELECT qt_id, qt_number, type, acoustic_terms, subject,
              discounted_total, discount_percentage, discount_amount, current_revision,
              selected_options_for_summary
       FROM quotation WHERE qt_id = ?`,
      [qt_id]
    );
    if (!quotation) return res.status(404).json({ message: 'Quotation not found' });
 
    // Parse selected_options_for_summary
    let selectedOptionsForSummary = quotation.selected_options_for_summary;
    if (selectedOptionsForSummary && typeof selectedOptionsForSummary === 'string') {
      try {
        selectedOptionsForSummary = JSON.parse(selectedOptionsForSummary);
      } catch (e) {
        selectedOptionsForSummary = null;
      }
    }
 
    /* ── revision data ── */
    const [[revisionData]] = await connection.query(
      `SELECT total_without_gst, total_with_gst, gst_app_amt
       FROM quotation_revision WHERE qt_id = ? AND revision = ?`,
      [qt_id, revision]
    );
 
    /* ── options with revision filter - NO COMMENTS IN SQL ── */
    const [optionRows] = await connection.query(
      `SELECT option_id, option_name, option_order
       FROM quotation_options 
       WHERE qt_id = ? AND revision = ?
       ORDER BY option_order ASC`,
      [qt_id, revision]
    );
 
    /* ── build options array ── */
    const options = [];
 
    for (const opt of optionRows) {
      /* products */
      const [rows] = await connection.query(
        `SELECT
            qm.cat_id, qm.kit_id, qm.kit_qty,
            k.kit_name,
            qm.model_id, qm.model_qty, qm.model_price,
            m.model_no AS model,
            m.description AS model_description,
            b.brand_name,
            pt.product_type_name
         FROM quotation_mapped qm
         LEFT JOIN kit k ON k.kit_id = qm.kit_id
         JOIN models m ON m.model_id = qm.model_id
         LEFT JOIN brands b ON b.brand_id = m.brand_id
         LEFT JOIN product_types pt ON pt.product_type_id = (
           SELECT product_type_id FROM kit_mapping WHERE model_id = qm.model_id LIMIT 1
         )
         WHERE qm.qt_id = ? AND qm.option_id = ? AND qm.current_revision = ?`,
        [qt_id, opt.option_id, revision]
      );
 
      /* group products into kits */
      const kitsMap = {};
      rows.forEach(row => {
        const key = row.kit_id ?? 'single';
        if (!kitsMap[key]) {
          kitsMap[key] = {
            cat_id: row.cat_id,
            kit_id: row.kit_id,
            kit_name: row.kit_name,
            kit_qty: row.kit_qty,
            items: [],
          };
        }
        kitsMap[key].items.push({
          model_id: row.model_id,
          model: row.model,
          model_qty: Number(row.model_qty),
          model_price: Number(row.model_price),
          brand_name: row.brand_name,
          product_type_name: row.product_type_name,
          model_description: row.model_description,
        });
      });
 
      /* additional prices with revision filter */
      const [additionalPrices] = await connection.query(
        `SELECT add_price_name, price FROM additional_price
         WHERE qt_id = ? AND option_id = ? AND revision = ?`,
        [qt_id, opt.option_id, revision]
      );
 
      /* final offer with revision filter */
      const [finalOfferRows] = await connection.query(
        `SELECT description, percentage, amount, is_default
         FROM quotation_final_offer 
         WHERE qt_id = ? AND option_id = ? AND revision = ?`,
        [qt_id, opt.option_id, revision]
      );
      
      /* installments with revision filter */
      const [installmentRows] = await connection.query(
        `SELECT description, percentage, amount 
         FROM quotation_installments 
         WHERE qt_id = ? AND option_id = ? AND revision = ?`,
        [qt_id, opt.option_id, revision]
      );
 
      options.push({
        option_id: opt.option_id,
        option_name: opt.option_name,
        option_order: opt.option_order,
        gst_app_amt: Number(revisionData?.gst_app_amt || 0),
        kits: Object.values(kitsMap),
        additional_prices: additionalPrices.map(a => ({
          add_price_name: a.add_price_name,
          price: Number(a.price),
        })),
        final_offer: finalOfferRows.length > 0 ? {
          description: finalOfferRows[0].description,
          percentage: Number(finalOfferRows[0].percentage),
          amount: Number(finalOfferRows[0].amount),
          is_default: finalOfferRows[0].is_default,
        } : null,
        installments: installmentRows.map(i => ({
          description: i.description,
          percentage: Number(i.percentage),
          amount: Number(i.amount),
        })),
      });
    }
 
    return res.status(200).json({
      qt_id: quotation.qt_id,
      qt_number: quotation.qt_number,
      type: quotation.type,
      acoustic_terms: quotation.acoustic_terms,
      subject: quotation.subject,
      selected_options_for_summary: selectedOptionsForSummary,
      discounted_total: Number(quotation.discounted_total || 0),
      discount_percentage: Number(quotation.discount_percentage || 0),
      discount_amount: Number(quotation.discount_amount || 0),
      current_revision: quotation.current_revision,
      installments_config: options.map((opt, idx) => ({
        option_id: opt.option_id,
        option_index: idx,
        option_name: opt.option_name,
        installments: opt.installments || [],
      })),
      revisions: [
        {
          revision: Number(revision),
          gst_app_amt: Number(revisionData?.gst_app_amt || 0),
          total_without_gst: Number(revisionData?.total_without_gst || 0),
          total_with_gst: Number(revisionData?.total_with_gst || 0),
          options,
        },
      ],
    });
 
  } catch (error) {
    console.error('getQuotationForEdit error:', error);
    return res.status(500).json({ message: 'Failed to fetch quotation' });
  } finally {
    connection.release();
  }
};


export const getQuotationForEdit8 = async (req, res) => {
  const { qt_id, revision } = req.params;
  if (!qt_id || !revision) {
    return res.status(400).json({ message: 'qt_id & revision required' });
  }
 
  const connection = await db.getConnection();
 
  try {
    /* ── quotation header ── */
    const [[quotation]] = await connection.query(
      `SELECT qt_id, qt_number, type, acoustic_terms, subject,
              discounted_total, discount_percentage, discount_amount, current_revision,
              selected_options_for_summary
       FROM quotation WHERE qt_id = ?`,
      [qt_id]
    );
    if (!quotation) return res.status(404).json({ message: 'Quotation not found' });
 
    // Parse selected_options_for_summary
    let selectedOptionsForSummary = quotation.selected_options_for_summary;
    if (selectedOptionsForSummary && typeof selectedOptionsForSummary === 'string') {
      try {
        selectedOptionsForSummary = JSON.parse(selectedOptionsForSummary);
      } catch (e) {
        selectedOptionsForSummary = null;
      }
    }
 
    /* ── revision data ── */
    const [[revisionData]] = await connection.query(
      `SELECT total_without_gst, total_with_gst, gst_app_amt
       FROM quotation_revision WHERE qt_id = ? AND revision = ?`,
      [qt_id, revision]
    );
 
    /* ── options with revision filter - INCLUDING subject fields ── */
    const [optionRows] = await connection.query(
      `SELECT option_id, option_name, option_order, subject, subject_type
       FROM quotation_options 
       WHERE qt_id = ? AND revision = ?
       ORDER BY option_order ASC`,
      [qt_id, revision]
    );
 
    /* ── build options array ── */
    const options = [];
 
    for (const opt of optionRows) {
      /* products */
      const [rows] = await connection.query(
        `SELECT
            qm.cat_id, qm.kit_id, qm.kit_qty,
            k.kit_name,
            qm.model_id, qm.model_qty, qm.model_price,
            m.model_no AS model,
            m.description AS model_description,
            b.brand_name,
            pt.product_type_name
         FROM quotation_mapped qm
         LEFT JOIN kit k ON k.kit_id = qm.kit_id
         JOIN models m ON m.model_id = qm.model_id
         LEFT JOIN brands b ON b.brand_id = m.brand_id
         LEFT JOIN product_types pt ON pt.product_type_id = (
           SELECT product_type_id FROM kit_mapping WHERE model_id = qm.model_id LIMIT 1
         )
         WHERE qm.qt_id = ? AND qm.option_id = ? AND qm.current_revision = ?`,
        [qt_id, opt.option_id, revision]
      );
 
      /* group products into kits */
      const kitsMap = {};
      rows.forEach(row => {
        const key = row.kit_id ?? 'single';
        if (!kitsMap[key]) {
          kitsMap[key] = {
            cat_id: row.cat_id,
            kit_id: row.kit_id,
            kit_name: row.kit_name,
            kit_qty: row.kit_qty,
            items: [],
          };
        }
        kitsMap[key].items.push({
          model_id: row.model_id,
          model: row.model,
          model_qty: Number(row.model_qty),
          model_price: Number(row.model_price),
          brand_name: row.brand_name,
          product_type_name: row.product_type_name,
          model_description: row.model_description,
        });
      });
 
      /* additional prices with revision filter */
      const [additionalPrices] = await connection.query(
        `SELECT add_price_name, price FROM additional_price
         WHERE qt_id = ? AND option_id = ? AND revision = ?`,
        [qt_id, opt.option_id, revision]
      );
 
      /* final offer with revision filter */
      const [finalOfferRows] = await connection.query(
        `SELECT description, percentage, amount, is_default
         FROM quotation_final_offer 
         WHERE qt_id = ? AND option_id = ? AND revision = ?`,
        [qt_id, opt.option_id, revision]
      );
      
      /* installments with revision filter */
const [installmentRows] = await connection.query(
  `SELECT description, percentage, amount, payment_mode 
   FROM quotation_installments 
   WHERE qt_id = ? AND option_id = ? AND revision = ?`,
  [qt_id, opt.option_id, revision]
); 

      options.push({
        option_id: opt.option_id,
        option_name: opt.option_name,
        option_order: opt.option_order,
        subject: opt.subject || null,           // ← ADDED
        subject_type: opt.subject_type || 'master',  // ← ADDED
        gst_app_amt: Number(revisionData?.gst_app_amt || 0),
        kits: Object.values(kitsMap),
        additional_prices: additionalPrices.map(a => ({
          add_price_name: a.add_price_name,
          price: Number(a.price),
        })),
        final_offer: finalOfferRows.length > 0 ? {
          description: finalOfferRows[0].description,
          percentage: Number(finalOfferRows[0].percentage),
          amount: Number(finalOfferRows[0].amount),
          is_default: finalOfferRows[0].is_default,
        } : null,
installments: installmentRows.map(i => ({
  description: i.description,
  percentage: Number(i.percentage),
  amount: Number(i.amount),
  payment_mode: i.payment_mode || 'Online',  // Add payment mode
})),
      });
    }
 
    return res.status(200).json({
      qt_id: quotation.qt_id,
      qt_number: quotation.qt_number,
      type: quotation.type,
      acoustic_terms: quotation.acoustic_terms,
      subject: quotation.subject,
      selected_options_for_summary: selectedOptionsForSummary,
      discounted_total: Number(quotation.discounted_total || 0),
      discount_percentage: Number(quotation.discount_percentage || 0),
      discount_amount: Number(quotation.discount_amount || 0),
      current_revision: quotation.current_revision,
      options_data: options,  // ← Renamed to avoid confusion, or keep as 'options'
      installments_config: options.map((opt, idx) => ({
        option_id: opt.option_id,
        option_index: idx,
        option_name: opt.option_name,
        subject: opt.subject,
        subject_type: opt.subject_type,
        installments: opt.installments || [],
      })),
      revisions: [
        {
          revision: Number(revision),
          gst_app_amt: Number(revisionData?.gst_app_amt || 0),
          total_without_gst: Number(revisionData?.total_without_gst || 0),
          total_with_gst: Number(revisionData?.total_with_gst || 0),
          options,
        },
      ],
    });
 
  } catch (error) {
    console.error('getQuotationForEdit error:', error);
    return res.status(500).json({ message: 'Failed to fetch quotation' });
  } finally {
    connection.release();
  }
};



export const getQuotationForEdit = async (req, res) => {
  const { qt_id, revision } = req.params;
  if (!qt_id || !revision) {
    return res.status(400).json({ message: 'qt_id & revision required' });
  }
 
  const connection = await db.getConnection();
 
  try {
    /* ── quotation header with quotation_type ── */
    const [[quotation]] = await connection.query(
      `SELECT qt_id, qt_number, type, acoustic_terms, subject, quotation_type,
              discounted_total, discount_percentage, discount_amount, current_revision
       FROM quotation WHERE qt_id = ?`,
      [qt_id]
    );
    if (!quotation) return res.status(404).json({ message: 'Quotation not found' });
 
    /* ── revision data ── */
    const [[revisionData]] = await connection.query(
      `SELECT total_without_gst, total_with_gst, gst_app_amt, selected_options_for_summary
       FROM quotation_revision WHERE qt_id = ? AND revision = ?`,
      [qt_id, revision]
    );
 
    let selectedOptionsForSummary = revisionData?.selected_options_for_summary;
    if (selectedOptionsForSummary && typeof selectedOptionsForSummary === 'string') {
      try {
        selectedOptionsForSummary = JSON.parse(selectedOptionsForSummary);
      } catch (e) {
        selectedOptionsForSummary = [];
      }
    }
 
    const [optionRows] = await connection.query(
      `SELECT option_id, option_name, option_order, subject, subject_type, floor_name, room_name
       FROM quotation_options 
       WHERE qt_id = ? AND revision = ?
       ORDER BY option_order ASC`,
      [qt_id, revision]
    );
 
    const options = [];
 
    for (const opt of optionRows) {
      const [rows] = await connection.query(
        `SELECT
            qm.cat_id, qm.kit_id, qm.kit_qty,
            k.kit_name,
            qm.model_id, qm.model_qty, qm.model_price,
            m.model_no AS model,
            m.description AS model_description,
            b.brand_name,
            pt.product_type_name
         FROM quotation_mapped qm
         LEFT JOIN kit k ON k.kit_id = qm.kit_id
         JOIN models m ON m.model_id = qm.model_id
         LEFT JOIN brands b ON b.brand_id = m.brand_id
         LEFT JOIN product_types pt ON pt.product_type_id = (
           SELECT product_type_id FROM kit_mapping WHERE model_id = qm.model_id LIMIT 1
         )
         WHERE qm.qt_id = ? AND qm.option_id = ? AND qm.current_revision = ?`,
        [qt_id, opt.option_id, revision]
      );
 
      const kitsMap = {};
      rows.forEach(row => {
        const key = row.kit_id ?? 'single';
        if (!kitsMap[key]) {
          kitsMap[key] = {
            cat_id: row.cat_id,
            kit_id: row.kit_id,
            kit_name: row.kit_name,
            kit_qty: row.kit_qty,
            items: [],
          };
        }
        kitsMap[key].items.push({
          model_id: row.model_id,
          model: row.model,
          model_qty: Number(row.model_qty),
          model_price: Number(row.model_price),
          brand_name: row.brand_name,
          product_type_name: row.product_type_name,
          model_description: row.model_description,
        });
      });
 
      const [additionalPrices] = await connection.query(
        `SELECT add_price_name, price FROM additional_price
         WHERE qt_id = ? AND option_id = ? AND revision = ?`,
        [qt_id, opt.option_id, revision]
      );
 
      const [finalOfferRows] = await connection.query(
        `SELECT description, percentage, amount, is_default
         FROM quotation_final_offer 
         WHERE qt_id = ? AND option_id = ? AND revision = ?`,
        [qt_id, opt.option_id, revision]
      );
      
      const [installmentRows] = await connection.query(
        `SELECT description, percentage, amount, payment_mode 
         FROM quotation_installments 
         WHERE qt_id = ? AND option_id = ? AND revision = ?`,
        [qt_id, opt.option_id, revision]
      ); 

      options.push({
        option_id: opt.option_id,
        option_name: opt.option_name,
        option_order: opt.option_order,
        subject: opt.subject || null,
        subject_type: opt.subject_type || 'master',
        floor_name: opt.floor_name || null,
        room_name: opt.room_name || null,
        gst_app_amt: Number(revisionData?.gst_app_amt || 0),
        kits: Object.values(kitsMap),
        additional_prices: additionalPrices.map(a => ({
          add_price_name: a.add_price_name,
          price: Number(a.price),
        })),
        final_offer: finalOfferRows.length > 0 ? {
          description: finalOfferRows[0].description,
          percentage: Number(finalOfferRows[0].percentage),
          amount: Number(finalOfferRows[0].amount),
          is_default: finalOfferRows[0].is_default,
        } : null,
        installments: installmentRows.map(i => ({
          description: i.description,
          percentage: Number(i.percentage),
          amount: Number(i.amount),
          payment_mode: i.payment_mode || 'Online',
        })),
      });
    }
 
    return res.status(200).json({
      qt_id: quotation.qt_id,
      qt_number: quotation.qt_number,
      type: quotation.type,
      acoustic_terms: quotation.acoustic_terms,
      subject: quotation.subject,
      quotation_type: quotation.quotation_type || 'demo',  
      selected_options_for_summary: selectedOptionsForSummary || [],
      discounted_total: Number(quotation.discounted_total || 0),
      discount_percentage: Number(quotation.discount_percentage || 0),
      discount_amount: Number(quotation.discount_amount || 0),
      current_revision: quotation.current_revision,
      options_data: options,
      installments_config: options.map((opt, idx) => ({
        option_id: opt.option_id,
        option_index: idx,
        option_name: opt.option_name,
        subject: opt.subject,
        subject_type: opt.subject_type,
        floor_name: opt.floor_name,
        room_name: opt.room_name,
        installments: opt.installments || [],
      })),
      revisions: [
        {
          revision: Number(revision),
          gst_app_amt: Number(revisionData?.gst_app_amt || 0),
          total_without_gst: Number(revisionData?.total_without_gst || 0),
          total_with_gst: Number(revisionData?.total_with_gst || 0),
          options,
        },
      ],
    });
 
  } catch (error) {
    console.error('getQuotationForEdit error:', error);
    return res.status(500).json({ message: 'Failed to fetch quotation' });
  } finally {
    connection.release();
  }
};




export const getLatestQuotation = async (req, res) => {
  const { master_id } = req.params;

  if (!master_id) {
    return res.status(400).json({ message: 'master_id required' });
  }

  const connection = await db.getConnection();

  try {
    // First, get the latest revision for this master_id
    const [[latestRevision]] = await connection.query(
      `SELECT MAX(revision) as latest_revision 
       FROM quotation_revision qr
       JOIN quotation q ON q.qt_id = qr.qt_id
       WHERE q.master_id = ?`,
      [master_id]
    );

    if (!latestRevision || !latestRevision.latest_revision) {
      return res.status(404).json({ message: 'No quotations found' });
    }

    const revision = latestRevision.latest_revision;

    /* ================= LEAD ================= */
    const [[lead]] = await connection.query(
      `SELECT name, number, city 
       FROM raw_data 
       WHERE master_id = ?`,
      [master_id],
    );

    /* ================= QUOTATIONS ================= */
    const [quotations] = await connection.query(
      `SELECT 
        qt_id,
        master_id,
        qt_number,
        type,
        acoustic_terms,    
        total_price AS total_price,
        without_gst_total AS without_gst_total,
        with_gst_total AS with_gst_total
      FROM quotation
      WHERE master_id = ?`,
      [master_id],
    );

    if (!quotations.length) {
      return res.status(404).json({ message: 'No quotations found' });
    }

    /* ================= FETCH ALL CATEGORIES ================= */
    const [categories] = await connection.query(
      `SELECT cat_id, cat_name FROM category`,
    );
    const categoryMap = {};
    categories.forEach((c) => {
      categoryMap[c.cat_id] = c.cat_name;
    });

    /* ================= LOOP AND FETCH REVISION DATA ================= */
    for (let qt of quotations) {
      /* ===== ITEMS FOR LATEST REVISION ===== */
      const [mapped] = await connection.query(
        `SELECT 
            qm.qm_id,
            qm.cat_id,
            qm.kit_id,
            qm.model_id,
            qm.model_qty AS qty,
            qm.model_price AS price,
            k.kit_name,
            m.model_no AS model,
            m.image_path,
            m.description,
            m.price AS model_original_price,
            b.brand_name,
            pt.product_type_name
         FROM quotation_mapped qm
         LEFT JOIN kit k ON k.kit_id = qm.kit_id
         JOIN models m ON m.model_id = qm.model_id
         LEFT JOIN brands b ON b.brand_id = m.brand_id
         LEFT JOIN product_types pt ON pt.product_type_id = (
            SELECT product_type_id 
            FROM kit_mapping 
            WHERE model_id = qm.model_id LIMIT 1
         )
         WHERE qm.qt_id = ? AND qm.current_revision = ?
         ORDER BY qm.kit_id`,
        [qt.qt_id, revision],
      );

      /* ===== ADD CATEGORY NAME ===== */
      mapped.forEach((row) => {
        row.cat_name = categoryMap[row.cat_id] || 'Unknown';
      });

      /* ===== GROUP ITEMS BY KIT ===== */
      const kitsMap = {};
      for (let row of mapped) {
        const key = row.kit_id ?? 'single';

        if (!kitsMap[key]) {
          kitsMap[key] = {
            kit_id: row.kit_id,
            kit_name: row.kit_name,
            items: [],
          };
        }

        kitsMap[key].items.push(row);
      }

      qt.items = Object.values(kitsMap);

      /* ===== REVISION TOTAL ===== */
      const [[revTotal]] = await connection.query(
        `SELECT total_without_gst, total_with_gst 
         FROM quotation_revision 
         WHERE qt_id = ? AND revision = ?`,
        [qt.qt_id, revision],
      );

      qt.totals = revTotal || {};

      /* ===== ADDITIONAL PRICES ===== */
      const [additional] = await connection.query(
        `SELECT add_price_name, price 
         FROM additional_price 
         WHERE qt_id = ?`,
        [qt.qt_id],
      );

      qt.additional_prices = additional;
      
      // Add revision info to the quotation
      qt.current_revision = revision;
    }

    return res.status(200).json({
      master_id,
      revision,
      lead,
      quotations,
    });
  } catch (error) {
    console.error('getLatestQuotation Error:', error);
    return res.status(500).json({ message: 'Failed to fetch latest quotation' });
  } finally {
    connection.release();
  }
};


export const getLatestQuotationByMasterId = async (req, res) => {
  const { master_id } = req.params;
  if (!master_id) {
    return res.status(400).json({ message: 'master_id required' });
  }
 
  const connection = await db.getConnection();
 
  try {
    // Get lead information
 
    const [[lead]] = await connection.query(
  `SELECT 
      rd.name,
      rd.number,
      rd.address,

      -- ✅ If area exists show area_name else show city
      CASE
        WHEN rd.area_id IS NOT NULL 
             AND rd.area_id != ''
             AND a.area_name IS NOT NULL
        THEN a.area_name
        ELSE rd.city
      END AS city

   FROM raw_data rd

   LEFT JOIN area a
      ON a.area_id = rd.area_id

   WHERE rd.master_id = ?`,
  [master_id]
);

    
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
 
    // Get quotation header for this master_id
    const [[quotation]] = await connection.query(
      `SELECT qt_id, master_id, qt_number, type, created_at, acoustic_terms, subject, selected_options_for_summary
       FROM quotation WHERE master_id = ? LIMIT 1`,
      [master_id]
    );
    
    if (!quotation) {
      return res.status(404).json({ 
        message: `No quotation found for master_id: ${master_id}` 
      });
    }
 
    // Parse selected_options_for_summary
    let selectedOptionsForSummary = null;
    if (quotation.selected_options_for_summary) {
      if (typeof quotation.selected_options_for_summary === 'object') {
        selectedOptionsForSummary = quotation.selected_options_for_summary;
      } 
      else if (typeof quotation.selected_options_for_summary === 'string') {
        try {
          selectedOptionsForSummary = JSON.parse(quotation.selected_options_for_summary);
        } catch (e) {
          console.error('Error parsing selected_options_for_summary:', e);
          selectedOptionsForSummary = null;
        }
      }
    }
 
    // Get the LATEST revision number from quotation_revision
    const [[latestRevisionRow]] = await connection.query(
      `SELECT MAX(revision) as latest_revision 
       FROM quotation_revision 
       WHERE qt_id = ?`,
      [quotation.qt_id]
    );
    
    const latestRevision = latestRevisionRow?.latest_revision || 1;
    console.log(`📊 Latest revision for QT ${quotation.qt_id}: ${latestRevision}`);
    
    // Get revision data for the latest revision
    const [[revisionData]] = await connection.query(
      `SELECT total_without_gst, total_with_gst, gst_app_amt
       FROM quotation_revision 
       WHERE qt_id = ? AND revision = ?`,
      [quotation.qt_id, latestRevision]
    );
    
    if (!revisionData) {
      return res.status(404).json({ 
        message: `Revision ${latestRevision} not found` 
      });
    }
 
    // Get category mapping
    const [categories] = await connection.query(`SELECT cat_id, cat_name FROM category`);
    const categoryMap = {};
    categories.forEach(c => { categoryMap[c.cat_id] = c.cat_name; });
 
    // Get options for this revision
    const [optionRows] = await connection.query(
      `SELECT option_id, option_name, option_order, subject, subject_type
       FROM quotation_options 
       WHERE qt_id = ? AND revision = ?
       ORDER BY option_order ASC`,
      [quotation.qt_id, latestRevision]
    );
 
    const GST_PERCENT = 18;
    const gstBase = Number(revisionData.gst_app_amt || 0);
    const builtOptions = [];
 
    for (const opt of optionRows) {
      // Get products mapped to this option with product_type_name
      const [mapped] = await connection.query(
        `SELECT
            qm.qm_id, 
            qm.cat_id, 
            qm.kit_id, 
            qm.model_id,
            qm.kit_qty,
            qm.model_qty AS qty,
            qm.model_price AS price,
            qm.current_revision,
            k.kit_name,
            m.model_no AS model,
            m.image_path,
            m.description,
            m.price AS model_original_price,
            b.brand_name,
            pt.product_type_name
         FROM quotation_mapped qm
         LEFT JOIN kit k ON k.kit_id = qm.kit_id
         JOIN models m ON m.model_id = qm.model_id
         LEFT JOIN brands b ON b.brand_id = m.brand_id
         LEFT JOIN product_types pt ON pt.product_type_id = (
           SELECT product_type_id FROM kit_mapping WHERE model_id = qm.model_id LIMIT 1
         )
         WHERE qm.qt_id = ? 
           AND qm.option_id = ? 
           AND qm.current_revision = ?
         ORDER BY qm.kit_id, qm.qm_id`,
        [quotation.qt_id, opt.option_id, latestRevision]
      );
 
      mapped.forEach(row => {
        row.cat_name = categoryMap[row.cat_id] || 'Unknown';
        row.price = Number(row.price || 0);
        row.model_original_price = Number(row.model_original_price || 0);
      });
 
      // Group by kit
      const kitsMap = {};
      for (const row of mapped) {
        const key = row.kit_id ?? 'single';
        if (!kitsMap[key]) {
          kitsMap[key] = { 
            kit_id: row.kit_id, 
            kit_name: row.kit_name, 
            items: [] 
          };
        }
        kitsMap[key].items.push(row);
      }
 
      // Get additional prices for this option and revision
      const [additional] = await connection.query(
        `SELECT add_price_name, price FROM additional_price
         WHERE qt_id = ? AND option_id = ? AND revision = ?`,
        [quotation.qt_id, opt.option_id, latestRevision]
      );
      const additional_prices = additional.map(a => ({
        add_price_name: a.add_price_name,
        price: Number(a.price || 0),
      }));
 
      // Get final offer for this option and revision
      const [finalOfferRows] = await connection.query(
        `SELECT description, percentage, amount, is_default
         FROM quotation_final_offer 
         WHERE qt_id = ? AND option_id = ? AND revision = ?
         LIMIT 1`,
        [quotation.qt_id, opt.option_id, latestRevision]
      );
      
      // Get installments for this option and revision
      const [installmentRows] = await connection.query(
        `SELECT description, percentage, amount 
         FROM quotation_installments 
         WHERE qt_id = ? AND option_id = ? AND revision = ?`,
        [quotation.qt_id, opt.option_id, latestRevision]
      );
 
      // Calculate per-option totals
      const optProductsTotal = mapped.reduce(
        (sum, row) => sum + Number(row.price) * Number(row.qty),
        0
      );
      const optAdditionalTotal = additional_prices.reduce((s, a) => s + a.price, 0);
      const optGst = quotation.type === 'with_gst' ? (optProductsTotal + optAdditionalTotal) * GST_PERCENT / 100 : 0;
      const optTotalWithGST = optProductsTotal + optAdditionalTotal + optGst;
 
      let finalOfferData = null;
      let finalOfferAmount = 0;
 
      if (finalOfferRows.length > 0 && Number(finalOfferRows[0].amount) > 0) {
        finalOfferData = {
          description: finalOfferRows[0].description || 'FINAL BEST OFFER (OPTIONAL)',
          percentage: Number(finalOfferRows[0].percentage || 0),
          amount: Number(finalOfferRows[0].amount || 0),
        };
        finalOfferAmount = Number(finalOfferRows[0].amount || 0);
      }
 
      const finalizedTotal = optTotalWithGST - finalOfferAmount;
 
      builtOptions.push({
        option_id: opt.option_id,
        option_name: opt.option_name,
        subject: opt.subject || null,
        subject_type: opt.subject_type || 'master',
        option_order: opt.option_order,
        items: Object.values(kitsMap),
        additional_prices,
        installments: installmentRows.map(i => ({
          description: i.description,
          percentage: Number(i.percentage || 0),
          amount: Number(i.amount || 0),
        })),
        revision_details: {
          total_without_gst: optProductsTotal,
          total_with_gst: optTotalWithGST,
          gst_app_amt: gstBase,
          gst_percent: GST_PERCENT,
          gst_calculated_amount: optGst,
        },
        final_offer: finalOfferData,
        final_offer_amount: finalOfferAmount,
        finalized_total: finalizedTotal,
      });
    }
 
    // Calculate overall totals
    const overallTotalWithoutGST = builtOptions.reduce((sum, opt) => 
      sum + (opt.revision_details?.total_without_gst || 0), 0
    );
    const overallTotalWithGST = builtOptions.reduce((sum, opt) => 
      sum + (opt.revision_details?.total_with_gst || 0), 0
    );
 
    return res.status(200).json({
      success: true,
      master_id,
      revision: latestRevision,
      lead,
      quotation: {
        qt_id: quotation.qt_id,
        qt_number: quotation.qt_number,
        type: quotation.type,
        acoustic_terms: quotation.acoustic_terms,
        subject: quotation.subject,
        selected_options_for_summary: selectedOptionsForSummary,
        created_at: quotation.created_at,
        options: builtOptions,
        totals: {
          total_without_gst: overallTotalWithoutGST,
          total_with_gst: overallTotalWithGST,
        },
        revision_data: {
          total_without_gst: Number(revisionData.total_without_gst || 0),
          total_with_gst: Number(revisionData.total_with_gst || 0),
          gst_app_amt: Number(revisionData.gst_app_amt || 0),
        }
      },
    });
 
  } catch (error) {
    console.error('getLatestQuotationByMasterId Error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Failed to fetch quotation',
      error: error.message 
    });
  } finally {
    connection.release();
  }
};


// ==================== ADDITIONAL CHARGES MASTER CONTROLLERS ====================

// Add new additional charge
export const addAdditionalChargeController = async (req, res) => {
  console.log('Session:', req.session);
  
  if (!req.session.user) {
    return res.status(401).json({ error: 'Unauthorized. Please log in.' });
  }

  const { charge_name, price } = req.body;

  if (!charge_name) {
    return res.status(400).json({ error: 'Charge name is required' });
  }

  const createdBy = req.session.user.id;
  const status = 'active';

  try {
    const [result] = await db.query(
      `INSERT INTO additional_charges_master 
       (charge_name, price, status, created_by, created_at) 
       VALUES (?, ?, ?, ?, NOW())`,
      [charge_name, price || 0, status, createdBy]
    );

    res.status(201).json({ 
      charge_id: result.insertId, 
      charge_name, 
      price: price || 0,
      message: 'Additional charge added successfully' 
    });
  } catch (error) {
    console.error("Error adding additional charge:", error);
    res.status(500).json({ error: 'Failed to add additional charge' });
  }
};

// Fetch all additional charges
export const getAdditionalChargesController = async (req, res) => {
  try {
    const [charges] = await db.query(
      `SELECT charge_id, charge_name, price, status, created_by, created_at, updated_at 
       FROM additional_charges_master 
       ORDER BY created_at DESC`
    );
    res.status(200).json(charges);
  } catch (error) {
    console.error("Error fetching additional charges:", error);
    res.status(500).json({ error: 'Failed to fetch additional charges' });
  }
};

// Update additional charge
export const updateAdditionalChargeController = async (req, res) => {
  const { id } = req.params;
  const { charge_name, price, status } = req.body;

  if (!charge_name && !price && !status) {
    return res.status(400).json({ message: "No valid fields to update" });
  }

  const updateData = {};
  if (charge_name) updateData.charge_name = charge_name;
  if (price !== undefined) updateData.price = price;
  if (status) updateData.status = status;

  try {
    const [result] = await db.query(
      "UPDATE additional_charges_master SET ? WHERE charge_id = ?",
      [updateData, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Additional charge not found" });
    }

    res.status(200).json({ message: "Additional charge updated successfully" });
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ message: "Error updating additional charge" });
  }
};

// Delete additional charge
export const deleteAdditionalChargeController = async (req, res) => {
  const { id } = req.params;
  
  try {
    const [result] = await db.query(
      "DELETE FROM additional_charges_master WHERE charge_id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Additional charge not found" });
    }

    res.status(200).json({ message: 'Additional charge deleted successfully' });
  } catch (error) {
    console.error("Error deleting additional charge:", error);
    res.status(500).json({ error: 'Failed to delete additional charge' });
  }
};

// Update status only (active/inactive)
export const updateAdditionalChargeStatusController = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !['active', 'inactive'].includes(status)) {
    return res.status(400).json({ message: "Valid status (active/inactive) is required" });
  }

  try {
    const [result] = await db.query(
      "UPDATE additional_charges_master SET status = ? WHERE charge_id = ?",
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Additional charge not found" });
    }

    res.status(200).json({ message: `Status updated to ${status} successfully` });
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ message: "Error updating status" });
  }
};

