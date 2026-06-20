import { Link } from 'react-router-dom';
import ProductForm from '../components/ProductForm';
import './ProductsPage.css';

function AddProductPage() {
  return (
    <div className="products-page">
      <header className="page-header">
        <div>
          <h1>Add Product</h1>
          <p className="page-subtitle">Add a new item to your inventory catalog.</p>
          <p className="page-hint">SKU must be unique — it is how you identify products in orders.</p>
        </div>
        <Link to="/products" className="btn btn-secondary">
          Back to list
        </Link>
      </header>
      <ProductForm />
    </div>
  );
}

export default AddProductPage;
