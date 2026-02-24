import { NextRequest } from "next/server"; // Changed from 'Request' to 'NextRequest'
import Order from "@/models/Order";
import mongoose from "mongoose";

interface FilterOptions {
  status?: string;
  paymentMethod?: string;
  startDate?: string;
  endDate?: string;
  userId?: string;
  search?: string;
  minTotal?: number;
  maxTotal?: number;
  hasWaybill?: boolean; // New filter option for waybill
}

export class OrderFilter {
  private query: mongoose.Query<any, any>;
  private filterOptions: FilterOptions;

  constructor(filterOptions: FilterOptions = {}) {
    this.filterOptions = filterOptions;
    this.query = Order.find();
  }

  // Filter by order status
  // Filter by order status (prefers delhiveryCurrentOrderStatus if it exists)
  filterByStatus(): this {
    if (this.filterOptions.status) {
      const status = this.filterOptions.status.toLowerCase();

      this.query = this.query.where({
        $or: [
          {
            delhiveryCurrentOrderStatus: {
              $regex: new RegExp(`^${status}$`, "i"),
            },
          },
          {
            $and: [
              { delhiveryCurrentOrderStatus: { $exists: false } },
              { orderStatus: { $regex: new RegExp(`^${status}$`, "i") } },
            ],
          },
        ],
      });
    }
    return this;
  }

  // Filter by payment method
  filterByPaymentMethod(): this {
    if (this.filterOptions.paymentMethod) {
      this.query = this.query
        .where("paymentMethod")
        .equals(this.filterOptions.paymentMethod);
    }
    return this;
  }

  // Filter by date range
  filterByDateRange(): this {
    if (this.filterOptions.startDate || this.filterOptions.endDate) {
      const dateFilter: { createdAt?: { $gte?: Date; $lte?: Date } } = {};
      if (this.filterOptions.startDate) {
        dateFilter.createdAt = {
          ...dateFilter.createdAt,
          $gte: new Date(this.filterOptions.startDate),
        };
      }
      if (this.filterOptions.endDate) {
        dateFilter.createdAt = {
          ...dateFilter.createdAt,
          $lte: new Date(this.filterOptions.endDate),
        };
      }
      this.query = this.query.where(dateFilter);
    }
    return this;
  }

  // Filter by user ID
  filterByUser(): this {
    if (this.filterOptions.userId) {
      this.query = this.query.where("user").equals(this.filterOptions.userId);
    }
    return this;
  }

  // Filter by total amount range
  filterByTotalAmount(): this {
    if (this.filterOptions.minTotal || this.filterOptions.maxTotal) {
      const amountFilter: { totalAmount?: { $gte?: number; $lte?: number } } =
        {};
      if (this.filterOptions.minTotal) {
        amountFilter.totalAmount = {
          ...amountFilter.totalAmount,
          $gte: this.filterOptions.minTotal,
        };
      }
      if (this.filterOptions.maxTotal) {
        amountFilter.totalAmount = {
          ...amountFilter.totalAmount,
          $lte: this.filterOptions.maxTotal,
        };
      }
      this.query = this.query.where(amountFilter);
    }
    return this;
  }

  // Search by order details (e.g., fullName, email, orderNotes)
  search(): this {
    if (this.filterOptions.search) {
      const searchRegex = new RegExp(this.filterOptions.search, "i");
      this.query = this.query.or([
        { "shippingInfo.fullName": searchRegex },
        { "shippingInfo.email": searchRegex },
        { orderNotes: searchRegex },
        { waybill: searchRegex },
      ]);
    }
    return this;
  }

  // Filter orders with waybill
  filterWithWaybill(): this {
    if (this.filterOptions.hasWaybill === true) {
      this.query = this.query.where("waybill").ne(null).ne("");
    }
    return this;
  }

  // Filter orders without waybill
  filterWithoutWaybill(): this {
    if (this.filterOptions.hasWaybill === false) {
      this.query = this.query.where("waybill").in([null, ""]);
    }
    return this;
  }

  // Sort by createdAt (default: latest first)
  sort(): this {
    this.query = this.query.sort({ createdAt: -1 });
    return this;
  }

  select(fields: string): this {
    this.query = this.query.select(fields);
    return this;
  }

  // Execute the query
  async execute() {
    return await this.query.exec();
  }

  // Build and apply all filters
  async getFilteredOrders() {
    return this.filterByStatus()
      .filterByPaymentMethod()
      .filterByDateRange()
      .filterByUser()
      .filterByTotalAmount()
      .filterWithWaybill()
      .filterWithoutWaybill()
      .search()
      .sort()
      .execute();
  }

  // Static method to extract filter options from request
  static extractFilterOptions(req: NextRequest): FilterOptions {
    const url = new URL(req.url);
    const filterOptions: FilterOptions = {};

    if (url.searchParams.get("status")) {
      filterOptions.status = url.searchParams.get("status")!;
    }
    if (url.searchParams.get("paymentMethod")) {
      filterOptions.paymentMethod = url.searchParams.get("paymentMethod")!;
    }
    if (url.searchParams.get("startDate")) {
      filterOptions.startDate = url.searchParams.get("startDate")!;
    }
    if (url.searchParams.get("endDate")) {
      filterOptions.endDate = url.searchParams.get("endDate")!;
    }
    if (url.searchParams.get("userId")) {
      filterOptions.userId = url.searchParams.get("userId")!;
    }
    if (url.searchParams.get("search")) {
      filterOptions.search = url.searchParams.get("search")!;
    }
    if (url.searchParams.get("minTotal")) {
      filterOptions.minTotal = parseFloat(url.searchParams.get("minTotal")!);
    }
    if (url.searchParams.get("maxTotal")) {
      filterOptions.maxTotal = parseFloat(url.searchParams.get("maxTotal")!);
    }
    if (url.searchParams.get("hasWaybill")) {
      filterOptions.hasWaybill = url.searchParams.get("hasWaybill") === "true";
    }

    return filterOptions;
  }
}
