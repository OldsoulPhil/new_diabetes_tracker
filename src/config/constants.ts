// Environment configuration with fallbacks
export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
  environment: import.meta.env.MODE || "development",
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
} as const;

// Token storage keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
} as const;

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    ME: "/users/me",
  },
  USERS: {
    ME: "/users/me",
    ANONYMOUS_LIST: "/users/anonymous/list",
    ANONYMOUS_BY_INDEX: (index: number) => `/users/anonymous/${index}`,
  },
  GLUCOSE: {
    LIST: "/glucose-entries",
    DELETE: (id: number) => `/glucose-entries/${id}`,
  },
  FOOD: {
    LIST: "/food-entries",
    CREATE: "/food-entries",
    UPDATE: (id: number) => `/food-entries/${id}`,
    DELETE: (id: number) => `/food-entries/${id}`,
  },
} as const;
