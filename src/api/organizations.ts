import { apiClient } from './client';
import type { OrganizationEntity, UserAccount } from '../types';

export const organizationsApi = {
  async getByBin(bin: string): Promise<OrganizationEntity> {
    return apiClient.get<OrganizationEntity>(`/api/organizations/${encodeURIComponent(bin)}`);
  },

  async update(bin: string, data: Partial<OrganizationEntity>): Promise<OrganizationEntity> {
    return apiClient.put<OrganizationEntity>(`/api/organizations/${encodeURIComponent(bin)}`, data);
  },

  async getMembers(bin: string): Promise<UserAccount[]> {
    return apiClient.get<UserAccount[]>(`/api/organizations/${encodeURIComponent(bin)}/members`);
  },

  async inviteMember(bin: string, email: string, role: UserAccount['roleInOrg']): Promise<{ success: boolean }> {
    return apiClient.post<{ success: boolean }>(`/api/organizations/${encodeURIComponent(bin)}/members/invite`, {
      email,
      role,
    });
  },
};
