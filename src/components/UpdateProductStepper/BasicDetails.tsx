"use client";
import React, { useState, useEffect } from "react";
import { Product } from "@/interfaces/product";
import Swal from "sweetalert2";
import { validateForm } from "@/utlis/validation/productValidators/basicDetails";
import VariantModal from "../Modals/AddVariantsModal";

interface BasicDetailsProps {
  productProp: Product;
  updateProduct: (data: Partial<Product>) => void;
  handleNextStep: () => void;
  isUpdate?: boolean;
}

interface VariantForm {
  size: "85ml" | "500ml" | "600ml" | "2L" | "12ml" | "20ml" | "30ml" | "50ml" | "100ml" | "150ml" | "50g" | "100g" | "200g" | "500g" | "1kg";
  price: number;
  discountPrice: number | null;
}

const BasicDetails: React.FC<BasicDetailsProps> = ({
  productProp,
  updateProduct,
  handleNextStep,
}) => {
  const [productState, setProduct] = useState<Product>(productProp);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [variantForm, setVariantForm] = useState<VariantForm>({
    size: "12ml",
    price: 0,
    discountPrice: null,
  });
  const [editIndex, setEditIndex] = useState<number | null>(null);

  // Sync state with props if props change (important for Edit flow)
  useEffect(() => {
    setProduct(productProp);
  }, [productProp]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    // Handle number inputs: empty string should be 0 or keep as string if better?
    // The Add component uses: value === "" ? 0 : Number(value)
    const updatedProduct = {
      ...productState,
      [name]: type === "number" ? (value === "" ? 0 : Number(value)) : value,
    };

    setProduct(updatedProduct);
    updateProduct(updatedProduct);
  };

  const openModal = (index?: number) => {
    if (index !== undefined) {
      const variant = productState.variants[index];
      setVariantForm({
        size: variant.size as any,
        price: variant.price,
        discountPrice: variant.discountPrice,
      });
      setEditIndex(index);
    } else {
      setVariantForm({ size: "12ml", price: 0, discountPrice: null });
      setEditIndex(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditIndex(null);
    setVariantForm({ size: "12ml", price: 0, discountPrice: null });
  };

  const saveVariant = (variantData?: VariantForm) => {
    // VariantModal in Add flow might pass data back, or we use local state?
    // In Add flow BasicDetails, saveVariant didn't take args, it used variantForm state.
    // But strictly copying code, let's verify VariantModal usage.
    // In Add flow, VariantModal props: saveVariant={saveVariant} which expects void?
    // Let's check AddVariantsModal signature if I can.
    // Making this robust:
    // If the Modal calls it with data, use it. If not, use state.
    const dataToSave = variantData || variantForm;

    const errors: string[] = [];
    if (!dataToSave.size) {
      errors.push("Size is required.");
    }
    if (dataToSave.price <= 0) {
      errors.push("Price must be greater than 0.");
    }
    if (dataToSave.discountPrice && dataToSave.discountPrice < 0) {
      errors.push("Discount price cannot be negative.");
    }
    if (
      productState.variants.some(
        (v, i) =>
          v.size === dataToSave.size &&
          (editIndex === null || i !== editIndex),
      )
    ) {
      errors.push("Size must be unique among variants.");
    }

    if (errors.length > 0) {
      Swal.fire({
        title: "Validation Error",
        html: errors.join("<br>"),
        icon: "error",
      });
      return;
    }

    const updatedVariants = [...productState.variants];
    if (editIndex !== null) {
      updatedVariants[editIndex] = {
        ...dataToSave,
        imageUrl: updatedVariants[editIndex].imageUrl || [] // Preserve existing images if any (though we are hiding upload)
      };
    } else {
      updatedVariants.push({
        ...dataToSave,
        imageUrl: []
      });
    }

    const updatedProduct = { ...productState, variants: updatedVariants };
    setProduct(updatedProduct);
    updateProduct(updatedProduct);
    closeModal();
  };

  const removeVariant = (index: number) => {
    if (productState.variants.length <= 1) {
      Swal.fire({
        title: "Error",
        text: "At least one variant is required.",
        icon: "error",
      });
      return;
    }
    const updatedVariants = productState.variants.filter((_, i) => i !== index);
    const updatedProduct = { ...productState, variants: updatedVariants };
    setProduct(updatedProduct);
    updateProduct(updatedProduct);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { isValid, errors } = validateForm(productState);

    if (!isValid) {
      Swal.fire({
        title: "Validation Error",
        html: errors.join("<br>"),
        icon: "error",
      });
      return;
    }

    updateProduct(productState);
    handleNextStep();
  };

  return (
    <div className="rounded-lg border p-4 shadow-md">
      <h2 className="mb-4 text-xl font-semibold">Step 1: Basic Details</h2>
      <form onSubmit={handleSubmit}>
        <div className="p-6.5">
          <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
            <div className="w-full xl:w-1/2">
              <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                Product Name
              </label>
              <input
                type="text"
                name="name"
                value={productState.name}
                onChange={handleChange}
                placeholder="Enter product name"
                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              />
            </div>
          </div>

          <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
            <div className="w-full xl:w-1/2">
              <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                Actual Price
              </label>
              <input
                type="number"
                name="price"
                value={productState.price}
                onChange={handleChange}
                placeholder="Enter price"
                min="0"
                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              />
            </div>
            <div className="w-full xl:w-1/2">
              <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                Discount Price
              </label>
              <input
                type="number"
                name="discountPrice"
                value={productState.discountPrice}
                onChange={handleChange}
                placeholder="Enter discount price"
                min="0"
                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              />
            </div>
          </div>
          <div className="mb-4.5">
            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
              Stock Quantity
            </label>
            <input
              type="number"
              name="stockQuantity"
              value={productState.stockQuantity}
              onChange={handleChange}
              placeholder="Enter stock quantity"
              className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
          </div>

          <div className="mb-4.5">
            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
              Category
            </label>
            <select
              className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              name="category"
              value={productState.category}
              onChange={handleChange}
            >
              <option value="Baby Oil">Baby Oil</option>
              <option value="Powder">Powder</option>
              <option value="Soap">Soap</option>
              <option value="Natural Oil">Natural Oil</option>
            </select>
          </div>
          <div className="mb-4.5">
            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
              Variants
            </label>
            <div className="flex flex-wrap gap-2">
              {productState.variants.map((variant, index) => (
                <span
                  key={index}
                  id={`badge-dismiss-${index}`}
                  className="me-2 inline-flex cursor-pointer items-center rounded-sm bg-blue-100 px-2 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                  onClick={() => openModal(index)}
                >
                  {variant.size}
                  <button
                    type="button"
                    className="rounded-xs ms-2 inline-flex items-center bg-transparent p-1 text-sm text-blue-400 hover:bg-blue-200 hover:text-blue-900 dark:hover:bg-blue-800 dark:hover:text-blue-300"
                    data-dismiss-target={`#badge-dismiss-${index}`}
                    aria-label="Remove"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeVariant(index);
                    }}
                  >
                    <svg
                      className="h-2 w-2"
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
                    <span className="sr-only">Remove badge</span>
                  </button>
                </span>
              ))}
            </div>
            <button
              type="button"
              onClick={() => openModal()}
              className="mt-2 rounded bg-blue-600 p-2 text-white hover:bg-opacity-90"
            >
              Add Variant
            </button>
          </div>
          <button
            type="submit"
            className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
          >
            Next
          </button>
        </div>
      </form >
      <VariantModal
        productId={productState._id || Date.now().toString()}
        isOpen={isModalOpen}
        closeModal={closeModal}
        variantForm={variantForm}
        setVariantForm={setVariantForm}
        saveVariant={saveVariant}
      />
    </div >
  );
};

export default BasicDetails;
