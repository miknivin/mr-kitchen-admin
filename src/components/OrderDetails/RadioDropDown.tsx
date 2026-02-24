"use client";
import { useState, useEffect } from "react";
import { useUpdateOrderMutation } from "@/redux/api/orderApi";
import { toast } from "react-hot-toast";

interface RadioDropDownProps {
  orderId: string;
  orderStatus: string;
}

export default function RadioDropDown({
  orderId,
  orderStatus,
}: RadioDropDownProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>(orderStatus);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [updateOrder, { isLoading }] = useUpdateOrderMutation();

  // Sync selectedStatus when prop changes (e.g., after refresh)
  useEffect(() => {
    setSelectedStatus(orderStatus);
  }, [orderStatus]);

  const handleStatusChange = async (status: string) => {
    if (status === selectedStatus) {
      setIsOpen(false);
      return;
    }

    setSelectedStatus(status);
    setIsOpen(false);

    const updatePromise = updateOrder({
      id: orderId,
      body: { orderStatus: status },
    }).unwrap();

    toast.promise(updatePromise, {
      loading: "Updating order status...",
      success: "Order status updated successfully!",
      error: "Failed to update order status.",
    });

    try {
      await updatePromise;
    } catch (error) {
      console.error("Error updating order status:", error);
      // Optionally revert UI on failure
      // setSelectedStatus(orderStatus);
    }
  };

  // Simplified status options requested by user
  const statuses = [
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
  ];

  return (
    <div className="relative">
      <button
        id="dropdownRadioButton"
        onClick={() => setIsOpen((prev) => !prev)}
        disabled={isLoading}
        className="inline-flex items-center rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        type="button"
      >
        {isLoading ? "Updating..." : selectedStatus}{" "}
        <svg
          className="ms-3 h-2.5 w-2.5"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 10 6"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="m1 1 4 4 4-4"
          />
        </svg>
      </button>

      {/* Dropdown menu */}
      <div
        id="dropdownDefaultRadio"
        className={`absolute left-0 z-10 mt-2 w-56 divide-y divide-gray-100 rounded-lg bg-white shadow-sm dark:divide-gray-600 dark:bg-gray-700 ${isOpen ? "block" : "hidden"
          }`}
      >
        <ul
          className="space-y-3 p-3 text-sm text-gray-700 dark:text-gray-200"
          aria-labelledby="dropdownRadioButton"
        >
          {statuses.map((status) => (
            <li key={status}>
              <div className="flex items-center">
                <input
                  id={`radio-${status}`}
                  type="radio"
                  name="order-status"
                  value={status}
                  checked={selectedStatus === status}
                  onChange={() => handleStatusChange(status)}
                  className="h-4 w-4 border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-500 dark:bg-gray-600 dark:ring-offset-gray-700 dark:focus:ring-blue-600 dark:focus:ring-offset-gray-700"
                />
                <label
                  htmlFor={`radio-${status}`}
                  className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                >
                  {status}
                </label>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
