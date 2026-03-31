import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Product } from '../types/Product'

interface LineItem {
  productId: number
  quantity: number
}

export default function PlaceOrder() {
  const [products, setProducts] = useState<Product[]>([])
  const [items, setItems] = useState<LineItem[]>([{ productId: 0, quantity: 1 }])
  const [paymentMethod, setPaymentMethod] = useState('credit_card')
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const id = localStorage.getItem('selectedCustomerId')
    if (!id) {
      navigate('/select-customer')
      return
    }
    fetch('/api/Products/Active')
      .then((r) => r.json())
      .then(setProducts)
      .catch(() => setErrorMsg('Failed to load products.'))
  }, [navigate])

  function addItem() {
    setItems([...items, { productId: 0, quantity: 1 }])
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index))
  }

  function updateItem(index: number, field: keyof LineItem, value: number) {
    const updated = [...items]
    updated[index] = { ...updated[index], [field]: value }
    setItems(updated)
  }

  function computeTotal() {
    return items.reduce((sum, item) => {
      const product = products.find((p) => p.productId === item.productId)
      return sum + (product ? product.price * item.quantity : 0)
    }, 0)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    const customerId = Number(localStorage.getItem('selectedCustomerId'))
    const validItems = items.filter((i) => i.productId > 0 && i.quantity > 0)
    if (validItems.length === 0) {
      setErrorMsg('Please add at least one item.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/Orders/Place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, paymentMethod, items: validItems }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setSuccessMsg(`Order #${data.orderId} placed successfully!`)
        setTimeout(() => navigate('/orders'), 1500)
      } else {
        setErrorMsg(data.message || 'Order failed.')
      }
    } catch {
      setErrorMsg('Network error placing order.')
    } finally {
      setLoading(false)
    }
  }

  const subtotal = computeTotal()
  const shippingFee = 9.99
  const tax = subtotal * 0.08
  const total = subtotal + shippingFee + tax

  return (
    <div className="row justify-content-center">
      <div className="col-md-8">
        <h2 className="mb-4">Place Order</h2>
        {successMsg && <div className="alert alert-success">{successMsg}</div>}
        {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Payment Method</label>
            <select
              className="form-select"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="credit_card">Credit Card</option>
              <option value="debit_card">Debit Card</option>
              <option value="paypal">PayPal</option>
              <option value="apple_pay">Apple Pay</option>
              <option value="google_pay">Google Pay</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Items</label>
            {items.map((item, index) => (
              <div key={index} className="d-flex gap-2 mb-2 align-items-center">
                <select
                  className="form-select"
                  value={item.productId}
                  onChange={(e) => updateItem(index, 'productId', Number(e.target.value))}
                >
                  <option value={0}>— Select product —</option>
                  {products.map((p) => (
                    <option key={p.productId} value={p.productId}>
                      {p.productName} — {p.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  className="form-control"
                  style={{ width: '90px' }}
                  min={1}
                  value={item.quantity}
                  onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                />
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => removeItem(index)}
                  disabled={items.length === 1}
                >
                  Remove
                </button>
              </div>
            ))}
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={addItem}>
              + Add Item
            </button>
          </div>

          <div className="card mb-4">
            <div className="card-body">
              <div className="d-flex justify-content-between mb-1">
                <span>Subtotal</span>
                <span>{subtotal.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
              </div>
              <div className="d-flex justify-content-between mb-1">
                <span>Shipping</span>
                <span>$9.99</span>
              </div>
              <div className="d-flex justify-content-between mb-1">
                <span>Tax (8%)</span>
                <span>{tax.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between fw-bold fs-5">
                <span>Total</span>
                <span>{total.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
            Place Order
          </button>
        </form>
      </div>
    </div>
  )
}
