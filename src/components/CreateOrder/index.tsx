"use client";
import React, { useEffect, useState } from "react";

import Swal from "sweetalert2";
import Loader from "../common/Loader";
import ShippingDetailsForm from "./ShippingDetails";
import ItemsSelection from "./ItemSelection";
import { useCreateNewOrderMutation } from "@/redux/api/orderApi";
import UserSelection from "./UserSelection";

const CreateAdminOrder = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [createOrder, { isLoading, error, isSuccess }] =
    useCreateNewOrderMutation();
  const [orderData, setOrderData] = useState({
    shippingInfo: {
      name: "",
      phoneNo: "",
      address: "",
      city: "",
      zipCode: "",
      country: "India",
    },
    _id: "",
    itemsPrice: 0,
    taxAmount: 0,
    shippingAmount: 0,
    totalAmount: 0,
    orderItems: [],
    createdAt: new Date(),
    orderStatus: "Processing" as "Processing" | "Shipped" | "Delivered",
    user: "",
    paymentMethod: "Online" as "COD" | "Online",
  });

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleStepClick = (step: number) => {
    if (step > currentStep) {
      return;
    }
    setCurrentStep(step);
  };

  const handleIncomingData = (data: any) => {
    setOrderData((prev) => ({
      ...prev,
      ...data,
    }));
  };

  const handleSubmit = async () => {
    // Basic validation
    if (
      !orderData.shippingInfo.name ||
      !orderData.orderItems.length ||
      !orderData.user
    ) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Please fill all required fields before submitting.",
      });
      return;
    }

    try {
      const response = await createOrder(orderData).unwrap();
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Order created successfully!",
      });

      // Reset form
      setOrderData({
        shippingInfo: {
          name: "",
          phoneNo: "",
          address: "",
          city: "",
          zipCode: "",
          country: "India",
        },
        _id: "",
        itemsPrice: 0,
        taxAmount: 0,
        shippingAmount: 0,
        totalAmount: 0,
        orderItems: [],
        orderStatus: "Processing",
        user: "",
        createdAt: new Date(),
        paymentMethod: "Online",
      });
      setCurrentStep(1);
    } catch (err) {
      console.error("Error creating order:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to create order. Please try again.",
      });
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      {/* Stepper UI */}
      <ol className="flex justify-center space-x-8">
        {["Shipping Details", "Select Items", "Select User"].map(
          (title, index) => {
            const step = index + 1;
            return (
              <li
                key={step}
                onClick={() => handleStepClick(step)}
                className={`flex cursor-pointer items-center space-x-2.5 ${
                  currentStep >= step ? "text-blue-600" : "text-gray-500"
                }`}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full border ${
                    currentStep >= step ? "border-blue-600" : "border-gray-500"
                  }`}
                >
                  {step}
                </span>
                <span>
                  <h3 className="font-medium">{title}</h3>
                </span>
              </li>
            );
          },
        )}
      </ol>

      {/* Step Content */}
      <div className="mt-8">
        {currentStep === 1 && (
          <ShippingDetailsForm
            orderData={orderData}
            handleNextStep={nextStep}
            updateOrderData={handleIncomingData}
          />
        )}
        {currentStep === 2 && (
          <ItemsSelection
            orderData={orderData}
            handleNextStep={nextStep}
            handlePrevStep={prevStep}
            updateOrderData={handleIncomingData}
          />
        )}
        {currentStep === 3 && (
          <UserSelection
            orderData={orderData}
            handleNextStep={handleSubmit}
            handlePrevStep={prevStep}
            updateOrderData={handleIncomingData}
          />
        )}
      </div>
    </div>
  );
};

export default CreateAdminOrder;
