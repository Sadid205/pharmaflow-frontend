import { baseApi, ApiResponse } from './baseApi';

export interface SalePayment {
  id: string;
  saleId: string;
  amount: number | string;
  paymentMethod: 'CASH' | 'CARD' | 'BKASH' | 'NAGAD' | 'OTHER';
  note?: string;
  createdAt: string;
}

export interface SaleItem {
  id?: string;
  medicineId: string;
  quantity: number;
  unitPrice: number;
  totalPrice?: number;
  medicine?: {
    id: string;
    name: string;
    genericName?: string;
    category?: string;
  };
}

export interface SaleRecord {
  id: string;
  invoiceNumber: string;
  customerName?: string;
  customerPhone?: string;
  subTotal: number | string;
  discount: number | string;
  tax: number | string;
  totalAmount: number | string;
  paidAmount: number | string;
  dueAmount: number | string;
  changeAmount: number | string;
  paymentMethod: 'CASH' | 'CARD' | 'BKASH' | 'NAGAD' | 'OTHER';
  paymentStatus: 'PAID' | 'PARTIAL' | 'DUE';
  items: SaleItem[];
  payments?: SalePayment[];
  pharmacy?: {
    id: string;
    name: string;
    address?: string;
    phone?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateSaleRequest {
  customerName?: string;
  customerPhone?: string;
  items: {
    medicineId: string;
    quantity: number;
    unitPrice: number;
  }[];
  discount?: number;
  discountPercent?: number;
  tax?: number;
  taxPercent?: number;
  paidAmount?: number;
  paymentMethod?: 'CASH' | 'CARD' | 'BKASH' | 'NAGAD' | 'OTHER';
}

export interface CollectDueRequest {
  saleId: string;
  amount: number;
  paymentMethod?: 'CASH' | 'CARD' | 'BKASH' | 'NAGAD' | 'OTHER';
  note?: string;
}

export interface QuerySalesParams {
  search?: string;
  paymentMethod?: 'CASH' | 'CARD' | 'BKASH' | 'NAGAD' | 'OTHER';
  paymentStatus?: 'PAID' | 'PARTIAL' | 'DUE';
  startDate?: string;
  endDate?: string;
  page?: number | string;
  limit?: number | string;
  pharmacyId?: string;
}

export interface TodaySalesSummary {
  todayDate: string;
  totalSalesCount: number;
  totalRevenue: number;
  totalPaidRevenue: number;
  totalDueAmount: number;
  dueSalesCount: number;
  totalSubTotal: number;
  totalDiscount: number;
  paymentBreakdown: {
    paymentMethod: string;
    count: number;
    amount: number;
    paidAmount?: number;
  }[];
  recentSales: {
    id: string;
    invoiceNumber: string;
    customerName?: string;
    totalAmount: number | string;
    paidAmount?: number | string;
    dueAmount?: number | string;
    paymentStatus?: string;
    paymentMethod: string;
    createdAt: string;
  }[];
}

export const salesApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getSales: builder.query<ApiResponse<SaleRecord[]>, QuerySalesParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.search) queryParams.append('search', params.search);
        if (params?.paymentMethod) queryParams.append('paymentMethod', params.paymentMethod);
        if (params?.paymentStatus) queryParams.append('paymentStatus', params.paymentStatus);
        if (params?.startDate) queryParams.append('startDate', params.startDate);
        if (params?.endDate) queryParams.append('endDate', params.endDate);
        if (params?.page) queryParams.append('page', String(params.page));
        if (params?.limit) queryParams.append('limit', String(params.limit));
        if (params?.pharmacyId) queryParams.append('pharmacyId', params.pharmacyId);

        const qs = queryParams.toString();
        return qs ? `/sales?${qs}` : '/sales';
      },
      providesTags: ['Sales'],
    }),

    getTodaySummary: builder.query<ApiResponse<TodaySalesSummary>, string | void>({
      query: (pharmacyId) => {
        return pharmacyId ? `/sales/today-summary?pharmacyId=${pharmacyId}` : '/sales/today-summary';
      },
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

    collectDue: builder.mutation<
      ApiResponse<{ sale: SaleRecord; payment: SalePayment }>,
      CollectDueRequest
    >({
      query: ({ saleId, ...body }) => ({
        url: `/sales/${saleId}/collect-due`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Sales', 'Dashboard'],
    }),

    getSaleById: builder.query<ApiResponse<SaleRecord>, string>({
      query: (id) => `/sales/${id}`,
      providesTags: (result, error, id) => [{ type: 'Sales', id }],
    }),
  }),
});

export const {
  useGetSalesQuery,
  useGetTodaySummaryQuery,
  useCreateSaleMutation,
  useCollectDueMutation,
  useGetSaleByIdQuery,
} = salesApi;
