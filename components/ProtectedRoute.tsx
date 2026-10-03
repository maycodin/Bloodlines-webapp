"use client";

import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

// ✅ Helper function to convert PULSE_LEADER → pulse-leader
const normalizeRole = (role: string): 'donor' | 'bridger' | 'pulse-leader' | 'admin' => {
  if (!role) return 'donor';
  const normalized = role.toLowerCase().replace(/_/g, '-');
  const validRoles = ['donor', 'bridger', 'pulse-leader', 'admin'];
  return validRoles.includes(normalized) ? normalized as any : 'donor';
};

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (isLoading) {
      console.log('⏳ ProtectedRoute: Auth is loading, waiting...');
      return;
    }

    const isAuth = isAuthenticated || !!user;
    // ✅ Normalize PULSE_LEADER → pulse-leader
    const userRole = normalizeRole(user?.role || 'donor');

    console.log('🔍 ProtectedRoute: Auth check', {
      isLoading,
      isAuthenticated,
      isAuth,
      userRole,
      originalRole: user?.role,
      hasUser: !!user,
      pathname,
      allowedRoles
    });

    if (!isAuth) {
      console.log('🚪 Not authenticated, redirecting to login');
      setIsRedirecting(true);
      router.push('/RegisterPage/Login');
      return;
    }

    // ✅ Normalize allowedRoles for comparison
    const normalizedAllowedRoles = allowedRoles?.map(role => normalizeRole(role)) || [];

    if (normalizedAllowedRoles.length > 0 && !normalizedAllowedRoles.includes(userRole)) {
  console.log(`🚫 Role ${userRole} not allowed. Allowed: ${normalizedAllowedRoles.join(', ')}`);
  setIsRedirecting(true);
  const redirectMap: Record<string, string> = {
    donor: '/DonorDashboard',
    bridger: '/BridgerDashboard',
    'pulse-leader': '/PulseLeader',
    admin: '/admin/dashboard',
  };
  const redirectPath = redirectMap[userRole] || '/DonorDashboard';
  // ✅ Use window.location for hard redirect
  window.location.href = redirectPath;
  return;
}

    console.log('✅ Access granted for role:', userRole);
    setIsRedirecting(false);
    
  }, [isLoading, isAuthenticated, user, router, allowedRoles, pathname]);

  if (isLoading || isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">{isRedirecting ? 'Redirecting...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  const isAuth = isAuthenticated || !!user;
  if (!isAuth) return null;
  
  const userRole = normalizeRole(user?.role || 'donor');
  const normalizedAllowedRoles = allowedRoles?.map(role => normalizeRole(role)) || [];
  
  if (normalizedAllowedRoles.length > 0 && !normalizedAllowedRoles.includes(userRole)) return null;

  return <>{children}</>;
};