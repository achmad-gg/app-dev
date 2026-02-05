// src/stores/activity.store.js
import { defineStore } from 'pinia'
import { getActivityLogs } from '@/api/activity.api'

export const useActivityStore = defineStore('activity', {
  state: () => ({
    activities: [],
    loading: false,
    error: null,

    // optional: kalau backend mendukung pagination
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
    },

    // optional: filter (misal action=LIKE_ARTICLE, user_id, dll)
    filters: {
      action: '',
      user_id: null,
      article_id: null,
    },
  }),

  getters: {
    hasData: (s) => Array.isArray(s.activities) && s.activities.length > 0,
  },

  actions: {
    setPage(page) {
      this.pagination.page = page
    },

    setLimit(limit) {
      this.pagination.limit = limit
    },

    setFilters(partial) {
      this.filters = { ...this.filters, ...partial }
    },

    clearError() {
      this.error = null
    },

    clearActivities() {
      this.activities = []
      this.pagination.total = 0
    },

    async fetchActivity(params = {}) {
      this.loading = true
      this.error = null

      try {
        // gabung params dari caller + pagination + filters
        const query = {
          page: this.pagination.page,
          limit: this.pagination.limit,
          ...this.filters,
          ...params,
        }

        // buang filter kosong biar query bersih
        Object.keys(query).forEach((k) => {
          const v = query[k]
          if (v === '' || v === null || v === undefined) delete query[k]
        })

        const res = await getActivityLogs(query)

        /**
         * Support 2 tipe response:
         * A) { data: [...], total, page, limit }
         * B) langsung array: [...]
         */
        if (Array.isArray(res.data)) {
          this.activities = res.data
          this.pagination.total = res.data.length
          return this.activities
        }

        this.activities = res.data?.data || []
        this.pagination.total = res.data?.total ?? 0
        this.pagination.page = res.data?.page ?? this.pagination.page
        this.pagination.limit = res.data?.limit ?? this.pagination.limit

        return this.activities
      } catch (err) {
        console.error('Failed to fetch activity logs:', err)

        const status = err?.response?.status
        const msg =
          err?.response?.data?.message ||
          (status ? `Request failed (${status})` : 'Network / server error')

        this.error = msg
        this.activities = []
        this.pagination.total = 0

        // kalau mau di-handle di component, biarkan throw
        throw err
      } finally {
        this.loading = false
      }
    },
  },
})
