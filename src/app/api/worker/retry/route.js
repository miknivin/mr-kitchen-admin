import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export async function POST(req) {
  const token = req.headers.get("x-cron-token");
  if (!token || token !== process.env.CRON_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const keys = await redis.keys("delhivery:payload:*");
    for (const key of keys) {
      const payloadId = key.split(":").pop();
      await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/worker/delhivery-process`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.INTERNAL_API_TOKEN}`,
          },
          body: JSON.stringify({ payloadId }),
        },
      );
    }
    return NextResponse.json(
      { message: `Retried ${keys.length} payloads` },
      { status: 200 },
    );
  } catch (error) {
    console.error("Retry error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
