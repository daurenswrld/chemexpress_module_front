import { apiClient } from './client';
import type { Order, OrderType, ClientEntity, OrderItem } from '../types';

export interface CreateOrderPayload {
  type: OrderType;
  client: ClientEntity;
  items: OrderItem[];
  clientMessage?: string;
  validDays?: number;
  vatMode?: 'none' | 'vat16';
  organizationBin?: string;
  createdById?: string;
}

export const ordersApi = {
  async getAll(organizationBin?: string): Promise<Order[]> {
    const query = organizationBin ? `?organization_bin=${encodeURIComponent(organizationBin)}` : '';
    return apiClient.get<Order[]>(`/api/orders${query}`);
  },

  async getById(orderId: string): Promise<Order> {
    return apiClient.get<Order>(`/api/orders/${orderId}`);
  },

  async create(payload: CreateOrderPayload): Promise<Order> {
    return apiClient.post<Order>('/api/orders', payload);
  },

  async updateStatus(orderId: string, status: Order['status']): Promise<Order> {
    return apiClient.patch<Order>(`/api/orders/${orderId}/status`, { status });
  },

  async toggleConfirmation(orderId: string, confirmed: boolean, comment?: string): Promise<Order> {
    return apiClient.patch<Order>(`/api/orders/${orderId}/confirm`, { confirmed, comment });
  },
};
