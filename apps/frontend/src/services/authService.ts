import { apiClient } from '@/lib/apiClient'
import type { ApiResponse, AuthResponseData, User } from '@/types'

/**
 * Service handling authentication operations (registration, login, refresh, profile, logout).
 */
export const authService = {
  /**
   * Register a new account.
   *
   * @param data - User registration payload (name, email, password, password_confirmation).
   */
  async register(data: Record<string, string>): Promise<ApiResponse<AuthResponseData>> {
    const response = await apiClient.post<ApiResponse<AuthResponseData>>('/auth/register', data)
    return response.data
  },

  /**
   * Log into the application using email and password.
   *
   * @param credentials - Login credentials.
   */
  async login(credentials: { email: string; password: string }): Promise<ApiResponse<AuthResponseData>> {
    const response = await apiClient.post<ApiResponse<AuthResponseData>>('/auth/login', credentials)
    return response.data
  },

  /**
   * Invalidate current token and end the session.
   */
  async logout(): Promise<ApiResponse<null>> {
    const response = await apiClient.post<ApiResponse<null>>('/auth/logout')
    return response.data
  },

  /**
   * Fetch currently authenticated user profile.
   */
  async getProfile(): Promise<ApiResponse<User>> {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me')
    return response.data
  },

  /**
   * Refresh the active JWT session token.
   */
  async refreshToken(): Promise<ApiResponse<{ token: string; token_type: string; expires_in: number }>> {
    const response = await apiClient.post<ApiResponse<{ token: string; token_type: string; expires_in: number }>>('/auth/refresh')
    return response.data
  },
}
