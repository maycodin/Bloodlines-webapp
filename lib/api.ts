// lib/api.ts
import { io, Socket } from 'socket.io-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Helper to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

// Helper to set auth token
const setAuthToken = (token: string, remember: boolean = false) => {
  if (remember) {
    localStorage.setItem('token', token);
  } else {
    sessionStorage.setItem('token', token);
  }
};

// Helper to clear auth tokens
const clearAuthTokens = () => {
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  sessionStorage.removeItem('refreshToken');
};

// Helper for authenticated requests with auto token refresh
const authFetch = async (endpoint: string, options: RequestInit = {}, retryCount = 0): Promise<any> => {
  const token = getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };
  
  try {
    let response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
    
    // If unauthorized (401) and we haven't retried yet, try to refresh token
    if (response.status === 401 && retryCount === 0) {
      console.log('🔄 Token expired, attempting refresh...');
      const refreshed = await auth.refreshToken();
      
      if (refreshed) {
        // Retry the original request with new token
        const newToken = getAuthToken();
        const newHeaders = {
          ...headers,
          Authorization: `Bearer ${newToken}`,
        };
        
        response = await fetch(`${API_URL}${endpoint}`, {
          ...options,
          headers: newHeaders,
        });
        
        if (response.ok) {
          console.log('✅ Request succeeded after token refresh');
        } else {
          // If still unauthorized, force logout
          if (response.status === 401) {
            clearAuthTokens();
            window.dispatchEvent(new Event('auth:logout'));
            throw new Error('Session expired. Please login again.');
          }
        }
      } else {
        // Refresh failed, clear tokens and force logout
        clearAuthTokens();
        window.dispatchEvent(new Event('auth:logout'));
        throw new Error('Session expired. Please login again.');
      }
    }
    
    // Handle non-OK responses
    if (!response.ok) {
      let errorMessage = 'Request failed';
      try {
        const error = await response.json();
        errorMessage = error.message || error.error || `Request failed with status ${response.status}`;
      } catch {
        errorMessage = `Request failed with status ${response.status}`;
      }
      throw new Error(errorMessage);
    }
    
    // Parse JSON response
    const data = await response.json();
    return data;
    
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error. Please check your connection.');
  }
};

// ============ Types ============
export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  gender: 'Male' | 'Female';
  bloodGroup?: string;
  genotype?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  role: 'donor' | 'bridger' | 'pulse-leader' | 'admin';
  profileCompletion?: number;
  lastDonationDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BloodRequest {
  id: string;
  bloodType: string;
  unitsNeeded: number;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  status: 'pending' | 'accepted' | 'fulfilled' | 'cancelled';
  hospitalId: string;
  hospitalName: string;
  patientCondition: string;
  requiredByDate: string;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}

export interface SignupData {
  fullName: string;
  gender: string;
  phoneNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
  bloodGroup?: string;
  genotype?: string;
  location?: string;
}

