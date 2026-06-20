import { NavLink, Outlet } from 'react-router-dom';
import './AppLayout.css';

function AppNav() {
  return (
    <header className="app-header">
      <div className="app-header-inner">
        <div className="app-brand-block">
          <NavLink to="/dashboard" className="app-brand">
            StockFlow
          </NavLink>
          <p className="app-tagline">Inventory & order management</p>
        </div>
        <nav className="app-nav" aria-label="Main navigation">
          <NavLink to="/dashboard" end className={({ isActive }) => (isActive ? 'active' : undefined)}>
            Dashboard
          </NavLink>
          <NavLink to="/products" className={({ isActive }) => (isActive ? 'active' : undefined)}>
            Products
          </NavLink>
          <NavLink to="/customers" className={({ isActive }) => (isActive ? 'active' : undefined)}>
            Customers
          </NavLink>
          <NavLink to="/orders" className={({ isActive }) => (isActive ? 'active' : undefined)}>
            Orders
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

function AppLayout() {
  return (
    <div className="app-layout">
      <AppNav />
      <main className="app-main">
        <Outlet />
      </main>
      <footer className="app-footer">
        <p>
          Track stock levels, manage customers, and place orders — all in one place.
          Stock updates automatically when orders are created or cancelled.
        </p>
      </footer>
    </div>
  );
}

export default AppLayout;
