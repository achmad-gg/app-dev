// src/utils/activityLogger.js
import { pool } from '../config/db.js'

export const logActivity = async ({ user_id, action, metadata = {} }) => {
  try {
    await pool.query(
      `INSERT INTO activity_logs (user_id, action, metadata)
       VALUES ($1, $2, $3)`,
      [user_id, action, metadata]
    )
  } catch (err) {
    console.error('Activity log failed:', err.message)
  }
}
