import { createContext, useState, useEffect, ReactNode } from "react";
import { User, AuthContextType } from "../../types/types";
import axios from "axios";

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

const API_BASE_URL = "http://localhost:5000";

// Token storage keys
const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  /**
   * Store tokens securely
   * Access token in sessionStorage (cleared when browser closes)
   * Refresh token in localStorage (persists across sessions)
   */
  const storeTokens = (accessToken: string, refreshToken: string) => {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  };

  /**
   * Get stored access token
   */
  const getAccessToken = (): string | null => {
    return sessionStorage.getItem(ACCESS_TOKEN_KEY);
  };
  /**
   * Get stored refresh token
   */
  const getRefreshToken = (): string | null => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  };

  /**
   * Clear all stored tokens
   */
  const clearTokens = () => {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  };

  /**
   * Refresh access token using refresh token
   */
  const refreshAccessToken = async (): Promise<string | null> => {
    try {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        return null;
      }

      const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
        refreshToken,
      });

      const { accessToken } = response.data as { accessToken: string };
      sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      return accessToken;
    } catch (error) {
      console.error("Token refresh failed:", error);
      clearTokens();
      setIsAuthenticated(false);
      setUser(null);
      return null;
    }
  };

  /**
   * Fetch current user data from API
   */
  const fetchUserData = async () => {
    try {
      const token = getAccessToken();
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUser(response.data as User);
      setIsAuthenticated(true);
    } catch (error: unknown) {
      // If 401, try to refresh token
      if (error.response?.status === 401) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          // Retry with new token
          try {
            const response = await axios.get(`${API_BASE_URL}/users/me`, {
              headers: {
                Authorization: `Bearer ${newToken}`,
              },
            });
            setUser(response.data as User);
            setIsAuthenticated(true);
          } catch (retryError: unknown) {
            console.error(
              "Failed to fetch user after token refresh:",
              retryError
            );
            clearTokens();
          }
        }
      } else {
        console.error("Failed to fetch user data:", error);
        clearTokens();
      }
    }
    setLoading(false);
  };

  /**
   * Initialize auth state on mount
   */
  useEffect(() => {
    fetchUserData();
  }, []);

  /**
   * Register new user
   */
  const register = async (email: string, password: string, name: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        email,
        name,
        password,
      });

      const {
        user: userData,
        accessToken,
        refreshToken,
      } = response.data as {
        user: User;
        accessToken: string;
        refreshToken: string;
      };

      storeTokens(accessToken, refreshToken);
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error: unknown) {
      console.error("Registration failed:", error);
      let message = "Registration failed";
      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error
      ) {
        const errResp = (error as any).response;
        message = errResp?.data?.message || errResp?.data?.error || message;
      }
      throw new Error(message);
    }
  };

  /**
   * Login user
   */
  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      });

      const {
        user: userData,
        accessToken,
        refreshToken,
      } = response.data as {
        user: User;
        accessToken: string;
        refreshToken: string;
      };

      storeTokens(accessToken, refreshToken);
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error: unknown) {
      console.error("Login failed:", error);
      let message = "Login failed";
      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error
      ) {
        const errResp = (error as any).response;
        message = errResp?.data?.message || errResp?.data?.error || message;
      }
      throw new Error(message);
    }
  };

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      const token = getAccessToken();
      if (token) {
        await axios.post(
          `${API_BASE_URL}/auth/logout`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      clearTokens();
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  /**
   * Update user data (for food/glucose entries)
   */
  const updateUserData = (updatedUser: User) => {
    setUser(updatedUser);
  };

  /**
   * Get user data by email (legacy compatibility - not used with new auth)
   */
  const getUserData = (email: string): User | null => {
    // This is now handled by the API
    return user && user.email === email ? user : null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        logout,
        register,
        updateUserData,
        setUser,
        getUserData,
        getAccessToken,
        refreshAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
