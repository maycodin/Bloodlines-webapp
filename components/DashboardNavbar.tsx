"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { LogOut, User } from "lucide-react";
import { useAuth } from "@/app/contexts/AuthContext";
import RoleBadge, { ROLE_DETAILS, Role } from "@/components/RoleBadge";
import NotificationBell from "@/components/NotificationBell";

export type NavItem = { id: string; label: string; icon: React.ReactNode };

type DashboardNavbarProps = {
  navItems: NavItem[];
  activePage: string;
  onPageChange: (page: string) => void;
  profilePage?: string;
};

export function UserAvatar({ size = "w-10 h-10", textSize = "text-base" }: { size?: string; textSize?: string }) {
  const { user } = useAuth();
  const initial = user?.fullName?.trim().charAt(0).toUpperCase() || "U";

  if (user?.avatarUrl) {
    return <img src={user.avatarUrl} alt="" className={`${size} rounded-full object-cover`} />;
  }
  return (
    <span className={`${size} ${textSize} rounded-full bg-[#C91E1E] dark:bg-[#F44336] text-white font-bold flex items-center justify-center`}>
      {initial}
    </span>
  );
}

export default function DashboardNavbar({ navItems, activePage, onPageChange, profilePage = "profile" }: DashboardNavbarProps) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const roleName = ROLE_DETAILS[(user?.role || "donor") as Role]?.name;

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const go = (page: string) => {
    onPageChange(page);
    setMenuOpen(false);
    window.scrollTo({ top: 0 });
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button type="button" onClick={() => go("home")} className="flex items-center gap-2">
            <Image src="/Logo.png" alt="" width={26} height={38} />
            <span className="text-xl font-bold text-[#1E7B3A] dark:text-white">BloodLines</span>
          </button>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => go(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activePage === item.id ? "bg-[#C91E1E] text-white font-semibold" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <RoleBadge />
            <NotificationBell />
            <div className="relative" ref={menuRef}>
              <button type="button" onClick={() => setMenuOpen((o) => !o)} aria-label="Account menu" className="ml-1 rounded-full">
                <UserAvatar />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-50">
                  <div className="px-4 pb-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900 truncate">{user?.fullName}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    {roleName && <p className="text-xs text-[#1E7B3A] dark:text-[#34C759] font-medium mt-1">{roleName}</p>}
                  </div>
                  <button onClick={() => go(profilePage)} className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    <User className="w-4 h-4 text-gray-500" /> Profile
                  </button>
                  <button onClick={() => logout()} className="flex items-center gap-3 w-full px-4 py-2 text-sm text-[#C91E1E] hover:bg-red-50">
                    <LogOut className="w-4 h-4" /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-gray-200 pb-[env(safe-area-inset-bottom)]">
        <div className="flex justify-around px-2 py-2">
          {navItems.map((item) => {
            const active = activePage === item.id;
            return (
              <button key={item.id} onClick={() => go(item.id)} className="flex flex-col items-center gap-1 min-w-0 flex-1">
                <span className={`px-4 py-1 rounded-xl ${active ? "bg-[#C91E1E] text-white" : "text-gray-600"}`}>{item.icon}</span>
                <span className={`text-xs truncate max-w-full ${active ? "text-[#C91E1E] font-semibold" : "text-gray-600"}`}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
