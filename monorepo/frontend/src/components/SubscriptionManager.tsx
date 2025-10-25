import React, { useEffect, useState } from 'react';
import { ApiService } from '../services/api.service';
import { useSubscriptionStore } from '../stores/subscriptionStore';
import { Plan, Subscription } from '../types';

interface SubscriptionManagerProps {
  onSubscriptionChange?: (subscription: Subscription | null) => void;
}

const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({ 
  onSubscriptionChange 
}) => {
  const {
    subscription,
    usage,
    currentPlan,
    isLoading,
    error,
    setSubscription,
    setUsage,
    setCurrentPlan,
    setLoading,
    setError,
    isSubscribed,
    isTrialing,
    isCancelled,
    daysUntilExpiry,
    usagePercentage
  } = useSubscriptionStore();

  const [plans, setPlans] = useState<Plan[]>([]);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [subscriptionData, usageData, plansData] = await Promise.all([
        ApiService.getSubscription(),
        ApiService.getUsage().catch(() => null),
        ApiService.getPlans()
      ]);

      setSubscription(subscriptionData);
      setUsage(usageData);
      setPlans(plansData);

      if (subscriptionData?.plan_id) {
        const plan = plansData.find(p => p.id === subscriptionData.plan_id);
        setCurrentPlan(plan || null);
      }

      onSubscriptionChange?.(subscriptionData);
    } catch (error: any) {
      console.error('❌ Failed to load subscription data:', error);
      setError('Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId: number) => {
    setActionLoading(`upgrade-${planId}`);

    try {
      const updatedSubscription = await ApiService.updateSubscription({
        plan_id: planId,
        prorate: true
      });

      setSubscription(updatedSubscription);
      
      const newPlan = plans.find(p => p.id === planId);
      setCurrentPlan(newPlan || null);

      onSubscriptionChange?.(updatedSubscription);
    } catch (error: any) {
      console.error('❌ Failed to upgrade subscription:', error);
      setError('Failed to upgrade subscription');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async () => {
    setActionLoading('cancel');

    try {
      const cancelledSubscription = await ApiService.cancelSubscription({
        cancel_at_period_end: true,
        reason: cancelReason || undefined
      });

      setSubscription(cancelledSubscription);
      setShowCancelModal(false);
      setCancelReason('');

      onSubscriptionChange?.(cancelledSubscription);
    } catch (error: any) {
      console.error('❌ Failed to cancel subscription:', error);
      setError('Failed to cancel subscription');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReactivate = async () => {
    setActionLoading('reactivate');

    try {
      const reactivatedSubscription = await ApiService.reactivateSubscription();

      setSubscription(reactivatedSubscription);
      onSubscriptionChange?.(reactivatedSubscription);
    } catch (error: any) {
      console.error('❌ Failed to reactivate subscription:', error);
      setError('Failed to reactivate subscription');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return { bg: '#d4edda', color: '#155724', text: '🟢 Active' };
      case 'trialing':
        return { bg: '#d1ecf1', color: '#0c5460', text: '🔄 Trial' };
      case 'cancelled':
        return { bg: '#fff3cd', color: '#856404', text: '⏸️ Cancelled' };
      case 'past_due':
        return { bg: '#f8d7da', color: '#721c24', text: '⚠️ Past Due' };
      default:
        return { bg: '#f8f9fa', color: '#6c757d', text: '❓ Unknown' };
    }
  };

  const formatUsageBar = (type: 'projects' | 'storage') => {
    const percentage = usagePercentage(type);
    const color = percentage >= 90 ? '#dc3545' : percentage >= 70 ? '#ffc107' : '#28a745';
    
    return (
      <div style={{ marginTop: '0.5rem' }}>
        <div style={{
          width: '100%',
          height: '8px',
          backgroundColor: '#e9ecef',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${Math.min(percentage, 100)}%`,
            height: '100%',
            backgroundColor: color,
            transition: 'width 0.3s ease'
          }} />
        </div>
        <div style={{ 
          fontSize: '0.75rem', 
          color: '#6c757d', 
          marginTop: '0.25rem' 
        }}>
          {percentage.toFixed(1)}% used
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔄</div>
        <div>Loading subscription...</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
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
            onClick={() => setError(null)}
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

      {/* Current Subscription */}
      {isSubscribed() && subscription && currentPlan && (
        <div style={{ 
          padding: '2rem', 
          backgroundColor: 'white', 
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          border: '1px solid #dee2e6',
          marginBottom: '2rem'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'start',
            marginBottom: '1.5rem'
          }}>
            <div>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#343a40' }}>
                💎 Current Plan: {currentPlan.name}
              </h3>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ 
                  display: 'inline-block',
                  padding: '0.25rem 0.75rem',
                  backgroundColor: getStatusColor(subscription.status).bg,
                  color: getStatusColor(subscription.status).color,
                  borderRadius: '20px',
                  fontSize: '0.875rem',
                  fontWeight: 'bold'
                }}>
                  {getStatusColor(subscription.status).text}
                </span>
                
                {isTrialing() && (
                  <span style={{ fontSize: '0.9rem', color: '#6c757d' }}>
                    Trial ends: {new Date(subscription.current_period_end).toLocaleDateString()}
                  </span>
                )}
                
                {isCancelled() && (
                  <span style={{ fontSize: '0.9rem', color: '#856404' }}>
                    ⚠️ Cancels on: {new Date(subscription.current_period_end).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#007bff' }}>
                ${currentPlan.price}/{currentPlan.billing_period}
              </div>
              {daysUntilExpiry() !== null && (
                <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>
                  {daysUntilExpiry()} days left
                </div>
              )}
            </div>
          </div>

          {/* Usage Information */}
          {usage && (
            <div style={{ 
              padding: '1.5rem',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              marginBottom: '1.5rem'
            }}>
              <h4 style={{ margin: '0 0 1rem 0', color: '#343a40' }}>
                📊 Usage This Period
              </h4>
              
              <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
                <div>
                  <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                    📁 Projects: {usage.projects_used} / {usage.projects_limit}
                  </div>
                  {formatUsageBar('projects')}
                </div>
                
                <div>
                  <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                    💾 Storage: {(usage.storage_used / 1024).toFixed(1)}GB / {(usage.storage_limit / 1024).toFixed(1)}GB
                  </div>
                  {formatUsageBar('storage')}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {isCancelled() ? (
              <button
                onClick={handleReactivate}
                disabled={actionLoading === 'reactivate'}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: actionLoading === 'reactivate' ? '#6c757d' : '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: actionLoading === 'reactivate' ? 'not-allowed' : 'pointer',
                  fontSize: '1rem'
                }}
              >
                {actionLoading === 'reactivate' ? '🔄 Reactivating...' : '🔄 Reactivate Subscription'}
              </button>
            ) : (
              <button
                onClick={() => setShowCancelModal(true)}
                disabled={!!actionLoading}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: actionLoading ? 'not-allowed' : 'pointer',
                  fontSize: '1rem'
                }}
              >
                🚫 Cancel Subscription
              </button>
            )}
          </div>
        </div>
      )}

      {/* Available Plans for Upgrade */}
      {isSubscribed() && (
        <div style={{ 
          padding: '2rem', 
          backgroundColor: 'white', 
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          border: '1px solid #dee2e6'
        }}>
          <h3 style={{ margin: '0 0 1.5rem 0', color: '#343a40' }}>
            🚀 Upgrade Your Plan
          </h3>

          <div style={{ display: 'grid', gap: '1rem' }}>
            {plans
              .filter(plan => plan.id !== currentPlan?.id && plan.price > (currentPlan?.price || 0))
              .map(plan => (
                <div key={plan.id} style={{
                  padding: '1.5rem',
                  border: '1px solid #dee2e6',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#343a40' }}>
                      {plan.name}
                    </h4>
                    <p style={{ margin: '0 0 0.5rem 0', color: '#6c757d' }}>
                      {plan.description}
                    </p>
                    <div style={{ fontWeight: 'bold', color: '#007bff' }}>
                      ${plan.price}/{plan.billing_period}
                    </div>
                  </div>

                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={actionLoading === `upgrade-${plan.id}`}
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: actionLoading === `upgrade-${plan.id}` ? '#6c757d' : '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: actionLoading === `upgrade-${plan.id}` ? 'not-allowed' : 'pointer',
                      fontSize: '1rem',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {actionLoading === `upgrade-${plan.id}` ? '🔄 Upgrading...' : '⬆️ Upgrade'}
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '12px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#343a40' }}>
              🚫 Cancel Subscription
            </h3>
            
            <p style={{ margin: '0 0 1.5rem 0', color: '#6c757d' }}>
              Are you sure you want to cancel your subscription? You'll continue to have access until the end of your current billing period.
            </p>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Reason for cancelling (optional):
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Let us know why you're cancelling..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #dee2e6',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={actionLoading === 'cancel'}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'transparent',
                  color: '#6c757d',
                  border: '1px solid #6c757d',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                Keep Subscription
              </button>
              
              <button
                onClick={handleCancel}
                disabled={actionLoading === 'cancel'}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: actionLoading === 'cancel' ? '#6c757d' : '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: actionLoading === 'cancel' ? 'not-allowed' : 'pointer',
                  fontSize: '1rem'
                }}
              >
                {actionLoading === 'cancel' ? '🔄 Cancelling...' : '🚫 Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionManager;