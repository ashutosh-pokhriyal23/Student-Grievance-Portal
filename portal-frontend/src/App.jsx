import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Dashboard from './pages/Dashboard';
import SpacePage from './pages/SpacePage';
import ComplaintDetail from './pages/ComplaintDetail';
import StaffDashboard from './pages/StaffDashboard';
import StaffSpaceView from './pages/StaffSpaceView';
import AdminDashboard from './pages/AdminDashboard';
import SpaceHeads from './pages/admin/SpaceHeads';

function AppContent() {
  const location = useLocation();
  const hideFooter = location.pathname.startsWith('/admin');

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
        <Route path="/" element={<Dashboard />} />
        <Route path="/space/:spaceId" element={<SpacePage />} />
        <Route path="/complaint/:id" element={<ComplaintDetail />} />
        <Route path="/staff" element={<StaffDashboard />} />
        <Route path="/staff/space/:id" element={<StaffSpaceView />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/spaces" element={<SpaceHeads />} />
      </Routes>

      {!hideFooter ? (
        <footer className="mt-20 bg-primary/5 py-16 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="font-sora font-extrabold text-xl mb-4">Student Grievance Portal</h2>
            <p className="text-secondary font-medium max-w-md mx-auto mb-8">
              Ensuring every voice is heard and every concern is addressed across our campus departments and hostels.
            </p>
            <div className="text-xs text-secondary/60 uppercase tracking-widest font-bold">
              © 2026 • Dedicated to Excellence
            </div>
          </div>
        </footer>
      ) : null}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
