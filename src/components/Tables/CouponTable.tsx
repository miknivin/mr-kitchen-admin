'use client';

import { useState, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import {
  useGetCouponsQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
} from '@/redux/api/couponApi';
import { Coupon } from '@/types/coupon';
import Spinner from '@/components/common/Spinner/index';
import PaginationComponent from '@/utlis/pagination/PaginationComponent';
import SearchInput from '@/utlis/search/SearchInput';
import CouponModal from '@/components/Modals/CouponModal';
import ReusableAlert from '@/utlis/alerts/ReusableAlert';
import DeleteIcon from '@/components/SvgIcons/DeleteIcon';
import { useDispatch, useSelector } from 'react-redux';
import { setShowModal } from '@/redux/features/couponSlice';

type ModalMode = 'add' | 'edit' | null;

export default function CouponsTable() {
  const dispatch = useDispatch();
  const showModal = useSelector((state: any) => state.coupon.showModal);

  // ────── API ──────
  const { data, isLoading, isError } = useGetCouponsQuery(undefined);
  const [createCoupon, { isLoading: isCreating }] = useCreateCouponMutation();
  const [updateCoupon, { isLoading: isUpdating }] = useUpdateCouponMutation();
  const [deleteCoupon, { isLoading: isDeleting }] = useDeleteCouponMutation();

  // ────── Table state ──────
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');

  // ────── Modal state ──────
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  // ────── Search & pagination ──────
  const filteredCoupons = useMemo(() => {
    const list = data?.coupons || [];
    if (!searchQuery) return list;

    const q = searchQuery.toLowerCase();
    return list.filter(
      (c: Coupon) =>
        c.code.toLowerCase().includes(q) ||
        (c.description ?? '').toLowerCase().includes(q) ||
        String(c.discountValue).includes(q)
    );
  }, [data?.coupons, searchQuery]);

  const totalItems = filteredCoupons.length;
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const paginated = filteredCoupons.slice(startIdx, endIdx);

  // ────── Handlers ──────
  const handleSearch = (q: string) => {
    setSearchQuery(q);
    setCurrentPage(1);
  };

  const handleItemsPerPage = (v: number) => {
    setItemsPerPage(v);
    setCurrentPage(1);
  };

  const openAdd = () => {
    setModalMode('add');
    setEditingCoupon(null);
    dispatch(setShowModal(true));
  };

  const openEdit = (c: Coupon) => {
    setModalMode('edit');
    setEditingCoupon(c);
    dispatch(setShowModal(true));
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingCoupon(null);
    dispatch(setShowModal(false));
  };

  const openDelete = (c: Coupon) => {
    setEditingCoupon(c);
    dispatch(setShowModal(true));
  };

  const handleDelete = async () => {
    if (!editingCoupon?._id) {
      toast.error('Invalid coupon ID');
      return;
    }

    try {
      await deleteCoupon(editingCoupon._id).unwrap();
      toast.success('Coupon deleted');
      closeModal();
    } catch {
      toast.error('Failed to delete coupon');
    }
  };

  const onSubmit = async (payload: Partial<Coupon>) => {
    try {
      if (modalMode === 'add') {
        await createCoupon(payload).unwrap();
        toast.success('Coupon created');
      } else if (modalMode === 'edit' && editingCoupon?._id) {
        await updateCoupon({ id: editingCoupon._id, data: payload }).unwrap();
        toast.success('Coupon updated');
      }
      closeModal();
    } catch (err: any) {
      toast.error(err?.data?.message || `Failed to ${modalMode === 'add' ? 'create' : 'update'} coupon`);
    }
  };

  // ────── Render ──────
  if (isLoading) return <Spinner />;
  if (isError) return <p className="text-center text-danger">Failed to load coupons.</p>;

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      {/* Title + Add button */}
      <div className="mb-6 flex items-center justify-between">
        <h4 className="text-xl font-semibold text-black dark:text-white">
          Manage Coupons
        </h4>
        <button
          onClick={openAdd}
          disabled={isCreating}
          className="inline-flex items-center justify-center rounded-md bg-primary py-2 px-6 text-white hover:bg-opacity-90 disabled:opacity-70"
        >
          {isCreating ? 'Creating...' : 'Add New Coupon'}
        </button>
      </div>

      {/* Search + Items per page */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <SearchInput
          placeholder="Search by code, description or value..."
          onSearch={handleSearch}
        />
        <div className="flex items-center justify-end gap-4">
          <select
            value={itemsPerPage}
            onChange={(e) => handleItemsPerPage(Number(e.target.value))}
            className="select rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="max-w-full overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-2 text-left dark:bg-meta-4">
              <th className="min-w-[220px] px-4 py-4 font-medium text-black dark:text-white xl:pl-11">
                Code
              </th>
              <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                Discount
              </th>
              <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                Valid Till
              </th>
              <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                Status
              </th>
              <th className="px-4 py-4 font-medium text-black dark:text-white">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((c: Coupon) => (
              <tr key={c._id}>
                <td className="border-b border-[#eee] px-4 py-5 pl-9 dark:border-strokedark xl:pl-11">
                  <h5 className="font-medium text-black dark:text-white">{c.code}</h5>
                  <p className="text-sm">{c.description}</p>
                </td>
                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                  {c.discountType === 'percentage'
                    ? `${c.discountValue}%`
                    : `₹${c.discountValue}`}
                </td>
                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                  {new Date(c.endDate).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </td>
                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                  <span
                    className={`inline-flex rounded-full py-1 px-3 text-sm font-medium ${
                      c.isActive
                        ? 'bg-success bg-opacity-10 text-success'
                        : 'bg-danger bg-opacity-10 text-danger'
                    }`}
                  >
                    {c.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                  <div className="flex items-center space-x-3.5">
                    <button
                      onClick={() => openEdit(c)}
                      className="hover:text-primary"
                      title="Edit"
                    >
                      <svg
                        className="fill-current"
                        width="18"
                        height="18"
                        viewBox="0 0 18 18"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M8.99981 14.8219C3.43106 14.8219 0.674805 9.50624 0.562305 9.28124C0.47793 9.11249 0.47793 8.88749 0.562305 8.71874C0.674805 8.49374 3.43106 3.17812 8.99981 3.17812C14.5686 3.17812 17.3248 8.49374 17.4373 8.71874C17.5217 8.88749 17.5217 9.11249 17.4373 9.28124C17.3248 9.50624 14.5686 14.8219 8.99981 14.8219ZM1.85605 8.99999C2.4748 10.0406 4.89356 13.5562 8.99981 13.5562C13.1061 13.5562 15.5248 10.0406 16.1436 8.99999C15.5248 7.95936 13.1061 4.44374 8.99981 4.44374C4.89356 4.44374 2.4748 7.95936 1.85605 8.99999Z" />
                        <path d="M9 11.3906C7.67812 11.3906 6.60938 10.3219 6.60938 9C6.60938 7.67813 7.67812 6.60938 9 6.60938C10.3219 6.60938 11.3906 7.67813 11.3906 9C11.3906 10.3219 10.3219 11.3906 9 11.3906ZM9 7.875C8.38125 7.875 7.875 8.38125 7.875 9C7.875 9.61875 8.38125 10.125 9 10.125C9.61875 10.125 10.125 9.61875 10.125 9C10.125 8.38125 9.61875 7.875 9 7.875Z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => openDelete(c)}
                      className="btn !border-none bg-red-600 p-3 text-gray-200 hover:bg-red-600/80"
                      disabled={isDeleting}
                    >
                      {isDeleting && editingCoupon?._id === c._id ? (
                        <Spinner />
                      ) : (
                        <DeleteIcon />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {totalItems === 0 && (
          <div className="py-8 text-center text-gray-500 dark:text-gray-400">
            {searchQuery ? 'No coupons match your search.' : 'No coupons found.'}
          </div>
        )}
      </div>

      <PaginationComponent
        currentPage={currentPage}
        totalPages={Math.ceil(totalItems / itemsPerPage)}
        onPageChange={setCurrentPage}
      />

      {/* ────── COUPON MODAL ────── */}
      {showModal && modalMode && (
        <CouponModal
          mode={modalMode}
          coupon={editingCoupon}
          onClose={closeModal}
          onSubmit={onSubmit}
        />
      )}

      {/* ────── DELETE CONFIRMATION ────── */}
      {showModal && editingCoupon && modalMode === null && (
        <ReusableAlert
          title="Confirm Deletion"
          content={`Are you sure you want to delete the coupon "${editingCoupon.code}"?`}
          func={handleDelete}
          isOpen={showModal}
          functionTitle="Delete"
          buttonStyle="bg-red-600"
          onClose={closeModal}
        />
      )}
    </div>
  );
}