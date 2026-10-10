// contexts/AuthContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth, users, roleUpgrades, UserProfile } from '@/lib/api';
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

// Open routes: anyone can view these, logged in or not (matched exactly)
const openRoutes = ['/', '/RegisterPage'];

// Public routes that don't require authentication.
// Logged-in users are sent from these to their dashboard.
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
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (!token) {
    setUser(null);
    return;
  }

  // Try up to 3 times, so a slow or briefly unreachable server doesn't log the user out
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const profile = await users.getMyProfile();
      if (profile && profile.role) {
        profile.role = normalizeRole(profile.role) as any;
      }
      setUser(profile);
      return;
    } catch (error: any) {
      // authFetch has already tried a token refresh, so this means the session really ended
      if (error?.message?.startsWith('Session expired')) {
        setUser(null);
        return;
      }
      console.error(`Failed to load user (attempt ${attempt} of 3):`, error);
      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  }
  setUser(null);
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
      }
    };
    initAuth();
  }, []);

  // lib/api.ts fires 'auth:logout' when a session can't be refreshed
  useEffect(() => {
    const handleForcedLogout = () => setUser(null);
    window.addEventListener('auth:logout', handleForcedLogout);
    return () => window.removeEventListener('auth:logout', handleForcedLogout);
  }, []);

  // Route protection logic
  useEffect(() => {
    if (!isLoading) {
      // Landing page and role chooser: no redirect for anyone
      if (openRoutes.includes(pathname || '')) return;

      const isPublicRoute = publicRoutes.some(route => pathname?.includes(route));
      
      if (!user && !isPublicRoute) {
        // Not authenticated and trying to access protected route
        router.push('/RegisterPage/Login');
      } else if (user && isPublicRoute) {
        // Authenticated user trying to access login/signup pages
        const userRole = user.role || 'donor';
        const redirectPath = roleRoutes[userRole as keyof typeof roleRoutes] || '/DonorDashboard';
        router.push(redirectPath);
      } else if (user && !isPublicRoute) {
        // Check if user has access to the current route based on role
        const currentPath = pathname || '';
        const userRole = user.role || 'donor';
        const expectedPath = roleRoutes[userRole as keyof typeof roleRoutes];
        
        // If user is trying to access a dashboard that doesn't match their role
        if (currentPath.includes('BridgerDashboard') && userRole !== 'bridger') {
          router.push(expectedPath || '/DonorDashboard');
        } else if (currentPath.includes('PulseLeader') && userRole !== 'pulse-leader') {
          router.push(expectedPath || '/DonorDashboard');
        } else if (currentPath.includes('admin') && userRole !== 'admin') {
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
    const result = await auth.login(email, password);
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Login failed');
    }
    
    // Store token first
    const token = result.data.accessToken || result.data.token || result.data.access_token;
    if (token) {
      if (remember) {
        localStorage.setItem('token', token);
      } else {
        sessionStorage.setItem('token', token);
      }
    }
    
    // Store refresh token if provided
    const refreshToken = result.data.refreshToken || result.data.refresh_token;
    if (refreshToken) {
      if (remember) {
        localStorage.setItem('refreshToken', refreshToken);
      } else {
        sessionStorage.setItem('refreshToken', refreshToken);
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
    
    // ✅ Use window.location for a hard redirect to ensure clean state
    window.location.href = redirectPath;
    
  } catch (error) {
    console.error('❌ Login error:', error);
    throw error;
  }
};

  // Logout function
  const logout = () => {
    // Clears the access token AND the refresh token from both storages
    auth.logout();
    setUser(null);
    router.push('/RegisterPage/Login');
  };

  // Role upgrade function
  const requestRoleUpgrade = async (role: string, details: any) => {
    // Goes through lib/api.ts, which adds the token and refreshes it if needed
    return roleUpgrades.request({ requestedRole: role as 'BRIDGER' | 'PULSE_LEADER', ...details });
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


  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};