"use client";
import { useState, useEffect } from "react";

interface SearchAndCategoryFilterProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  onSearch: (searchTerm: string, selectedCategory: string) => void;
}

const formatCategoryName = (category: string): string => {
  if (category === "All categories") return category;
  return category
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const categories = [
  "All categories",
  "Kids Bags",
  "gym_duffle_bag",
  "travel_duffle_bag",
  "mens_sling_bag",
  "womens_sling_bag",
  "mens_backpack",
  "laptop_backpack",
  "ladies_backpack",
  "womens_backpack",
  "laptop_messenger_bag",
  "trekking_bag",
  "tote_bag",
  "women_shoulder_bag",
];

const SearchAndCategoryFilter: React.FC<SearchAndCategoryFilterProps> = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  onSearch,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [inputValue, setInputValue] = useState(searchTerm);

  // Sync inputValue with searchTerm when searchTerm changes
  useEffect(() => {
    setInputValue(searchTerm);
  }, [searchTerm]);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setIsDropdownOpen(false);
    setSearchTerm(inputValue); // Ensure searchTerm is updated
    onSearch(inputValue, category); // Trigger search with current inputValue
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSearchTerm(inputValue); // Update searchTerm on form submission
    onSearch(inputValue, selectedCategory); // Trigger search
  };

  return (
    <div className="mb-6">
      <form className="md:min-w-[400px]" onSubmit={handleSearch}>
        <div className="flex">
          <label
            htmlFor="search-dropdown"
            className="sr-only mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Search Products
          </label>
          <button
            id="dropdown-button"
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="z-10 inline-flex shrink-0 items-center rounded-s-lg border border-gray-300 bg-gray-100 px-4 py-2.5 text-center text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-700"
          >
            {formatCategoryName(selectedCategory)}
            <svg
              className="ms-2.5 h-2.5 w-2.5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 10 6"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="m1 1 4 4 4-4"
              />
            </svg>
          </button>
          <div
            id="dropdown"
            className={`z-10 ${isDropdownOpen ? "block" : "hidden"} absolute mt-12 w-44 divide-y divide-gray-100 rounded-lg bg-white shadow-sm dark:bg-gray-700`}
          >
            <ul
              className="py-2 text-sm text-gray-700 dark:text-gray-200"
              aria-labelledby="dropdown-button"
            >
              {categories.map((category) => (
                <li key={category}>
                  <button
                    type="button"
                    onClick={() => handleCategorySelect(category)}
                    className="inline-flex w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                  >
                    {formatCategoryName(category)}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative w-full">
            <input
              type="search"
              id="search-dropdown"
              className="z-20 block w-full rounded-e-lg border border-s-2 border-gray-300 border-s-gray-50 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:border-s-gray-700 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500"
              placeholder="Search By Keywords"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button
              type="submit"
              className="absolute end-0 top-0 h-full rounded-e-lg border border-blue-700 bg-blue-700 p-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              <svg
                className="h-4 w-4"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 20"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                />
              </svg>
              <span className="sr-only">Search</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SearchAndCategoryFilter;
