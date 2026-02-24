import Order from "@/models/Order";
import mongoose, { Model } from "mongoose";

interface FilterCriteria {
  status?: string;
  paymentMethod?: string;
  userId?: string;
  minTotalAmount?: number;
  maxTotalAmount?: number;
  startDate?: Date;
  endDate?: Date;
  waybill?: string; // Specific waybill filter
  hasWaybill?: boolean; // Filter for orders with or without waybill
}

interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

class OrderFilter {
  private model: Model<any>;

  constructor() {
    this.model = Order;
  }

  async filterOrders(
    criteria: FilterCriteria = {},
    pagination: PaginationOptions = {
      page: 1,
      limit: 10,
      sortBy: "createdAt",
      sortOrder: "desc",
    },
  ) {
    const query: any = {};

    // Filter by order status
    if (criteria.status) {
      query.orderStatus = criteria.status;
    }

    // Filter by payment method
    if (criteria.paymentMethod) {
      query.paymentMethod = criteria.paymentMethod;
    }

    // Filter by user ID
    if (criteria.userId) {
      query.user = new mongoose.Types.ObjectId(criteria.userId);
    }

    // Filter by total amount range
    if (criteria.minTotalAmount || criteria.maxTotalAmount) {
      query.totalAmount = {};
      if (criteria.minTotalAmount) {
        query.totalAmount.$gte = criteria.minTotalAmount;
      }
      if (criteria.maxTotalAmount) {
        query.totalAmount.$lte = criteria.maxTotalAmount;
      }
    }

    // Filter by date range
    if (criteria.startDate || criteria.endDate) {
      query.createdAt = {};
      if (criteria.startDate) {
        query.createdAt.$gte = criteria.startDate;
      }
      if (criteria.endDate) {
        query.createdAt.$lte = criteria.endDate;
      }
    }

    // Filter by specific waybill
    if (criteria.waybill) {
      query.waybill = criteria.waybill;
    }

    // Filter for orders with or without waybill
    if (criteria.hasWaybill !== undefined) {
      query.waybill = criteria.hasWaybill
        ? { $exists: true, $ne: null }
        : { $exists: false };
    }

    // Pagination and sorting
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const skip = (page - 1) * limit;
    const sort: any = {};
    if (pagination.sortBy) {
      sort[pagination.sortBy] = pagination.sortOrder === "asc" ? 1 : -1;
    }

    try {
      const orders = await this.model
        .find(query)
        .populate("user", "name email") // Populate user details
        .populate("orderItems.product", "name") // Populate product details
        .sort(sort)
        .skip(skip)
        .limit(limit);

      const total = await this.model.countDocuments(query);

      return {
        orders,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Error filtering orders: ${errorMessage}`);
    }
  }

  // Get orders by specific user
  async getOrdersByUser(userId: string, pagination: PaginationOptions = {}) {
    return this.filterOrders({ userId }, pagination);
  }

  // Get orders by status
  async getOrdersByStatus(status: string, pagination: PaginationOptions = {}) {
    return this.filterOrders({ status }, pagination);
  }

  // Get orders by payment method
  async getOrdersByPaymentMethod(
    paymentMethod: string,
    pagination: PaginationOptions = {},
  ) {
    return this.filterOrders({ paymentMethod }, pagination);
  }

  // Get orders by specific waybill
  async getOrderByWaybill(waybill: string, pagination: PaginationOptions = {}) {
    return this.filterOrders({ waybill }, pagination);
  }

  // Get orders with any waybill
  async getOrdersWithWaybill(pagination: PaginationOptions = {}) {
    return this.filterOrders({ hasWaybill: true }, pagination);
  }

  // Get orders without waybill
  async getOrdersWithoutWaybill(pagination: PaginationOptions = {}) {
    return this.filterOrders({ hasWaybill: false }, pagination);
  }
}

export default OrderFilter;
