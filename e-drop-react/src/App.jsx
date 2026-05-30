import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import FAQ from './pages/FAQ';
import ECab from './pages/ECab';
import ECargo from './pages/ECargo';
import EShipping from './pages/EShipping';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsConditions from './pages/TermsConditions';
import AuthModal from './components/AuthModal';
import AIChatbot from './components/AIChatbot';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  const openAuth = (mode) => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  useEffect(() => {
    if (location.hash) {
      const hash = location.hash.substring(1);

      const scrollToElement = () => {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          return true;
        }
        return false;
      };

      if (!scrollToElement()) {
        let attempts = 0;
        const interval = setInterval(() => {
          attempts++;
          if (scrollToElement() || attempts > 20) {
            clearInterval(interval);
          }
        }, 100);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, location.hash]);

  return (
    <>
      {/* Universal Chatbot - Hidden on Admin */}
      {!isAdminRoute && <AIChatbot />}

      <div className={isAdminRoute ? "admin-only-layout" : "app-container"}>
        {/* Main Website Header - Hidden on Admin */}
        {!isAdminRoute && <Header onAuthClick={openAuth} />}

        <main className={isAdminRoute ? "admin-main-wrapper" : "main-content"}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home onAuthClick={openAuth} />} />
            <Route path="/about" element={<About onAuthClick={openAuth} />} />
            <Route path="/faq" element={<FAQ onAuthClick={openAuth} />} />
            <Route path="/ecab" element={<ECab onAuthClick={openAuth} />} />
            <Route path="/ecargo" element={<ECargo onAuthClick={openAuth} />} />
            <Route path="/eshipping" element={<EShipping onAuthClick={openAuth} />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-conditions" element={<TermsConditions />} />

            {/* Admin Route - Handled independently */}
            <Route path="/admin" element={<AdminDashboard />} />

            {/* Catch-all for Public */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Main Website Footer - Hidden on Admin */}
        {!isAdminRoute && <Footer />}
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
      />
    </>
  );
}

export default App;
