import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './utils/store';
import { Header, Footer, Container } from './components/Common';

// Pages
import {
  LoginPage,
  PatientSignupPage,
  AdminLoginPage,
  DoctorLoginPage,
  PractitionerLoginPage
} from './pages/AuthPages';

// Dashboards
import AdminDashboard from './dashboards/AdminDashboard';
import DoctorDashboard from './dashboards/DoctorDashboard';
import PractitionerDashboard from './dashboards/PractitionerDashboard';
import PatientDashboard from './dashboards/PatientDashboard';
import ReceptionDashboard from './dashboards/ReceptionDashboard';

// Route wrapper
const ProtectedRoute = ({ children, requiredRole }) => {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/login" />;
  }

  return children;
};

function App() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-gray-50">
        {user && <Header user={user} onLogout={logout} />}

        <main className="flex-1 py-8">
          <Container>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/patient-signup" element={<PatientSignupPage />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/doctor/login" element={<DoctorLoginPage />} />
              <Route path="/practitioner/login" element={<PractitionerLoginPage />} />

              {/* Admin routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Doctor routes */}
              <Route
                path="/doctor/dashboard"
                element={
                  <ProtectedRoute requiredRole="DOCTOR">
                    <DoctorDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Practitioner routes */}
              <Route
                path="/practitioner/dashboard"
                element={
                  <ProtectedRoute requiredRole="PRACTITIONER">
                    <PractitionerDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Patient routes */}
              <Route
                path="/patient/dashboard"
                element={
                  <ProtectedRoute requiredRole="PATIENT">
                    <PatientDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Reception routes */}
              <Route
                path="/reception/dashboard"
                element={
                  <ProtectedRoute requiredRole="RECEPTION">
                    <ReceptionDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="/" element={<Navigate to="/login" />} />
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          </Container>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
