const BASE_URL = import.meta.env.VITE_API_URL || '/api'

export class ApiError extends Error {
  constructor(message, status, body) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

export function buildQuery(params = {}) {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    search.set(key, value)
  })
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

export async function apiFetch(path, { params, ...options } = {}) {
  const query = params ? buildQuery(params) : ''
  const res = await fetch(`${BASE_URL}${path}${query}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  let body = null
  const text = await res.text()
  if (text) {
    try {
      body = JSON.parse(text)
    } catch {
      body = text
    }
  }

  if (!res.ok) {
    const rawMessage = body && body.message
    const message = Array.isArray(rawMessage)
      ? rawMessage.join(', ')
      : rawMessage || res.statusText || 'Request failed'
    throw new ApiError(message, res.status, body)
  }

  return body
}
