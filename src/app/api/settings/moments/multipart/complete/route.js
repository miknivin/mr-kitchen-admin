import { NextResponse } from "next/server";
import { S3Client, CompleteMultipartUploadCommand } from "@aws-sdk/client-s3";
import dbConnect from "@/lib/db/connection";
import WebsiteSettings from "../../../../../../models/WebsiteSettings";
// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function POST(req) {
  try {
    const { fileKey, uploadId, parts } = await req.json();

    if (!fileKey || !uploadId || !parts) {
      return NextResponse.json(
        { error: "File key, uploadId, and parts are required" },
        { status: 400 },
      );
    }

    // Complete the multipart upload
    const completeParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileKey,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: parts.map((part) => ({
          ETag: part.etag,
          PartNumber: part.partNumber,
        })),
      },
    };
    const completeCommand = new CompleteMultipartUploadCommand(completeParams);
    const completeRes = await s3Client.send(completeCommand);

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
      key: completeRes?.Key,
      success: true,
      finalUrl,
      moments: updatedSettings.moments,
    });
  } catch (error) {
    console.error("Error completing multipart upload:", error);
    return NextResponse.json(
      { error: "Failed to complete multipart upload" },
      { status: 500 },
    );
  }
}
