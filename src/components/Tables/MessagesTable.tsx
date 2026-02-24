"use client";
import { useState } from "react";
import PaginationComponent from "@/utlis/pagination/PaginationComponent"; // Adjust path

// Define the shape of a message object for better type safety
const MessagesTable = ({ data, page, limit }: any) => {
  const [currentPage, setCurrentPage] = useState(page);
  const [itemsPerPage, setItemsPerPage] = useState(limit);

  const { allMessages, totalMessages, error } = data;

  if (!allMessages || allMessages.length === 0) {
    return (
      <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
          Messages
        </h4>
        <p className="text-center text-gray-500 dark:text-gray-400">
          {error || "No messages found."}
        </p>
      </div>
    );
  }

  const handlePageChange = (page: any) => {
    setCurrentPage(page);
    // Update URL to trigger server component re-fetch
    window.location.href = `?page=${page}&limit=${itemsPerPage}`;
  };

  const handleItemsPerPageChange = (value: any) => {
    setItemsPerPage(value);
    setCurrentPage(1);
    // Update URL to trigger server component re-fetch
    window.location.href = `?page=1&limit=${value}`;
  };

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="max-w-full overflow-x-auto">
        <h1>Total Messages: {totalMessages}</h1>
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-2 text-left dark:bg-meta-4">
              <th className="min-w-[220px] px-4 py-4 font-medium text-black dark:text-white xl:pl-11">
                Message
              </th>
              <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                Sender ID
              </th>
              <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                Recipient ID
              </th>
              <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                Event Type
              </th>
              <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                Timestamp
              </th>
            </tr>
          </thead>
          <tbody>
            {allMessages.map((message: any, key: any) => (
              <tr key={key}>
                <td className="border-b border-[#eee] px-4 py-5 pl-9 dark:border-strokedark xl:pl-11">
                  <h5 className="font-medium text-black dark:text-white">
                    {message.message}
                  </h5>
                </td>
                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                  <p className="text-black dark:text-white">
                    {message.senderId}
                  </p>
                </td>
                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                  <p className="text-black dark:text-white">
                    {message.recipientId}
                  </p>
                </td>
                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                  <p className="text-black dark:text-white">
                    {message.eventType}
                  </p>
                </td>
                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                  <p className="text-black dark:text-white">
                    {new Date(message.timestamp).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PaginationComponent
        currentPage={currentPage}
        totalPages={Math.ceil(totalMessages / itemsPerPage)}
        onPageChange={handlePageChange}
      />

      <div className="mt-4 flex justify-end">
        <select
          defaultValue={itemsPerPage}
          onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
          className="select rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
        >
          <option value="5">5 per page</option>
          <option value="10">10 per page</option>
          <option value="20">20 per page</option>
          <option value="50">50 per page</option>
        </select>
      </div>
    </div>
  );
};

export default MessagesTable;
