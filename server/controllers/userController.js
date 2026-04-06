import {
  addUser,
  getUsers as getAllUsers,
  deleteUser,
  editUser
} from '../models/userModel.js';
import db from '../database/db.js';
import bcrypt from 'bcrypt';
import nodemailer from "nodemailer";



/* ================= ROLE CONFIG ================= */

const ALLOWED_ROLES = [
  'admin',
  'sub_admin',
  'project_manager',   // ✅ ADD THIS
  'digital_marketing',
  'tele_caller',
  'field_marketing_executive',
  'junior_autocad_designer',
  'senior_autocad_designer',
  'tech_sale_sound_engineer',
  'technical_head',
    'av_engineer',
  'acoustic_engineer',
  'acoustic_designer',
  'hr_executive',
  
];


const ROLE_LABELS = {
  admin: 'Director (Super Admin)',
  sub_admin: 'Business Head (Sub Admin)',
  project_manager: 'Project Manager',   // ✅ ADD THIS
  digital_marketing: 'Digital Marketing',
  tele_caller: 'tele_caller',
  field_marketing_executive: 'Field Marketing Executive',
  junior_autocad_designer: 'Junior AutoCAD Designer',
  senior_autocad_designer: 'Senior AutoCAD Designer',
  tech_sale_sound_engineer: 'Tech-sale Sound Engineer',
  technical_head: 'Technical Head',
};


/* ================= CREATE USER ================= */

