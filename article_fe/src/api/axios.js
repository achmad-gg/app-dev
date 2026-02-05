// axios.js
import axios from 'axios'
import { useAuthStore } from '../stores/auth.store'

const api = axios.create({
  baseURL: 'http://localhost:3000/api',

})

api.interceptors.request.use((config) => {
  const authStore = useAuthStore()
  const token = authStore.token || localStorage.getItem('token')
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
