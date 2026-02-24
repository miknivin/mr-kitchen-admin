import jwt from "jsonwebtoken";

import User from "@/models/User";
import dbConnect from "@/lib/db/connection";
export const isAuthenticatedUser = async (req) => {
  await dbConnect();
  const token = req.cookies.get("adminToken")?.value;

  if (!token) {
    throw new Error("You need to login to access this resource");
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);

  if (!user) {
    throw new Error("User not found. Please login again.");
  }
  return user;
};

export const authorizeRoles = (user, ...roles) => {
  if (!roles.includes(user.role)) {
    throw new Error("Not allowed");
  }
};
