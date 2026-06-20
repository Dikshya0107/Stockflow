import api from './api';

export async function getCustomers() {
  const response = await api.get('/customers');
  return response.data;
}

export async function getCustomer(id) {
  const response = await api.get(`/customers/${id}`);
  return response.data;
}

export async function createCustomer(customer) {
  const response = await api.post('/customers', customer);
  return response.data;
}

export async function deleteCustomer(id) {
  await api.delete(`/customers/${id}`);
}
