import { Order } from "@/types/order";
import { SessionStartedOrder } from "@/types/sessionStartedOrder";
import React from "react";

const OrderSummary: React.FC<{ order: SessionStartedOrder }> = ({ order }) => {
  return (
    <div className="flex flex-col px-4 py-6 md:p-6 xl:p-8 w-full bg-gray-50 dark:bg-gray-800 space-y-6">
      <h3 className="text-xl font-semibold leading-5 text-gray-800 dark:text-gray-100">
        Summary
      </h3>
      <div className="flex justify-center items-center w-full space-y-4 flex-col border-gray-200 dark:border-gray-700 border-b pb-4">
        <div className="flex justify-between w-full">
          <p className="text-base leading-4 text-gray-800 dark:text-gray-100">
            Subtotal
          </p>
          <p className="text-base dark:text-gray-300 leading-4 text-gray-600">
          ₹{order.itemsPrice.toFixed(2)}
          </p>
        </div>
        {/* <div className="flex justify-between items-center w-full">
          <p className="text-base leading-4 text-gray-800 dark:text-gray-100">
            Shipping
          </p>
          <p className="text-base dark:text-gray-300 leading-4 text-gray-600">
          ₹{order.shippingAmount.toFixed(2)}
          </p>
        </div> */}
        {/* <div className="flex justify-between items-center w-full">
          <p className="text-base leading-4 text-gray-800 dark:text-gray-100">
            Tax
          </p>
          <p className="text-base dark:text-gray-300 leading-4 text-gray-600">
          ₹{order.taxAmount.toFixed(2)}
          </p>
        </div> */}
      </div>
      <div className="flex justify-between items-center w-full">
        <p className="text-base font-semibold leading-4 text-gray-800 dark:text-gray-100">
          Total
        </p>
        <p className="text-base dark:text-gray-300 font-semibold leading-4 text-gray-600">
        ₹{order.totalAmount.toFixed(2)}
        </p>
      </div>
    </div>
  );
};

export default OrderSummary;
