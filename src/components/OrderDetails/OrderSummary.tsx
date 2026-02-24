import { Order } from "@/types/order";
import React from "react";

const OrderSummary: React.FC<{ order: Order }> = ({ order }) => {

  // Safe number helper — returns 0 if undefined/null
  const safe = (val: any) => Number(val ?? 0).toFixed(2);

  return (
    <div className="flex w-full flex-col space-y-6 bg-gray-50 px-4 py-6 dark:bg-gray-800 md:p-6 xl:p-8">
      <h3 className="text-xl font-semibold leading-5 text-gray-800 dark:text-gray-100">
        Summary
      </h3>
      <div className="flex w-full flex-col items-center justify-center space-y-4 border-b border-gray-200 pb-4 dark:border-gray-700">
        <div className="flex w-full justify-between">
          <p className="text-base leading-4 text-gray-800 dark:text-gray-100">
            Subtotal
          </p>
          <p className="text-base leading-4 text-gray-600 dark:text-gray-300">
            ₹{safe(order.itemsPrice)}
          </p>
        </div>
        <div className="flex w-full items-center justify-between">
          <p className="text-base leading-4 text-gray-800 dark:text-gray-100">
            Shipping
          </p>
          <p className="text-base leading-4 text-gray-600 dark:text-gray-300">
            ₹{safe(order.shippingAmount)}
          </p>
        </div>

        <div className="flex w-full items-center justify-between">
          <p className="text-base leading-4 text-gray-800 dark:text-gray-100">
            Tax
          </p>
          <p className="text-base leading-4 text-gray-600 dark:text-gray-300">
            ₹{safe(order.taxAmount)}
          </p>
        </div>
        {order?.couponApplied !== "No" && (
          <div className="flex w-full items-center justify-between">
            <p className="text-base leading-4 text-gray-800 dark:text-gray-100">
              Coupon Applied
            </p>
            <p className="text-base leading-4 text-gray-800 dark:text-gray-100">
              {order?.couponApplied}
            </p>
          </div>
        )}
      </div>
      <div className="flex w-full items-center justify-between border-b border-gray-200 pb-3 dark:border-gray-700">
        <p className="text-base font-semibold leading-4 text-gray-800 dark:text-gray-100">
          Total
        </p>
        <p className="text-base font-semibold leading-4 text-gray-600 dark:text-gray-300">
          ₹{safe(order.totalAmount)}
        </p>
      </div>
      <h3 className="text-xl font-semibold leading-5 text-gray-800 dark:text-gray-100">
        Order notes
      </h3>
      <p>{order.orderNotes || ""}</p>
    </div>
  );
};

export default OrderSummary;

