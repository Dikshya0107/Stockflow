import { Link } from 'react-router-dom';
import CustomerForm from '../components/CustomerForm';
import './ProductsPage.css';

function AddCustomerPage() {
  return (
    <div className="products-page">
      <header className="page-header">
        <div>
          <h1>Add Customer</h1>
          <p className="page-subtitle">Register a new customer before placing orders for them.</p>
        </div>
        <Link to="/customers" className="btn btn-secondary">
          Back to list
        </Link>
      </header>
      <CustomerForm />
    </div>
  );
}

export default AddCustomerPage;
