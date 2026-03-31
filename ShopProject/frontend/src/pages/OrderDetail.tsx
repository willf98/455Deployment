import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { OrderDetail } from '../types/Order'

export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const [detail, setDetail] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (!orderId) return
    fetch(`/api/Orders/${orderId}/Items`)
      .then((r) => {
        if (!r.ok) throw new Error('Order not found')
        return r.json()
      })
      .then(setDetail)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [orderId])

  if (loading) return <div className="text-center mt-5"><div className="spinner-border" /></div>
  if (error) return <div className="alert alert-danger">{error}</div>
  if (!detail) return null

  return (
    <div>
      <button className="btn btn-outline-secondary btn-sm mb-3" onClick={() => navigate('/orders')}>
        ← Back to Orders
      </button>
      <h2 className="mb-3">Order #{detail.orderId}</h2>

      <div className="card mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-sm-3">
              <div className="text-muted small">Date</div>
              <div>{new Date(detail.orderDatetime).toLocaleString()}</div>
            </div>
            <div className="col-sm-3">
              <div className="text-muted small">Order Total</div>
              <div className="fw-semibold">
                {detail.orderTotal.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
              </div>
            </div>
            <div className="col-sm-3">
              <div className="text-muted small">Payment Method</div>
              <div>{detail.paymentMethod}</div>
            </div>
          </div>
        </div>
      </div>

      <h5 className="mb-3">Line Items</h5>
      <div className="card">
        <div className="card-body p-0">
          <table className="table mb-0">
            <thead className="table-light">
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Line Total</th>
              </tr>
            </thead>
            <tbody>
              {detail.items.map((item, i) => (
                <tr key={i}>
                  <td>{item.productName}</td>
                  <td>{item.quantity}</td>
                  <td>{item.unitPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                  <td>{item.lineTotal.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
