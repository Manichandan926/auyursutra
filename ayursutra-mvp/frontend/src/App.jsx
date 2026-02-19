import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from './utils/store';
import { Header, Footer, Container } from './components/Common';
import { PublicHeader } from './components/layout/PublicHeader';
import { PublicFooter } from './components/layout/PublicFooter';

// Public Pages
import HomePage from './pages/public/HomePage';
import AboutPage from './pages/public/AboutPage';
import ServicesPage from './pages/public/ServicesPage';
import ShopPage from './pages/public/ShopPage';
import ContactPage from './pages/public/ContactPage';

// Auth Pages
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

// Layouts
const PublicLayout = () => (
  <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
    <PublicHeader />
    <main className="flex-1">
      <Outlet />
    </main>
    <PublicFooter />
  </div>
);

const DashboardLayout = ({ user, logout }) => (
  <div className="flex flex-col min-h-screen bg-gray-50">
    <Header user={user} onLogout={logout} />
    <main className="flex-1 py-8">
      <Container>
        <Outlet />
      </Container>
    </main>
    <Footer />
  </div>
);

const AuthLayout = () => (
  <div className="flex flex-col min-h-screen bg-ayur-cream">
    <PublicHeader />
    <main className="flex-1 py-12 flex items-center justify-center">
      <Container>
        <Outlet />
      </Container>
    </main>
    <PublicFooter />
  </div>
);

function App() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Route>

        {/* Auth Routes (Login/Signup) */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/patient-signup" element={<PatientSignupPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/doctor/login" element={<DoctorLoginPage />} />
          <Route path="/practitioner/login" element={<PractitionerLoginPage />} />
        </Route>

        {/* Dashboard Routes (Protected) */}
        <Route element={<DashboardLayout user={user} logout={logout} />}>
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/dashboard"
            element={
              <ProtectedRoute requiredRole="DOCTOR">
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/practitioner/dashboard"
            element={
              <ProtectedRoute requiredRole="PRACTITIONER">
                <PractitionerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/dashboard"
            element={
              <ProtectedRoute requiredRole="PATIENT">
                <PatientDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reception/dashboard"
            element={
              <ProtectedRoute requiredRole="RECEPTION">
                <ReceptionDashboard />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
