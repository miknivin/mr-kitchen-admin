"use client";

import { FC, FormEvent, ChangeEvent, useState } from "react";
import axios, { AxiosProgressEvent } from "axios";
import {
  useSingleUploadMutation,
  useInitiateMultipartUploadMutation,
  useCompleteMultipartUploadMutation,
  useAbortMultipartUploadMutation,
} from "@/redux/api/websiteSettingsApi";
import UploadIcon from "../Icons/UploadIcon";

interface UploadStatus {
  file: File;
  progress: number;
  error: string | null;
  finalUrl: string | null;
  uploadId?: string;
  fileKey?: string;
}

const UploadForm: FC = () => {
  const [files, setFiles] = useState<UploadStatus[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const [singleUpload] = useSingleUploadMutation();
  const [initiateUpload] = useInitiateMultipartUploadMutation();
  const [completeUpload] = useCompleteMultipartUploadMutation();
  const [abortUpload] = useAbortMultipartUploadMutation();

  const checkVideoAspectRatio = (file: File): Promise<string | null> => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        const aspectRatio = video.videoWidth / video.videoHeight;
        const targetAspectRatio = 9 / 16; // 0.5625 for 9:16
        if (Math.abs(aspectRatio - targetAspectRatio) > 0.1) {
          resolve(
            "Video must have a 9:16 portrait aspect ratio (e.g., 1080x1920)",
          );
        } else {
          resolve(null);
        }
      };
      video.onerror = () => {
        window.URL.revokeObjectURL(video.src);
        resolve("Failed to load video metadata");
      };
      video.src = window.URL.createObjectURL(file);
    });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files; // Type: FileList | null
    if (!fileList || fileList.length === 0) {
      return; // Exit if no files or null
    }

    const selectedFiles = Array.from(fileList).filter((file) =>
      file.type.startsWith("video/"),
    );
    const invalidFiles = Array.from(fileList).filter(
      (file) => !file.type.startsWith("video/"),
    );

    setFiles((prev) => [
      ...prev,
      ...invalidFiles.map((file) => ({
        file,
        progress: 0,
        error: "Please select a video file",
        finalUrl: null,
      })),
      ...selectedFiles.map((file) => ({
        file,
        progress: 0,
        error: null,
        finalUrl: null,
      })),
    ]);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files) {
      const droppedFiles = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith("video/"),
      );
      if (droppedFiles.length !== e.dataTransfer.files.length) {
        setFiles((prev) => [
          ...prev,
          ...Array.from(e.dataTransfer.files)
            .filter((file) => !file.type.startsWith("video/"))
            .map((file) => ({
              file,
              progress: 0,
              error: "Please drop a video file",
              finalUrl: null,
            })),
          ...droppedFiles.map((file) => ({
            file,
            progress: 0,
            error: null,
            finalUrl: null,
          })),
        ]);
      } else {
        setFiles(
          droppedFiles.map((file) => ({
            file,
            progress: 0,
            error: null,
            finalUrl: null,
          })),
        );
      }
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!files.length || files.every((status) => status.file.size === 0)) {
      setFiles((prev) =>
        prev.map((status) => ({
          ...status,
          error: status.file.size === 0 ? "File is empty" : status.error,
        })),
      );
      return;
    }

    setIsUploading(true);
    const uploadPromises = files.map(async (status, index) => {
      if (status.error || status.finalUrl) return status; // Skip invalid or completed files
      const file = status.file;

      try {
        if (file.size < 5 * 1024 * 1024) {
          // Single-part upload for files < 5MB
          const singleUploadResponse = await singleUpload({
            fileName: file.name,
            fileType: file.type,
          }).unwrap();
          const { presignedUrl, fileKey, finalUrl } = singleUploadResponse;

          await axios.put(presignedUrl, file, {
            headers: { "Content-Type": file.type },
            onUploadProgress: (progressEvent: AxiosProgressEvent) => {
              if (progressEvent.total) {
                const progress = Math.round(
                  (progressEvent.loaded / progressEvent.total) * 100,
                );
                setFiles((prev) =>
                  prev.map((s, i) => (i === index ? { ...s, progress } : s)),
                );
              }
            },
          });

          return { ...status, progress: 100, finalUrl, error: null };
        } else {
          // Multipart upload for files >= 5MB
          const partSize = 5 * 1024 * 1024; // 5MB per part
          const partCount = Math.ceil(file.size / partSize);

          const initiateResponse = await initiateUpload({
            fileName: file.name,
            fileType: file.type,
            partCount,
          }).unwrap();

          setFiles((prev) =>
            prev.map((s, i) =>
              i === index
                ? {
                    ...s,
                    uploadId: initiateResponse.uploadId,
                    fileKey: initiateResponse.fileKey,
                  }
                : s,
            ),
          );

          const parts = [];
          for (let partNumber = 1; partNumber <= partCount; partNumber++) {
            const start = (partNumber - 1) * partSize;
            const end = Math.min(start + partSize, file.size);
            const part = file.slice(start, end);

            const presignedUrl = initiateResponse.presignedUrls[partNumber];
            const response = await axios.put(presignedUrl, part, {
              headers: { "Content-Type": file.type },
              onUploadProgress: (progressEvent: AxiosProgressEvent) => {
                if (progressEvent.total) {
                  const partProgress =
                    (progressEvent.loaded / progressEvent.total) * 100;
                  const overallProgress =
                    ((partNumber - 1) / partCount +
                      partProgress / partCount / 100) *
                    100;
                  setFiles((prev) =>
                    prev.map((s, i) =>
                      i === index
                        ? { ...s, progress: Math.round(overallProgress) }
                        : s,
                    ),
                  );
                }
              },
            });

            const etag = response.headers["etag"]?.replace(/"/g, "");
            if (!etag) {
              throw new Error(`No ETag returned for part ${partNumber}`);
            }
            parts.push({ etag, partNumber });
          }

          const completeResponse = await completeUpload({
            fileKey: initiateResponse.fileKey,
            uploadId: initiateResponse.uploadId,
            parts,
          }).unwrap();

          return {
            ...status,
            progress: 100,
            finalUrl: completeResponse.finalUrl,
            error: null,
            uploadId: undefined,
            fileKey: undefined,
          };
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        if (status.uploadId && status.fileKey) {
          await abortUpload({
            fileKey: status.fileKey,
            uploadId: status.uploadId,
          }).unwrap();
        }
        return {
          ...status,
          error: `Upload failed: ${errorMessage}`,
          progress: 0,
          uploadId: undefined,
          fileKey: undefined,
        };
      }
    });

    const results = await Promise.all(uploadPromises);
    setFiles(results);
    setIsUploading(false);
  };

  const handleCancel = async () => {
    setIsUploading(false);
    const abortPromises = files.map(async (status, index) => {
      if (status.uploadId && status.fileKey) {
        try {
          await abortUpload({
            fileKey: status.fileKey,
            uploadId: status.uploadId,
          }).unwrap();
          return {
            ...status,
            uploadId: undefined,
            fileKey: undefined,
            progress: 0,
            error: null,
          };
        } catch (err) {
          return { ...status, error: "Failed to abort upload" };
        }
      }
      return status;
    });

    const results = await Promise.all(abortPromises);
    setFiles([]);
  };

  const overallProgress =
    files.length > 0
      ? files.reduce((sum, status) => sum + status.progress, 0) / files.length
      : 0;

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
        <div className="w-full">
          <label
            className="mb-3 block text-sm font-medium text-black dark:text-white"
            htmlFor="fileUpload"
          >
            Upload videos
          </label>
          <div
            id="FileUpload"
            className="relative mb-5.5 block w-full cursor-pointer appearance-none rounded border border-dashed border-primary bg-gray px-4 py-4 dark:bg-meta-4 sm:py-7.5"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept="video/*"
              id="fileUpload"
              multiple
              className="absolute inset-0 z-50 m-0 h-full w-full cursor-pointer p-0 opacity-0 outline-none"
              onChange={handleFileChange}
            />
            <div className="flex flex-col items-center justify-center space-y-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-stroke bg-white dark:border-strokedark dark:bg-boxdark">
                <UploadIcon />
              </span>
              <p>
                <span className="text-primary">Click to upload</span> or drag
                and drop
              </p>
              <p className="mt-1.5">
                Only video formats (9:16 portrait aspect ratio)
              </p>
            </div>
          </div>
          {files.map((status, index) => (
            <div key={index} className="mt-2">
              <p className="text-sm text-black dark:text-white">
                {status.file.name}
              </p>
              {status.error && (
                <p className="text-sm text-red-500">{status.error}</p>
              )}
              {status.progress > 0 && (
                <div className="h-2.5 w-full rounded-full bg-gray-200">
                  <div
                    className="h-2.5 rounded-full bg-primary"
                    style={{ width: `${status.progress}%` }}
                  ></div>
                </div>
              )}
              {status.finalUrl && (
                <p className="text-sm text-green-500">
                  Uploaded:{" "}
                  <a
                    href={status.finalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {status.finalUrl}
                  </a>
                </p>
              )}
            </div>
          ))}
          {files.length > 0 && isUploading && (
            <div className="mt-4">
              <p className="text-sm text-black dark:text-white">
                Overall Progress
              </p>
              <div className="h-2.5 w-full rounded-full bg-gray-200">
                <div
                  className="h-2.5 rounded-full bg-primary"
                  style={{ width: `${overallProgress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-4.5">
        <button
          className="flex justify-center rounded border border-stroke px-6 py-2 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
          type="button"
          onClick={handleCancel}
          disabled={isUploading}
        >
          Cancel
        </button>
        <button
          className="flex justify-center rounded bg-primary px-6 py-2 font-medium text-gray hover:bg-opacity-90"
          type="submit"
          disabled={
            isUploading ||
            !files.length ||
            files.every((s) => s.error || s.finalUrl)
          }
        >
          Save
        </button>
      </div>
    </form>
  );
};

export default UploadForm;
