import api from './axios'

export const fetchCategoriesApi = () => {
  return api.get('/categories')
}

export const createCategoryApi = (payload) => api.post('/categories/create', payload)

export const updateCategoryApi = (id, payload) => api.put(`/categories/${id}`, payload)

export const deleteCategoryApi = (id) => api.delete(`/categories/${id}`)
