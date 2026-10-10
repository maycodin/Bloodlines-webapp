// lib/api.ts
import { io, Socket } from 'socket.io-client';

// The one place the backend address is set. Override it with NEXT_PUBLIC_API_URL in .env.local
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bloodlines-core.onrender.com';

// Some endpoints return a plain array, others wrap it as { data: [...] }. This handles both.
export const toList = <T = any>(res: any): T[] =>
  Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];

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
        
        // If still unauthorized, force logout
        if (response.status === 401) {
          clearAuthTokens();
          window.dispatchEvent(new Event('auth:logout'));
          throw new Error('Session expired. Please login again.');
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
      if (response.status >= 500) {
        // Server-side failure: log the raw reason for developers, show users something clearer
        console.error(`Server error ${response.status} on ${endpoint}:`, errorMessage);
        errorMessage = `Something went wrong on the server (error ${response.status}). Please try again later.`;
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
  _id?: string; // MongoDB id, returned by the /blood-requests endpoints
  bloodType: string;
  priorityLevel: 'CRITICAL' | 'URGENT' | 'SCHEDULED' | 'HIGH' | 'MEDIUM' | 'LOW';
  // Some endpoints (e.g. the donor dashboard) name this field "priority"
  priority?: 'CRITICAL' | 'URGENT' | 'SCHEDULED';
  unitsNeeded: number;
  contactPhone: string;
  facilityName: string;
  facilityAddress: string;
  facilityLocation: {
    type: 'Point';
    coordinates: [number, number];
  };
  additionalNotes?: string;
  patientCondition: string;
  requiredByDate: string;
  status: 'PENDING' | 'ACCEPTED' | 'FULFILLED' | 'CANCELLED';
  hospitalId: string;
  hospitalName?: string;
  // Field names used by the donor endpoints (DonationRequest in the API docs)
  address?: string;
  instructions?: string;
  distance?: number;
  createdAt: string;
  updatedAt: string;
}

// GET /donor/profile (DonorProfile in the API docs)
export interface DonorProfile {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  bloodGroup: string;
  genotype?: string;
  gender: string;
  latitude: number;
  longitude: number;
  location?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  lastDonationDate?: string;
  isAvailable: boolean;
  emergencyContact?: string;
  emergencyContactPhone?: string;
  createdAt: string;
  updatedAt: string;
}

// POST /donor/profile body (UpdateProfileInput in the API docs); every field is optional
export type DonorProfileInput = Partial<{
  fullName: string;
  phoneNumber: string;
  bloodGroup: string;
  genotype: string;
  gender: string;
  latitude: number;
  longitude: number;
  location: string;
  address: string;
  city: string;
  state: string;
  country: string;
  lastDonationDate: string;
  isAvailable: boolean;
  emergencyContact: string;
  emergencyContactPhone: string;
}>;

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
    
    // ✅ Return the response data directly
    return { 
      success: true, 
      data: result, 
      message: 'Login successful!' 
    };
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
      
      const response = await fetch(`${API_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      
      if (!response.ok) {
        throw new Error('Token refresh failed');
      }
      
      const result = await response.json();
      // The API docs don't name the token fields, so accept the common spellings
      const newToken = result.accessToken || result.access_token || result.token;
      const newRefreshToken = result.refreshToken || result.refresh_token;
      if (!newToken) {
        throw new Error('Token refresh returned no access token');
      }
      // Keep the tokens in the same storage as the existing refresh token
      const storage = localStorage.getItem('refreshToken') ? localStorage : sessionStorage;
      storage.setItem('token', newToken);
      if (newRefreshToken) storage.setItem('refreshToken', newRefreshToken);
      return { access_token: newToken };
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
  
  getDashboard: async (): Promise<any> => {
    return authFetch('/donor/dashboard');
  },

  getProfile: async (): Promise<DonorProfile> => {
    const profile = await authFetch('/donor/profile');
    return { ...profile, id: profile?.id ?? profile?._id };
  },
  
  updateProfile: async (data: DonorProfileInput): Promise<DonorProfile> => {
    return authFetch('/donor/profile', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  getNearbyRequests: async (params?: { page?: number; limit?: number; radiusKm?: number }): Promise<any> => {
    const query = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return authFetch(`/donor/nearby-requests${query}`);
  },
  
  getGoal: async (): Promise<any> => {
    return authFetch('/donor/goal');
  },
  
  createGoal: async (data: { target: number; targetDate?: string }): Promise<any> => {
    return authFetch('/donor/goal', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  getHealthScreeningQuestions: async (): Promise<any> => {
    return authFetch('/donor/health-screening/questions');
  },
  
  submitHealthScreening: async (answers: Record<string, any>): Promise<{ cleared: boolean; deferredReason?: string }> => {
    return authFetch('/donor/health-screening/submit', {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
  },
};

// ============ User Module ============
export const users = {
  // GET /users/me - Get current user's profile (works for all roles)
  getMyProfile: async (): Promise<UserProfile> => {
    const profile = await authFetch('/users/me');
    // MongoDB returns _id; the rest of the app expects id
    return { ...profile, id: profile?.id ?? profile?._id };
  },
  
  // GET /users/{id} - Get another user's profile by ID
  getUserById: async (userId: string): Promise<UserProfile> => {
    return authFetch(`/users/${userId}`);
  },
  
  // PUT /users/me - Update current user's profile
  // Only sends fields that have a value, so a blank form field never wipes saved data
  updateMyProfile: async (profileData: {
    fullName?: string;
    phoneNumber?: string;
    location?: string;
    bloodGroup?: string;
    genotype?: string;
  }): Promise<UserProfile> => {
    const body = Object.fromEntries(
      Object.entries(profileData).filter(([, value]) => typeof value === 'string' && value.trim() !== '')
    );
    return authFetch('/users/me', {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },
};

export const bridger = {
  getDashboard: async (): Promise<any> => {
    return authFetch('/bridger/dashboard');
  },

  // POST /bridger/emergency-alert - Alert eligible donors of the given blood groups
  sendEmergencyAlert: async (data: {
    targetBloodGroups: string[];
    message: string;
  }): Promise<any> => {
    return authFetch('/bridger/emergency-alert', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // POST /bridger/fulfill-request/{requestId} - Mark a request as fulfilled
  fulfillRequest: async (requestId: string): Promise<any> => {
    return authFetch(`/bridger/fulfill-request/${requestId}`, {
      method: 'POST',
    });
  },
};

export const pulseLeader = {
  getDashboard: async (): Promise<any> => {
    return authFetch('/pulse-leader/dashboard');
  },
};

export const admin = {
  getDashboard: async (): Promise<any> => {
    return authFetch('/admin/dashboard');
  },
};

// ============ Role Upgrades Module ============
export const roleUpgrades = {
  // GET /role-upgrades/my-history - The current user's own upgrade requests
  getMyHistory: async (): Promise<any[]> => {
    return authFetch('/role-upgrades/my-history');
  },

  // POST /role-upgrades/request - Ask to become a Bridger or Pulse Leader
  request: async (data: {
    requestedRole: 'BRIDGER' | 'PULSE_LEADER';
    reason?: string;
    facilityName?: string;
    facilityAddress?: string;
  }): Promise<any> => {
    return authFetch('/role-upgrades/request', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// ============ Blood Requests Module ============
export const bloodRequests = {
  // POST /blood-requests - Create a new blood request
  // Fields match CreateBloodRequestDto in the live API docs (bloodlines-core.onrender.com/api)
  create: async (data: {
    bloodType: string;
    priorityLevel: 'CRITICAL' | 'URGENT' | 'SCHEDULED';
    unitsNeeded: number;
    contactPhone: string;
    facilityName: string;
    facilityAddress: string;
    facilityLocation: {
      type: 'Point';
      coordinates: [number, number]; // [longitude, latitude]
    };
    additionalNotes?: string;
    patientCondition?: string;
    requiredByDate?: string;
  }): Promise<BloodRequest> => {
    return authFetch('/blood-requests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // GET /blood-requests/active - Get all active blood requests
  getActiveRequests: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<BloodRequest>> => {
    const query = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return authFetch(`/blood-requests/active${query}`);
  },

  // GET /blood-requests/all - Get all blood requests (with filters)
  getAllRequests: async (params?: {
    page?: number;
    limit?: number;
    bloodType?: string;
    urgency?: string;
    status?: string;
  }): Promise<PaginatedResponse<BloodRequest>> => {
    const query = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return authFetch(`/blood-requests/all${query}`);
  },

  // GET /blood-requests/my - Get bridger's own requests (returns a plain array)
  getMyRequests: async (): Promise<BloodRequest[]> => {
    return toList<BloodRequest>(await authFetch('/blood-requests/my'));
  },

  // GET /blood-requests/donor - Get requests for donor (matched by blood type and location)
  getDonorRequests: async (params?: {
    page?: number;
    limit?: number;
    lat?: number;
    lng?: number;
    radius?: number;
  }): Promise<PaginatedResponse<BloodRequest>> => {
    const query = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return authFetch(`/blood-requests/donor${query}`);
  },

  // GET /blood-requests/{requestId} - Get single request by ID
  getRequestById: async (id: string): Promise<BloodRequest> => {
    return authFetch(`/blood-requests/${id}`);
  },

  // POST /blood-requests/{requestId}/accept - Accept a request (donor)
  accept: async (id: string): Promise<{ success: boolean; message: string }> => {
    return authFetch(`/blood-requests/${id}/accept`, {
      method: 'POST',
    });
  },

  // POST /blood-requests/{requestId}/arrival-alert - Notify donor arrival
  arrivalAlert: async (id: string): Promise<{ success: boolean; message: string }> => {
    return authFetch(`/blood-requests/${id}/arrival-alert`, {
      method: 'POST',
    });
  },

  // POST /blood-requests/{requestId}/escalate - Escalate a critical request (pulse leader)
  escalate: async (id: string, data?: {
    reason?: string;
    widerRadius?: number;
  }): Promise<{ success: boolean; message: string }> => {
    return authFetch(`/blood-requests/${id}/escalate`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });
  },

  // POST /blood-requests/{requestId}/update - Update an existing request (bridger)
  update: async (id: string, data: {
    priorityLevel?: 'CRITICAL' | 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
    unitsNeeded?: number;
    contactPhone?: string;
    additionalNotes?: string;
    status?: 'PENDING' | 'ACCEPTED' | 'FULFILLED' | 'CANCELLED';
    facilityName?: string;
    facilityAddress?: string;
    facilityLocation?: {
      type: 'Point';
      coordinates: [number, number];
    };
  }): Promise<BloodRequest> => {
    return authFetch(`/blood-requests/${id}/update`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // POST /blood-requests/{requestId}/cancel - Cancel a request (bridger)
  cancel: async (id: string, data?: {
    reason?: string;
  }): Promise<{ success: boolean; message: string }> => {
    return authFetch(`/blood-requests/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });
  },

};

// ============ Pulse Leader Module ============
// export const pulseLeader = {
//   getMetrics: async (): Promise<{
//     totalDonations: number;
//     activeRequests: number;
//     fulfillmentRate: number;
//     regionalBreakdown: any[];
//   }> => {
//     return authFetch('/pulse-leader/metrics');
//   },
  
//   getCampaigns: async (): Promise<PaginatedResponse<any>> => {
//     return authFetch('/pulse-leader/campaigns');
//   },
  
//   createCampaign: async (data: {
//     name: string;
//     goal: number;
//     targetRegions: string[];
//     bloodTypeFocus?: string;
//     startDate: string;
//     endDate: string;
//   }): Promise<any> => {
//     return authFetch('/pulse-leader/campaigns', {
//       method: 'POST',
//       body: JSON.stringify(data),
//     });
//   },

//   getUpgradeHistory: async (params?: {
//     page?: number;
//     limit?: number;
//   }): Promise<PaginatedResponse<any>> => {
//     const query = params ? `?${new URLSearchParams(params as any).toString()}` : '';
//     return authFetch(`/role-upgrades/my-history${query}`);
//   },
// };

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
    return authFetch(`/inventory/audit${query}`);
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
  }
};