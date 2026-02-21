import axios from './axios'

export const blockUserApi = (id, reason) => {
  return axios.patch(`/users/${id}/block`, { reason })
}

export const activateUserApi = (id) => {
  return axios.patch(`/users/${id}/activate`)
}

export const fetchActivationRequestsApi = () => axios.get('/activation/activation-requests')
