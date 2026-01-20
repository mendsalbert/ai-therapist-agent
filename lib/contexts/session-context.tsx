"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { backendService } from "@/lib/api/backend-service";
import { logger } from "@/lib/utils/logger";
import { initBackendWakeUp } from "@/lib/utils/backend-wakeup";

interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  token?: string;
  matchingPreferences?: {
    challenges: string[];
    goals: string[];
    experienceLevel: "beginner" | "intermediate" | "experienced";
    ageRange: [number, number];
    timezone: string;
    communicationStyle: "gentle" | "direct" | "supportive";
    preferredCheckInFrequency: "daily" | "weekly" | "as-needed";
    allowVideoCalls: boolean;
  };
}

interface SessionContextType {
  user: User | null;
  isAuthenticated: boolean;
  userTier: "free" | "premium";
  isLoading: boolean;
  loading: boolean;
  checkSession: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: { name: string; email: string; password: string }) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  refreshUserTier: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userTier, setUserTier] = useState<"free" | "premium">("free");
  const [isLoading, setIsLoading] = useState(true);

  const checkAuthStatus = useCallback(async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      
      if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        setUserTier("free");
        setIsLoading(false);
        return;
      }

      // Check cache first to avoid unnecessary API calls
      const cachedUser = localStorage.getItem('cachedUser');
      const cacheTime = localStorage.getItem('userCacheTime');
      const now = Date.now();
      
      // Use cache if less than 5 minutes old
      if (cachedUser && cacheTime && (now - parseInt(cacheTime)) < 300000) {
        try {
          const userData = JSON.parse(cachedUser);
          setUser(userData);
          setIsAuthenticated(true);
          setIsLoading(false);
          
          // Still fetch tier in background but don't block
          fetchTierInBackground(token);
          return;
        } catch (e) {
          logger.error("Error parsing cached user:", e);
        }
      }

      // Check if user is authenticated with timeout and retry
      const fetchWithRetry = async (retries = 2): Promise<Response | null> => {
        for (let i = 0; i <= retries; i++) {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout
            
            const response = await fetch('/api/auth/session', {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
              signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            return response;
          } catch (error: any) {
            // Don't log AbortError as error if we have cached data to fall back on
            const isAbortError = error.name === 'AbortError' || error.message?.includes('aborted');
            if (i === retries) {
              if (isAbortError && cachedUser) {
                // This is expected when backend is slow/sleeping and we have cached data
                logger.debug("Session check timed out, will use cached user data");
              } else {
                logger.error("Session check failed after retries:", error);
              }
              return null;
            }
            // Exponential backoff
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
          }
        }
        return null;
      };

      const response = await fetchWithRetry();

      if (response && response.ok) {
        const data = await response.json();
        if (data.isAuthenticated && data.user) {
          setUser(data.user);
          setIsAuthenticated(true);
          
          // Cache the user data
          localStorage.setItem('cachedUser', JSON.stringify(data.user));
          localStorage.setItem('userCacheTime', Date.now().toString());
          
          // Get user tier/subscription status
          await fetchTierInBackground(token);
        } else {
          setIsAuthenticated(false);
          setUser(null);
          setUserTier("free");
          localStorage.removeItem('cachedUser');
          localStorage.removeItem('userCacheTime');
        }
      } else {
        // Session check failed, but if we have a valid token, keep user logged in with cached data
        if (cachedUser) {
          try {
            const userData = JSON.parse(cachedUser);
            setUser(userData);
            setIsAuthenticated(true);
            // Only log as debug - this is expected when backend is slow/sleeping
            logger.debug("Using cached user data due to session check failure");
          } catch (e) {
            setIsAuthenticated(false);
            setUser(null);
            setUserTier("free");
          }
        } else {
          setIsAuthenticated(false);
          setUser(null);
          setUserTier("free");
        }
      }
    } catch (error) {
      logger.error("Error checking auth status:", error);
      
      // Try to use cached data on error
      const cachedUser = localStorage.getItem('cachedUser');
      if (cachedUser) {
        try {
          const userData = JSON.parse(cachedUser);
          setUser(userData);
          setIsAuthenticated(true);
          logger.warn("Using cached user data due to error");
        } catch (e) {
          setIsAuthenticated(false);
          setUser(null);
          setUserTier("free");
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setUserTier("free");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchTierInBackground = async (token: string) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const tierResponse = await fetch((process.env.NEXT_PUBLIC_BACKEND_API_URL || process.env.BACKEND_API_URL || 'https://hope-backend-2.onrender.com') + '/payments/subscription/status', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (tierResponse.ok) {
        const tierData = await tierResponse.json();
        setUserTier(tierData.isPremium ? "premium" : "free");
      } else {
        setUserTier("free");
      }
    } catch (error) {
      logger.error("Error fetching user tier:", error);
      setUserTier("free");
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log("Session context: Starting login for email:", email);
      const response = await backendService.login(email, password);
      
      console.log("Session context: Login response:", response);
      
      if (response.success && response.data) {
        console.log("Session context: Login successful, setting user data");
        setUser(response.data.user);
        setIsAuthenticated(true);
        
        // Get user tier after login
        try {
          const tierResponse = await fetch((process.env.NEXT_PUBLIC_BACKEND_API_URL || process.env.BACKEND_API_URL || 'https://hope-backend-2.onrender.com') + '/payments/subscription/status', {
            headers: {
              'Authorization': `Bearer ${response.data.token}`,
            },
          });
          
          if (tierResponse.ok) {
            const tierData = await tierResponse.json();
            setUserTier(tierData.isPremium ? "premium" : "free");
          } else {
            setUserTier("free");
          }
        } catch (error) {
          logger.error("Error fetching user tier:", error);
          setUserTier("free");
        }
        
        // Add small delay to ensure state is updated
        await new Promise(resolve => setTimeout(resolve, 100));
        return true;
      }
      
      console.log("Session context: Login failed - response not successful or no data");
      // Log the specific error type for debugging
      if (response.isNetworkError) {
        console.log("Session context: Network error during login:", response.error);
      } else if (response.isAuthError) {
        console.log("Session context: Authentication error during login:", response.error);
      }
      return false;
    } catch (error) {
      console.error("Session context: Login error:", error);
      logger.error("Login error:", error);
      return false;
    }
  };

  const register = async (userData: { name: string; email: string; password: string }): Promise<boolean> => {
    try {
      const response = await backendService.register(userData);
      
      if (response.success && response.data) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        setUserTier("free");
        
        // Add small delay to ensure state is updated
        await new Promise(resolve => setTimeout(resolve, 100));
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error("Registration error:", error);
      return false;
    }
  };

  const logout = () => {
    backendService.logout();
    setUser(null);
    setIsAuthenticated(false);
    setUserTier("free");
  };

  const refreshUserTier = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      if (!token) return;

      const tierResponse = await fetch((process.env.NEXT_PUBLIC_BACKEND_API_URL || process.env.BACKEND_API_URL || 'https://hope-backend-2.onrender.com') + '/payments/subscription/status', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (tierResponse.ok) {
        const tierData = await tierResponse.json();
        if (tierData.success) {
          setUserTier(tierData.userTier || "free");
        }
      }
    } catch (error) {
      logger.error("Error refreshing user tier:", error);
    }
  };

  const refreshUser = async () => {
    await checkAuthStatus();
  };

  useEffect(() => {
    // Initialize backend wake-up to prevent cold starts
    const cleanup = initBackendWakeUp();
    
    // Check auth status
    checkAuthStatus();
    
    return cleanup;
  }, [checkAuthStatus]);

  const value: SessionContextType = {
    user,
    isAuthenticated,
    userTier,
    isLoading,
    loading: isLoading,
    checkSession: checkAuthStatus,
    login,
    register,
    logout,
    refreshUser,
    refreshUserTier,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
