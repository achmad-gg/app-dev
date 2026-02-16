import { defineStore } from 'pinia'
import api from '@/api/axios'

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: [],
    loading: false,
  }),

  getters: {
    unreadCount: (s) => s.notifications.filter((n) => !n.is_read).length,
  },

  actions: {
    async fetchMyNotifications() {
      this.loading = true
      try {
        const res = await api.get('/notifications')
        this.notifications = res.data || []
      } finally {
        this.loading = false
      }
    },

    async markAllAsRead(id) {
      await api.patch(`/notifications/${id}/read`)
      const n = this.notifications.find((n) => n.id === id)
      if (n) n.is_read = true
    },

    async clearAll() {
      await api.delete('/notifications')
      this.notifications = []
    },

    async deleteNotification(id) {
      await api.delete(`/notifications/${id}`)
      this.notifications = this.notifications.filter((n) => n.id !== id)
    },
  },
})
