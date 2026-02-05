// src/controllers/like.controller.js
import * as LikeService from "../services/like.service.js";

export const like = async (req, res, next) => {
  try {
    await LikeService.likeArticle(req.user.id, req.params.articleId);
    res.json({ message: "Article liked" });
    await logActivity({
      user_id: req.user.id,
      action: "LIKE_ARTICLE",
      metadata: {
        article_id: req.params.articleId,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const unlike = async (req, res, next) => {
  try {
    await LikeService.unlikeArticle(req.user.id, req.params.articleId);
    res.json({ message: "Article unliked" });
    await logActivity({
      user_id: req.user.id,
      action: "UNLIKE_ARTICLE",
      metadata: {
        article_id: req.params.articleId,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const status = async (req, res, next) => {
  try {
    const liked = await LikeService.isArticleLikedByUser(
      req.user.id,
      req.params.articleId
    )
    res.json({ liked })
  } catch (err) {
    next(err)
  }
}


export const count = async (req, res, next) => {
  try {
    const total = await LikeService.countLikes(req.params.articleId);
    res.json({ total });
  } catch (err) {
    next(err);
  }
};
