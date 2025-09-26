import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom';
import NavBar from '../../Components/NavBar/navBar';
import Footer from '../../Components/Footer/Footer';
import { useAuth } from '../../AuthGuard/AuthGuard';
import TailorSubNav from '../../Components/tailor-management/TailorSubNav';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001';

export default function AdminCustomOrders() {
  const { getToken } = useAuth();
  const [orders, setOrders] = useState([]);
  const [tailors, setTailors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [assigning, setAssigning] = useState(null); // orderId
  const [selectedTailor, setSelectedTailor] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();

  const statusFilter = searchParams.get('status') || '';
  const tailorFilter = searchParams.get('tailorId') || '';

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const token = getToken();
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (tailorFilter) params.tailorId = tailorFilter;
      const res = await axios.get(`${API_BASE_URL}/api/custom-orders`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setOrders(res.data?.data || []);
    } catch (e) {
      setError('Failed to load orders');
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
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, tailorFilter]);

  useEffect(() => { fetchTailors(); }, []);

  const onAssign = async (orderId) => {
    try {
      if (!selectedTailor) return alert('Please select a tailor');
      setAssigning(orderId);
      const token = getToken();
      await axios.patch(`${API_BASE_URL}/api/custom-orders/${orderId}/assign`, { tailorId: selectedTailor }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedTailor('');
      await fetchOrders();
    } catch (e) {
      alert('Failed to assign tailor');
    } finally {
      setAssigning(null);
    }
  };

  const updateFilter = (key, val) => {
    const next = new URLSearchParams(searchParams);
    if (val) next.set(key, val); else next.delete(key);
    setSearchParams(next);
  };

  return (
    <div className="admin-custom-orders">
      <NavBar />
      <TailorSubNav />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: 16 }}>
        <h1>Custom Orders</h1>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', margin: '12px 0' }}>
          <select value={statusFilter} onChange={(e) => updateFilter('status', e.target.value)}>
            <option value="">All Status</option>
            {['pending','assigned','accepted','in_progress','completed','delivered','cancelled'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select value={tailorFilter} onChange={(e) => updateFilter('tailorId', e.target.value)}>
            <option value="">All Tailors</option>
            {tailors.map(t => (
              <option key={t._id} value={t._id}>{t.name}</option>
            ))}
          </select>
        </div>

        {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {orders.map(o => (
              <div key={o._id} style={{ border: '1px solid #eee', borderRadius: 8, padding: 12, display: 'grid', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div><strong>Order:</strong> {o._id}</div>
                    <div><strong>Status:</strong> {o.status}</div>
                    <div><strong>Customer:</strong> {o.customerId?.username} ({o.customerId?.email})</div>
                    <div><strong>Assigned Tailor:</strong> {o.assignedTailor?.name || '—'}</div>
                  </div>
                  <div>
                    <Link to={`/admin/custom-orders/${o._id}`}>View</Link>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <select value={selectedTailor} onChange={(e) => setSelectedTailor(e.target.value)}>
                    <option value="">Select tailor</option>
                    {tailors.map(t => (
                      <option key={t._id} value={t._id}>{t.name}</option>
                    ))}
                  </select>
                  <button disabled={assigning === o._id} onClick={() => onAssign(o._id)}>
                    {assigning === o._id ? 'Assigning...' : 'Assign Tailor'}
                  </button>
                </div>
              </div>
            ))}
            {orders.length === 0 && <div>No orders found.</div>}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
