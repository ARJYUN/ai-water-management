import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Workloads from './pages/Workloads';
import Metrics from './pages/Metrics';
import Analytics from './pages/Analytics';
import Optimize from './pages/Optimize';
import Policies from './pages/Policies';
import Alerts from './pages/Alerts';
import Reports from './pages/Reports';
import Admin from './pages/Admin';
import './index.css';

function ProtectedLayout() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1, marginLeft: '240px', padding: '28px 32px', minHeight: '100vh', transition: 'margin-left 0.3s ease' }}>
        <Outlet />
      </main>
    </div>
  );
}

function AdminOnly() {
  const { user } = useAuth();
  if (user?.role !== 'Admin') return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#111827', color: '#f1f5f9', border: '1px solid #1e3a5f', borderRadius: '10px', fontSize: '0.85rem' },
            success: { iconTheme: { primary: '#10b981', secondary: '#111827' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#111827' } },
          }}
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedLayout />}>
            <Route path="/dashboard"  element={<Dashboard />} />
            <Route path="/workloads"  element={<Workloads />} />
            <Route path="/metrics"    element={<Metrics />} />
            <Route path="/analytics"  element={<Analytics />} />
            <Route path="/optimize"   element={<Optimize />} />
            <Route path="/policies"   element={<Policies />} />
            <Route path="/alerts"     element={<Alerts />} />
            <Route path="/reports"    element={<Reports />} />
            <Route element={<AdminOnly />}>
              <Route path="/admin" element={<Admin />} />
            </Route>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
