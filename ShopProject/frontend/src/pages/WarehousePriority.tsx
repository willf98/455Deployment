import { useState, useEffect } from 'react'
import type { PriorityQueueItem } from '../types/PriorityQueue'

export default function WarehousePriority() {
  const [items, setItems] = useState<PriorityQueueItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/Warehouse/PriorityQueue')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load priority queue')
        return r.json()
      })
      .then(setItems)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center mt-5"><div className="spinner-border" /></div>
  if (error) return <div className="alert alert-danger">{error}</div>

  return (
    <div>
      <h2 className="mb-2">Late Delivery Priority Queue</h2>
      <p className="text-muted mb-4">
        These unshipped orders are ranked by predicted late-delivery probability. Process the top entries first.
      </p>

      {items.length === 0 ? (
        <div className="alert alert-info">
          No predictions yet — use the <a href="/scoring">Run Scoring</a> page to generate predictions.
        </div>
      ) : (
        <div className="card">
          <div className="card-body p-0">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Order Date</th>
                  <th>Total</th>
                  <th>Late Delivery %</th>
                  <th>Predicted Late</th>
                  <th>Scored At</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.orderId}>
                    <td>#{item.orderId}</td>
                    <td>{item.customerName}</td>
                    <td>{new Date(item.orderDatetime).toLocaleDateString()}</td>
                    <td>{item.orderTotal.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                    <td>
                      <span className={`badge ${(item.lateDeliveryProbability ?? 0) > 0.7 ? 'bg-danger' : (item.lateDeliveryProbability ?? 0) > 0.4 ? 'bg-warning text-dark' : 'bg-success'}`}>
                        {item.lateDeliveryProbability != null
                          ? `${(item.lateDeliveryProbability * 100).toFixed(1)}%`
                          : 'N/A'}
                      </span>
                    </td>
                    <td>{item.predictedLateDelivery === 1 ? '⚠️ Yes' : '✅ No'}</td>
                    <td>
                      {item.predictionTimestamp
                        ? new Date(item.predictionTimestamp).toLocaleString()
                        : '—'}
                    </td>
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
