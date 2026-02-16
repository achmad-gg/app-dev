import axios from './axios'

export const requestActivationApi = (reason) => {
  return axios.post('/activation/request', { reason })
}

export const getActivationRequestsApi = () => {
  return axios.get('/activation')
}

export const approveActivationApi = (id) => {
  return axios.patch(`/activation/approve/${id}`)
}
