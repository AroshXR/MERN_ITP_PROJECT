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
  const [updatingAssignmentId, setUpdatingAssignmentId] = useState('');

  // Custom Orders (new): assigned to me via /api/custom-orders/assigned
  const [customOrders, setCustomOrders] = useState([]);
  const [customOrdersLoading, setCustomOrdersLoading] = useState(false);
  const [customOrdersError, setCustomOrdersError] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState('');

  // ClothCustomizer sessions (direct display)
  const [ccItems, setCcItems] = useState([]);
  const [ccLoading, setCcLoading] = useState(false);
  const [ccError, setCcError] = useState('');

  // removed per request: tailor updates assignment status only

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
      // Refresh list after update (new system endpoint)
      const res = await axios.get(`${API_BASE_URL}/api/custom-orders/assigned/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCustomOrders(res.data?.data || []);
    } catch (e) {
      alert('Failed to update order status');
    } finally {
      setUpdatingOrderId('');
    }
  };

  // Update status on OrderAssignment (tailor-controlled)
  const updateAssignmentStatus = async (assignmentId, next) => {
    try {
      if (!next || !assignmentId) return;
      setUpdatingAssignmentId(assignmentId);
      const token = getToken();
      await axios.patch(`${API_BASE_URL}/api/order-assignments/${assignmentId}/status`, { status: next }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // reflect in local assignments list
      setAssignments(prev => prev.map(x => {
        if ((x?.assignment?._id || x?._id) !== assignmentId) return x;
        if (x.assignment) return { ...x, assignment: { ...x.assignment, status: next } };
        return { ...x, status: next };
      }));
    } catch (e) {
      alert('Failed to update assignment status');
    } finally {
      setUpdatingAssignmentId('');
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
        const res = await axios.get(`${API_BASE_URL}/api/order-assignments/mine`, {
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
        const res = await axios.get(`${API_BASE_URL}/api/custom-orders/assigned/me`, {
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

  // removed per request: direct order status updates from tailor UI

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
                    // Support both shapes:
                    // - New: { assignment, order }
                    // - Legacy: { clothCustomizerId, ... }
                    const o = a?.order || a?.clothCustomizerId || {};
                    const aid = a?.assignment?._id || a?._id;
                    const astatus = a?.assignment?.status || a?.status || '—';
                    return (
                    <div key={a._id} style={{ border: '1px solid #eee', borderRadius: 8, padding: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                        <div style={{ display: 'grid', gap: 4 }}>
                          <div><strong>Assignment:</strong> {a._id}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span><strong>Order:</strong> {o?._id || '—'}</span>
                            {o?._id && (
                              <button
                                type="button"
                                onClick={() => {
                                  try { navigator.clipboard.writeText(o._id); alert('Order ID copied'); } catch (e) { alert('Copy failed'); }
                                }}
                                style={{ padding: '4px 8px', fontSize: 12 }}
                              >
                                Copy ID
                              </button>
                            )}
                          </div>
                          {typeof o?.quantity === 'number' && (
                            <div><strong>Quantity:</strong> {o.quantity}</div>
                          )}
                          <div>
                            <strong>Latest Status:</strong> {(() => {
                              const entry = latestStatuses[String(o?._id)] || null;
                              return entry?.status || '—';
                            })()}
                          </div>
                          <div>
                            <strong>Assignment Status:</strong> {astatus}
                          </div>
                        </div>
                        {/* If you store previews in customizer, show them here if available */}
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
                        {aid && (
                          <>
                            <select defaultValue="" onChange={(e) => updateAssignmentStatus(aid, e.target.value)} disabled={updatingAssignmentId === aid}>
                              <option value="" disabled>Update assignment status...</option>
                              {['assigned','accepted','in_progress','completed','rejected'].map(s => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                            {updatingAssignmentId === aid && <span>Updating...</span>}
                          </>
                        )}
                      </div>
                    </div>
                  );})}
                  {assignments.length === 0 && <div>No assigned orders yet.</div>}
                </div>
              )}
            </div>

            {/* ClothCustomizer sessions panel removed as requested */}
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
