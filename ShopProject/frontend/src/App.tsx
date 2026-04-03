import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom'
import SelectCustomer from './pages/SelectCustomer'
import Dashboard from './pages/Dashboard'
import PlaceOrder from './pages/PlaceOrder'
import OrderHistory from './pages/OrderHistory'
import OrderDetailPage from './pages/OrderDetail'
import WarehousePriority from './pages/WarehousePriority'
import RunScoring from './pages/RunScoring'
import NotebookViewer from './pages/NotebookViewer'

function Navbar() {
  const customerName = localStorage.getItem('selectedCustomerName')

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
      <span className="navbar-brand fw-bold">ShopProject</span>
      <button
        className="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navMenu"
      >
        <span className="navbar-toggler-icon"></span>
      </button>
      <div className="collapse navbar-collapse" id="navMenu">
        <ul className="navbar-nav me-auto">
          <li className="nav-item">
            <NavLink className="nav-link" to="/select-customer">Select Customer</NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link" to="/dashboard">Dashboard</NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link" to="/place-order">Place Order</NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link" to="/orders">Order History</NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link" to="/warehouse/priority">Warehouse</NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link" to="/scoring">Run Scoring</NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link" to="/notebook">Fraud Notebook</NavLink>
          </li>
        </ul>
        <span className="navbar-text text-light">
          {customerName ? (
            <span className="badge bg-success ms-2">{customerName}</span>
          ) : (
            <span className="badge bg-secondary ms-2">No customer selected</span>
          )}
        </span>
      </div>
    </nav>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<Navigate to="/select-customer" replace />} />
          <Route path="/select-customer" element={<SelectCustomer />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/place-order" element={<PlaceOrder />} />
          <Route path="/orders" element={<OrderHistory />} />
          <Route path="/orders/:orderId" element={<OrderDetailPage />} />
          <Route path="/warehouse/priority" element={<WarehousePriority />} />
          <Route path="/scoring" element={<RunScoring />} />
          <Route path="/notebook" element={<NotebookViewer />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
