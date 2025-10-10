import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import NavBar from '../../Components/NavBar/navBar';
import Footer from '../../Components/Footer/Footer';
import TailorSubNav from '../../Components/tailor-management/TailorSubNav';
import ReadOnlyDesignViewer from '../../Components/tailor-management/ReadOnlyDesignViewer';
import { useAuth } from '../../AuthGuard/AuthGuard';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001';

export default function OrderDetail() {
  const { id } = useParams();
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [order, setOrder] = useState(null);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get(`${API_BASE_URL}/api/custom-orders/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setOrder(res.data?.data || null);
    } catch (err) {
      console.error('OrderDetail fetch error:', err);
      setError('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrder(); }, [id]);

  const color = order?.config?.color || '#ffffff';
  const designImage = order?.design?.designImageUrl || (order?.design?.placedDesigns?.[0]?.preview ?? null);

  return (
    <div>
      <NavBar />
      <TailorSubNav />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h2>Order Detail</h2>
          <button onClick={fetchOrder} style={{ padding: '8px 12px' }}>Refresh</button>
        </div>

        {loading && <div>Loading...</div>}
        {error && <div style={{ color: '#b91c1c' }}>{error}</div>}

        {!loading && order && (
          <div style={{ display: 'grid', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <ReadOnlyDesignViewer color={color} designImageUrl={designImage} />
              </div>
              <div>
                <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 12 }}>
                  <h3>Summary</h3>
                  <p><strong>Order ID:</strong> {order._id}</p>
                  <p><strong>Status:</strong> {order.status}</p>
                  {order.config && (
                    <>
                      <p><strong>Type:</strong> {order.config.clothingType}</p>
                      <p><strong>Color:</strong> {order.config.color}</p>
                      <p><strong>Size:</strong> {order.config.size}</p>
                      <p><strong>Quantity:</strong> {order.config.quantity || 1}</p>
                    </>
                  )}
                  {order.price != null && <p><strong>Price:</strong> ${order.price}</p>}
                </div>

                {order.design?.placedDesigns && order.design.placedDesigns.length > 0 && (
                  <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 12, marginTop: 12 }}>
                    <h3>Placed Designs</h3>
                    <ul>
                      {order.design.placedDesigns.map((d, idx) => (
                        <li key={idx}>
                          {d.side || 'front'} • pos({d.x ?? 0}, {d.y ?? 0}) • scale {d.scale ?? 1}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
