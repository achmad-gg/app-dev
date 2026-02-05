import { defineStore } from 'pinia'
import {
  fetchMyArticlesApi,
  createArticleApi,
  updateArticleApi,
  deleteArticleApi,
} from '@/api/article.user.api'

export const useMyArticleStore = defineStore('my-article', {
  state: () => ({
    articles: [],
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
    },
    filters: {
      status: null, // draft | published | archived
    },
    loading: {
      list: false,
      create: false,
      update: false,
      delete: false,
    },
    error: null,
  }),

  getters: {
    isEmpty: (state) => !state.loading.list && state.articles.length === 0,

    totalPages: (state) => Math.ceil(state.pagination.total / state.pagination.limit),
  },

  actions: {
    async fetchMyArticles(overrides = {}) {
      this.loading.list = true
      this.error = null

      // merge state + override (penting untuk pagination/filter)
      const page = overrides.page ?? this.pagination.page
      const status = overrides.status ?? this.filters.status

      try {
        const res = await fetchMyArticlesApi({
          page,
          limit: this.pagination.limit,
          status,
        })

        this.articles = res.data?.data || []
        this.pagination.total = res.data?.total || 0
        this.pagination.page = page
        this.filters.status = status
      } catch (err) {
        this.error = err
        this.articles = []
        this.pagination.total = 0
        console.error(err)
      } finally {
        this.loading.list = false
      }
    },

    async createArticle(payload) {
      this.loading.create = true
      this.error = null

      try {
        const res = await createArticleApi(payload)

        /**
         * Jangan refetch membabi buta.
         * Optimistic prepend untuk UX cepat.
         */
        if (this.pagination.page === 1) {
          this.articles.unshift(res.data)
          this.pagination.total++
        }

        return res.data
      } catch (err) {
        this.error = err
        throw err
      } finally {
        this.loading.create = false
      }
    },

    async updateArticle(id, payload) {
      this.loading.update = true
      this.error = null

      // ambil snapshot untuk rollback jika gagal
      const snapshot = [...this.articles]
      const index = this.articles.findIndex((a) => a.id === id)

      if (index === -1) {
        this.loading.update = false
        throw new Error('Article not found in local state')
      }

      // Optimistic update
      this.articles[index] = { ...this.articles[index], ...payload }

      try {
        const res = await updateArticleApi(id, payload)

        // pastikan state sinkron dengan data dari server
        this.articles[index] = res.data
        return res.data
      } catch (err) {
        // rollback
        this.articles = snapshot
        this.error = 'Failed to update article. Please try again.'
        throw err
      } finally {
        this.loading.update = false
      }
    },

    async deleteArticle(id) {
      this.loading.delete = true
      this.error = null

      const snapshot = [...this.articles]
      // Optimistic update
      this.articles = this.articles.filter((a) => a.id !== id)
      this.pagination.total--

      try {
        await deleteArticleApi(id)

        if (this.articles.length === 0 && this.pagination.total > 0) {
          const prevPage = Math.max(1, this.pagination.page - 1)
          await this.fetchMyArticles({ page: prevPage })
        } else if (this.articles.length < this.pagination.limit / 2) {
          // Opsional: refetch jika data di layar terlalu sedikit setelah delete
          await this.fetchMyArticles({ page: this.pagination.page })
        }
      } catch (err) {
        // Rollback
        this.articles = snapshot
        this.pagination.total++
        this.error = 'Failed to delete article. Please try again.'
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
      this.loading = { list: false, create: false }
      this.error = null
    },
  },
})
