"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Bell,
  Menu,
  X,
  User,
  Home,
  BookOpen,
  Settings,
  LogOut,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface DonorNavbarProps {
  onPageChange?: (page: string) => void;
  activePage?: string;
}

// Mock user data

const USER = {
  name: "Abdul Matthew",
  email: "Abdul.Matthew@gmail.com",
  role: "Donor",
  initials: "AM",
};

const DonorNavbar: React.FC<DonorNavbarProps> = ({
  onPageChange,
  activePage = "home",
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const navItems = [
    { id: "home", label: "Home", icon: <Home className="w-4 h-4" /> },
    {
      id: "resources",
      label: "Resources",
      icon: <BookOpen className="w-4 h-4" />,
    },
    { id: "profile", label: "Profile", icon: <User className="w-4 h-4" /> },
  ];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleNavClick = (pageId: string) => {
    onPageChange?.(pageId);
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  const handleSignOut = () => {
    router.push("/");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => handleNavClick("home")}
          >
            <Image
              src="/Logo.png"
              alt="BloodLines logo"
              width={28}
              height={42}
              className="my-auto"
            />
            <span className="text-xl font-bold text-red-700 hidden sm:inline">
              BloodLines
            </span>
          </div>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activePage === item.id
                    ? "bg-[#C91E1E] text-white font-semibold"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>

          {/* Right side — bell + avatar */}
          <div className="flex items-center gap-4">
            {/* Notification bell */}
            <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#C91E1E] rounded-full" />
            </button>

            {/* Avatar + dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-3 focus:outline-none"
              >
                {/* Name + role — desktop only */}
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-semibold text-gray-900">
                    {USER.name}
                  </span>
                  <span className="text-xs text-gray-500">{USER.role}</span>
                </div>

                {/* Avatar circle */}
                <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow">
                  {USER.initials}
                </div>
              </button>

              {/* Dropdown */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg py-3 z-50">
                  {/* User info */}
                  <div className="px-4 pb-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">
                      {USER.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{USER.email}</p>
                    <span className="inline-block mt-2 bg-green-600 text-white text-xs px-2.5 py-0.5 rounded-full">
                      {USER.role}
                    </span>
                  </div>

                  {/* Menu items */}
                  <div className="pt-2">
                    <button
                      onClick={() => handleNavClick("profile")}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                    >
                      <User className="w-4 h-4 text-gray-500" />
                      Profile
                    </button>

                    <button
                      onClick={() => handleNavClick("settings")}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                    >
                      <Settings className="w-4 h-4 text-gray-500" />
                      Settings
                    </button>

                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-[#C91E1E] hover:bg-red-50 transition"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-colors ${
                  activePage === item.id
                    ? "bg-red-50 text-[#C91E1E] font-semibold"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}

            {/* Mobile user section */}
            <div className="border-t border-gray-100 pt-3 mt-2 space-y-1">
              <div className="px-4 py-2">
                <p className="text-sm font-semibold text-gray-900">
                  {USER.name}
                </p>
                <p className="text-xs text-gray-500">{USER.email}</p>
                <span className="inline-block mt-1.5 bg-green-600 text-white text-xs px-2.5 py-0.5 rounded-full">
                  {USER.role}
                </span>
              </div>

              <button
                onClick={() => handleNavClick("settings")}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>

              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm text-[#C91E1E] hover:bg-red-50 transition"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default DonorNavbar;
