import { Product } from "@/interfaces/product";

export const isProductValid = (product: Product): boolean => {
  return (
    product.name.trim() !== "" &&
    (product.actualPrice ?? 0) > 0 &&
    product.description.trim() !== "" &&
    (product.features?.length ?? 0) > 0 &&
    product.category.trim() !== "" &&
    (product.stock ?? product.stockQuantity ?? 0) >= 0 &&
    product.variants.every(
      (variant) =>
        variant.price > 0 &&
        (variant.discountPrice !== null
          ? variant.discountPrice > 0 && variant.discountPrice < variant.price
          : true)
    )
  );
};