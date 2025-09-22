import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AdminPanel.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001';

export default function Dashboard() {
  const [overview, setOverview] = useState(null);
  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [ov, st] = await Promise.all([
        axios.get(`${API_BASE_URL}/analytics/overview`),
        axios.get(`${API_BASE_URL}/analytics/stock`)
      ]);
      setOverview(ov.data?.data || null);
      setStock(st.data?.data || null);
    } catch (e) {
      console.error('Dashboard load error:', e);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const downloadStockCSV = () => {
    if (!stock?.items) return;
    const header = ['Name', 'Category', 'Price', 'Stock'];
    const rows = stock.items.map(i => [i.name, i.category || '', i.price || 0, i.stock || 0]);
    const csv = [header, ...rows]
      .map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stock-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) return <div style={{ padding: 16 }}>Loading dashboard...</div>;
  if (error) return <div style={{ padding: 16, color: 'red' }}>{error}</div>;
  if (!overview || !stock) return <div style={{ padding: 16 }}>No data</div>;

  return (
    <div className="admin-panel__content" style={{ gap: 16 }}>
      <div className="reports__summary">
        <div className="summary-card">
          <h3>Total Revenue</h3>
          <div className="summary-number">${(overview.revenue || 0).toFixed(2)}</div>
        </div>
        <div className="summary-card">
          <h3>Orders</h3>
          <div className="summary-number">{overview.ordersCount || 0}</div>
        </div>
        <div className="summary-card">
          <h3>Avg Order</h3>
          <div className="summary-number">${(overview.avgOrderValue || 0).toFixed(2)}</div>
        </div>
        <div className="summary-card">
          <h3>Total Stock</h3>
          <div className="summary-number">{stock.totalStock || 0}</div>
        </div>
        <div className="summary-card">
          <h3>Stock Value</h3>
          <div className="summary-number">${(stock.stockValue || 0).toFixed(2)}</div>
        </div>
      </div>

      <div className="reports__section">
        <h3>Recent Orders</h3>
        {overview.recentOrders?.length ? (
          <div className="position-table">
            <div className="position-table__head">
              <div>OrderID</div>
              <div>Qty</div>
              <div>Price</div>
              <div>Date</div>
            </div>
            {overview.recentOrders.map(o => (
              <div key={o._id} className="position-table__row">
                <div>{o.OrderID}</div>
                <div>{o.quantity}</div>
                <div>${o.Price.toFixed(2)}</div>
                <div>{new Date(o.CreatedAt).toLocaleString()}</div>
              </div>
            ))}
          </div>
        ) : <p>No recent orders</p>}
      </div>

      <div className="reports__section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Low Stock</h3>
          <button className="btn btn--secondary" onClick={downloadStockCSV}>Download Stock CSV</button>
        </div>
        {stock.lowStock?.length ? (
          <div className="pending-table">
            <div className="pending-table__head">
              <div>Item</div>
              <div>Category</div>
              <div>Price</div>
              <div>Stock</div>
            </div>
            {stock.lowStock.map(i => (
              <div key={i._id} className="pending-table__row">
                <div>{i.name}</div>
                <div>{i.category || '-'}</div>
                <div>${(i.price || 0).toFixed(2)}</div>
                <div>{i.stock || 0}</div>
              </div>
            ))}
          </div>
        ) : <p>All good. No low stock items.</p>}
      </div>
    </div>
  );
}


