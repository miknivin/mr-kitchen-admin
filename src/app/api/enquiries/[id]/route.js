import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/db/connection";
import Enquiry from "@/models/Enquiry";
// DELETE: Delete an enquiry by ID
export async function DELETE(request, { params }) {
  try {
    await dbConnect();

    const { id } = params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid enquiry ID" },
        { status: 400 },
      );
    }

    // Find and delete the enquiry
    const enquiry = await Enquiry.findByIdAndDelete(id);

    if (!enquiry) {
      return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Enquiry deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting enquiry:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
