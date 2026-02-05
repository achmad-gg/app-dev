// src/stores/like.store.js
import { defineStore } from 'pinia'
import api from '@/api/axios'

export const useLikeStore = defineStore('like', {
  state: () => ({
    count: 0,
    liked: false,
    fetching: false,
    toggling: false,
  }),

  actions: {
    async fetchStatus(articleId) {
      try {
        const { data } = await api.get(`/likes/${articleId}/status`)
        this.liked = data.liked
      } catch {
        this.liked = false
      }
    },
    async fetchInitial(articleId) {
      this.fetching = true
      try {
        const [{ data: count }, { data: status }] = await Promise.all([
          api.get(`/likes/${articleId}/count`),
          api.get(`/likes/${articleId}/status`),
        ])
        this.count = count.total
        this.liked = status.liked
      } finally {
        this.fetching = false
      }
    },

    async like(articleId) {
      if (this.toggling) return
      this.toggling = true
      try {
        await api.post(`/likes/${articleId}`)
        this.liked = true
        this.count++
      } finally {
        this.toggling = false
      }
    },

    async unlike(articleId) {
      if (this.toggling) return
      this.toggling = true
      try {
        await api.delete(`/likes/${articleId}`)
        this.liked = false
        this.count = Math.max(0, this.count - 1)
      } finally {
        this.toggling = false
      }
    },

    async toggle(articleId) {
      if (this.liked) {
        await this.unlike(articleId)
      } else {
        await this.like(articleId)
      }
    },
  },
})
