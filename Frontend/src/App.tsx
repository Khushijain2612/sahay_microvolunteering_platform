import { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { HomePage } from './components/HomePage';
import { OpportunitiesPage } from './components/OpportunitiesPage';
import { CelebrationPage } from './components/CelebrationPage';
import { VolunteerDashboard } from './components/VolunteerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { LoginModal } from './components/LoginModal';
import { apiClient } from '../lib/api';

// CHANGE: Make Page type match what components expect
type Page = 'home' | 'opportunities' | 'celebration' | 'dashboard' | 'admin';
// type User = {
//   id: number;
//   name: string;
//   email: string;
//   role: string;
// };

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      fetchUserProfile();
    }
  };

const fetchUserProfile = async () => {
  try {
    const userData = await apiClient.request('/users/me');
    setUser(userData as any); // or userData as User if you define the type
  } catch (error) {
    handleLogout();
  }
};

  const handleLogin = (email: string, role: string) => {
    setIsLoggedIn(true);
    setShowLoginModal(false);
    fetchUserProfile();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
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
      await apiClient.createBooking(opportunityId);
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
      await apiClient.request('/celebrations', {
        method: 'POST',
        body: JSON.stringify(celebrationData),
      });
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