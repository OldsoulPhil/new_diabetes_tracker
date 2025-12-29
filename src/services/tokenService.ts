import { STORAGE_KEYS } from "../config/constants";

/**
 * Token storage service - Single source of truth for token management
 */
export class TokenService {
  /**
   * Store both tokens
   */
  static setTokens(accessToken: string, refreshToken: string): void {
    sessionStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  }

  /**
   * Get access token
   */
  static getAccessToken(): string | null {
    return sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  /**
   * Get refresh token
   */
  static getRefreshToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  /**
   * Set new access token (after refresh)
   */
  static setAccessToken(token: string): void {
    sessionStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  }

  /**
   * Clear all tokens
   */
  static clearTokens(): void {
    sessionStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  /**
   * Check if tokens exist
   */
  static hasTokens(): boolean {
    return !!this.getAccessToken() || !!this.getRefreshToken();
  }
}
