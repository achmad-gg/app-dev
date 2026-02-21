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
import { blockUserApi, activateUserApi, fetchActivationRequestsApi } from '@/api/user.api'
import { approveActivationApi, rejectActivationApi } from '@/api/activation.api'

// normalize: support res.data.data atau res.data
const unwrap = (res) => res?.data?.data ?? res?.data ?? res

export const useAdminStore = defineStore('admin', {
  state: () => ({
    stats: null,
    users: [],
    usersMeta: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 1,
    },
    activationRequests: [],

    // ✅ list admin: semua artikel
    articles: [],
    articlesMeta: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 1,
    },
    filters: {
      status: 'all', // all | pending | approved | rejected
    },

    // (opsional) list khusus pending (kalau masih dipakai di halaman lain)
    pendingArticles: [],

    loading: {
      global: false,
      users: false,
      approve: false,
      reject: false,
      delete: false,
    },
    error: null,
  }),

  getters: {
    pendingCount: (s) => s.pendingArticles.length,
    articlesCount: (s) => s.articles.length,
    usersCount: (s) => s.usersMeta.total,
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
        const [statsRes, pendingRes] = await Promise.all([
          getDashboardStatsApi(),
          getPendingArticlesApi(),
        ])

        this.stats = unwrap(statsRes) ?? null
        this.pendingArticles = Array.isArray(unwrap(pendingRes)) ? unwrap(pendingRes) : []
      })
    },

    async fetchUsers(page = 1, limit = 10) {
      const res = await getUsersApi({ page, limit })

      const payload = res.data // ⬅ ambil layer yang benar

      this.users = Array.isArray(payload.data) ? payload.data : []

      this.usersMeta = {
        page: payload.page,
        limit: payload.limit,
        total: payload.total,
        totalPages: payload.totalPages,
      }
    },

    async fetchPendingArticles() {
      return this.withLoading('global', async () => {
        const res = await getPendingArticlesApi()
        const pending = unwrap(res)
        this.pendingArticles = Array.isArray(pending) ? pending : []
      })
    },

    async fetchArticles(status = 'all') {
      return this.withLoading('global', async () => {
        const params = {
          page: this.articlesMeta.page ?? 1,
          limit: this.articlesMeta.limit ?? 10,
        }

        if (status !== 'all') {
          params.status = status
        }

        const res = await getAllArticlesAdminApi(params)

        console.log('ADMIN ARTICLES RAW:', res?.data)

        const payload = res?.data ?? {}

        // Pastikan articles selalu array
        this.articles = Array.isArray(payload.data) ? payload.data : []

        // Defensive assignment
        const page = Number(payload.page) || 1
        const limit = Number(payload.limit) || 10
        const total = Number(payload.total) || 0

        this.articlesMeta.page = page
        this.articlesMeta.limit = limit
        this.articlesMeta.total = total
        this.articlesMeta.totalPages = limit > 0 ? Math.ceil(total / limit) : 1

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

    async deleteArticle(id, reason) {
      return this.withLoading('delete', async () => {
        await deleteArticleAdminApi(id, reason)

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
    async blockUser(userId, reason) {
      const res = await blockUserApi(userId, reason)

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

    async fetchActivationRequests() {
      const res = await fetchActivationRequestsApi()
      const data = unwrap(res)

      this.activationRequests = Array.isArray(data)
        ? data
        : Array.isArray(data?.requests)
          ? data.requests
          : []
    },

    async approveActivationRequest(id) {
      await approveActivationApi(id)
      await this.fetchActivationRequests()
    },

    async rejectActivationRequest(id) {
      await rejectActivationApi(id)
      await this.fetchActivationRequests()
    },
  },
})
