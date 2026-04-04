import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import type { Customer } from '../types/Customer'
import { apiFetch } from '../lib/apiFetch'

interface ScoringResult {
  success: boolean
  message: string
  timestamp: string
}

interface CustomerPrediction {
  orderId: number
  orderDatetime: string
  orderTotal: number
  fraudProbability: number
  predictedFraud: number
  predictionTimestamp: string
}

export default function RunScoring() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ScoringResult | null>(null)
  const [error, setError] = useState('')

  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Customer[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [predictions, setPredictions] = useState<CustomerPrediction[]>([])
  const [loadingPredictions, setLoadingPredictions] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query.trim()) {
      setSearchResults([])
      return
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await apiFetch(`/api/Customers/Search?query=${encodeURIComponent(query)}`)
        const data: Customer[] = await res.json()
        setSearchResults(data)
      } catch {
        setSearchResults([])
      } finally {
        setSearching(false)
      }
    }, 300)
  }, [query])

  function pickCustomer(c: Customer) {
    setSelectedCustomer(c)
    setQuery('')
    setSearchResults([])
    setLoadingPredictions(true)
    apiFetch(`/api/Warehouse/Customer/${c.customerId}/Predictions`)
      .then((r) => r.json())
      .then((data: CustomerPrediction[]) => setPredictions(data))
      .catch(() => setPredictions([]))
      .finally(() => setLoadingPredictions(false))
  }

  async function handleRun() {
    setLoading(true)
    setResult(null)
    setError('')
    try {
      const res = await apiFetch('/api/Scoring/Run', { method: 'POST' })
      const data: ScoringResult = await res.json()
      setResult(data)
      if (data.success && selectedCustomer) {
        setLoadingPredictions(true)
        apiFetch(`/api/Warehouse/Customer/${selectedCustomer.customerId}/Predictions`)
          .then((r) => r.json())
          .then((d: CustomerPrediction[]) => setPredictions(d))
          .catch(() => {})
          .finally(() => setLoadingPredictions(false))
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }

  function riskBadge(prob: number) {
    if (prob >= 0.7) return <span className="badge bg-danger">{(prob * 100).toFixed(0)}%</span>
    if (prob >= 0.4) return <span className="badge bg-warning text-dark">{(prob * 100).toFixed(0)}%</span>
    return <span className="badge bg-success">{(prob * 100).toFixed(0)}%</span>
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-8">
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
              <Link to="/warehouse/priority" className="btn btn-outline-primary mt-2 mb-4">
                View Priority Queue →
              </Link>
            )}
          </>
        )}

        <hr className="my-4" />

        <h5 className="mb-3">Look Up Customer Predictions</h5>
        <div className="position-relative mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Search customer by name or email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {searching && <div className="text-muted small mt-1">Searching...</div>}
          {searchResults.length > 0 && (
            <ul className="list-group position-absolute w-100 shadow" style={{ zIndex: 1000, top: '100%' }}>
              {searchResults.map((c) => (
                <button
                  key={c.customerId}
                  type="button"
                  className="list-group-item list-group-item-action"
                  onClick={() => pickCustomer(c)}
                >
                  <span className="fw-semibold">{c.fullName}</span>
                  <span className="text-muted small ms-2">{c.email}</span>
                  {c.loyaltyTier && (
                    <span className="badge bg-info text-dark ms-2">{c.loyaltyTier}</span>
                  )}
                </button>
              ))}
            </ul>
          )}
        </div>

        {selectedCustomer && (
          <div className="card">
            <div className="card-header fw-semibold">
              {selectedCustomer.fullName}
              <span className="text-muted small ms-2">{selectedCustomer.email}</span>
              {selectedCustomer.loyaltyTier && (
                <span className="badge bg-info text-dark ms-2">{selectedCustomer.loyaltyTier}</span>
              )}
            </div>
            <div className="card-body p-0">
              {loadingPredictions ? (
                <div className="text-center p-3"><div className="spinner-border spinner-border-sm" /></div>
              ) : predictions.length === 0 ? (
                <p className="text-muted p-3 mb-0">No unshipped orders with predictions. Run scoring first.</p>
              ) : (
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Order ID</th>
                      <th>Date</th>
                      <th>Total</th>
                      <th>Fraud Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {predictions.map((p) => (
                      <tr key={p.orderId}>
                        <td>#{p.orderId}</td>
                        <td>{new Date(p.orderDatetime).toLocaleDateString()}</td>
                        <td>{p.orderTotal.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                        <td>{riskBadge(p.fraudProbability)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
