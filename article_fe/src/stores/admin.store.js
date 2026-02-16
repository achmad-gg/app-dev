import { defineStore } from 'pinia'
import {
  getDashboardStatsApi,
  getUsersApi,
  toggleUserStatusApi,
  getAllArticlesAdminApi,
  getPendingArticlesApi,
  approveArticleApi,
  rejectArticleApi,
  deleteArticleAdminApi,
} from '@/api/admin.api'
import { blockUserApi, activateUserApi } from '@/api/user.api'

// normalize: support res.data.data atau res.data
const unwrap = (res) => res?.data?.data ?? res?.data ?? res

export const useAdminStore = defineStore('admin', {
  state: () => ({
    stats: null,
    users: [],

    // ✅ list admin: semua artikel
    articles: [],
    filters: {
      status: 'all', // all | pending | approved | rejected
    },

    // (opsional) list khusus pending (kalau masih dipakai di halaman lain)
    pendingArticles: [],

    loading: {
      global: false,
      approve: false,
      reject: false,
      delete: false,
    },
    error: null,
  }),

  getters: {
    pendingCount: (s) => s.pendingArticles.length,
    articlesCount: (s) => s.articles.length,
  },

  actions: {
    async withLoading(key, fn) {
      this.error = null
      this.loading[key] = true
      try {
        return await fn()
      } catch (err) {
        const status = err?.response?.status
        this.error =
          err?.response?.data?.message ||
          (status ? `Request failed (${status})` : 'Network / server error')
        throw err
      } finally {
        this.loading[key] = false
      }
    },

    async fetchDashboard() {
      return this.withLoading('global', async () => {
        const [statsRes, usersRes, pendingRes] = await Promise.all([
          getDashboardStatsApi(),
          getUsersApi(),
          getPendingArticlesApi(),
        ])

        this.stats = unwrap(statsRes) ?? null
        this.users = Array.isArray(unwrap(usersRes)) ? unwrap(usersRes) : []
        this.pendingArticles = Array.isArray(unwrap(pendingRes)) ? unwrap(pendingRes) : []
      })
    },

    async fetchPendingArticles() {
      return this.withLoading('global', async () => {
        const res = await getPendingArticlesApi()
        const pending = unwrap(res)
        this.pendingArticles = Array.isArray(pending) ? pending : []
      })
    },

    // ✅ ambil semua artikel untuk admin page
    async fetchArticles(status = 'all') {
      return this.withLoading('global', async () => {
        const params = {}
        if (status !== 'all') params.status = status

        const res = await getAllArticlesAdminApi(params)

        // ✅ sesuai response findAllAdmin: { data: [...] }
        this.articles = res.data?.data || []
        this.filters.status = status
      })
    },

    async approveArticle(id) {
      return this.withLoading('approve', async () => {
        await approveArticleApi(id)

        // update local
        const idx = this.articles.findIndex((a) => a.id === id)
        if (idx !== -1) this.articles[idx] = { ...this.articles[idx], status: 'approved' }
      })
    },

    async rejectArticle(id, reason = '') {
      return this.withLoading('reject', async () => {
        const finalReason = reason?.trim() || 'Does not meet guidelines'
        await rejectArticleApi(id, { reason: finalReason })

        // update list admin
        const idx = this.articles.findIndex((a) => a.id === id)
        if (idx !== -1) this.articles[idx] = { ...this.articles[idx], status: 'rejected' }

        // remove dari pending list (kalau ada)
        this.pendingArticles = this.pendingArticles.filter((a) => a.id !== id)
      })
    },

    async deleteArticle(id) {
      return this.withLoading('delete', async () => {
        await deleteArticleAdminApi(id)

        // hapus dari semua list
        this.articles = this.articles.filter((a) => a.id !== id)
        this.pendingArticles = this.pendingArticles.filter((a) => a.id !== id)
      })
    },

    async toggleUserStatus(user) {
      return this.withLoading('global', async () => {
        const nextActive = !user.is_active
        const res = await toggleUserStatusApi(user.id, nextActive)
        const updated = unwrap(res)?.user ?? unwrap(res)

        user.is_active = updated?.is_active ?? nextActive

        const idx = this.users.findIndex((u) => u.id === user.id)
        if (idx !== -1) this.users[idx] = { ...this.users[idx], ...updated }
      })
    },
    async blockUser(userId) {
      const res = await blockUserApi(userId)

      // update local state biar reactive
      const index = this.users.findIndex((u) => u.id === userId)
      if (index !== -1) {
        this.users[index] = {
          ...this.users[index],
          ...res.data.user,
        }
      }

      return res.data
    },
    async activateUser(userId) {
      const res = await activateUserApi(userId)

      const index = this.users.findIndex((u) => u.id === userId)
      if (index !== -1) {
        this.users[index] = {
          ...this.users[index],
          ...res.data.user,
        }
      }

      return res.data
    },
  },
})
