import { baseApi, ApiResponse } from './baseApi';

export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  phone: string;
  ownerId?: string;
  createdAt?: string;
  updatedAt?: string;
  owner?: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
  };
  _count?: {
    medicines: number;
  };
}

export interface CreatePharmacyRequest {
  name: string;
  address: string;
  phone: string;
}

export interface UpdatePharmacyRequest {
  name?: string;
  address?: string;
  phone?: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'PHARMACY_OWNER';
  isVerified: boolean;
  isBlocked: boolean;
  createdAt?: string;
  pharmacy?: {
    id: string;
    name: string;
  } | null;
}

export interface PharmacyMedicine {
  id: string;
  name: string;
  genericName?: string | null;
  category?: string | null;
  buyingPrice: number | string;
  sellingPrice: number | string;
  stock: number;
  mfgDate?: string | null;
  expDate: string;
  pharmacyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PharmacyDetailsWithMedicines extends Omit<Pharmacy, 'owner'> {
  owner?: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    role?: 'SUPER_ADMIN' | 'PHARMACY_OWNER';
    isVerified?: boolean;
    isBlocked?: boolean;
    createdAt?: string;
  };
  medicines: PharmacyMedicine[];
  metrics?: {
    totalMedicines: number;
    totalStockUnits: number;
    lowStockCount: number;
    expiringSoonCount: number;
    totalCostValue: number;
    totalSalesValue: number;
    potentialProfit: number;
  };
}

export const pharmacyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyPharmacy: builder.query<ApiResponse<Pharmacy>, void>({
      query: () => '/pharmacy/my',
      providesTags: ['Pharmacy'],
    }),

    createPharmacy: builder.mutation<ApiResponse<Pharmacy>, CreatePharmacyRequest>({
      query: (body) => ({
        url: '/pharmacy',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Pharmacy', 'Dashboard'],
    }),

    updateMyPharmacy: builder.mutation<ApiResponse<Pharmacy>, UpdatePharmacyRequest>({
      query: (body) => ({
        url: '/pharmacy/my',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Pharmacy', 'Dashboard'],
    }),

    getAllPharmacies: builder.query<ApiResponse<Pharmacy[]>, { page?: number; limit?: number; search?: string } | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.set('page', params.page.toString());
        if (params?.limit) queryParams.set('limit', params.limit.toString());
        if (params?.search) queryParams.set('search', params.search);
        const qs = queryParams.toString();
        return `/pharmacy${qs ? `?${qs}` : ''}`;
      },
      providesTags: ['Pharmacy'],
    }),

    // Admin Users Management
    getAllUsers: builder.query<ApiResponse<AdminUser[]>, void>({
      query: () => '/users',
      providesTags: ['User'],
    }),

    toggleUserBlockStatus: builder.mutation<ApiResponse<AdminUser>, { userId: string; isBlocked: boolean }>({
      query: ({ userId, isBlocked }) => ({
        url: `/users/${userId}/block`,
        method: 'PATCH',
        body: { isBlocked },
      }),
      invalidatesTags: ['User', 'Dashboard'],
    }),

    getPharmacyDetailsById: builder.query<ApiResponse<PharmacyDetailsWithMedicines>, string>({
      query: (id) => `/pharmacy/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Pharmacy', id }, 'Medicines'],
    }),
  }),
});

export const {
  useGetMyPharmacyQuery,
  useCreatePharmacyMutation,
  useUpdateMyPharmacyMutation,
  useGetAllPharmaciesQuery,
  useGetPharmacyDetailsByIdQuery,
  useGetAllUsersQuery,
  useToggleUserBlockStatusMutation,
} = pharmacyApi;
