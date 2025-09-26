import React, { useEffect, useState } from 'react';
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
  const [selectedColor, setSelectedColor] = useState("#ffffff");
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [clothingType, setClothingType] = useState("tshirt");
  const [selectedSide] = useState("front");
  const [activeDesignId, setActiveDesignId] = useState(null);
  const controlsRef = React.useRef();
  const [selectedSize, setSelectedSize] = useState(null);
  const { getToken } = useAuth();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001';
  const [assignedOrders, setAssignedOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');

  const handleDesignSelect = (design) => {
    setSelectedDesign(design);
    setActiveDesignId(`${design.id}-${Date.now()}`);
  };

  const handleColorSelect = (color) => {
    setSelectedColor(color);
  };

  // Fetch orders assigned to the logged-in tailor
  useEffect(() => {
    const fetchAssigned = async () => {
      try {
        setOrdersLoading(true);
        setOrdersError('');
        const token = getToken();
        if (!token) {
          setAssignedOrders([]);
          return;
        }
        const res = await axios.get(`${API_BASE_URL}/api/custom-orders/assigned/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAssignedOrders(res.data?.data || []);
      } catch (e) {
        setOrdersError('Failed to load assigned orders');
      } finally {
        setOrdersLoading(false);
      }
    };
    fetchAssigned();
  }, [getToken]);

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

            {/* Assigned Orders Panel */}
            <div style={{ marginTop: 16 }}>
              <h2 style={{ margin: '12px 0' }}>My Assigned Orders</h2>
              {ordersError && <div style={{ color: 'red', marginBottom: 8 }}>{ordersError}</div>}
              {ordersLoading ? (
                <div>Loading assigned orders...</div>
              ) : (
                <div style={{ display: 'grid', gap: 8 }}>
                  {assignedOrders.map((o) => (
                    <div key={o._id} style={{ border: '1px solid #eee', borderRadius: 8, padding: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                        <div style={{ display: 'grid', gap: 4 }}>
                          <div><strong>Order:</strong> {o._id}</div>
                          <div><strong>Status:</strong> {o.status}</div>
                          <div><strong>Type:</strong> {o?.config?.clothingType || '—'}</div>
                          <div><strong>Size/Color:</strong> {o?.config?.size || '—'} / {o?.config?.color || '—'}</div>
                          {typeof o?.config?.quantity === 'number' && (
                            <div><strong>Quantity:</strong> {o.config.quantity}</div>
                          )}
                        </div>
                        {Array.isArray(o.previewGallery) && o.previewGallery.length > 0 && (
                          <img src={o.previewGallery[0]} alt="preview" style={{ width: 96, height: 96, objectFit: 'cover', borderRadius: 6 }} />
                        )}
                      </div>
                    </div>
                  ))}
                  {assignedOrders.length === 0 && <div>No assigned orders yet.</div>}
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
