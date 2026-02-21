import axios from './axios'

export const getDashboardStatsApi = () => axios.get('/admin/stats')

export const getUsersApi = (params) =>
  axios.get('/admin/users', { params })


export const toggleUserStatusApi = (id, is_active) =>
  axios.patch(`/admin/users/${id}/status`, { is_active })

export const getPendingArticlesApi = () => axios.get('/admin/articles/pending')

// export const approveArticleApi = (id) =>
//   axios.patch(`/articles/${id}/approve`)

// export const rejectArticleApi = (id) =>
//   axios.patch(`/articles/${id}/reject`)

export const getAllArticlesAdminApi = (params = {}) => axios.get('/articles/admin/list', { params })

// approve/reject: sesuai routes kamu
export const approveArticleApi = (id) => axios.patch(`/articles/${id}/approve`)
export const rejectArticleApi = (id, payload) => axios.patch(`/articles/${id}/reject`, payload)

export const deleteArticleAdminApi = (id, reason) =>
  axios.delete(`/articles/${id}`, { data: { reason } })


