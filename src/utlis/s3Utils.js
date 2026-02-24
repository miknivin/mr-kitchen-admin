import toast from "react-hot-toast";

// Fallback for file type based on extension
const getFileTypeFromName = (fileName) => {
  const extension = fileName.slice(fileName.lastIndexOf(".")).toLowerCase();
  const typeMap = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".mp4": "video/mp4",
  };
  return typeMap[extension] || "application/octet-stream";
};

// Single-part upload function
export const uploadSinglePart = async ({
  file,
  fileName,
  fileType,
  productId,
  onProgress,
  getPresignedUrl,
}) => {
  const controller = new AbortController();
  try {
    const resolvedFileType =
      fileType || file.type || getFileTypeFromName(fileName);

    // Construct the body for getPresignedUrl as per the controller's expected input
    const response = await getPresignedUrl({
      filename: fileName,
      bucket: "inherbzdescriptionimages", // Use the environment variable bucket name
      operation: "upload",
      productId,
      expiresIn: 3600, // Default to 1 hour, can be adjusted
      contentType: resolvedFileType,
    }).unwrap();
    console.log(response, "single upload res");

    // Upload to presigned URL
    const uploadResponse = await fetch(response.url, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": resolvedFileType },
      signal: controller.signal,
    });

    if (!uploadResponse.ok) {
      throw new Error(`Upload failed: ${uploadResponse.statusText}`);
    }
    if (response && response?.fileKey) {
      const fileLocation = response?.fileKey;
      // Construct the file URL using the provided CloudFront URL
      const fileUrl = `https://dt23o2b8s8xs5.cloudfront.net/${fileLocation}`;
      console.log(fileUrl, "file url");

      toast.success(`File ${fileName} uploaded successfully`);
      return { url: fileUrl, public_id: fileName }; // Use fileName as public_id since key is filename in controller
    }
  } catch (error) {
    if (error.name === "AbortError") {
      toast.error(`Upload canceled for ${fileName}`);
    } else {
      toast.error(`Failed to upload ${fileName}: ${error.message}`);
    }
    throw error;
  }
};

// Multipart upload function
export const uploadMultipart = async ({
  file,
  fileName,
  fileType,
  productId,
  partSize = 5 * 1024 * 1024,
  onProgress,
  initiateMultipartUpload,
  completeMultipartUpload,
  abortMultipartUpload,
}) => {
  const controller = new AbortController();
  const partCount = Math.ceil(file.size / partSize);
  let uploadId = null;
  let fileKey = null;
  let originalFileName = null;

  try {
    const resolvedFileType =
      fileType || file.type || getFileTypeFromName(fileName);
    // Initiate multipart upload
    const initResponse = await initiateMultipartUpload({
      fileName,
      fileType: resolvedFileType,
      productId,
      partCount,
    }).unwrap();

    uploadId = initResponse.uploadId;
    fileKey = initResponse.fileKey;
    originalFileName = initResponse.originalFileName;

    if (
      !initResponse.presignedUrls ||
      Object.keys(initResponse.presignedUrls).length < partCount
    ) {
      throw new Error(
        `Invalid presignedUrls: expected ${partCount} parts, received ${Object.keys(initResponse.presignedUrls || {}).length}`,
      );
    }

    // Upload parts concurrently
    const uploadPromises = [];
    for (let i = 0; i < partCount; i++) {
      const start = i * partSize;
      const end = Math.min(start + partSize, file.size);
      const partBlob = file.slice(start, end);
      const partNumber = i + 1; // Use 1-based indexing for backend compatibility

      uploadPromises.push(
        (async () => {
          try {
            const presignedUrl = initResponse.presignedUrls[partNumber];
            if (!presignedUrl) {
              throw new Error(`Presigned URL for part ${partNumber} not found`);
            }
            const response = await fetch(presignedUrl, {
              method: "PUT",
              body: partBlob,
              headers: { "Content-Type": resolvedFileType },
              signal: controller.signal,
            });
            if (!response.ok) {
              throw new Error(
                `Part ${partNumber} upload failed: ${response.statusText}`,
              );
            }
            const etag = response.headers.get("ETag");
            return { etag, partNumber }; // Return 1-based partNumber
          } catch (error) {
            throw new Error(
              `Part ${partNumber} upload error: ${error.message}`,
            );
          }
        })(),
      );
    }

    const parts = await Promise.all(uploadPromises);

    // Complete multipart upload
    const completedReq = await completeMultipartUpload({
      fileKey,
      uploadId,
      parts: parts.map((part) => ({
        etag: part.etag,
        partNumber: part.partNumber, // Use 1-based partNumber
      })),
    }).unwrap();
    console.log(completedReq, "completed");
    if (completedReq && completedReq.key) {
      const fileUrl = `https://dt23o2b8s8xs5.cloudfront.net/${completedReq.key}`;
      toast.success(`File ${fileName} uploaded successfully`);
      return { url: fileUrl, public_id: fileKey };
    }
  } catch (error) {
    if (error.name === "AbortError") {
      toast.error(`Upload canceled for ${fileName}`);
    } else {
      toast.error(`Failed to upload ${fileName}: ${error.message}`);
    }
    // Abort multipart upload on error
    if (uploadId && fileKey) {
      try {
        await abortMultipartUpload({ fileKey, uploadId, productId }).unwrap();
      } catch (abortError) {
        toast.error(`Failed to abort multipart upload for ${fileName}`);
      }
    }
    throw error;
  }
};
