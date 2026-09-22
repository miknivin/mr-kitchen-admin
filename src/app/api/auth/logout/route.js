import { NextResponse } from "next/server";

const clearAuthCookie = (response) => {
  response.cookies.set("adminToken", "", {
    path: "/",
    expires: new Date(0),
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  response.cookies.delete("adminToken");
};

export async function GET(req) {
  const response = NextResponse.json(
    { success: true, message: "Logged Out" },
    { status: 200 },
  );
  clearAuthCookie(response);
  return response;
}

export async function POST(req) {
  const response = NextResponse.json(
    { success: true, message: "Logged Out" },
    { status: 200 },
  );
  clearAuthCookie(response);
  return response;
}

