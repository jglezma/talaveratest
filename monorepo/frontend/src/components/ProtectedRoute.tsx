import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { token, isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('🔒 ProtectedRoute check:', {
      hasToken: !!token,
      isAuthenticated,
      userEmail: user?.email,
      tokenPreview: token ? token.substring(0, 20) + '...' : null
    });

    if (!token || !isAuthenticated) {
      console.log('❌ No auth found, redirecting to login');
      navigate('/login', { replace: true });
      return;
    }

    console.log('✅ Auth found, allowing access');
  }, [token, isAuthenticated, user, navigate]);

  if (!token || !isAuthenticated) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>🔄 Checking authentication...</div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;