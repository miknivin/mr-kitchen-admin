"use client";

import React, { useState, ReactNode } from "react";

interface OffcanvasProps {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

const Offcanvas: React.FC<OffcanvasProps> = ({ children, isOpen, onClose }) => {
  return (
    <div
      id="offcanvas"
      className={`fixed right-0 top-0 z-[99999999] h-screen overflow-y-auto p-4 transition-transform ${
        isOpen ? "translate-x-0" : "translate-x-full"
      } w-80 bg-white dark:bg-gray-800`}
      tabIndex={-1}
      aria-labelledby="offcanvas-label"
    >
      <button
        type="button"
        onClick={onClose}
        aria-controls="offcanvas"
        className="absolute end-2.5 top-2.5 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white"
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
        <span className="sr-only">Close menu</span>
      </button>
      {children}
    </div>
  );
};

export default Offcanvas;
