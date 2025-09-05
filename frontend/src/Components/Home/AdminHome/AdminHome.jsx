import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../AuthGuard/authGuard';
import AdminNav from '../../AdminNav/AdminNav';
import Footer from '../../Footer/Footer';
import { 
  Package, 
  Users, 
  ShoppingCart, 
  CreditCard, 
  BarChart3, 
  Settings,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import './AdminHome.css';

function AdminHome() {
  const { isAuthenticated, currentUser } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalItems: 0,
    lowStockItems: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    activeUsers: 0
  });

  useEffect(() => {
    if (!isAuthenticated() || currentUser?.type !== 'Admin') {
      navigate('/unauthorized');
      return;
    }
    // In a real app, you'd fetch these stats from the backend
    // For now, using mock data
    setStats({
      totalItems: 156,
      lowStockItems: 8,
      totalOrders: 342,
      pendingOrders: 23,
      totalRevenue: 45678,
      activeUsers: 89
    });
  }, [isAuthenticated, currentUser, navigate]);

  const adminModules = [
    {
      title: 'Inventory Management',
      description: 'Manage product inventory, add/edit items, track stock levels',
      icon: <Package size={32} />,
      path: '/inventoryManagement',
      color: '#3B82F6',
      stats: `${stats.totalItems} items`
    },
    {
      title: 'Order Management',
      description: 'View and manage customer orders, track order status',
      icon: <ShoppingCart size={32} />,
      path: '/orderManagement',
      color: '#10B981',
      stats: `${stats.pendingOrders} pending`
    },
    {
      title: 'Payment Management',
      description: 'Monitor payments, refunds, and financial transactions',
      icon: <CreditCard size={32} />,
      path: '/paymentManagement',
      color: '#F59E0B',
      stats: `$${stats.totalRevenue.toLocaleString()}`
    },
    {
      title: 'Supplier Management',
      description: 'Manage supplier relationships and procurement',
      icon: <Users size={32} />,
      path: '/supplierManagement',
      color: '#8B5CF6',
      stats: '12 suppliers'
    }
  ];

  const quickActions = [
    {
      title: 'Add New Item',
      action: () => navigate('/inventoryManagement'),
      icon: <Package size={20} />,
      color: '#3B82F6'
    },
    {
      title: 'View Orders',
      action: () => navigate('/orderManagement'),
      icon: <ShoppingCart size={20} />,
      color: '#10B981'
    },
    {
      title: 'Check Payments',
      action: () => navigate('/paymentManagement'),
      icon: <CreditCard size={20} />,
      color: '#F59E0B'
    },
    {
      title: 'Manage Suppliers',
      action: () => navigate('/supplierManagement'),
      icon: <Users size={20} />,
      color: '#8B5CF6'
    }
  ];

  const recentActivities = [
    {
      type: 'order',
      message: 'New order #1234 received',
      time: '2 minutes ago',
      status: 'pending'
    },
    {
      type: 'inventory',
      message: 'Low stock alert: T-Shirt XL (Red)',
      time: '15 minutes ago',
      status: 'warning'
    },
    {
      type: 'payment',
      message: 'Payment received for order #1230',
      time: '1 hour ago',
      status: 'success'
    },
    {
      type: 'inventory',
      message: 'New item added: Designer Hoodie',
      time: '2 hours ago',
      status: 'success'
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle size={16} className="status-icon success" />;
      case 'warning':
        return <AlertTriangle size={16} className="status-icon warning" />;
      case 'pending':
        return <Clock size={16} className="status-icon pending" />;
      default:
        return <Clock size={16} className="status-icon" />;
    }
  };

      return (
        <div className="admin-container">
            <AdminNav />
            <div className="admin-content">
        <div className="admin-header">
          <div className="admin-welcome">
            <h1>Welcome back, {currentUser?.username || 'Admin'}!</h1>
            <p>Here's what's happening with your store today.</p>
          </div>
          <div className="admin-actions">
            <button className="refresh-btn">
              <BarChart3 size={20} />
              Refresh Dashboard
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#3B82F6' }}>
              <Package size={24} />
            </div>
            <div className="stat-content">
              <h3>{stats.totalItems}</h3>
              <p>Total Items</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#EF4444' }}>
              <AlertTriangle size={24} />
            </div>
            <div className="stat-content">
              <h3>{stats.lowStockItems}</h3>
              <p>Low Stock Items</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#10B981' }}>
              <ShoppingCart size={24} />
            </div>
            <div className="stat-content">
              <h3>{stats.totalOrders}</h3>
              <p>Total Orders</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#F59E0B' }}>
              <TrendingUp size={24} />
            </div>
            <div className="stat-content">
              <h3>${stats.totalRevenue.toLocaleString()}</h3>
              <p>Total Revenue</p>
            </div>
          </div>
        </div>

        <div className="admin-main-content">
          {/* Admin Modules */}
          <div className="admin-modules">
            <h2>Admin Modules</h2>
            <div className="modules-grid">
              {adminModules.map((module, index) => (
                <div 
                  key={index} 
                  className="module-card"
                  onClick={() => navigate(module.path)}
                >
                  <div className="module-icon" style={{ backgroundColor: module.color }}>
                    {module.icon}
                  </div>
                  <div className="module-content">
                    <h3>{module.title}</h3>
                    <p>{module.description}</p>
                    <span className="module-stats">{module.stats}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-sidebar">
            {/* Quick Actions */}
            <div className="quick-actions">
              <h3>Quick Actions</h3>
              <div className="actions-list">
                {quickActions.map((action, index) => (
                  <button 
                    key={index} 
                    className="action-btn"
                    onClick={action.action}
                    style={{ borderLeftColor: action.color }}
                  >
                    <div className="action-icon" style={{ color: action.color }}>
                      {action.icon}
                    </div>
                    <span>{action.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Activities */}
            <div className="recent-activities">
              <h3>Recent Activities</h3>
              <div className="activities-list">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="activity-item">
                    {getStatusIcon(activity.status)}
                    <div className="activity-content">
                      <p>{activity.message}</p>
                      <span className="activity-time">{activity.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default AdminHome;