import { NextResponse } from "next/server";

export async function GET(req) {
  const response = NextResponse.json(
    { message: "Logged Out" },
    { status: 200 },
  );

  response.cookies.set("adminToken", "", {
    expires: new Date(Date.now()), // Expire immediately
    httpOnly: true,
  });

  return response;
}
