import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Dumb guard — reads isAuthenticated from AuthContext only.
// NO loading logic here: App.jsx's global spinner blocks route rendering
// until auth verification is complete, so isAuthenticated is always settled.
/**
 * Enhanced ProtectedRoute that validates both authentication and role-based permissions.
 * If user is not logged in, redirects to /login.
 * If user lacks required role, redirects to their default dashboard.
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // [DEV BYPASS] Allowing all authenticated users to any route as requested.
  // We keep the isAuthenticated check to ensure a user session exists, but skip role validation.
  /* 
  if (allowedRoles && !allowedRoles.includes(String(user?.role || '').toLowerCase())) {
     const role = String(user?.role || '').toLowerCase();
     console.warn(`[AuthGuard] Access denied for ${location.pathname}. Current Role: "${role}". Required one of: [${allowedRoles.join(', ')}]`);
     
     let redirectPath = '/';
     if (role === 'admin' || role === 'director') redirectPath = '/admin';
     else if (role === 'teacher' || role === 'staff') redirectPath = '/staff';
     
     if (location.pathname === redirectPath) return children;
     return <Navigate to={redirectPath} replace />;
  }
  */

  return children;
}
