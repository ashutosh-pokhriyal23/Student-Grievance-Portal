import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Dashboard from './pages/Dashboard';
import SpacePage from './pages/SpacePage';
import ComplaintDetail from './pages/ComplaintDetail';
import StaffDashboard from './pages/StaffDashboard';
import StaffSpaceView from './pages/StaffSpaceView';
import AdminDashboard from './pages/AdminDashboard';
import SpaceHeads from './pages/admin/SpaceHeads';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import OTPVerification from './components/auth/OTPVerification';
import { AuthProvider, useAuth } from './context/AuthContext';

function AppContent() {
  const { isLoading } = useAuth();
  const location = useLocation();
  
  // Logic to hide footer on admin pages for cleaner Command Center look
  const hideFooter = location.pathname.startsWith('/admin');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="font-sora font-semibold text-secondary/60 animate-pulse">Initializing Portal...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: '12px',
            background: '#1A1A2E',
            color: '#fff',
          },
        }}
      />

      <Routes>
        {/* Public Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<OTPVerification />} />

        {/* Protected Student Routes */}
        <Route path="/" element={
          <ProtectedRoute allowedRoles={['student', 'admin', 'director']}>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/space/:spaceId" element={
          <ProtectedRoute allowedRoles={['student', 'admin', 'director']}>
            <SpacePage />
          </ProtectedRoute>
        } />
        <Route path="/complaint/:id" element={
          <ProtectedRoute allowedRoles={['student', 'admin', 'director']}>
            <ComplaintDetail />
          </ProtectedRoute>
        } />

        {/* Protected Staff Routes */}
        <Route path="/staff" element={
          <ProtectedRoute allowedRoles={['teacher', 'staff', 'admin', 'director']}>
            <StaffDashboard />
          </ProtectedRoute>
        } />
        <Route path="/staff/space/:id" element={
          <ProtectedRoute allowedRoles={['teacher', 'staff', 'admin', 'director']}>
            <StaffSpaceView />
          </ProtectedRoute>
        } />

        {/* Protected Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin', 'director']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/spaces" element={
          <ProtectedRoute allowedRoles={['admin', 'director']}>
            <SpaceHeads />
          </ProtectedRoute>
        } />

        {/* Fallback to Login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>

      {!hideFooter && (
        <footer className="mt-20 bg-primary/5 py-16 border-t border-gray-100">
          <div className="max-w-7xl auto px-4 text-center mx-auto">
            <h2 className="font-sora font-extrabold text-xl mb-4">Student Grievance Portal</h2>
            <p className="text-secondary font-medium max-w-md mx-auto mb-8">
              Ensuring every voice is heard and every concern is addressed across our campus departments and hostels.
            </p>
            <div className="text-xs text-secondary/60 uppercase tracking-widest font-bold">
              © 2026 • Dedicated to Excellence
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
