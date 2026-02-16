import { defineStore } from 'pinia'
import {
  fetchMyArticlesApi,
  createArticleApi,
  updateArticleApi,
  deleteArticleApi,
} from '@/api/article.user.api'

const toNum = (v) => (typeof v === 'string' ? Number(v) : v)
const toMsg = (err) => err?.response?.data?.message || err?.message || 'Network / server error'

export const useMyArticleStore = defineStore('my-article', {
  state: () => ({
    articles: [],
    pagination: { page: 1, limit: 10, total: 0 },
    filters: {
      status: null, // draft | published | archived
    },
    loading: { list: false, create: false, update: false, delete: false },
    error: null,
  }),

  getters: {
    isEmpty: (s) => !s.loading.list && s.articles.length === 0,
    totalPages: (s) => Math.ceil(s.pagination.total / s.pagination.limit),
  },

  actions: {
    async fetchMyArticles(overrides = {}) {
      this.loading.list = true
      this.error = null

      const page = overrides.page ?? this.pagination.page
      const status = overrides.status ?? this.filters.status

      try {
        const res = await fetchMyArticlesApi({
          page,
          limit: this.pagination.limit,
          status,
        })

        this.articles = res.data?.data || []
        this.pagination.total = Number(res.data?.total || 0)
        this.pagination.page = page
        this.filters.status = status
      } catch (err) {
        this.error = toMsg(err)
        this.articles = []
        this.pagination.total = 0
        throw err
      } finally {
        this.loading.list = false
      }
    },

    async createArticle(payload) {
      this.loading.create = true
      this.error = null
      try {
        const res = await createArticleApi(payload)

        // optimistic prepend (seperti punyamu)
        if (this.pagination.page === 1) {
          this.articles.unshift(res.data)
          this.pagination.total++
        }
        return res.data
      } catch (err) {
        this.error = toMsg(err)
        throw err
      } finally {
        this.loading.create = false
      }
    },

    async updateArticle(id, payload) {
      this.loading.update = true
      this.error = null

      const nid = toNum(id)
      const snapshot = [...this.articles]
      const index = this.articles.findIndex((a) => toNum(a.id) === nid)

      if (index === -1) {
        this.loading.update = false
        throw new Error('Article not found in local state')
      }

      // optimistic update
      this.articles[index] = { ...this.articles[index], ...payload }

      try {
        const res = await updateArticleApi(nid, payload)
        this.articles[index] = res.data
        return res.data
      } catch (err) {
        this.articles = snapshot
        this.error = toMsg(err)
        throw err
      } finally {
        this.loading.update = false
      }
    },

    async deleteArticle(id) {
      this.loading.delete = true
      this.error = null

      const nid = toNum(id)
      const snapshot = [...this.articles]

      // optimistic remove
      this.articles = this.articles.filter((a) => toNum(a.id) !== nid)
      this.pagination.total = Math.max(0, this.pagination.total - 1)

      try {
        await deleteArticleApi(nid)

        // refill UI kalau list jadi kosong / terlalu sedikit (logika kamu tetap dipertahankan)
        if (this.articles.length === 0 && this.pagination.total > 0) {
          const prevPage = Math.max(1, this.pagination.page - 1)
          await this.fetchMyArticles({ page: prevPage })
        } else if (this.articles.length < this.pagination.limit / 2) {
          await this.fetchMyArticles({ page: this.pagination.page })
        }
      } catch (err) {
        this.articles = snapshot
        this.pagination.total++
        this.error = toMsg(err)
        throw err
      } finally {
        this.loading.delete = false
      }
    },

    setPage(page) {
      if (page === this.pagination.page) return
      this.fetchMyArticles({ page })
    },

    setStatus(status) {
      this.fetchMyArticles({ page: 1, status })
    },

    reset() {
      this.articles = []
      this.pagination = { page: 1, limit: 10, total: 0 }
      this.filters = { status: null }
      // FIX: jangan sampai update/delete hilang (punyamu sebelumnya cuma list/create) :contentReference[oaicite:4]{index=4}
      this.loading = { list: false, create: false, update: false, delete: false }
      this.error = null
    },
  },
})
