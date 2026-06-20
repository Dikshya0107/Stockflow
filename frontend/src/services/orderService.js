import api from './api';

export async function getOrders() {
  const response = await api.get('/orders');
  return response.data;
}

export async function getOrder(id) {
  const response = await api.get(`/orders/${id}`);
  return response.data;
}

export async function createOrder(order) {
  const response = await api.post('/orders', order);
  return response.data;
}

export async function cancelOrder(id) {
  await api.delete(`/orders/${id}`);
}
