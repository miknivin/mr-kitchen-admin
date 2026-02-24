import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { setIsAuthenticated, setLoading, setUser } from "../features/userSlice";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/",
    credentials: "include"
  }),
  tagTypes: ["User", "AdminUsers", "AdminUser"],
  endpoints: (builder) => ({
    getMe: builder.query({
      query: () => `/auth/getMe`,
      transformResponse: (result) => result.user,
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setUser(data));
          dispatch(setIsAuthenticated(true));
          dispatch(setLoading(false));
        } catch (error) {
          dispatch(setLoading(false));
          console.log(error);
        }
      },
      providesTags: ["User"],
    }),
    updateProfile: builder.mutation({
      query(body) {
        return {
          url: "/me/update",
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["User"],
    }),
    uploadAvatar: builder.mutation({
      query(body) {
        return {
          url: "/me/upload_avatar",
          method: "PUT",
          body,
        };
      },
      invalidatesTags: ["User"],
    }),
    updatePassword: builder.mutation({
      query(body) {
        return {
          url: "/password/update",
          method: "PUT",
          body,
        };
      },
    }),
    resetPassword: builder.mutation({
      query({ token, body }) {
        return {
          url: `/password/reset/${token}`,
          method: "PUT",
          body,
        };
      },
    }),
    forgotPassword: builder.mutation({
      query(body) {
        return {
          url: "/password/forgot",
          method: "POST",
          body,
        };
      },
    }),
    getAdminUsers: builder.query({
      query: () => `/users/getAllUsers`,
      providesTags: ["AdminUsers"],
    }),
    getUserDetails: builder.query({
      query: (id) => `/users/${id}`,
      providesTags: ["AdminUsers"],
    }),
    updateUser: builder.mutation({
      query({ id, body }) {
        return {
          url: `/users/updateUser/${id}`,
          method: "PATCH",
          body,
        };
      },
      invalidatesTags: ["AdminUsers"],
    }),
    deleteUser: builder.mutation({
      query(id) {
        return {
          url: `/users/delete-user/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["AdminUsers"],
    }),
  }),
});

export const {
  useGetMeQuery,
  useUpdateProfileMutation,
  useUploadAvatarMutation,
  useUpdatePasswordMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useGetAdminUsersQuery,
  useGetUserDetailsQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = userApi;
