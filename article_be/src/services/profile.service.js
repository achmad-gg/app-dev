// src/services/profile.service.js
import { pool } from '../config/db.js'

export const getProfile = async (userId) => {
  const { rows } = await pool.query(
    `
    SELECT 
      u.id,
      u.email,
      u.fullname,
      u.avatar,
      r.name AS role
    FROM users u
    JOIN roles r ON r.id = u.role_id
    WHERE u.id = $1
    `,
    [userId]
  )

  const user = rows[0]
  if (!user) return null

  return {
    ...user,
    avatar: user.avatar
      ? `http://localhost:3000/api/uploads/${user.avatar}`
      : null,
  }
}


export const updateProfile = async (userId, { email, fullname }) => {
  const { rows } = await pool.query(
    `
    UPDATE users
    SET email = $1, fullname = $2, updated_at = NOW()
    WHERE id = $3
    RETURNING id, email, fullname, avatar
    `,
    [email, fullname, userId]
  )
  return rows[0]
}

export const updateAvatar = async (userId, avatarPath) => {
  const { rows } = await pool.query(
    `
    UPDATE users
    SET avatar = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING avatar
    `,
    [avatarPath, userId]
  )
  return rows[0]
}

export const removeAvatar = async (userId) => {
  const { rows } = await pool.query(
    `
    UPDATE users
    SET avatar = NULL, updated_at = NOW()
    WHERE id = $1
    RETURNING avatar
    `,
    [userId]
  )
  return rows[0]
}


export const updatePassword = async (userId, hashedPassword) => {
  await pool.query(
    `
    UPDATE users
    SET password = $1, updated_at = NOW()
    WHERE id = $2
    `,
    [hashedPassword, userId]
  )
}
