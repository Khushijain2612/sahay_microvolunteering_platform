import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from './ui/button';
import { apiClient } from '../../lib/api';

interface NavigationProps {
  onLoginClick: () => void;
  onNavigate: (page: string) => void;
  currentPage: string;
  isLoggedIn: boolean;
  onLogout: () => void;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  profile_image?: string;
}

export function Navigation({ onLoginClick, onNavigate, currentPage, isLoggedIn, onLogout }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (isLoggedIn) {
      fetchUserProfile();
    }
  }, [isLoggedIn]);

  const fetchUserProfile = async () => {
  try {
    const userData: any = await apiClient.request('/users/me');
    setUser(userData);
  } catch (error) {
    console.error('Failed to fetch user profile');
  }
};

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    onLogout();
  };

  const navItems = [
    { name: 'Home', id: 'home' },
    { name: 'Opportunities', id: 'opportunities' },
    { name: 'Celebrate', id: 'celebration' },
    { name: 'Dashboard', id: 'dashboard' },
  ];

  if (user?.role === 'ngo_admin') {
    navItems.push({ name: 'Admin', id: 'admin' });
  }

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => onNavigate('home')}
          >
            <div className="w-10 h-10 flex items-center justify-center bg-[rgba(42,128,82,0)]">
              <svg 
                viewBox="0 0 100 100" 
                className="w-full h-full"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M50 85 C45 80 15 60 15 35 C15 20 25 10 35 10 C42 10 47 14 50 20 C53 14 58 10 65 10 C75 10 85 20 85 35 C85 60 55 80 50 85 Z"
                  fill="#10B981"
                />
              </svg>
            </div>
            <span className="text-gray-900 flex items-baseline">
              <span style={{ fontSize: '1.5em' }}>S</span>
              <span>ahay</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 cursor-pointer">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`text-gray-700 cursor-pointer hover:text-blue-600 transition-colors ${
                  currentPage === item.id ? 'text-blue-600' : ''
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {isLoggedIn ? (
              <div className="flex items-center gap-4">
                <span className="text-gray-700">Hello, {user?.name || 'User'}</span>
                <Button onClick={handleLogout} variant="outline">
                  Logout
                </Button>
              </div>
            ) : (
              <Button onClick={onLoginClick} className="cursor-pointer bg-white border border-gray-300 text-gray-600">
                Login / Sign Up
              </Button>
            )}
          </div>

          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-4 space-y-3">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`block w-full text-left px-4 py-2 rounded-lg cursor-pointer text-gray-700 hover:bg-gray-100 ${
                  currentPage === item.id ? 'bg-blue-50 text-blue-600' : ''
                }`}
              >
                {item.name}
              </button>
            ))}
            <div className="pt-2 border-t border-gray-200">
              {isLoggedIn ? (
                <div className="space-y-3">
                  <div className="px-4 py-2 text-sm text-gray-600">
                    Hello, {user?.name || 'User'}
                  </div>
                  <Button onClick={handleLogout} variant="outline" className="w-full">
                    Logout
                  </Button>
                </div>
              ) : (
                <Button onClick={onLoginClick} className="w-full ">
                  Login / Sign Up
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}