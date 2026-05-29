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
        {order.totalMRP != null && (
          <div className="flex w-full justify-between">
            <p className="text-base leading-4 text-gray-800 dark:text-gray-100">
              Actual Price (MRP)
            </p>
            <p className="text-base leading-4 text-gray-600 dark:text-gray-300">
              ₹{safe(order.totalMRP)}
            </p>
          </div>
        )}
        <div className="flex w-full justify-between">
          <p className="text-base leading-4 text-gray-800 dark:text-gray-100">
            Discount Price
          </p>
          <p className="text-base leading-4 text-gray-600 dark:text-gray-300">
            ₹{safe(order.itemsPrice)}
          </p>
        </div>
        {order.productDiscount != null && order.productDiscount > 0 && (
          <div className="flex w-full justify-between">
            <p className="text-base leading-4 text-gray-800 dark:text-gray-100">
              You Saved
            </p>
            <p className="text-base leading-4 text-green-500">
              - ₹{safe(order.productDiscount)}
            </p>
          </div>
        )}
        {order.shippingDiscount != null && order.shippingDiscount > 0 && (
          <>
            <div className="flex w-full justify-between">
              <p className="text-base leading-4 text-gray-800 dark:text-gray-100">
                Shipping Fee
              </p>
              <p className="text-base leading-4 text-gray-600 dark:text-gray-300">
                + ₹{safe(order.shippingDiscount)}
              </p>
            </div>
            <div className="flex w-full justify-between">
              <p className="text-base leading-4 text-gray-800 dark:text-gray-100">
                Subtotal
              </p>
              <p className="text-base leading-4 text-gray-600 dark:text-gray-300">
                ₹{(Number(order.itemsPrice ?? 0) + Number(order.shippingDiscount)).toFixed(2)}
              </p>
            </div>
            <div className="flex w-full justify-between">
              <p className="text-base leading-4 text-gray-800 dark:text-gray-100">
                Shipping Discount
              </p>
              <p className="text-base leading-4 text-green-500">
                - ₹{safe(order.shippingDiscount)}
              </p>
            </div>
          </>
        )}
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
          Final Payable Amount
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

