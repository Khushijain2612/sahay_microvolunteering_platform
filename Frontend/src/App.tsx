import { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { HomePage } from './components/HomePage';
import { OpportunitiesPage } from './components/OpportunitiesPage';
import { CelebrationPage } from './components/CelebrationPage';
import { VolunteerDashboard } from './components/VolunteerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { LoginModal } from './components/LoginModal';
import { api, authHelper } from '../lib/api';

// CHANGE: Make Page type match what components expect
type Page = 'home' | 'opportunities' | 'celebration' | 'dashboard' | 'admin';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    if (authHelper.isLoggedIn()) {
      setIsLoggedIn(true);
      fetchUserProfile();
    }
  };

  const fetchUserProfile = async () => {
    try {
      const userData = await api.auth.getProfile();
      setUser(userData as any);
    } catch (error) {
      handleLogout();
    }
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      const result = await api.auth.login(email, password);
      authHelper.saveToken(result.token);
      setIsLoggedIn(true);
      setShowLoginModal(false);
      setUser(result.user);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const handleLogout = () => {
    authHelper.removeToken();
    setIsLoggedIn(false);
    setUser(null);
    setCurrentPage('home');
  };

  const handleBookSlot = async (opportunityId: string) => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }

    try {
      // Using events API since opportunities booking is commented out in backend
      await api.events.create({ opportunityId });
      alert('Successfully booked!');
    } catch (error: any) {
      alert(error.message || 'Booking failed');
    }
  };

  const handleBookCelebration = async (celebrationData: any) => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }

    try {
      await api.events.create(celebrationData);
      alert('Celebration booked successfully!');
    } catch (error: any) {
      alert(error.message || 'Failed to book celebration');
    }
  };

  // FIX: Type-safe navigation handler
  const handleNavigate = (page: string) => {
    if (isValidPage(page)) {
      setCurrentPage(page as Page);
    } else {
      console.warn(`Invalid page: ${page}`);
      setCurrentPage('home');
    }
  };

  // FIX: Helper function to validate page
  const isValidPage = (page: string): page is Page => {
    return ['home', 'opportunities', 'celebration', 'dashboard', 'admin'].includes(page);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'opportunities':
        return <OpportunitiesPage onBookSlot={handleBookSlot} />;
      case 'celebration':
        return <CelebrationPage onBookCelebration={handleBookCelebration} />;
      case 'dashboard':
        return <VolunteerDashboard />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation
        onLoginClick={() => setShowLoginModal(true)}
        onNavigate={handleNavigate}
        currentPage={currentPage}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
      />
      
      {renderCurrentPage()}

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLogin}
      />
    </div>
  );
}