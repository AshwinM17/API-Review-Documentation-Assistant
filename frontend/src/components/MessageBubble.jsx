import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex gap-3 animate-slide-up ${isUser ? 'justify-end' : 'justify-start'}`}>
      {/* Avatar */}
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center shrink-0 mt-0.5">
          <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 001.357 2.059l.521.26a2.25 2.25 0 011.372 2.059v.353M15 3.186c.251.023.501.05.75.082M15 3.186A24.165 24.165 0 0112 3c-1.067 0-2.116.08-3.141.236" />
          </svg>
        </div>
      )}

      {/* Bubble */}
      <div
        className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? 'bg-accent/20 border border-accent/30 text-gray-100 rounded-br-sm'
            : 'bg-surface-800 border border-surface-600 text-gray-200 rounded-bl-sm'
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '')
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={oneDark}
                    language={match[1]}
                    PreTag="div"
                    className="!rounded-lg !text-xs !my-2 !bg-surface-950"
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code
                    className="bg-surface-700 text-accent font-mono text-xs px-1.5 py-0.5 rounded"
                    {...props}
                  >
                    {children}
                  </code>
                )
              },
              // Tables
              table: ({ children }) => (
                <div className="overflow-x-auto my-2">
                  <table className="text-xs border-collapse w-full">{children}</table>
                </div>
              ),
              th: ({ children }) => (
                <th className="border border-surface-600 px-3 py-1.5 text-left text-gray-300 font-semibold bg-surface-700">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="border border-surface-600 px-3 py-1.5 text-gray-400">{children}</td>
              ),
              // Headings
              h1: ({ children }) => <h1 className="text-base font-bold text-gray-100 mt-3 mb-1">{children}</h1>,
              h2: ({ children }) => <h2 className="text-sm font-semibold text-gray-100 mt-3 mb-1">{children}</h2>,
              h3: ({ children }) => <h3 className="text-sm font-medium text-accent mt-2 mb-1">{children}</h3>,
              // Lists
              ul: ({ children }) => <ul className="list-disc list-inside space-y-0.5 my-1 text-gray-300">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal list-inside space-y-0.5 my-1 text-gray-300">{children}</ol>,
              li: ({ children }) => <li className="text-gray-300">{children}</li>,
              // Blockquote
              blockquote: ({ children }) => (
                <blockquote className="border-l-2 border-accent/50 pl-3 my-2 text-gray-400 italic">
                  {children}
                </blockquote>
              ),
              // Paragraphs
              p: ({ children }) => <p className="mb-1.5 last:mb-0">{children}</p>,
              // Strong / em
              strong: ({ children }) => <strong className="font-semibold text-gray-100">{children}</strong>,
            }}
          >
            {message.content}
          </ReactMarkdown>
        )}
      </div>

      {/* User avatar */}
      {isUser && (
        <div className="w-7 h-7 rounded-full bg-surface-700 border border-surface-600 flex items-center justify-center shrink-0 mt-0.5">
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
      )}
    </div>
  )
}
