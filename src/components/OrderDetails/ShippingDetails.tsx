/* eslint-disable @next/next/no-img-element */
import { ShippingInfo } from '@/types/order';
import React from 'react';


const ShippingDetails: React.FC<{ shippingInfo: ShippingInfo }> = ({ shippingInfo }) => {
  return (
    <div className="flex flex-col justify-center px-4 py-6 md:p-6 xl:p-8 w-full bg-gray-50 dark:bg-gray-800 space-y-6">
      <h3 className="text-xl font-semibold leading-5 text-gray-800 dark:text-gray-100">
        Shipping
      </h3>
      <div className="flex justify-between items-start w-full">
        <div className="flex justify-center items-center space-x-4">
          <div className="w-8 h-8">
            <img
              className="w-full h-full"
              alt="logo"
              src="https://i.ibb.co/L8KSdNQ/image-3.png"
            />
          </div>
          <div className="flex flex-col justify-start items-center">
            <p className="text-lg leading-6 font-semibold text-gray-800 dark:text-gray-100">
              {shippingInfo.fullName}
              <br />
              <span className="font-normal">{shippingInfo.phoneNo}</span>
            </p>
          </div>
        </div>
        <p className="text-lg font-semibold leading-6 text-gray-800 dark:text-gray-100">
          {shippingInfo.address}
          {shippingInfo.address2 && (
            <>
              <br />
              {shippingInfo.address2}
            </>
          )}
        </p>
        <p className="text-lg font-semibold leading-6 text-gray-800 dark:text-gray-100">
          {shippingInfo.city},{shippingInfo.country}
        </p>
      </div>
      {/* <div className="w-full flex justify-center items-center">
        <button className="hover:bg-black dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 py-5 w-96 md:w-full bg-gray-800 dark:bg-gray-700 text-base font-medium leading-4 text-white">
          View Carrier Details
        </button>
      </div> */}
    </div>
  );
};

// Default props

export default ShippingDetails;