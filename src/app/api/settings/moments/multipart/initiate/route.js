import { NextResponse } from "next/server";
import crypto from "crypto";
import {
  S3Client,
  CreateMultipartUploadCommand,
  UploadPartCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const validateFileType = (fileName) => {
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".mp4", ".pdf",".JPEG"];
  const extension = fileName.split(".").pop().toLowerCase();
  return allowedExtensions.includes(`.${extension}`);
};

export async function POST(req) {
  try {
    const { fileName, fileType, partCount } = await req.json();

    if (!fileName || !fileType || !partCount) {
      return NextResponse.json(
        { error: "File name, type, productId, and partCount are required" },
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

    // Initiate multipart upload
    const createParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileKey,
      ContentType: fileType,
    };
    const createCommand = new CreateMultipartUploadCommand(createParams);
    const { UploadId } = await s3Client.send(createCommand);

    // Generate presigned URLs for each part
    const presignedUrls = {};
    for (let partNumber = 1; partNumber <= partCount; partNumber++) {
      const uploadPartParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileKey,
        UploadId,
        PartNumber: partNumber,
      };
      const uploadPartCommand = new UploadPartCommand(uploadPartParams);
      const presignedUrl = await getSignedUrl(s3Client, uploadPartCommand, {
        expiresIn: 3600,
      });
      presignedUrls[partNumber] = presignedUrl;
    }

    return NextResponse.json({
      uploadId: UploadId,
      fileKey,
      presignedUrls,
      originalFileName: fileName,
    });
  } catch (error) {
    console.error("Error initiating multipart upload:", error);
    return NextResponse.json(
      { error: "Failed to initiate multipart upload" },
      { status: 500 },
    );
  }
}
