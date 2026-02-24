"use client";
import React, { useState } from "react";
import BasicDetails from "./BasicDetails";
import Descriptions from "./Descriptions";
import { Product } from "@/interfaces/product";

import { useCreateProductMutation } from "@/redux/api/productsApi";
import Swal from "sweetalert2";
import Loader from "../common/Loader";
import { validateProduct } from "@/utlis/validation/details";

const StepperApp = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [createProduct, { isLoading, error, isSuccess }] =
    useCreateProductMutation();
  const [product, setProduct] = useState<Product>({
    name: "",
    sku: "",
    price: 0,
    discountPrice: 0,
    description: "",
    shortDescription: "",
    features: [],
    variants: [],
    stockQuantity: 0,
    gender: "Unisex",
    category: "Baby Oil",
    images: [],
    averageRating: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const nextStep = () => {
    if (currentStep < 2) setCurrentStep(currentStep + 1);
  };

  const handleSubmit = async () => {
    const { isValid } = validateProduct(product);

    if (!isValid) {
      return;
    }

    // Convert images to the required format
    const formattedProduct = {
      ...product,
      images: product.images.map((img) =>
        typeof img === "object" ? img : { url: img, alt: "" },
      ),
    };

    try {
      const response = await createProduct(formattedProduct).unwrap();
      console.log("Product created successfully:", response);
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Perfume created successfully!",
      });

      setProduct({
        name: "",
        sku: "",
        price: 0,
        discountPrice: 0,
        description: "",
        shortDescription: "",
        features: [],
        variants: [],
        stockQuantity: 0,
        gender: "Unisex",
        category: "Baby Oil",
        images: [],
        averageRating: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      setCurrentStep(1);
    } catch (err) {
      console.error("Error creating product:", err);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleStepClick = (step: number) => {
    if (step > currentStep) return;
    setCurrentStep(step);
  };

  const handleIncomingData = (data: Partial<Product>) => {
    setProduct((prev) => ({
      ...prev,
      ...data,
    }));
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <ol className="flex justify-center space-x-8">
        {["Basic Details", "Descriptions"].map((title, index) => {
          const step = index + 1;
          return (
            <li
              key={step}
              onClick={() => handleStepClick(step)}
              className={`flex cursor-pointer items-center space-x-2.5 ${currentStep >= step ? "text-blue-600" : "text-gray-500"
                }`}
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full border ${currentStep >= step ? "border-blue-600" : "border-gray-500"
                  }`}
              >
                {step}
              </span>
              <span>
                <h3 className="font-medium">{title}</h3>
              </span>
            </li>
          );
        })}
      </ol>
      <div className="mt-8">
        {currentStep === 1 && (
          <BasicDetails
            productProp={product}
            handleNextStep={nextStep}
            updateProduct={handleIncomingData}
          />
        )}
        {currentStep === 2 && (
          <Descriptions
            productProp={product}
            handleNextStep={handleSubmit}
            updateProduct={handleIncomingData}
          />
        )}
      </div>
    </div>
  );
};

export default StepperApp;
