import axios from './axios'

export const blockUserApi = (id) => {
  return axios.patch(`/users/${id}/block`)
}

export const activateUserApi = (id) => {
  return axios.patch(`/users/${id}/activate`)
}
