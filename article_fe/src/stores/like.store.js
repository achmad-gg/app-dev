// src/stores/like.store.js
import { defineStore } from 'pinia'
import { getLikeCountApi, getLikeStatusApi, likeApi, unlikeApi } from '@/api/like.api'

export const useLikeStore = defineStore('like', {
  state: () => ({
    count: 0,
    liked: false,
    fetching: false,
    toggling: false,
  }),

  actions: {
    async fetchInitial(articleId, { isAuthenticated } = { isAuthenticated: false }) {
      this.fetching = true
      try {
        // count selalu public
        const promises = [getLikeCountApi(articleId)]

        // status hanya kalau login (biar nggak spam 403 di console)
        if (isAuthenticated) promises.push(getLikeStatusApi(articleId))

        const results = await Promise.allSettled(promises)

        // count
        if (results[0].status === 'fulfilled') {
          this.count = Number(results[0].value.data?.total ?? 0)
        } else {
          const code = results[0].reason?.response?.status
          if (code === 404) this.count = 0
          else throw results[0].reason
        }

        // status (opsional)
        if (isAuthenticated) {
          const r = results[1]
          if (r?.status === 'fulfilled') this.liked = !!r.value.data?.liked
          else this.liked = false
        } else {
          this.liked = false
        }
      } finally {
        this.fetching = false
      }
    },

    async like(articleId) {
      if (this.toggling) return
      this.toggling = true
      try {
        await likeApi(articleId)
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
        await unlikeApi(articleId)
        this.liked = false
        this.count = Math.max(0, this.count - 1)
      } finally {
        this.toggling = false
      }
    },

    async toggle(articleId) {
      if (this.liked) return this.unlike(articleId)
      return this.like(articleId)
    },
  },
})
