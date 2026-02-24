import { NextResponse } from "next/server";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import WebsiteSettings from "@/models/WebsiteSettings";
import dbConnect from "@/lib/db/connection";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function DELETE(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { url } = body;
    const decodedUrl = decodeURIComponent(url);

    // Validate URL format
    const isValidUrl = decodedUrl.toLowerCase().startsWith("https://");
    console.log("URL Regex Test Result:", isValidUrl);

    if (!isValidUrl) {
      return NextResponse.json(
        { message: "Invalid URL format", decodedUrl },
        { status: 400 },
      );
    }

    // Extract S3 key from CloudFront URL
    const urlObj = new URL(decodedUrl);
    const s3Key = urlObj.pathname.startsWith("/")
      ? urlObj.pathname.slice(1)
      : urlObj.pathname;
    console.log("S3 Key:", s3Key);

    if (!s3Key) {
      return NextResponse.json(
        { message: "Invalid S3 key derived from URL" },
        { status: 400 },
      );
    }

    // Delete object from S3
    const deleteCommand = new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: s3Key,
    });
    await s3Client.send(deleteCommand);

    // Update WebsiteSettings document
    const updatedSettings = await WebsiteSettings.findOneAndUpdate(
      {},
      { $pull: { moments: decodedUrl } },
      { new: true },
    );

    if (!updatedSettings) {
      return NextResponse.json(
        { message: "Website settings not found" },
        { status: 404 },
      );
    }

    if (updatedSettings.moments.includes(decodedUrl)) {
      return NextResponse.json(
        { message: "Failed to remove the URL from database" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      message: "Video successfully deleted from S3 and removed from moments",
      moments: updatedSettings.moments,
    });
  } catch (error) {
    console.error("Error deleting video:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 },
    );
  }
}
