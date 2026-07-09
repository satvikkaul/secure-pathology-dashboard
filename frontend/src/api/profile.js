import request from './client'

export const getProfile = () => request('/profile/me')

export const updateProfile = (data) =>
  request('/profile/me', { method: 'PUT', body: JSON.stringify(data) })

export const lockOrg = (data) =>
  request('/profile/me/lock-org', { method: 'POST', body: JSON.stringify(data) })
