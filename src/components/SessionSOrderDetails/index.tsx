"use client";

import { useEffect, useState } from "react";
import OrderHeader from "./OrderHeader";
import {
  useConvertSessionOrderMutation,
  useGetSessionStartedOrderByIdQuery,
} from "@/redux/api/orderApi";
import Spinner from "../common/Spinner";
import { SessionStartedOrder } from "@/types/sessionStartedOrder";
import { formatDate } from "./../../utlis/formatDate";
import Link from "next/link";
import CustomerDetails from "../OrderDetails/CustomerDetails";
import ShippingDetails from "../OrderDetails/ShippingDetails";
import ProductItem from "./ProductItem";
import OrderSummary from "./OrderSummary";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface OrderDetailsProps {
  orderId: string;
}

export default function OrderDetails({ orderId }: OrderDetailsProps) {
  const router = useRouter();
  const [
    convertSessionOrder,
    {
      isLoading: convertLoading,
      isError,
      error: convertError,
      data: convertData,
    },
  ] = useConvertSessionOrderMutation();
  const { data, error, isLoading } =
    useGetSessionStartedOrderByIdQuery(orderId);
  const [orderDetails, setOrderDetails] = useState<SessionStartedOrder | null>(
    null,
  );

  useEffect(() => {
    if (data) {
      console.log(data, "data");

      setOrderDetails(data);
    }
  }, [data]);

  useEffect(() => {
    if (convertData && !convertLoading && !isError) {
      router.push("/orders/session-started");
    }
  }, [convertData, convertLoading, isError, router]);

  // Added convert handler function
  const handleConvertOrder = async () => {
    try {
      await convertSessionOrder(orderId).unwrap();
      toast.success("Successfully converted to order");
    } catch (err) {
      toast.success("Error in convertion");
      console.error("Failed to convert order:", err);
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  if (error || !orderDetails) {
    return <p>Error fetching session started order details</p>;
  }

  return (
    <div className="px-4 py-14 2xl:container md:px-6 2xl:mx-auto 2xl:px-20">
      <div className="mb-4 flex justify-between">
        <Link
          href="/orders/session-started"
          className="me-2 rounded-lg bg-gray-800 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700"
        >
          Go back
        </Link>
        <button
          onClick={handleConvertOrder}
          disabled={convertLoading} // Disable button while converting
          className={`btn bg-primary text-white hover:bg-primary/80 ${convertLoading ? "cursor-not-allowed bg-primary/60" : ""}`}
        >
          {convertLoading ? "Converting..." : "Convert to Order"}
        </button>
      </div>

      <OrderHeader
        razorPayId={orderDetails.razorpayOrderId}
        orderNumber={orderDetails._id.slice(-6).toUpperCase()}
        orderDate={formatDate(orderDetails.createdAt)}
        orderId={orderDetails._id}
        orderStatus={orderDetails.razorpayPaymentStatus}
      />
      <div className="mt-10 flex w-full flex-col items-stretch justify-center space-y-4 md:space-y-6 xl:flex-row xl:space-x-8 xl:space-y-0">
        <div className="flex w-full flex-col items-start justify-start space-y-4 md:space-y-6 xl:space-y-8">
          <div className="flex w-full flex-col items-start justify-start bg-gray-50 px-4 py-4 dark:bg-gray-800 md:p-6 md:py-6 xl:p-8">
            <p className="text-lg font-semibold leading-6 text-gray-800 dark:text-gray-100 md:text-xl xl:leading-5">
              Customer’s Cart
            </p>
            {orderDetails.orderItems.map((product, index) => (
              <ProductItem key={index} product={product} />
            ))}
          </div>
          <div className="flex w-full flex-col items-stretch justify-center space-y-4 md:flex-row md:space-x-6 md:space-y-0 xl:space-x-8">
            <OrderSummary order={orderDetails} />
            {/* <ShippingDetails shippingInfo={orderDetails.shippingInfo} /> */}
          </div>
        </div>
        <CustomerDetails customer={orderDetails.shippingInfo} />
      </div>

      {/* Optional: Display conversion error if it occurs */}
      {isError && convertError && (
        <p className="mt-4 text-red-500">
          Error converting order: {JSON.stringify(convertError)}
        </p>
      )}
    </div>
  );
}
