// src/services/comment.service.js
import { pool } from "../config/db.js";
import { createNotification } from "./notification.service.js";


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
   SELECT c.id, c.content, c.created_at,c.user_id, c.parent_id,
       u.fullname AS name,
       u.avatar,
       r.name AS user_role
FROM comments c
JOIN users u ON u.id = c.user_id
JOIN roles r ON r.id = u.role_id
WHERE c.article_id = $1
  AND c.is_approved = true
ORDER BY c.created_at DESC;
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

export async function deleteCommentWithPermission({
  commentId,
  actorId,
  actorRole,
  reason = "Melanggar pedoman komunitas",
}) {
  const comment = await getCommentById(commentId);
  if (!comment) {
    throw new Error("Comment not found");
  }

  const isOwner = String(comment.user_id) === String(actorId);
  const isAdmin = actorRole === "admin";

  if (!isOwner && !isAdmin) {
    const err = new Error("Forbidden");
    err.status = 403;
    throw err;
  }

  await deleteComment(commentId);

  // admin delete → notif user
  if (isAdmin && !isOwner) {
    await createNotification({
      user_id: comment.user_id,
      type: "comment_deleted",
      message: `Komentar kamu dihapus oleh admin karena alasan: ${reason}`,
      meta: {
        comment_id: comment.id,
        article_id: comment.article_id,
        deleted_by: actorId,
        reason,
      },
    });
  }
}