// ============ Auth Module ============
export const auth = {
  signup: async (data: SignupData): Promise<ApiResponse> => {
    try {
      const url = `${API_URL}/auth/signup`;
      console.log('📤 Sending to:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      let result;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      } else {
        const text = await response.text();
        result = { message: text };
      }
      
      if (!response.ok) {
        const errorMessage = result.message || result.error || 'Signup failed';
        throw new Error(errorMessage);
      }
      
      return { 
        success: true, 
        data: result, 
        message: 'Account created successfully! Please check your email to verify your account.' 
      };
    } catch (error) {
      console.error('❌ Signup error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Something went wrong' 
      };
    }
  },
  
  login: async (email: string, password: string, remember: boolean = false): Promise<ApiResponse> => {
    try {
      const url = `${API_URL}/auth/login`;
      console.log('🔐 Login to:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Login failed');
      }
      
      // Store tokens
      if (result.access_token || result.token) {
        const token = result.access_token || result.token;
        setAuthToken(token, remember);
      }
      
      if (result.refreshToken) {
        if (remember) {
          localStorage.setItem('refreshToken', result.refreshToken);
        } else {
          sessionStorage.setItem('refreshToken', result.refreshToken);
        }
      }
      
      return { success: true, data: result, message: 'Login successful!' };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Something went wrong' 
      };
    }
  },
  
  refreshToken: async (): Promise<{ access_token: string } | null> => {
    try {
      const refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
      if (!refreshToken) return null;
      
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      
      if (!response.ok) {
        throw new Error('Token refresh failed');
      }
      
      const result = await response.json();
      if (result.access_token) {
        // Keep the token in the same storage as the refresh token
        if (localStorage.getItem('refreshToken')) {
          localStorage.setItem('token', result.access_token);
        } else {
          sessionStorage.setItem('token', result.access_token);
        }
      }
      return result;
    } catch (error) {
      console.error('Token refresh failed:', error);
      clearAuthTokens();
      return null;
    }
  },
  
  logout: (): void => {
    clearAuthTokens();
    window.dispatchEvent(new Event('auth:logout'));
  },
  
  resendVerification: async (email: string): Promise<ApiResponse> => {
    try {
      const url = `${API_URL}/auth/resend-verification`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to resend verification');
      }
      
      return { 
        success: true, 
        message: 'Verification email sent! Please check your inbox.' 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Something went wrong' 
      };
    }
  },
  
  forgotPassword: async (email: string): Promise<ApiResponse> => {
    try {
      const url = `${API_URL}/auth/forgot-password`;
      console.log('🔐 Forgot password request to:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to send reset link');
      }
      
      return { 
        success: true, 
        message: 'Reset link sent! Check your email.' 
      };
    } catch (error) {
      console.error('❌ Forgot password error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Something went wrong' 
      };
    }
  },

  resetPassword: async (token: string, newPassword: string, confirmPassword: string): Promise<ApiResponse> => {
    try {
      const url = `${API_URL}/auth/reset-password`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword, confirmPassword }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to reset password');
      }
      
      return { 
        success: true, 
        message: 'Password reset successful! You can now login.' 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Something went wrong' 
      };
    }
  },
};

