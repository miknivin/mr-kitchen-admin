"use client";
import { useState, useRef } from "react";
import {
  useGetMomentsQuery,
  useDeleteMomentMutation,
} from "@/redux/api/websiteSettingsApi";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";

interface MomentsResponse {
  success: boolean;
  data: string[];
}

type QueryError = FetchBaseQueryError | { message: string } | string;

type VideoRefs = Record<number, HTMLVideoElement | null>;

export default function MomentsGrid() {
  const { data, error, isFetching } = useGetMomentsQuery<any>(undefined);
  const [deleteMoment, { isLoading: isDeleting }] = useDeleteMomentMutation();
  const [playingVideos, setPlayingVideos] = useState<Record<number, boolean>>(
    {},
  );
  const videoRefs = useRef<VideoRefs>({});

  const handlePlay = (index: number) => {
    const video = videoRefs.current[index];
    if (video) {
      Object.keys(videoRefs.current).forEach((key) => {
        const keyNum = Number(key);
        if (keyNum !== index && videoRefs.current[keyNum]) {
          videoRefs.current[keyNum]?.pause();
        }
      });
      video.play().catch((err) => console.error("Video play error:", err));
    }
  };

  const handleVideoPlay = (index: number) => {
    setPlayingVideos((prev) => ({ ...prev, [index]: true }));
  };

  const handleVideoPause = (index: number) => {
    setPlayingVideos((prev) => ({ ...prev, [index]: false }));
  };

  const handleDelete = async (url: string) => {
    try {
      await deleteMoment(url).unwrap();
    } catch (err) {
      console.error("Failed to delete moment:", err);
    }
  };

  return (
    <section className="wow fadeInUp py-8" data-wow-delay="0s">
      <div className="container mx-auto px-4">
        {isFetching && (
          <div className="text-center text-gray-600 dark:text-gray-300">
            Loading...
          </div>
        )}
        {error && (
          <div className="text-center text-red-500">
            Error:{" "}
            {typeof error === "string"
              ? error
              : "status" in error
                ? error.status
                : error.message || "Failed to load videos"}
          </div>
        )}
        {data?.success && Array.isArray(data.data) && data.data.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {data.data.map((url: any, i: any) => (
              <div
                key={i}
                className="relative overflow-hidden rounded-lg bg-gray-100 shadow-lg dark:bg-gray-800"
              >
                <video
                  className="aspect-[9:16] w-full object-cover"
                  ref={(el) => {
                    videoRefs.current[i] = el;
                  }}
                  controls={playingVideos[i]}
                  muted
                  playsInline
                  onPlay={() => handleVideoPlay(i)}
                  onPause={() => handleVideoPause(i)}
                >
                  <source src={url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                {!playingVideos[i] && (
                  <button
                    aria-label="Play video"
                    className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 transform cursor-pointer items-center justify-center rounded-full bg-black bg-opacity-50 transition-all hover:bg-opacity-70"
                    onClick={() => handlePlay(i)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        handlePlay(i);
                      }
                    }}
                  >
                    <svg
                      className="text-white"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      width={24}
                      height={24}
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 18V6l8 6-8 6Z"
                      />
                    </svg>
                  </button>
                )}
                <button
                  aria-label="Delete video"
                  className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-red-500 text-white transition-all hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
                  onClick={() => handleDelete(url)}
                  disabled={isDeleting}
                >
                  <svg
                    className="h-3 w-3"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 14"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        ) : (
          !isFetching &&
          !error && (
            <div className="text-center text-gray-600 dark:text-gray-300">
              No videos available
            </div>
          )
        )}
      </div>
    </section>
  );
}
