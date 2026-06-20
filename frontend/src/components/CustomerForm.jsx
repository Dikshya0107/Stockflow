import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCustomer } from '../services/customerService';
import { getApiErrorMessage } from '../utils/apiErrors';
import './ProductForm.css';

const initialForm = {
  full_name: '',
  email: '',
  phone: '',
};

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validate(form) {
  const errors = {};

  if (!form.full_name.trim()) {
    errors.full_name = 'Full name is required';
  }

  if (!form.email.trim()) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(form.email.trim())) {
    errors.email = 'Enter a valid email address';
  }

  if (!form.phone.trim()) {
    errors.phone = 'Phone number is required';
  }

  return errors;
}

function CustomerForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

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

    try {
      await createCustomer({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
      });
      navigate('/customers', { state: { message: 'Customer created successfully' } });
    } catch (err) {
      setApiError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="product-form" onSubmit={handleSubmit} noValidate>
      {apiError && (
        <div className="alert alert-error" role="alert">
          {apiError}
        </div>
      )}

      <div className="form-field">
        <label htmlFor="full_name">Full name</label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          value={form.full_name}
          onChange={handleChange}
          disabled={submitting}
        />
        {fieldErrors.full_name && (
          <p className="field-error">{fieldErrors.full_name}</p>
        )}
      </div>

      <div className="form-field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          disabled={submitting}
        />
        {fieldErrors.email && <p className="field-error">{fieldErrors.email}</p>}
      </div>

      <div className="form-field">
        <label htmlFor="phone">Phone</label>
        <input
          id="phone"
          name="phone"
          type="tel"
          value={form.phone}
          onChange={handleChange}
          disabled={submitting}
        />
        {fieldErrors.phone && <p className="field-error">{fieldErrors.phone}</p>}
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving...' : 'Create Customer'}
        </button>
      </div>
    </form>
  );
}

export default CustomerForm;
