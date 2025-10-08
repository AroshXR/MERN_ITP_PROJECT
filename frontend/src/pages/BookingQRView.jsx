import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../Components/pasindu/Navbar';
import './BookingQRView.css';

const BookingQRView = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [bookingData, setBookingData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const qrData = searchParams.get('data');
    
    if (!qrData) {
      setError('No QR code data provided');
      setLoading(false);
      return;
    }

    try {
      const decoded = JSON.parse(decodeURIComponent(qrData));
      console.log('Decoded booking data:', decoded); // Debug log
      setBookingData(decoded);
      setLoading(false);
    } catch (err) {
      console.error('Error parsing QR data:', err);
      setError('Invalid QR code data');
      setLoading(false);
    }
  }, [searchParams]);

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="qr-view-container">
          <div className="loading-spinner">Loading booking details...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="qr-view-container">
          <div className="error-message">
            <h2>❌ Error</h2>
            <p>{error}</p>
            <button onClick={() => navigate('/my-bookings')} className="btn-primary">
              Go to My Bookings
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="qr-view-container">
        <div className="qr-view-card">
          <div className="qr-view-header">
            <h1>🎫 Booking Details</h1>
            <p className="subtitle">Scanned from QR Code</p>
          </div>

          {/* Outfit Image */}
          {bookingData.outfitImage && (
            <div className="outfit-image-section">
              <img src={bookingData.outfitImage} alt={bookingData.outfitName} className="outfit-image" />
            </div>
          )}

          <div className="booking-info-section">
            <h2>📋 Booking Information</h2>
            
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Booking ID:</span>
                <span className="info-value">{bookingData.bookingId}</span>
              </div>

              <div className="info-item">
                <span className="info-label">Outfit:</span>
                <span className="info-value outfit-name">{bookingData.outfitName}</span>
              </div>

              <div className="info-item">
                <span className="info-label">Category:</span>
                <span className="info-value">{bookingData.category}</span>
              </div>

              <div className="info-item">
                <span className="info-label">Location:</span>
                <span className="info-value">{bookingData.location}</span>
              </div>

              <div className="info-item full-width">
                <span className="info-label">Rental Period:</span>
                <span className="info-value">
                  {new Date(bookingData.reservationDate).toLocaleDateString()} 
                  {' to '}
                  {new Date(bookingData.returnDate).toLocaleDateString()}
                </span>
              </div>

              <div className="info-item">
                <span className="info-label">Total Amount:</span>
                <span className="info-value price">${bookingData.price?.toFixed(2)}</span>
              </div>

              <div className="info-item">
                <span className="info-label">Payment Method:</span>
                <span className="info-value payment-method">{bookingData.paymentMethod?.replace('_', ' ')}</span>
              </div>

              <div className="info-item">
                <span className="info-label">Payment Status:</span>
                <span className={`status-badge payment-${bookingData.paymentStatus}`}>
                  {bookingData.paymentStatus?.toUpperCase()}
                </span>
              </div>

              <div className="info-item">
                <span className="info-label">Booking Status:</span>
                <span className={`status-badge status-${bookingData.status}`}>
                  {bookingData.status?.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          <div className="contact-section">
            <h3>📞 Contact Information</h3>
            <div className="contact-details">
              <div className="contact-item">
                <span className="contact-icon">📧</span>
                <span>{bookingData.email}</span>
              </div>
              <div className="contact-item">
                <span className="contact-icon">📱</span>
                <span>{bookingData.phone}</span>
              </div>
            </div>
          </div>

          {bookingData.paymentMethod === 'pay_on_return' && bookingData.paymentStatus === 'unpaid' && (
            <div className="payment-alert">
              <h4>⚠️ Payment Required on Return</h4>
              <p>
                Please complete payment when returning the outfit.
                <br />
                Amount due: <strong>${bookingData.price?.toFixed(2)}</strong>
              </p>
            </div>
          )}

          <div className="action-buttons">
            <button onClick={() => window.print()} className="btn-primary">
              Print Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingQRView;
