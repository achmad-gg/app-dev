// src/controllers/comment.controller.js
import * as CommentService from "../services/comment.service.js";

export const create = async (req, res, next) => {
  try {
    const { content, parent_id } = req.body;

    if (!content || content.length < 3) {
      return res.status(400).json({ message: "Comment too short" });
    }

    const check = await ensureApproved(req.params.articleId);
    if (!check.ok)
      return res.status(check.code).json({ message: check.message });

    const comment = await CommentService.createComment({
      content,
      user_id: req.user.id,
      article_id: req.params.articleId,
      parent_id: parent_id ?? null,
    });

    res.status(201).json({ message: "Comment added", comment });

    await logActivity({
      user_id: req.user.id,
      action: "CREATE_COMMENT",
      metadata: { article_id: req.params.articleId },
    });
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

export const remove = async (req, res, next) => {
  try {
    const comment = await CommentService.getCommentById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.user_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    await CommentService.deleteComment(req.params.id);
    res.json({ message: "Comment deleted" });
    await logActivity({
      user_id: req.user.id,
      action: "DELETE_COMMENT",
      metadata: {
        comment_id: req.params.id,
      },
    });
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
    await logActivity({
      user_id: req.user.id,
      action: "MODERATE_COMMENT",
      metadata: {
        comment_id: comment.id,
        is_approved: comment.is_approved,
      },
    });
  } catch (err) {
    next(err);
  }
};

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
