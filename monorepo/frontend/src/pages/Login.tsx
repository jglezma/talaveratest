import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ApiService } from '../services/api.service';
import { useAuthStore } from '../stores/authStore';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    console.log('🔄 Attempting login with:', { email, password: '***' });

    try {
      const response = await ApiService.signin({ email, password });
      console.log('✅ Login API response (processed):', response);
      
      // Verificar que la respuesta procesada tenga la estructura correcta
      if (!response.user || !response.token) {
        console.error('❌ Invalid response structure:', response);
        throw new Error('Invalid response structure from API');
      }
      
      console.log('🔐 Setting auth with:', {
        user: response.user,
        token: response.token.substring(0, 20) + '...'
      });
      
      setAuth(response.user, response.token);
      setSuccess('Login successful! Redirecting to dashboard...');
      
      // Dar tiempo para que se actualice el estado
      setTimeout(() => {
        console.log('🚀 Navigating to dashboard...');
        navigate('/dashboard', { replace: true });
      }, 1500);
      
    } catch (err: any) {
      console.error('❌ Login error:', err);
      console.error('❌ Error response:', err.response?.data);
      console.error('❌ Error status:', err.response?.status);
      
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.message || 
                          err.message || 
                          'Login failed - Please check your credentials';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f8f9fa'
    }}>
      <div style={{ 
        width: '100%', 
        maxWidth: '400px', 
        padding: '2rem',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#343a40' }}>
          🔐 Login to TalaveraTest
        </h2>
        
        {error && (
          <div style={{ 
            padding: '0.75rem', 
            marginBottom: '1rem',
            backgroundColor: '#f8d7da', 
            color: '#721c24',
            borderRadius: '4px',
            border: '1px solid #f5c6cb'
          }}>
            ❌ {error}
          </div>
        )}

        {success && (
          <div style={{ 
            padding: '0.75rem', 
            marginBottom: '1rem',
            backgroundColor: '#d4edda', 
            color: '#155724',
            borderRadius: '4px',
            border: '1px solid #c3e6cb'
          }}>
            ✅ {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Email:
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Password:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: loading ? '#6c757d' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            {loading ? '🔄 Logging in...' : '🚀 Login'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #dee2e6' }}>
          <p style={{ margin: '0 0 0.5rem 0', color: '#6c757d' }}>
            Don't have an account?
          </p>
          <Link 
            to="/register" 
            style={{ 
              color: '#007bff', 
              textDecoration: 'none',
              fontWeight: 'bold'
            }}
          >
            Register here
          </Link>
        </div>

        {/* Debug info en development */}
        {import.meta.env.DEV && (
          <div style={{ 
            marginTop: '1rem', 
            padding: '0.5rem', 
            backgroundColor: '#f8f9fa', 
            fontSize: '0.75rem',
            borderRadius: '4px'
          }}>
            <strong>Debug Info:</strong><br />
            API URL: {import.meta.env.VITE_API_URL || 'http://localhost:3001'}<br />
            Environment: {import.meta.env.MODE}
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;