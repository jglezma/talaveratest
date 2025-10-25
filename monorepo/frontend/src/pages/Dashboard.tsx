import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useSubscriptionStore } from '../stores/subscriptionStore';
import { ApiService } from '../services/api.service';
import { Project, Plan } from '../types';

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { 
    subscription, 
    usage, 
    currentPlan, 
    isSubscribed, 
    isTrialing, 
    daysUntilExpiry,
    usagePercentage 
  } = useSubscriptionStore();
  
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('🔄 Fetching dashboard data...');
        const [projectsData, plansData] = await Promise.all([
          ApiService.getProjects(),
          ApiService.getPlans()
        ]);
        
        console.log('✅ Projects loaded:', projectsData);
        console.log('✅ Plans loaded:', plansData);
        
        setProjects(projectsData);
        setPlans(plansData);
      } catch (error: any) {
        console.error('❌ Failed to fetch dashboard data:', error);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateFirstProject = () => {
    navigate('/projects?action=create');
  };

  const handleViewAllProjects = () => {
    navigate('/projects');
  };

  const handleViewAllPlans = () => {
    navigate('/plans');
  };

  const handleManageBilling = () => {
    navigate('/billing');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return { bg: '#d4edda', color: '#155724', text: '🟢 Active' };
      case 'completed':
        return { bg: '#d1ecf1', color: '#0c5460', text: '✅ Completed' };
      case 'inactive':
        return { bg: '#fff3cd', color: '#856404', text: '⏸️ Inactive' };
      default:
        return { bg: '#f8d7da', color: '#721c24', text: '❓ Unknown' };
    }
  };

  const formatPrice = (price: number | string, period: string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numPrice)) {
      return `$0.00/${period}`;
    }
    return `$${numPrice.toFixed(2)}/${period}`;
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
          <div>Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          margin: '0 0 0.5rem 0', 
          color: '#343a40',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          👋 Welcome back, {user?.name}!
        </h1>
        <p style={{ 
          color: '#6c757d', 
          fontSize: '1.1rem', 
          margin: 0 
        }}>
          Here's what's happening with your projects and subscriptions
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
        </div>
      )}

      <div style={{ display: 'grid', gap: '2rem' }}>
        {/* Subscription Alert */}
        {isSubscribed() && subscription && (
          <div style={{ 
            padding: '1.5rem', 
            backgroundColor: isTrialing() ? '#d1ecf1' : '#d4edda',
            color: isTrialing() ? '#0c5460' : '#155724',
            borderRadius: '12px',
            border: `2px solid ${isTrialing() ? '#bee5eb' : '#c3e6cb'}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                {isTrialing() ? '🔄 Trial Active' : '💎 Subscription Active'}
              </div>
              <div>
                {isTrialing() ? 
                  `Your trial expires in ${daysUntilExpiry()} days` :
                  `Your ${currentPlan?.name} plan is active`
                }
              </div>
            </div>
            <button
              onClick={handleManageBilling}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: isTrialing() ? '#17a2b8' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 'bold'
              }}
            >
              {isTrialing() ? '⬆️ Upgrade Now' : '⚙️ Manage'}
            </button>
          </div>
        )}

        {/* No Subscription Alert */}
        {!isSubscribed() && (
          <div style={{ 
            padding: '1.5rem', 
            backgroundColor: '#fff3cd',
            color: '#856404',
            borderRadius: '12px',
            border: '2px solid #ffeaa7',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                💎 Upgrade to Pro
              </div>
              <div>
                Get unlimited projects, priority support, and advanced features
              </div>
            </div>
            <button
              onClick={handleViewAllPlans}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 'bold'
              }}
            >
              🚀 View Plans
            </button>
          </div>
        )}

        {/* Quick Stats */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem' 
        }}>
          <div style={{ 
            padding: '1.5rem', 
            backgroundColor: '#e7f1ff', 
            borderRadius: '12px',
            textAlign: 'center',
            border: '2px solid #007bff'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📁</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#007bff' }}>
              {projects.length}
            </div>
            <div style={{ color: '#495057' }}>Total Projects</div>
            {usage && (
              <div style={{ fontSize: '0.8rem', color: '#6c757d', marginTop: '0.5rem' }}>
                {usage.projects_limit ? `of ${usage.projects_limit} max` : 'Unlimited'}
              </div>
            )}
          </div>

          <div style={{ 
            padding: '1.5rem', 
            backgroundColor: '#d4edda', 
            borderRadius: '12px',
            textAlign: 'center',
            border: '2px solid #28a745'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🟢</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#28a745' }}>
              {projects.filter(p => p.status === 'active').length}
            </div>
            <div style={{ color: '#495057' }}>Active Projects</div>
          </div>

          <div style={{ 
            padding: '1.5rem', 
            backgroundColor: '#fff3cd', 
            borderRadius: '12px',
            textAlign: 'center',
            border: '2px solid #ffc107'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💎</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#856404' }}>
              {currentPlan?.name || 'Free'}
            </div>
            <div style={{ color: '#495057' }}>Current Plan</div>
            {currentPlan && (
              <div style={{ fontSize: '0.8rem', color: '#6c757d', marginTop: '0.5rem' }}>
                ${currentPlan.price}/{currentPlan.billing_period}
              </div>
            )}
          </div>

          {usage && (
            <div style={{ 
              padding: '1.5rem', 
              backgroundColor: '#f3e8ff', 
              borderRadius: '12px',
              textAlign: 'center',
              border: '2px solid #6f42c1'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💾</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#6f42c1' }}>
                {Math.round(usagePercentage('storage'))}%
              </div>
              <div style={{ color: '#495057' }}>Storage Used</div>
              <div style={{ fontSize: '0.8rem', color: '#6c757d', marginTop: '0.5rem' }}>
                {(usage.storage_used / 1024).toFixed(1)}GB / {(usage.storage_limit / 1024).toFixed(1)}GB
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' 
          }}>
            <button
              onClick={handleCreateFirstProject}
              style={{
                padding: '1.5rem',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 'bold',
                textAlign: 'left',
                transition: 'transform 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>➕</div>
              <div>Create New Project</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9, marginTop: '0.25rem' }}>
                Start your next project
              </div>
            </button>

            <button
              onClick={handleViewAllProjects}
              style={{
                padding: '1.5rem',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 'bold',
                textAlign: 'left',
                transition: 'transform 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📁</div>
              <div>Manage Projects</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9, marginTop: '0.25rem' }}>
                View and edit your projects
              </div>
            </button>

            <button
              onClick={handleViewAllPlans}
              style={{
                padding: '1.5rem',
                backgroundColor: '#6f42c1',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 'bold',
                textAlign: 'left',
                transition: 'transform 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>💎</div>
              <div>Upgrade Plan</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9, marginTop: '0.25rem' }}>
                Unlock more features
              </div>
            </button>

            <button
              onClick={handleManageBilling}
              style={{
                padding: '1.5rem',
                backgroundColor: '#17a2b8',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 'bold',
                textAlign: 'left',
                transition: 'transform 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>💰</div>
              <div>Billing & Invoices</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9, marginTop: '0.25rem' }}>
                Manage subscription
              </div>
            </button>
          </div>
        </div>

        {/* Projects Summary */}
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
            <h2 style={{ margin: 0, color: '#343a40', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              📁 Recent Projects
            </h2>
            <button
              onClick={handleViewAllProjects}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                textDecoration: 'none'
              }}
            >
              View All Projects →
            </button>
          </div>

          {projects.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '3rem 1rem',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              border: '2px dashed #dee2e6'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📁</div>
              <h3 style={{ margin: '0 0 1rem 0', color: '#495057' }}>
                No projects yet
              </h3>
              <p style={{ margin: '0 0 1.5rem 0', color: '#6c757d' }}>
                Get started by creating your first project
              </p>
              <button
                onClick={handleCreateFirstProject}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 'bold'
                }}
              >
                🚀 Create Your First Project
              </button>
            </div>
          ) : (
            <div>
              {projects.slice(0, 3).map(project => {
                const statusInfo = getStatusColor(project.status);
                return (
                  <div key={project.id} style={{ 
                    padding: '1.5rem', 
                    marginBottom: '1rem',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    border: '1px solid #dee2e6',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: '#343a40' }}>
                          {project.title}
                        </h4>
                        <p style={{ margin: '0 0 1rem 0', color: '#6c757d', lineHeight: '1.5' }}>
                          {project.description}
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
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
                          <span style={{ fontSize: '0.875rem', color: '#6c757d' }}>
                            Created: {new Date(project.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {projects.length > 3 && (
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                  <button
                    onClick={handleViewAllProjects}
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: 'transparent',
                      color: '#007bff',
                      border: '2px solid #007bff',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                    View {projects.length - 3} more projects →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Available Plans Preview */}
        {!isSubscribed() && (
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
              <h2 style={{ margin: 0, color: '#343a40', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                💎 Upgrade to Unlock More
              </h2>
              <button
                onClick={handleViewAllPlans}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#6f42c1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                View All Plans →
              </button>
            </div>

            <div style={{ 
              display: 'grid', 
              gap: '1.5rem', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' 
            }}>
              {plans.slice(0, 2).map(plan => (
                <div key={plan.id} style={{
                  padding: '1.5rem',
                  border: '2px solid #dee2e6',
                  borderRadius: '12px',
                  textAlign: 'center',
                  backgroundColor: '#fff',
                  transition: 'transform 0.2s ease, border-color 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = '#007bff';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = '#dee2e6';
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>
                    {plan.name === 'Basic' ? '🥉' : plan.name === 'Pro' ? '🥈' : '🥇'}
                  </div>
                  <h3 style={{ margin: '0 0 0.5rem 0', color: '#343a40' }}>
                    {plan.name}
                  </h3>
                  <p style={{ 
                    fontSize: '2rem', 
                    fontWeight: 'bold', 
                    color: '#007bff',
                    margin: '0 0 1rem 0'
                  }}>
                    {formatPrice(plan.price, plan.billing_period)}
                  </p>
                  <p style={{ 
                    margin: '0 0 1.5rem 0', 
                    color: '#6c757d',
                    minHeight: '3rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {plan.description}
                  </p>

                  <button
                    onClick={handleViewAllPlans}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: plan.name === 'Pro' ? '#28a745' : '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      fontWeight: 'bold'
                    }}
                  >
                    Choose {plan.name}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;