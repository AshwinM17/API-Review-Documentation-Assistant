const BASE = '/api'

async function request(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data?.error || `Request failed with status ${res.status}`)
  }

  return data
}

/** Fetch and parse an OpenAPI spec by URL */
export const viewSpec = (url) =>
  request('/spec/view', { url })

/** Chat with an AI assistant about an API spec */
export const chatWithSpec = (specUrl, messages) =>
  request('/chat', { specUrl, messages })

/** Compare two API specs via AI */
export const compareSpecs = (specUrl1, specUrl2, messages) =>
  request('/compare', { specUrl1, specUrl2, messages })
