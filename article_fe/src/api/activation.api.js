import axios from './axios'

export const requestActivationApi = (reason) => {
  return axios.post('/activation/request', { reason })
}

export const getActivationRequestsApi = () => {
  return axios.get('/activation/activation-requests')
}

export const approveActivationApi = (id) => {
  return axios.patch(`/activation/approve/${id}`)
}

export const rejectActivationApi = (id) => {
  return axios.patch(`/activation/reject/${id}`)
}