import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { ApiService } from '../services/api.service';
import { User, Subscription, Invoice } from '../types';

const Profile: React.FC = () => {
  const { user, setAuth } = useAuthStore();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<User | null>(user);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  // Form states
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      console.log('🔄 Fetching profile data...');
      const [profileData, invoicesData] = await Promise.all([
        ApiService.getProfile(),
        ApiService.getInvoices().catch(() => []) // Invoices might not exist
      ]);
      
      console.log('✅ Profile loaded:', profileData);
      console.log('✅ Invoices loaded:', invoicesData);
      
      setProfile(profileData);
      setInvoices(invoicesData);
      setFormData({
        name: profileData.name,
        email: profileData.email
      });
    } catch (error: any) {
      console.error('❌ Failed to fetch profile data:', error);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);

    try {
      console.log('🔄 Updating profile...');
      // Note: This endpoint might need to be implemented in the backend
      const updatedProfile = await ApiService.getProfile(); // Placeholder
      
      console.log('✅ Profile updated:', updatedProfile);
      setProfile(updatedProfile);
      setAuth(updatedProfile, useAuthStore.getState().token!);
      setEditMode(false);
    } catch (error: any) {
      console.error('❌ Failed to update profile:', error);
      setError('Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getInvoiceStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return { bg: '#d4edda', color: '#155724', text: '✅ Paid' };
      case 'pending':
        return { bg: '#fff3cd', color: '#856404', text: '⏳ Pending' };
      case 'failed':
        return { bg: '#f8d7da', color: '#721c24', text: '❌ Failed' };
      case 'cancelled':
        return { bg: '#f8f9fa', color: '#6c757d', text: '🚫 Cancelled' };
      default:
        return { bg: '#f8f9fa', color: '#6c757d', text: '❓ Unknown' };
    }
  };

  if (loading) {
    return (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center',
        minHeight: '50vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔄</div>
          <div>Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          margin: '0 0 0.5rem 0', 
          color: '#343a40',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          👤 My Profile
        </h1>
        <p style={{ color: '#6c757d', margin: 0 }}>
          Manage your account settings and view your billing information
        </p>
      </div>

      {error && (
        <div style={{ 
          padding: '1rem', 
          marginBottom: '2rem',
          backgroundColor: '#f8d7da', 
          color: '#721c24',
          borderRadius: '8px',
          border: '1px solid #f5c6cb'
        }}>
          ❌ {error}
          <button 
            onClick={() => setError('')}
            style={{ 
              marginLeft: '1rem', 
              background: 'none', 
              border: 'none', 
              color: '#721c24', 
              cursor: 'pointer' 
            }}
          >
            ✕
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gap: '2rem' }}>
        {/* Profile Information */}
        <div style={{ 
          padding: '2rem', 
          backgroundColor: 'white', 
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          border: '1px solid #dee2e6'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
            <h2 style={{ margin: 0, color: '#343a40' }}>
              📝 Profile Information
            </h2>
            <button
              onClick={() => setEditMode(!editMode)}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: editMode ? '#6c757d' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              {editMode ? '❌ Cancel' : '✏️ Edit'}
            </button>
          </div>

          {editMode ? (
            <form onSubmit={handleUpdateProfile}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Full Name:
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #dee2e6',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Email:
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #dee2e6',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={updating}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: updating ? '#6c757d' : '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: updating ? 'not-allowed' : 'pointer',
                  fontSize: '1rem'
                }}
              >
                {updating ? '🔄 Updating...' : '💾 Save Changes'}
              </button>
            </form>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>Name:</strong> 
                <span>{profile?.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>Email:</strong> 
                <span>{profile?.email}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>Member since:</strong> 
                <span>{profile?.created_at ? formatDate(profile.created_at) : 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>Last updated:</strong> 
                <span>{profile?.updated_at ? formatDate(profile.updated_at) : 'N/A'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Billing Overview */}
        <div style={{ 
          padding: '2rem', 
          backgroundColor: 'white', 
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          border: '1px solid #dee2e6'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
            <h2 style={{ margin: 0, color: '#343a40' }}>
              💰 Billing Overview
            </h2>
            <button
              onClick={() => navigate('/billing')}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#17a2b8',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              ⚙️ Manage Billing
            </button>
          </div>

          {invoices.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '3rem 1rem',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              border: '2px dashed #dee2e6'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💰</div>
              <h3 style={{ margin: '0 0 1rem 0', color: '#495057' }}>
                No billing history
              </h3>
              <p style={{ margin: '0 0 1.5rem 0', color: '#6c757d' }}>
                Your invoices will appear here once you subscribe to a plan
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={() => navigate('/plans')}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#6f42c1',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  💎 View Plans
                </button>
                <button
                  onClick={() => navigate('/billing')}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#17a2b8',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  💰 Manage Billing
                </button>
              </div>
            </div>
          ) : (
            <div>
              {/* Mostrar solo las últimas 3 facturas en Profile */}
              <div style={{ display: 'grid', gap: '1rem', marginBottom: '1rem' }}>
                {invoices.slice(0, 3).map(invoice => {
                  const statusInfo = getInvoiceStatusColor(invoice.status);
                  return (
                    <div key={invoice.id} style={{
                      padding: '1.5rem',
                      border: '1px solid #dee2e6',
                      borderRadius: '8px',
                      backgroundColor: '#f8f9fa'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                            📄 Invoice #{invoice.id}
                          </div>
                          <div style={{ color: '#6c757d', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                            Period: {formatDate(invoice.billing_period_start)} - {formatDate(invoice.billing_period_end)}
                          </div>
                          <div style={{ color: '#6c757d', fontSize: '0.9rem' }}>
                            Created: {formatDate(invoice.created_at)}
                            {invoice.payment_date && (
                              <span> • Paid: {formatDate(invoice.payment_date)}</span>
                            )}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ 
                            fontSize: '1.5rem', 
                            fontWeight: 'bold', 
                            marginBottom: '0.5rem' 
                          }}>
                            ${invoice.amount.toFixed(2)}
                          </div>
                          <span style={{ 
                            display: 'inline-block',
                            padding: '0.25rem 0.75rem',
                            backgroundColor: statusInfo.bg,
                            color: statusInfo.color,
                            borderRadius: '20px',
                            fontSize: '0.875rem',
                            fontWeight: 'bold'
                          }}>
                            {statusInfo.text}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Botones de acción */}
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                {invoices.length > 3 && (
                  <button
                    onClick={() => navigate('/billing')}
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: 'transparent',
                      color: '#007bff',
                      border: '2px solid #007bff',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    📄 View All Invoices ({invoices.length - 3} more)
                  </button>
                )}
                
                <button
                  onClick={() => navigate('/billing')}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#17a2b8',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  ⚙️ Manage Subscription
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div style={{ 
          padding: '2rem', 
          backgroundColor: 'white', 
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          border: '1px solid #dee2e6'
        }}>
          <h2 style={{ margin: '0 0 1.5rem 0', color: '#343a40' }}>
            🚀 Quick Actions
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gap: '1rem', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' 
          }}>
            <button
              onClick={() => navigate('/projects')}
              style={{
                padding: '1.5rem',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 'bold',
                textAlign: 'center',
                transition: 'transform 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📁</div>
              <div>My Projects</div>
            </button>

            <button
              onClick={() => navigate('/plans')}
              style={{
                padding: '1.5rem',
                backgroundColor: '#6f42c1',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 'bold',
                textAlign: 'center',
                transition: 'transform 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>💎</div>
              <div>View Plans</div>
            </button>

            <button
              onClick={() => navigate('/billing')}
              style={{
                padding: '1.5rem',
                backgroundColor: '#17a2b8',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 'bold',
                textAlign: 'center',
                transition: 'transform 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>💰</div>
              <div>Billing & Invoices</div>
            </button>

            <button
              onClick={() => navigate('/dashboard')}
              style={{
                padding: '1.5rem',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 'bold',
                textAlign: 'center',
                transition: 'transform 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📊</div>
              <div>Dashboard</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;