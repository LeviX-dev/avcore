import {
  addUser,
  getUsers as getAllUsers,
  deleteUser,
  editUser
} from '../models/userModel.js';
import db from '../database/db.js';
import bcrypt from 'bcrypt';

/* ================= ROLE CONFIG ================= */

const ALLOWED_ROLES = [
  'admin',
  'sub_admin',
  'digital_marketing',
  'tele_caller',
  'field_marketing_executive',
  'junior_autocad_designer',
  'senior_autocad_designer',
  'tech_sale_sound_engineer',
  'technical_head',
];

const ROLE_LABELS = {
  admin: 'Director (Super Admin)',
  sub_admin: 'Business Head (Sub Admin)',
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

/* ================= UPDATE USER ================= */

export const updateUser = async (req, res) => {
  const { user_id } = req.params;
  const { name, contact, address, email, role, status } = req.body;

  try {
    if (role && !ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const result = await editUser(user_id, {
      name,
      contact,
      address,
      email,
      role, // ✅ admin / sub_admin only
      status,
    });

    res.json({ message: 'User updated successfully', result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update user' });
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
