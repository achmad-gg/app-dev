import { defineStore } from 'pinia'
import { fetchCommentsApi, createCommentApi } from '../api/comment.api'

export const useCommentStore = defineStore('comment', {
  state: () => ({
    comments: [],
    loading: false,
  }),

  actions: {
    async fetchComments(articleId) {
      this.loading = true
      try {
        const res = await fetchCommentsApi(articleId)
        this.comments = res.data || []
      } catch (err) {
        const code = err?.response?.status
        if (code === 404) {
          this.comments = []
          return
        }
        throw err
      } finally {
        this.loading = false
      }
    },

    async addComment(articleId, content, parentId = null) {
      this.loading = true
      try {
        await createCommentApi(articleId, { content, parent_id: parentId })
        await this.fetchComments(articleId)
      } finally {
        this.loading = false
      }
    },
  },
})
