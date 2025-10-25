import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { Navigation, ProtectedRoute } from './components';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Plans from './pages/Plans';
import Profile from './pages/Profile';
import Billing from './pages/Billing';

const App: React.FC = () => {
  const { token, isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    console.log('🚀 App mounted with auth state:', {
      hasToken: !!token,
      isAuthenticated,
      userEmail: user?.email
    });
  }, [token, isAuthenticated, user]);

  return (
    <Router>
      <div style={{ minHeight: '100vh' }}>
        {isAuthenticated && token && <Navigation />}
        
        <Routes>
          {/* Public routes */}
          <Route 
            path="/login" 
            element={
              isAuthenticated && token ? 
                <Navigate to="/dashboard" replace /> : 
                <Login />
            } 
          />
          <Route 
            path="/register" 
            element={
              isAuthenticated && token ? 
                <Navigate to="/dashboard" replace /> : 
                <Register />
            } 
          />
          
          {/* Protected routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/projects" 
            element={
              <ProtectedRoute>
                <Projects />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/plans" 
            element={
              <ProtectedRoute>
                <Plans />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/billing" 
            element={
              <ProtectedRoute>
                <Billing />
              </ProtectedRoute>
            } 
          />
          
          {/* Default redirects */}
          <Route 
            path="/" 
            element={
              <Navigate 
                to={isAuthenticated && token ? "/dashboard" : "/login"} 
                replace 
              />
            } 
          />
          <Route 
            path="*" 
            element={
              <Navigate 
                to={isAuthenticated && token ? "/dashboard" : "/login"} 
                replace 
              />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;