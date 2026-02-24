import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const orderApi = createApi({
  reducerPath: "orderApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
  }),
  tagTypes: ["Order", "AdminOrders", "Coupons", "SessionStartedOrder"], // ✅ Added SessionStartedOrder
  endpoints: (builder) => ({
    createNewOrder: builder.query({
      query(body) {
        return {
          url: "/order/new",
          method: "POST",
          body,
        };
      },
    }),
    myOrders: builder.query({
      query: () => `/me/orders`,
    }),
    orderDetails: builder.query({
      query: (id) => `/orders/${id}`,
      providesTags: ["Order"],
    }),
    stripeCheckoutSession: builder.mutation({
      query(body) {
        return {
          url: "/payment/checkout_session",
          method: "POST",
          body,
        };
      },
    }),
    getAdminOrders: builder.query({
      query: (filterOptions) => {
        const params = new URLSearchParams();
        if (filterOptions) {
          if (filterOptions.status)
            params.append("status", filterOptions.status);
          if (filterOptions.paymentMethod)
            params.append("paymentMethod", filterOptions.paymentMethod);
          if (filterOptions.startDate)
            params.append("startDate", filterOptions.startDate);
          if (filterOptions.endDate)
            params.append("endDate", filterOptions.endDate);
          if (filterOptions.userId)
            params.append("userId", filterOptions.userId);
          if (filterOptions.search)
            params.append("search", filterOptions.search);
          if (filterOptions.minTotal)
            params.append("minTotal", filterOptions.minTotal.toString());
          if (filterOptions.maxTotal)
            params.append("maxTotal", filterOptions.maxTotal.toString());
          if (filterOptions.hasWaybill !== undefined)
            params.append("hasWaybill", filterOptions.hasWaybill.toString());
        }
        return {
          url: `/orders/admin/getAllOrders?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["AdminOrders"],
    }),
    updateOrder: builder.mutation({
      query({ id, body }) {
        return {
          url: `orders/updateOrder/${id}`,
          method: "PATCH",
          body,
        };
      },
      invalidatesTags: ["Order"],
    }),
    deleteOrder: builder.mutation({
      query(id) {
        return {
          url: `/orders/delete/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["AdminOrders"],
    }),
    createCoupon: builder.mutation({
      query(body) {
        return {
          url: "/admin/coupon/new",
          method: "POST",
          body,
        };
      },
      invalidatesTags: ["Coupons"],
    }),
    getCoupons: builder.query({
      query: () => "/admin/coupons",
      providesTags: ["Coupons"],
    }),
    updateCoupon: builder.mutation({
      query({ id, body }) {
        return {
          url: `/admin/coupon/update/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["Coupons"],
    }),
    deleteCoupon: builder.mutation({
      query(id) {
        return {
          url: `/admin/coupon/delete/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["Coupons"],
    }),
    checkCoupon: builder.mutation({
      query(body) {
        return {
          url: "/coupon/check",
          method: "POST",
          body,
        };
      },
      invalidatesTags: ["Coupons"],
    }),
    applyCoupon: builder.mutation({
      query(body) {
        return {
          url: "/coupon/apply",
          method: "POST",
          body,
        };
      },
      invalidatesTags: ["Coupons"],
    }),
    sessionStartedOrders: builder.query({
      query: () => "/orders/session-started",
      providesTags: ["SessionStartedOrder"],
    }),
    searchSessionStartedOrders: builder.query({
      query: ({ keyword }) =>
        `/orders/session-started/search?keyword=${encodeURIComponent(keyword)}`, // ✅ Fixed URL and added keyword
      providesTags: ["SessionStartedOrder"],
    }),
    getSessionStartedOrderById: builder.query({
      query: (id) => `/orders/session-started/${id}`,
      providesTags: ["SessionStartedOrder"],
    }),
    deleteSessionOrderById: builder.mutation({
      query(id) {
        return {
          url: `/orders/session-started/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["SessionStartedOrder"],
    }),
    convertSessionOrder: builder.mutation({
      query: (sessionOrderId) => ({
        url: "orders/session-to-order",
        method: "POST",
        body: { sessionOrderId },
      }),
      invalidatesTags: ["Order", "SessionStartedOrder", "AdminOrders"],
      transformResponse: (response) => response.order,
      onQueryStarted: async (arg, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          // Handle successful conversion if needed
        } catch (error) {
          console.error("Error converting order:", error);
        }
      },
    }),
    createDelhiveryOrder: builder.mutation({
      query: (orderId) => ({
        url: `/orders/create-delhivery/${orderId}`,
        method: "POST",
      }),
      invalidatesTags: ["Order", "AdminOrders"], // Refresh order details and admin orders
      transformResponse: (response) => ({
        success: response.success,
        message: response.message,
        waybill: response.waybill,
      }),
      onQueryStarted: async (orderId, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          // Handle successful Delhivery order creation if needed
          console.log(`Delhivery order created: ${data.waybill}`);
        } catch (error) {
          console.error("Error creating Delhivery order:", error);
        }
      },
    }),
    syncDelhiveryOrders: builder.mutation({
      query: () => ({
        url: "/orders/sync-delhivery-orders",
        method: "POST",
        body: {},
      }),
      invalidatesTags: ["AdminOrders"], // Trigger refetch of getAdminOrders
      transformResponse: (response) => ({
        success: response.success,
        message: response.message,
      }),
      onQueryStarted: async (arg, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          toast.success(data.message); // Display success message
        } catch (error) {
          toast.error("Failed to sync orders"); // Display error message
          console.error("Error syncing Delhivery orders:", error);
        }
      },
    }),

    approveReturn: builder.mutation({
      query: (orderId) => ({
        url: `/orders/approve-return/${orderId}`,
        method: "PATCH",
      }),
      invalidatesTags: ["Order", "AdminOrders"], // Refetch order details + admin list
      transformResponse: (response) => response.order || response,
      onQueryStarted: async (arg, { dispatch, queryFulfilled }) => {
        try {
          await queryFulfilled;
          toast.success("Return approved successfully");
        } catch (error) {
          toast.error("Failed to approve return");
          console.error("Approve return error:", error);
        }
      },
    }),
  }),
});

export const {
  useCreateNewOrderMutation,
  useStripeCheckoutSessionMutation,
  useMyOrdersQuery,
  useOrderDetailsQuery,
  useGetAdminOrdersQuery,
  useDeleteOrderMutation,
  useUpdateOrderMutation,
  useCreateCouponMutation,
  useGetCouponsQuery,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
  useCheckCouponMutation,
  useApplyCouponMutation,
  useSessionStartedOrdersQuery,
  useConvertSessionOrderMutation,
  useGetSessionStartedOrderByIdQuery,
  useDeleteSessionOrderByIdMutation,
  useSearchSessionStartedOrdersQuery,
  useCreateDelhiveryOrderMutation,
  useSyncDelhiveryOrdersMutation,
  useApproveReturnMutation,
} = orderApi;
