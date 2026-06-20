import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { cancelOrder, getOrder } from '../services/orderService';
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

function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const orderId = Number(id);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const loadOrder = useCallback(async () => {
    if (Number.isNaN(orderId)) {
      setError('Invalid order ID');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getOrder(orderId);
      setOrder(data);
    } catch (err) {
      setError(getApiErrorMessage(err));
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const handleCancel = async () => {
    const confirmed = window.confirm(
      `Cancel order #${order.id}? Stock will be restored to inventory.`,
    );
    if (!confirmed) {
      return;
    }

    setCancelling(true);
    setError(null);

    try {
      await cancelOrder(order.id);
      navigate('/orders', {
        state: { message: `Order #${order.id} cancelled successfully` },
      });
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="products-page">
      <header className="page-header">
        <div>
          <h1>Order #{Number.isNaN(orderId) ? '—' : orderId}</h1>
          <p className="page-subtitle">Line items, pricing breakdown, and order status.</p>
        </div>
        <Link to="/orders" className="btn btn-secondary">
          Back to list
        </Link>
      </header>

      {loading && <p className="status">Loading order...</p>}

      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}

      {!loading && order && (
        <>
          <div className="order-summary">
            <p>
              <strong>Customer:</strong> {order.customer_name}
            </p>
            <p>
              <strong>Status:</strong> {order.status}
            </p>
            <p>
              <strong>Placed on:</strong> {formatDate(order.created_at)}
            </p>
            <p>
              <strong>Order total:</strong> {formatPrice(order.total_amount)}
            </p>
          </div>

          <div className="table-wrapper">
            <table className="products-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Unit price</th>
                  <th>Qty</th>
                  <th>Line total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td data-label="Product">{item.product_name}</td>
                    <td data-label="Unit price">{formatPrice(item.unit_price)}</td>
                    <td data-label="Qty">{item.quantity}</td>
                    <td data-label="Line total">{formatPrice(item.line_total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="detail-actions">
            <p className="page-hint detail-cancel-hint">
              Cancelling removes this order and puts the quantities back into stock.
            </p>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleCancel}
              disabled={cancelling}
            >
              {cancelling ? 'Cancelling...' : 'Cancel Order'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default OrderDetailPage;
