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



export const addProductFull = async (req, res) => {
  try {
    console.log("RAW BODY ===>", req.body);
    console.log("FILES ===>", req.files);

    const { product_type_name, quotation_type, other_quotation_type } = req.body;

    if (!product_type_name) {
      return res.status(400).json({ error: "product_type_name is required" });
    }

    if (!quotation_type) {
      return res.status(400).json({ error: "quotation_type is required" });
    }

    // if dropdown = Other → store textbox value instead
    const finalQuotationType =
      quotation_type === "Other" && other_quotation_type
        ? other_quotation_type
        : quotation_type;

    if (!req.body.brands) {
      return res.status(400).json({ error: "brands is required" });
    }

    let brands;
    try {
      brands = JSON.parse(req.body.brands);
    } catch (e) {
      return res.status(400).json({ error: "brands must be valid JSON" });
    }

    if (!Array.isArray(brands) || brands.length === 0) {
      return res.status(400).json({ error: "brands must be a non-empty array" });
    }

    // -----------------------------
    // CREATE PRODUCT TYPE  (UPDATED)
    // -----------------------------
    const [pt] = await db.execute(
      `INSERT INTO product_types (product_type_name, quotation_type) 
       VALUES (?, ?)`,
      [product_type_name, finalQuotationType]
    );

    const product_type_id = pt.insertId;

    // -----------------------------
    // LOOP BRANDS (unchanged)
    // -----------------------------
    for (const brand of brands) {
      if (!brand.brand_name) continue;

      const [br] = await db.execute(
        `INSERT INTO brands (brand_name, product_type_id) VALUES (?, ?)`,
        [brand.brand_name, product_type_id]
      );

      const brand_id = br.insertId;

      // -----------------------------
      // LOOP MODELS (unchanged)
      // -----------------------------
      for (const model of brand.models || []) {
        let savedImagePaths = [];

        if (req.files && req.files["model_images[]"]) {
          let images = req.files["model_images[]"];
          if (!Array.isArray(images)) images = [images];

          for (const img of images) {
            const fileName = `${Date.now()}_${img.name}`;
            const uploadDir = path.join(__dirname, "../uploads");

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
            model.model_no || "",
            model.description || "",
            model.price || null,
            savedImagePaths[0] || null
          ]
        );
      }
    }

    return res.status(201).json({
      success: true,
      message: "Product type + brands + models created successfully",
    });

  } catch (err) {
    console.error("❌ addProductFull Error:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};





// Update product controller

export const updateProductFull = async (req, res) => {
  const { product_type_id } = req.params;

  try {
    const { product_type_name, quotation_type, other_quotation_type } = req.body;

    if (!product_type_name) {
      return res.status(400).json({ error: "product_type_name is required" });
    }

    if (!quotation_type) {
      return res.status(400).json({ error: "quotation_type is required" });
    }

    const finalQuotationType =
      quotation_type === "Other" && other_quotation_type
        ? other_quotation_type
        : quotation_type;

    if (!req.body.brands) {
      return res.status(400).json({ error: "brands is required" });
    }

    let brands;

    try {
      brands = JSON.parse(req.body.brands);
    } catch (e) {
      return res.status(400).json({ error: "brands must be valid JSON" });
    }

    if (!Array.isArray(brands) || brands.length === 0) {
      return res.status(400).json({ error: "brands must be a non-empty array" });
    }

    // --------------------------------
    // UPDATE PRODUCT TYPE
    // --------------------------------
    await db.execute(
      `UPDATE product_types 
       SET product_type_name = ?, quotation_type = ?
       WHERE product_type_id = ?`,
      [product_type_name, finalQuotationType, product_type_id]
    );

    // --------------------------------
    // DELETE OLD BRANDS + MODELS
    // --------------------------------
    await db.execute(
      `DELETE m FROM models m 
       INNER JOIN brands b ON m.brand_id = b.brand_id
       WHERE b.product_type_id = ?`,
      [product_type_id]
    );

    await db.execute(
      `DELETE FROM brands WHERE product_type_id = ?`,
      [product_type_id]
    );

    // --------------------------------
    // RE-CREATE BRANDS + MODELS
    // --------------------------------
    for (const brand of brands) {
      if (!brand.brand_name) continue;

      const [br] = await db.execute(
        `INSERT INTO brands (brand_name, product_type_id)
         VALUES (?, ?)`,
        [brand.brand_name, product_type_id]
      );

      const brand_id = br.insertId;

      for (const model of brand.models || []) {
        let savedImagePaths = [];

        if (req.files && req.files["model_images[]"]) {
          let images = req.files["model_images[]"];
          if (!Array.isArray(images)) images = [images];

          for (const img of images) {
            const fileName = `${Date.now()}_${img.name}`;
            const uploadDir = path.join(__dirname, "../uploads");

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
            model.model_no || "",
            model.description || "",
            model.price || null,
            savedImagePaths[0] || null
          ]
        );
      }
    }

    return res.status(200).json({
      success: true,
      message: "Product updated successfully"
    });

  } catch (err) {
    console.error("❌ updateProductFull Error:", err);
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
};


    
export const deleteProductEntity = async (req, res) => {
  try {
    const { entity, id } = req.params;
    const safeId = Number(id);

    if (!entity || isNaN(safeId)) {
      return res.status(400).json({ success: false, error: "Invalid request" });
    }

    console.log("🟡 Delete requested →", entity, "ID:", safeId);

    // =========================
    // 🔵 DELETE MODEL
    // =========================
    if (entity === "model") {
      const [rows] = await db.execute(
        "SELECT image_path, model_no FROM models WHERE model_id = ?",
        [safeId]
      );

      if (!rows.length)
        return res.status(404).json({ success: false, error: "Model not found" });

      const model = rows[0];

      // delete image if exists
      if (model.image_path) {
        const filePath = path.join(process.cwd(), model.image_path);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }

      await db.execute("DELETE FROM models WHERE model_id = ?", [safeId]);

      return res.json({
        success: true,
        message: "Model deleted successfully",
        deleted: { type: "model", id: safeId, model_no: model.model_no },
      });
    }

    // =========================
    // 🟢 DELETE BRAND (models cascade)
    // =========================
    if (entity === "brand") {
      // get all model images for cleanup
      const [models] = await db.execute(
        "SELECT image_path FROM models WHERE brand_id = ?",
        [safeId]
      );

      for (const m of models) {
        if (m?.image_path) {
          const filePath = path.join(process.cwd(), m.image_path);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
      }

      await db.execute("DELETE FROM brands WHERE brand_id = ?", [safeId]);

      return res.json({
        success: true,
        message: "Brand (and its models) deleted successfully",
        deleted: { type: "brand", id: safeId },
      });
    }

    // =========================
    // 🟣 DELETE PRODUCT TYPE (brands + models cascade)
    // =========================
    if (entity === "product-type") {
      // gather all model images first
      const [models] = await db.execute(
        `SELECT m.image_path 
         FROM models m 
         INNER JOIN brands b ON m.brand_id = b.brand_id
         WHERE b.product_type_id = ?`,
        [safeId]
      );

      for (const m of models) {
        if (m?.image_path) {
          const filePath = path.join(process.cwd(), m.image_path);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
      }

      await db.execute(
        "DELETE FROM product_types WHERE product_type_id = ?",
        [safeId]
      );

      return res.json({
        success: true,
        message: "Product type deleted successfully (brands + models removed)",
        deleted: { type: "product-type", id: safeId },
      });
    }

    return res.status(400).json({ success: false, error: "Invalid entity type" });
  } catch (err) {
    console.error("❌ Delete Error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};




// Fetch products with category names




export const getProductsFull = async (req, res) => {
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

    const productTypeIds = productTypes.map(pt => pt.product_type_id);

    // Fetch brands under these product types
    const [brands] = await db.execute(
      `
      SELECT 
        b.brand_id,
        b.brand_name,
        b.product_type_id
      FROM brands b
      WHERE b.product_type_id IN (${productTypeIds.map(() => "?").join(",")})
      `,
      productTypeIds
    );

    const brandIds = brands.map(b => b.brand_id);

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
        WHERE m.brand_id IN (${brandIds.map(() => "?").join(",")})
        `,
        brandIds
      );

      models = rows;
    }

    // -------------------------
    // BUILD NESTED JSON
    // -------------------------
    const result = productTypes.map(pt => ({
      product_type_id: pt.product_type_id,
      product_type_name: pt.product_type_name,
      quotation_type: pt.quotation_type,
      brands: brands
        .filter(b => b.product_type_id === pt.product_type_id)
        .map(b => ({
          brand_id: b.brand_id,
          brand_name: b.brand_name,
          models: models.filter(m => m.brand_id === b.brand_id)
        }))
    }));

    return res.status(200).json(result);

  } catch (err) {
    console.error("❌ getProductsFull Error:", err);
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
};



// Step 1: Create product type only (without brands/models)
export const addProductTypeOnly = async (req, res) => {
  try {
    const { product_type_name, quotation_type, other_quotation_type } = req.body;

    if (!product_type_name) {
      return res.status(400).json({ error: "product_type_name is required" });
    }

    if (!quotation_type) {
      return res.status(400).json({ error: "quotation_type is required" });
    }

    const finalQuotationType =
      quotation_type === "Other" && other_quotation_type
        ? other_quotation_type
        : quotation_type;

    // Create product type
    const [pt] = await db.execute(
      `INSERT INTO product_types (product_type_name, quotation_type) 
       VALUES (?, ?)`,
      [product_type_name, finalQuotationType]
    );

    return res.status(201).json({
      success: true,
      message: "Product type created successfully",
      product_type_id: pt.insertId,
      product_type_name,
      quotation_type: finalQuotationType
    });

  } catch (err) {
    console.error("❌ addProductTypeOnly Error:", err);
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
      return res.status(400).json({ error: "brand_name is required" });
    }

    // Check if product type exists
    const [productType] = await db.execute(
      `SELECT * FROM product_types WHERE product_type_id = ?`,
      [product_type_id]
    );

    if (productType.length === 0) {
      return res.status(404).json({ error: "Product type not found" });
    }

    // Add brand
    const [br] = await db.execute(
      `INSERT INTO brands (brand_name, product_type_id) VALUES (?, ?)`,
      [brand_name, product_type_id]
    );

    return res.status(201).json({
      success: true,
      message: "Brand added successfully",
      brand_id: br.insertId,
      brand_name
    });

  } catch (err) {
    console.error("❌ addBrandToProduct Error:", err);
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
      return res.status(400).json({ error: "model_no is required" });
    }

    if (!price) {
      return res.status(400).json({ error: "price is required" });
    }

    // Check if brand exists
    const [brand] = await db.execute(
      `SELECT * FROM brands WHERE brand_id = ?`,
      [brand_id]
    );

    if (brand.length === 0) {
      return res.status(404).json({ error: "Brand not found" });
    }

    let savedImagePath = null;

    // Handle image upload
    if (req.files && req.files.model_image) {
      const image = req.files.model_image;
      const fileName = `${Date.now()}_${image.name}`;
      const uploadDir = path.join(__dirname, "../uploads");

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
        description || "",
        price,
        savedImagePath
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Model added successfully",
      model_id: model.insertId,
      model_no,
      price,
      image_path: savedImagePath
    });

  } catch (err) {
    console.error("❌ addModelToBrand Error:", err);
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
      [product_type_id]
    );

    if (productTypes.length === 0) {
      return res.status(404).json({ error: "Product type not found" });
    }

    const productType = productTypes[0];

    // Get brands for this product type
    const [brands] = await db.execute(
      `SELECT * FROM brands WHERE product_type_id = ?`,
      [product_type_id]
    );

    const brandIds = brands.map(b => b.brand_id);

    // Get models for these brands
    let models = [];
    if (brandIds.length > 0) {
      const [rows] = await db.execute(
        `SELECT * FROM models WHERE brand_id IN (${brandIds.map(() => "?").join(",")})`,
        brandIds
      );
      models = rows;
    }

    // Build nested structure
    const result = {
      ...productType,
      brands: brands.map(brand => ({
        ...brand,
        models: models.filter(model => model.brand_id === brand.brand_id)
      }))
    };

    return res.status(200).json(result);

  } catch (err) {
    console.error("❌ getProductTypeDetails Error:", err);
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
      return res.status(400).json({ error: "brand_name is required" });
    }

    // Update brand
    await db.execute(
      `UPDATE brands SET brand_name = ? WHERE brand_id = ?`,
      [brand_name, brand_id]
    );

    return res.status(200).json({
      success: true,
      message: "Brand updated successfully"
    });

  } catch (err) {
    console.error("❌ updateBrand Error:", err);
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


//add area with city

// export const addCityController = async (req, res) => {
//   try {

//     if (!req.session.user) {
//       return res.status(401).json({ message: "Unauthorized. Please log in." });
//     }

//     const { city_name, area_id } = req.body;
//     const created_by_user = req.session.user.id;

//     // Validation
//     if (!city_name || !area_id) {
//       return res.status(400).json({ message: "City name and Area ID required!" });
//     }

//     // Check duplicate city inside same area
//     const [cityExists] = await db.query(
//       "SELECT city_id FROM city WHERE city_name = ? AND area_id = ?",
//       [city_name, area_id]
//     );

//     if (cityExists.length > 0) {
//       return res.status(409).json({
//         message: "City already exists for this Area",
//         duplicate: {
//           city_name,
//           area_id
//         }
//       });
//     }

//     // Insert Query
//     const insertQuery = `
//       INSERT INTO city (city_name, area_id, created_at)
//       VALUES (?, ?, NOW())
//     `;

//     const values = [
//       city_name,
//       area_id,
//       created_by_user
//     ];

//     const [result] = await db.query(insertQuery, values);

//     return res.status(201).json({
//       message: "City added successfully",
//       city_id: result.insertId
//     });

//   } catch (error) {
//     console.error("❌ Error inserting city:", error);
//     return res.status(500).json({ message: "Server error while adding city." });
//   }
// };
