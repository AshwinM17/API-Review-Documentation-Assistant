import { useState } from 'react'
import { chatWithSpec } from '../api/client'
import SpecSourceInput from '../components/SpecSourceInput'
import ChatWindow from '../components/ChatWindow'

export default function Chat() {
  const [source, setSource]       = useState(null)
  const [activeSource, setActive] = useState(null)
  const [messages, setMessages]   = useState([])
  const [loading, setLoading]     = useState(false)
  const [chatError, setChatError] = useState(null)

  function handleLoad(e) {
    e?.preventDefault()
    if (!source) return
    setActive(source)
    setMessages([])
    setChatError(null)
  }

  async function handleSend(text) {
    if (!activeSource) return
    const userMsg = { role: 'user', content: text }
    const next = [...messages, userMsg]
    setMessages(next)
    setLoading(true)
    setChatError(null)
    try {
      const data = await chatWithSpec(activeSource, next)
      setMessages([...next, { role: 'assistant', content: data.message }])
    } catch (err) {
      setChatError(err.message)
      setMessages(messages)
    } finally {
      setLoading(false)
    }
  }

  const sourceLabel = activeSource
    ? (activeSource.type === 'file' ? `File: ${activeSource.filename}` : activeSource.value)
    : null

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 56px)' }}>
      {/* Spec source bar */}
      <div className="border-b border-surface-700 bg-surface-900/60 backdrop-blur-sm px-4 py-3 shrink-0">
        <form onSubmit={handleLoad} className="max-w-4xl mx-auto flex gap-3 items-end">
          <div className="flex-1">
            <SpecSourceInput
              label="OpenAPI / Swagger Spec"
              placeholder="https://petstore3.swagger.io/api/v3/openapi.json"
              onChange={setSource}
            />
          </div>
          <div className="flex gap-2 shrink-0 self-end">
            <button type="submit" disabled={!source} className="btn-primary">
              {activeSource ? 'Change' : 'Load Spec'}
            </button>
            {messages.length > 0 && (
              <button type="button" onClick={() => setMessages([])} className="btn-ghost">
                Clear
              </button>
            )}
          </div>
        </form>

        {activeSource && (
          <div className="max-w-4xl mx-auto mt-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-slow" />
            <span className="text-xs text-gray-500 font-mono truncate">{sourceLabel}</span>
          </div>
        )}

        {chatError && (
          <p className="max-w-4xl mx-auto mt-2 text-xs text-red-400 flex items-center gap-1">
            <span>⚠</span> {chatError}
          </p>
        )}
      </div>

      {!activeSource ? (
        <div className="flex-1 flex items-center justify-center">
          <EmptyState />
        </div>
      ) : (
        <div className="flex-1 min-h-0 max-w-4xl w-full mx-auto">
          <ChatWindow messages={messages} onSend={handleSend} loading={loading}
            placeholder="Ask anything about this API..." />
        </div>
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="text-center space-y-4 px-6 max-w-sm">
      <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto">
        <svg className="w-7 h-7 text-accent/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </div>
      <div>
        <h3 className="text-gray-200 font-semibold mb-1">Start a conversation</h3>
        <p className="text-gray-500 text-sm leading-relaxed">
          Enter a URL or upload a spec file, then click <strong className="text-gray-400">Load Spec</strong> to chat with the AI about the API.
        </p>
      </div>
      <div className="text-left space-y-2">
        {["What endpoints are available?","How do I authenticate?","Show me a curl example for POST /users"].map(q => (
          <div key={q} className="flex items-start gap-2 text-xs text-gray-600">
            <span className="text-accent mt-0.5">›</span>
            <span>"{q}"</span>
          </div>
        ))}
      </div>
    </div>
  )
}