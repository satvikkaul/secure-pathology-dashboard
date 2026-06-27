import request from './client'

export function listImages() {
  return request('/images/')
}

export function getImage(id) {
  return request(`/images/${id}`)
}

export function uploadImage(file) {
  const form = new FormData()
  form.append('file', file)
  return request('/images/', { method: 'POST', body: form })
}
