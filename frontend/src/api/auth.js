import request from './client'

export function login(email, password) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function getMe() {
  return request('/auth/me')
}

export function register(full_name, email, password) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ full_name, email, password }),
  })
}
