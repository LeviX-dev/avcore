import db from "../database/db.js";

/* 🔹 PRODUCT TYPES */
export const getProductTypes = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        product_type_id,
        product_type_name
      FROM product_types
      WHERE status = 'active'
      ORDER BY product_type_name
    `);

    res.json({
      success: true,
      data: rows
    });
  } catch (err) {
    console.error("❌ Product Type Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* 🔹 BRANDS BY PRODUCT TYPE */
export const getBrandsByType = async (req, res) => {
  const { productTypeId } = req.params;

  try {
    const [rows] = await db.query(`
      SELECT
        brand_id,
        brand_name
      FROM brands
      WHERE product_type_id = ?
        AND status = 'active'
      ORDER BY brand_name
    `, [productTypeId]);

    res.json({
      success: true,
      data: rows
    });
  } catch (err) {
    console.error("❌ Brand Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* 🔹 MODELS BY BRAND */
// export const getModelsByBrand = async (req, res) => {
//   const { brandId } = req.params;

//   try {
//     const [rows] = await db.query(`
//       SELECT
//         model_id,
//         model_no AS model_name,
//         description
//       FROM models
//       WHERE brand_id = ?
//         AND status = 'active'
//       ORDER BY model_no
//     `, [brandId]);

//     res.json({
//       success: true,
//       data: rows
//     });
//   } catch (err) {
//     console.error("❌ Model Error:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };
export const getAllModelsWithQuantity = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        m.model_id,
        m.model_no AS model_name,
        m.description,
        m.price,
        COALESCE(SUM(s.quentity), 0) AS quentity
      FROM models m
      LEFT JOIN stock s ON s.mid = m.model_id
      WHERE m.status = 'active'
      GROUP BY m.model_id
      ORDER BY m.model_no
    `);

    res.status(200).json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (err) {
    console.error("❌ Model-Stock Join Error:", err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
