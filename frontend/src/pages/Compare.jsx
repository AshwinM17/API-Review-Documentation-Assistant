import { useState } from 'react'
import { compareSpecs } from '../api/client'
import SpecSourceInput from '../components/SpecSourceInput'
import ChatWindow from '../components/ChatWindow'

export default function Compare() {
  const [source1, setSource1]   = useState(null)
  const [source2, setSource2]   = useState(null)
  const [active, setActive]     = useState(null)   // { s1, s2 } when loaded
  const [messages, setMessages] = useState([])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)

  async function handleAnalyze(e) {
    e?.preventDefault()
    if (!source1 || !source2) return
    setActive({ s1: source1, s2: source2 })
    setError(null)

    const initMsg = {
      role: 'user',
      content: 'Please compare these two API specifications. Provide a comprehensive analysis covering: added/removed endpoints, changed request/response schemas, breaking changes (marked with warning), and non-breaking additions. Also mention any version differences.'
    }
    setMessages([initMsg])
    setLoading(true)

    try {
      const data = await compareSpecs(source1, source2, [initMsg])
      setMessages([initMsg, { role: 'assistant', content: data.message }])
    } catch (err) {
      setError(err.message)
      setMessages([])
    } finally {
      setLoading(false)
    }
  }

  async function handleSend(text) {
    if (!active) return
    const userMsg = { role: 'user', content: text }
    const next = [...messages, userMsg]
    setMessages(next)
    setLoading(true)
    setError(null)
    try {
      const data = await compareSpecs(active.s1, active.s2, next)
      setMessages([...next, { role: 'assistant', content: data.message }])
    } catch (err) {
      setError(err.message)
      setMessages(messages)
    } finally {
      setLoading(false)
    }
  }

  function sourceLabel(src) {
    if (!src) return ''
    return src.type === 'file' ? `File: ${src.filename}` : src.value
  }

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 56px)' }}>
      <div className="border-b border-surface-700 bg-surface-900/60 backdrop-blur-sm px-4 py-4 shrink-0">
        <div className="max-w-5xl mx-auto">
          {!active ? (
            <form onSubmit={handleAnalyze} className="space-y-4">
              <div>
                <h2 className="text-sm font-semibold text-gray-300 mb-1">API Spec Comparison</h2>
                <p className="text-xs text-gray-500">Provide two OpenAPI/Swagger specs (URL or file) to compare them with AI.</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <SpecSourceInput
                  label="Spec 1 — Baseline"
                  placeholder="https://.../openapi-v1.json"
                  badge="v1"
                  badgeClass="bg-blue-500/15 text-blue-400 border-blue-500/30"
                  onChange={setSource1}
                />
                <SpecSourceInput
                  label="Spec 2 — Updated"
                  placeholder="https://.../openapi-v2.json"
                  badge="v2"
                  badgeClass="bg-violet-500/15 text-violet-400 border-violet-500/30"
                  onChange={setSource2}
                />
              </div>

              <div className="flex justify-end">
                <button type="submit" disabled={!source1 || !source2} className="btn-primary flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  Analyze Differences
                </button>
              </div>
            </form>
          ) : (
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap text-xs font-mono min-w-0">
                <Pill label="v1" text={sourceLabel(active.s1)} cls="text-blue-400 border-blue-500/30 bg-blue-500/10" />
                <svg className="w-4 h-4 text-gray-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <Pill label="v2" text={sourceLabel(active.s2)} cls="text-violet-400 border-violet-500/30 bg-violet-500/10" />
              </div>
              <button onClick={() => { setActive(null); setMessages([]); setError(null) }} className="btn-ghost text-sm shrink-0">
                New Comparison
              </button>
            </div>
          )}

          {error && (
            <p className="mt-3 text-xs text-red-400 flex items-center gap-1">
              <span>⚠</span> {error}
            </p>
          )}
        </div>
      </div>

      {!active ? (
        <div className="flex-1 flex items-center justify-center">
          <EmptyState />
        </div>
      ) : (
        <div className="flex-1 min-h-0 max-w-5xl w-full mx-auto">
          <ChatWindow messages={messages} onSend={handleSend} loading={loading}
            placeholder="Ask about specific differences, breaking changes, migration steps..." />
        </div>
      )}
    </div>
  )
}

function Pill({ label, text, cls }) {
  return (
    <span className={`flex items-center gap-1.5 border rounded-md px-2.5 py-1 max-w-xs ${cls}`}>
      <span className="font-bold opacity-70">{label}</span>
      <span className="truncate opacity-70">{text}</span>
    </span>
  )
}

function EmptyState() {
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
          Provide two specs (URL or uploaded file) and click <strong className="text-gray-400">Analyze Differences</strong>.
          Mix and match — one URL and one uploaded file works too.
        </p>
      </div>
    </div>
  )
}