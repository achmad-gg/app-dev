// src/services/admin.service.js
import { pool } from '../config/db.js'

export const getStats = async () => {
  const [
    users,
    articles,
    comments,
    likes,
    pendingArticles,
  ] = await Promise.all([
    pool.query('SELECT COUNT(*) FROM users'),
    pool.query('SELECT COUNT(*) FROM articles'),
    pool.query('SELECT COUNT(*) FROM comments'),
    pool.query('SELECT COUNT(*) FROM likes'),
    pool.query("SELECT COUNT(*) FROM articles WHERE status = 'pending'"),
  ])

  return {
    users: Number(users.rows[0].count),
    articles: Number(articles.rows[0].count),
    comments: Number(comments.rows[0].count),
    likes: Number(likes.rows[0].count),
    pending_articles: Number(pendingArticles.rows[0].count),
  }
}

export const getUsers = async (currentUserId) => {
  const { rows } = await pool.query(
    `
    SELECT u.id, u.email, u.is_active, r.name AS role
    FROM users u
    JOIN roles r ON r.id = u.role_id
    WHERE u.id <> $1
    ORDER BY u.created_at DESC
    `,
    [currentUserId]
  )
  return rows
}


export const getPendingArticles = async () => {
  const { rows } = await pool.query(`
    SELECT 
      a.id,
      a.title,
      u.email AS author_email,
      a.created_at
    FROM articles a
    JOIN users u ON u.id = a.user_id
    WHERE a.status = 'pending'
    ORDER BY a.created_at DESC
  `)

  return rows
}


export const updateUserStatus = async (id, is_active) => {
  const { rows } = await pool.query(
    `
    UPDATE users
    SET is_active = $1
    WHERE id = $2
    RETURNING id, email, is_active
    `,
    [is_active, id]
  )
  return rows[0]
}

export const updateUserRole = async (id, role_id) => {
  const { rows } = await pool.query(
    `
    UPDATE users
    SET role_id = $1
    WHERE id = $2
    RETURNING id, email, role_id
    `,
    [role_id, id]
  )
  return rows[0]
}
