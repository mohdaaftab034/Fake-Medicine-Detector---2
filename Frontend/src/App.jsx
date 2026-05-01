import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/common/Navbar.jsx';
import Footer from './components/common/Footer.jsx';
import ProtectedRoute from './components/common/ProtectedRoute.jsx';
import { AppProvider } from './context/AppContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';

// Pages
import Home from './pages/Home.jsx';
import Scanner from './pages/Scanner.jsx';
import BatchVerify from './pages/BatchVerify.jsx';
import ReportFake from './pages/ReportFake.jsx';
import MedicineInfo from './pages/MedicineInfo.jsx';
import NearbyChemist from './pages/NearbyChemist.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Alerts from './pages/Alerts.jsx';
import NotFound from './pages/NotFound.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import UserDashboard from './pages/dashboard/UserDashboard.jsx';
import ScanHistory from './pages/dashboard/ScanHistory.jsx';
import ChemistDashboard from './pages/dashboard/ChemistDashboard.jsx';
import AdminDashboard from './pages/dashboard/AdminDashboard.jsx';
import AccessDenied from './pages/AccessDenied.jsx';

// Routes
import { ROUTES } from './utils/constants.js';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Temporarily disable smooth scrolling
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo(0, 0);
    
    // Restore smooth scrolling for intra-page links
    const timeoutId = setTimeout(() => {
      document.documentElement.style.scrollBehavior = '';
    }, 10);

    return () => clearTimeout(timeoutId);
  }, [pathname]);

  return null;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppProvider>
          <div className="flex flex-col min-h-screen bg-bg-primary">
            <Navbar />
            <ScrollToTop />
            
            <main className="flex-grow">
              <Routes>
                {/* Public Routes */}
                <Route path={ROUTES.HOME} element={<Home />} />
                <Route path={ROUTES.SCANNER} element={<Scanner />} />
                <Route path={ROUTES.BATCH_VERIFY} element={<BatchVerify />} />
                <Route path={ROUTES.REPORT_FAKE} element={<ReportFake />} />
                <Route path={ROUTES.MEDICINE_INFO} element={<MedicineInfo />} />
                <Route path={ROUTES.NEARBY_CHEMIST} element={<NearbyChemist />} />
                <Route path={ROUTES.ALERTS} element={<Alerts />} />
                
                {/* Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Role-Based Protected Routes */}
                <Route
                  path="/dashboard/user"
                  element={
                    <ProtectedRoute requiredRole="public">
                      <UserDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard/user/history"
                  element={
                    <ProtectedRoute requiredRole="public">
                      <ScanHistory />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard/chemist"
                  element={
                    <ProtectedRoute requiredRole="chemist">
                      <ChemistDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard/admin"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback Route */}
                <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
                <Route path="/access-denied" element={<AccessDenied />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>

            <Footer />

            {/* Toast Notifications */}
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: '#111827',
                  color: '#F8F9FA',
                  border: '1px solid #1F2937',
                },
                success: {
                  iconTheme: {
                    primary: '#06D6A0',
                    secondary: '#111827',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#EF233C',
                    secondary: '#111827',
                  },
                },
              }}
            />
          </div>
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
