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
        const qs = queryParams.toString();
        return `/medicines${qs ? `?${qs}` : ''}`;
      },
      providesTags: ['Medicines'],
    }),

    getLowStockMedicines: builder.query<ApiResponse<Medicine[]>, number | void>({
      query: (threshold = 10) => `/medicines/low-stock?threshold=${threshold}`,
      providesTags: ['Medicines'],
    }),

    getExpiringSoonMedicines: builder.query<ApiResponse<Medicine[]>, number | void>({
      query: (days = 30) => `/medicines/expiring-soon?days=${days}`,
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
      invalidatesTags: ['Medicines', 'Dashboard', 'Pharmacy'],
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

    deleteMedicine: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/medicines/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Medicines', 'Dashboard', 'Pharmacy'],
    }),
  }),
});

export const {
  useGetMedicinesQuery,
  useGetLowStockMedicinesQuery,
  useGetExpiringSoonMedicinesQuery,
  useGetSingleMedicineQuery,
  useCreateMedicineMutation,
  useUpdateMedicineMutation,
  useDeleteMedicineMutation,
} = medicineApi;
