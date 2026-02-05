import api from './axios'

export const fetchCategoriesApi = () => {
  return api.get('/categories')
}
