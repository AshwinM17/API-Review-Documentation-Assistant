import { useState, useRef } from 'react'
import { readFileAsText } from '../api/client'

const ACCEPTED = '.json,.yaml,.yml'

/**
 * A dual-mode input that lets the user either:
 *   1. Enter a public Swagger/OpenAPI URL, or
 *   2. Upload a local .json / .yaml / .yml file
 *
 * Props:
 *   label       – shown above the input (optional)
 *   placeholder – URL input placeholder text
 *   onChange    – called with { type: 'url'|'file', value: string, filename?: string }
 *                 whenever the source changes. Pass null to signal the source was cleared.
 *   badge       – optional pill label e.g. "v1" for the compare panel
 *   badgeClass  – Tailwind classes for the badge
 */
export default function SpecSourceInput({
  label,
  placeholder = 'https://…/openapi.json',
  onChange,
  badge,
  badgeClass = '',
}) {
  const [mode, setMode]         = useState('url')   // 'url' | 'file'
  const [url, setUrl]           = useState('')
  const [file, setFile]         = useState(null)     // { name, content }
  const [dragging, setDragging] = useState(false)
  const [fileError, setFileErr] = useState(null)
  const inputRef                = useRef(null)

  // ── Mode switch ────────────────────────────────────────────────────────────
  function switchMode(next) {
    setMode(next)
    setUrl('')
    setFile(null)
    setFileErr(null)
    onChange?.(null)
  }

  // ── URL input ──────────────────────────────────────────────────────────────
  function handleUrlChange(e) {
    const val = e.target.value
    setUrl(val)
    onChange?.(val.trim() ? { type: 'url', value: val.trim() } : null)
  }

  // ── File handling ──────────────────────────────────────────────────────────
  async function processFile(f) {
    setFileErr(null)

    if (!f) return

    const ext = f.name.split('.').pop().toLowerCase()
    if (!['json', 'yaml', 'yml'].includes(ext)) {
      setFileErr('Only .json, .yaml, and .yml files are supported.')
      return
    }

    try {
      const content = await readFileAsText(f)
      setFile({ name: f.name, content })
      onChange?.({ type: 'file', value: content, filename: f.name })
    } catch {
      setFileErr('Could not read the file. Please try again.')
    }
  }

  function handleFileInput(e) {
    processFile(e.target.files?.[0])
    // Reset input value so the same file can be re-selected
    e.target.value = ''
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    processFile(e.dataTransfer.files?.[0])
  }

  function clearFile() {
    setFile(null)
    setFileErr(null)
    onChange?.(null)
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="w-full">
      {/* Label row */}
      {(label || badge) && (
        <div className="flex items-center gap-2 mb-1.5">
          {label && (
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {label}
            </span>
          )}
          {badge && (
            <span className={`text-[10px] font-mono font-bold border px-1.5 py-0.5 rounded ${badgeClass}`}>
              {badge}
            </span>
          )}
        </div>
      )}

      {/* Mode toggle */}
      <div className="flex gap-1 mb-2 bg-surface-700 p-0.5 rounded-lg w-fit">
        <ModeButton active={mode === 'url'}  onClick={() => switchMode('url')}>
          <LinkIcon /> URL
        </ModeButton>
        <ModeButton active={mode === 'file'} onClick={() => switchMode('file')}>
          <UploadIcon /> Upload File
        </ModeButton>
      </div>

      {/* URL mode */}
      {mode === 'url' && (
        <input
          type="url"
          value={url}
          onChange={handleUrlChange}
          placeholder={placeholder}
          className="input-field w-full"
        />
      )}

      {/* File upload mode */}
      {mode === 'file' && (
        <div>
          {!file ? (
            /* Drop zone */
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`
                w-full border-2 border-dashed rounded-xl px-4 py-6 cursor-pointer
                flex flex-col items-center gap-2 transition-all duration-200
                ${dragging
                  ? 'border-accent bg-accent/10'
                  : 'border-surface-600 bg-surface-700/50 hover:border-accent/50 hover:bg-surface-700'}
              `}
            >
              <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
                <UploadIcon className="w-5 h-5 text-accent/60" />
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-300 font-medium">
                  {dragging ? 'Drop it here' : 'Drag & drop or click to browse'}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Supports .json, .yaml, .yml
                </p>
              </div>
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPTED}
                onChange={handleFileInput}
                className="hidden"
              />
            </div>
          ) : (
            /* File loaded — show filename with clear button */
            <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center shrink-0">
                <FileIcon className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-emerald-300 font-medium truncate">{file.name}</p>
                <p className="text-xs text-emerald-500">File loaded successfully</p>
              </div>
              <button
                type="button"
                onClick={clearFile}
                className="text-gray-500 hover:text-gray-300 transition-colors shrink-0"
                title="Remove file"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* File error */}
          {fileError && (
            <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
              <span>⚠</span> {fileError}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function ModeButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md transition-all duration-150 ${
        active
          ? 'bg-accent/20 text-accent border border-accent/30'
          : 'text-gray-400 hover:text-gray-300'
      }`}
    >
      {children}
    </button>
  )
}

// ── Icons ──────────────────────────────────────────────────────────────────────

function LinkIcon({ className = 'w-3.5 h-3.5' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  )
}

function UploadIcon({ className = 'w-3.5 h-3.5' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  )
}

function FileIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}

function CloseIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}