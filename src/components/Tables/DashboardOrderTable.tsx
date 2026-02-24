"use client";

import {
  useGetAdminOrdersQuery,
  useSyncDelhiveryOrdersMutation,
} from "@/redux/api/orderApi";
import { Order } from "@/types/order";
import Link from "next/link";
import Spinner from "../common/Spinner";
import SyncIcon from "../SvgIcons/SyncIcons";
import { Tooltip } from "@mui/material";
import toast from "react-hot-toast";

type OrderTableProps = {
  limit: number | null;
};

const DashboardOrderTable = ({ limit }: OrderTableProps) => {
  const { data, isLoading, isError, refetch } = useGetAdminOrdersQuery(null);
  const [syncDelhiveryOrders, { isLoading: isSyncing }] =
    useSyncDelhiveryOrdersMutation();

  // Handle sync button click
  const handleSyncOrders = async () => {
    try {
      const response = await syncDelhiveryOrders({}).unwrap();
      toast.success(
        response.message || "Orders synced successfully with Delhivery!",
      );
      refetch(); // Refresh orders to show updated statuses
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to sync orders");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return <p className="text-center text-red-500">Error loading orders.</p>;
  }

  const orders = data?.orders || [];
  const displayLimit = limit !== null ? limit : orders.length;

  if (orders.length === 0) {
    return (
      <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
          Latest Orders
        </h4>
        <p className="text-center text-gray-500 dark:text-gray-400">
          No orders found.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="mb-4 flex items-center justify-between">
        <h4 className="text-xl font-semibold text-black dark:text-white">
          Latest Orders
        </h4>

        <div className="flex items-center gap-3">
          <Link href="/orders" className="btn-soft btn">
            View All Orders
          </Link>

          <Tooltip title="Sync Orders with Delhivery" arrow>
            <button
              onClick={handleSyncOrders}
              disabled={isSyncing}
              className="rounded bg-primary px-4 py-2 text-white transition hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
            >
              {isSyncing ? <Spinner /> : <SyncIcon />}
            </button>
          </Tooltip>
        </div>
      </div>

      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
          <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                ID
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
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.slice(0, displayLimit).map((order: Order) => (
              <tr
                key={order._id}
                className="border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
              >
                <th
                  scope="row"
                  className="whitespace-nowrap px-6 py-4 font-medium text-gray-900 dark:text-white"
                >
                  {order._id.slice(-6).toUpperCase()}
                </th>
                <td className="px-6 py-4 text-center">
                  {order.shippingInfo?.fullName || "N/A"}
                </td>
                <td className="px-6 py-4 text-center">₹{order.totalAmount}</td>
                <td className="px-6 py-4 text-center font-medium">
                  <span
                    className={`inline-block rounded px-2.5 py-0.5 text-xs font-semibold ${order.delhiveryCurrentOrderStatus
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                      }`}
                  >
                    {order.delhiveryCurrentOrderStatus || order.orderStatus}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  {new Date(order.createdAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "2-digit",
                  })}
                </td>
                <td className="px-6 py-4 text-center">
                  <Link
                    href={`/orderDetails/${order._id}`}
                    className="btn rounded bg-primary px-4 py-2 text-white hover:bg-primary/90"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardOrderTable;
