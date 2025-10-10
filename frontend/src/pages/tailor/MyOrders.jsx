import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import NavBar from '../../Components/NavBar/navBar';
import Footer from '../../Components/Footer/Footer';
import TailorSubNav from '../../Components/tailor-management/TailorSubNav';
import { useAuth } from '../../AuthGuard/AuthGuard';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001';

export default function MyOrders() {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      // New system: fetch directly from CustomOrder assigned endpoint
      const res = await axios.get(`${API_BASE_URL}/api/custom-orders/assigned/me`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = Array.isArray(res.data?.data) ? res.data.data : [];
      setOrders(data);
    } catch (err) {
      console.error('MyOrders fetch error:', err);
      setError('Failed to load assigned orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  return (
    <div>
      <NavBar />
      <TailorSubNav />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h2>My Assigned Orders</h2>
          <button onClick={fetchOrders} style={{ padding: '8px 12px' }}>Refresh</button>
        </div>

        {loading && <div>Loading...</div>}
        {error && <div style={{ color: '#b91c1c' }}>{error}</div>}

        {!loading && (
          orders.length === 0 ? (
            <p>No assigned orders.</p>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {orders.map(o => (
                <div key={o._id} style={{ border: '1px solid #eee', borderRadius: 8, padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div><strong>ID:</strong> {o._id}</div>
                    <div><strong>Status:</strong> {o.status}</div>
                    {o.config && (
                      <div style={{ color: '#6b7280' }}>
                        {o.config.clothingType} • {o.config.color} • {o.config.size} • qty {o.config.quantity || 1}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Link to={`/tailor/orders/${o._id}`}>
                      <button style={{ padding: '8px 12px' }}>Open</button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
      <Footer />
    </div>
  );
}
