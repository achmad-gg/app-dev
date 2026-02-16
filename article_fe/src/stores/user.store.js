import { defineStore } from 'pinia'
import {
  requestActivationApi,
  getMyActivationStatusApi,
} from '@/api/activation.api'

const unwrap = (res) => res?.data?.data ?? res?.data ?? res

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null, // data login user
    activationRequest: null,
    loading: {
      activation: false,
      status: false,
    },
    error: null,
  }),

  getters: {
    isBanned: (s) => s.user?.status === 'banned',
    isSuspended: (s) => s.user?.status === 'suspended',
    isActive: (s) => s.user?.status === 'active',
    hasPendingActivation: (s) =>
      s.activationRequest?.status === 'pending',
  },

  actions: {
    setUser(data) {
      this.user = data
    },

    async requestActivation(reason) {
      this.loading.activation = true
      this.error = null

      try {
        const res = await requestActivationApi(reason)
        const data = unwrap(res)

        this.activationRequest = data

        return data
      } catch (err) {
        this.error =
          err?.response?.data?.message || 'Failed to request activation'
        throw err
      } finally {
        this.loading.activation = false
      }
    },

    async fetchMyActivationStatus() {
      this.loading.status = true
      this.error = null

      try {
        const res = await getMyActivationStatusApi()
        this.activationRequest = unwrap(res)
      } catch (err) {
        this.activationRequest = null
      } finally {
        this.loading.status = false
      }
    },

    clearActivation() {
      this.activationRequest = null
    },
  },
})
