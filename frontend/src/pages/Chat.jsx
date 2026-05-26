import { useState } from 'react'
import { chatWithSpec } from '../api/client'
import ChatWindow from '../components/ChatWindow'

export default function Chat() {
  const [specUrl, setSpecUrl]     = useState('')
  const [activeUrl, setActiveUrl] = useState('')
  const [messages, setMessages]   = useState([])
  const [loading, setLoading]     = useState(false)
  const [urlError, setUrlError]   = useState(null)
  const [chatError, setChatError] = useState(null)

  const isReady = Boolean(activeUrl)

  function handleLoadSpec(e) {
    e?.preventDefault()
    const url = specUrl.trim()
    if (!url) return
    setActiveUrl(url)
    setMessages([])
    setUrlError(null)
    setChatError(null)
  }

  async function handleSend(text) {
    if (!activeUrl) return

    const userMsg = { role: 'user', content: text }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setLoading(true)
    setChatError(null)

    try {
      const data = await chatWithSpec(activeUrl, newMessages)
      setMessages([...newMessages, { role: 'assistant', content: data.message }])
    } catch (err) {
      setChatError(err.message)
      // Remove the optimistically-added user message on error
      setMessages(messages)
    } finally {
      setLoading(false)
    }
  }

  function handleClearChat() {
    setMessages([])
    setChatError(null)
  }

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 56px)' }}>
      {/* Spec URL bar */}
      <div className="border-b border-surface-700 bg-surface-900/60 backdrop-blur-sm px-4 py-3 shrink-0">
        <form onSubmit={handleLoadSpec} className="max-w-4xl mx-auto flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              OpenAPI / Swagger URL
            </label>
            <input
              type="url"
              value={specUrl}
              onChange={(e) => setSpecUrl(e.target.value)}
              placeholder="https://petstore3.swagger.io/api/v3/openapi.json"
              className="input-field w-full"
              required
            />
          </div>
          <button type="submit" className="btn-primary shrink-0">
            {activeUrl ? 'Change Spec' : 'Load Spec'}
          </button>
          {messages.length > 0 && (
            <button type="button" onClick={handleClearChat} className="btn-ghost shrink-0">
              Clear
            </button>
          )}
        </form>

        {/* Active spec indicator */}
        {activeUrl && (
          <div className="max-w-4xl mx-auto mt-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-slow" />
            <span className="text-xs text-gray-500 font-mono truncate">{activeUrl}</span>
          </div>
        )}

        {/* Chat error */}
        {chatError && (
          <div className="max-w-4xl mx-auto mt-2 flex items-center gap-2 text-red-400 text-xs">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {chatError}
          </div>
        )}
      </div>

      {/* Main area */}
      {!isReady ? (
        <div className="flex-1 flex items-center justify-center">
          <EmptyState />
        </div>
      ) : (
        <div className="flex-1 min-h-0 max-w-4xl w-full mx-auto">
          <ChatWindow
            messages={messages}
            onSend={handleSend}
            loading={loading}
            placeholder="Ask anything about this API…"
          />
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
          Enter an OpenAPI/Swagger URL above and click <strong className="text-gray-400">Load Spec</strong> to begin chatting with an AI assistant about the API.
        </p>
      </div>
      <div className="text-left space-y-2">
        {[
          'What endpoints are available?',
          'How do I authenticate with this API?',
          'Show me a curl example for POST /users',
        ].map((q) => (
          <div key={q} className="flex items-start gap-2 text-xs text-gray-600">
            <span className="text-accent mt-0.5">›</span>
            <span>"{q}"</span>
          </div>
        ))}
      </div>
    </div>
  )
}
