import api from './axios'

export const fetchCommentsApi = (articleId) => api.get(`/comments/article/${articleId}`)
export const createCommentApi = (articleId, data) => api.post(`/comments/article/${articleId}`, data)
