import { Order } from "@/types/order";
import { SessionStartedOrder } from "@/types/sessionStartedOrder";
import React from "react";

const OrderSummary: React.FC<{ order: SessionStartedOrder }> = ({ order }) => {
  const safe = (val: any) => Number(val ?? 0).toFixed(2);

  return (
    <div className="flex flex-col px-4 py-6 md:p-6 xl:p-8 w-full bg-gray-50 dark:bg-gray-800 space-y-6">
      <h3 className="text-xl font-semibold leading-5 text-gray-800 dark:text-gray-100">
        Summary
      </h3>
      <div className="flex justify-center items-center w-full space-y-4 flex-col border-gray-200 dark:border-gray-700 border-b pb-4">
        {order.totalMRP != null && (
          <div className="flex justify-between w-full">
            <p className="text-base leading-4 text-gray-800 dark:text-gray-100">
              Actual Price (MRP)
            </p>
            <p className="text-base dark:text-gray-300 leading-4 text-gray-600">
              ₹{safe(order.totalMRP)}
            </p>
          </div>
        )}
        <div className="flex justify-between w-full">
          <p className="text-base leading-4 text-gray-800 dark:text-gray-100">
            Discount Price
          </p>
          <p className="text-base dark:text-gray-300 leading-4 text-gray-600">
            ₹{order.itemsPrice.toFixed(2)}
          </p>
        </div>
        {order.productDiscount != null && order.productDiscount > 0 && (
          <div className="flex justify-between w-full">
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
            <div className="flex justify-between w-full">
              <p className="text-base leading-4 text-gray-800 dark:text-gray-100">
                Shipping Fee
              </p>
              <p className="text-base dark:text-gray-300 leading-4 text-gray-600">
                + ₹{safe(order.shippingDiscount)}
              </p>
            </div>
            <div className="flex justify-between w-full">
              <p className="text-base leading-4 text-gray-800 dark:text-gray-100">
                Subtotal
              </p>
              <p className="text-base dark:text-gray-300 leading-4 text-gray-600">
                ₹{(Number(order.itemsPrice) + Number(order.shippingDiscount)).toFixed(2)}
              </p>
            </div>
            <div className="flex justify-between w-full">
              <p className="text-base leading-4 text-gray-800 dark:text-gray-100">
                Shipping Discount
              </p>
              <p className="text-base leading-4 text-green-500">
                - ₹{safe(order.shippingDiscount)}
              </p>
            </div>
          </>
        )}
      </div>
      <div className="flex justify-between items-center w-full">
        <p className="text-base font-semibold leading-4 text-gray-800 dark:text-gray-100">
          Final Payable Amount
        </p>
        <p className="text-base dark:text-gray-300 font-semibold leading-4 text-gray-600">
          ₹{order.totalAmount.toFixed(2)}
        </p>
      </div>
    </div>
  );
};

export default OrderSummary;
