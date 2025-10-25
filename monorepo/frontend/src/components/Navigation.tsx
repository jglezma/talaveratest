import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useSubscriptionStore } from '../stores/subscriptionStore';

const Navigation: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { subscription, isSubscribed, isTrialing, daysUntilExpiry } = useSubscriptionStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    console.log('🚪 Logging out from navigation...');
    logout();
    navigate('/login', { replace: true });
  };

  const isActive = (path: string) => location.pathname === path;

  const linkStyle = (path: string) => ({
    textDecoration: 'none',
    color: isActive(path) ? '#007bff' : '#6c757d',
    fontWeight: isActive(path) ? 'bold' : 'normal',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    backgroundColor: isActive(path) ? '#e7f1ff' : 'transparent',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  });

  const getSubscriptionBadge = () => {
    if (!isSubscribed()) return null;
    
    if (isTrialing()) {
      return (
        <span style={{
          padding: '0.25rem 0.5rem',
          backgroundColor: '#17a2b8',
          color: 'white',
          borderRadius: '12px',
          fontSize: '0.75rem',
          fontWeight: 'bold',
          marginLeft: '0.5rem'
        }}>
          TRIAL
        </span>
      );
    }

    return (
      <span style={{
        padding: '0.25rem 0.5rem',
        backgroundColor: '#28a745',
        color: 'white',
        borderRadius: '12px',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        marginLeft: '0.5rem'
      }}>
        PRO
      </span>
    );
  };

  return (
    <nav style={{ 
      padding: '1rem 2rem', 
      backgroundColor: '#ffffff', 
      borderBottom: '1px solid #dee2e6',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '1rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <Link to="/dashboard" style={{ textDecoration: 'none' }}>
          <h2 style={{ 
            margin: 0, 
            color: '#007bff', 
            fontSize: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            🚀 TalaveraTest
            {getSubscriptionBadge()}
          </h2>
        </Link>
        
        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
          <Link to="/dashboard" style={linkStyle('/dashboard')}>
            📊 Dashboard
          </Link>
          <Link to="/projects" style={linkStyle('/projects')}>
            📁 Projects
          </Link>
          <Link to="/plans" style={linkStyle('/plans')}>
            💎 Plans
          </Link>
          <Link to="/billing" style={linkStyle('/billing')}>
            💰 Billing
          </Link>
          <Link to="/profile" style={linkStyle('/profile')}>
            👤 Profile
          </Link>
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        {/* Subscription Status */}
        {isSubscribed() && subscription && (
          <div style={{ 
            padding: '0.5rem 1rem',
            backgroundColor: isTrialing() ? '#d1ecf1' : '#d4edda',
            color: isTrialing() ? '#0c5460' : '#155724',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}>
            {isTrialing() ? '🔄' : '💎'}
            {isTrialing() ? 'Trial' : 'Active'}
            {daysUntilExpiry() !== null && (
              <span style={{ marginLeft: '0.25rem' }}>
                ({daysUntilExpiry()} days)
              </span>
            )}
          </div>
        )}

        {/* User Info */}
        <div style={{ 
          padding: '0.5rem 1rem',
          backgroundColor: '#f8f9fa',
          borderRadius: '20px',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          👋 <strong>{user?.name}</strong>
        </div>
        
        <button 
          onClick={handleLogout}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            transition: 'background-color 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#c82333'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#dc3545'}
        >
          🚪 Logout
        </button>
      </div>
    </nav>
  );
};

export default Navigation;