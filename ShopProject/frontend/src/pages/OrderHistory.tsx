import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Order } from '../types/Order'

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const id = localStorage.getItem('selectedCustomerId')
    if (!id) {
      navigate('/select-customer')
      return
    }
    fetch(`/api/Orders/Customer/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load orders')
        return r.json()
      })
      .then(setOrders)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [navigate])

  if (loading) return <div className="text-center mt-5"><div className="spinner-border" /></div>
  if (error) return <div className="alert alert-danger">{error}</div>

  return (
    <div>
      <h2 className="mb-4">Order History</h2>
      {orders.length === 0 ? (
        <p className="text-muted">No orders found.</p>
      ) : (
        <div className="card">
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
                {orders.map((o) => (
                  <tr
                    key={o.orderId}
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/orders/${o.orderId}`)}
                  >
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
      )}
    </div>
  )
}
