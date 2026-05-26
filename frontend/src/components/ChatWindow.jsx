import { useRef, useEffect, useState } from 'react'
import MessageBubble from './MessageBubble'
import Loader from './Loader'

export default function ChatWindow({ messages, onSend, loading, placeholder = 'Ask a question…' }) {
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleSend = () => {
    const text = input.trim()
    if (!text || loading) return
    onSend(text)
    setInput('')
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const isEmpty = messages.length === 0

  return (
    <div className="flex flex-col h-full">
      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
        {isEmpty && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-center py-16 gap-3 opacity-60">
            <svg className="w-10 h-10 text-accent/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <p className="text-sm text-gray-500">Your conversation will appear here</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0" />
              </svg>
            </div>
            <div className="bg-surface-800 border border-surface-600 rounded-2xl rounded-bl-sm px-4 py-3">
              <Loader label="Thinking…" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="border-t border-surface-700 p-4 bg-surface-900/50">
        <div className="flex gap-2 max-w-4xl mx-auto">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            rows={1}
            disabled={loading}
            placeholder={placeholder}
            className="input-field resize-none leading-relaxed"
            style={{ minHeight: '44px', maxHeight: '140px', overflowY: 'auto' }}
            onInput={(e) => {
              e.target.style.height = 'auto'
              e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`
            }}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="btn-primary shrink-0 flex items-center gap-2 self-end"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
        <p className="text-center text-xs text-gray-600 mt-2">
          Press <kbd className="font-mono bg-surface-700 px-1 rounded">Enter</kbd> to send · <kbd className="font-mono bg-surface-700 px-1 rounded">Shift+Enter</kbd> for newline
        </p>
      </div>
    </div>
  )
}
