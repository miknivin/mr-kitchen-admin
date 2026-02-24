/* eslint-disable @next/next/no-img-element */
"use client";
import GraySpinner from "@/components/common/GraySpinner";
import { Product } from "@/interfaces/product";
import {
  useUploadProductImagesMutation,
  useDeleteProductImageMutation,
} from "@/redux/api/productsApi";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

interface ProductImagesUploadProps {
  product: Product;
  updateProduct: (data: Partial<Product>) => void; // Added to update parent state
  onClose: () => void;
}

export default function ProductImagesUpload({
  product,
  updateProduct,
  onClose,
}: ProductImagesUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [productImages, setProductImages] = useState(product.images);
  const [uploadProductImages, { isLoading }] = useUploadProductImagesMutation();
  const [deleteProductImage, { isLoading: isDeleting }] =
    useDeleteProductImageMutation();

  // Cleanup preview URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [previews]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(event.target.files || []);
    if (newFiles.length > 0) {
      setSelectedFiles((prevFiles) => [...prevFiles, ...newFiles]);
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setPreviews((prevPreviews) => [...prevPreviews, ...newPreviews]);
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select at least one file first.");
      return;
    }

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append("images", file);
    });

    try {
      const result = await uploadProductImages({
        id: product._id,
        formData,
      }).unwrap();

      toast.success("Images uploaded successfully!");

      if (result?.images) {
        const updatedImages = [...productImages, ...result.images];
        setProductImages(updatedImages);
        updateProduct({ images: updatedImages }); // Update parent state
      } else {
        toast.error(
          "Images uploaded but not reflected yet. Refresh to see changes.",
        );
      }

      setSelectedFiles([]);
      setPreviews([]);
      onClose();
    } catch (error) {
      console.error("Upload failed", error);
      toast.error("Upload failed. Please try again.");
    }
  };

  const handleDelete = async (imageId: string) => {
    try {
      await deleteProductImage({
        id: product._id,
        body: { imageId },
      }).unwrap();
      toast.success("Image deleted successfully!");
      const updatedImages = productImages.filter(
        (image) => image._id !== imageId,
      );
      setProductImages(updatedImages);
      updateProduct({ images: updatedImages }); // Update parent state
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Failed to delete image.");
    }
  };

  const removePreview = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      const newPreviews = prev.filter((_, i) => i !== index);
      URL.revokeObjectURL(prev[index]);
      return newPreviews;
    });
  };

  return (
    <form className="space-y-4">
      <label className="form-control w-full text-black dark:text-white">
        <div className="label">
          <span className="label-text">
            Upload product images for{" "}
            <span className="text-gray-700 dark:text-gray-100">
              {product.name}
            </span>
          </span>
        </div>
        <input
          type="file"
          name="images"
          multiple
          accept=".png, .jpg, .webp, .jpeg"
          className="file-input file-input-bordered w-full"
          onChange={handleFileChange}
        />
      </label>

      {previews.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {previews.map((preview, index) => (
            <div className="relative mt-2 w-fit" key={index}>
              <button
                type="button"
                onClick={() => removePreview(index)}
                className="badge badge-error badge-sm absolute right-0 top-0 z-30 h-auto rounded-full !p-1"
              >
                ✖
              </button>
              <img
                className="mask mask-squircle h-24 w-24 object-cover"
                src={preview}
                alt={`Preview ${index + 1}`}
              />
            </div>
          ))}
        </div>
      )}

      <h3 className="text-xl text-gray-800 dark:text-gray-200">
        Uploaded Images
      </h3>
      <hr className="h-0.5 bg-slate-500" />
      <div className="flex flex-wrap gap-3">
        {productImages.map((item) => (
          <div className="relative mt-2 w-fit" key={item._id || item.url}>
            <button
              type="button"
              id="deleteUploadedImage"
              onClick={() => item._id && handleDelete(item._id)}
              disabled={isDeleting || !item._id || productImages.length <= 1}
              className="badge badge-error badge-sm absolute right-0 top-0 z-30 h-auto rounded-full !p-1"
            >
              {isDeleting ? <GraySpinner /> : "✖"}
            </button>
            <img
              className="mask mask-squircle h-24 w-24 object-cover"
              src={item.url}
              alt={item.alt || "Product Preview"}
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleUpload}
        className="btn border-none bg-primary text-white hover:bg-primary/80"
        disabled={isLoading}
      >
        {isLoading ? "Uploading..." : "Upload"}
      </button>
    </form>
  );
}
