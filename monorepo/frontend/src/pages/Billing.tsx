import React, { useEffect, useState } from 'react';
import { ApiService } from '../services/api.service';
import { useSubscriptionStore } from '../stores/subscriptionStore';
import { SubscriptionManager } from '../components';
import { Invoice, PaymentMethod } from '../types';

const Billing: React.FC = () => {
  const { subscription, isSubscribed } = useSubscriptionStore();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    try {
      const [invoicesData, paymentMethodsData] = await Promise.all([
        ApiService.getInvoices().catch(() => []),
        ApiService.getPaymentMethods().catch(() => [])
      ]);

      setInvoices(invoicesData);
      setPaymentMethods(paymentMethodsData);
    } catch (error: any) {
      console.error('❌ Failed to load billing data:', error);
      setError('Failed to load billing data');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async (invoiceId: number) => {
    try {
      const blob = await ApiService.downloadInvoice(invoiceId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoiceId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      console.error('❌ Failed to download invoice:', error);
      alert('Failed to download invoice');
    }
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
          <div>Loading billing information...</div>
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
          gap: '0.5rem'
        }}>
          💰 Billing & Subscription
        </h1>
        <p style={{ color: '#6c757d', margin: 0 }}>
          Manage your subscription, view invoices, and update payment methods
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
        {/* Subscription Management */}
        <SubscriptionManager 
          onSubscriptionChange={() => loadBillingData()} 
        />

        {/* Payment Methods */}
        <div style={{ 
          padding: '2rem', 
          backgroundColor: 'white', 
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          border: '1px solid #dee2e6'
        }}>
          <h2 style={{ margin: '0 0 1.5rem 0', color: '#343a40' }}>
            💳 Payment Methods
          </h2>

          {paymentMethods.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '3rem 1rem',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              border: '2px dashed #dee2e6'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💳</div>
              <h3 style={{ margin: '0 0 1rem 0', color: '#495057' }}>
                No payment methods
              </h3>
              <p style={{ margin: 0, color: '#6c757d' }}>
                Add a payment method to manage your subscription
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {paymentMethods.map(method => (
                <div key={method.id} style={{
                  padding: '1.5rem',
                  border: '1px solid #dee2e6',
                  borderRadius: '8px',
                  backgroundColor: method.is_default ? '#e7f1ff' : '#f8f9fa',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ fontSize: '1.5rem' }}>
                      {method.type === 'card' ? '💳' : '🏦'}
                    </div>
                    <div>
                      {method.card && (
                        <div>
                          <div style={{ fontWeight: 'bold' }}>
                            {method.card.brand.toUpperCase()} •••• {method.card.last4}
                          </div>
                          <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>
                            Expires {method.card.exp_month}/{method.card.exp_year}
                          </div>
                        </div>
                      )}
                    </div>
                    {method.is_default && (
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        backgroundColor: '#007bff',
                        color: 'white',
                        borderRadius: '20px',
                        fontSize: '0.875rem',
                        fontWeight: 'bold'
                      }}>
                        Default
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {!method.is_default && (
                      <button
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: '#6c757d',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.9rem'
                        }}
                      >
                        Set Default
                      </button>
                    )}
                    <button
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.9rem'
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Invoice History */}
        <div style={{ 
          padding: '2rem', 
          backgroundColor: 'white', 
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          border: '1px solid #dee2e6'
        }}>
          <h2 style={{ margin: '0 0 1.5rem 0', color: '#343a40' }}>
            📄 Invoice History
          </h2>

          {invoices.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '3rem 1rem',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              border: '2px dashed #dee2e6'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
              <h3 style={{ margin: '0 0 1rem 0', color: '#495057' }}>
                No invoices yet
              </h3>
              <p style={{ margin: 0, color: '#6c757d' }}>
                Your invoices will appear here once you have a subscription
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {invoices.map(invoice => {
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
                      
                      <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div>
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

                        {invoice.status === 'paid' && (
                          <button
                            onClick={() => handleDownloadInvoice(invoice.id)}
                            style={{
                              padding: '0.5rem 1rem',
                              backgroundColor: '#007bff',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.9rem',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            📥 Download
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Billing;