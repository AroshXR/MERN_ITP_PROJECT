import React, { useState } from 'react';
import AdminApplicantManagement from '../AdminApplicantManagement/AdminApplicantManagement';
import AdminJobManagement from '../AdminJobManagement/AdminJobManagement';
import Reports from './Reports';
import Dashboard from './Dashboard';
import './AdminPanel.css';
import NavBar from '../NavBar/navBar';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div>
      <NavBar />
      <div className="admin-panel">
        <div className="admin-panel__tabs">
          <button
            className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button
            className={`tab-btn ${activeTab === 'applicants' ? 'active' : ''}`}
            onClick={() => setActiveTab('applicants')}
          >
            Applicants
          </button>
          <button
            className={`tab-btn ${activeTab === 'jobs' ? 'active' : ''}`}
            onClick={() => setActiveTab('jobs')}
          >
            Job Management
          </button>
        </div>

        <div className="admin-panel__content">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'applicants' && <AdminApplicantManagement />}
          {activeTab === 'jobs' && <AdminJobManagement />}
        </div>
      </div><div className="admin-panel">
        <div className="admin-panel__tabs">
          <button
            className={`tab-btn ${activeTab === 'applicants' ? 'active' : ''}`}
            onClick={() => setActiveTab('applicants')}
          >
            Applicants
          </button>
          <button
            className={`tab-btn ${activeTab === 'jobs' ? 'active' : ''}`}
            onClick={() => setActiveTab('jobs')}
          >
            Job Management
          </button>
        </div>

        <div className="admin-panel__content">
          {activeTab === 'applicants' && <AdminApplicantManagement />}
          {activeTab === 'jobs' && <AdminJobManagement />}
        </div>
      </div>
    </div>

  );
}


