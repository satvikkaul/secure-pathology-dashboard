const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

// FastAPI validation errors return detail as an array of objects with a msg field.
// Plain errors return detail as a string. Normalize both to a readable string.
function extractDetail(detail) {
  if (!detail) return null
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    return detail
      .map((e) => (e && typeof e.msg === 'string' ? e.msg : String(e)))
      .join('; ')
  }
  return JSON.stringify(detail)
}

async function request(path, options = {}) {
  const token = localStorage.getItem('token')

  const headers = { ...options.headers }
  // Let the browser set Content-Type for FormData (it must include the boundary)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers })

  if (response.status === 401) {
    localStorage.removeItem('token')
    window.dispatchEvent(new Event('auth:unauthorized'))
    const err = new Error('Unauthorized')
    err.status = 401
    throw err
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    const err = new Error(extractDetail(body.detail) || `HTTP ${response.status}`)
    err.status = response.status
    throw err
  }

  if (response.status === 204) return null
  return response.json()
}

export default request
