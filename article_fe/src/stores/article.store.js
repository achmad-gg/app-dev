// src/stores/article.store.js
import { defineStore } from 'pinia'
import {
  fetchArticlesApi,
  fetchArticleDetailApi,
  fetchArticleDetailPublicApi,
  createArticleApi,
} from '../api/article.api'
import { updateArticleApi } from '@/api/article.user.api'

export const useArticleStore = defineStore('article', {
  state: () => ({
    articles: [],
    articleDetail: null,
    pagination: { page: 1, total: 0, limit: 10 },
    loading: { list: false, detail: false, create: false },
  }),

  actions: {
    async fetchArticles(params = {}) {
      this.loading.list = true
      try {
        const res = await fetchArticlesApi({
          page: this.pagination.page,
          limit: this.pagination.limit,
          ...params,
        })

        this.articles = res.data?.data || []
        this.pagination.total = Number(res.data?.total || 0)
      } catch (err) {
        console.error(err)
        this.articles = []
        this.pagination.total = 0
      } finally {
        this.loading.list = false
      }
    },

    async fetchArticleDetail(id) {
      this.loading.detail = true
      this.articleDetail = null
      try {
        const res = await fetchArticleDetailApi(id)
        this.articleDetail = res.data || null
        return this.articleDetail
      } catch (err) {
        const status = err?.response?.status
        if (status === 401 || status === 403) {
          const res2 = await fetchArticleDetailPublicApi(id)
          this.articleDetail = res2.data || null
          return this.articleDetail
        }
        this.articleDetail = null
        throw err
      } finally {
        this.loading.detail = false
      }
    },

    async createArticle(payload) {
      this.loading.create = true
      try {
        const res = await createArticleApi(payload)
        return res.data
      } finally {
        this.loading.create = false
      }
    },

    async updateArticle(id, payload) {
      this.loading.create = true // atau bikin loading.update kalau mau lebih rapih
      try {
        const res = await updateArticleApi(id, payload)
        // optional: update articleDetail kalau sedang buka detail yang sama
        if (this.articleDetail?.id === Number(id) || this.articleDetail?.id === id) {
          this.articleDetail = res.data?.article || res.data
        }
        return res.data
      } finally {
        this.loading.create = false
      }
    },

    clearDetail() {
      this.articleDetail = null
    },

    setPage(page) {
      this.pagination.page = page
    },
    prevPage() {
      if (this.pagination.page <= 1) return
      this.setPage(this.pagination.page - 1)
    },
    nextPage() {
      this.setPage(this.pagination.page + 1)
    },
  },
})
