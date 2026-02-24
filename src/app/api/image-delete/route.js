// app/api/image-delete/route.ts
import { NextResponse } from "next/server";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.AWS_BUCKET_NAME;

export async function POST(request) {
  try {
    const { fileKey } = await request.json();

    if (!fileKey) {
      return NextResponse.json(
        { error: "fileKey is required" },
        { status: 400 }
      );
    }

    const command = new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: fileKey,
    });

    await s3.send(command);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("S3 delete error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to delete image" },
      { status: 500 }
    );
  }
}