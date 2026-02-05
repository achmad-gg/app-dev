// src/api/like.api.js
import api from './axios'

export const getLikeCountApi = (articleId) => api.get(`/likes/${articleId}/count`)
export const getLikeStatusApi = (articleId) => api.get(`/likes/${articleId}/status`) // butuh auth

export const likeApi = (articleId) => api.post(`/likes/${articleId}`)
export const unlikeApi = (articleId) => api.delete(`/likes/${articleId}`)
