import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCustomers } from '../services/customerService';
import { createOrder } from '../services/orderService';
import { getProducts } from '../services/productService';
import { getApiErrorMessage } from '../utils/apiErrors';
import './ProductsPage.css';
import './CreateOrderPage.css';

const emptyLineItem = { product_id: '', quantity: '1' };

function formatPrice(price) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(price));
}

function CreateOrderPage() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [lineItems, setLineItems] = useState([{ ...emptyLineItem }]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    Promise.all([getCustomers(), getProducts()])
      .then(([customerData, productData]) => {
        setCustomers(customerData);
        setProducts(productData);
        setLoadError(null);
      })
      .catch((err) => setLoadError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const previewTotal = useMemo(() => {
    return lineItems.reduce((sum, item) => {
      const product = products.find((p) => p.id === Number(item.product_id));
      if (!product || !item.quantity) {
        return sum;
      }
      return sum + Number(product.price) * Number(item.quantity);
    }, 0);
  }, [lineItems, products]);

  const canSubmit =
    customerId &&
    lineItems.some((item) => item.product_id && Number(item.quantity) > 0) &&
    !submitting;

  const handleLineItemChange = (index, field, value) => {
    setLineItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
    setApiError(null);
  };

  const addLineItem = () => {
    setLineItems((prev) => [...prev, { ...emptyLineItem }]);
  };

  const removeLineItem = (index) => {
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }

    const items = lineItems
      .filter((item) => item.product_id && Number(item.quantity) > 0)
      .map((item) => ({
        product_id: Number(item.product_id),
        quantity: Number(item.quantity),
      }));

    setSubmitting(true);
    setApiError(null);

    try {
      const order = await createOrder({
        customer_id: Number(customerId),
        items,
      });
      navigate('/orders', {
        state: { message: `Order #${order.id} created successfully` },
      });
    } catch (err) {
      setApiError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="products-page">
        <p className="status">Loading form data...</p>
      </div>
    );
  }

  return (
    <div className="products-page">
      <header className="page-header">
        <div>
          <h1>Create Order</h1>
          <p className="page-subtitle">
            Link a customer to one or more products — stock and totals update on submit.
          </p>
          <p className="page-hint">
            The final total is always calculated by the server, not your browser.
          </p>
        </div>
        <Link to="/orders" className="btn btn-secondary">
          Back to list
        </Link>
      </header>

      {loadError && (
        <div className="alert alert-error" role="alert">
          {loadError}
        </div>
      )}

      {!loadError && customers.length === 0 && (
        <div className="empty-state">
          <span className="empty-title">You need customers first</span>
          <p>Every order must be tied to a registered customer.</p>
          <Link to="/customers/new" className="btn btn-primary">
            Add Customer
          </Link>
        </div>
      )}

      {!loadError && products.length === 0 && customers.length > 0 && (
        <div className="empty-state">
          <span className="empty-title">You need products first</span>
          <p>Add items to your catalog before you can sell them in an order.</p>
          <Link to="/products/new" className="btn btn-primary">
            Add Product
          </Link>
        </div>
      )}

      {!loadError && customers.length > 0 && products.length > 0 && (
        <form className="order-form" onSubmit={handleSubmit}>
          {apiError && (
            <div className="alert alert-error" role="alert">
              {apiError}
            </div>
          )}

          <div className="form-field">
            <label htmlFor="customer_id">Customer</label>
            <select
              id="customer_id"
              value={customerId}
              onChange={(e) => {
                setCustomerId(e.target.value);
                setApiError(null);
              }}
              disabled={submitting}
            >
              <option value="">Select a customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.full_name} ({customer.email})
                </option>
              ))}
            </select>
          </div>

          <div className="line-items-section">
            <div className="line-items-header">
              <h2>Order items</h2>
              <button
                type="button"
                className="btn btn-secondary btn-small"
                onClick={addLineItem}
                disabled={submitting}
              >
                + Add item
              </button>
            </div>

            {lineItems.map((item, index) => {
              const selectedProduct = products.find(
                (p) => p.id === Number(item.product_id),
              );

              return (
                <div key={index} className="line-item-row">
                  <div className="form-field">
                    <label htmlFor={`product-${index}`}>Product</label>
                    <select
                      id={`product-${index}`}
                      value={item.product_id}
                      onChange={(e) =>
                        handleLineItemChange(index, 'product_id', e.target.value)
                      }
                      disabled={submitting}
                    >
                      <option value="">Select product</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} — {formatPrice(product.price)} (stock:{' '}
                          {product.quantity_in_stock})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-field quantity-field">
                    <label htmlFor={`quantity-${index}`}>Qty</label>
                    <input
                      id={`quantity-${index}`}
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        handleLineItemChange(index, 'quantity', e.target.value)
                      }
                      disabled={submitting}
                    />
                  </div>

                  {lineItems.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-danger btn-small remove-item-btn"
                      onClick={() => removeLineItem(index)}
                      disabled={submitting}
                    >
                      Remove
                    </button>
                  )}

                  {selectedProduct && (
                    <p className="line-subtotal">
                      Line: {formatPrice(Number(selectedProduct.price) * Number(item.quantity || 0))}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="order-preview-total">
            <span>Estimated total (backend calculates final):</span>
            <strong>{formatPrice(previewTotal)}</strong>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!canSubmit}
            >
              {submitting ? 'Creating...' : 'Create Order'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default CreateOrderPage;
