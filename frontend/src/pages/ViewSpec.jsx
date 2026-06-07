import { useState } from 'react'
import { viewSpec } from '../api/client'
import SpecSourceInput from '../components/SpecSourceInput'
import EndpointCard from '../components/EndpointCard'
import { PageLoader } from '../components/Loader'

export default function ViewSpec() {
  const [source, setSource]   = useState(null)
  const [spec, setSpec]       = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const grouped = groupByTag(spec?.endpoints ?? [])

  async function handleFetch(e) {
    e?.preventDefault()
    if (!source) return
    setLoading(true)
    setError(null)
    setSpec(null)
    try {
      const data = await viewSpec(source)
      setSpec(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-100 mb-1">View API Specs</h1>
        <p className="text-gray-500 text-sm">
          Enter a Swagger / OpenAPI URL <span className="text-gray-600">or</span> upload a local file to explore the API visually.
        </p>
      </div>

      <form onSubmit={handleFetch} className="glass-card p-5 mb-6">
        <SpecSourceInput
          label="OpenAPI / Swagger Spec"
          placeholder="https://petstore3.swagger.io/api/v3/openapi.json"
          onChange={setSource}
        />
        <div className="mt-4 flex items-center gap-3 flex-wrap">
          <button type="submit" disabled={loading || !source} className="btn-primary">
            {loading ? 'Loading\u2026' : 'Fetch Spec'}
          </button>
          <span className="text-xs text-gray-600">Try:</span>
          {[
            { label: 'Petstore JSON', url: 'https://petstore3.swagger.io/api/v3/openapi.json' },
            { label: 'Petstore YAML', url: 'https://petstore3.swagger.io/api/v3/openapi.yaml' },
          ].map((s) => (
            <button key={s.url} type="button"
              onClick={() => setSource({ type: 'url', value: s.url })}
              className="text-xs text-accent hover:text-blue-300 underline underline-offset-2 decoration-accent/40">
              {s.label}
            </button>
          ))}
        </div>
      </form>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-5 py-4 mb-6 flex gap-3 items-start animate-fade-in">
          <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-red-400 font-medium text-sm">Failed to load spec</p>
            <p className="text-red-400/70 text-xs mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {loading && <PageLoader />}

      {spec && !loading && (
        <div className="animate-fade-in space-y-6">
          <div className="glass-card p-5 flex flex-col sm:flex-row gap-4 sm:items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-xl font-semibold text-gray-100 truncate">{spec.title}</h2>
                {spec.version && (
                  <span className="shrink-0 text-xs font-mono bg-accent/15 text-accent border border-accent/30 px-2 py-0.5 rounded-md">
                    v{spec.version}
                  </span>
                )}
              </div>
              {spec.description && (
                <p className="text-gray-400 text-sm leading-relaxed mt-1">{spec.description}</p>
              )}
              {spec.baseUrl && (
                <p className="font-mono text-xs text-gray-500 mt-2 truncate">
                  <span className="text-gray-600">Base URL: </span>{spec.baseUrl}
                </p>
              )}
              <div className="mt-2">
                {source?.type === 'file'
                  ? <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md">From uploaded file: {source.filename}</span>
                  : <span className="text-xs font-mono text-gray-600 truncate">{source?.value}</span>
                }
              </div>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-2xl font-bold text-accent">{spec.endpoints?.length ?? 0}</p>
              <p className="text-xs text-gray-500">endpoints</p>
            </div>
          </div>

          <MethodLegend endpoints={spec.endpoints} />

          {Object.entries(grouped).map(([tag, endpoints]) => (
            <div key={tag}>
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">{tag}</h3>
                <div className="flex-1 h-px bg-surface-600" />
                <span className="text-xs text-gray-600">{endpoints.length}</span>
              </div>
              <div className="space-y-2">
                {endpoints.map((ep, i) => (
                  <EndpointCard key={`${ep.method}-${ep.path}-${i}`} endpoint={ep} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function MethodLegend({ endpoints }) {
  const counts = endpoints.reduce((acc, ep) => {
    const m = ep.method?.toUpperCase() ?? 'GET'
    acc[m] = (acc[m] ?? 0) + 1
    return acc
  }, {})
  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(counts).map(([method, count]) => (
        <div key={method} className={`method-${method} flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md`}>
          <span className="font-mono font-semibold">{method}</span>
          <span className="opacity-70">x {count}</span>
        </div>
      ))}
    </div>
  )
}

function groupByTag(endpoints) {
  const result = {}
  for (const ep of endpoints) {
    const tag = ep.tags?.[0] ?? 'General'
    if (!result[tag]) result[tag] = []
    result[tag].push(ep)
  }
  return result
}