// src/redux/api/couponApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const couponApi = createApi({
  reducerPath: 'couponApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
          headers.set('authorization', `Bearer ${token}`);
        }
      }
      return headers;
    },
  }),
  tagTypes: ['Coupons'],
  endpoints: (builder) => ({
    getCoupons: builder.query({
      query: () => '/coupons',
      providesTags: ['Coupons'],
      transformResponse: (res) => ({ coupons: res.coupons }),
    }),
    createCoupon: builder.mutation({
      query: (data) => ({
        url: '/coupons',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Coupons'],
    }),
    updateCoupon: builder.mutation({
      query: ({ id, data }) => ({
        url: `/coupons/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Coupons'],
    }),
    deleteCoupon: builder.mutation({
      query: (id) => ({
        url: `/coupons/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Coupons'],
    }),
  }),
});

export const {
  useGetCouponsQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
} = couponApi;