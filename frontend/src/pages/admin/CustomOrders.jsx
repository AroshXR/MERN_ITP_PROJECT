import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import NavBar from '../../Components/NavBar/navBar';
import Footer from '../../Components/Footer/Footer';
import { useAuth } from '../../AuthGuard/AuthGuard';
import TailorSubNav from '../../Components/tailor-management/TailorSubNav';
import { Link } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001';

export default function AdminCustomOrders() {
  const { getToken } = useAuth();
  // Canonical orders come from ClothCustomizer
  const [orders, setOrders] = useState([]);
  const [tailors, setTailors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [assigning, setAssigning] = useState(null); // orderId
  const [selectedTailors, setSelectedTailors] = useState({}); // orderId -> tailorId mapping
  const [searchParams, setSearchParams] = useSearchParams();
  const [updatingStatusId, setUpdatingStatusId] = useState('');
  const [info] = useState('');
  const [lastAssigned, setLastAssigned] = useState(null);
  const [assignmentByOrder, setAssignmentByOrder] = useState({}); // orderId -> { _id, status, tailor }

  const statusFilter = searchParams.get('status') || '';
  const tailorFilter = searchParams.get('tailorId') || '';
  const unassignedFilter = (searchParams.get('unassigned') || '') === 'true';
  const idFilter = searchParams.get('id') || '';

  const fetchOrders = async () => {
    try {
        setLoading(true);
        setError('');
        const token = getToken();
        const params = {};
        if (statusFilter) params.status = statusFilter;
        if (tailorFilter) params.tailorId = tailorFilter;
        if (unassignedFilter) params.unassigned = 'true';
        if (idFilter) params.id = idFilter;
        
        // Add detailed logging
        console.log('Token:', token);
        console.log('Request URL:', `${API_BASE_URL}/api/custom-orders`);
        console.log('Request params:', params);
        
        const res = await axios.get(`${API_BASE_URL}/api/custom-orders`, {
            headers: { 
                Authorization: `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            params,
        });
        
        // Log full response
        console.log('Full API Response:', res);
        
        if (!res.data || !Array.isArray(res.data.data)) {
            throw new Error('Invalid response format');
        }
        // Normalize to a common shape. If coming from ClothCustomizer (legacy),
        // build config/customer/status fields expected by the UI and mark as legacy.
        const normalized = res.data.data.map((o) => {
          if (o && o.config) return { ...o, isLegacy: false };
          return {
            _id: o._id,
            customerId: o.userId ? { username: o.userId.username, email: o.userId.email } : null,
            config: {
              clothingType: o.clothingType,
              color: o.color,
              size: o.size,
              quantity: typeof o.quantity === 'number' ? o.quantity : 1,
            },
            price: o.totalPrice,
            status: 'pending',
            createdAt: o.createdAt,
            assignedTailor: null,
            isLegacy: true,
          };
        });

        setOrders(normalized);

        // After orders load, fetch assignment for each
        try {
          const token2 = getToken();
          const pairs = await Promise.all(normalized.map(async (o) => {
            const src = o.isLegacy ? 'ClothCustomizer' : 'CustomOrder';
            try {
              const r = await axios.get(`${API_BASE_URL}/api/order-assignments/by-order`, {
                headers: { Authorization: `Bearer ${token2}` },
                params: { orderSource: src, orderId: o._id }
              });
              const data = r.data?.data || null;
              return [o._id, data];
            } catch (_) {
              return [o._id, null];
            }
          }));
          const map = {};
          for (const [oid, data] of pairs) {
            if (data && data.assignment) {
              map[oid] = {
                _id: data.assignment._id,
                status: data.assignment.status,
                tailor: data.assignment.tailorId || null,
              };
            }
          }
          setAssignmentByOrder(map);
        } catch { /* non-blocking */ }
    } catch (e) {
        console.error('Detailed fetch error:', {
            message: e.message,
            response: e.response?.data,
            status: e.response?.status,
            headers: e.response?.headers
        });
        setError(`Failed to load orders: ${e.response?.data?.message || e.message}`);
    } finally {
        setLoading(false);
    }
  };

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
  }, [getToken]);

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, tailorFilter]);

  useEffect(() => { fetchTailors(); }, [fetchTailors]);

  const onAssign = async (orderId) => {
    try {
      const tailorId = selectedTailors[orderId];
      if (!tailorId) {
        alert('Please select a tailor');
        return;
      }

      setAssigning(orderId);
      const token = getToken();
      
      // Decide endpoint based on order source
      const ord = orders.find(o => o._id === orderId);
      if (ord && ord.isLegacy) {
        // Legacy ClothCustomizer orders -> use OrderAssignment endpoint
        await axios.post(
          `${API_BASE_URL}/api/order-assignments/assign`,
          { orderSource: 'ClothCustomizer', orderId, tailorId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
      } else {
        // New CustomOrder -> assign directly on the order (new system)
        await axios.post(
          `${API_BASE_URL}/api/custom-orders/${orderId}/assign`,
          { tailorId },
          { 
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            } 
          }
        );
      }

      setLastAssigned(orderId);
      // Optimistically update UI with assigned tailor name
      const assigned = tailors.find(x => x._id === tailorId);
      if (assigned) {
        setOrders(prev => prev.map(o => (
          o._id === orderId ? { ...o, assignedTailor: { name: assigned.name } } : o
        )));
      }
      // Notify success via popup
      alert('Tailor assigned successfully!');
      setTimeout(() => setLastAssigned(null), 3000);

      // Clear selection for this order only
      setSelectedTailors(prev => {
        const next = { ...prev };
        delete next[orderId];
        return next;
      });

      await fetchOrders(); // Refresh the list
    } catch (e) {
      console.error('Assignment error:', e);
      alert('Failed to assign tailor: ' + (e.response?.data?.message || e.message));
    } finally {
      setAssigning(null);
    }
  };

  const updateStatus = async (orderId, status) => {
    try {
      if (!status) return;
      setUpdatingStatusId(orderId);
      const token = getToken();
      await axios.patch(`${API_BASE_URL}/api/custom-orders/${orderId}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchOrders();
    } catch (e) {
      alert('Failed to update status');
    } finally {
      setUpdatingStatusId('');
    }
  };

  // Update assignment status via OrderAssignment controller
  const updateAssignmentStatus = async (orderId, next) => {
    try {
      if (!next) return;
      const a = assignmentByOrder[orderId];
      if (!a?._id) return alert('No assignment found for this order');
      const token = getToken();
      await axios.patch(`${API_BASE_URL}/api/order-assignments/${a._id}/status`, { status: next }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAssignmentByOrder(prev => ({
        ...prev,
        [orderId]: { ...prev[orderId], status: next }
      }));
    } catch (e) {
      alert('Failed to update assignment status');
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

          <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input
              type="checkbox"
              checked={unassignedFilter}
              onChange={(e) => updateFilter('unassigned', e.target.checked ? 'true' : '')}
            />
            Unassigned only
          </label>

          <input
            type="text"
            placeholder="Search by Order ID"
            value={idFilter}
            onChange={(e) => updateFilter('id', e.target.value.trim())}
            style={{ padding: '6px 8px' }}
          />
        </div>

        {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
        {info && <div style={{ color: '#555', marginBottom: 8 }}>{info}</div>}
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div style={{ display: 'grid', gap: 20 }}>
            <section>
              <h2 style={{ marginTop: 0 }}>Orders</h2>
              <div style={{ display: 'grid', gap: 12 }}>
                {orders.map(order => (
                  <div key={order._id} style={{ border: '1px solid #eee', borderRadius: 8, padding: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                      <div style={{ display: 'grid', gap: 4 }}>
                        <div><strong>ID:</strong> <Link to={`/admin/custom-orders/${order._id}`}>{order._id}</Link></div>
                        <div><strong>Customer:</strong> {order.customerId ? `${order.customerId.username} (${order.customerId.email})` : '—'}</div>
                        <div><strong>Type/Color/Size:</strong> {order.config?.clothingType || '—'} / {order.config?.color || '—'} / {order.config?.size || '—'}</div>
                        <div><strong>Quantity:</strong> {order.config?.quantity ?? '—'}</div>
                        <div><strong>Status:</strong> {order.status || '—'}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div><strong>Price:</strong> {typeof order.price === 'number' ? `Rs. ${order.price.toFixed(2)}` : '—'}</div>
                        <div><strong>Created:</strong> {order.createdAt ? new Date(order.createdAt).toLocaleString() : '—'}</div>
                        <div><strong>Assigned Tailor:</strong> {assignmentByOrder[order._id]?.tailor?.name || order.assignedTailor?.name || '—'}</div>
                        {assignmentByOrder[order._id] && (
                          <div><strong>Assignment Status:</strong> {assignmentByOrder[order._id]?.status || '—'}</div>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
                      <select 
                        value={selectedTailors[order._id] || ''} 
                        onChange={(e) => setSelectedTailors(prev => ({
                          ...prev,
                          [order._id]: e.target.value
                        }))}
                      >
                        <option value="">Select tailor</option>
                        {tailors.map(t => (
                          <option key={t._id} value={t._id}>{t.name}</option>
                        ))}
                      </select>
                      <button disabled={assigning === order._id} onClick={() => onAssign(order._id)}>
                        {assigning === order._id ? 'Assigning...' : 'Assign Tailor'}
                      </button>
                      {assignmentByOrder[order._id]?.status && (
                        <>
                          <select defaultValue="" onChange={(e) => updateAssignmentStatus(order._id, e.target.value)}>
                            <option value="" disabled>Update assignment status...</option>
                            {['assigned','accepted','in_progress','completed','rejected'].map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </>
                      )}
                    </div>
                    {lastAssigned === order._id && <div style={{ color: 'green', marginTop: 8 }}>Tailor assigned successfully!</div>}
                  </div>
                ))}
                {orders.length === 0 && <div>No orders found.</div>}
              </div>
            </section>

            {/* Recent assignments section removed as order carries assignedTailor */}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
