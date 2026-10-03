import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { OpeningAnimation } from './components/intro/OpeningAnimation';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HeroSection } from './components/public/HeroSection';
import { AboutSection } from './components/public/AboutSection';
import { VolunteerRoleSection } from './components/public/VolunteerRoleSection';
import { EventPreferencesSection } from './components/public/EventPreferencesSection';
import { HowItWorksSection } from './components/public/HowItWorksSection';
import { FAQSection } from './components/public/FAQSection';
import { ContactSection } from './components/public/ContactSection';
import { RegistrationModal } from './components/public/RegistrationModal';
import { StatusCheckModal } from './components/public/StatusCheckModal';
import { AdminLoginPage } from './components/admin/AdminLoginPage';
import { AdminChangePasswordPage } from './components/admin/AdminChangePasswordPage';
import { AdminLayout } from './components/admin/AdminLayout';
import { VolunteerCardPage } from './components/public/VolunteerCardPage';
import { VerifyVolunteerPage } from './components/public/VerifyVolunteerPage';
import { adminAuthService } from './services/adminAuthService';
import { AdminTab } from './types';

const MainContent: React.FC = () => {
  const { setIsAdminLoggedIn } = useApp();
  
  // Opening animation control (only for public home page on initial load)
  const [showIntro, setShowIntro] = useState<boolean>(() => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    const full = path + hash;
    // Do not show intro when accessing admin or specific utility routes
    return !(
      full.includes('admin') ||
      full.includes('volunteer-card') ||
      full.includes('verify')
    );
  });

  // Dedicated Route Types
  type AppRoute = 
    | 'home' 
    | 'volunteer-card' 
    | 'verify' 
    | 'admin-login' 
    | 'admin-change-password' 
    | 'admin-dashboard';

  const [activeRoute, setActiveRoute] = useState<AppRoute>('home');
  const [routeParam, setRouteParam] = useState<string>('');
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');

  const checkAndApplyRoute = () => {
    const rawPath = window.location.pathname.toLowerCase();
    const rawHash = window.location.hash.toLowerCase();
    const full = (rawPath + rawHash).replace(/#\/?/, '/');

    // 1. Volunteer Card Route
    if (full.includes('/volunteer-card')) {
      const parts = full.split('/volunteer-card')[1]?.replace(/^\//, '') || '';
      setActiveRoute('volunteer-card');
      setRouteParam(parts);
      setShowIntro(false);
      return;
    }

    // 2. Verification Route
    if (full.includes('/verify')) {
      setActiveRoute('verify');
      setRouteParam(full);
      setShowIntro(false);
      return;
    }

    // 3. Admin Routes
    if (full.includes('/admin')) {
      setShowIntro(false);
      const session = adminAuthService.getSession();

      // /admin/login
      if (full.includes('/admin/login')) {
        if (session) {
          if (session.must_change_password) {
            window.history.replaceState(null, '', '/admin/change-password');
            setActiveRoute('admin-change-password');
          } else {
            window.history.replaceState(null, '', '/admin/dashboard');
            setActiveRoute('admin-dashboard');
            setAdminTab('dashboard');
          }
        } else {
          setActiveRoute('admin-login');
        }
        return;
      }

      // /admin/change-password
      if (full.includes('/admin/change-password')) {
        if (!session) {
          window.history.replaceState(null, '', '/admin/login');
          setActiveRoute('admin-login');
        } else {
          setActiveRoute('admin-change-password');
        }
        return;
      }

      // Protected Admin Subroutes (/admin, /admin/dashboard, /admin/applications, etc.)
      if (!session) {
        // Unauthenticated access -> immediately redirect to /admin/login
        window.history.replaceState(null, '', '/admin/login');
        setActiveRoute('admin-login');
        setIsAdminLoggedIn(false);
        return;
      }

      // Authenticated but must change initial password
      if (session.must_change_password) {
        window.history.replaceState(null, '', '/admin/change-password');
        setActiveRoute('admin-change-password');
        return;
      }

      // Valid session -> determine requested tab
      setIsAdminLoggedIn(true);
      setActiveRoute('admin-dashboard');

      let requestedTab: AdminTab = 'dashboard';
      if (full.includes('/applications')) requestedTab = 'applications';
      else if (full.includes('/volunteers')) requestedTab = 'volunteers';
      else if (full.includes('/events')) requestedTab = 'events';
      else if (full.includes('/assignments')) requestedTab = 'assignments';
      else if (full.includes('/contacts')) requestedTab = 'contacts';
      else if (full.includes('/faqs')) requestedTab = 'faqs';
      else if (full.includes('/qr-checkin') || full.includes('/check-in')) requestedTab = 'qr-checkin';
      else if (full.includes('/exports')) requestedTab = 'exports';
      else if (full.includes('/settings')) requestedTab = 'settings';

      setAdminTab(requestedTab);
      return;
    }

    // Default: Public Home
    setActiveRoute('home');
  };

  useEffect(() => {
    checkAndApplyRoute();

    const onPop = () => checkAndApplyRoute();
    window.addEventListener('popstate', onPop);
    window.addEventListener('hashchange', onPop);

    return () => {
      window.removeEventListener('popstate', onPop);
      window.removeEventListener('hashchange', onPop);
    };
  }, []);

  // If opening animation is active
  if (showIntro) {
    return <OpeningAnimation onComplete={() => setShowIntro(false)} />;
  }

  // Dedicated /verify route
  if (activeRoute === 'verify') {
    return (
      <VerifyVolunteerPage 
        tokenQuery={routeParam} 
        onBackToHome={() => {
          window.history.pushState(null, '', '/');
          checkAndApplyRoute();
        }} 
      />
    );
  }

  // Dedicated /volunteer-card route
  if (activeRoute === 'volunteer-card') {
    return (
      <VolunteerCardPage 
        initialVolunteerId={routeParam} 
        onBackToHome={() => {
          window.history.pushState(null, '', '/');
          checkAndApplyRoute();
        }} 
      />
    );
  }

  // Dedicated /admin/login route
  if (activeRoute === 'admin-login') {
    return (
      <AdminLoginPage 
        onSuccess={(mustChange) => {
          setIsAdminLoggedIn(true);
          if (mustChange) {
            window.history.pushState(null, '', '/admin/change-password');
          } else {
            window.history.pushState(null, '', '/admin/dashboard');
          }
          checkAndApplyRoute();
        }}
      />
    );
  }

  // Dedicated /admin/change-password route
  if (activeRoute === 'admin-change-password') {
    return (
      <AdminChangePasswordPage 
        onSuccess={() => {
          window.history.pushState(null, '', '/admin/dashboard');
          checkAndApplyRoute();
        }}
      />
    );
  }

  // Protected /admin/* routes
  if (activeRoute === 'admin-dashboard') {
    return (
      <AdminLayout 
        initialTab={adminTab}
        onExitAdmin={() => {
          window.history.pushState(null, '', '/');
          checkAndApplyRoute();
        }} 
      />
    );
  }

  // Public Event Website
  return (
    <div className="min-h-screen bg-black text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-black">
      
      {/* Navigation without any public admin buttons */}
      <Navbar onReplayIntro={() => setShowIntro(true)} />

      {/* Main Public Flow */}
      <main className="flex-1">
        <HeroSection />
        <AboutSection />
        <VolunteerRoleSection />
        <EventPreferencesSection />
        <HowItWorksSection />
        <FAQSection />
        <ContactSection />
      </main>

      {/* Footer without any public admin buttons */}
      <Footer />

      {/* Modals & Dialogs */}
      <RegistrationModal />
      <StatusCheckModal />

    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
