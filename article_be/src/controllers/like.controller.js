// src/controllers/like.controller.js
import * as LikeService from "../services/like.service.js";

const ensureApproved = async (articleId) => {
  const status = await LikeService.getArticleStatus(articleId);

  if (!status) {
    // artikel tidak ada
    return { ok: false, code: 404, message: "Article not found" };
  }

  if (status !== "approved") {
    // artikel ada tapi belum approved
    return {
      ok: false,
      code: 403,
      message: "Like hanya bisa untuk artikel yang sudah approved",
    };
  }

  return { ok: true };
};

export const like = async (req, res, next) => {
  try {
    const check = await ensureApproved(req.params.articleId);
    if (!check.ok)
      return res.status(check.code).json({ message: check.message });

    await LikeService.likeArticle(req.user.id, req.params.articleId);
    res.json({ message: "Article liked" });

    await logActivity({
      user_id: req.user.id,
      action: "LIKE_ARTICLE",
      metadata: { article_id: req.params.articleId },
    });
  } catch (err) {
    next(err);
  }
};

export const unlike = async (req, res, next) => {
  try {
    const check = await ensureApproved(req.params.articleId);
    if (!check.ok)
      return res.status(check.code).json({ message: check.message });

    await LikeService.unlikeArticle(req.user.id, req.params.articleId);
    res.json({ message: "Article unliked" });

    await logActivity({
      user_id: req.user.id,
      action: "UNLIKE_ARTICLE",
      metadata: { article_id: req.params.articleId },
    });
  } catch (err) {
    next(err);
  }
};

export const status = async (req, res, next) => {
  try {
    const check = await ensureApproved(req.params.articleId);
    if (!check.ok)
      return res.status(check.code).json({ message: check.message });

    const liked = await LikeService.isArticleLikedByUser(
      req.user.id,
      req.params.articleId,
    );
    res.json({ liked });
  } catch (err) {
    next(err);
  }
};

export const count = async (req, res, next) => {
  try {
    // public endpoint: kalau pending/rejected -> jangan bocorin, balikin 404
    const status = await LikeService.getArticleStatus(req.params.articleId);
    if (!status || status !== "approved") {
      return res.status(404).json({ message: "Article not found" });
    }

    const total = await LikeService.countLikes(req.params.articleId);
    res.json({ total });
  } catch (err) {
    next(err);
  }
};
