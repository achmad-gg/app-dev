// stores/profile.store.js
import { defineStore } from 'pinia'
import {
  getProfileApi,
  getMyArticlesApi,
  updateProfileApi,
  uploadAvatarApi,
  deleteAvatarApi,
} from '../api/profile.api'
import api from '@/api/axios'

export const useProfileStore = defineStore('profile', {
  state: () => ({
    profile: null,
    myArticles: [],
    loading: false,
  }),

  actions: {
    async fetchProfile() {
      this.loading = true
      try {
        const res = await getProfileApi()
        this.profile = res.data
      } finally {
        this.loading = false
      }
    },

    async fetchMyArticles() {
      const res = await getMyArticlesApi()
      this.myArticles = res.data.data || res.data
    },

    async updateProfile(payload) {
      const res = await updateProfileApi(payload)
      this.profile = { ...this.profile, ...res.data.user }
    },

    async uploadAvatar(file) {
      const formData = new FormData()
      formData.append('avatar', file)

      const res = await uploadAvatarApi(formData)
      this.profile.avatar = res.data.avatar
    },

    async deleteAvatar() {
      await deleteAvatarApi()
      this.profile.avatar = null
    },
    async changePassword({ old_password, new_password }) {
      if (!old_password || !new_password) {
        throw new Error('Password required')
      }

      await changePasswordApi({
        old_password,
        new_password,
      })
    },
  },
})
