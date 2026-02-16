import api from './axios'

export const fetchArticlesApi = (params = {}) => {
  return api.get('/articles', { params })
}

export const fetchArticleDetailApi = (id) => {
  return api.get(`/articles/${id}`)
}

export const fetchArticleDetailPublicApi = (id) => {
  return api.get(`/articles/public/${id}`)
}

export const createArticleApi = (payload) => {
  return api.post('/articles/create', payload)
}

export const updateArticleApi = (id, payload) => {
  return api.put(`/articles/${id}`, payload)
}