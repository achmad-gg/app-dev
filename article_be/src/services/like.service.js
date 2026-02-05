// src/services/like.service.js
import { pool } from '../config/db.js'

export const likeArticle = async (user_id, article_id) => {
  const query = `
    INSERT INTO likes (user_id, article_id)
    VALUES ($1, $2)
    ON CONFLICT DO NOTHING
  `
  await pool.query(query, [user_id, article_id])
}

export const unlikeArticle = async (user_id, article_id) => {
  await pool.query(
    'DELETE FROM likes WHERE user_id = $1 AND article_id = $2',
    [user_id, article_id]
  )
}

export const countLikes = async (article_id) => {
  const { rows } = await pool.query(
    'SELECT COUNT(*) FROM likes WHERE article_id = $1',
    [article_id]
  )
  return Number(rows[0].count)
}

export const isArticleLikedByUser = async (user_id, article_id) => {
  const { rows } = await pool.query(
    `
    SELECT EXISTS (
      SELECT 1 FROM likes
      WHERE user_id = $1 AND article_id = $2
    ) AS liked
    `,
    [user_id, article_id]
  )
  return rows[0].liked
}

