import { NextResponse } from "next/server";
import User from "@/models/User";
import dbConnect from "@/lib/db/connection";
import sendToken from "@/utlis/sendToken";



export async function POST(request) {
  try {
    await dbConnect();
    const { name, email, password, role } = await request.json();

    const user = await User.create({
      name,
      email,
      password,
      role: role || "user",
    });

    return sendToken(user, 201);
  } catch (error) {
    return NextResponse.json(
      { error: error?.message || "Internal Server Erroe" },
      { status: 500 }
    );
  }
}
