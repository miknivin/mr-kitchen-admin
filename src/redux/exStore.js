import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiNameApi = createApi({
  reducerPath: "apiNameApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/v1" }),
  endpoints: (builder) => ({
    endpointName1: builder.query({
      query: (params) => "/endpointName1",
    }),
    endpointName2: builder.query({
      query: (id) => `/endpointName2/{id}`,
    }),
    // Add more endpoints as needed
  }),
});

export const { useendpointName1Query, useendpointName2Query } = apiNameApi;
