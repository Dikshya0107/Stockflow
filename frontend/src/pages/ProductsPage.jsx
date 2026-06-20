import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LOW_STOCK_THRESHOLD } from '../constants/inventory';
import { deleteProduct, getProducts } from '../services/productService';
import { getApiErrorMessage } from '../utils/apiErrors';
import './ProductsPage.css';

function formatPrice(price) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(price));
}

function ProductsPage() {
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(location.state?.message || null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (location.state?.message) {
      window.history.replaceState({}, document.title);
    }
  }, [location.state?.message]);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleDelete = async (product) => {
    const confirmed = window.confirm(
      `Delete "${product.name}" (${product.sku})? This cannot be undone.`,
    );
    if (!confirmed) {
      return;
    }

    setDeletingId(product.id);
    setError(null);

    try {
      await deleteProduct(product.id);
      setSuccessMessage(`"${product.name}" deleted successfully`);
      await loadProducts();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="products-page">
      <header className="page-header">
        <div>
          <h1>Products</h1>
          <p className="page-subtitle">
            Your product catalog — each item has a unique SKU, price, and stock level.
          </p>
          <p className="page-hint">
            Stock decreases when orders are placed and is restored if an order is cancelled.
          </p>
        </div>
        <Link to="/products/new" className="btn btn-primary">
          Add Product
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

      {loading && <p className="status">Loading products...</p>}

      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="empty-state">
          <span className="empty-title">No products in your catalog yet</span>
          <p>Add your first product with a name, SKU, price, and starting stock quantity.</p>
          <Link to="/products/new" className="btn btn-primary">
            Add Product
          </Link>
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <div className="table-wrapper">
          <table className="products-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Stock</th>
                <th className="actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const isLowStock = product.quantity_in_stock < LOW_STOCK_THRESHOLD;
                const isDeleting = deletingId === product.id;

                return (
                  <tr key={product.id}>
                    <td data-label="Name">{product.name}</td>
                    <td data-label="SKU">
                      <code>{product.sku}</code>
                    </td>
                    <td data-label="Price">{formatPrice(product.price)}</td>
                    <td data-label="Stock">
                      <span className={isLowStock ? 'stock-low' : undefined}>
                        {product.quantity_in_stock}
                      </span>
                      {isLowStock && (
                        <span className="stock-badge">Low</span>
                      )}
                    </td>
                    <td data-label="Actions" className="actions-col">
                      <div className="row-actions">
                        <Link
                          to={`/products/${product.id}/edit`}
                          className="btn btn-secondary btn-small"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          className="btn btn-danger btn-small"
                          onClick={() => handleDelete(product)}
                          disabled={isDeleting}
                        >
                          {isDeleting ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ProductsPage;
