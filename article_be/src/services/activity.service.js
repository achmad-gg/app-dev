// src/services/activity.service.js
import { pool } from '../config/db.js'

export const getLogs = async ({ page, limit }) => {
  const offset = (page - 1) * limit

  const data = await pool.query(
    `
    SELECT a.id, a.action, a.created_at,
           u.email,
           a.metadata
    FROM activity_logs a
    LEFT JOIN users u ON u.id = a.user_id
    ORDER BY a.created_at DESC
    LIMIT $1 OFFSET $2
    `,
    [limit, offset]
  )

  const total = await pool.query(
    'SELECT COUNT(*) FROM activity_logs'
  )

  return {
    data: data.rows,
    total: Number(total.rows[0].count),
  }
}
