"use client";
import Spinner from "@/components/common/Spinner/index";
import {
  useGetEnquiriesQuery,
  useDeleteEnquiryMutation,
} from "@/redux/api/enquiryApi";
import { Enquiry } from "@/types/enquiry";
import { useState, useMemo } from "react";
import PaginationComponent from "@/utlis/pagination/PaginationComponent";
import SearchInput from "@/utlis/search/SearchInput";
import ReusableModal from "../Modals/ReusableModal";
import ReusableAlert from "@/utlis/alerts/ReusableAlert";
import DeleteIcon from "../SvgIcons/DeleteIcon";
import toast from "react-hot-toast";

const EnquiriesTable = () => {
  const { data, isLoading, isError } = useGetEnquiriesQuery({});
  const [deleteEnquiry, { isLoading: isDeleting }] = useDeleteEnquiryMutation();
  console.log("API Data:", data); // Debug: Log the API response

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentEnquiry, setCurrentEnquiry] = useState<Enquiry | null>(null);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const filteredEnquiries = useMemo(() => {
    let enquiries = data?.enquiries || [];
    console.log("Enquiries:", enquiries); // Debug: Log filtered enquiries

    if (!searchQuery) return enquiries;

    const queryLower = searchQuery.toLowerCase();
    return enquiries.filter((enquiry: Enquiry) => {
      const name = (enquiry.name || "").toLowerCase();
      const email = (enquiry.email || "").toLowerCase();
      const subject = (enquiry.subject || "").toLowerCase();
      const message = (enquiry.message || "").toLowerCase();
      return (
        name.includes(queryLower) ||
        email.includes(queryLower) ||
        subject.includes(queryLower) ||
        message.includes(queryLower)
      );
    });
  }, [data?.enquiries, searchQuery]);

  const totalItems = filteredEnquiries.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEnquiries = filteredEnquiries.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  const openMessageModal = (enquiry: Enquiry) => {
    setCurrentEnquiry(enquiry);
    setIsMessageModalOpen(true);
  };

  const closeMessageModal = () => {
    setCurrentEnquiry(null);
    setIsMessageModalOpen(false);
  };

  const openDeleteModal = (enquiry: Enquiry) => {
    setCurrentEnquiry(enquiry);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setCurrentEnquiry(null);
    setIsDeleteModalOpen(false);
  };

  const handleDelete = async () => {
    if (!currentEnquiry) return;
    try {
      await deleteEnquiry(currentEnquiry._id).unwrap();
      toast.success("Enquiry deleted successfully");
      closeDeleteModal();
    } catch (error) {
      toast.error("Error deleting enquiry");
      console.error("Failed to delete enquiry:", error);
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  if (isError) {
    return <p className="text-center text-danger">Failed to load enquiries.</p>;
  }

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark xl:pb-1">
        <div className="gap-4">
          <h4 className="mb-2 text-xl font-semibold text-black dark:text-white">
            Enquiries
          </h4>
        </div>
      </div>
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <SearchInput
          placeholder="Search by name, email, subject, or message..."
          onSearch={handleSearch}
        />
        <div className="flex items-center justify-end gap-4">
          <select
            defaultValue="10"
            onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
            className="select rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
          >
            <option disabled={true}>Select items per page</option>
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-2 text-left dark:bg-meta-4">
              <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white xl:pl-11">
                Name
              </th>
              <th className="min-w-[180px] px-4 py-4 font-medium text-black dark:text-white">
                Email
              </th>
              <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                Subject
              </th>
              <th className="min-w-[250px] px-4 py-4 font-medium text-black dark:text-white">
                Message
              </th>
              <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                Phone
              </th>
              <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                Created At
              </th>
              <th className="px-4 py-4 font-medium text-black dark:text-white">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedEnquiries?.map((enquiry: Enquiry, key: number) => (
              <tr key={key}>
                <td className="border-b border-[#eee] px-4 py-5 pl-9 dark:border-strokedark xl:pl-11">
                  <h5 className="font-medium text-black dark:text-white">
                    {enquiry.name}
                  </h5>
                </td>
                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                  <p className="text-black dark:text-white">{enquiry.email}</p>
                </td>
                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                  <p className="text-black dark:text-white">
                    {enquiry?.subject || "N/A"}
                  </p>
                </td>
                <td
                  className="cursor-pointer border-b border-[#eee] px-4 py-5 hover:bg-gray-100 dark:border-strokedark dark:hover:bg-gray-700"
                  onClick={() => openMessageModal(enquiry)}
                  title="Click to view full message"
                >
                  <p className="max-w-[250px] truncate text-black dark:text-white">
                    {enquiry.message}
                  </p>
                </td>
                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                  <p className="text-black dark:text-white">
                    {enquiry?.phone || <span className="text-gray-400 italic">N/A</span>}
                  </p>
                </td>
                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                  <p className="text-black dark:text-white">
                    {new Date(enquiry.createdAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "2-digit",
                    })}
                  </p>
                </td>
                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                  <button
                    onClick={() => openDeleteModal(enquiry)}
                    className="btn !border-none bg-red-600 p-3 text-gray-200 hover:bg-red-600/80"
                    disabled={isDeleting}
                  >
                    {isDeleting && currentEnquiry?._id === enquiry._id ? (
                      <Spinner />
                    ) : (
                      <DeleteIcon />
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!filteredEnquiries || filteredEnquiries.length === 0) && (
          <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
            <p className="text-center text-gray-500 dark:text-gray-400">
              {searchQuery
                ? "No enquiries match your search."
                : "No enquiries found."}
            </p>
          </div>
        )}
      </div>

      <PaginationComponent
        currentPage={currentPage}
        totalPages={Math.ceil(totalItems / itemsPerPage)}
        onPageChange={handlePageChange}
      />

      {isMessageModalOpen && currentEnquiry && (
        <ReusableModal
          onClose={closeMessageModal}
          formContent={
            <div className="p-4 space-y-3">
              {currentEnquiry.phone && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Phone</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{currentEnquiry.phone}</p>
                </div>
              )}
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Message</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {currentEnquiry.message}
                </p>
              </div>
            </div>
          }
          title="Enquiry Message"
        />
      )}

      {isDeleteModalOpen && currentEnquiry && (
        <ReusableAlert
          title="Confirm Deletion"
          content={`Are you sure you want to delete the enquiry from "${currentEnquiry.name}"?`}
          func={handleDelete}
          isOpen={isDeleteModalOpen}
          functionTitle="Delete"
          buttonStyle="bg-red-600"
          onClose={closeDeleteModal}
        />
      )}
    </div>
  );
};

export default EnquiriesTable;
