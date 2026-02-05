import api from './axios'

export const fetchMyArticlesApi = (params = {}) =>
  api.get('/articles/my', { params })

export const createArticleApi = (payload) =>
  api.post('/articles/create', payload)

export const updateArticleApi = (id, payload) =>
  api.put(`/articles/${id}`, payload)

export const deleteArticleApi = (id) =>
  api.delete(`/articles/${id}`)
