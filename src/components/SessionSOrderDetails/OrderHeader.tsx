import ClickToCopy from "@/utlis/ClickToCopy/SimpleClickToCopy";
import React from "react";

// Define the type for the props
interface OrderHeaderProps {
  orderNumber: string;
  orderDate: string;
  orderStatus: string;
  orderId: string;
  razorPayId: string;
}

const OrderHeader: React.FC<OrderHeaderProps> = ({
  orderNumber,
  orderDate,
  orderStatus,
  orderId,
  razorPayId,
}) => {
  return (
    <div className="flex justify-between">
      <div className="item-start flex flex-col justify-start space-y-2">
        <h1 className="text-3xl font-semibold leading-7 text-gray-800 dark:text-gray-100 lg:text-4xl lg:leading-9">
          Order #{orderNumber}
        </h1>
        <p className="text-base font-medium leading-6 text-gray-600 dark:text-gray-300">
          {orderDate}
        </p>
        <ClickToCopy label="Razorpay order Id" value={razorPayId} />
      </div>
    </div>
  );
};

export default OrderHeader;
