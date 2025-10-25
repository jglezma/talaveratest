import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiService } from '../services/api.service';
import { Plan } from '../types';

const Plans: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [subscribingTo, setSubscribingTo] = useState<number | null>(null);
  const navigate = useNavigate();
  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      console.log('🔄 Fetching plans...');
      const data = await ApiService.getPlans();
      console.log('✅ Plans loaded:', data);
      setPlans(data);
    } catch (error: any) {
      console.error('❌ Failed to fetch plans:', error);
      setError('Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: number) => {
    setSubscribingTo(planId);
    
    try {
      console.log('🔄 Subscribing to plan:', planId);
      const result = await ApiService.subscribe({ plan_id: planId });
      console.log('✅ Subscription created:', result);
      navigate('/billing');
    } catch (error: any) {
      console.error('❌ Failed to subscribe:', error);
      alert('Failed to subscribe. Please try again.');
    } finally {
      setSubscribingTo(null);
    }
  };

  const formatPrice = (price: number | string, period: string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numPrice)) {
      return `$0.00/${period}`;
    }
    return `$${numPrice.toFixed(2)}/${period}`;
  };

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'basic':
        return '🥉';
      case 'pro':
        return '🥈';
      case 'enterprise':
        return '🥇';
      default:
        return '💎';
    }
  };

  const getPlanColor = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'basic':
        return { 
          border: '#28a745', 
          button: '#28a745',
          highlight: '#d4edda'
        };
      case 'pro':
        return { 
          border: '#007bff', 
          button: '#007bff',
          highlight: '#e7f1ff'
        };
      case 'enterprise':
        return { 
          border: '#6f42c1', 
          button: '#6f42c1',
          highlight: '#f3e8ff'
        };
      default:
        return { 
          border: '#6c757d', 
          button: '#6c757d',
          highlight: '#f8f9fa'
        };
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
          <div>Loading subscription plans...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ 
          fontSize: '3rem', 
          margin: '0 0 1rem 0', 
          color: '#343a40',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem'
        }}>
          💎 Subscription Plans
        </h1>
        <p style={{ 
          color: '#6c757d', 
          fontSize: '1.2rem', 
          margin: '0 0 1rem 0',
          maxWidth: '600px',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
          Choose the perfect plan for your needs. Upgrade or downgrade at any time.
        </p>
        <div style={{
          display: 'inline-block',
          padding: '0.5rem 1rem',
          backgroundColor: '#d4edda',
          color: '#155724',
          borderRadius: '20px',
          fontSize: '0.9rem',
          fontWeight: 'bold'
        }}>
          ✨ 30-day money-back guarantee on all plans
        </div>
      </div>

      {error && (
        <div style={{ 
          padding: '1rem', 
          marginBottom: '2rem',
          backgroundColor: '#f8d7da', 
          color: '#721c24',
          borderRadius: '8px',
          border: '1px solid #f5c6cb',
          textAlign: 'center'
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

      {/* Plans Grid */}
      {plans.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '4rem 2rem',
          backgroundColor: 'white',
          borderRadius: '12px',
          border: '2px dashed #dee2e6'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>💎</div>
          <h3 style={{ margin: '0 0 1rem 0', color: '#495057' }}>
            No plans available
          </h3>
          <p style={{ margin: 0, color: '#6c757d' }}>
            Please check back later for available subscription plans.
          </p>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gap: '2rem', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          alignItems: 'stretch'
        }}>
          {plans.map(plan => {
            const colors = getPlanColor(plan.name);
            const isPopular = plan.name.toLowerCase() === 'pro';
            
            return (
              <div key={plan.id} style={{
                padding: '2.5rem 2rem',
                border: `3px solid ${colors.border}`,
                borderRadius: '16px',
                textAlign: 'center',
                backgroundColor: '#fff',
                position: 'relative',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                boxShadow: isPopular ? '0 8px 25px rgba(0,123,255,0.15)' : '0 4px 6px rgba(0,0,0,0.1)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = isPopular ? 
                  '0 12px 35px rgba(0,123,255,0.25)' : 
                  '0 8px 25px rgba(0,0,0,0.15)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = isPopular ? 
                  '0 8px 25px rgba(0,123,255,0.15)' : 
                  '0 4px 6px rgba(0,0,0,0.1)';
              }}>
                {/* Popular Badge */}
                {isPopular && (
                  <div style={{
                    position: 'absolute',
                    top: '-15px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: '#ff6b6b',
                    color: 'white',
                    padding: '0.5rem 1.5rem',
                    borderRadius: '20px',
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 8px rgba(255,107,107,0.3)'
                  }}>
                    🔥 Most Popular
                  </div>
                )}

                {/* Plan Icon */}
                <div style={{ 
                  fontSize: '4rem', 
                  marginBottom: '1rem',
                  background: colors.highlight,
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem auto',
                  border: `2px solid ${colors.border}`
                }}>
                  {getPlanIcon(plan.name)}
                </div>

                {/* Plan Name */}
                <h3 style={{ 
                  margin: '0 0 1rem 0', 
                  color: '#343a40',
                  fontSize: '2rem',
                  fontWeight: 'bold'
                }}>
                  {plan.name}
                </h3>

                {/* Price */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ 
                    fontSize: '3rem', 
                    fontWeight: 'bold', 
                    color: colors.border,
                    margin: '0',
                    lineHeight: '1'
                  }}>
                    ${plan.price}
                  </div>
                  <div style={{ 
                    color: '#6c757d',
                    fontSize: '1.1rem',
                    marginTop: '0.5rem'
                  }}>
                    per {plan.billing_period}
                  </div>
                </div>

                {/* Description */}
                <p style={{ 
                  margin: '0 0 2rem 0', 
                  color: '#6c757d',
                  fontSize: '1rem',
                  lineHeight: '1.5',
                  minHeight: '3rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {plan.description}
                </p>
                
                {/* Features */}
                {plan.features && plan.features.length > 0 && (
                  <div style={{ 
                    textAlign: 'left', 
                    marginBottom: '2rem',
                    padding: '1.5rem',
                    backgroundColor: colors.highlight,
                    borderRadius: '12px',
                    border: `1px solid ${colors.border}20`
                  }}>
                    <div style={{ 
                      fontWeight: 'bold', 
                      marginBottom: '1rem', 
                      textAlign: 'center',
                      color: '#343a40',
                      fontSize: '1.1rem'
                    }}>
                      ✨ What's included:
                    </div>
                    {plan.features.map((feature, index) => (
                      <div key={index} style={{ 
                        margin: '0.75rem 0', 
                        fontSize: '1rem',
                        color: '#495057',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem'
                      }}>
                        <span style={{ 
                          color: colors.border, 
                          fontWeight: 'bold',
                          fontSize: '1.2rem'
                        }}>
                          ✓
                        </span>
                        {feature}
                      </div>
                    ))}
                  </div>
                )}

                {/* Subscribe Button */}
                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={subscribingTo === plan.id}
                  style={{
                    width: '100%',
                    padding: '1rem 1.5rem',
                    backgroundColor: subscribingTo === plan.id ? '#6c757d' : colors.button,
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: subscribingTo === plan.id ? 'not-allowed' : 'pointer',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    transition: 'all 0.2s ease',
                    boxShadow: `0 4px 12px ${colors.button}30`
                  }}
                  onMouseOver={(e) => {
                    if (subscribingTo !== plan.id) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = `0 6px 16px ${colors.button}40`;
                    }
                  }}
                  onMouseOut={(e) => {
                    if (subscribingTo !== plan.id) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = `0 4px 12px ${colors.button}30`;
                    }
                  }}
                >
                  {subscribingTo === plan.id ? 
                    '🔄 Processing...' : 
                    `🚀 Choose ${plan.name}`
                  }
                </button>

                {/* Additional Info */}
                <div style={{
                  marginTop: '1rem',
                  fontSize: '0.9rem',
                  color: '#6c757d'
                }}>
                  {plan.is_active ? (
                    <span style={{ color: '#28a745' }}>✅ Currently Available</span>
                  ) : (
                    <span style={{ color: '#dc3545' }}>❌ Currently Unavailable</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer Info */}
      <div style={{
        marginTop: '4rem',
        textAlign: 'center',
        padding: '2rem',
        backgroundColor: '#f8f9fa',
        borderRadius: '12px',
        border: '1px solid #dee2e6'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', color: '#343a40' }}>
          🤔 Need help choosing?
        </h3>
        <p style={{ margin: '0 0 1.5rem 0', color: '#6c757d' }}>
          Not sure which plan is right for you? Start with Basic and upgrade as you grow.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: '#28a745' }}>✓</span>
            <span>Cancel anytime</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: '#28a745' }}>✓</span>
            <span>30-day money back</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: '#28a745' }}>✓</span>
            <span>Upgrade/downgrade anytime</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Plans;