// ============ Donor Module ============
export const donor = {
  getDashboardSummary: async (): Promise<{
    totalDonations: number;
    livesImpacted: number;
    badges: string[];
    upcomingAppointments: any[];
  }> => {
    return authFetch('/donor/dashboard/summary');
  },
  
  getProfile: async (): Promise<UserProfile> => {
    return authFetch('/donor/profile');
  },
  
  updateProfile: async (data: Partial<UserProfile>): Promise<UserProfile> => {
    return authFetch('/donor/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  getNearbyRequests: async (params?: { lat?: number; lng?: number; radius?: number }): Promise<PaginatedResponse<BloodRequest>> => {
    const query = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return authFetch(`/donor/blood-requests/nearby${query}`);
  },
  
  getGoals: async (): Promise<PaginatedResponse<any>> => {
    return authFetch('/donor/goals');
  },
  
  createGoal: async (data: { target: number; targetDate?: string }): Promise<any> => {
    return authFetch('/donor/goals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  getHealthScreenings: async (): Promise<PaginatedResponse<any>> => {
    return authFetch('/donor/health-screening');
  },
  
  submitHealthScreening: async (answers: Record<string, any>): Promise<{ cleared: boolean; deferredReason?: string }> => {
    return authFetch('/donor/health-screening', {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
  },
};

// ============ User Module ============
export const users = {
  getMyProfile: async (): Promise<UserProfile> => {
    return authFetch('/users/me');
  },
  
  getUserById: async (userId: string): Promise<UserProfile> => {
    return authFetch(`/users/${userId}`);
  },
  
  updateMyProfile: async (profileData: Partial<UserProfile>): Promise<UserProfile> => {
    return authFetch('/users/profile', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  },
};

// ============ Blood Requests Module ============
export const bloodRequests = {
  create: async (data: {
    bloodType: string;
    unitsNeeded: number;
    urgency: string;
    hospitalId: string;
    patientCondition: string;
    requiredByDate: string;
    additionalNotes?: string;
  }): Promise<BloodRequest> => {
    return authFetch('/blood-requests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  getMatches: async (requestId: string): Promise<{
    donors: Array<{ id: string; fullName: string; bloodType: string; distance: number; phoneNumber?: string; email?: string; lastDonationDate?: string }>;
  }> => {
    return authFetch(`/blood-requests/${requestId}/match`);
  },
  
  emergencyBroadcast: async (data: {
    requestId: string;
    bloodType: string;
    message: string;
  }): Promise<{ broadcastId: string; recipientCount: number }> => {
    return authFetch('/blood-requests/emergency', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  getMyRequests: async (params?: { status?: string; page?: number; limit?: number }): Promise<PaginatedResponse<BloodRequest>> => {
    const query = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return authFetch(`/blood-requests/my${query}`);
  },
  
  getActiveRequests: async (): Promise<BloodRequest[]> => {
    const response = await authFetch('/blood-requests/active');
    return response.data || response;
  },
  
  getRequestById: async (id: string): Promise<BloodRequest> => {
    return authFetch(`/blood-requests/${id}`);
  },
  
  update: async (id: string, data: Partial<BloodRequest>): Promise<BloodRequest> => {
    return authFetch(`/blood-requests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  accept: async (id: string): Promise<{ success: boolean; message: string }> => {
    return authFetch(`/blood-requests/${id}/accept`, {
      method: 'POST',
    });
  },
  
  confirm: async (id: string): Promise<{ success: boolean; message: string }> => {
    return authFetch(`/blood-requests/${id}/confirm`, {
      method: 'POST',
    });
  },
};

// ============ Pulse Leader Module ============
export const pulseLeader = {
  getMetrics: async (): Promise<{
    totalDonations: number;
    activeRequests: number;
    fulfillmentRate: number;
    regionalBreakdown: any[];
  }> => {
    return authFetch('/pulse-leader/metrics');
  },
  
  getCampaigns: async (): Promise<PaginatedResponse<any>> => {
    return authFetch('/pulse-leader/campaigns');
  },
  
  createCampaign: async (data: {
    name: string;
    goal: number;
    targetRegions: string[];
    bloodTypeFocus?: string;
    startDate: string;
    endDate: string;
  }): Promise<any> => {
    return authFetch('/pulse-leader/campaigns', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// ============ Analytics Module ============
export const analytics = {
  getBridgerAnalytics: async (bridgerId: string): Promise<{
    totalRequests: number;
    fulfillmentRate: number;
    avgResponseTime: string;
    monthlyData: any[];
  }> => {
    return authFetch(`/analytics/bridger?bridgerId=${bridgerId}`);
  },
};

// ============ Inventory Module ============
export const inventory = {
  getAuditLogs: async (params?: { page?: number; limit?: number }): Promise<PaginatedResponse<any>> => {
    const query = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return authFetch(`/inventory/logs${query}`);
  },
};

// ============ WebSocket / Socket.IO ============
let socket: Socket | null = null;

export const initializeSocket = (token?: string): Socket => {
  const authToken = token || getAuthToken();
  if (!authToken) {
    console.error('Cannot initialize socket: No auth token');
    throw new Error('No auth token available');
  }
  
  if (socket?.connected) return socket;
  
  socket = io(API_URL, {
    auth: { token: `Bearer ${authToken}` },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });
  
  socket.on('connect', () => {
    console.log('🔌 Socket.IO connected');
  });
  
  socket.on('disconnect', (reason) => {
    console.log('🔌 Socket.IO disconnected:', reason);
  });
  
  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });
  
  return socket;
};

export const getSocket = (): Socket | null => socket;

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Socket event names
export const socketEvents = {
  emergencyAlert: 'emergency-alert',
  inventoryAlert: 'inventory-alert',
  appointmentReminder: 'appointment-reminder',
  requestStatusUpdate: 'request-status-update',
  authRequired: 'auth-required',
};

// Helper to listen to socket events
export const onSocketEvent = (event: string, callback: (data: any) => void) => {
  if (socket) {
    socket.on(event, callback);
  }
};

// Helper to remove socket event listeners
export const offSocketEvent = (event: string, callback?: (data: any) => void) => {
  if (socket) {
    socket.off(event, callback);
  }
};

// Helper to emit socket events
export const emitSocketEvent = (event: string, data: any) => {
  if (socket?.connected) {
    socket.emit(event, data);
  } else {
    console.warn(`Cannot emit ${event}: Socket not connected`);
  }
};