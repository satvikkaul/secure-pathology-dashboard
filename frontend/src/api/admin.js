import request from './client'

export const listPending = () => request('/admin/pending')

export const approveUser = (email) =>
  request('/admin/approve', { method: 'POST', body: JSON.stringify({ email }) })
