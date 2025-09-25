import React from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../NavBar/navBar';
import Footer from '../Footer/Footer';
import './AdminHub.css';

export default function AdminHub() {
  const navigate = useNavigate();

  return (
    <div className="admin-hub-page">
      <NavBar />
      <main className="admin-hub">
        <header className="admin-hub__header">
          <h1>Admin Hub</h1>
          <p>Select an area to manage.</p>
        </header>

        <section className="admin-hub__grid">
          <button className="hub-card" onClick={() => navigate('/admin')}>
            <i className='bx bx-briefcase'></i>
            <h3>Career Management</h3>
            <p>Manage applicants, jobs and reports.</p>
          </button>

          <button className="hub-card" onClick={() => navigate('/admin/users')}>
            <i className='bx bx-user'></i>
            <h3>User Management</h3>
            <p>Manage users and roles.</p>
          </button>

          <button className="hub-card" onClick={() => navigate('/inventoryManagement')}>
            <i className='bx bx-package'></i>
            <h3>Material Inventory Management</h3>
            <p>Track materials and stock levels.</p>
          </button>

          <button className="hub-card supplier-card" onClick={() => navigate('/supplierManagement')}>
            <i className='bx bxs-truck'></i>
            <h3>Supplier Management</h3>
            <p>Manage suppliers and orders.</p>
          </button>

          <button className="hub-card" onClick={() => navigate('/paymentDetails')}>
            <i className='bx bx-credit-card'></i>
            <h3>Payment Details</h3>
            <p>View and analyze payment transactions.</p>
          </button>

          <button className="hub-card" onClick={() => navigate('/orderSummary')}>
            <i className='bx bx-receipt'></i>
            <h3>Order Summary</h3>
            <p>Review and manage order summaries and invoices.</p>
          </button>

          <button className="hub-card" onClick={() => navigate('/owner')}>
            <i className='bx bx-home-alt'></i>
            <h3>Rental Management</h3>
            <p>Manage rental listings, bookings, and dashboards.</p>
          </button>

        </section>
      </main>
      <Footer />
    </div>
  );
}
