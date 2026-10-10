'use client';

import React, { useState } from 'react';
import { Search, Bell, Menu, X, User, Home, BarChart3, LogOut, Droplets } from 'lucide-react';
import Image from 'next/image';

interface PulseLeaderNavbarProps {
  onPageChange?: (page: string) => void;
  activePage?: string;
  onLogout?: () => void;
}

const PulseLeaderNavbar: React.FC<PulseLeaderNavbarProps> = ({ 
  onPageChange, 
  activePage = 'home',
  onLogout 
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: <Home className="w-4 h-4" /> },
    { id: 'search', label: 'Search', icon: <Search className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
  ];

  const handleNavClick = (pageId: string) => {
    if (onPageChange) {
      onPageChange(pageId);
    }
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  const handleLogout = () => {
    setIsUserMenuOpen(false);
    setIsMenuOpen(false);
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center" onClick={() => handleNavClick('home')}>
            <div className="flex items-center gap-2 cursor-pointer">
              <Image
                src="/Logo.png"
                alt="Logo Image"
                width={28.37}
                height={41.71}
                className="my-auto"
              />
              <span className="text-xl font-bold text-red-700 hidden sm:inline">BloodLines</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activePage === item.id
                    ? 'bg-[#C91E1E] text-white font-semibold'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>

          {/* User Section */}
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-3 focus:outline-none"
              >
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-semibold text-gray-900">Pulse Leader</span>
                </div>
                <div className="w-9 h-9 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center border-2 border-white shadow">
                  <User className="w-5 h-5 text-red-600" />
                </div>
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
                  <button
                    onClick={() => handleNavClick('profile')}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-colors ${
                  activePage === item.id
                    ? 'bg-red-50 text-red-700 font-semibold'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
            <div className="border-t border-gray-200 pt-2 mt-2">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm text-red-600 hover:bg-red-50 transition"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default PulseLeaderNavbar;