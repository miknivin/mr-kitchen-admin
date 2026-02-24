import React from "react";
import Link from "next/link";
import Image from "next/image";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import SignInImage from "./signInImage";
import SignininForm from "./SignininForm";

export const metadata: Metadata = {
  title: "Next.js SignIn Page | TailAdmin - Next.js Dashboard Template",
  description: "This is Next.js Signin Page TailAdmin Dashboard Template",
};

const SignIn: React.FC = () => {
  return (
    <>
      {/* <Breadcrumb pageName="Sign In" /> */}
    <div className="flex items-center justify-center h-[100dvh]">
      <div className="rounded-sm border border-stroke bg-white dark:border-strokedark dark:bg-boxdark">
          <div className="flex flex-wrap items-center">
            <div className="hidden w-full xl:block xl:w-1/2">
              <SignInImage/>
            </div>

            <div className="w-full border-stroke dark:border-strokedark xl:w-1/2 xl:border-l-2">
              <SignininForm/>
            </div>
          </div>
      </div>
    </div>
      
    </>
  );
};

export default SignIn;
