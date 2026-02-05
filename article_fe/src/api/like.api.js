import api from './axios'

export const toggleLikeApi = (articleId) =>
  api.post(`/likes/${articleId}`)

export const getLikeCountApi = (articleId) =>
  api.get(`/likes/${articleId}/count`)
