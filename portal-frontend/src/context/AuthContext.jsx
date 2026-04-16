import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Internal helper — clears state without navigating (navigation is caller's job)
  const _clearAuth = () => {
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const logout = () => {
    _clearAuth();
    navigate('/login', { replace: true });
  };

  const verifyToken = async () => {
    const token = sessionStorage.getItem('authToken');

    if (!token) {
      setIsLoading(false);
      setIsAuthenticated(false);
      return;
    }

    try {
      // Call backend /verify endpoint (which uses authMiddleware)
      const response = await api.get('/auth/verify');

      if (response.data.user) {
        const normalizedUser = {
          ...response.data.user,
          role: String(response.data.user.role || '').toLowerCase()
        };
        setUser(normalizedUser);
        setIsAuthenticated(true);
        // Refresh local storage user data just in case
        sessionStorage.setItem('user', JSON.stringify(normalizedUser));
      } else {
        throw new Error('Invalid user data');
      }
    } catch (error) {
      console.error('[Auth] Verification failed:', error.response?.data || error.message);
      // Temporarily disabled auto-logout to stabilize routing during debugging
      // _clearAuth();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    verifyToken();
  }, []);

  // Listen for mid-session 401 events dispatched by the axios interceptor.
  // This lets AuthContext own ALL navigation to /login rather than the interceptor.
  useEffect(() => {
    const handleForceLogout = () => {
      _clearAuth();
      navigate('/login', { replace: true });
    };
    window.addEventListener('auth:logout', handleForceLogout);
    return () => window.removeEventListener('auth:logout', handleForceLogout);
  }, [navigate]);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login: (userData, token) => {
      // Nuke any stale session data before starting new one
      _clearAuth();
      
      const normalizedUser = {
        ...userData,
        role: String(userData.role || '').toLowerCase()
      };
      
      sessionStorage.setItem('authToken', token);
      sessionStorage.setItem('user', JSON.stringify(normalizedUser));
      setUser(normalizedUser);
      setIsAuthenticated(true);
    },
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
