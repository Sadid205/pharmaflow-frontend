import { baseApi, ApiResponse } from './baseApi';

export interface SaleItem {
  medicineId: string;
  medicineName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface SaleRecord {
  id: string;
  invoiceNumber: string;
  customerName?: string;
  customerPhone?: string;
  totalAmount: number;
  discount: number;
  tax: number;
  finalAmount: number;
  paymentMethod: 'CASH' | 'CARD' | 'BKASH' | 'NAGAD';
  items: SaleItem[];
  createdAt: string;
}

export interface CreateSaleRequest {
  customerName?: string;
  customerPhone?: string;
  items: {
    medicineId: string;
    quantity: number;
    unitPrice: number;
  }[];
  discountPercent?: number;
  taxPercent?: number;
  paymentMethod: 'CASH' | 'CARD' | 'BKASH' | 'NAGAD';
}

export const salesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSales: builder.query<ApiResponse<SaleRecord[]>, void>({
      query: () => '/sales',
      providesTags: ['Sales'],
    }),

    createSale: builder.mutation<ApiResponse<SaleRecord>, CreateSaleRequest>({
      query: (body) => ({
        url: '/sales',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Sales', 'Medicines', 'Dashboard', 'Pharmacy'],
    }),

    getSaleById: builder.query<ApiResponse<SaleRecord>, string>({
      query: (id) => `/sales/${id}`,
      providesTags: (result, error, id) => [{ type: 'Sales', id }],
    }),
  }),
});

export const {
  useGetSalesQuery,
  useCreateSaleMutation,
  useGetSaleByIdQuery,
} = salesApi;
