import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Customer } from '../types/Customer'

export default function SelectCustomer() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const navigate = useNavigate()

  function fetchCustomers(search: string) {
    setLoading(true)
    const url = search.trim()
      ? `/api/Customers/Search?query=${encodeURIComponent(search)}`
      : '/api/Customers/Search'
    fetch(url)
      .then((r) => r.json())
      .then((data: Customer[]) => setResults(data))
      .catch(() => setResults([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchCustomers('')
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchCustomers(query), 300)
  }, [query])

  function selectCustomer(customer: Customer) {
    localStorage.setItem('selectedCustomerId', String(customer.customerId))
    localStorage.setItem('selectedCustomerName', customer.fullName)
    navigate('/dashboard')
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <h2 className="mb-3">Select Customer</h2>
        <div className="mb-3">
          <input
            type="text"
            className="form-control form-control-lg"
            placeholder="Search by name or email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>
        {loading && <div className="text-muted mb-2">Loading...</div>}
        {!loading && results.length > 0 && (
          <ul className="list-group">
            {results.map((c) => (
              <button
                key={c.customerId}
                type="button"
                className="list-group-item list-group-item-action"
                onClick={() => selectCustomer(c)}
              >
                <div className="fw-semibold">{c.fullName}</div>
                <div className="text-muted small">{c.email}</div>
                {(c.city || c.state) && (
                  <div className="text-muted small">
                    {[c.city, c.state].filter(Boolean).join(', ')}
                  </div>
                )}
                {c.loyaltyTier && (
                  <span className="badge bg-info text-dark mt-1">{c.loyaltyTier}</span>
                )}
              </button>
            ))}
          </ul>
        )}
        {!loading && query.trim() && results.length === 0 && (
          <p className="text-muted">No customers found.</p>
        )}
      </div>
    </div>
  )
}
