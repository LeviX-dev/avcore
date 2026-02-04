import db from '../database/db.js';

export const getSidebarMenus= async (req, res) => {
  try {
    const user = req.session?.user;

    if (!user || !user.role) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const role = user.role;

    const query = `
      SELECT DISTINCT
        m.menu_key,
        m.label,
        m.path,
        m.parent_key,
        m.icon_key,
        m.sort_order
      FROM sidebar_menu m
      WHERE m.is_active = 1
        AND (
          -- 1️⃣ Direct permission (leaf OR standalone like dashboard, call)
          EXISTS (
            SELECT 1
            FROM role_menu_permission p
            WHERE p.role = ?
              AND p.can_view = 1
              AND p.menu_key = m.menu_key
          )
          OR
          -- 2️⃣ Parent menu should appear if ANY child is permitted
          EXISTS (
            SELECT 1
            FROM role_menu_permission c
            WHERE c.role = ?
              AND c.can_view = 1
              AND c.menu_key LIKE CONCAT(m.menu_key, '.%')
          )
        )
      ORDER BY
        -- parents first
        CASE WHEN m.parent_key IS NULL THEN m.sort_order ELSE 999 END,
        -- then children under parents
        m.parent_key,
        m.sort_order
    `;

    const [rows] = await db.query(query, [role, role]);

    return res.json(rows);
  } catch (error) {
    console.error('❌ Sidebar fetch error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load sidebar',
    });
  }
};

export const getRolePermissions = async (req, res) => {
  try {
    const { role } = req.params;

    if (!role) {
      return res.status(400).json({
        success: false,
        message: 'Role is required',
      });
    }

    const query = `
      SELECT r.menu_key
      FROM role_menu_permission r
      INNER JOIN sidebar_menu m
        ON m.menu_key = r.menu_key
      WHERE r.role = ?
        AND r.can_view = 1
        AND m.path IS NOT NULL
    `;

    const [rows] = await db.query(query, [role]);

    // ✅ ONLY leaf permissions returned
    const permissions = rows.map(r => r.menu_key);

    return res.json(permissions);
  } catch (error) {
    console.error('❌ Permission fetch error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch permissions',
    });
  }
};

export const getAllRoles = async (req, res) => {
  try {
    const [rows] = await db.query(`
  SELECT DISTINCT role
FROM users
WHERE role IS NOT NULL
  AND role <> 'admin'
ORDER BY role;

    `);

    res.json(rows.map(r => r.role));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch roles' });
  }
};

export const getRoleMenuPermissions = async (req, res) => {
  try {
    const { role } = req.params;

    const query = `
      SELECT 
        m.menu_key,
        m.label,
        m.path,
        m.parent_key,
        IF(p.can_view = 1, 1, 0) AS checked
      FROM sidebar_menu m
      LEFT JOIN role_menu_permission p
        ON p.menu_key = m.menu_key
        AND p.role = ?
      WHERE m.is_active = 1
        AND m.menu_key != 'master'
        AND m.menu_key NOT LIKE 'master.%'
      ORDER BY 
        CASE 
          WHEN m.parent_key IS NULL THEN m.sort_order
          ELSE (
            SELECT sort_order 
            FROM sidebar_menu p2 
            WHERE p2.menu_key = m.parent_key
          )
        END,
        m.parent_key IS NOT NULL,
        m.sort_order
    `;

    const [rows] = await db.query(query, [role]);
    res.json(rows);
  } catch (err) {
    console.error('❌ Failed to fetch role permissions', err);
    res.status(500).json({ message: 'Failed to fetch permissions' });
  }
};

// export const saveRolePermissions = async (req, res) => {
//   try {
//     const { role, permissions } = req.body;

//     if (!role || !Array.isArray(permissions)) {
//       return res.status(400).json({ message: 'Invalid data' });
//     }

//     /**
//      * 1️⃣ Disable ONLY LEAF menus (menus that have path)
//      */
//     await db.query(
//       `
//       UPDATE role_menu_permission r
//       INNER JOIN sidebar_menu m
//         ON m.menu_key = r.menu_key
//       SET r.can_view = 0
//       WHERE r.role = ?
//         AND m.path IS NOT NULL
//       `,
//       [role]
//     );

//     /**
//      * 2️⃣ Enable selected leaf menus
//      */
//     if (permissions.length > 0) {
//       await db.query(
//         `
//         UPDATE role_menu_permission r
//         SET r.can_view = 1
//         WHERE r.role = ?
//           AND r.menu_key IN (?)
//         `,
//         [role, permissions]
//       );
//     }

//     res.json({
//       success: true,
//       message: 'Permissions updated successfully',
//     });
//   } catch (err) {
//     console.error('❌ Permission save error:', err);
//     res.status(500).json({ message: 'Failed to save permissions' });
//   }
// };


export const saveRolePermissions = async (req, res) => {
  try {
    const { role, permissions } = req.body;

    if (!role || !Array.isArray(permissions)) {
      return res.status(400).json({ message: 'Invalid data' });
    }

    // 1️⃣ Turn OFF all leaf menus for this role
    await db.query(`
      UPDATE role_menu_permission r
      INNER JOIN sidebar_menu m ON m.menu_key = r.menu_key
      SET r.can_view = 0
      WHERE r.role = ?
        AND m.path IS NOT NULL
    `, [role]);

    // 2️⃣ Insert missing rows for selected permissions
    if (permissions.length) {
      await db.query(`
        INSERT INTO role_menu_permission (role, menu_key, can_view, created_at)
        SELECT ?, m.menu_key, 1, NOW()
        FROM sidebar_menu m
        WHERE m.menu_key IN (?)
        ON DUPLICATE KEY UPDATE can_view = 1
      `, [role, permissions]);
    }

    res.json({
      success: true,
      message: 'Permissions updated successfully'
    });

  } catch (err) {
    console.error('❌ Permission save error:', err);
    res.status(500).json({ message: 'Failed to save permissions' });
  }
};

