import { NextResponse } from "next/server";

const sendToken = (user, statusCode) => {
  const token = user?.getJwtToken();

  const cookieOptions = {
    httpOnly: true,
    maxAge: process.env.COOKIE_EXPIRES_TIME * 24 * 60 * 60, // in seconds
    path: "/",
    secure: process.env.NODE_ENV === "production",
  };
  //console.log("token miss prank");

  // Create the response
  const response = NextResponse.json(
    {
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    },
    { status: statusCode },
  );

  // Set the cookie in the response headers
  response.cookies.set("adminToken", token, cookieOptions);

  return response;
};

export default sendToken;
