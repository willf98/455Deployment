import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import type { DashboardData } from '../types/DashboardData'
import { apiFetch } from '../lib/apiFetch'

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const id = localStorage.getItem('selectedCustomerId')
    if (!id) {
      setLoading(false)
      return
    }
    apiFetch(`/api/Customers/${id}/Dashboard`)
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load dashboard')
        return r.json()
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [navigate])

  if (loading) return <div className="text-center mt-5"><div className="spinner-border" /></div>
  if (error) return <div className="alert alert-danger">{error}</div>
  if (!data) return (
    <div className="text-center mt-5">
      <p className="text-muted mb-3">No customer selected. Please select a customer first.</p>
      <Link to="/select-customer" className="btn btn-primary">Select Customer</Link>
    </div>
  )

  const { customer, totalOrders, totalSpend, recentOrders } = data

  return (
    <div>
      <h2 className="mb-4">Customer Dashboard</h2>
      <div className="row g-4">
        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-header bg-primary text-white fw-semibold">Customer Info</div>
            <div className="card-body">
              <p className="mb-1"><strong>{customer.fullName}</strong></p>
              <p className="mb-1 text-muted">{customer.email}</p>
              {(customer.city || customer.state) && (
                <p className="mb-1">{[customer.city, customer.state].filter(Boolean).join(', ')}</p>
              )}
              {customer.loyaltyTier && (
                <span className="badge bg-info text-dark mt-2">{customer.loyaltyTier}</span>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-header bg-success text-white fw-semibold">Stats</div>
            <div className="card-body">
              <div className="mb-3">
                <div className="text-muted small">Total Orders</div>
                <div className="fs-3 fw-bold">{totalOrders}</div>
              </div>
              <div>
                <div className="text-muted small">Total Spend</div>
                <div className="fs-3 fw-bold">
                  {totalSpend.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-12">
          <div className="card">
            <div className="card-header bg-secondary text-white fw-semibold">Recent Orders</div>
            <div className="card-body p-0">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Shipped</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.length === 0 && (
                    <tr><td colSpan={4} className="text-center text-muted">No orders yet.</td></tr>
                  )}
                  {recentOrders.map((o) => (
                    <tr key={o.orderId}>
                      <td>#{o.orderId}</td>
                      <td>{new Date(o.orderDatetime).toLocaleDateString()}</td>
                      <td>{o.orderTotal.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                      <td>{o.isShipped ? '✅' : '⏳'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
