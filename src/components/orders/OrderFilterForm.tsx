"use client";

import React, { useState } from "react";

interface FilterOptions {
  status?: string;
  paymentMethod?: string;
  startDate?: string;
  endDate?: string;
  userId?: string;
  search?: string;
  minTotal?: number;
  maxTotal?: number;
  hasWaybill?: boolean;
}

interface FilterFormProps {
  onApply: (filters: FilterOptions) => void; // Callback to pass filter values to parent
}

const FilterForm: React.FC<FilterFormProps> = ({ onApply }) => {
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPaymentMethod, setFilterPaymentMethod] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [filterUserId, setFilterUserId] = useState("");
  const [filterSearch, setFilterSearch] = useState("");
  const [filterMinTotal, setFilterMinTotal] = useState("");
  const [filterMaxTotal, setFilterMaxTotal] = useState("");
  const [filterHasWaybill, setFilterHasWaybill] = useState<string>("");

  const handleApply = () => {
    const filters: FilterOptions = {
      ...(filterStatus && { status: filterStatus }),
      ...(filterPaymentMethod && { paymentMethod: filterPaymentMethod }),
      ...(filterStartDate && { startDate: filterStartDate }),
      ...(filterEndDate && { endDate: filterEndDate }),
      ...(filterUserId && { userId: filterUserId }),
      ...(filterSearch && { search: filterSearch }),
      ...(filterMinTotal && { minTotal: parseFloat(filterMinTotal) }),
      ...(filterMaxTotal && { maxTotal: parseFloat(filterMaxTotal) }),
      ...(filterHasWaybill !== "" && {
        hasWaybill: filterHasWaybill === "true",
      }),
    };
    onApply(filters);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-stroke p-4 dark:border-strokedark">
        <h2 className="text-lg font-semibold text-black dark:text-white">
          Filter Orders
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black dark:text-white">
              Order Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="ready to ship">Ready to Ship</option>
              <option value="manifested">Manifested</option>
              <option value="in transit">In Transit</option>
              <option value="out for delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="rto">Return to Origin (RTO)</option>
              <option value="lost">Lost</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-black dark:text-white">
              Payment Method
            </label>
            <select
              value={filterPaymentMethod}
              onChange={(e) => setFilterPaymentMethod(e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
            >
              <option value="">All Methods</option>
              <option value="Online">Online</option>
              <option value="COD">Cash on Delivery</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-black dark:text-white">
              Start Date
            </label>
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black dark:text-white">
              End Date
            </label>
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black dark:text-white">
              Search (Name, Email, Notes, Waybill)
            </label>
            <input
              type="text"
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              placeholder="Search by name, email, notes, or waybill"
              className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black dark:text-white">
              Minimum Total Amount
            </label>
            <input
              type="number"
              value={filterMinTotal}
              onChange={(e) => setFilterMinTotal(e.target.value)}
              placeholder="Enter min amount"
              className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black dark:text-white">
              Maximum Total Amount
            </label>
            <input
              type="number"
              value={filterMaxTotal}
              onChange={(e) => setFilterMaxTotal(e.target.value)}
              placeholder="Enter max amount"
              className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black dark:text-white">
              Has Waybill
            </label>
            <select
              value={filterHasWaybill}
              onChange={(e) => setFilterHasWaybill(e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
            >
              <option value="">All</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
        </div>
      </div>
      <div className="border-t border-stroke p-4 dark:border-strokedark">
        <button
          onClick={handleApply}
          className="w-full rounded bg-primary px-4 py-2 text-sm text-white hover:bg-primary/70 focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default FilterForm;
