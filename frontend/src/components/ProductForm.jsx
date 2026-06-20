import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProduct, getProduct, updateProduct } from '../services/productService';
import { getApiErrorMessage } from '../utils/apiErrors';
import './ProductForm.css';

const emptyForm = {
  name: '',
  sku: '',
  price: '',
  quantity_in_stock: '0',
};

function validate(form) {
  const errors = {};

  if (!form.name.trim()) {
    errors.name = 'Name is required';
  }

  if (!form.sku.trim()) {
    errors.sku = 'SKU is required';
  }

  const price = Number(form.price);
  if (form.price === '' || Number.isNaN(price)) {
    errors.price = 'Price is required';
  } else if (price <= 0) {
    errors.price = 'Price must be greater than 0';
  }

  const quantity = Number(form.quantity_in_stock);
  if (form.quantity_in_stock === '' || Number.isNaN(quantity)) {
    errors.quantity_in_stock = 'Quantity is required';
  } else if (quantity < 0) {
    errors.quantity_in_stock = 'Quantity cannot be negative';
  }

  return errors;
}

function ProductForm({ productId = null }) {
  const navigate = useNavigate();
  const isEdit = productId !== null;

  const [form, setForm] = useState(emptyForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!isEdit) {
      return;
    }

    getProduct(productId)
      .then((product) => {
        setForm({
          name: product.name,
          sku: product.sku,
          price: String(product.price),
          quantity_in_stock: String(product.quantity_in_stock),
        });
        setApiError(null);
      })
      .catch((err) => {
        if (err.response?.status === 404) {
          setNotFound(true);
        } else {
          setApiError(getApiErrorMessage(err));
        }
      })
      .finally(() => setLoading(false));
  }, [isEdit, productId]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    setApiError(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const errors = validate(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);
    setApiError(null);

    const payload = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      price: Number(form.price),
      quantity_in_stock: Number(form.quantity_in_stock),
    };

    try {
      if (isEdit) {
        await updateProduct(productId, payload);
        navigate('/products', { state: { message: 'Product updated successfully' } });
      } else {
        await createProduct(payload);
        navigate('/products', { state: { message: 'Product created successfully' } });
      }
    } catch (err) {
      setApiError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p className="status">Loading product...</p>;
  }

  if (notFound) {
    return (
      <div className="alert alert-error" role="alert">
        Product not found. It may have been deleted.
      </div>
    );
  }

  return (
    <form className="product-form" onSubmit={handleSubmit} noValidate>
      {apiError && (
        <div className="alert alert-error" role="alert">
          {apiError}
        </div>
      )}

      <div className="form-field">
        <label htmlFor="name">Product name</label>
        <input
          id="name"
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          disabled={submitting}
        />
        {fieldErrors.name && <p className="field-error">{fieldErrors.name}</p>}
      </div>

      <div className="form-field">
        <label htmlFor="sku">SKU</label>
        <input
          id="sku"
          name="sku"
          type="text"
          value={form.sku}
          onChange={handleChange}
          disabled={submitting}
        />
        {fieldErrors.sku && <p className="field-error">{fieldErrors.sku}</p>}
      </div>

      <div className="form-field">
        <label htmlFor="price">Price</label>
        <input
          id="price"
          name="price"
          type="number"
          min="0.01"
          step="0.01"
          value={form.price}
          onChange={handleChange}
          disabled={submitting}
        />
        {fieldErrors.price && <p className="field-error">{fieldErrors.price}</p>}
      </div>

      <div className="form-field">
        <label htmlFor="quantity_in_stock">Quantity in stock</label>
        <input
          id="quantity_in_stock"
          name="quantity_in_stock"
          type="number"
          min="0"
          step="1"
          value={form.quantity_in_stock}
          onChange={handleChange}
          disabled={submitting}
        />
        {fieldErrors.quantity_in_stock && (
          <p className="field-error">{fieldErrors.quantity_in_stock}</p>
        )}
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Product'}
        </button>
      </div>
    </form>
  );
}

export default ProductForm;
