import db from '../database/db.js';


// =================================================
// CHECK IN
// =================================================
export const checkIn = async (req, res) => {
  try {
    if (!req.session?.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user_id = req.session.user.user_id || req.session.user.id;

    if (!user_id) {
      return res.status(400).json({ message: 'User id missing in session' });
    }

    // ------------------------------------------------
    // GET NAME STRICTLY FROM users TABLE
    // ------------------------------------------------
    let name = req.session.user.name;

    if (!name) {
      const [u] = await db.execute(
        `SELECT name, role FROM users WHERE user_id = ? LIMIT 1`,
        [user_id]
      );

      if (!u.length) {
        return res.status(400).json({ message: 'User not found' });
      }

      name = u[0].name;
      req.session.user.name = name; // cache in session
      req.session.user.role = u[0].role;
    }

    const role = req.session.user.role || '';

    // ------------------------------------------------
    // Prevent double check-in
    // ------------------------------------------------
    const [existing] = await db.execute(
      `SELECT attendance_id
       FROM attendance
       WHERE user_id = ?
       AND attendance_date = CURDATE()`,
      [user_id]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Already checked in today'
      });
    }

    // ------------------------------------------------
    // Insert attendance
    // ------------------------------------------------
    await db.execute(
      `INSERT INTO attendance
       (user_id, user_name, role, attendance_date, check_in_datetime)
       VALUES (?, ?, ?, CURDATE(), NOW())`,
      [user_id, name, role]
    );

    return res.json({
      success: true,
      message: 'Check-in successful'
    });

  } catch (err) {
    console.error('CHECK IN ERROR:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};



// =================================================
// CHECK OUT
// =================================================
export const checkOut = async (req, res) => {
  try {
    if (!req.session?.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user_id = req.session.user.user_id || req.session.user.id;

    if (!user_id) {
      return res.status(400).json({ message: 'User id missing in session' });
    }

    const [result] = await db.execute(
      `UPDATE attendance
       SET check_out_datetime = NOW()
       WHERE user_id = ?
       AND attendance_date = CURDATE()
       AND check_out_datetime IS NULL`,
      [user_id]
    );

    if (!result.affectedRows) {
      return res.status(400).json({
        success: false,
        message: 'No active check-in found'
      });
    }

    return res.json({
      success: true,
      message: 'Check-out successful'
    });

  } catch (err) {
    console.error('CHECK OUT ERROR:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};



// =================================================
// AUTO CHECKOUT (8PM)
// =================================================
export const autoCheckoutAt8PM = async (req, res) => {
  try {
    const [result] = await db.execute(
      `UPDATE attendance
       SET check_out_datetime = CONCAT(CURDATE(),' 20:00:00'),
           auto_checkout = 1
       WHERE attendance_date = CURDATE()
       AND check_out_datetime IS NULL`
    );

    return res.json({
      success: true,
      auto_checked_out: result.affectedRows
    });

  } catch (err) {
    console.error('AUTO CHECKOUT ERROR:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};



// =================================================
// GET TODAY STATUS
// =================================================
export const getTodayStatus1 = async (req, res) => {
  try {
    if (!req.session?.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user_id = req.session.user.user_id || req.session.user.id;

    if (!user_id) {
      return res.status(400).json({ message: 'User id missing in session' });
    }

    const [rows] = await db.execute(
      `SELECT check_in_datetime, check_out_datetime
       FROM attendance
       WHERE user_id = ?
       AND attendance_date = CURDATE()
       LIMIT 1`,
      [user_id]
    );

    if (!rows.length) {
      return res.json({ checkedIn: false });
    }

    if (rows[0].check_in_datetime && !rows[0].check_out_datetime) {
      return res.json({ checkedIn: true });
    }

    return res.json({ checkedIn: false });

  } catch (err) {
    console.error('STATUS ERROR:', err);
    res.status(500).json({ message: err.message });
  }
};


export const getTodayStatus2 = async (req, res) => {
  try {
    const userId = req.session.user.id;

    const [rows] = await db.query(`
      SELECT * FROM attendance
      WHERE user_id = ?
      AND DATE(check_in_time) = CURDATE()
      LIMIT 1
    `, [userId]);

    if (rows.length > 0) {
      return res.json({ checkedIn: true });
    } else {
      return res.json({ checkedIn: false });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching status" });
  }
}; 



export const getTodayStatus3 = async (req, res) => {
  try {
    const userId = req.session.user.user_id || req.session.user.id;

    const [rows] = await db.query(`
      SELECT * FROM attendance
      WHERE user_id = ?
      AND attendance_date = CURDATE()
      LIMIT 1
    `, [userId]);

    if (rows.length > 0) {
      return res.json({ checkedIn: true });
    } else {
      return res.json({ checkedIn: false });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching status" });
  }
};


export const getTodayStatus4 = async (req, res) => {
  try {
    // ✅ ADD THIS CHECK (MUST)
    if (!req.session?.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.session.user.user_id || req.session.user.id;

    if (!userId) {
      return res.status(400).json({ message: "User ID missing" });
    }

    const [rows] = await db.query(`
      SELECT * FROM attendance
      WHERE user_id = ?
      AND attendance_date = CURDATE()
      LIMIT 1
    `, [userId]);

    if (rows.length > 0) {
      return res.json({ checkedIn: true });
    } else {
      return res.json({ checkedIn: false });
    }

  } catch (err) {
    console.error("STATUS ERROR:", err);
    res.status(500).json({ message: "Error fetching status" });
  }
};

export const getTodayStatus = async (req, res) => {
  try {
    // ✅ ADD THIS (IMPORTANT)
    if (!req.session?.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userId = req.session.user.user_id || req.session.user.id;

    if (!userId) {
      return res.status(400).json({ message: 'User id missing' });
    }

    const [rows] = await db.query(`
      SELECT * FROM attendance
      WHERE user_id = ?
      AND attendance_date = CURDATE()
      LIMIT 1
    `, [userId]);

    return res.json({
      checkedIn: rows.length > 0
    });

  } catch (err) {
    console.error("❌ getTodayStatus ERROR:", err);
    res.status(500).json({ message: "Error fetching status" });
  }
};


const TELECALLER_ROLES = [
  'tele_caller',
  'digital_marketing',
  'field_marketing_executive',
  'tech_sale_sound_engineer',
  'junior_autocad_designer',
  'senior_autocad_designer',
    'av_engineer',
  'acoustic_engineer',
  'acoustic_designer',
  'hr_executive',
  
];

const ADMIN_ROLES = ['admin', 'sub_admin'];
const MANAGEMENT_ROLES = ['technical_head'];

// helpers
const isTelecallerLike = role => TELECALLER_ROLES.includes(role);
const isAdminLike = role => ADMIN_ROLES.includes(role);
const isManagementLike = role => MANAGEMENT_ROLES.includes(role);

// =================================================
// GET ATTENDANCE REPORT
// =================================================
// export const getAttendanceReport = async (req, res) => {
//   try {
//     if (!req.session?.user) {
//       return res.status(401).json({ message: 'Unauthorized' });
//     }

//     const { from, to } = req.query;

//     const userId = req.session.user.user_id || req.session.user.id;
//     const role = req.session.user.role;

//     // ------------------------------------------------
//     // get current user name (same pattern as leads)
//     // ------------------------------------------------
//     const [userResult] = await db.execute(
//       `SELECT name FROM users WHERE user_id = ? LIMIT 1`,
//       [userId]
//     );

//     const currentUserName = userResult[0]?.name || '';

//     let sql = `
//       SELECT 
//         attendance_id,
//         user_id,
//         user_name,
//         role,
//         attendance_date,
//         check_in_datetime,
//         check_out_datetime,
//         auto_checkout
//       FROM attendance
//       WHERE 1=1
//     `;

//     const params = [];

//     // ------------------------------------------------
//     // DATE FILTER
//     // ------------------------------------------------
//     if (from && to) {
//       sql += ` AND attendance_date BETWEEN ? AND ?`;
//       params.push(from, to);
//     }

//     // ------------------------------------------------
//     // ROLE BASED FILTER (MAIN LOGIC)
//     // ------------------------------------------------
//     if (isTelecallerLike(role)) {
//       // only his own attendance
//       sql += ` AND user_id = ?`;
//       params.push(userId);
//     } 
//     else if (isAdminLike(role) || isManagementLike(role)) {
//       // admin / sub_admin / technical_head -> see ALL
//       // no extra condition
//     } 
//     else {
//       // fallback = self only
//       sql += ` AND user_id = ?`;
//       params.push(userId);
//     }

//     sql += ` ORDER BY attendance_date DESC, check_in_datetime DESC`;

//     const [rows] = await db.execute(sql, params);

//     res.json(rows);

//   } catch (err) {
//     console.error('ATTENDANCE REPORT ERROR:', err);
//     res.status(500).json({ message: err.message });
//   }
// };

export const getAttendanceReport = async (req, res) => {
  try {
    if (!req.session?.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { from, to, mode, employee, export: isExport } = req.query; // Added export parameter

    const userId = req.session.user.user_id || req.session.user.id;
    const role = req.session.user.role;

    const params = [];

    // =============================
    // MODE 1 → NORMAL ATTENDANCE
    // =============================
    if (mode !== 'presence') {
      let sql = `
        SELECT 
          attendance_id,
          user_id,
          user_name,
          role,
          attendance_date,
          check_in_datetime,
          check_out_datetime,
          auto_checkout,
          'Present' AS status
        FROM attendance
        WHERE 1=1
      `;

      // If export is requested, only show Amol Sir's data
      if (isExport === 'true') {
        sql += ` AND user_name = ?`;
        params.push('Amol Sir');
      } else {
        // Original filtering logic
        if (from && to) {
          sql += ` AND attendance_date BETWEEN ? AND ?`;
          params.push(from, to);
        }

        if (employee && employee !== 'all') {
          sql += ` AND user_id = ?`;
          params.push(employee);
        }

        if (isTelecallerLike(role)) {
          sql += ` AND user_id = ?`;
          params.push(userId);
        }
      }

      sql += ` ORDER BY attendance_date DESC, check_in_datetime DESC`;

      const [rows] = await db.execute(sql, params);
      return res.json(rows);
    }

    // =============================
    // MODE 2 → PRESENT / ABSENT
    // =============================
    const dateFrom = from || new Date().toISOString().split('T')[0];
    const dateTo = to || dateFrom;

    let sql = `
      SELECT 
        u.user_id,
        u.name AS user_name,
        u.role,
        a.attendance_id,
        a.attendance_date,
        a.check_in_datetime,
        a.check_out_datetime,
        a.auto_checkout,
        CASE 
          WHEN a.attendance_id IS NULL THEN 'Absent'
          ELSE 'Present'
        END AS status
      FROM users u
      LEFT JOIN attendance a 
        ON u.user_id = a.user_id
        AND a.attendance_date BETWEEN ? AND ?
      WHERE 1=1
    `;

    params.push(dateFrom, dateTo);

    // If export is requested, only show Amol Sir's data
    if (isExport === 'true') {
      sql += ` AND u.name = ?`;
      params.push('Amol Sir');
    } else {
      // Original filtering logic
      if (employee && employee !== 'all') {
        sql += ` AND u.user_id = ?`;
        params.push(employee);
      }

      if (isTelecallerLike(role)) {
        sql += ` AND u.user_id = ?`;
        params.push(userId);
      }
    }

    sql += ` ORDER BY u.name`;

    const [rows] = await db.execute(sql, params);
    res.json(rows);

  } catch (err) {
    console.error('ATTENDANCE REPORT ERROR:', err);
    res.status(500).json({ message: err.message });
  }
};

