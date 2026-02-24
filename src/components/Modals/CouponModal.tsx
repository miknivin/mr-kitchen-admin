// src/components/Modals/CouponModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { Coupon } from '@/types/coupon';

interface CouponModalProps {
  mode: 'add' | 'edit';
  coupon?: Coupon | null;
  onClose: () => void;
  onSubmit: (data: Partial<Coupon>) => Promise<void>;
}

export default function CouponModal({ mode, coupon, onClose, onSubmit }: CouponModalProps) {
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [minimumPurchase, setMinimumPurchase] = useState('');
  const [maximumDiscount, setMaximumDiscount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [dateError, setDateError] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const getMinEndDate = () => {
    if (!startDate) return today;
    const next = new Date(startDate);
    next.setDate(next.getDate() + 1);
    return next.toISOString().split('T')[0];
  };

  useEffect(() => {
    if (mode === 'edit' && coupon) {
      setCode(coupon.code);
      setDescription(coupon.description ?? '');
      setDiscountType(coupon.discountType);
      setDiscountValue(coupon.discountValue.toString());
      setMinimumPurchase(coupon.minimumPurchase?.toString() ?? '');
      setMaximumDiscount(coupon.maximumDiscount?.toString() ?? '');
      setStartDate(new Date(coupon.startDate).toISOString().split('T')[0]);
      setEndDate(new Date(coupon.endDate).toISOString().split('T')[0]);
      setUsageLimit(coupon.usageLimit?.toString() ?? '');
      setIsActive(coupon.isActive);
    } else {
      setCode('');
      setDescription('');
      setDiscountType('percentage');
      setDiscountValue('');
      setMinimumPurchase('');
      setMaximumDiscount('');
      setStartDate('');
      setEndDate('');
      setUsageLimit('');
      setIsActive(true);
    }
  }, [mode, coupon]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate that startDate is before endDate
    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      setDateError('Valid From date must be before Valid Until date');
      return;
    }

    setDateError(''); // Clear any previous errors

    const payload: Partial<Coupon> = {
      code,
      description,
      discountType,
      discountValue: Number(discountValue),
      minimumPurchase: minimumPurchase ? Number(minimumPurchase) : undefined,
      maximumDiscount: maximumDiscount ? Number(maximumDiscount) : undefined,
      startDate,
      endDate,
      usageLimit: usageLimit ? Number(usageLimit) : undefined,
      isActive: mode === 'edit' ? isActive : true,
    };

    await onSubmit(payload);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 overflow-y-auto"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl dark:bg-gray-800"
        style={{ maxHeight: '95vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 pt-10 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {mode === 'add' ? 'Add New Coupon' : 'Edit Coupon'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto" style={{ maxHeight: 'calc(95vh - 140px)' }}>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Coupon Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            {/* Discount Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Discount Type <span className="text-red-500">*</span>
              </label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'fixed')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>

            {/* Discount Value */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Discount Value <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                required
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            {/* Minimum Purchase */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Minimum Purchase (optional)
              </label>
              <input
                type="number"
                value={minimumPurchase}
                onChange={(e) => setMinimumPurchase(e.target.value)}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            {/* Maximum Discount (only for percentage) */}
            {discountType === 'percentage' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Maximum Discount (optional)
                </label>
                <input
                  type="number"
                  value={maximumDiscount}
                  onChange={(e) => setMaximumDiscount(e.target.value)}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            )}

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Valid From <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    const newStartDate = e.target.value;
                    setStartDate(newStartDate);
                    setDateError(''); // Clear error on change
                    
                    // Auto-adjust endDate if it becomes invalid
                    if (endDate && newStartDate && new Date(newStartDate) >= new Date(endDate)) {
                      const nextDay = new Date(newStartDate);
                      nextDay.setDate(nextDay.getDate() + 1);
                      setEndDate(nextDay.toISOString().split('T')[0]);
                    }
                  }}
                  min={today}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Valid Until <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setDateError(''); // Clear error on change
                  }}
                  min={getMinEndDate()}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            {/* Date Error Message */}
            {dateError && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <p className="text-sm text-red-600 dark:text-red-400">{dateError}</p>
              </div>
            )}

            {/* Usage Limit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Usage Limit (optional)
              </label>
              <input
                type="number"
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            {/* Active Toggle (Edit only) */}
            {mode === 'edit' && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Active
                </label>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full py-3 px-4 bg-primary text-white font-medium rounded-md hover:bg-primary/90 transition duration-200"
              >
                {mode === 'add' ? 'Create Coupon' : 'Update Coupon'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}