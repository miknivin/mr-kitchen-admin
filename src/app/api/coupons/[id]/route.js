// app/api/coupons/[id]/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connection';
import Coupon from '@/models/Coupon';
import { isAuthenticatedUser, authorizeRoles } from '@/middlewares/auth';

// GET: Single coupon
export async function GET(req, { params }) {
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

    const coupon = await Coupon.findById(params.id);
    if (!coupon) {
      return NextResponse.json(
        { success: false, message: 'Coupon not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, coupon },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// PUT: Update coupon
export async function PUT(req, { params }) {
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

    // Validate date logic if both dates are provided
    if (data.startDate && data.endDate) {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      if (start >= end) {
        return NextResponse.json(
          { success: false, message: 'Valid From date must be before Valid Until date.' },
          { status: 400 }
        );
      }
    }

    const coupon = await Coupon.findByIdAndUpdate(params.id, data, {
      new: true,
      runValidators: true,
    });

    if (!coupon) {
      return NextResponse.json(
        { success: false, message: 'Coupon not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, coupon },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// DELETE: Delete coupon
export async function DELETE(req, { params }) {
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

    const coupon = await Coupon.findByIdAndDelete(params.id);
    if (!coupon) {
      return NextResponse.json(
        { success: false, message: 'Coupon not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Coupon deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}