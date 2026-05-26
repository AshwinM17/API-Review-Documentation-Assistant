import { useState } from 'react'

export default function EndpointCard({ endpoint }) {
  const [open, setOpen] = useState(false)
  const method = endpoint.method?.toUpperCase() ?? 'GET'

  return (
    <div className="glass-card overflow-hidden animate-fade-in">
      {/* Header – always visible */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-700/50 transition-colors text-left"
      >
        <MethodBadge method={method} />
        <span className="font-mono text-sm text-gray-200 flex-1 truncate">{endpoint.path}</span>
        {endpoint.summary && (
          <span className="hidden sm:block text-xs text-gray-500 truncate max-w-xs">
            {endpoint.summary}
          </span>
        )}
        <ChevronIcon open={open} />
      </button>

      {/* Collapsible body */}
      {open && (
        <div className="border-t border-surface-600 px-4 py-4 space-y-4 animate-slide-up">
          {/* Summary / Description */}
          {(endpoint.summary || endpoint.description) && (
            <div>
              {endpoint.summary && (
                <p className="text-gray-200 font-medium text-sm">{endpoint.summary}</p>
              )}
              {endpoint.description && endpoint.description !== endpoint.summary && (
                <p className="text-gray-400 text-xs mt-1 leading-relaxed">{endpoint.description}</p>
              )}
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Parameters */}
            {endpoint.parameters?.length > 0 && (
              <Section title="Parameters">
                <div className="space-y-1.5">
                  {endpoint.parameters.map((p, i) => (
                    <ParamRow key={i} param={p} />
                  ))}
                </div>
              </Section>
            )}

            {/* Responses */}
            {endpoint.responses?.length > 0 && (
              <Section title="Responses">
                <div className="space-y-1.5">
                  {endpoint.responses.map((r, i) => (
                    <ResponseRow key={i} response={r} />
                  ))}
                </div>
              </Section>
            )}
          </div>

          {/* Request body schema */}
          {endpoint.requestBodySchema && (
            <Section title="Request Body">
              {endpoint.requestBodyDescription && (
                <p className="text-xs text-gray-400 mb-2">{endpoint.requestBodyDescription}</p>
              )}
              <pre className="text-xs font-mono bg-surface-900 border border-surface-600 rounded-lg p-3 overflow-x-auto text-gray-300 leading-relaxed">
                {tryPrettyJson(endpoint.requestBodySchema)}
              </pre>
            </Section>
          )}

          {/* Tags */}
          {endpoint.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {endpoint.tags.map((tag) => (
                <span key={tag} className="px-2 py-0.5 rounded bg-surface-700 text-gray-400 text-xs border border-surface-600">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function MethodBadge({ method }) {
  return (
    <span className={`method-${method} font-mono font-medium text-xs px-2.5 py-1 rounded-md shrink-0 w-16 text-center`}>
      {method}
    </span>
  )
}

function Section({ title, children }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{title}</p>
      {children}
    </div>
  )
}

function ParamRow({ param }) {
  return (
    <div className="flex items-start gap-2 text-xs">
      <span className="font-mono text-accent shrink-0">{param.name}</span>
      <span className="text-gray-600">·</span>
      <span className="text-gray-500 shrink-0 italic">{param.in}</span>
      {param.type && <span className="text-gray-600 shrink-0">({param.type})</span>}
      {param.required && (
        <span className="text-red-400 shrink-0 text-[10px] font-semibold">required</span>
      )}
      {param.description && (
        <span className="text-gray-400 truncate">{param.description}</span>
      )}
    </div>
  )
}

function ResponseRow({ response }) {
  const code = parseInt(response.statusCode, 10)
  const color =
    code >= 500 ? 'text-red-400' :
    code >= 400 ? 'text-amber-400' :
    code >= 300 ? 'text-blue-400' :
    'text-emerald-400'

  return (
    <div className="flex items-start gap-2 text-xs">
      <span className={`font-mono font-semibold shrink-0 ${color}`}>{response.statusCode}</span>
      <span className="text-gray-400">{response.description}</span>
    </div>
  )
}

function ChevronIcon({ open }) {
  return (
    <svg
      className={`w-4 h-4 text-gray-500 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}

function tryPrettyJson(str) {
  try { return JSON.stringify(JSON.parse(str), null, 2) }
  catch { return str }
}
