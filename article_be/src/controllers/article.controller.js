import * as ArticleService from "../services/article.service.js";
import { logActivity } from "../utils/activityLogger.js";

const safeLog = async (payload) => {
  try {
    await logActivity(payload);
  } catch (e) {
    console.error("logActivity failed:", e?.message || e);
    // jangan throw — biar request utama tetap sukses
  }
};

/* =======================
   USER
======================= */
export const create = async (req, res, next) => {
  try {
    const { title, content, category_id, published_at } = req.body;
    const cover_image = req.file
      ? `/uploads/articles/${req.file.filename}`
      : null;

    if (!title || title.length < 5) {
      return res.status(400).json({ message: "Title too short" });
    }

    const article = await ArticleService.createArticle({
      title,
      content,
      category_id,
      user_id: req.user.id,
      cover_image,
      published_at,
    });

    res.status(201).json({
      message: "Article created, waiting for approval",
      article,
    });
    await safeLog({
      user_id: req.user.id,
      action: "CREATE_ARTICLE",
      metadata: {
        article_id: article.id,
        title,
        category_id,
        status: article.status,
      },
    });
  } catch (err) {
    next(err);
  }
};

/* =======================
   PUBLIC (APPROVED ONLY)
======================= */
export const findAllApproved = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 12;
    const { categoryId, search } = req.query;

    const result = await ArticleService.getArticles({
      page,
      limit,
      categoryId: categoryId ? Number(categoryId) : null,
      search: search?.trim() || null,
      isPublic: true, // ⬅️ INI YANG PENTING
    });

    res.json({
      page,
      limit,
      total: result.total,
      data: result.data,
    });
  } catch (err) {
    next(err);
  }
};

export const findApprovedById = async (req, res, next) => {
  try {
    const article = await ArticleService.getPublicArticleById(req.params.id);

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    res.json(article);
  } catch (err) {
    next(err);
  }
};


/* =======================
   UPDATE & DELETE
======================= */
export const update = async (req, res, next) => {
  try {
    const article = await ArticleService.getArticleById(req.params.id);
    if (!article) return res.status(404).json({ message: "Article not found" });

    if (article.user_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { title, content, category_id } = req.body || {};
    const cover_image = req.file
      ? `/uploads/articles/${req.file.filename}`
      : undefined;

    if (!title || !content || !category_id) {
      return res.status(400).json({
        message: "title, content, category_id are required",
      });
    }

    const updated = await ArticleService.updateArticle({
      id: req.params.id,
      title,
      content,
      category_id,
      cover_image,
    });

    res.json({ message: "Article updated", article: updated });
    await safeLog({
      user_id: req.user.id,
      action: "UPDATE_ARTICLE",
      metadata: {
        article_id: Number(req.params.id),
        before: {
          title: article.title,
          category_id: article.category_id,
          status: article.status,
        },
        after: {
          title,
          category_id,
          status: updated?.status ?? article.status,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// src/controllers/article.controller.js
export const remove = async (req, res, next) => {
  try {
    const article = await ArticleService.getArticleById(req.params.id);
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    const isOwner = Number(article.user_id) === Number(req.user.id);
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const ok = isAdmin
      ? await ArticleService.deleteArticleAdmin(req.params.id)
      : await ArticleService.deleteArticle(req.params.id, req.user.id);

    if (!ok) {
      return res.status(400).json({ message: "Failed to delete article" });
    }

    res.json({ message: "Article deleted" });

    await safeLog({
      user_id: req.user.id,
      action: "DELETE_ARTICLE",
      metadata: {
        article_id: Number(req.params.id),
        title: article.title,
        status: article.status,
        deleted_by: isAdmin ? "admin" : "owner",
        owner_user_id: Number(article.user_id),
      },
    });
  } catch (err) {
    next(err);
  }
};

/* =======================
   ADMIN / MODERATOR
======================= */
export const findAllAdmin = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const { categoryId, status } = req.query;

    const result = await ArticleService.getArticles({
      page,
      limit,
      categoryId,
      status, // pending | approved | rejected
    });

    res.json({
      page,
      limit,
      total: result.total,
      data: result.data,
    });
  } catch (err) {
    next(err);
  }
};

export const approve = async (req, res, next) => {
  try {
    const article = await ArticleService.updateStatus({
      id: req.params.id,
      status: "approved",
    });

    res.json({ message: "Article approved", article });

    await safeLog({
      user_id: req.user.id,
      action: "APPROVE_ARTICLE",
      metadata: {
        article_id: Number(req.params.id),
        status: "approved",
      },
    });
  } catch (err) {
    next(err);
  }
};

export const reject = async (req, res, next) => {
  try {
    const { reason } = req.body;

    if (!reason || reason.length < 5) {
      return res.status(400).json({ message: "Rejection reason is required" });
    }

    const article = await ArticleService.rejectArticle({
      id: req.params.id,
      reason,
    });

    res.json({ message: "Article rejected", article });

    await safeLog({
      user_id: req.user.id,
      action: "REJECT_ARTICLE",
      metadata: {
        article_id: Number(req.params.id),
        status: "rejected",
        reason,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const findMyArticles = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const { status } = req.query;

    const result = await ArticleService.getArticlesByUser({
      user_id: req.user.id,
      page,
      limit,
      status,
    });

    res.json({
      page,
      limit,
      total: result.total,
      data: result.data,
    });
  } catch (err) {
    next(err);
  }
};

export const findByIdAuth = async (req, res, next) => {
  try {
    const article = await ArticleService.getArticleById(req.params.id);

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    // Approved: boleh tampil
    if (article.status === "approved") return res.json(article);

    // Pending/Rejected: hanya owner atau admin/moderator
    const isOwner = Number(article.user_id) === Number(req.user.id);
    const isAdminOrMod = ["admin", "moderator"].includes(req.user.role);

    if (!isOwner && !isAdminOrMod) {
      return res.status(403).json({ message: "Forbidden" });
    }

    return res.json(article);
  } catch (err) {
    next(err);
  }
};
