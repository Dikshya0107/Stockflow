import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import AddCustomerPage from './pages/AddCustomerPage';
import AddProductPage from './pages/AddProductPage';
import CreateOrderPage from './pages/CreateOrderPage';
import CustomersPage from './pages/CustomersPage';
import DashboardPage from './pages/DashboardPage';
import EditProductPage from './pages/EditProductPage';
import OrderDetailPage from './pages/OrderDetailPage';
import OrdersPage from './pages/OrdersPage';
import ProductsPage from './pages/ProductsPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/new" element={<AddProductPage />} />
          <Route path="/products/:id/edit" element={<EditProductPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/customers/new" element={<AddCustomerPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/new" element={<CreateOrderPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
