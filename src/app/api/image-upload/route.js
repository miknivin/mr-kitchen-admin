import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Configure AWS S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Supported image formats
const ALLOWED_EXTENSIONS = ["png", "jpg", "jpeg", "webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
const BUCKET_NAME = process.env.AWS_BUCKET_NAME || "kids-bags";
const CLOUDFRONT_DOMAIN =
  process.env.CLOUDFRONT_DOMAIN || "https://d229x2i5qj11ya.cloudfront.net";

export async function POST(request) {
  try {
    const { fileName, fileType, productId } = await request.json();
    // Validate file type
    const extension = fileName.split(".").pop()?.toLowerCase();
    if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
      return NextResponse.json(
        {
          error:
            "Invalid file type. Only .png, .jpg, .jpeg, .webp are allowed.",
        },
        { status: 400 },
      );
    }

    // Validate file type from MIME type
    if (!fileType.match(/^image\/(png|jpeg|webp)$/)) {
      return NextResponse.json(
        {
          error:
            "Invalid MIME type. Only image/png, image/jpeg, image/webp are allowed.",
        },
        { status: 400 },
      );
    }

    // Generate file key
    const fileKey = `uploads/${productId}/a-plus-content/${Date.now()}-${fileName}`;

    // Create PutObject command
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
      ContentType: fileType,
    });

    // Generate presigned URL
    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });

    // Generate final URL using CloudFront domain
    const finalUrl = `${CLOUDFRONT_DOMAIN}/${fileKey}`;

    return NextResponse.json({
      presignedUrl,
      fileKey,
      finalUrl,
    });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return NextResponse.json(
      { error: "Failed to generate presigned URL" },
      { status: 500 },
    );
  }
}
