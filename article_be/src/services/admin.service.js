// src/services/admin.service.js
import { pool } from "../config/db.js";

/* ============================================================
   DASHBOARD STATS
============================================================ */
export const getStats = async () => {
  const [
    users,
    activeUsers,
    suspendedUsers,
    bannedUsers,
    articles,
    comments,
    likes,
    pendingArticles,
  ] = await Promise.all([
    pool.query("SELECT COUNT(*) FROM users"),
    pool.query("SELECT COUNT(*) FROM users WHERE status = 'active'"),
    pool.query("SELECT COUNT(*) FROM users WHERE status = 'suspended'"),
    pool.query("SELECT COUNT(*) FROM users WHERE status = 'banned'"),
    pool.query("SELECT COUNT(*) FROM articles"),
    pool.query("SELECT COUNT(*) FROM comments"),
    pool.query("SELECT COUNT(*) FROM likes"),
    pool.query("SELECT COUNT(*) FROM articles WHERE status = 'pending'"),
  ]);

  return {
    users: Number(users.rows[0].count),
    active_users: Number(activeUsers.rows[0].count),
    suspended_users: Number(suspendedUsers.rows[0].count),
    banned_users: Number(bannedUsers.rows[0].count),
    articles: Number(articles.rows[0].count),
    comments: Number(comments.rows[0].count),
    likes: Number(likes.rows[0].count),
    pending_articles: Number(pendingArticles.rows[0].count),
  };
};

/* ============================================================
   GET USERS
============================================================ */
export const getUsers = async (currentUserId, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;

  const dataQuery = `
    SELECT 
      u.id,
      u.fullname,
      u.email,
      u.status,
      u.violation_count,
      u.ban_expires_at,
      r.name AS role
    FROM users u
    JOIN roles r ON r.id = u.role_id
    WHERE u.id <> $1
    ORDER BY u.created_at DESC
    LIMIT $2 OFFSET $3
  `;

  const countQuery = `
    SELECT COUNT(*) 
    FROM users
    WHERE id <> $1
  `;

  const [dataResult, countResult] = await Promise.all([
    pool.query(dataQuery, [currentUserId, limit, offset]),
    pool.query(countQuery, [currentUserId]),
  ]);

  return {
    data: dataResult.rows,
    total: Number(countResult.rows[0].count),
    page,
    limit,
    totalPages: Math.ceil(Number(countResult.rows[0].count) / limit),
  };
};

/* ============================================================
   SUSPEND USER (TEMPORARY BLOCK)
============================================================ */
export const suspendUser = async (targetUserId, adminId) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const userRes = await client.query(
      `SELECT id, role_id, status, violation_count
       FROM users
       WHERE id = $1
       FOR UPDATE`,
      [targetUserId],
    );

    if (userRes.rows.length === 0) {
      throw new Error("User not found");
    }

    const user = userRes.rows[0];

    // only role user (2)
    if (user.role_id !== 2) {
      throw new Error("Only normal users can be suspended");
    }

    if (user.status === "banned") {
      throw new Error("User already permanently banned");
    }

    const newViolationCount = user.violation_count + 1;

    // 3x suspend → permanent ban
    if (newViolationCount >= 3) {
      await client.query(
        `
        UPDATE users
        SET 
          status = 'banned',
          violation_count = $1,
          ban_expires_at = NULL,
          blocked_at = NOW(),
          blocked_by = $2
        WHERE id = $3
        `,
        [newViolationCount, adminId, targetUserId],
      );
    } else {
      // 7 day suspension
      await client.query(
        `
        UPDATE users
        SET 
          status = 'suspended',
          violation_count = $1,
          ban_expires_at = NOW() + INTERVAL '7 days',
          blocked_at = NOW(),
          blocked_by = $2
        WHERE id = $3
        `,
        [newViolationCount, adminId, targetUserId],
      );
    }

    await client.query("COMMIT");

    return { success: true };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

/* ============================================================
   ACTIVATE USER (ONLY FROM SUSPENDED)
============================================================ */
export const activateUser = async (id) => {
  const { rows } = await pool.query(
    `
    UPDATE users
    SET 
      status = 'active',
      ban_expires_at = NULL
    WHERE id = $1
      AND status = 'suspended'
    RETURNING id, status
    `,
    [id],
  );

  if (!rows.length) {
    throw new Error("User cannot be activated");
  }

  return rows[0];
};

/* ============================================================
   GET PENDING ARTICLES
============================================================ */
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
  `);

  return rows;
};
