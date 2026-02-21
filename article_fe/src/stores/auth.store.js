import { defineStore } from 'pinia'
import api from '../api/axios'
import { loginApi, registerApi, getProfileApi } from '../api/auth.api'
import { useNotificationStore } from './notification.store'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token'),
    user: null,
    initialized: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
    role: (state) => state.user?.role || 'guest',
    isAdmin: (state) => state.user?.role === 'admin',
  },

  actions: {
    async login(payload) {
      const res = await loginApi(payload)
      this.setToken(res.data.token)
      await this.fetchProfile()
    },

    async register(payload) {
      const body = {
        name: (payload?.name || '').trim(),
        email: (payload?.email || '').trim(),
        password: payload?.password || ''.trim(),
        fullname: (payload?.fullname || '').trim(),
      }

      const res = await registerApi(body)

      if (res.data?.token) {
        this.setToken(res.data.token)
        await this.fetchProfile()
        return
      }

      await this.login({
        email: body.email,
        password: body.password,
      })
    },

    async fetchProfile() {
      if (!this.token) {
        this.initialized = true
        return
      }

      try {
        const res = await getProfileApi()
        this.user = res.data
      } catch (err) {
        // ❌ auth gagal = logout
        this.logout()
        return
      }

      // ⬇️ notif gagal TIDAK BOLEH menggagalkan login
      try {
        const notificationStore = useNotificationStore()
        await notificationStore.fetchMyNotifications()
      } catch (err) {
        console.warn('Notification fetch failed', err)
      } finally {
        this.initialized = true
      }
    },
    setToken(token) {
      this.token = token
      localStorage.setItem('token', token)
      api.defaults.headers.common.Authorization = `Bearer ${token}`
    },

    logout() {
      this.user = null
      this.token = null
      this.initialized = true

      const notificationStore = useNotificationStore()
      notificationStore.$reset()

      delete api.defaults.headers.common.Authorization
      localStorage.removeItem('token')
    },

    async initAuth() {
      const token = localStorage.getItem('token')

      if (!token) {
        this.user = null
        this.token = null
        this.initialized = true
        return
      }

      this.token = token
      api.defaults.headers.common.Authorization = `Bearer ${token}`

      await this.fetchProfile()
    },
  },
})
