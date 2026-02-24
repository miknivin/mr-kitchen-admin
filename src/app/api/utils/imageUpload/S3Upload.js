import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function uploadFilesToS3(files) {
  if (!files || files.length === 0) {
    throw new Error("No files provided");
  }

  const CLOUDFRONT_DOMAIN =
    process.env.CLOUDFRONT_DOMAIN || "https://d229x2i5qj11ya.cloudfront.net";
  const CF_BASE = CLOUDFRONT_DOMAIN.endsWith("/")
    ? CLOUDFRONT_DOMAIN
    : `${CLOUDFRONT_DOMAIN}/`;

  const uploadedFiles = [];

  for (const file of files) {
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const uniqueId = Math.floor(100000 + Math.random() * 900000); // 6-digit ID
    const timestamp = Date.now();
    const uniqueFileName = `${uniqueId}-${timestamp}${file.name}`;

    console.log("Uploading:", uniqueFileName);

    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `uploads/${uniqueFileName}`,
      Body: fileBuffer,
      ContentType: file.type,
    };

    const command = new PutObjectCommand(uploadParams);
    await s3.send(command);

    // Construct CloudFront URL instead of S3
    const fileUrl = `${CF_BASE}uploads/${uniqueFileName}`;

    uploadedFiles.push({ url: fileUrl, alt: file.name });
  }

  return uploadedFiles;
}