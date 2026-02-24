/* eslint-disable @next/next/no-img-element */
import { ShippingInfo } from "@/types/order";
import React from "react";

interface CustomerDetailsProps {
  customer: ShippingInfo;
}

const CustomerDetails: React.FC<CustomerDetailsProps> = ({ customer }) => {
  if (!customer) {
    return (
      <div className="flex w-full flex-col items-center justify-between bg-gray-50 px-4 py-6 dark:bg-gray-800 md:items-start md:p-6 xl:w-96 xl:p-8">
        <h3 className="text-xl font-semibold leading-5 text-gray-800 dark:text-gray-100">Customer</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">Customer details not available</p>
      </div>
    );
  }
  const { fullName, address, address2, phoneNo, city, country, zipCode } = customer;


  return (
    <div className="flex w-full flex-col items-center justify-between bg-gray-50 px-4 py-6 dark:bg-gray-800 md:items-start md:p-6 xl:w-96 xl:p-8">
      <h3 className="text-xl font-semibold leading-5 text-gray-800 dark:text-gray-100">
        Customer
      </h3>
      <div className="flex h-full w-full flex-col items-stretch justify-start md:flex-row md:space-x-6 lg:space-x-8 xl:flex-col xl:space-x-0">
        <div className="flex flex-shrink-0 flex-col items-start justify-start">
          <div className="flex w-full items-center justify-center space-x-4 border-b border-gray-200 py-8 dark:border-gray-700 md:justify-start">
            {/* <img src="https://i.ibb.co/5TSg7f6/Rectangle-18.png" alt="avatar" /> */}
            <div className="flex flex-col items-start justify-start space-y-2">
              <p className="text-left text-base font-semibold leading-4 text-gray-800 dark:text-gray-100">
                {fullName}
              </p>
              {/* <p className="text-sm dark:text-gray-300 leading-5 text-gray-600">
                {previousOrders} Previous Orders
              </p> */}
            </div>
          </div>
          <div className="flex w-full items-center justify-center space-x-4 border-b border-gray-200 py-4 text-gray-800 dark:border-gray-700 dark:text-gray-300 md:justify-start">
            <svg
              className="h-6 w-6 text-gray-800 dark:text-white"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width={24}
              height={24}
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.427 14.768 17.2 13.542a1.733 1.733 0 0 0-2.45 0l-.613.613a1.732 1.732 0 0 1-2.45 0l-1.838-1.84a1.735 1.735 0 0 1 0-2.452l.612-.613a1.735 1.735 0 0 0 0-2.452L9.237 5.572a1.6 1.6 0 0 0-2.45 0c-3.223 3.2-1.702 6.896 1.519 10.117 3.22 3.221 6.914 4.745 10.12 1.535a1.601 1.601 0 0 0 0-2.456Z"
              />
            </svg>

            <p className="cursor-pointer text-sm leading-5 ">{phoneNo}</p>
          </div>
        </div>
        <div className="mt-6 flex w-full flex-col items-stretch justify-between md:mt-0 xl:h-full">
          <div className="flex flex-col items-center justify-center space-y-4 md:flex-row md:items-start md:justify-start md:space-x-6 md:space-y-0 lg:space-x-8 xl:flex-col xl:space-x-0 xl:space-y-12">
            <div className="flex flex-col items-center justify-center space-y-4 md:items-start md:justify-start xl:mt-8">
              <p className="text-center text-base font-semibold leading-4 text-gray-800 dark:text-gray-100 md:text-left">
                Address
              </p>
              <p className="w-48 text-center text-sm leading-5 text-gray-600 dark:text-gray-300 md:text-left lg:w-full xl:w-48">
                {address}
                {address2 && (
                  <>
                    <br />
                    {address2}
                  </>
                )}
              </p>
              <p className="text-center text-base font-semibold leading-4 text-gray-800 dark:text-gray-100 md:text-left">
                Pin Code
              </p>
              <p className="w-48 text-center text-sm leading-5 text-gray-600 dark:text-gray-300 md:text-left lg:w-full xl:w-48">
                {zipCode}
              </p>
              <p className="text-center text-base font-semibold leading-4 text-gray-800 dark:text-gray-100 md:text-left">
                City
              </p>
              <p className="w-48 text-center text-sm leading-5 text-gray-600 dark:text-gray-300 md:text-left lg:w-full xl:w-48">
                {city}
              </p>
              <p className="text-center text-base font-semibold leading-4 text-gray-800 dark:text-gray-100 md:text-left">
                Country
              </p>
              <p className="w-48 text-center text-sm leading-5 text-gray-600 dark:text-gray-300 md:text-left lg:w-full xl:w-48">
                {country}
              </p>
            </div>
            {/* <div className="flex justify-center md:justify-start items-center md:items-start flex-col space-y-4">
              <p className="text-base font-semibold leading-4 text-center md:text-left text-gray-800 dark:text-gray-100">
                Billing Address
              </p>
              <p className="w-48 lg:w-full dark:text-gray-300 xl:w-48 text-center md:text-left text-sm leading-5 text-gray-600">
                {billingAddress}
              </p>
            </div> */}
          </div>
          {/* <div className="flex w-full justify-center items-center md:justify-start md:items-start">
            <button className="mt-6 md:mt-0 dark:border-white dark:hover:bg-gray-700 dark:bg-transparent py-5 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 border border-gray-800  w-96 2xl:w-full text-base font-medium leading-4 text-gray-800 dark:text-gray-100">
              Edit Details
            </button>
          </div> */}
        </div>
      </div>
    </div>
  );
};

// Default props
// CustomerDetails.defaultProps = {
//   customer: {
//     name: 'John Doe',
//     email: 'john.doe@example.com',
//     previousOrders: 0,
//     shippingAddress: '123 Main St, Springfield, IL',
//     billingAddress: '123 Main St, Springfield, IL',
//   },
// };

export default CustomerDetails;
