import dbConnect from '@/lib/db/connection';
import { isAuthenticatedUser } from '@/middlewares/auth';
import Order from '@/models/Order';
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        await dbConnect();
        const user = await isAuthenticatedUser(req);
        
        if (!user) return; 

        const body = await req.json();
        
        const {
            orderItems,
            shippingInfo,
            itemsPrice,
            taxAmount,
            shippingAmount,
            totalAmount,
            paymentMethod,
            paymentInfo,
        } = body;

        const order = await Order.create({
            orderItems,
            shippingInfo,
            itemsPrice,
            taxAmount,
            shippingAmount,
            totalAmount,
            paymentMethod,
            paymentInfo,
            user: user._id, // Ensure you use the authenticated user
        });

        return NextResponse.json(
            { success: true, order },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { success: false, message: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
