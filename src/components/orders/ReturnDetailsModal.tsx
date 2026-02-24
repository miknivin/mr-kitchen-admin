"use client";
import React from "react";
import { Order } from "@/types/order";
import { useApproveReturnMutation } from "@/redux/api/orderApi";
import toast from "react-hot-toast";

interface ReturnDetailsModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove?: (orderId: string) => Promise<void>;
  isApproving?: boolean;
}

const ReturnDetailsModal: React.FC<ReturnDetailsModalProps> = ({
  order,
  isOpen,
  onClose,
  onApprove,
}) => {
  const [approveReturn, { isLoading: isApproving }] =
    useApproveReturnMutation();

  if (!isOpen || !order) return null;

  const isReturnRequested = order.orderStatus === "Return Requested";

  const handleApprove = async () => {
    try {
      await approveReturn(order._id).unwrap();
      onClose();
      toast.success("Return approved successfully");
    } catch (err) {
      toast.error("Failed to approve return");
      // Error already toasted
    }
  };
  return (
    <div
      id="return-details-modal"
      tabIndex={-1}
      aria-hidden="true"
      className="fixed inset-0 z-50 flex h-full w-full items-center justify-center overflow-y-auto overflow-x-hidden bg-black bg-opacity-50"
    >
      <div className="relative max-h-full w-full max-w-md p-4">
        {/* Modal content */}
        <div className="relative rounded-lg bg-white shadow-sm dark:bg-gray-700">
          {/* Modal header */}
          <div className="flex items-center justify-between rounded-t border-b border-gray-200 p-4 dark:border-gray-600 md:p-5">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Return Details - Order #{order._id.slice(-6).toUpperCase()}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="ms-auto inline-flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white"
            >
              <svg
                className="h-3 w-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 14"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                />
              </svg>
              <span className="sr-only">Close modal</span>
            </button>
          </div>

          {/* Modal body */}
          <div className="space-y-4 p-4 md:p-5">
            {/* User Details */}
            <div>
              <h4 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                Customer Information
              </h4>
              <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                <p>
                  <strong>Name:</strong> {order.shippingInfo.fullName || "N/A"}
                </p>
                <p>
                  <strong>Email:</strong> {order.shippingInfo.email || "N/A"}
                </p>
                <p>
                  <strong>Phone:</strong> {order.shippingInfo.phoneNo}
                </p>
                <p>
                  <strong>Address:</strong>{" "}
                  {`${order.shippingInfo.address}, ${order.shippingInfo.city}, ${order.shippingInfo.state} - ${order.shippingInfo.zipCode}`}
                </p>
              </div>
            </div>

            <hr className="border-gray-200 dark:border-gray-600" />

            {/* Return Details */}
            <div>
              <h4 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                Return Information
              </h4>
              <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                <p>
                  <strong>Status:</strong>{" "}
                  <span className="font-semibold">{order.orderStatus}</span>
                </p>
                <p>
                  <strong>Reason:</strong>{" "}
                  {order.returnReason ||
                    order.cancelOrReturnReason ||
                    "Not provided"}
                </p>
                {order.returnRequestedAt && (
                  <p>
                    <strong>Requested On:</strong>{" "}
                    {new Date(order.returnRequestedAt).toLocaleDateString(
                      "en-GB",
                      { day: "2-digit", month: "long", year: "numeric" },
                    )}
                  </p>
                )}
                {order.returnApprovedAt && (
                  <p>
                    <strong>Approved On:</strong>{" "}
                    {new Date(order.returnApprovedAt).toLocaleDateString(
                      "en-GB",
                      { day: "2-digit", month: "long", year: "numeric" },
                    )}
                  </p>
                )}
                {order.returnedAt && (
                  <p>
                    <strong>Returned On:</strong>{" "}
                    {new Date(order.returnedAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                )}
                {order.refundedAt && (
                  <p>
                    <strong>Refunded On:</strong>{" "}
                    {new Date(order.refundedAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                )}
              </div>
            </div>

            {/* Approve Button or Approved Badge */}
            <div className="mt-6">
              {isReturnRequested ? (
                <button
                  onClick={handleApprove}
                  disabled={isApproving}
                  className="btn w-full border-none bg-primary p-3 text-gray-200 hover:bg-primary/80"
                >
                  {isApproving ? "Approving..." : "Approve Return"}
                </button>
              ) : (
                <div className="w-full rounded-lg bg-green-100 py-2.5 text-center text-sm font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                  Approved
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnDetailsModal;
