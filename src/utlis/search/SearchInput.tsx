"use client";

import React, { ChangeEvent } from "react";

interface SearchInputProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  className?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = "Search Mockups, Logos...",
  onSearch,
  className = "w-full pr-10",
}) => {
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    
    onSearch(e.target.value);
  };

  return (
    <div className={className}>
      <label
        htmlFor="default-search"
        className="sr-only mb-2 text-sm font-medium text-gray-900 dark:text-white"
      >
        Search
      </label>
      <div className="relative">
        <input
          type="search"
          id="default-search"
          name="search"
          className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-4 ps-10 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
          placeholder={placeholder}
          required
          onChange={handleInputChange} // Calls onSearch on input change
        />
      </div>
    </div>
  );
};

export default SearchInput;
