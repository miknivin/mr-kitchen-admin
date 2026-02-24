/* eslint-disable @next/next/no-img-element */
"use client";
import { Product } from "@/interfaces/product";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
interface ImageUploadProps {
  productProp: Product;
  updateProduct: (data: Product) => void;
  handleNextStep: () => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ productProp, updateProduct, handleNextStep }) => {
  const [imageUrl, setImageUrl] = useState(""); // For manual URL input
  const [imageUrls, setImageUrls] = useState<string[]>([]); // For storing multiple URLs

  // Handle file upload
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const newImageUrl = URL.createObjectURL(file); // Create a temporary URL for the uploaded file
      setImageUrls((prevUrls) => [...prevUrls, newImageUrl]); // Add the new URL to the list
      updateProduct({ ...productProp, images: [...(productProp.images || []), {
        url: newImageUrl,
        alt: ""
      }] });
    }
  };

  // Handle manual URL input change
  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrl(event.target.value);
  };

  const handleUrlSubmit = () => {
    if (imageUrl.trim() !== "") {
      setImageUrls((prevUrls) => [...prevUrls, imageUrl]); // Add the new URL to the list
     updateProduct({
        ...productProp,
        images: [...(productProp.images || []), { url: imageUrl, alt: "" }], // Add alt property
      });
      setImageUrl(""); // Clear the input field
    }
  };

  // Handle image preview delete
  const handleImagePreviewDelete = (url: string) => {
    const updatedUrls = imageUrls.filter((imgUrl) => imgUrl !== url); // Remove the URL from the list
    setImageUrls(updatedUrls);

    const updatedImages = productProp.images?.filter((img) => img.url !== url) || [];
    updateProduct({ ...productProp, images: updatedImages });
  };

  return (
    <div className="p-4 border rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Step 3: Image Upload</h2>

      {/* File Upload */}
      <div className="flex items-center justify-center w-full">
        <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500">
          <span className="text-sm text-gray-500">Click to upload or drag and drop</span>
          <input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} />
        </label>
      </div>

      {/* Manual Image URL Input */}
      <div className="mt-4">
        <label className="mb-3 block text-sm font-medium text-black dark:text-white">Image URL</label>
        <input
          type="text"
          placeholder="Enter Image URL"
          value={imageUrl}
          onChange={handleUrlChange}
          className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
        />
        <button
          onClick={handleUrlSubmit}
          className="mt-4 w-full inline-flex items-center justify-center rounded-md border border-primary px-10 py-4 text-center font-medium text-primary hover:bg-opacity-90 lg:px-8 xl:px-10"
        >
          Add Url
        </button>

        {/* Display Image Previews */}
        <div className="mt-4 flex flex-wrap gap-4">
          {imageUrls.map((url, index) => (
            <div key={index} className="relative indicator">
              <button
                onClick={() => handleImagePreviewDelete(url)}
                className="badge indicator-item bg-transparent border-none cursor-pointer"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
              <img
                className="mask mask-squircle w-24 object-cover aspect-square"
                src={url}
                alt={`uploaded-image-${index}`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="button"
        onClick={handleNextStep}
        className="mt-4 w-full bg-green-600 text-white py-2 rounded-md"
      >
        Submit
      </button>
    </div>
  );
};

export default ImageUpload;