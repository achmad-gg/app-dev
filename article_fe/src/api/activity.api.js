// src/api/activity.api.js
import api from '@/api/axios'

// GET /api/activity  (kalau di axios baseURL sudah /api)
export const getActivityLogs = (params = {}) => {
  return api.get('/activity', { params })
}
