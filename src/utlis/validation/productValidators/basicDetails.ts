import { Product } from "@/interfaces/product";

export const validateForm = (product: Product): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
   
    if (!product.name.trim()) errors.push('Name is required');
    if ((product.stock || product.stockQuantity) <= 0) errors.push('Stock must be greater than 0');
    // if ((product.actualPrice) <= 0) errors.push('Actual price must be greater than 0'); 
    if (!product.category) errors.push('Category is required');

    // Validate variants
    product.variants.forEach((variant, index) => {
        if (variant.price <= 0) {
            errors.push(`Variant ${index + 1}: Price must be greater than 0`);
        }
        if (variant.discountPrice !== null) {
            if (variant.discountPrice <= 0) {
                errors.push(`Variant ${index + 1}: Discount price must be greater than 0`);
            }
            if (variant.discountPrice >= variant.price) {
                errors.push(`Variant ${index + 1}: Discount price must be less than regular price`);
            }
        }
    });
   
    return {
        isValid: errors.length === 0,
        errors
    };
};
