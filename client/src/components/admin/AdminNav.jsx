import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiGrid, FiPackage, FiShoppingCart, FiUsers } from 'react-icons/fi';

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: <FiGrid size={15} />, end: true },
  { to: '/admin/products', label: 'Products', icon: <FiPackage size={15} /> },
  { to: '/admin/orders', label: 'Orders', icon: <FiShoppingCart size={15} /> },
  { to: '/admin/users', label: 'Users', icon: <FiUsers size={15} /> },
];

const AdminNav = () => (
  <nav className="admin-nav">
    {NAV.map(({ to, label, icon, end }) => (
      <NavLink
        key={to}
        to={to}
        end={end}
        className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}
      >
        {icon} {label}
      </NavLink>
    ))}
  </nav>
);

export default AdminNav;
