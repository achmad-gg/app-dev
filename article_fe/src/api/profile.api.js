// api/profile.api.js
import api from './axios'

export const getProfileApi = () => api.get('/profile/me')
export const getMyArticlesApi = () => api.get('/articles/my')

export const updateProfileApi = (payload) =>
  api.put('/profile/me', payload)

export const uploadAvatarApi = (formData) =>
  api.post('/profile/me/avatar', formData)

export const deleteAvatarApi = () =>
  api.delete('/profile/me/avatar')

export const changePasswordApi = (payload) =>
  api.put('/profile/me/password', payload)