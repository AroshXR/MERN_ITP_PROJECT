import React from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../NavBar/navBar';
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
            <h3>Inventory Management</h3>
            <p>Track materials and stock levels.</p>
          </button>

          <button className="hub-card" onClick={() => navigate('/supplierManagement')}>
            <i className='bx bx-truck'></i>
            <h3>Supplier Management</h3>
            <p>Manage suppliers and orders.</p>
          </button>

          <button className="hub-card" onClick={() => navigate('/admin-jobs')}>
            <i className='bx bx-cog'></i>
            <h3>Job Management</h3>
            <p>Create and manage job postings.</p>
          </button>

          <button className="hub-card" onClick={() => navigate('/admin-applicants')}>
            <i className='bx bx-id-card'></i>
            <h3>Applicants</h3>
            <p>Review, shortlist, and schedule interviews.</p>
          </button>
        </section>
      </main>
    </div>
  );
}
