"use client";

import {
  useDeleteSessionOrderByIdMutation,
  useSessionStartedOrdersQuery,
  useSearchSessionStartedOrdersQuery, // Import the search query hook
} from "@/redux/api/orderApi";
import { SessionStartedOrder } from "@/types/sessionStartedOrder";
import Link from "next/link";
import Spinner from "../common/Spinner";
import PreviewIcon from "../SvgIcons/PreviewIcon";
import DeleteIcon from "../SvgIcons/DeleteIcon";
import { useState, useEffect, useMemo } from "react";
import PaginationComponent from "@/utlis/pagination/PaginationComponent";
import SearchInput from "@/utlis/search/SearchInput";
import toast from "react-hot-toast";
import ReusableAlert from "@/utlis/alerts/ReusableAlert";
import ClickToCopy from "@/utlis/ClickToCopy/SimpleClickToCopy";

const SessionStartedOrders = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentSession, setCurrentSession] = useState<
    Partial<SessionStartedOrder>
  >({});
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Fetch all session orders when there is no search query
  const {
    data: allOrdersData,
    isLoading: isLoadingAll,
    isError: isErrorAll,
  } = useSessionStartedOrdersQuery(null, {
    skip: !!searchQuery, // Skip this query if searchQuery is non-empty
  });

  // Fetch searched session orders when there is a search query
  const {
    data: searchedOrdersData,
    isLoading: isLoadingSearch,
    isError: isErrorSearch,
  } = useSearchSessionStartedOrdersQuery(
    { keyword: searchQuery },
    {
      skip: !searchQuery, // Skip this query if searchQuery is empty
    },
  );

  const [deleteOrder, { isLoading: isDeleting }] =
    useDeleteSessionOrderByIdMutation();

  // Determine which data to use based on searchQuery
  const data = searchQuery ? searchedOrdersData : allOrdersData;
  const isLoading = searchQuery ? isLoadingSearch : isLoadingAll;
  const isError = searchQuery ? isErrorSearch : isErrorAll;

  // Function to remove duplicates based on user and shippingInfo
  const removeDuplicates = (
    orders: SessionStartedOrder[],
  ): SessionStartedOrder[] => {
    const seen = new Set<string>();
    return orders.filter((order) => {
      const key = `${order.user.toString()}-${JSON.stringify(order.shippingInfo)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  // Process orders (remove duplicates)
  const uniqueOrders = useMemo(
    () => (data?.data ? removeDuplicates(data.data) : []),
    [data]
  );

  // Update total items for pagination
  useEffect(() => {
    setTotalItems(uniqueOrders.length);
  }, [uniqueOrders]);

  // Paginate the unique orders
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedOrders = uniqueOrders.slice(indexOfFirstItem, indexOfLastItem);

  const handleDelete = async () => {
    try {
      await deleteOrder(currentSession._id).unwrap();
      toast.success("Session order deleted");
    } catch (error) {
      console.error("Failed to delete order:", error);
    }
  };

  const openDeleteModal = (session: SessionStartedOrder) => {
    setCurrentSession(session);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setCurrentSession({});
    setIsDeleteModalOpen(false);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page on search
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return (
      <p>
        <Spinner />
      </p>
    );
  }

  if (isError) {
    return <p>Error loading session started orders.</p>;
  }

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="w-full">
        <h4 className="text-xl font-semibold text-black dark:text-white">
          Session Started Orders
        </h4>
      </div>
      <div className="mb-3 flex items-center justify-between">
        <SearchInput
          placeholder="Search by name, order ID..."
          onSearch={handleSearch}
        />
        <select
          defaultValue="10"
          onChange={(e) => setItemsPerPage(Number(e.target.value))}
          className="select rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
        >
          <option disabled={true}>Select items per page</option>
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
        </select>
      </div>

      <div className="relative shadow-md sm:rounded-lg">
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
                Razorpay order Id
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
            {paginatedOrders.map((order: SessionStartedOrder) => (
              <tr
                key={order._id.toString()}
                className="border-b border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600"
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
                <td className="px-6 py-4 text-center">
                  <ClickToCopy label={""} value={order.razorpayOrderId} />
                </td>
                <td className="px-6 py-4 text-center">
                  {new Date(order.createdAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "2-digit",
                  })}
                </td>
                <td className="flex flex-wrap justify-center gap-3 border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                  <Link
                    href={`/orders/session-started/${order._id}`}
                    className="btn border-none bg-primary p-3 text-gray-200 hover:bg-primary/80"
                  >
                    <PreviewIcon />
                  </Link>
                  <button
                    onClick={() => {
                      setIsDeleteModalOpen(true);
                      setCurrentSession(order);
                    }}
                    disabled={isDeleting}
                    className="btn !border-none bg-red-600 p-3 text-gray-200 hover:bg-red-600/80"
                  >
                    {isDeleting ? <Spinner /> : <DeleteIcon />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!uniqueOrders || uniqueOrders.length === 0) && (
          <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
            <p className="text-center text-gray-500 dark:text-gray-400">
              {searchQuery
                ? "No session started orders match your search."
                : "No session started orders found."}
            </p>
          </div>
        )}
      </div>

      <PaginationComponent
        currentPage={currentPage}
        totalPages={Math.ceil(totalItems / itemsPerPage)}
        onPageChange={handlePageChange}
      />
      {isDeleteModalOpen && currentSession && (
        <ReusableAlert
          title="Confirm Deletion"
          content={`Are you sure you want to delete "${currentSession._id?.slice(-6)}"?`}
          func={handleDelete}
          isOpen={isDeleteModalOpen}
          functionTitle={"Delete"}
          buttonStyle={"bg-red-600"}
          onClose={closeDeleteModal}
        />
      )}
    </div>
  );
};

export default SessionStartedOrders;
