import { defineStore } from 'pinia'
import api from '../api/axios'
import { loginApi, registerApi, getProfileApi } from '../api/auth.api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token'),
    user: null,
    initialized: false,
  }),

  getters: {
    isAuthenticated: (s) => !!s.token && !!s.user,
    role: (s) => s.user?.role || 'guest',
    isAdmin: (s) => s.user?.role === 'admin',
  },

  actions: {
    async login(payload) {
      const res = await loginApi(payload)
      this.setToken(res.data.token)
      await this.fetchProfile()
    },

    async register(payload) {
      const body = {
        email: (payload?.email || '').trim(),
        password: payload?.password || '',
        fullname: (payload?.fullname || '').trim(),
      }

      const res = await registerApi(body)

      // kalau backend return token (recommended)
      if (res.data?.token) {
        this.setToken(res.data.token)
        await this.fetchProfile()
        return
      }

      // fallback: kalau register tidak return token, login ulang
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
      } catch {
        this.logout()
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
