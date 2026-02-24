import dbConnect from "@/lib/db/connection";
import WebsiteSettings from "../../../../models/WebsiteSettings";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();

    const settings = await WebsiteSettings.findOne().select("moments").lean();
   
    if (!settings || !settings.moments) {
      return NextResponse.json({ success: true, data: [] }, { status: 200 });
    }

    return NextResponse.json(
      { success: true, data: settings.moments },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching moments:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch moments" },
      { status: 500 },
    );
  }
}
