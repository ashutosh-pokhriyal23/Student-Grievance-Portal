import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Dumb guard — reads isAuthenticated from AuthContext only.
// NO loading logic here: App.jsx's global spinner blocks route rendering
// until auth verification is complete, so isAuthenticated is always settled.
export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
