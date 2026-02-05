// src/controllers/comment.controller.js
import * as CommentService from "../services/comment.service.js";

export const create = async (req, res, next) => {
  try {
    // 1. Extract content from req.body
    const { content } = req.body;

    // 2. Validate BEFORE saving to database
    if (!content || content.length < 3) {
      return res.status(400).json({ message: "Comment too short" });
    }

    // 3. Proceed with creation
    const comment = await CommentService.createComment({
      content: content,
      article_id: req.params.articleId,
      user_id: req.user.id,
    });

    res.status(201).json({
      message: "Comment added",
      comment,
    });

    // 4. Log activity (non-blocking)
    await logActivity({
      user_id: req.user.id,
      action: "CREATE_COMMENT",
      metadata: {
        article_id: req.params.articleId,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const findByArticle = async (req, res, next) => {
  try {
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
