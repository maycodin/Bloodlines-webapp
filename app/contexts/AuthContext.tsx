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

  // contexts/AuthContext.tsx - Update refreshUser

const refreshUser = async () => {
  try {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    console.log('🔄 Refreshing user... Token:', token ? 'Present' : 'Missing');
    
    if (!token) {
      setUser(null);
      return;
    }
    
    // ✅ Use the generic user endpoint
    const { users } = await import('@/lib/api');
    const profile = await users.getMyProfile();
    if (profile && profile.role) {
  profile.role = normalizeRole(profile.role) as any;
}
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

const normalizeRole = (role: string): 'donor' | 'bridger' | 'pulse-leader' | 'admin' => {
  if (!role) return 'donor';
  const normalized = role.toLowerCase().replace(/_/g, '-');
  // Ensure the normalized role is one of the allowed values
  if (normalized === 'donor' || normalized === 'bridger' || normalized === 'pulse-leader' || normalized === 'admin') {
    return normalized;
  }
  return 'donor'; // Default to donor if unknown
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
  // contexts/AuthContext.tsx - Update the login function

// contexts/AuthContext.tsx - Update the login function

const login = async (email: string, password: string, remember = false) => {
  try {
    console.log('🔐 Attempting login...');
    const result = await auth.login(email, password);
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Login failed');
    }
    
    // Store token first
    const token = result.data.accessToken || result.data.token || result.data.access_token;
    if (token) {
      if (remember) {
        localStorage.setItem('token', token);
        console.log('💾 Token stored in localStorage');
      } else {
        sessionStorage.setItem('token', token);
        console.log('💾 Token stored in sessionStorage');
      }
    }
    
    // Store refresh token if provided
    if (result.data.refreshToken) {
      if (remember) {
        localStorage.setItem('refreshToken', result.data.refreshToken);
      } else {
        sessionStorage.setItem('refreshToken', result.data.refreshToken);
      }
    }
    
    // ✅ Set the user in state using the normalized role
    const normalizedRole = normalizeRole(result.data.user?.role || 'donor');
    setUser({
      id: result.data.user.id,
      fullName: result.data.user.fullName || '',
      email: result.data.user.email,
      phoneNumber: '',
      gender: 'Male' as 'Male' | 'Female',
      role: normalizedRole,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    
    // ✅ Determine redirect path based on role
    const redirectMap: Record<string, string> = {
      donor: '/DonorDashboard',
      bridger: '/BridgerDashboard',
      'pulse-leader': '/PulseLeader',
      admin: '/admin/dashboard',
    };
    
    const redirectPath = redirectMap[normalizedRole] || '/DonorDashboard';
    console.log(`🔄 Redirecting to: ${redirectPath} for role: ${normalizedRole}`);
    
    // ✅ Use window.location for a hard redirect to ensure clean state
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
  try {
    // Get the token directly
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    if (!token) {
      throw new Error('No authentication token found. Please login again.');
    }
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/role-upgrades/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ requestedRole: role, ...details }),
    });
    
    // If unauthorized, try to refresh token
    if (response.status === 401) {
      console.log('🔄 Token expired during role upgrade, attempting refresh...');
      const refreshed = await auth.refreshToken();
      
      if (refreshed) {
        // Retry with new token
        const newToken = localStorage.getItem('token') || sessionStorage.getItem('token');
        const retryResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/role-upgrades/request`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${newToken}`,
          },
          body: JSON.stringify({ requestedRole: role, ...details }),
        });
        
        if (!retryResponse.ok) {
          const error = await retryResponse.json();
          throw new Error(error.message || 'Failed to submit role upgrade request');
        }
        
        return retryResponse.json();
      } else {
        throw new Error('Session expired. Please login again.');
      }
    }
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to submit role upgrade request');
    }
    
    return response.json();
    
  } catch (error) {
    console.error('❌ Role upgrade error:', error);
    throw error;
  }
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

  // console.log('📊 AuthContext state:', { 
  //   isLoading: value.isLoading, 
  //   isAuthenticated: value.isAuthenticated, 
  //   userRole: value.userRole,
  //   hasUser: !!user 
  // });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};