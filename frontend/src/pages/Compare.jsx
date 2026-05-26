import { useState } from 'react'
import { compareSpecs } from '../api/client'
import ChatWindow from '../components/ChatWindow'

export default function Compare() {
  const [url1, setUrl1]           = useState('')
  const [url2, setUrl2]           = useState('')
  const [activeUrls, setActive]   = useState(null)   // { url1, url2 } when loaded
  const [messages, setMessages]   = useState([])
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState(null)

  async function handleAnalyze(e) {
    e?.preventDefault()
    const u1 = url1.trim()
    const u2 = url2.trim()
    if (!u1 || !u2) return

    setActive({ url1: u1, url2: u2 })
    setError(null)

    // Auto-send an initial comparison request
    const initMsg = { role: 'user', content: 'Please compare these two API specifications. Provide a comprehensive analysis covering: added/removed endpoints, changed request/response schemas, breaking changes (marked with ⚠️), and non-breaking additions (marked with ✅). Also mention any version differences.' }
    setMessages([initMsg])
    setLoading(true)

    try {
      const data = await compareSpecs(u1, u2, [initMsg])
      setMessages([initMsg, { role: 'assistant', content: data.message }])
    } catch (err) {
      setError(err.message)
      setMessages([])
    } finally {
      setLoading(false)
    }
  }

  async function handleSend(text) {
    if (!activeUrls) return

    const userMsg = { role: 'user', content: text }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setLoading(true)
    setError(null)

    try {
      const data = await compareSpecs(activeUrls.url1, activeUrls.url2, newMessages)
      setMessages([...newMessages, { role: 'assistant', content: data.message }])
    } catch (err) {
      setError(err.message)
      setMessages(messages)
    } finally {
      setLoading(false)
    }
  }

  function handleReset() {
    setActive(null)
    setMessages([])
    setError(null)
  }

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 56px)' }}>
      {/* Input panel */}
      <div className="border-b border-surface-700 bg-surface-900/60 backdrop-blur-sm px-4 py-4 shrink-0">
        <div className="max-w-5xl mx-auto">
          {!activeUrls ? (
            <form onSubmit={handleAnalyze} className="space-y-4">
              <div>
                <h2 className="text-sm font-semibold text-gray-300 mb-1">API Spec Comparison</h2>
                <p className="text-xs text-gray-500">Enter two OpenAPI/Swagger spec URLs to compare them with AI.</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <SpecInput
                  label="Spec 1 — Baseline"
                  value={url1}
                  onChange={setUrl1}
                  placeholder="https://…/openapi-v1.json"
                  badge="v1"
                  badgeClass="bg-blue-500/15 text-blue-400 border-blue-500/30"
                />
                <SpecInput
                  label="Spec 2 — Updated"
                  value={url2}
                  onChange={setUrl2}
                  placeholder="https://…/openapi-v2.json"
                  badge="v2"
                  badgeClass="bg-violet-500/15 text-violet-400 border-violet-500/30"
                />
              </div>
              <div className="flex justify-end">
                <button type="submit" className="btn-primary flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  Analyze Differences
                </button>
              </div>
            </form>
          ) : (
            /* Active comparison header */
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3 flex-wrap text-xs font-mono min-w-0">
                <UrlPill label="v1" url={activeUrls.url1} cls="text-blue-400 border-blue-500/30 bg-blue-500/10" />
                <svg className="w-4 h-4 text-gray-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <UrlPill label="v2" url={activeUrls.url2} cls="text-violet-400 border-violet-500/30 bg-violet-500/10" />
              </div>
              <button onClick={handleReset} className="btn-ghost text-sm shrink-0">
                New Comparison
              </button>
            </div>
          )}

          {error && (
            <div className="mt-3 flex items-center gap-2 text-red-400 text-xs">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Chat area */}
      {!activeUrls ? (
        <div className="flex-1 flex items-center justify-center">
          <CompareEmptyState />
        </div>
      ) : (
        <div className="flex-1 min-h-0 max-w-5xl w-full mx-auto">
          <ChatWindow
            messages={messages}
            onSend={handleSend}
            loading={loading}
            placeholder="Ask about specific differences, breaking changes, migration steps…"
          />
        </div>
      )}
    </div>
  )
}

function SpecInput({ label, value, onChange, placeholder, badge, badgeClass }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1.5">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</label>
        <span className={`text-[10px] font-mono font-bold border px-1.5 py-0.5 rounded ${badgeClass}`}>{badge}</span>
      </div>
      <input
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-field w-full"
        required
      />
    </div>
  )
}

function UrlPill({ label, url, cls }) {
  return (
    <span className={`flex items-center gap-1.5 border rounded-md px-2.5 py-1 max-w-xs ${cls}`}>
      <span className="font-bold opacity-70">{label}</span>
      <span className="truncate opacity-70">{url}</span>
    </span>
  )
}

function CompareEmptyState() {
  return (
    <div className="text-center space-y-4 px-6 max-w-sm">
      <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto">
        <svg className="w-7 h-7 text-violet-400/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      </div>
      <div>
        <h3 className="text-gray-200 font-semibold mb-1">Compare two API versions</h3>
        <p className="text-gray-500 text-sm leading-relaxed">
          Enter two OpenAPI spec URLs and click <strong className="text-gray-400">Analyze Differences</strong>. The AI will identify breaking changes, added/removed endpoints, and migration steps.
        </p>
      </div>
    </div>
  )
}
