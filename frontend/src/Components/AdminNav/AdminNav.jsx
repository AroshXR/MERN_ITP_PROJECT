import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthGuard/authGuard';
import { 
  Home, 
  Package, 
  ShoppingCart, 
  CreditCard, 
  Users, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import './AdminNav.css';

const AdminNav = () => {
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const adminMenuItems = [
    {
      title: 'Dashboard',
      path: '/adminHome',
      icon: <Home size={20} />,
      description: 'Admin overview and statistics'
    },
    {
      title: 'Inventory Management',
      path: '/inventoryManagement',
      icon: <Package size={20} />,
      description: 'Manage product inventory'
    },
    {
      title: 'Order Management',
      path: '/orderManagement',
      icon: <ShoppingCart size={20} />,
      description: 'View and manage orders'
    },
    {
      title: 'Payment Management',
      path: '/paymentManagement',
      icon: <CreditCard size={20} />,
      description: 'Monitor payments and transactions'
    },
    {
      title: 'Supplier Management',
      path: '/supplierManagement',
      icon: <Users size={20} />,
      description: 'Manage supplier relationships'
    }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="admin-nav-container">
      {/* Desktop Navigation */}
      <nav className="admin-nav">
        <div className="admin-nav-header">
          <h2 className="admin-logo">Admin Panel</h2>
          <button 
            className="mobile-menu-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <div className={`admin-nav-menu ${isMenuOpen ? 'active' : ''}`}>
          {adminMenuItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className={`admin-nav-item ${isActivePath(item.path) ? 'active' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="nav-item-icon">
                {item.icon}
              </div>
              <div className="nav-item-content">
                <span className="nav-item-title">{item.title}</span>
                <span className="nav-item-description">{item.description}</span>
              </div>
            </Link>
          ))}

          <div className="admin-nav-divider"></div>

          <button 
            className="admin-nav-item logout-btn"
            onClick={handleLogout}
          >
            <div className="nav-item-icon">
              <LogOut size={20} />
            </div>
            <div className="nav-item-content">
              <span className="nav-item-title">Logout</span>
              <span className="nav-item-description">Sign out of admin panel</span>
            </div>
          </button>
        </div>
      </nav>

      {/* Mobile Overlay */}
      {isMenuOpen && (
        <div 
          className="mobile-overlay"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default AdminNav;
