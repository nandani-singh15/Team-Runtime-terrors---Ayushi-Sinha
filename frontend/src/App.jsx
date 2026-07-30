import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';

// Views
import Landing from './views/Landing';
import Auth from './views/Auth';
import Dashboard from './views/Dashboard';
import RouteAI from './views/RouteAI';
import Profile from './views/Profile';
import Contacts from './views/Contacts';
import PublicCard from './views/PublicCard';
import Support from './views/Support';
import Admin from './views/Admin';

import './App.css';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="container py-5 text-muted">Authenticating...</div>;
  }

  if (!user) {
    return <Navigate to="/auth?mode=login" replace />;
  }

  return children;
};

// Admin Route Wrapper
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="container py-5 text-muted">Checking permissions...</div>;
  }

  if (!user || user.role !== 'ROLE_ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App d-flex flex-column min-vh-100">
          <Navbar />
          
          <main className="flex-grow-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/emergency/public-card/:key" element={<PublicCard />} />
              <Route path="/support" element={<Support />} />

              {/* Protected User Routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/route-ai" 
                element={
                  <ProtectedRoute>
                    <RouteAI />
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
                path="/contacts" 
                element={
                  <ProtectedRoute>
                    <Contacts />
                  </ProtectedRoute>
                } 
              />

              {/* Admin Moderation Routes */}
              <Route 
                path="/admin" 
                element={
                  <AdminRoute>
                    <Admin />
                  </AdminRoute>
                } 
              />

              {/* Redirect any other path to landing page */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Premium Footer */}
          <footer className="py-4 mt-auto border-top" style={{ background: 'rgba(7, 9, 19, 0.9)', borderColor: 'rgba(255,255,255,0.05)' }}>
            <div className="container d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
              <span className="text-muted small">© 2026 SwaSuraksha Journey Safety. All rights reserved.</span>
              <div className="d-flex gap-4">
                <Link to="/support" className="text-muted small text-decoration-none text-cyan" style={{ color: '#00f2fe' }}>Support Center</Link>
                <a href="#privacy" className="text-muted small text-decoration-none">Privacy Directive</a>
                <a href="#terms" className="text-muted small text-decoration-none">Terms of Protection</a>
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
