import { defineStore } from 'pinia'
import {
  getDashboardStatsApi,
  getUsersApi,
  getPendingArticlesApi,
  approveArticleApi,
  rejectArticleApi,
  toggleUserStatusApi,
} from '@/api/admin.api'

export const useAdminStore = defineStore('admin', {
  state: () => ({
    stats: null,
    users: [],
    pendingArticles: [],
    loading: false,
  }),

  actions: {
    async fetchDashboard() {
      this.loading = true
      try {
        const [stats, users, pending] = await Promise.all([
          getDashboardStatsApi(),
          getUsersApi(),
          getPendingArticlesApi(),
        ])

        this.stats = {
          ...stats.data,
          pendingArticles: pending.data.length,
        }

        this.users = users.data
        this.pendingArticles = pending.data
      } finally {
        this.loading = false
      }
    },
    async fetchPendingArticles() {
      this.loading = true
      try {
        const res = await getPendingArticlesApi()
        this.pendingArticles = res.data.data
      } finally {
        this.loading = false
      }
    },

    async approveArticle(id) {
      await approveArticleApi(id)
      this.pendingArticles = this.pendingArticles.filter((a) => a.id !== id)
    },

    async rejectArticle(id, reason = 'Does not meet guidelines') {
      await rejectArticleApi(id, { reason })
      this.pendingArticles = this.pendingArticles.filter((a) => a.id !== id)
    },

    async toggleUserStatus(user) {
      const res = await toggleUserStatusApi(user.id, !user.is_active)
      user.is_active = res.data.user.is_active
    },

    async fetchActivity() {
      this.loading = true 
      try{
        const res = await getActivityLogs()

      } finally {

      }
    }
  },
})
