import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const productApi = createApi({
  reducerPath: "productApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
  }),
  tagTypes: ["Product", "AdminProducts", "Reviews"],
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: (params) => ({
        url: "products/getAllProducts",
        params: {
          page: params?.page,
          keyword: params?.keyword,
          category: params?.category,
          limit: params?.limit,
          "price[gte]": params?.min,
          "price[lte]": params?.max,
          "ratings[gte]": params?.ratings,
        },
      }),
      providesTags: ["Product"],
    }),
    getProductDetails: builder.query({
      query: (id) => `/products/${id}`,
      providesTags: ["Product"],
    }),
    submitReview: builder.mutation({
      query(body) {
        return {
          url: "/reviews",
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["Product"],
    }),
    canUserReview: builder.query({
      query: (productId) => `/can_review/?productId=${productId}`,
    }),
    getAdminProducts: builder.query({
      query: () => "/admin/products",
      providesTags: ["AdminProducts"],
    }),
    createProduct: builder.mutation({
      query(body) {
        return {
          url: "/products/newProduct",
          method: "POST",
          body,
        };
      },
      invalidatesTags: ["AdminProducts", "Product"],
    }),
    uploadProductImages: builder.mutation({
      query({ id, formData }) {
        return {
          url: `/products/updateProductImages/addProductImage/${id}`,
          method: "PATCH",
          body: formData,
          formData: true,
        };
      },
      invalidatesTags: ["Product"],
    }),

    uploadKidsBagImages: builder.mutation({
      query({ formData }) {
        return {
          url: `/products/updateKidsChoiceImg`,
          method: "PATCH",
          body: formData,
          formData: true,
        };
      },
      invalidatesTags: ["Product"],
    }),

    updateProduct: builder.mutation({
      query({ id, body }) {
        return {
          url: `/products/update/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["Product", "AdminProducts"],
    }),
    deleteProduct: builder.mutation({
      query(id) {
        return {
          url: `/products/delete/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["AdminProducts", "Product"],
    }),
    deleteProductImage: builder.mutation({
      query({ id, body }) {
        return {
          url: `/products/updateProductImages/deleteProductImage/${id}`,
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["Product", "AdminProducts"],
    }),
    getAdminOrders: builder.query({
      query: () => `/admin/orders`,
      providesTags: ["AdminOrders"],
    }),
    uploadAPlusContentImages: builder.mutation({
      query({ id, aPlusContentIndex, body }) {
        return {
          url: `/products/${id}/a-plus-content/${aPlusContentIndex}/upload`,
          method: "POST",
          body,
        };
      },
      invalidatesTags: ["Product"],
    }),
    deleteAPlusContentImage: builder.mutation({
      query({ id, aPlusContentIndex, body }) {
        return {
          url: `/products/${id}/a-plus-content/${aPlusContentIndex}/delete`,
          method: "POST",
          body,
        };
      },
      invalidatesTags: ["Product", "AdminProducts"],
    }),
    imageUpload: builder.mutation({
      query: ({ fileName, fileType, productId }) => ({
        url: "/image-upload",
        method: "POST",
        body: { fileName, fileType, productId },
      }),
    }),
    updateOfferEndTimeBulk: builder.mutation({
      query: (offerEndTime) => ({
        url: `/products/offer-time-bulk`,
        method: "PUT",
        params: { offerEndTime },
      }),
      invalidatesTags: ["Product", "AdminProducts"],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductDetailsQuery,
  useGetAdminProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useDeleteProductImageMutation,
  useUploadProductImagesMutation,
  useUploadKidsBagImagesMutation,
  useSubmitReviewMutation,
  useCanUserReviewQuery,
  useUploadAPlusContentImagesMutation,
  useDeleteAPlusContentImageMutation,
  useImageUploadMutation,
  useUpdateOfferEndTimeBulkMutation,
} = productApi;
