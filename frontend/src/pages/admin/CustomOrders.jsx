import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import NavBar from '../../Components/NavBar/navBar';
import Footer from '../../Components/Footer/Footer';
import { useAuth } from '../../AuthGuard/AuthGuard';
import TailorSubNav from '../../Components/tailor-management/TailorSubNav';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001';

export default function AdminCustomOrders() {
  const { getToken } = useAuth();
  // Canonical orders come from ClothCustomizer
  const [customizers, setCustomizers] = useState([]);
  const [tailors, setTailors] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [assigning, setAssigning] = useState(null); // orderId
  const [selectedTailor, setSelectedTailor] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const [latestStatuses, setLatestStatuses] = useState({}); // key: clothCustomizerId -> status entry
  const [updatingStatusId, setUpdatingStatusId] = useState('');
  const [info, setInfo] = useState('');

  const statusFilter = searchParams.get('status') || '';
  const tailorFilter = searchParams.get('tailorId') || '';

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const token = getToken();
      // Fetch ClothCustomizer entries across all users (admin)
      let list = [];
      setInfo('');
      try {
        const res = await axios.get(`${API_BASE_URL}/cloth-customizer/admin`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        list = res.data?.data || [];
      } catch (err) {
        // If not admin, fallback to user-scoped list to show something
        if (err?.response?.status === 403) {
          const resUser = await axios.get(`${API_BASE_URL}/cloth-customizer`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          list = resUser.data?.data || [];
          setInfo('Showing your own customizations. Log in as Admin to see all orders.');
        } else {
          throw err;
        }
      }
      // Basic client-side filters to mimic previous UX
      if (tailorFilter) {
        // Filter by current assignment tailor if available
        try {
          const assigns = await axios.get(`${API_BASE_URL}/api/assignments?tailorId=${tailorFilter}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const assignedIds = new Set((assigns.data?.data || []).map(a => a.clothCustomizerId?._id || a.clothCustomizerId));
          list = list.filter(c => assignedIds.has(c._id));
        } catch (_) {
          // ignore if no admin access
        }
      }
      setCustomizers(list);

      // Fetch latest statuses for these orders
      const ids = list.map(c => c._id);
      if (ids.length) {
        const latest = await axios.get(`${API_BASE_URL}/api/order-status/latest`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { ids: ids.join(',') }
        });
        setLatestStatuses(latest.data?.data || {});
      } else {
        setLatestStatuses({});
      }
    } catch (e) {
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = useCallback(async () => {
    try {
      const token = getToken();
      const res = await axios.get(`${API_BASE_URL}/api/assignments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAssignments(res.data?.data || []);
    } catch (e) {
      // non-blocking
    }
  }, [getToken, API_BASE_URL]);

  const fetchTailors = useCallback(async () => {
    try {
      const token = getToken();
      const res = await axios.get(`${API_BASE_URL}/api/tailors`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTailors(res.data?.data || []);
    } catch (e) {
      // non-blocking
    }
  }, [getToken, API_BASE_URL]);

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, tailorFilter]);

  useEffect(() => { fetchTailors(); fetchAssignments(); }, [fetchTailors, fetchAssignments]);

  const onAssign = async (customizerId) => {
    try {
      if (!selectedTailor) return alert('Please select a tailor');
      setAssigning(customizerId);
      const token = getToken();
      await axios.post(`${API_BASE_URL}/api/assignments`, { clothCustomizerId: customizerId, tailorId: selectedTailor }, { headers: { Authorization: `Bearer ${token}` } });
      setSelectedTailor('');
      await fetchAssignments();
    } catch (e) {
      alert('Failed to assign tailor');
    } finally {
      setAssigning(null);
    }
  };

  const updateStatus = async (clothCustomizerId, status) => {
    try {
      if (!status) return;
      setUpdatingStatusId(clothCustomizerId);
      const token = getToken();
      await axios.post(`${API_BASE_URL}/api/order-status`, { clothCustomizerId, status }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const latest = await axios.get(`${API_BASE_URL}/api/order-status/latest`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { ids: clothCustomizerId }
      });
      setLatestStatuses(prev => ({ ...prev, ...(latest.data?.data || {}) }));
    } catch (e) {
      alert('Failed to update status');
    } finally {
      setUpdatingStatusId('');
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
        {info && <div style={{ color: '#555', marginBottom: 8 }}>{info}</div>}
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div style={{ display: 'grid', gap: 20 }}>
            <section>
              <h2 style={{ marginTop: 0 }}>Orders (from Cloth Customizer)</h2>
              <div style={{ display: 'grid', gap: 12 }}>
                {customizers.map(co => (
                  <div key={co._id} style={{ border: '1px solid #eee', borderRadius: 8, padding: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                      <div style={{ display: 'grid', gap: 4 }}>
                        <div><strong>ID:</strong> {co._id}</div>
                        <div><strong>User:</strong> {co.userId ? `${co.userId.username} (${co.userId.email})` : '—'}</div>
                        <div><strong>Type/Color/Size:</strong> {co.clothingType} / {co.color} / {co.size}</div>
                        <div><strong>Quantity:</strong> {co.quantity} | <strong>Designs:</strong> {Array.isArray(co.placedDesigns) ? co.placedDesigns.length : 0}</div>
                        <div><strong>Latest Status:</strong> {(() => { const e = latestStatuses[String(co._id)] || null; return e?.status || '—'; })()}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div><strong>Total:</strong> {typeof co.totalPrice === 'number' ? `Rs. ${co.totalPrice.toFixed(2)}` : '—'}</div>
                        <div><strong>Created:</strong> {co.createdAt ? new Date(co.createdAt).toLocaleString() : '—'}</div>
                        <div><strong>Assigned Tailor:</strong> {
                          (() => {
                            const a = assignments.find(a => (a.clothCustomizerId?._id || a.clothCustomizerId) === co._id);
                            return a?.tailorId?.name || '—';
                          })()
                        }</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
                      <select value={selectedTailor} onChange={(e) => setSelectedTailor(e.target.value)}>
                        <option value="">Select tailor</option>
                        {tailors.map(t => (
                          <option key={t._id} value={t._id}>{t.name}</option>
                        ))}
                      </select>
                      <button disabled={assigning === co._id} onClick={() => onAssign(co._id)}>
                        {assigning === co._id ? 'Assigning...' : 'Assign Tailor'}
                      </button>
                      <select defaultValue="" onChange={(e) => updateStatus(co._id, e.target.value)} disabled={updatingStatusId === co._id}>
                        <option value="" disabled>Update status...</option>
                        {['accepted','in_progress','completed','delivered','cancelled'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      {updatingStatusId === co._id && <span>Updating...</span>}
                    </div>
                  </div>
                ))}
                {customizers.length === 0 && <div>No orders found.</div>}
              </div>
            </section>

            <section>
              <h2>Recent Assignments</h2>
              <div style={{ display: 'grid', gap: 8 }}>
                {assignments.map(a => (
                  <div key={a._id} style={{ border: '1px solid #f1f1f1', borderRadius: 8, padding: 8 }}>
                    <div><strong>Order:</strong> {a.clothCustomizerId?._id || a.clothCustomizerId}</div>
                    <div><strong>Tailor:</strong> {a.tailorId?.name || '—'}</div>
                    <div><strong>Assigned At:</strong> {a.assignedAt ? new Date(a.assignedAt).toLocaleString() : '—'}</div>
                  </div>
                ))}
                {assignments.length === 0 && <div>No assignments yet.</div>}
              </div>
            </section>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
