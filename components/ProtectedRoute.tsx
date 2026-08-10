// components/ProtectedRoute.tsx
"use client";

import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // CRITICAL: Wait for loading to complete
    if (isLoading) {
      console.log('⏳ ProtectedRoute: Auth is loading, waiting...');
      return;
    }

    // Check if user is authenticated
    const isAuth = isAuthenticated || !!user;
    const userRole = user?.role || 'donor';

    console.log('🔍 ProtectedRoute: Auth check', {
      isLoading,
      isAuthenticated,
      isAuth,
      userRole,
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

    // If allowedRoles is provided and user role is not in the list
    if (allowedRoles && !allowedRoles.includes(userRole)) {
      console.log(`🚫 Role ${userRole} not allowed. Allowed: ${allowedRoles.join(', ')}`);
      setIsRedirecting(true);
      const redirectMap: Record<string, string> = {
        donor: '/DonorDashboard',
        bridger: '/BridgerDashboard',
        'pulse-leader': '/PulseLeader',
        admin: '/admin/dashboard',
      };
      const redirectPath = redirectMap[userRole] || '/DonorDashboard';
      router.push(redirectPath);
      return;
    }

    // Access granted
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
  
  const userRole = user?.role || 'donor';
  if (allowedRoles && !allowedRoles.includes(userRole)) return null;

  return <>{children}</>;
};