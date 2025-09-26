import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function TailorSubNav() {
  const location = useLocation();
  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <nav style={{
      borderBottom: '1px solid #eee',
      background: '#fafafa',
      padding: '8px 16px',
      marginBottom: 16,
    }}>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Link to="/admin/custom-orders">
          <button style={{
            padding: '8px 12px',
            borderRadius: 6,
            border: isActive('/admin/custom-orders') ? '2px solid #667eea' : '1px solid #ddd',
            background: isActive('/admin/custom-orders') ? '#eef2ff' : 'white',
            fontWeight: 600,
          }}>
            Orders
          </button>
        </Link>
        <Link to="/admin/custom-orders/new" style={{ display: 'none' }}>
          {/* Reserved for future: create custom order */}
        </Link>
        <Link to="/admin/tailors">
          <button style={{
            padding: '8px 12px',
            borderRadius: 6,
            border: isActive('/admin/tailors') ? '2px solid #667eea' : '1px solid #ddd',
            background: isActive('/admin/tailors') ? '#eef2ff' : 'white',
            fontWeight: 600,
          }}>
            Tailors
          </button>
        </Link>
      </div>
    </nav>
  );
}
