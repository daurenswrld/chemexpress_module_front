import { apiClient } from './client';
import type { UserAccount, OrganizationEntity, RegisterUserData } from '../types';

export interface AuthResponse {
  user: UserAccount;
  organization: OrganizationEntity;
  token?: string;
}

export const authApi = {
  async login(email: string, password?: string): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/api/auth/login', { email, password });
  },

  async register(data: RegisterUserData): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/api/auth/register', data);
  },

  async getMe(): Promise<AuthResponse> {
    return apiClient.get<AuthResponse>('/api/auth/me');
  },

  async logout(): Promise<{ success: boolean }> {
    try {
      return await apiClient.post<{ success: boolean }>('/api/auth/logout');
    } finally {
      apiClient.setToken(null);
    }
  },
};
