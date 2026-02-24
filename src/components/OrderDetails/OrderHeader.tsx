import { useState } from "react";
import { toast } from "react-hot-toast";
import RadioDropDown from "./RadioDropDown";
import { useCreateDelhiveryOrderMutation } from "@/redux/api/orderApi";

interface OrderHeaderProps {
  orderNumber: string;
  orderDate: string;
  orderStatus: string;
  orderId: string;
  delhiveryStatus?: string;
  delhiveryError?: boolean;
  showCreateDelhiveryLink?: boolean;
}

const OrderHeader: React.FC<OrderHeaderProps> = ({
  orderNumber,
  orderDate,
  orderStatus,
  orderId,
  delhiveryStatus,
  delhiveryError,
  showCreateDelhiveryLink = false,
}) => {
  const [createDelhiveryOrder, { isLoading }] =
    useCreateDelhiveryOrderMutation();

  const handleCreateDelhiveryOrder = async () => {
    try {
      const response = await createDelhiveryOrder(orderId).unwrap();
      toast.success(
        `Delhivery order created with waybill: ${response.waybill}`,
        {
          duration: 4000,
          position: "top-right",
        },
      );
    } catch (err: any) {
      const message = err.data?.message || "Failed to create Delhivery order";
      toast.error(message, {
        duration: 4000,
        position: "top-right",
      });
    }
  };

  // Always show for manual maintenance
  const showRadioDropdown = true;

  return (
    <div className="flex justify-between">
      <div className="item-start flex flex-col justify-start space-y-2">
        <h1 className="text-3xl font-semibold leading-7 text-gray-800 dark:text-gray-100 lg:text-4xl lg:leading-9">
          Order #{orderNumber}
        </h1>
        <p className="text-base font-medium leading-6 text-gray-600 dark:text-gray-300">
          {orderDate}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {/* Show Delhivery status badge if exists and no error */}
        {delhiveryStatus && !delhiveryError && orderStatus !== "Cancelled" ? (
          <div className="flex h-full items-center justify-center">
            <span className="inline-block min-w-[220px] rounded-lg bg-blue-700 px-6 py-3 text-center text-base font-semibold text-white shadow-md">
              {delhiveryStatus}
            </span>
          </div>
        ) : null}

        {/* Show RadioDropDown for Cancelled orders OR when no Delhivery status */}
        {showRadioDropdown && (
          <RadioDropDown orderStatus={orderStatus} orderId={orderId} />
        )}

        {/* Create Delhivery Order link */}
        {showCreateDelhiveryLink && (
          <button
            onClick={handleCreateDelhiveryOrder}
            disabled={isLoading}
            className={`inline-block text-center text-base font-semibold underline focus:outline-none focus:ring-4 focus:ring-blue-300 ${isLoading
                ? "cursor-not-allowed text-blue-300"
                : "text-info hover:text-blue-600"
              }`}
          >
            {isLoading ? "Creating..." : "Create Delhivery Order"}
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderHeader;
