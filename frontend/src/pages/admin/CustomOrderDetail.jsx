import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import NavBar from '../../Components/NavBar/navBar';
import Footer from '../../Components/Footer/Footer';
import { useAuth } from '../../AuthGuard/AuthGuard';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001';

export default function AdminCustomOrderDetail() {
  const { id } = useParams();
  const { getToken } = useAuth();
  const [order, setOrder] = useState(null);
  const [tailors, setTailors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTailor, setSelectedTailor] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError('');
      const token = getToken();
      const res = await axios.get(`${API_BASE_URL}/api/custom-orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrder(res.data?.data || null);
    } catch (e) {
      setError('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const fetchTailors = async () => {
    try {
      const token = getToken();
      const res = await axios.get(`${API_BASE_URL}/api/tailors`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTailors(res.data?.data || []);
    } catch (e) {
      // non-blocking
    }
  };

  useEffect(() => {
    fetchOrder();
    fetchTailors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onAssign = async () => {
    try {
      if (!selectedTailor) return alert('Please select a tailor');
      setUpdating(true);
      const token = getToken();
      await axios.patch(`${API_BASE_URL}/api/custom-orders/${id}/assign`, { tailorId: selectedTailor }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedTailor('');
      await fetchOrder();
    } catch (e) {
      alert('Failed to assign tailor');
    } finally {
      setUpdating(false);
    }
  };

  const onOverrideStatus = async (status) => {
    try {
      setUpdating(true);
      const token = getToken();
      await axios.patch(`${API_BASE_URL}/api/custom-orders/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchOrder();
    } catch (e) {
      alert('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="admin-custom-order-detail">
      <NavBar />
      <main style={{ maxWidth: 1000, margin: '0 auto', padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Order Detail</h1>
          <Link to="/admin/custom-orders">Back to List</Link>
        </div>

        {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
        {loading || !order ? (
          <div>Loading...</div>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            <section style={{ border: '1px solid #eee', borderRadius: 8, padding: 12 }}>
              <h3>Metadata</h3>
              <div><strong>Order:</strong> {order._id}</div>
              <div><strong>Status:</strong> {order.status}</div>
              <div><strong>Customer:</strong> {order.customerId?.username} ({order.customerId?.email})</div>
              <div><strong>Assigned Tailor:</strong> {order.assignedTailor?.name || '—'}</div>
            </section>

            <section style={{ border: '1px solid #eee', borderRadius: 8, padding: 12 }}>
              <h3>Configuration</h3>
              <div><strong>Type:</strong> {order.config?.clothingType}</div>
              <div><strong>Size:</strong> {order.config?.size}</div>
              <div><strong>Color:</strong> {order.config?.color}</div>
              <div><strong>Quantity:</strong> {order.config?.quantity}</div>
              {order.config?.notes && <div><strong>Notes:</strong> {order.config.notes}</div>}
            </section>

            {order.design?.designImageUrl && (
              <section style={{ border: '1px solid #eee', borderRadius: 8, padding: 12 }}>
                <h3>Design</h3>
                <img alt="design" src={order.design.designImageUrl} style={{ maxWidth: 240, borderRadius: 8, border: '1px solid #ddd' }} />
              </section>
            )}

            <section style={{ border: '1px solid #eee', borderRadius: 8, padding: 12, display: 'grid', gap: 8 }}>
              <h3>Assign Tailor</h3>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <select value={selectedTailor} onChange={(e) => setSelectedTailor(e.target.value)}>
                  <option value="">Select tailor</option>
                  {tailors.map(t => (
                    <option key={t._id} value={t._id}>{t.name}</option>
                  ))}
                </select>
                <button disabled={updating} onClick={onAssign}>{updating ? 'Assigning...' : 'Assign'}</button>
              </div>
            </section>

            <section style={{ border: '1px solid #eee', borderRadius: 8, padding: 12, display: 'grid', gap: 8 }}>
              <h3>Admin Status Override</h3>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['pending','assigned','accepted','in_progress','completed','delivered','cancelled'].map(s => (
                  <button key={s} disabled={updating} onClick={() => onOverrideStatus(s)}>{s}</button>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
