"use client";

import React from "react";
import "jsvectormap/dist/jsvectormap.css";
import "flatpickr/dist/flatpickr.min.css";
import "@/css/satoshi.css";
import "@/css/style.css";
import Loader from "@/components/common/Loader";
import SignIn from "@/components/SignIn";
import { useGetMeQuery } from "@/redux/api/userApi";
import { useSelector } from "react-redux";
import { Toaster } from "react-hot-toast";

export default function MainContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading } = useGetMeQuery({});
  const { isAuthenticated } = useSelector((state: any) => state.auth);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="min-h-[100svh] dark:bg-boxdark-2 dark:text-bodydark">
      <Toaster position="top-center" reverseOrder={false} toastOptions={{ duration: 2000 }} />
      {!isAuthenticated ? <SignIn /> : children}
    </div>
  );
}