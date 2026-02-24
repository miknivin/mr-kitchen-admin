// src/redux/api/enquiryApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const enquiryApi = createApi({
  reducerPath: "enquiryApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
  }),
  tagTypes: ["Enquiries"],
  endpoints: (builder) => ({
    getEnquiries: builder.query({
      query: () => "/enquiries",
      providesTags: ["Enquiries"],
      transformResponse: (response) => {
        return { enquiries: response.data }; 
      },
    }),
    deleteEnquiry: builder.mutation({
      query: (id) => ({
        url: `/enquiries/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Enquiries"],
    }),
  }),
});

export const { useGetEnquiriesQuery, useDeleteEnquiryMutation } = enquiryApi;
