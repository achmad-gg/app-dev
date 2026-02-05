// src/services/comment.service.js
import { pool } from "../config/db.js";

export const createComment = async ({
  content,
  user_id,
  article_id,
  parent_id = null,
}) => {
  const query = `
    INSERT INTO comments (content, user_id, article_id, parent_id)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;
  const { rows } = await pool.query(query, [
    content,
    user_id,
    article_id,
    parent_id,
  ]);
  return rows[0];
};

export const getCommentsByArticle = async (article_id) => {
  const query = `
   SELECT c.id, c.content, c.created_at, c.parent_id,
       u.fullname AS name
FROM comments c
JOIN users u ON u.id = c.user_id
WHERE c.article_id = $1
  AND c.is_approved = true
ORDER BY c.created_at ASC;

  `;
  const { rows } = await pool.query(query, [article_id]);
  return rows;
};

export const deleteComment = async (id) => {
  await pool.query("DELETE FROM comments WHERE id = $1", [id]);
};

export const approveComment = async (id, isApproved) => {
  const query = `
    UPDATE comments
    SET is_approved = $1
    WHERE id = $2
    RETURNING *
  `;
  const { rows } = await pool.query(query, [isApproved, id]);
  return rows[0];
};

export const getCommentById = async (id) => {
  const { rows } = await pool.query("SELECT * FROM comments WHERE id = $1", [
    id,
  ]);
  return rows[0];
};

export const getArticleStatus = async (article_id) => {
  const { rows } = await pool.query(
    "SELECT status FROM articles WHERE id = $1",
    [article_id],
  );
  return rows[0]?.status || null;
};
