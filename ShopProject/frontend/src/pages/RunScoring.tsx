import { useState } from 'react'
import { Link } from 'react-router-dom'

interface ScoringResult {
  success: boolean
  message: string
  timestamp: string
}

export default function RunScoring() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ScoringResult | null>(null)
  const [error, setError] = useState('')

  async function handleRun() {
    setLoading(true)
    setResult(null)
    setError('')
    try {
      const res = await fetch('/api/Scoring/Run', { method: 'POST' })
      const data: ScoringResult = await res.json()
      setResult(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-6 text-center">
        <h2 className="mb-2">Run ML Scoring</h2>
        <p className="text-muted mb-4">
          Executes the Python inference script to score all unshipped orders and populate the priority queue.
        </p>

        <button
          className="btn btn-primary btn-lg w-100 mb-4"
          onClick={handleRun}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" />
              Running...
            </>
          ) : (
            'Run Scoring'
          )}
        </button>

        {error && <div className="alert alert-danger">{error}</div>}

        {result && (
          <>
            <div className={`alert ${result.success ? 'alert-success' : 'alert-warning'} text-start`}>
              <div className="fw-semibold mb-1">{result.success ? '✅ Success' : '⚠️ Notice'}</div>
              <div>{result.message}</div>
              <div className="text-muted small mt-1">
                {new Date(result.timestamp).toLocaleString()}
              </div>
            </div>
            {result.success && (
              <Link to="/warehouse/priority" className="btn btn-outline-primary mt-2">
                View Priority Queue →
              </Link>
            )}
          </>
        )}
      </div>
    </div>
  )
}
