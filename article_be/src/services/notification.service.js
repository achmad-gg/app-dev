// services/notification.service.js
import { pool } from "../config/db.js";

export async function createNotification({
  user_id,
  type,
  message,
  meta = {},
}) {
  await pool.query(
    `INSERT INTO notifications (user_id, type, message, meta)
     VALUES ($1, $2, $3, $4)`,
    [user_id, type, message, meta]
  )
}

export async function getNotificationsByUser(userId) {
  const { rows } = await pool.query(
    `SELECT *
     FROM notifications
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  )
  return rows
}

export async function markNotificationAsRead(id, userId) {
  await pool.query(
    `UPDATE notifications
     SET is_read = true
     WHERE id = $1 AND user_id = $2`,
    [id, userId]
  )
}

export async function clearAllNotificationsByUser(userId) {
  await pool.query(
    `DELETE FROM notifications WHERE user_id = $1`,
    [userId]
  );
}

export async function deleteNotificationById(id, userId) {
  await pool.query(
    `DELETE FROM notifications WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );
}