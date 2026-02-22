// axios.js
import axios from 'axios'
import { useAuthStore } from '../stores/auth.store'
import { useLoadingStore } from '../stores/loading.store'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})

api.interceptors.request.use((config) => {
  const authStore = useAuthStore()
  const token = authStore.token || localStorage.getItem('token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  // Global loading: increment pending count
  const loadingStore = useLoadingStore()
  loadingStore.startApi()

  return config
})

api.interceptors.response.use(
  (response) => {
    const loadingStore = useLoadingStore()
    loadingStore.endApi()
    return response
  },
  (error) => {
    const loadingStore = useLoadingStore()
    loadingStore.endApi()
    return Promise.reject(error)
  },
)

export default api
