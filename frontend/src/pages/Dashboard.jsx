import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import AdminPanel from "../components/AdminPanel";
import EquipmentList from "../components/EquipmentList";
import RequestList from "../components/RequestList";
import Modal from "../components/Modal";
import { useNavigate } from "react-router-dom";
import "../index.css";

const Dashboard = () => {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutConfirm = () => {
    logout();
    navigate("/");
  };

  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="container fade-in">
      {/* Header */}
      <div className="flex-between mb-4" style={{ marginBottom: '3rem', alignItems: 'flex-start' }}>
        <div>
          <div className="brand-logo" style={{ color: 'var(--primary)', marginBottom: '1rem' }}>
             <div className="logo-icon-sm">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12v10H4V12"/><path d="m2 7 10 5 10-5-10-5z"/><path d="m12 22 5-10"/><path d="M12 22 7 12"/></svg>
             </div>
             <span style={{ fontWeight: '800', fontSize: '1.25rem', letterSpacing: '-0.5px' }}>EquipStream</span>
          </div>
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: '800',
            color: 'var(--text-primary)',
            letterSpacing: '-1px',
            marginBottom: '0.25rem'
          }}>
            Dashboard
          </h1>
          <p className="text-muted" style={{ fontSize: '1rem' }}>
            Welcome back, <span style={{ color: 'var(--primary)', fontWeight: '600' }}>{user.email || 'User'}</span>
          </p>
        </div>
        <button onClick={() => setShowLogoutModal(true)} className="btn btn-secondary" style={{ marginTop: '0.5rem' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          Sign Out
        </button>
      </div>

      {/* Admin Panel - Only for Admin */}
      {user.role === "admin" && (
        <div className="mb-4 slide-in">
          <AdminPanel onAction={() => setRefreshTrigger(prev => prev + 1)} />
        </div>
      )}

      {/* Equipment List - For Everyone */}
      <div className="mb-4 fade-in" style={{ animationDelay: '0.1s' }}>
        <EquipmentList 
          refreshTrigger={refreshTrigger} 
          onAction={() => setRefreshTrigger(prev => prev + 1)} 
        />
      </div>

      {/* Request List - For Everyone */}
      <div className="fade-in" style={{ animationDelay: '0.2s' }}>
        <RequestList 
          refreshTrigger={refreshTrigger}
          onStatusChange={() => setRefreshTrigger(prev => prev + 1)} 
        />
      </div>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Logout Confirmation"
        footer={
          <>
            <button onClick={() => setShowLogoutModal(false)} className="btn btn-secondary">Cancel</button>
            <button onClick={handleLogoutConfirm} className="btn btn-primary">Log Out</button>
          </>
        }
      >
        <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
            <div style={{ 
              background: 'rgba(99, 102, 241, 0.1)', 
              color: 'var(--primary)', 
              width: '4rem', 
              height: '4rem', 
              borderRadius: '1rem', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 1.5rem',
              transform: 'rotate(-5deg)'
            }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>See you later!</h3>
            <p className="text-muted" style={{ fontSize: '1rem', lineHeight: '1.6' }}>
              Are you sure you want to end your session? You'll need to enter your credentials again to return.
            </p>
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;
