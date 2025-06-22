import React, { useState, useEffect } from 'react';
import Homepage from './Homepage';
import App from './App'; // Your existing App.js dashboard

const Main = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing authentication on app load
  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
          setUser(JSON.parse(userData));
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        // Clear invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Handle successful login
  const handleLogin = (userData, token) => {
    setUser(userData);
    setIsAuthenticated(true);
    console.log('User logged in successfully:', userData);
  };

  // Handle logout (you can call this from your App.js)
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  // Show loading while checking authentication
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: '1rem'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '3px solid #f3f3f3',
          borderTop: '3px solid #2563eb',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p>Loading...</p>
      </div>
    );
  }

  // Show Homepage if not authenticated, your App.js if authenticated
  return (
    <>
      {isAuthenticated ? (
        <App user={user} onLogout={handleLogout} />
      ) : (
        <Homepage onLogin={handleLogin} />
      )}
    </>
  );
};

export default Main;