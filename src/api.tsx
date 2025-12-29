import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const API_BASE_URL = "http://localhost:5000";

// Token storage keys
const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

/**
 * Get access token from storage
 */
const getAccessToken = (): string | null => {
  return sessionStorage.getItem(ACCESS_TOKEN_KEY);
};

/**
 * Get refresh token from storage
 */
const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

/**
 * Store new access token
 */
const setAccessToken = (token: string): void => {
  sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
};

/**
 * Clear all tokens
 */
const clearTokens = (): void => {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

/**
 * Create axios instance with interceptors
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request interceptor - Automatically attach JWT token to all requests
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - Handle token refresh on 401 errors
 */
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (
  error: AxiosError | null,
  token: string | null = null
) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // If error is 401 and we haven't retried yet, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        clearTokens();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        // Attempt to refresh the token
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken } = response.data;
        setAccessToken(accessToken);

        // Update authorization header and retry original request
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        processQueue(null, accessToken);
        isRefreshing = false;

        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as AxiosError, null);
        isRefreshing = false;
        clearTokens();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

/**
 * API Request Methods
 */

// Get current user's profile
const getCurrentUser = async () => {
  const response = await apiClient.get("/users/me");
  return response.data;
};

// Update current user's profile
const updateCurrentUser = async (data: { name?: string; email?: string }) => {
  const response = await apiClient.patch("/users/me", data);
  return response.data;
};

// Delete current user's account
const deleteCurrentUser = async () => {
  await apiClient.delete("/users/me");
};

// Glucose Entries
const getGlucoseEntries = async () => {
  const response = await apiClient.get("/glucose-entries");
  return response.data;
};

const createGlucoseEntry = async (glucose: number) => {
  const response = await apiClient.post("/glucose-entries", { glucose });
  return response.data;
};

const deleteGlucoseEntry = async (id: number) => {
  await apiClient.delete(`/glucose-entries/${id}`);
};

// Food Entries
const getFoodEntries = async () => {
  const response = await apiClient.get("/food-entries");
  return response.data;
};

const createFoodEntry = async (data: {
  food: string;
  carb: number;
  favorite?: boolean;
  category?: string;
  weight?: string;
  weightUnit?: string;
  timestamp?: string;
}) => {
  const response = await apiClient.post("/food-entries", data);
  return response.data;
};

const updateFoodEntry = async (
  id: number,
  data: {
    food?: string;
    carb?: number;
    favorite?: boolean;
    category?: string;
    weight?: string;
    weightUnit?: string;
    timestamp?: string;
  }
) => {
  const response = await apiClient.patch(`/food-entries/${id}`, data);
  return response.data;
};

const deleteFoodEntry = async (id: number) => {
  await apiClient.delete(`/food-entries/${id}`);
};

// Mood Entry APIs
const getMoodEntries = async () => {
  const response = await apiClient.get("/mood-entries");
  return response.data;
};

const createMoodEntry = async (data: {
  mood: string;
  hoursWorkedOut: number;
  notes?: string;
}) => {
  const response = await apiClient.post("/mood-entries", data);
  return response.data;
};

const deleteMoodEntry = async (id: number) => {
  await apiClient.delete(`/mood-entries/${id}`);
};

// Anonymous User Data for Comparison
const getAnonymousUserList = async () => {
  const response = await apiClient.get("/users/anonymous/list");
  return response.data;
};

const getAnonymousUserByIndex = async (index: number) => {
  const response = await apiClient.get(`/users/anonymous/${index}`);
  return response.data;
};

export const Requests = {
  getCurrentUser,
  updateCurrentUser,
  deleteCurrentUser,
  getGlucoseEntries,
  createGlucoseEntry,
  deleteGlucoseEntry,
  getFoodEntries,
  createFoodEntry,
  updateFoodEntry,
  deleteFoodEntry,
  getMoodEntries,
  createMoodEntry,
  deleteMoodEntry,
  getAnonymousUserList,
  getAnonymousUserByIndex,
};
