// src/controllers/auth.controller.js
import { pool } from "../config/db.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import { generateToken } from "../utils/jwt.js";
import { logActivity } from "../utils/activityLogger.js";

export const register = async (req, res, next) => {
  try {
    const { email, password} = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email & password required" });
    }

    const checkUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email],
    );

    if (checkUser.rows.length > 0) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashed = await hashPassword(password);

    const result = await pool.query(
      `INSERT INTO users (email, password, role_id)
       VALUES ($1, $2, 3)
       RETURNING id, email`,
      [email, hashed],
    );

    res.status(201).json({
      message: "Register success",
      user: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      `SELECT u.id, u.email, u.password, r.name AS role
       FROM users u
       JOIN roles r ON r.id = u.role_id
       WHERE u.email = $1 AND u.is_active = true`,
      [email],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = result.rows[0];

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken({
      id: user.id,
      role: user.role,
      
    });

    res.json({
      message: "Login success",
      token,
    });
    await logActivity({
      user_id: user.id,
      action: "LOGIN",
      metadata: {
        email: user.email,
      },
    });
  } catch (err) {
    next(err);
  }
};
