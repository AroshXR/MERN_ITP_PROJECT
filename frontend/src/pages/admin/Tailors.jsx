import React, { useEffect, useState } from 'react';
import axios from 'axios';
import NavBar from '../../Components/NavBar/navBar';
import Footer from '../../Components/Footer/Footer';
import { useAuth } from '../../AuthGuard/AuthGuard';
import TailorSubNav from '../../Components/tailor-management/TailorSubNav';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001';

export default function AdminTailors() {
  const { getToken } = useAuth();
  const [tailors, setTailors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTailors = async () => {
    try {
      setLoading(true);
      setError('');
      const token = getToken();
      const res = await axios.get(`${API_BASE_URL}/api/tailors`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTailors(res.data?.data || []);
    } catch (e) {
      setError('Failed to load tailors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTailors(); }, []);

  return (
    <div className="admin-tailors">
      <NavBar />
      <TailorSubNav />
      <main style={{ maxWidth: 1000, margin: '0 auto', padding: 16 }}>
        <h1>Tailors</h1>
        {/* Counters */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', margin: '12px 0' }}>
          {(() => {
            const total = tailors.length;
            const active = tailors.filter(t => t.isActive).length;
            const inactive = total - active;
            return (
              <>
                <div style={{ border: '1px solid #eee', borderRadius: 8, padding: '8px 12px', minWidth: 160 }}>
                  <div style={{ fontSize: 12, color: '#666' }}>Total Tailors</div>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>{total}</div>
                </div>
                <div style={{ border: '1px solid #eee', borderRadius: 8, padding: '8px 12px', minWidth: 160 }}>
                  <div style={{ fontSize: 12, color: '#666' }}>Active</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#16a34a' }}>{active}</div>
                </div>
                <div style={{ border: '1px solid #eee', borderRadius: 8, padding: '8px 12px', minWidth: 160 }}>
                  <div style={{ fontSize: 12, color: '#666' }}>Inactive</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#dc2626' }}>{inactive}</div>
                </div>
              </>
            );
          })()}
        </div>
        {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {tailors.map(t => (
              <div key={t._id} style={{ border: '1px solid #eee', borderRadius: 8, padding: 12, display: 'grid', gap: 6 }}>
                <div><strong>Name:</strong> {t.name}</div>
                <div><strong>Phone:</strong> {t.phone || '—'}</div>
                <div><strong>Skills:</strong> {Array.isArray(t.skills) && t.skills.length ? t.skills.join(', ') : '—'}</div>
                <div><strong>Active:</strong> {t.isActive ? 'Yes' : 'No'}</div>
                <div><strong>Rating:</strong> {t.rating ?? '—'}</div>
                <div><strong>Registered:</strong> {new Date(t.createdAt).toLocaleString()}</div>
              </div>
            ))}
            {tailors.length === 0 && <div>No tailors found.</div>}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
