import { baseApi, ApiResponse } from './baseApi';

export interface Medicine {
  id: string;
  name: string;
  genericName?: string;
  category: string;
  buyingPrice: number | string;
  sellingPrice: number | string;
  stock: number;
  mfgDate?: string;
  expDate: string;
  batchNumber?: string;
  dosage?: string;
  manufacturer?: string;
  pharmacyId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMedicineRequest {
  name: string;
  genericName?: string;
  category: string;
  buyingPrice: number;
  sellingPrice: number;
  stock: number;
  mfgDate?: string;
  expDate: string;
  batchNumber?: string;
  dosage?: string;
  manufacturer?: string;
}

export interface UpdateMedicineRequest extends Partial<CreateMedicineRequest> {
  id: string;
}

export interface MedicineQueryParams {
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
}

export interface LowStockQueryParams {
  threshold?: number;
  page?: number;
  limit?: number;
}

export interface ExpiringSoonQueryParams {
  days?: number;
  page?: number;
  limit?: number;
}

export const medicineApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMedicines: builder.query<ApiResponse<Medicine[]>, MedicineQueryParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.search) queryParams.set('search', params.search);
        if (params?.category && params.category !== 'ALL') {
          queryParams.set('category', params.category);
        }
        if (params?.page) queryParams.set('page', params.page.toString());
        if (params?.limit) queryParams.set('limit', params.limit.toString());
        const qs = queryParams.toString();
        return `/medicines${qs ? `?${qs}` : ''}`;
      },
      providesTags: ['Medicines'],
    }),

    getLowStockMedicines: builder.query<ApiResponse<Medicine[]>, number | LowStockQueryParams | void>({
      query: (arg) => {
        const params = typeof arg === 'number' ? { threshold: arg } : arg || {};
        const queryParams = new URLSearchParams();
        if (params.threshold !== undefined) queryParams.set('threshold', params.threshold.toString());
        if (params.page !== undefined) queryParams.set('page', params.page.toString());
        if (params.limit !== undefined) queryParams.set('limit', params.limit.toString());
        const qs = queryParams.toString();
        return `/medicines/low-stock${qs ? `?${qs}` : ''}`;
      },
      providesTags: ['Medicines'],
    }),

    getExpiringSoonMedicines: builder.query<ApiResponse<Medicine[]>, number | ExpiringSoonQueryParams | void>({
      query: (arg) => {
        const params = typeof arg === 'number' ? { days: arg } : arg || {};
        const queryParams = new URLSearchParams();
        if (params.days !== undefined) queryParams.set('days', params.days.toString());
        if (params.page !== undefined) queryParams.set('page', params.page.toString());
        if (params.limit !== undefined) queryParams.set('limit', params.limit.toString());
        const qs = queryParams.toString();
        return `/medicines/expiring-soon${qs ? `?${qs}` : ''}`;
      },
      providesTags: ['Medicines'],
    }),

    getSingleMedicine: builder.query<ApiResponse<Medicine>, string>({
      query: (id) => `/medicines/${id}`,
      providesTags: (result, error, id) => [{ type: 'Medicines', id }],
    }),

    createMedicine: builder.mutation<ApiResponse<Medicine>, CreateMedicineRequest>({
      query: (body) => ({
        url: '/medicines',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Medicines', 'Categories', 'Dashboard', 'Pharmacy'],
    }),

    updateMedicine: builder.mutation<ApiResponse<Medicine>, UpdateMedicineRequest>({
      query: ({ id, ...body }) => ({
        url: `/medicines/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Medicines', id },
        'Medicines',
        'Dashboard',
        'Pharmacy',
      ],
    }),

    getMedicineCategories: builder.query<ApiResponse<string[]>, void>({
      query: () => '/medicines/categories',
      providesTags: ['Categories', 'Medicines'],
    }),

    deleteMedicine: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/medicines/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Medicines', 'Categories', 'Dashboard', 'Pharmacy'],
    }),
  }),
});

export const {
  useGetMedicinesQuery,
  useGetLowStockMedicinesQuery,
  useGetExpiringSoonMedicinesQuery,
  useGetSingleMedicineQuery,
  useGetMedicineCategoriesQuery,
  useCreateMedicineMutation,
  useUpdateMedicineMutation,
  useDeleteMedicineMutation,
} = medicineApi;
