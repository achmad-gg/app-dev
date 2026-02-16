// src/stores/article.store.js
import { defineStore } from 'pinia'
import {
  fetchArticlesApi,
  fetchArticleDetailApi,
  fetchArticleDetailPublicApi,
  createArticleApi,
} from '../api/article.api'
import { updateArticleApi } from '@/api/article.user.api'

const unwrapList = (res) => ({
  data: res?.data?.data ?? [],
  total: Number(res?.data?.total ?? 0),
})

export const useArticleStore = defineStore('article', {
  state: () => ({
    articles: [],
    articleDetail: null,
    pagination: { page: 1, total: 0, limit: 12 },
    filters: {
      categoryId: null,
      search: '',
    },
    loading: { list: false, detail: false, create: false, update: false },
    error: null,
  }),

  actions: {
    setCategoryFilter(categoryId) {
      this.filters.categoryId = categoryId
      this.pagination.page = 1
    },

    setSearchFilter(keyword) {
      this.filters.search = keyword
      this.pagination.page = 1
    },

    async fetchArticles(extraParams = {}) {
      this.loading.list = true
      this.error = null

      try {
        const res = await fetchArticlesApi({
          page: this.pagination.page,
          limit: this.pagination.limit,
          ...this.filters,
          ...extraParams,
        })

        const { data, total } = unwrapList(res)
        this.articles = data
        this.pagination.total = total
      } catch (err) {
        this.error = err?.response?.data?.message || err?.message || 'Failed to fetch articles'

        this.articles = []
        this.pagination.total = 0
        throw err
      } finally {
        this.loading.list = false
      }
    },

    async fetchArticleDetail(id, { isPublic = false } = {}) {
      this.loading.detail = true
      this.error = null
      this.articleDetail = null

      try {
        const res = isPublic
          ? await fetchArticleDetailPublicApi(id)
          : await fetchArticleDetailApi(id)

        this.articleDetail = res.data || null
        return this.articleDetail
      } catch (err) {
        this.error =
          err?.response?.data?.message || err?.message || 'Failed to fetch article detail'

        this.articleDetail = null
        throw err
      } finally {
        this.loading.detail = false
      }
    },

    async createArticle(payload) {
      this.loading.create = true
      this.error = null
      try {
        const res = await createArticleApi(payload)
        return res.data
      } catch (err) {
        this.error = err?.response?.data?.message || err?.message || 'Failed to create article'
        throw err
      } finally {
        this.loading.create = false
      }
    },

    async updateArticle(id, payload) {
      this.loading.update = true
      this.error = null
      try {
        const res = await updateArticleApi(id, payload)
        if (this.articleDetail?.id === Number(id) || this.articleDetail?.id === id) {
          this.articleDetail = res.data?.article || res.data
        }
        return res.data
      } catch (err) {
        this.error = err?.response?.data?.message || err?.message || 'Failed to update article'
        throw err
      } finally {
        this.loading.update = false
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
      this.pagination.page--
      this.fetchArticles()
    },

    nextPage() {
      // optional: cek apakah sudah halaman terakhir
      if (this.pagination.page * this.pagination.limit >= this.pagination.total) return
      this.pagination.page++
      this.fetchArticles()
    },
  },
})
