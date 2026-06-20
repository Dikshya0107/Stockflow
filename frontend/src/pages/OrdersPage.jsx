import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getOrders } from '../services/orderService';
import { getApiErrorMessage } from '../utils/apiErrors';
import './ProductsPage.css';

function formatPrice(price) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(price));
}

function formatDate(value) {
  return new Date(value).toLocaleString();
}

function OrdersPage() {
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(location.state?.message || null);

  useEffect(() => {
    if (location.state?.message) {
      window.history.replaceState({}, document.title);
    }
  }, [location.state?.message]);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  return (
    <div className="products-page">
      <header className="page-header">
        <div>
          <h1>Orders</h1>
          <p className="page-subtitle">
            Sales linked to a customer — totals are calculated automatically and stock is updated.
          </p>
          <p className="page-hint">Cancelling an order returns items back to inventory.</p>
        </div>
        <Link to="/orders/new" className="btn btn-primary">
          Create Order
        </Link>
      </header>

      {successMessage && (
        <div className="alert alert-success" role="status">
          {successMessage}
          <button
            type="button"
            className="alert-dismiss"
            onClick={() => setSuccessMessage(null)}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}

      {loading && <p className="status">Loading orders...</p>}

      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="empty-state">
          <span className="empty-title">No orders yet</span>
          <p>Create an order by selecting a customer and the products they want to buy.</p>
          <Link to="/orders/new" className="btn btn-primary">
            Create Order
          </Link>
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <div className="table-wrapper">
          <table className="products-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Date</th>
                <th className="actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td data-label="Order ID">#{order.id}</td>
                  <td data-label="Customer">{order.customer_name}</td>
                  <td data-label="Total">{formatPrice(order.total_amount)}</td>
                  <td data-label="Date">{formatDate(order.created_at)}</td>
                  <td data-label="Actions" className="actions-col">
                    <Link
                      to={`/orders/${order.id}`}
                      className="btn btn-secondary btn-small"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default OrdersPage;
