import { defineStore } from 'pinia'
import { fetchCommentsApi, createCommentApi } from '../api/comment.api'

export const useCommentStore = defineStore('comment', {
  state: () => ({
    comments: [],
    loading: false,
  }),

  actions: {
    async fetchComments(articleId) {
      const res = await fetchCommentsApi(articleId)
      this.comments = res.data
    },

    async addComment(articleId, content) {
      this.loading = true
      try {
        await createCommentApi(articleId, { content })
        await this.fetchComments(articleId)
      } finally {
        this.loading = false
      }
    },
  },
})
