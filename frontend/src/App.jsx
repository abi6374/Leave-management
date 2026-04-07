import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';

import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/layout/Layout';

import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { ApplyLeave } from './pages/ApplyLeave';
import { MyLeaves } from './pages/MyLeaves';
import { Approvals } from './pages/Approvals';
import { AllLeaves } from './pages/AllLeaves';
import { Calendar } from './pages/Calendar';
import { Balance } from './pages/Balance';
import { Notifications } from './pages/Notifications';
import { Profile } from './pages/Profile';
import { UserManagement } from './pages/admin/UserManagement';

const PrivateShell = ({ children }) => (
  <ProtectedRoute>
    <NotificationProvider>
      <Layout>{children}</Layout>
    </NotificationProvider>
  </ProtectedRoute>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastContainer position="top-right" />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateShell>
                <Dashboard />
              </PrivateShell>
            }
          />

          <Route
            path="/apply"
            element={
              <PrivateShell>
                <ApplyLeave />
              </PrivateShell>
            }
          />

          <Route path="/apply-leave" element={<Navigate to="/apply" />} />

          <Route
            path="/my-leaves"
            element={
              <PrivateShell>
                <MyLeaves />
              </PrivateShell>
            }
          />

          <Route
            path="/approvals"
            element={
              <PrivateShell>
                <Approvals />
              </PrivateShell>
            }
          />

          <Route
            path="/all-leaves"
            element={
              <PrivateShell>
                <AllLeaves />
              </PrivateShell>
            }
          />

          <Route
            path="/calendar"
            element={
              <PrivateShell>
                <Calendar />
              </PrivateShell>
            }
          />

          <Route
            path="/balance"
            element={
              <PrivateShell>
                <Balance />
              </PrivateShell>
            }
          />

          <Route
            path="/notifications"
            element={
              <PrivateShell>
                <Notifications />
              </PrivateShell>
            }
          />

          <Route
            path="/profile"
            element={
              <PrivateShell>
                <Profile />
              </PrivateShell>
            }
          />

          <Route
            path="/admin/users"
            element={
              <PrivateShell>
                <UserManagement />
              </PrivateShell>
            }
          />

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
