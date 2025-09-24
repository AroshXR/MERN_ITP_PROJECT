import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import NavBar from '../NavBar/navBar';
import AdminApplicantManagement from '../AdminApplicantManagement/AdminApplicantManagement';
import AdminJobManagement from '../AdminJobManagement/AdminJobManagement';
import Reports from '../AdminPanel/Reports';
import './AdminCareerManagement.css';

const TABS = [
  { key: 'applicants', label: 'Applicants' },
  { key: 'jobs', label: 'Job Management' },
  { key: 'reports', label: 'Reports' },
];

export default function AdminCareerManagement() {
  const [searchParams, setSearchParams] = useSearchParams();
  const validTabs = useMemo(() => TABS.map(t => t.key), []);
  const initialTab = useMemo(() => {
    const q = (searchParams.get('tab') || '').toLowerCase();
    return validTabs.includes(q) ? q : 'applicants';
  }, [searchParams, validTabs]);
  const [activeTab, setActiveTab] = useState(initialTab);

  // Keep URL in sync when tab changes
  useEffect(() => {
    const current = searchParams.get('tab');
    if (activeTab && current !== activeTab) {
      const next = new URLSearchParams(searchParams);
      next.set('tab', activeTab);
      setSearchParams(next, { replace: true });
    }
  }, [activeTab, searchParams, setSearchParams]);

  // Respond to URL changes (back/forward navigation)
  useEffect(() => {
    const q = (searchParams.get('tab') || '').toLowerCase();
    if (validTabs.includes(q) && q !== activeTab) {
      setActiveTab(q);
    }
  }, [searchParams, validTabs, activeTab]);

  const renderContent = () => {
    switch (activeTab) {
      case 'applicants':
        return <AdminApplicantManagement />;
      case 'jobs':
        return <AdminJobManagement />;
      case 'reports':
        return <Reports />;
      default:
        return null;
    }
  };

  return (
    <div className="admin-career-page">
      <NavBar />
      <div className="admin-career-container">
        <header className="admin-career-header">
          <h1>Career Management</h1>
          <p>Manage applicants, job postings, and view reports in one place.</p>
        </header>

        <div className="admin-career-tabs">
          {TABS.map((t) => (
            <button
              key={t.key}
              className={activeTab === t.key ? 'tab-btn active' : 'tab-btn'}
              onClick={() => setActiveTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="admin-career-quicklinks">
          <button className="quicklink-btn" onClick={() => setActiveTab('applicants')}>Go to Applicants</button>
          <button className="quicklink-btn" onClick={() => setActiveTab('jobs')}>Go to Job Management</button>
          <button className="quicklink-btn" onClick={() => setActiveTab('reports')}>Go to Reports</button>
        </div>

        <section className="admin-career-content">
          {renderContent()}
        </section>
      </div>
    </div>
  );
}
