import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApiUrl, clearAuthCache, invalidateAllQueries } from "@/lib/query-client";

const SESSION_KEY = "novafit_session_id";

interface User {
  id: number;
  email: string;
  name: string;
  avatar: string;
  units: string;
}

interface UserGoals {
  dailyCalories: number;
  dailyProtein: number;
  dailyCarbs: number;
  dailyFats: number;
  weeklyWorkouts: number;
  targetWeight: number;
}

interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: User | null;
  goals: UserGoals | null;
  sessionId: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Pick<User, "name" | "avatar" | "units">>) => Promise<boolean>;
  updateGoals: (updates: Partial<UserGoals>) => Promise<boolean>;
  refreshUser: () => Promise<void>;
}

const defaultAuthContext: AuthContextType = {
  isLoading: true,
  isAuthenticated: false,
  user: null,
  goals: null,
  sessionId: null,
  login: async () => ({ success: false, error: "Not initialized" }),
  register: async () => ({ success: false, error: "Not initialized" }),
  logout: async () => {},
  updateProfile: async () => false,
  updateGoals: async () => false,
  refreshUser: async () => {},
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

async function authFetch(endpoint: string, options: RequestInit = {}, sessionId?: string | null) {
  const baseUrl = getApiUrl();
  const url = new URL(endpoint, baseUrl);
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };
  
  if (sessionId) {
    headers["Authorization"] = `Bearer ${sessionId}`;
  }
  
  const res = await fetch(url.toString(), {
    ...options,
    headers,
  });
  
  return res;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isLoading: true,
    isAuthenticated: false,
    user: null,
    goals: null,
    sessionId: null,
  });

  const checkSession = useCallback(async () => {
    try {
      const savedSessionId = await AsyncStorage.getItem(SESSION_KEY);
      if (!savedSessionId) {
        setState({
          isLoading: false,
          isAuthenticated: false,
          user: null,
          goals: null,
          sessionId: null,
        });
        return;
      }

      const res = await authFetch("/api/auth/me", { method: "GET" }, savedSessionId);
      
      if (res.ok) {
        const data = await res.json();
        setState({
          isLoading: false,
          isAuthenticated: true,
          user: data.user,
          goals: data.goals,
          sessionId: savedSessionId,
        });
      } else {
        await AsyncStorage.removeItem(SESSION_KEY);
        setState({
          isLoading: false,
          isAuthenticated: false,
          user: null,
          goals: null,
          sessionId: null,
        });
      }
    } catch (error) {
      console.error("Session check error:", error);
      setState({
        isLoading: false,
        isAuthenticated: false,
        user: null,
        goals: null,
        sessionId: null,
      });
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await authFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        await AsyncStorage.setItem(SESSION_KEY, data.sessionId);
        setState({
          isLoading: false,
          isAuthenticated: true,
          user: data.user,
          goals: data.goals,
          sessionId: data.sessionId,
        });
        invalidateAllQueries();
        return { success: true };
      } else {
        const error = await res.json();
        return { success: false, error: error.error || "Login failed" };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Connection error. Please try again." };
    }
  }, []);

  const register = useCallback(async (email: string, password: string, name: string) => {
    try {
      const res = await authFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password, name }),
      });

      if (res.ok) {
        const data = await res.json();
        await AsyncStorage.setItem(SESSION_KEY, data.sessionId);
        setState({
          isLoading: false,
          isAuthenticated: true,
          user: data.user,
          goals: null,
          sessionId: data.sessionId,
        });
        return { success: true };
      } else {
        const error = await res.json();
        return { success: false, error: error.error || "Registration failed" };
      }
    } catch (error) {
      console.error("Register error:", error);
      return { success: false, error: "Connection error. Please try again." };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      if (state.sessionId) {
        await authFetch("/api/auth/logout", { method: "POST" }, state.sessionId);
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      await AsyncStorage.removeItem(SESSION_KEY);
      clearAuthCache();
      setState({
        isLoading: false,
        isAuthenticated: false,
        user: null,
        goals: null,
        sessionId: null,
      });
    }
  }, [state.sessionId]);

  const updateProfile = useCallback(async (updates: Partial<Pick<User, "name" | "avatar" | "units">>) => {
    try {
      const res = await authFetch("/api/auth/profile", {
        method: "PATCH",
        body: JSON.stringify(updates),
      }, state.sessionId);

      if (res.ok) {
        const data = await res.json();
        setState(prev => ({
          ...prev,
          user: data.user,
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Update profile error:", error);
      return false;
    }
  }, [state.sessionId]);

  const updateGoals = useCallback(async (updates: Partial<UserGoals>) => {
    try {
      const res = await authFetch("/api/auth/goals", {
        method: "PATCH",
        body: JSON.stringify(updates),
      }, state.sessionId);

      if (res.ok) {
        const data = await res.json();
        setState(prev => ({
          ...prev,
          goals: data.goals,
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Update goals error:", error);
      return false;
    }
  }, [state.sessionId]);

  const refreshUser = useCallback(async () => {
    await checkSession();
  }, [checkSession]);

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    updateGoals,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
