import { NextResponse } from "next/server";
import { S3Client, AbortMultipartUploadCommand } from "@aws-sdk/client-s3";

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
    const { fileKey, uploadId } = await req.json();

    if (!fileKey || !uploadId) {
      return NextResponse.json(
        { error: "File key and uploadId are required" },
        { status: 400 },
      );
    }

    const abortParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileKey,
      UploadId: uploadId,
    };
    const abortCommand = new AbortMultipartUploadCommand(abortParams);
    await s3Client.send(abortCommand);

    return NextResponse.json({
      success: true,
      message: "Multipart upload aborted successfully",
    });
  } catch (error) {
    console.error("Error aborting multipart upload:", error);
    return NextResponse.json(
      { error: "Failed to abort multipart upload" },
      { status: 500 },
    );
  }
}
