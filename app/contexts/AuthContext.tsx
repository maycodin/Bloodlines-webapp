// contexts/AuthContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth, UserProfile } from '@/lib/api';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  userRole: string | null;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  requestRoleUpgrade: (role: string, details: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Public routes that don't require authentication
const publicRoutes = ['/RegisterPage/Login', '/RegisterPage/Signup', '/RegisterPage/Forgot-password', '/reset-password', '/verify-email', '/check-email'];

// Role-based route mappings
const roleRoutes = {
  donor: '/DonorDashboard',
  bridger: '/BridgerDashboard',
  'pulse-leader': '/PulseLeader',
  admin: '/admin/dashboard',
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      console.log('🔄 Refreshing user... Token:', token ? 'Present' : 'Missing');
      
      if (!token) {
        setUser(null);
        return;
      }
      
      const { donor } = await import('@/lib/api');
      const profile = await donor.getProfile();
      setUser(profile);
      console.log('✅ User refreshed:', profile);
    } catch (error) {
      console.error('❌ Failed to refresh user:', error);
      const result = await auth.refreshToken();
      if (!result) {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        setUser(null);
      }
    }
  };

  // Initialize auth on mount
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        console.log('🔐 Auth init - Token:', token ? 'Present' : 'Missing');
        if (token) {
          await refreshUser();
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
        console.log('🏁 Auth init complete - isLoading:', false);
      }
    };
    initAuth();
  }, []);

  // Route protection logic
  useEffect(() => {
    if (!isLoading) {
      const isPublicRoute = publicRoutes.some(route => pathname?.includes(route));
      console.log('🔍 Route protection check:', { 
        isPublicRoute, 
        hasUser: !!user, 
        userRole: user?.role,
        pathname,
        isLoading 
      });
      
      if (!user && !isPublicRoute) {
        // Not authenticated and trying to access protected route
        console.log('🚪 Redirecting to login (not authenticated)');
        router.push('/RegisterPage/Login');
      } else if (user && isPublicRoute) {
        // Authenticated user trying to access login/signup pages
        const userRole = user.role || 'donor';
        const redirectPath = roleRoutes[userRole as keyof typeof roleRoutes] || '/DonorDashboard';
        console.log(`🔄 Authenticated user on public route, redirecting to: ${redirectPath}`);
        router.push(redirectPath);
      } else if (user && !isPublicRoute) {
        // Check if user has access to the current route based on role
        const currentPath = pathname || '';
        const userRole = user.role || 'donor';
        const expectedPath = roleRoutes[userRole as keyof typeof roleRoutes];
        
        // If user is trying to access a dashboard that doesn't match their role
        if (currentPath.includes('BridgerDashboard') && userRole !== 'bridger') {
          console.log(`🚫 Role ${userRole} cannot access BridgerDashboard, redirecting to ${expectedPath || '/DonorDashboard'}`);
          router.push(expectedPath || '/DonorDashboard');
        } else if (currentPath.includes('PulseLeader') && userRole !== 'pulse-leader') {
          console.log(`🚫 Role ${userRole} cannot access PulseLeader, redirecting to ${expectedPath || '/DonorDashboard'}`);
          router.push(expectedPath || '/DonorDashboard');
        } else if (currentPath.includes('admin') && userRole !== 'admin') {
          console.log(`🚫 Role ${userRole} cannot access admin, redirecting to ${expectedPath || '/DonorDashboard'}`);
          router.push(expectedPath || '/DonorDashboard');
        }
      }
    }
  }, [user, isLoading, pathname, router]);

  // Login function - Updated with proper waiting
  const login = async (email: string, password: string, remember = false) => {
    try {
      console.log('🔐 Attempting login...');
      const result = await auth.login(email, password);
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Login failed');
      }
      
      // Store token first
      const token = result.data.access_token || result.data.token;
      if (token) {
        if (remember) {
          localStorage.setItem('token', token);
          console.log('💾 Token stored in localStorage');
        } else {
          sessionStorage.setItem('token', token);
          console.log('💾 Token stored in sessionStorage');
        }
      }
      
      // Wait a moment for storage to be available
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Now refresh user data - this will set the user state
      console.log('🔄 Fetching user profile...');
      await refreshUser();
      
      // Wait a moment for state to update
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Get the user role from the stored data
      const userRole = result.data.user?.role || 'donor';
      const redirectPath = roleRoutes[userRole as keyof typeof roleRoutes] || '/DonorDashboard';
      
      console.log(`✅ Login successful, redirecting to: ${redirectPath} with role: ${userRole}`);
      
      // Use window.location for a hard redirect to ensure clean state
      window.location.href = redirectPath;
      
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    console.log('🔓 Logging out...');
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    setUser(null);
    router.push('/RegisterPage/Login');
  };

  // Role upgrade function
  const requestRoleUpgrade = async (role: string, details: any) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/role-upgrades/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ requestedRole: role, ...details }),
    });
    
    if (!response.ok) throw new Error('Failed to submit role upgrade request');
    return response.json();
  };

  // Context value
  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    userRole: user?.role || null,
    login,
    logout,
    refreshUser,
    requestRoleUpgrade,
  };

  console.log('📊 AuthContext state:', { 
    isLoading: value.isLoading, 
    isAuthenticated: value.isAuthenticated, 
    userRole: value.userRole,
    hasUser: !!user 
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};