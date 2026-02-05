// src/controllers/profile.controller.js
import * as ProfileService from "../services/profile.service.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import { pool } from "../config/db.js";
import { logActivity } from "../utils/activityLogger.js";


export const getMe = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const profile = await ProfileService.getProfile(req.user.id);
    res.json(profile);
  } catch (err) {
    next(err);
  }
};

export const updateMe = async (req, res, next) => {
  try {
    const { email, fullname } = req.body;
    if (!email || !fullname) {
      return res.status(400).json({ message: "Email & fullname required" });
    }

    const updated = await ProfileService.updateProfile(req.user.id, {
      email,
      fullname,
    });

    res.json({ message: "Profile updated", user: updated });
  } catch (err) {
    next(err);
  }
};

export const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "File required" })
    }

    // hapus avatar lama kalau ada
    const profile = await ProfileService.getProfile(req.user.id)
    if (profile.avatar) {
      fs.unlink(`uploads/${profile.avatar}`, () => {})
    }

    const avatarPath = `avatars/${req.file.filename}`
    await ProfileService.updateAvatar(req.user.id, avatarPath)

    res.json({ message: "Avatar updated", avatar: avatarPath })
  } catch (err) {
    next(err)
  }
}

export const deleteAvatar = async (req, res, next) => {
  try {
    const profile = await ProfileService.getProfile(req.user.id)

    if (!profile.avatar) {
      return res.status(400).json({ message: "No avatar to delete" })
    }

    fs.unlink(`uploads/${profile.avatar}`, () => {})
    await ProfileService.removeAvatar(req.user.id)

    res.json({ message: "Avatar deleted" })
  } catch (err) {
    next(err)
  }
}


export const changePassword = async (req, res, next) => {
  if (new_password.length < 6) {
    return res.status(400).json({ message: "Password min 6 chars" });
  }

  try {
    const { old_password, new_password } = req.body;

    if (!old_password || !new_password) {
      return res.status(400).json({ message: "Password required" });
    }

    const { rows } = await pool.query(
      "SELECT password FROM users WHERE id = $1",
      [req.user.id],
    );

    const isMatch = await comparePassword(old_password, rows[0].password);

    if (!isMatch) {
      return res.status(401).json({ message: "Old password incorrect" });
    }

    const hashed = await hashPassword(new_password);
    await ProfileService.updatePassword(req.user.id, hashed);

    await logActivity({
      user_id: req.user.id,
      action: "CHANGE_PASSWORD",
    });

    res.json({ message: "Password updated" });
  } catch (err) {
    next(err);
  }
};
