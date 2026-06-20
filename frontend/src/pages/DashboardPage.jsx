import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCustomers } from '../services/customerService';
import { getOrders } from '../services/orderService';
import { getProducts } from '../services/productService';
import { getApiErrorMessage } from '../utils/apiErrors';
import { LOW_STOCK_THRESHOLD } from '../constants/inventory';
import './DashboardPage.css';
import './ProductsPage.css';

function formatPrice(price) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(price));
}

function DashboardPage() {
  const [stats, setStats] = useState({
    productCount: 0,
    customerCount: 0,
    orderCount: 0,
    lowStockProducts: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([getProducts(), getCustomers(), getOrders()])
      .then(([products, customers, orders]) => {
        const lowStockProducts = products.filter(
          (product) => product.quantity_in_stock < LOW_STOCK_THRESHOLD,
        );

        setStats({
          productCount: products.length,
          customerCount: customers.length,
          orderCount: orders.length,
          lowStockProducts,
        });
        setError(null);
      })
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="products-page dashboard-page">
      <section className="welcome-card">
        <h1>Welcome back</h1>
        <p>
          Here is a snapshot of your business today — inventory on hand, registered
          customers, and recent order activity.
        </p>
      </section>

      {loading && <p className="status">Loading your dashboard...</p>}

      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="stats-grid">
            <Link to="/products" className="stat-card">
              <span className="stat-label">Products in catalog</span>
              <span className="stat-value">{stats.productCount}</span>
              <span className="stat-hint">View and update inventory</span>
            </Link>
            <Link to="/customers" className="stat-card">
              <span className="stat-label">Registered customers</span>
              <span className="stat-value">{stats.customerCount}</span>
              <span className="stat-hint">People you can bill orders to</span>
            </Link>
            <Link to="/orders" className="stat-card">
              <span className="stat-label">Orders placed</span>
              <span className="stat-value">{stats.orderCount}</span>
              <span className="stat-hint">Sales recorded in the system</span>
            </Link>
            <div className={`stat-card ${stats.lowStockProducts.length > 0 ? 'stat-card-warning' : ''}`}>
              <span className="stat-label">Needs restocking</span>
              <span className="stat-value">{stats.lowStockProducts.length}</span>
              <span className="stat-hint">
                Items below {LOW_STOCK_THRESHOLD} units
              </span>
            </div>
          </div>

          <section className="quick-actions">
            <h2>Quick actions</h2>
            <div className="quick-actions-grid">
              <Link to="/products/new" className="quick-action-card">
                <strong>Add product</strong>
                <span>Expand your catalog with a new SKU</span>
              </Link>
              <Link to="/customers/new" className="quick-action-card">
                <strong>Add customer</strong>
                <span>Register someone before placing an order</span>
              </Link>
              <Link to="/orders/new" className="quick-action-card">
                <strong>Create order</strong>
                <span>Sell items and reduce stock automatically</span>
              </Link>
            </div>
          </section>

          <section className="dashboard-section">
            <div className="section-heading">
              <h2>Low stock alert</h2>
              <p>Products that may need reordering soon.</p>
            </div>
            {stats.lowStockProducts.length === 0 ? (
              <div className="dashboard-empty">
                <strong>Inventory looks healthy.</strong>
                <p>
                  Every product is above the low-stock threshold of{' '}
                  {LOW_STOCK_THRESHOLD} units. You will see items listed here when
                  stock runs low.
                </p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="products-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>SKU</th>
                      <th>Stock</th>
                      <th>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.lowStockProducts.map((product) => (
                      <tr key={product.id}>
                        <td data-label="Product">{product.name}</td>
                        <td data-label="SKU">
                          <code>{product.sku}</code>
                        </td>
                        <td data-label="Stock">
                          <span className="stock-low">{product.quantity_in_stock}</span>
                          <span className="stock-badge">Low</span>
                        </td>
                        <td data-label="Price">{formatPrice(product.price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

export default DashboardPage;
