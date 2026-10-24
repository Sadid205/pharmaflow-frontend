import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import Cookies from 'js-cookie';
import type { RootState } from '../store';

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as RootState;
      let token = state.auth?.accessToken;

      // Fallback to Cookies or localStorage if Redux state is empty (e.g. on page refresh)
      if (!token && typeof window !== 'undefined') {
        token = Cookies.get('accessToken') || localStorage.getItem('accessToken') || null;
      }

      if (token) {
        const cleanToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
        headers.set('Authorization', cleanToken);
      }
      return headers;
    },
  }),
  tagTypes: ['Pharmacy', 'Medicines', 'Dashboard', 'User', 'Categories', 'Suppliers', 'Sales'],
  endpoints: () => ({}),
});
