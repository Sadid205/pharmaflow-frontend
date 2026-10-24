import { baseApi, ApiResponse } from './baseApi';

export interface AdminDashboardData {
  role: 'SUPER_ADMIN';
  totalUsers: number;
  activeUsers: number;
  blockedUsers: number;
  totalPharmacies: number;
  totalMedicinesCount: number;
}

export interface PharmacyDashboardData {
  role: 'PHARMACY_OWNER';
  totalMedicines: number;
  totalStockUnits: number;
  lowStockCount: number;
  expiringSoonCount: number;
  inventoryValuation: {
    totalCostValue: number;
    totalSalesValue: number;
    potentialProfit: number;
  };
}

export type DashboardStatsData = AdminDashboardData | PharmacyDashboardData;

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query<ApiResponse<DashboardStatsData>, void>({
      query: () => '/dashboard/stats',
      providesTags: ['Dashboard'],
    }),
  }),
});

export const { useGetDashboardStatsQuery } = dashboardApi;
