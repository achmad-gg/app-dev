import { defineStore } from 'pinia'
import { fetchArticlesApi, fetchArticleDetailApi, createArticleApi } from '../api/article.api'

export const useArticleStore = defineStore('article', {
  state: () => ({
    articles: [],
    articleDetail: null,
    pagination: {
      page: 1,
      total: 0,
      limit: 10,
    },
    loading: {
      list: false,
      detail: false,
      create: false,
    },
  }),

  actions: {
    async fetchArticles(params = {}) {
      this.loading = true
      try {
        const res = await fetchArticlesApi({
          page: this.pagination.page,
          limit: this.pagination.limit,
          ...params,
        })
        // fallback aman
        this.articles = res.data?.data || []
        this.pagination.total = res.data?.total || 0
      } catch (err) {
        console.error(err)
        this.articles = [] // tetap reset kalau error
        this.pagination.total = 0
      } finally {
        this.loading = false
      }
    },

    async fetchArticleDetail(id) {
      this.loading = true
      try {
        const res = await fetchArticleDetailApi(id)
        this.articleDetail = res.data || null
      } catch (err) {
        console.error(err)
        this.articleDetail = null
      } finally {
        this.loading = false
      }
    },

    async createArticle(payload) {
      this.loading = true
      try {
        const res = await createArticleApi(payload)
        return res.data
      } catch (err) {
        // lempar error mentah ke caller
        throw err
      } finally {
        this.loading = false
      }
    },

    clearDetail() {
      this.articleDetail = null
    },

    setPage(page) {
      this.pagination.page = page
      this.fetchArticles()
    },
  },
})
