import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';

import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Sidebar } from './components/Sidebar';

import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { ApplyLeave } from './pages/ApplyLeave';
import { MyLeaves } from './pages/MyLeaves';
import { Approvals } from './pages/Approvals';
import { AllLeaves } from './pages/AllLeaves';

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
              <ProtectedRoute>
                <Sidebar>
                  <Dashboard />
                </Sidebar>
              </ProtectedRoute>
            }
          />

          <Route
            path="/apply-leave"
            element={
              <ProtectedRoute>
                <Sidebar>
                  <ApplyLeave />
                </Sidebar>
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-leaves"
            element={
              <ProtectedRoute>
                <Sidebar>
                  <MyLeaves />
                </Sidebar>
              </ProtectedRoute>
            }
          />

          <Route
            path="/approvals"
            element={
              <ProtectedRoute>
                <Sidebar>
                  <Approvals />
                </Sidebar>
              </ProtectedRoute>
            }
          />

          <Route
            path="/all-leaves"
            element={
              <ProtectedRoute>
                <Sidebar>
                  <AllLeaves />
                </Sidebar>
              </ProtectedRoute>
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
