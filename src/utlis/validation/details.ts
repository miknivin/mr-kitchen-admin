import { Product } from "@/interfaces/product";
import Swal from "sweetalert2";

export const validateBasicDetails = (
  product: Product,
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!product.name.trim()) {
    errors.push("Perfume name is required.");
  }

  if (product.variants.length === 0) {
    errors.push("At least one variant is required.");
  }
  product.variants.forEach((v, i) => {
    if (!v.size) {
      errors.push(`Size for variant ${i + 1} is required.`);
    }
    if (v.price <= 0) {
      errors.push(`Price for variant ${i + 1} must be greater than 0.`);
    }
    if (v.discountPrice && v.discountPrice < 0) {
      errors.push(`Discount price for variant ${i + 1} cannot be negative.`);
    }
  });
  const sizeSet = new Set(product.variants.map((v) => v.size));
  if (sizeSet.size < product.variants.length) {
    errors.push("Variant sizes must be unique.");
  }
  if (product.stockQuantity < 0) {
    errors.push("Stock quantity cannot be negative.");
  }
  if (!product.category) {
    errors.push("Category is required.");
  }

  if (errors.length > 0) {
    Swal.fire({
      title: "Validation Error",
      html: errors.join("<br>"),
      icon: "error",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateDescriptions = (
  product: Product,
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!product.description.trim()) {
    errors.push("Description is required.");
  }
  console.log(product.shortDescription);

  if (!product.shortDescription.trim()) {
    errors.push("Short description is required.");
  }
  if (product.shortDescription.length > 230) {
    errors.push("Short description cannot exceed 230 characters.");
  }
  if (product.features.length > 20) {
    errors.push("Maximum 20 features allowed.");
  }

  if (errors.length > 0) {
    Swal.fire({
      title: "Validation Error",
      html: errors.join("<br>"),
      icon: "error",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateProduct = (
  product: Product,
): { isValid: boolean; errors: string[] } => {
  const basicDetailsValidation = validateBasicDetails(product);
  const descriptionsValidation = validateDescriptions(product);

  const errors = [
    ...basicDetailsValidation.errors,
    ...descriptionsValidation.errors,
  ];

  if (errors.length > 0) {
    Swal.fire({
      title: "Validation Error",
      html: errors.join("<br>"),
      icon: "error",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
