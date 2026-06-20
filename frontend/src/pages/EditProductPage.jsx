import { Link, useParams } from 'react-router-dom';
import ProductForm from '../components/ProductForm';
import './ProductsPage.css';

function EditProductPage() {
  const { id } = useParams();
  const productId = Number(id);

  return (
    <div className="products-page">
      <header className="page-header">
        <div>
          <h1>Edit Product</h1>
          <p className="page-subtitle">Update pricing, stock, or product details.</p>
        </div>
        <Link to="/products" className="btn btn-secondary">
          Back to list
        </Link>
      </header>
      {Number.isNaN(productId) ? (
        <div className="alert alert-error" role="alert">
          Invalid product ID.
        </div>
      ) : (
        <ProductForm productId={productId} />
      )}
    </div>
  );
}

export default EditProductPage;
