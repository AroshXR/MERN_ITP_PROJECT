import React, { useEffect, useMemo, useState } from 'react';
import NavBar from '../../NavBar/navBar';
import Footer from '../../Footer/Footer';
import { TShirtModel } from './components/TShirtModel';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Bounds } from '@react-three/drei';
import './TailorHome.css';
import OrderSummeryTailor from './OrderSummery_tailor';
import axios from 'axios';
import { useAuth } from '../../../AuthGuard/AuthGuard';

function Tailor_Home() {
  const [selectedColor] = useState("#ffffff");
  const [selectedDesign] = useState(null);
  const [clothingType] = useState("tshirt");
  const controlsRef = React.useRef();
  const [selectedSize] = useState(null);
  const { getToken } = useAuth();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001';
  const [assignments, setAssignments] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [latestStatuses, setLatestStatuses] = useState({}); // key: clothCustomizerId -> latest status entry
  const [updatingStatusId, setUpdatingStatusId] = useState('');

  // Custom Orders (new): assigned to me via /api/custom-orders/assigned
  const [customOrders, setCustomOrders] = useState([]);
  const [customOrdersLoading, setCustomOrdersLoading] = useState(false);
  const [customOrdersError, setCustomOrdersError] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState('');

  // ClothCustomizer sessions (direct display)
  const [ccItems, setCcItems] = useState([]);
  const [ccLoading, setCcLoading] = useState(false);
  const [ccError, setCcError] = useState('');

  const allowedTransitions = useMemo(() => ({
    // free-form for now; tailor can set any of these except 'assigned'
    options: ['accepted','in_progress','completed','delivered','cancelled'],
  }), []);

  // design/color handlers removed (unused)

  // Update status for Custom Order (Tailor flow) - component scope
  const updateCustomOrderStatus = async (orderId, nextStatus) => {
    try {
      if (!nextStatus) return;
      setUpdatingOrderId(orderId);
      const token = getToken();
      await axios.patch(`${API_BASE_URL}/api/custom-orders/${orderId}/status`, { status: nextStatus }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Refresh list after update
      const res = await axios.get(`${API_BASE_URL}/api/custom-orders/assigned`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCustomOrders(res.data?.data || []);
    } catch (e) {
      alert('Failed to update order status');
    } finally {
      setUpdatingOrderId('');
    }
  };

  const nextStatusesFor = (current) => {
    // Mirror backend allowed transitions for Tailor
    const map = {
      assigned: ['accepted'],
      accepted: ['in_progress'],
      in_progress: ['completed'],
      completed: ['delivered'],
    };
    return map[current] || [];
  };

  // Fetch assignments for the logged-in tailor
  useEffect(() => {
    const fetchAssigned = async () => {
      try {
        setOrdersLoading(true);
        setOrdersError('');
        const token = getToken();
        if (!token) {
          setAssignments([]);
          return;
        }
        const res = await axios.get(`${API_BASE_URL}/api/assignments/mine`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAssignments(res.data?.data || []);
      } catch (e) {
        setOrdersError('Failed to load assigned orders');
      } finally {
        setOrdersLoading(false);
      }
    };
    fetchAssigned();
  }, [getToken, API_BASE_URL]);

  // Fetch Custom Orders assigned to me (from CustomOrder collection)
  useEffect(() => {
    const fetchCustomOrders = async () => {
      try {
        setCustomOrdersLoading(true);
        setCustomOrdersError('');
        const token = getToken();
        if (!token) { setCustomOrders([]); return; }
        const res = await axios.get(`${API_BASE_URL}/api/custom-orders/assigned`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCustomOrders(res.data?.data || []);
      } catch (e) {
        setCustomOrdersError('Failed to load assigned custom orders');
      } finally {
        setCustomOrdersLoading(false);
      }
    };
    fetchCustomOrders();
  }, [getToken, API_BASE_URL]);

  // Fetch latest statuses for current assignments
  useEffect(() => {
    const run = async () => {
      try {
        const ids = (assignments || []).map(a => a?.clothCustomizerId?._id || a?.clothCustomizerId).filter(Boolean);
        if (ids.length === 0) { setLatestStatuses({}); return; }
        const token = getToken();
        const res = await axios.get(`${API_BASE_URL}/api/order-status/latest`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { ids: ids.join(',') }
        });
        setLatestStatuses(res.data?.data || {});
      } catch (e) {
        // non-blocking
      }
    };
    run();
  }, [assignments, API_BASE_URL, getToken]);

  const submitStatus = async (clothCustomizerId, status) => {
    try {
      if (!status) return;
      setUpdatingStatusId(clothCustomizerId);
      const token = getToken();
      await axios.post(`${API_BASE_URL}/api/order-status`, {
        clothCustomizerId,
        status,
      }, { headers: { Authorization: `Bearer ${token}` } });
      // refresh latest
      const res = await axios.get(`${API_BASE_URL}/api/order-status/latest`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { ids: clothCustomizerId }
      });
      setLatestStatuses(prev => ({ ...prev, ...(res.data?.data || {}) }));
    } catch (e) {
      alert('Failed to update status');
    } finally {
      setUpdatingStatusId('');
    }
  };

  return (
    <div className="tailor-container">
      <NavBar />
      <div className="tailor-content">
        <div className="tailor-header">
          <h1>Hello!, Tailor</h1>
          <p>Streamline Your Tailoring Workflow</p>
        </div>

        <div className="tailor-main">
          <div className="tailor-right">
            <OrderSummeryTailor
              order={{
                imageUrl: selectedDesign?.preview || null,
                clothingType,
                size: selectedSize,
                color: selectedColor,
                quantity: 1,
                design: selectedDesign?.name || null
              }}
            />

            {/* Assigned Orders Panel (Legacy Assignment model) */}
            <div style={{ marginTop: 16 }}>
              <h2 style={{ margin: '12px 0' }}>My Assigned Orders</h2>
              {ordersError && <div style={{ color: 'red', marginBottom: 8 }}>{ordersError}</div>}
              {ordersLoading ? (
                <div>Loading assigned orders...</div>
              ) : (
                <div style={{ display: 'grid', gap: 8 }}>
                  {assignments.map((a) => {
                    const o = a.clothCustomizerId || {};
                    return (
                    <div key={a._id} style={{ border: '1px solid #eee', borderRadius: 8, padding: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                        <div style={{ display: 'grid', gap: 4 }}>
                          <div><strong>Assignment:</strong> {a._id}</div>
                          <div><strong>Order:</strong> {o?._id || '—'}</div>
                          <div><strong>Type:</strong> {o?.clothingType || '—'}</div>
                          <div><strong>Size/Color:</strong> {o?.size || '—'} / {o?.color || '—'}</div>
                          {typeof o?.quantity === 'number' && (
                            <div><strong>Quantity:</strong> {o.quantity}</div>
                          )}
                          <div>
                            <strong>Latest Status:</strong> {(() => {
                              const entry = latestStatuses[String(o?._id)] || null;
                              return entry?.status || '—';
                            })()}
                          </div>
                        </div>
                        {/* If you store previews in customizer, show them here if available */}
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
                        <select defaultValue="" onChange={(e) => submitStatus(o?._id, e.target.value)} disabled={updatingStatusId === o?._id}>
                          <option value="" disabled>Update status...</option>
                          {allowedTransitions.options.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        {updatingStatusId === o?._id && <span>Updating...</span>}
                      </div>
                    </div>
                  );})}
                  {assignments.length === 0 && <div>No assigned orders yet.</div>}
                </div>
              )}
            </div>

            {/* ClothCustomizer sessions (direct) */}
            <div style={{ marginTop: 24 }}>
              <h2 style={{ margin: '12px 0' }}>My ClothCustomizer Sessions</h2>
              {ccError && <div style={{ color: 'red', marginBottom: 8 }}>{ccError}</div>}
              {ccLoading ? (
                <div>Loading customizer data...</div>
              ) : (
                <div style={{ display: 'grid', gap: 12 }}>
                  {ccItems.map((c) => (
                    <div key={c._id} style={{ border: '1px solid #eee', borderRadius: 8, padding: 12 }}>
                      <div style={{ display: 'grid', gap: 4 }}>
                        <div><strong>ID:</strong> {c._id}</div>
                        <div><strong>Nickname:</strong> {c.nickname || '—'}</div>
                        <div><strong>Type/Size/Color:</strong> {(c.clothingType||'—')} • {(c.size||'—')} • {(c.color||'—')}</div>
                        {typeof c.quantity === 'number' && (
                          <div><strong>Quantity:</strong> {c.quantity}</div>
                        )}
                        {typeof c.totalPrice === 'number' && (
                          <div><strong>Total Price:</strong> ${c.totalPrice.toFixed(2)}</div>
                        )}
                        <div><strong>Created:</strong> {c.createdAt ? new Date(c.createdAt).toLocaleString() : '—'}</div>
                      </div>
                    </div>
                  ))}
                  {ccItems.length === 0 && <div>No customizer sessions found.</div>}
                </div>
              )}
            </div>
          </div>

          {/* Left Column: Clothing Type + T-Shirt Preview */}
          <div className="tailor-left">
            <div className="tailor-canvas">
              <Canvas
                camera={{ position: [5, 0, 5], fov: 45 }}
                style={{ width: '100%', height: '100%' }}
              >
                <ambientLight intensity={0.3} />
                <directionalLight position={[5, 5, 5]} intensity={0.1} />
                <pointLight position={[-5, 5, 5]} intensity={0.5} />

                <Bounds fit clip observe margin={1.2}>
                  <TShirtModel
                    selectedColor={selectedColor}
                    chestDesignUrl={selectedDesign?.preview || null}
                    position={[0, 0, 0]}
                    scale={2}
                  />
                </Bounds>

                <OrbitControls
                  ref={controlsRef}
                  enableZoom={true}
                  enablePan={false}
                  enableRotate={true}
                  minDistance={2}
                  maxDistance={8}
                  maxPolarAngle={Math.PI / 2}
                  minPolarAngle={Math.PI / 2}
                  target={[0, 2.5, 0]}
                />
              </Canvas>
            </div>
          </div>

          
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Tailor_Home;
