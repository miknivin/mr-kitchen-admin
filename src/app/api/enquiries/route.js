import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connection";
import Enquiry from "@/models/Enquiry";
import { isAuthenticatedUser, authorizeRoles } from "@/middlewares/auth";

export async function GET(req) {
  try {
    await dbConnect();

    const user = await isAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Need to login" },
        { status: 400 }
      );
    }

    authorizeRoles(user, "admin");

    const enquiries = await Enquiry.find().sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        data: enquiries,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await dbConnect();

    const { name, email, phone, subject, message } = await req.json();
    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, message: "Please provide name, email, and message" },
        { status: 400 }
      );
    }

    const enquiry = await Enquiry.create({
      name,
      email,
      phone,
      subject,
      message,
    });

    return NextResponse.json(
      { success: true, data: enquiry },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}