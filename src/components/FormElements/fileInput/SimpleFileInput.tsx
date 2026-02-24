/* eslint-disable @next/next/no-img-element */
import { useUploadKidsBagImagesMutation } from "@/redux/api/productsApi"; 
import { useState } from "react";
import { toast } from "react-hot-toast";
export default function SimpleFileInput() {
  const [uploadKidsBagImages, { isLoading }] = useUploadKidsBagImagesMutation();

  // State for small and large bag images
  const [smallBagFile, setSmallBagFile] = useState<File | null>(null);
  const [largeBagFile, setLargeBagFile] = useState<File | null>(null);

  const [smallBagPreview, setSmallBagPreview] = useState<string | null>(null);
  const [largeBagPreview, setLargeBagPreview] = useState<string | null>(null);

  const [name, setName] = useState("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = event.target;
    if (files && files.length > 0) {
      const file = files[0]; 
      const url = URL.createObjectURL(file);
      if (name === "smallBag") {
        setSmallBagFile(file);
        setSmallBagPreview(url);
      } else if (name === "largeBag") {
        setLargeBagFile(file);
        setLargeBagPreview(url);
      }
    }
  };

  const handleUpload = async () => {
    if (!smallBagFile || !largeBagFile) {
      alert("Please select both Small and Large bag images.");
      return;
    }

    const formData = new FormData();
    formData.append("productId", "67a70ca93f464380b64b05a6");
    formData.append("smallBagImage", smallBagFile);
    formData.append("largeBagImage", largeBagFile);
    formData.append("name", name);
    try {
      const response = await uploadKidsBagImages({ formData }).unwrap();
      console.log("Upload Successful:", response);
      setSmallBagPreview(null);
      setLargeBagPreview(null);
      setSmallBagFile(null);
      setLargeBagFile(null);
      setName("")
      toast.success("Files uploaded successfully!");
    } catch (error) {
      console.error("Upload Error:", error);
      toast.error("Failed to upload files.");
    }
  };

  return (
    <form className="space-y-4">
      {/* Name Input */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-900 dark:text-white"
        >
          Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder="Your name"
        />
      </div>

      {/* Small Bag Image Upload */}
      <label className="form-control w-full text-black dark:text-white">
        <div className="label">
          <span className="label-text">Small Bag Image</span>
        </div>
        <input
          type="file"
          name="smallBag"
          disabled={smallBagFile!==null}
          accept=".png, .jpg, .webp,.jpeg"
          className="file-input file-input-bordered w-full"
          onChange={handleFileChange}
        />
        {smallBagPreview && (
          <div className="mt-2 relative w-fit">
            <button
              type="button"
              onClick={() => {
                setSmallBagFile(null);
                setSmallBagPreview(null);
              }}
              className="badge badge-error badge-sm absolute right-0 top-0 rounded-full !p-1 h-auto z-30"
            >
              ✖
            </button>
            <img
              className="mask mask-squircle w-24 h-24 object-cover"
              src={smallBagPreview}
              alt="Small Bag Preview"
            />
          </div>
        )}
      </label>

      {/* Large Bag Image Upload */}
      <label className="form-control w-full text-black dark:text-white">
        <div className="label">
          <span className="label-text">Large Bag Image</span>
        </div>
        <input
          type="file"
          name="largeBag"
          disabled={largeBagFile!==null}
          accept=".png, .jpg, .webp,.jpeg"
          className="file-input file-input-bordered w-full"
          onChange={handleFileChange}
        />
        {largeBagPreview && (
          <div className="mt-2 relative w-fit">
            <button
              type="button"
              onClick={() => {
                setLargeBagFile(null);
                setLargeBagPreview(null);
              }}
              className="badge badge-error badge-sm absolute right-0 top-0 rounded-full !p-1 h-auto z-30"
            >
              ✖
            </button>
            <img
              className="mask mask-squircle w-24 h-24 object-cover"
              src={largeBagPreview}
              alt="Large Bag Preview"
            />
          </div>
        )}
      </label>

      {/* Upload Button */}
      <button
        type="button"
        className="btn bg-primary hover:bg-primary/80 text-black dark:text-white border-none"
        onClick={handleUpload}
        disabled={isLoading}
      >
        {isLoading ? "Uploading..." : "Upload"}
      </button>
    </form>
  );
}
