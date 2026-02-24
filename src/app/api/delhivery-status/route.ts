import axios from "axios";
import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {

  const { searchParams } = new URL(req.url);
  const waybill = searchParams.get("waybill");
  const refIds = searchParams.get("ref_ids") || "ORD1243244";

  const token = process.env.DELHIVERY_API_TOKEN; // Store your token in .env.local
  if (!token) {
    return NextResponse.json(
      { error: "Delhivery API token not set" },
      { status: 500 },
    );
  }

  try {
    const response = await axios.get(
      "https://track.delhivery.com/api/v1/packages/json/",
      {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        params: {
          waybill,
          ref_ids: refIds,
        },
      },
    );
    return NextResponse.json(response.data);
  } catch (error) {
    const errorMessage =
      typeof error === "object" && error !== null && "message" in error
        ? (error as { message: string }).message
        : String(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
