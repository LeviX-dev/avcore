import db from '../database/db.js';

export const getAllModelsWithBrand = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const [rows] = await connection.query(`
      SELECT
        m.model_id,
        m.model_no,
        m.image_path,
        m.description,
        m.price,
        m.status AS model_status,
        m.created_at,

        b.brand_id,
        b.brand_name,
        b.product_type_id
      FROM models m
      JOIN brands b ON m.brand_id = b.brand_id
      WHERE m.status = 'active'
        AND b.status = 'active'
      ORDER BY m.created_at DESC
    `);

    res.status(200).json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error('❌ Fetch Models + Brand Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    connection.release();
  }
};



// export const syncStockByProduct = async (req, res) => {
//   try {
//     const sql = `
//       INSERT INTO stock (pid, catid, bid, mid, mname, quentity)
//       SELECT
//           p.product_id,
//           p.cat_id,
//           IFNULL(b.brand_id, 0),
//           IFNULL(m.model_id, 0),
//           IFNULL(m.model_no, 0),
//           0
//       FROM product p
//       LEFT JOIN brands b 
//           ON b.product_type_id = p.product_id
//       LEFT JOIN models m 
//           ON m.brand_id = b.brand_id
//       WHERE NOT EXISTS (
//           SELECT 1 FROM stock s WHERE s.pid = p.product_id
//       )
//     `;

//     const [result] = await db.query(sql);

//     res.json({
//       success: true,
//       insertedRows: result.affectedRows
//     });

//   } catch (err) {
//     console.error("❌ Stock insert error:", err);
//     res.status(500).json({ error: err.message });
//   }
// };

export const syncStockByProduct = async (req, res) => {
  try {
    const sql = `
      INSERT INTO stock (mid, mname, bid, pid, catid, quentity)
      SELECT
          m.model_id,
          m.model_no,
          b.brand_id,
          pt.product_type_id,
          pt.cat_id,
          0
      FROM models m
      JOIN brands b 
          ON b.brand_id = m.brand_id
      JOIN product_types pt
          ON pt.product_type_id = b.product_type_id
      WHERE NOT EXISTS (
          SELECT 1 FROM stock s WHERE s.mid = m.model_id
      )
    `;

    const [result] = await db.query(sql);

    res.json({
      success: true,
      insertedModels: result.affectedRows
    });

  } catch (err) {
    console.error("❌ Stock sync failed:", err);
    res.status(500).json({ error: err.message });
  }
};




// export const getStockList = async (req, res) => {
//   const connection = await db.getConnection();

//   try {
//     const [rows] = await connection.query(`
//       SELECT
//         s.sid,
//         s.quentity,

//         -- MODEL
//         m.model_id,
//         m.model_no,
//         m.price,
//         m.status AS model_status,
//         m.created_at,

//         -- BRAND
//         b.brand_id,
//         b.brand_name,

//         -- PRODUCT TYPE
//         pt.product_type_id,
//         pt.product_type_name,

//         -- CATEGORY
//         c.cat_id,
//         c.cat_name
//       FROM stock s
//       JOIN models m 
//         ON m.model_id = s.mid
//       JOIN brands b 
//         ON b.brand_id = s.bid
//       JOIN product_types pt
//         ON pt.product_type_id = s.pid
//       JOIN category c
//         ON c.cat_id = s.catid
//       ORDER BY 
//         pt.product_type_name,
//         b.brand_name,
//         m.model_no
//     `);

//     res.json({
//       success: true,
//       count: rows.length,
//       data: rows
//     });

//   } catch (err) {
//     console.error("❌ Fetch Stock Error:", err);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch stock list"
//     });
//   } finally {
//     connection.release();
//   }
// };

export const getStockList = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const [rows] = await connection.query(`
      SELECT
        s.sid,
        s.quentity,

        -- ✅ MODEL
        m.model_id,
        m.model_no AS model_name,
        m.description AS model_description,

        -- ✅ BRAND
        b.brand_name,

        -- ✅ PRODUCT TYPE
        pt.product_type_name

      FROM stock s
      JOIN models m ON m.model_id = s.mid
      JOIN brands b ON b.brand_id = s.bid
      JOIN product_types pt ON pt.product_type_id = s.pid

      ORDER BY 
        pt.product_type_name,
        b.brand_name,
        m.model_no
    `);

    res.json({
      success: true,
      count: rows.length,
      data: rows
    });

  } catch (err) {
    console.error('❌ Fetch Stock Error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stock list'
    });
  } finally {
    connection.release();
  }
};



export const updateStockQuantity = async (req, res) => {
  const { sid, quentity } = req.body;

  if (sid === undefined || quentity === undefined) {
    return res.status(400).json({
      success: false,
      message: 'sid and quentity are required'
    });
  }

  try {
    const sql = `
      UPDATE stock
      SET quentity = ?
      WHERE sid = ?
    `;

    const [result] = await db.query(sql, [quentity, sid]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Stock record not found'
      });
    }

    res.json({
      success: true,
      message: 'Quantity updated successfully'
    });

  } catch (err) {
    console.error('❌ Quantity Update Error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update quantity'
    });
  }
};







