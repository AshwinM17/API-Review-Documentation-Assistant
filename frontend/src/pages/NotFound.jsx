import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6 gap-5">
      <p className="font-mono text-6xl font-bold text-surface-700 select-none">404</p>
      <div>
        <h1 className="text-xl font-semibold text-gray-200 mb-1">Page not found</h1>
        <p className="text-gray-500 text-sm">The route you're looking for doesn't exist.</p>
      </div>
      <Link to="/view" className="btn-primary text-sm">
        ← Back to View API Specs
      </Link>
    </div>
  )
}
