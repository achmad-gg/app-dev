import axios from './axios'

export const getDashboardStatsApi = () =>
  axios.get('/admin/stats')

export const getUsersApi = () =>
  axios.get('/admin/users')

export const toggleUserStatusApi = (id, is_active) =>
  axios.patch(`/admin/users/${id}/status`, { is_active })

export const getPendingArticlesApi = () =>
  axios.get('/admin/articles/pending')

export const approveArticleApi = (id) =>
  axios.patch(`/articles/${id}/approve`)

export const rejectArticleApi = (id) =>
  axios.patch(`/articles/${id}/reject`)
