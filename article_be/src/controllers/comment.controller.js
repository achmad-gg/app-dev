// src/controllers/comment.controller.js
import * as CommentService from "../services/comment.service.js";

export const create = async (req, res, next) => {
  try {
    const { content, parent_id } = req.body;

    if (!content || content.length < 3) {
      return res.status(400).json({ message: "Comment too short" });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({
        message: "Comment cannot be empty",
      });
    }

    const check = await ensureApproved(req.params.articleId);
    if (!check.ok) {
      return res.status(check.code).json({ message: check.message });
    }

    const comment = await CommentService.createComment({
      content,
      user_id: req.user.id,
      article_id: req.params.articleId,
      parent_id: parent_id ?? null,
    });

    res.status(201).json({ message: "Comment added", comment });
  } catch (err) {
    next(err);
  }
};

export const findByArticle = async (req, res, next) => {
  try {
    const status = await CommentService.getArticleStatus(req.params.articleId);

    if (!status || status !== "approved") {
      return res.status(404).json({ message: "Article not found" });
    }

    const comments = await CommentService.getCommentsByArticle(
      req.params.articleId,
    );

    res.json(comments);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE COMMENT
 * - user bisa delete comment sendiri
 * - admin bisa delete comment siapa pun
 * - notifikasi dikirim kalau admin yang delete
 */
export const remove = async (req, res, next) => {
  try {
    const commentId = req.params.id;
    const actor = req.user; // { id, role }

    await CommentService.deleteCommentWithPermission({
      commentId,
      actorId: actor.id,
      actorRole: actor.role,
    });

    res.json({ message: "Comment deleted" });
  } catch (err) {
    next(err);
  }
};

export const approve = async (req, res, next) => {
  try {
    const comment = await CommentService.approveComment(
      req.params.id,
      req.body.is_approved,
    );

    res.json({
      message: "Comment moderation updated",
      comment,
    });
  } catch (err) {
    next(err);
  }
};

// =====================
// Helper
// =====================
const ensureApproved = async (articleId) => {
  const status = await CommentService.getArticleStatus(articleId);

  if (!status) {
    return { ok: false, code: 404, message: "Article not found" };
  }
  if (status !== "approved") {
    return {
      ok: false,
      code: 403,
      message: "Comment hanya bisa untuk artikel yang sudah approved",
    };
  }
  return { ok: true };
};
