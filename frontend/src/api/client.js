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

// ─── Source helpers ────────────────────────────────────────────────────────────
// A "source" is either { type: 'url',  value: 'https://...' }
//                   or { type: 'file', value: '<raw json/yaml text>', filename: 'api.json' }

function specPayload(source) {
  return source.type === 'file'
    ? { content: source.value }
    : { url: source.value }
}

function chatSpecPayload(source) {
  return source.type === 'file'
    ? { specContent: source.value }
    : { specUrl: source.value }
}

function compareSpecPayload(source1, source2) {
  const s1 = source1.type === 'file'
    ? { specContent1: source1.value }
    : { specUrl1: source1.value }
  const s2 = source2.type === 'file'
    ? { specContent2: source2.value }
    : { specUrl2: source2.value }
  return { ...s1, ...s2 }
}

// ─── Public API ────────────────────────────────────────────────────────────────

/** View/parse a spec.  source = { type: 'url'|'file', value: string } */
export const viewSpec = (source) =>
  request('/spec/view', specPayload(source))

/** Chat about a spec. */
export const chatWithSpec = (source, messages) =>
  request('/chat', { ...chatSpecPayload(source), messages })

/** Compare two specs. */
export const compareSpecs = (source1, source2, messages) =>
  request('/compare', { ...compareSpecPayload(source1, source2), messages })

/** Read a File object as a UTF-8 string. */
export const readFileAsText = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload  = (e) => resolve(e.target.result)
    reader.onerror = ()  => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
