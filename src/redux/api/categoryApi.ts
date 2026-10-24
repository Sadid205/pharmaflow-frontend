import { baseApi, ApiResponse } from './baseApi';

export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  _count?: {
    medicines: number;
  };
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
}

export const categoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<ApiResponse<Category[]>, void>({
      query: () => '/categories',
      providesTags: ['Categories'],
    }),

    createCategory: builder.mutation<ApiResponse<Category>, CreateCategoryRequest>({
      query: (body) => ({
        url: '/categories',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Categories', 'Medicines'],
    }),

    updateCategory: builder.mutation<ApiResponse<Category>, { id: string; name: string; description?: string }>({
      query: ({ id, ...body }) => ({
        url: `/categories/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Categories', 'Medicines'],
    }),

    deleteCategory: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Categories', 'Medicines'],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApi;
