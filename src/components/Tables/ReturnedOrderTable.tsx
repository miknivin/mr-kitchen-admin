"use client";
import {
  useGetAdminOrdersQuery,
  useUpdateOrderMutation,
} from "@/redux/api/orderApi";
import Link from "next/link";
import PreviewIcon from "../SvgIcons/PreviewIcon";
import Spinner from "../common/Spinner";

import { useState } from "react";
import toast from "react-hot-toast";
import ReturnDetailsModal from "../orders/ReturnDetailsModal";

const ReturnedOrdersTable = () => {
  const { data, isLoading, isError, refetch } = useGetAdminOrdersQuery({});
  const [updateOrder, { isLoading: isApproving }] = useUpdateOrderMutation();

  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const returnRelatedStatuses = [
    "Return Requested",
    "Return Approved",
    "Return Rejected",
    "Returned",
    "Refunded",
  ];

  const returnOrders =
    data?.orders?.filter((order: any) =>
      returnRelatedStatuses.includes(order.orderStatus),
    ) || [];

  const openModal = (order: any) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const handleApproveReturn = async (orderId: string) => {
    try {
      await updateOrder({
        id: orderId,
        body: { orderStatus: "Return Approved" },
      }).unwrap();
      toast.success("Return approved successfully");
      refetch();
      closeModal();
    } catch (err) {
      toast.error("Failed to approve return");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center">
        <Spinner />
        <p className="ml-2 text-gray-500 dark:text-gray-400">
          Loading return-related orders...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center text-red-500 dark:text-red-400">
        Error loading orders.
      </div>
    );
  }

  return (
    <>
      <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <div className="mb-6">
          <h4 className="text-xl font-semibold text-black dark:text-white">
            Return-Related Orders ({returnOrders.length})
          </h4>
        </div>

        {returnOrders.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No return-related orders found.
            </p>
          </div>
        ) : (
          <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400 rtl:text-right">
              <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Order ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-center">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-3 text-center">
                    Total
                  </th>
                  <th scope="col" className="px-6 py-3 text-center">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-center">
                    Payment Method
                  </th>
                  <th scope="col" className="px-6 py-3 text-center">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-center">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {returnOrders.map((order: any) => (
                  <tr
                    key={order._id}
                    className="border-b border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600"
                  >
                    <th
                      scope="row"
                      className="whitespace-nowrap px-6 py-4 font-medium text-gray-900 dark:text-white"
                    >
                      {order._id.slice(-6).toUpperCase()}
                    </th>
                    <td className="px-6 py-4 text-center">
                      {order.shippingInfo.fullName || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      ₹{order.totalAmount}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {order.delhiveryCurrentOrderStatus || order.orderStatus}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {order.paymentMethod}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {new Date(order.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        <button
                          onClick={() => openModal(order)}
                          className="btn border-none bg-primary p-3 text-gray-200 hover:bg-primary/80"
                        >
                          <PreviewIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ReturnDetailsModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={closeModal}
        onApprove={handleApproveReturn}
        isApproving={isApproving}
      />
    </>
  );
};

export default ReturnedOrdersTable;