export const createUser = async (req, res) => {
  const { name, contact, email, address, role, status, username, password } = req.body;

  try {
    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await addUser([
      name,
      contact,
      email,
      address,
      role, // ✅ admin / sub_admin stored
      status,
      username,
      hashedPassword,
    ]);

    res.status(201).json({
      message: 'User added successfully!',
      user_id: result.insertId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

/* ================= GET USERS ================= */

export const getUsers = async (req, res) => {
  try {
    const users = await getAllUsers();

    const formattedUsers = users.map(user => ({
      ...user,
      role_label: ROLE_LABELS[user.role] || user.role, // ✅ UI friendly
    }));

    res.status(200).json(formattedUsers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};



// Role hierarchy configuration (defined directly in the controller)
const ROLE_HIERARCHY = {
  admin: {
    canSee: ['admin', 'sub_admin', 'digital_marketing', 'tele_caller', 'field_marketing_executive', 
             'junior_autocad_designer', 'senior_autocad_designer', 'tech_sale_sound_engineer', 
             'technical_head', 'project_manager'],
    description: 'Director (Super Admin)'
  },
  sub_admin: {
    canSee: ['admin', 'sub_admin', 'digital_marketing', 'tele_caller', 'field_marketing_executive', 
             'junior_autocad_designer', 'senior_autocad_designer', 'tech_sale_sound_engineer', 
             'technical_head', 'project_manager'],
    description: 'Business Head (Sub Admin)'
  },
  tele_caller: {
    canSee: ['tele_caller', 'field_marketing_executive', 'admin', 'sub_admin'],
    description: 'Tele Caller'
  },
  digital_marketing: {
    canSee: ['tele_caller' , 'digital_marketing' ,'admin', 'sub_admin' ],
    description: 'Digital Marketing'
  },
  
  field_marketing_executive: {
    canSee: ['junior_autocad_designer' ,'field_marketing_executive', 'admin', 'sub_admin' ],
    description: 'Field Marketing Executive'
  },
  junior_autocad_designer: {
    canSee: ['tech_sale_sound_engineer', 'technical_head' , 'junior_autocad_designer' , 'admin', 'sub_admin'],
    description: 'Junior AutoCAD Designer'
  },
  senior_autocad_designer: {
    canSee: ['project_manager' , 'senior_autocad_designer', 'admin', 'sub_admin' ],
    description: 'Senior AutoCAD Designer'
  },
  tech_sale_sound_engineer: {
    canSee: ['technical_head', 'junior_autocad_designer' , 'tech_sale_sound_engineer' , 'admin', 'sub_admin' ],
    description: 'Tech-sale Sound Engineer'
  },
  technical_head: {
    canSee: ['admin', 'sub_admin', 'digital_marketing', 'tele_caller', 'field_marketing_executive', 
             'junior_autocad_designer', 'senior_autocad_designer', 'tech_sale_sound_engineer', 
             'technical_head', 'project_manager' ,'technical_head'],
    description: 'Technical Head'
  },
  project_manager: {
    canSee: [], // Project Manager can't see anyone
    description: 'Project Manager'
  }
};




// New role-based endpoint
export const getUsersByRole = async (req, res) => {
  try {
    // Get the logged-in user's role from session
    // Adjust this based on how you store user in session
    const currentUserRole = req.session?.user?.role || req.session?.role || req.user?.role;
    
    if (!currentUserRole) {
      return res.status(401).json({ 
        error: 'User not authenticated',
        users: [],
        currentUserRole: null 
      });
    }

    // Fetch all users from database
    const allUsers = await getAllUsers();

    // Get the roles that current user can see based on hierarchy
    const userPermissions = ROLE_HIERARCHY[currentUserRole];
    const allowedRoles = userPermissions?.canSee || [];
    
    console.log('Current User Role:', currentUserRole);
    console.log('Allowed Roles to see:', allowedRoles);

    // Filter users based on allowed roles
    let filteredUsers = [];
    
    if (allowedRoles.length > 0) {
      filteredUsers = allUsers.filter(user => allowedRoles.includes(user.role));
    } else {
      // If allowedRoles is empty, return empty array (user can't see anyone)
      filteredUsers = [];
      // If you want empty array to mean "see all users", use:
      // filteredUsers = allUsers;
    }

    // Format users for frontend with role labels
    const formattedUsers = filteredUsers.map(user => ({
      user_id: user.user_id,
      name: user.name,
      role: user.role,
      role_label: ROLE_LABELS[user.role] || user.role,
      email: user.email,
      // Include any other user fields you need
    }));

    // Return comprehensive response
    res.status(200).json({
      success: true,
      users: formattedUsers,
      currentUserRole: currentUserRole,
      allowedRoles: allowedRoles,
      totalUsers: formattedUsers.length,
      permissions: userPermissions ? {
        canSee: userPermissions.canSee,
        description: userPermissions.description
      } : null
    });

  } catch (error) {
    console.error('Error in getUsersByRole:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch users',
      users: [] 
    });
  }
};




/* ================= UPDATE USER ================= */

// export const updateUser = async (req, res) => {
//   const { user_id } = req.params;
//   const { name, contact, address, email, role, status } = req.body;

//   try {
//     if (role && !ALLOWED_ROLES.includes(role)) {
//       return res.status(400).json({ error: 'Invalid role' });
//     }

//     const result = await editUser(user_id, {
//       name,
//       contact,
//       address,
//       email,
//       role, // ✅ admin / sub_admin only
//       status,
//     });

//     res.json({ message: 'User updated successfully', result });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Failed to update user' });
//   }
// };


export const updateUser = async (req, res) => {

  const { user_id } = req.params;

  const {
    name,
    contact,
    address,
    email,
    role,
    status,
    reset_password
  } = req.body;

  try {

    if (role && !ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    let passwordQuery = "";
    let params = [name, contact, address, email, role, status];

    if (reset_password && reset_password.trim() !== "") {

      const hashedPassword = await bcrypt.hash(reset_password, 10);

      passwordQuery = ", password=?";
      params.push(hashedPassword);

    }

    params.push(user_id);

    const query = `
      UPDATE users
      SET
      name=?,
      contact_no=?,
      address=?,
      email=?,
      role=?,
      status=?
      ${passwordQuery}
      WHERE user_id=?
    `;

    const [result] = await db.query(query, params);

    res.json({
      message: "User updated successfully",
      result
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Failed to update user"
    });

  }
};

/* ================= DELETE USER ================= */

export const removeUser = async (req, res) => {
  const { user_id } = req.params;

  try {
    const result = await deleteUser(user_id);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};


/* ================= SEND RESET OTP ================= */
// export const sendResetOtp = async (req, res) => {

//   const { user_id } = req.params;

//   try {

//     const [rows] = await db.query("SELECT * FROM users WHERE user_id=?", [user_id]);

//     if (rows.length === 0) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const user = rows[0];

//     const otp = Math.floor(100000 + Math.random() * 900000).toString();
//     const expiry = new Date(Date.now() + 5 * 60 * 1000);

//     await db.query(
//       "UPDATE users SET otp=?, otp_expiry=? WHERE user_id=?",
//       [otp, expiry, user_id]
//     );

//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: "sujitkhojare24@gmail.com",
//         pass: process.env.MAIL_PASS
//       }
//     });

//     await transporter.sendMail({
//       from: "sujitkhojare24@gmail.com",
//       to: user.email,
//       subject: "Password Reset OTP",
//       html: `
//         <h3>Password Reset Request</h3>

//         <p>Name : ${user.name}</p>
//         <p>Username : ${user.username}</p>

//         <h2>Your OTP : ${otp}</h2>

//         <p>Valid for 5 minutes</p>
//       `
//     });

//     res.json({ message: "OTP sent successfully" });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Failed to send OTP" });
//   }
// };


export const sendResetOtp = async (req, res) => {
  const { user_id } = req.params;

  try {
    const [rows] = await db.query(
      "SELECT * FROM users WHERE user_id=?",
      [user_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = rows[0];

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 5 * 60 * 1000);

    await db.query(
      "UPDATE users SET otp=?, otp_expiry=? WHERE user_id=?",
      [otp, expiry, user_id]
    );

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: user.email,
      subject: "Password Reset OTP",
      html: `
        <h3>Password Reset Request</h3>
        <p>Name : ${user.name}</p>
        <p>Username : ${user.username}</p>
        <h2>Your OTP : ${otp}</h2>
        <p>Valid for 5 minutes</p>
      `
    });

    res.json({ message: "OTP sent successfully" });

  } catch (error) {
    console.error("OTP ERROR:", error);
    res.status(500).json({ error: "Failed to send OTP" });
  }
};


/* ================= RESET PASSWORD ================= */

export const resetPassword = async (req, res) => {

  const { user_id } = req.params;
  const { otp, newPassword } = req.body;

  try {

    const [rows] = await db.query(
      "SELECT * FROM users WHERE user_id=?",
      [user_id]
    );

    const user = rows[0];

    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (new Date() > new Date(user.otp_expiry)) {
      return res.status(400).json({ message: "OTP expired" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.query(
      "UPDATE users SET password=?, otp=NULL, otp_expiry=NULL WHERE user_id=?",
      [hashedPassword, user_id]
    );

    res.json({ message: "Password reset successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to reset password" });
  }
};


//assets


export const getAssetsGroupedByStatus = async (req, res) => {
  try {
    const query = `SELECT * FROM assets ORDER BY status`;
    const [rows] = await db.execute(query);

    const groupedData = {};

    rows.forEach(asset => {
      if (!groupedData[asset.status]) {
        groupedData[asset.status] = [];
      }
      groupedData[asset.status].push(asset);
    });

    res.status(200).json({
      success: true,
      data: groupedData
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};


export const assignAsset = async (req, res) => {
  try {
    const { user_id, asset_id, remark } = req.body;

    if (!user_id || !asset_id) {
      return res.status(400).json({
        success: false,
        message: "User ID and Asset ID are required"
      });
    }

    // ✅ Check if user already has asset
    const [existing] = await db.execute(
      `SELECT * FROM asset_assignments 
       WHERE user_id = ? AND status = 'assigned'`,
      [user_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "User already has an assigned asset"
      });
    }

    // ✅ Check if asset is available
    const [assetCheck] = await db.execute(
      `SELECT * FROM assets WHERE asset_id = ? AND status = 'available'`,
      [asset_id]
    );

    if (assetCheck.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Asset is not available"
      });
    }

    // ✅ Insert assignment
    await db.execute(
      `INSERT INTO asset_assignments 
        (user_id, asset_id, assigned_date, returned_date, remark, status)
       VALUES (?, ?, CURDATE(), NULL, ?, 'assigned')`,
      [user_id, asset_id, remark || null]
    );

    // ✅ Update asset
    await db.execute(
      `UPDATE assets SET status = 'assigned' WHERE asset_id = ?`,
      [asset_id]
    );

    // ✅ Update user flag (IMPORTANT)
    await db.execute(
      `UPDATE users SET has_asset = 1 WHERE user_id = ?`,
      [user_id]
    );

    return res.status(200).json({
      success: true,
      message: "Asset assigned successfully"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};


export const getUserAssignedAsset = async (req, res) => {
  try {
    const { user_id } = req.params;

    const [rows] = await db.execute(
      `SELECT aa.*, a.asset_name, a.serial_no
       FROM asset_assignments aa
       JOIN assets a ON aa.asset_id = a.asset_id
       WHERE aa.user_id = ? AND aa.status = 'assigned'`,
      [user_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No assigned asset found"
      });
    }

    res.json({
      success: true,
      data: rows[0]
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
};


export const returnAsset = async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const { user_id, remark, return_date } = req.body;

    if (!user_id || !return_date) {
      return res.status(400).json({
        success: false,
        message: "User ID and return date required"
      });
    }

    // ✅ Get current assignment
    const [assigned] = await connection.execute(
      `SELECT * FROM asset_assignments 
       WHERE user_id = ? AND status = 'assigned'`,
      [user_id]
    );

    if (assigned.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No active asset found"
      });
    }

    const current = assigned[0];

    // ✅ Insert NEW return entry (history)
    await connection.execute(
      `INSERT INTO asset_assignments 
      (user_id, asset_id, returned_date, remark, status)
      VALUES (?, ?, ?, ?, 'returned')`,
      [
        current.user_id,
        current.asset_id,
     
        return_date,
        remark || null
      ]
    );

    // ✅ Update old entry
    await connection.execute(
      `UPDATE asset_assignments 
       SET status = 'returned' 
       WHERE assignment_id = ?`,
      [current.assignment_id]
    );

    // ✅ Update asset
    await connection.execute(
      `UPDATE assets SET status = 'available' WHERE asset_id = ?`,
      [current.asset_id]
    );

    // ✅ Update user
    await connection.execute(
      `UPDATE users SET has_asset = 0 WHERE user_id = ?`,
      [user_id]
    );

    await connection.commit();

    res.json({
      success: true,
      message: "Asset returned successfully"
    });

  } catch (error) {
    await connection.rollback();
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  } finally {
    connection.release();
  }
};


export const getUserAssetHistory = async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    const [rows] = await db.execute(
      `SELECT 
          aa.assignment_id,
          aa.user_id,
          aa.asset_id,
          aa.assigned_date,
          aa.returned_date,
          aa.remark,
          aa.status,
          aa.created_at,

          a.asset_name,
          a.asset_type,
          a.serial_no

       FROM asset_assignments aa
       JOIN assets a ON aa.asset_id = a.asset_id
       WHERE aa.user_id = ?
       ORDER BY aa.created_at DESC`,
      [user_id]
    );

    return res.status(200).json({
      success: true,
      count: rows.length,
      data: rows
    });

  } catch (error) {
    console.error("Error fetching user asset history:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};