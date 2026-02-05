// src/services/article.service.js
import { pool } from "../config/db.js";

export const createArticle = async ({
  title,
  content,
  category_id,
  user_id,
}) => {
  const query = `
    INSERT INTO articles (title, content, category_id, user_id, status)
    VALUES ($1, $2, $3, $4, 'pending')
    RETURNING *
  `;
  const { rows } = await pool.query(query, [
    title,
    content,
    category_id,
    user_id,
  ]);

  return rows[0];
};

export const getArticles = async ({ page, limit, category, status }) => {
  const offset = (page - 1) * limit;

  let where = "WHERE 1=1";
  const values = [];

  if (status) {
    values.push(status);
    where += ` AND a.status = $${values.length}`;
  }

  if (category) {
    values.push(category);
    where += ` AND a.category_id = $${values.length}`;
  }

  const query = `
    SELECT 
      a.id,
      a.title,
      a.status,
      a.created_at,
      LEFT(a.content, 150) AS excerpt,
      u.fullname AS Author,
      c.name AS category
    FROM articles a
    JOIN users u ON u.id = a.user_id
    JOIN categories c ON c.id = a.category_id
    ${where}
    ORDER BY a.created_at DESC
    LIMIT $${values.length + 1} OFFSET $${values.length + 2}
  `;

  const data = await pool.query(query, [...values, limit, offset]);
  const total = await pool.query(
    `SELECT COUNT(*) FROM articles a ${where}`,
    values,
  );

  return {
    data: data.rows,
    total: Number(total.rows[0].count),
  };
};

export const getArticleById = async (id) => {
  const { rows } = await pool.query(
    `
    SELECT 
      a.id,
      a.title,
      a.content,
      a.status,
      a.user_id,
      a.created_at,
      c.name AS category_name,
      u.fullname AS Author
    FROM articles a
    JOIN categories c ON c.id = a.category_id
    JOIN users u ON u.id = a.user_id
    WHERE a.id = $1
    `,
    [id],
  );

  return rows[0];
};

// Fungsi delete sudah benar, pastikan controller memanggilnya dengan 2 argumen
export const deleteArticle = async (id, userId) => {
  const query =
    "DELETE FROM articles WHERE id = $1 AND user_id = $2 RETURNING id";
  const { rows } = await pool.query(query, [id, userId]);
  return rows.length > 0;
};

export const updateArticle = async ({ id, title, content, category_id }) => {
  const query = `
    UPDATE articles
    SET title = $1, content = $2, category_id = $3, updated_at = NOW()
    WHERE id = $4
    RETURNING *
  `;
  const { rows } = await pool.query(query, [title, content, category_id, id]);
  return rows[0];
};

export const updateStatus = async ({ id, status }) => {
  const query = `
    UPDATE articles
    SET status = $1
    WHERE id = $2
    RETURNING *
  `;
  const { rows } = await pool.query(query, [status, id]);
  return rows[0];
};

export const approveArticle = async (id) => {
  const query = `
    UPDATE articles
    SET 
      status = 'approved',
      rejected_reason = NULL,
      updated_at = NOW()
    WHERE id = $1
    RETURNING *
  `;
  const { rows } = await pool.query(query, [id]);
  return rows[0];
};

export const rejectArticle = async ({ id, reason }) => {
  if (!reason) {
    throw new Error("Reject reason is required");
  }

  const query = `
    UPDATE articles
    SET 
      status = 'rejected',
      rejected_reason = $1,
      updated_at = NOW()
    WHERE id = $2
    RETURNING *
  `;
  const { rows } = await pool.query(query, [reason, id]);
  return rows[0];
};

export const getPublicArticleById = async (id) => {
  const { rows } = await pool.query(
    `
    SELECT 
      a.id,
      a.title,
      a.content,
      a.created_at,
      c.name AS category_name,
      u.email AS author_email
    FROM articles a
    JOIN categories c ON c.id = a.category_id
    JOIN users u ON u.id = a.user_id
    WHERE a.id = $1 AND a.status = 'approved'
    `,
    [id],
  );

  return rows[0];
};

export const getArticleByIdAdmin = async (id) => {
  const { rows } = await pool.query(
    `
    SELECT 
      a.*,
      c.name AS category_name,
      u.email AS author_email
    FROM articles a
    JOIN categories c ON c.id = a.category_id
    JOIN users u ON u.id = a.user_id
    WHERE a.id = $1
    `,
    [id],
  );

  return rows[0];
};

export const getArticlesByUser = async ({ user_id, page, limit, status }) => {
  const offset = (page - 1) * limit;
  const values = [user_id];
  let where = `WHERE a.user_id = $1`;

  if (status) {
    values.push(status);
    where += ` AND a.status = $${values.length}`;
  }

  const query = `
    SELECT
      a.id,
      a.title,
      a.status,
      a.created_at,
      c.name AS category_name
    FROM articles a
    JOIN categories c ON c.id = a.category_id
    ${where}
    ORDER BY a.created_at DESC
    LIMIT $${values.length + 1}
    OFFSET $${values.length + 2}
  `;

  const data = await pool.query(query, [...values, limit, offset]);

  const total = await pool.query(
    `SELECT COUNT(*) FROM articles a ${where}`,
    values,
  );

  return {
    data: data.rows,
    total: Number(total.rows[0].count),
  };
};
