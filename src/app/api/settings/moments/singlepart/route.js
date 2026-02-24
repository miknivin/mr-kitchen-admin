import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import dbConnect from "@/lib/db/connection"; // Import dbConnect
import WebsiteSettings from "./../../../../../models/WebsiteSettings";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const validateFileType = (fileName) => {
  const allowedExtensions = [
    ".mp4",
    ".avi",
    ".mov",
    ".JPEG",
    ".jpg",
    ".webp",
    ".png",
  ];
  const extension = fileName.split(".").pop()?.toLowerCase();
  return allowedExtensions.includes(`.${extension}`);
};

export async function POST(req) {
  try {
    const { fileName, fileType } = await req.json();

    if (!fileName || !fileType) {
      return NextResponse.json(
        { error: "File name and type are required" },
        { status: 400 },
      );
    }

    if (!validateFileType(fileName)) {
      return NextResponse.json(
        { error: "Unsupported file type" },
        { status: 400 },
      );
    }

    const fileKey = `moments/${crypto.randomUUID()}-${fileName}`;
    const putParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileKey,
      ContentType: fileType,
    };
    const putCommand = new PutObjectCommand(putParams);
    const presignedUrl = await getSignedUrl(s3Client, putCommand, {
      expiresIn: 3600,
    });

    // Generate the final CloudFront URL
    const finalUrl = `${process.env.CLOUDFRONT_DOMAIN}/${fileKey}`;

    // Connect to MongoDB and save the URL
    await dbConnect();
    const updatedSettings = await WebsiteSettings.findOneAndUpdate(
      {}, // Match any document
      { $push: { moments: finalUrl } },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    return NextResponse.json({
      presignedUrl,
      fileKey,
      finalUrl,
      moments: updatedSettings.moments,
    });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return NextResponse.json(
      { error: "Failed to generate presigned URL" },
      { status: 500 },
    );
  }
}
