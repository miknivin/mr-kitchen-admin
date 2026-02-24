import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const dashboardApi = createApi({
  reducerPath: "dashboardApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/" }),
  endpoints: (builder) => ({
    getStats: builder.query({
      query: () => `/dashboard/stats`,
    }),
  }),
});

export const {
  useGetStatsQuery,

} = dashboardApi;
