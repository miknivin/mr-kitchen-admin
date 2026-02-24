// app/api/coupons/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connection';
import Coupon from '@/models/Coupon';
import { isAuthenticatedUser, authorizeRoles } from '@/middlewares/auth';

// GET: Fetch all coupons (Admin only)
export async function GET(req) {
  try {
    await dbConnect();

    const user = await isAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Need to login' },
        { status: 401 }
      );
    }

    authorizeRoles(user, 'admin');

    const coupons = await Coupon.find().sort({ createdAt: -1 });

    return NextResponse.json(
      { success: true, coupons },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST: Create new coupon (Admin only)
export async function POST(req) {
  try {
    await dbConnect();

    const user = await isAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Need to login' },
        { status: 401 }
      );
    }

    authorizeRoles(user, 'admin');

    const data = await req.json();

    // Validate required fields
    const { code, description, discountType, discountValue, startDate, endDate } = data;
    if (!code || !description || !discountType || !discountValue || !startDate || !endDate) {
      return NextResponse.json(
        { success: false, message: 'Please provide all required fields.' },
        { status: 400 }
      );
    }

    // Validate date logic
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) {
      return NextResponse.json(
        { success: false, message: 'Valid From date must be before Valid Until date.' },
        { status: 400 }
      );
    }

    const coupon = await Coupon.create(data);

    return NextResponse.json(
      { success: true, coupon },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}