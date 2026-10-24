import { baseApi, ApiResponse } from './baseApi';

export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone: string;
  address?: string;
  createdAt?: string;
}

export interface CreateSupplierRequest {
  name: string;
  contactPerson?: string;
  email?: string;
  phone: string;
  address?: string;
}

export const supplierApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSuppliers: builder.query<ApiResponse<Supplier[]>, void>({
      query: () => '/suppliers',
      providesTags: ['Suppliers'],
    }),

    createSupplier: builder.mutation<ApiResponse<Supplier>, CreateSupplierRequest>({
      query: (body) => ({
        url: '/suppliers',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Suppliers'],
    }),

    updateSupplier: builder.mutation<ApiResponse<Supplier>, { id: string } & Partial<CreateSupplierRequest>>({
      query: ({ id, ...body }) => ({
        url: `/suppliers/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Suppliers'],
    }),

    deleteSupplier: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/suppliers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Suppliers'],
    }),
  }),
});

export const {
  useGetSuppliersQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
} = supplierApi;
