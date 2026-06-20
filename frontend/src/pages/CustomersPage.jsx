import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { deleteCustomer, getCustomers } from '../services/customerService';
import { getApiErrorMessage } from '../utils/apiErrors';
import './ProductsPage.css';

function CustomersPage() {
  const location = useLocation();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(location.state?.message || null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (location.state?.message) {
      window.history.replaceState({}, document.title);
    }
  }, [location.state?.message]);

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const handleDelete = async (customer) => {
    const confirmed = window.confirm(
      `Delete "${customer.full_name}" (${customer.email})? This cannot be undone.`,
    );
    if (!confirmed) {
      return;
    }

    setDeletingId(customer.id);
    setError(null);

    try {
      await deleteCustomer(customer.id);
      setSuccessMessage(`"${customer.full_name}" deleted successfully`);
      await loadCustomers();
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
          <h1>Customers</h1>
          <p className="page-subtitle">
            People and businesses you sell to — required before creating an order.
          </p>
          <p className="page-hint">Each customer must have a unique email address.</p>
        </div>
        <Link to="/customers/new" className="btn btn-primary">
          Add Customer
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

      {loading && <p className="status">Loading customers...</p>}

      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && customers.length === 0 && (
        <div className="empty-state">
          <span className="empty-title">No customers registered</span>
          <p>Add a customer with their name, email, and phone to start taking orders.</p>
          <Link to="/customers/new" className="btn btn-primary">
            Add Customer
          </Link>
        </div>
      )}

      {!loading && !error && customers.length > 0 && (
        <div className="table-wrapper">
          <table className="products-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th className="actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => {
                const isDeleting = deletingId === customer.id;

                return (
                  <tr key={customer.id}>
                    <td data-label="Name">{customer.full_name}</td>
                    <td data-label="Email">{customer.email}</td>
                    <td data-label="Phone">{customer.phone}</td>
                    <td data-label="Actions" className="actions-col">
                      <button
                        type="button"
                        className="btn btn-danger btn-small"
                        onClick={() => handleDelete(customer)}
                        disabled={isDeleting}
                      >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                      </button>
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

export default CustomersPage;
