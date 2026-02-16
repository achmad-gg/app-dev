// src/services/article.service.js
import { pool } from "../config/db.js";

export const createArticle = async ({
  title,
  content,
  category_id,
  user_id,
  cover_image,
  published_at,
}) => {
  await assertUserCanWrite(user_id);

  const query = `
    INSERT INTO articles 
      (title, content, category_id, user_id, cover_image, status, published_at)
    VALUES 
      ($1, $2, $3, $4, $5, 'pending', $6)
    RETURNING *
  `;

  const { rows } = await pool.query(query, [
    title,
    content,
    category_id,
    user_id,
    cover_image,
    published_at || null,
  ]);

  return rows[0];
};

export const getArticles = async ({
  page = 1,
  limit = 10,
  categoryId,
  search,
  status,
  isPublic = false,
}) => {
  const offset = (page - 1) * limit;
  let where = "WHERE 1=1";
  const values = [];

  // =========================
  // PUBLIC MODE
  // =========================
  if (isPublic) {
    where += `
      AND a.status = 'approved'
      AND (
        a.published_at IS NULL
        OR a.published_at <= NOW()
      )
    `;
  }
  // =========================
  // ADMIN / NORMAL MODE
  // =========================
  else if (status) {
    values.push(status);
    where += ` AND a.status = $${values.length}`;
  }

  if (categoryId !== null && categoryId !== undefined) {
    values.push(categoryId);
    where += ` AND a.category_id = $${values.length}`;
  }

  if (search) {
    values.push(`%${search}%`);
    where += `
      AND (
        a.title ILIKE $${values.length}
        OR a.content ILIKE $${values.length}
      )
    `;
  }

  const dataQuery = `
    SELECT
      a.id,
      a.title,
      a.created_at,
      a.cover_image,
      a.status,
      a.published_at,
      u.fullname AS author,
      a.views,
      LEFT(
  REGEXP_REPLACE(a.content, '<[^>]*>', '', 'g'),
  150
) AS excerpt,
      c.id AS category_id,
      c.name AS category_name
    FROM articles a
    JOIN categories c ON c.id = a.category_id
    JOIN users u ON u.id = a.user_id
    ${where}
    ORDER BY 
      COALESCE(a.published_at, a.created_at) DESC
    LIMIT $${values.length + 1}
    OFFSET $${values.length + 2}
  `;

  const countQuery = `
    SELECT COUNT(*)
    FROM articles a
    JOIN categories c ON c.id = a.category_id
    JOIN users u ON u.id = a.user_id
    ${where}
  `;

  const data = await pool.query(dataQuery, [...values, limit, offset]);
  const total = await pool.query(countQuery, values);

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
      a.cover_image,
      a.status,
      a.user_id,
      a.created_at,
      a.views,
      c.name AS category_name,
      u.fullname AS author,
      (
        SELECT COUNT(*) 
        FROM likes l 
        WHERE l.article_id = a.id
      ) AS like_count
    FROM articles a
    JOIN categories c ON c.id = a.category_id
    JOIN users u ON u.id = a.user_id
    WHERE a.id = $1
    `,
    [id],
  );

  return rows[0];
};

export const deleteArticle = async (id, userId) => {
  await assertUserCanWrite(userId);

  const query = `
    DELETE FROM articles 
    WHERE id = $1 
      AND user_id = $2 
    RETURNING id
  `;

  const { rows } = await pool.query(query, [id, userId]);
  return rows.length > 0;
};

export const updateArticle = async ({
  id,
  title,
  content,
  category_id,
  cover_image,
  user_id,
}) => {
  await assertUserCanWrite(user_id);

  const query = `
    UPDATE articles
    SET 
      title = $1,
      content = $2,
      category_id = $3,
      cover_image = COALESCE($4, cover_image),
      updated_at = NOW()
    WHERE id = $5
      AND user_id = $6
    RETURNING *
  `;

  const { rows } = await pool.query(query, [
    title,
    content,
    category_id,
    cover_image,
    id,
    user_id,
  ]);

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
  await pool.query(
    `
    UPDATE articles
    SET views = views + 1
    WHERE 
      id = $1
      AND status = 'approved'
      AND (
        published_at IS NULL
        OR published_at <= NOW()
      )
    `,
    [id],
  );

  const { rows } = await pool.query(
    `
    SELECT 
      a.id,
      a.title,
      a.content,
      a.created_at,
      a.views,
      a.cover_image,
      c.name AS category_name,
      u.fullname AS author
    FROM articles a
    JOIN categories c ON c.id = a.category_id
    JOIN users u ON u.id = a.user_id
    WHERE 
      a.id = $1
      AND a.status = 'approved'
      AND (
        a.published_at IS NULL
        OR a.published_at <= NOW()
      )
    `,
    [id],
  );

  return rows[0] || null;
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

export const getArticlesByUser = async ({
  user_id,
  page,
  limit,
  status,
  categoryId,
  search,
}) => {
  const offset = (page - 1) * limit;
  const values = [user_id];
  let where = `WHERE a.user_id = $1`;

  if (status) {
    values.push(status);
    where += ` AND a.status = $${values.length}`;
  }

  if (categoryId !== null && categoryId !== undefined) {
    values.push(categoryId);
    where += ` AND a.category_id = $${values.length}`;
  }

  if (search) {
    values.push(`%${search}%`);
    where += `
      AND (
        a.title ILIKE $${values.length}
        OR a.content ILIKE $${values.length}
      )
    `;
  }

  const query = `
    SELECT
  a.id,
  a.title,
  a.status,
  a.created_at,
  a.cover_image,
  c.name AS category_name,
  a.views,
  (
    SELECT COUNT(*)
    FROM likes l
    WHERE l.article_id = a.id
  ) AS likes
FROM articles a
JOIN categories c ON c.id = a.category_id
${where}
ORDER BY a.created_at DESC
LIMIT $${values.length + 1}
OFFSET $${values.length + 2}
  `;

  const data = await pool.query(query, [...values, limit, offset]);

  const total = await pool.query(
    `SELECT COUNT(*) FROM articles a JOIN categories c ON c.id = a.category_id ${where}`,
    values,
  );

  return {
    data: data.rows,
    total: Number(total.rows[0].count),
  };
};

export const deleteArticleAdmin = async (id) => {
  const query = "DELETE FROM articles WHERE id = $1 RETURNING id";
  const { rows } = await pool.query(query, [id]);
  return rows.length > 0;
};

// helper internal
const assertUserCanWrite = async (userId) => {
  const { rows } = await pool.query(`SELECT status FROM users WHERE id = $1`, [
    userId,
  ]);

  if (!rows.length) {
    throw new Error("User not found");
  }

  const { status } = rows[0];

  if (status === "blocked") {
    throw new Error("User is temporarily blocked");
  }

  if (status === "permanent_blocked") {
    throw new Error("User is permanently blocked");
  }
};
