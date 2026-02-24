export interface Product {
  _id?: string;
  name: string;
  sku: string;
  price: number;
  discountPrice: number;
  actualPrice?: number;
  description: string;
  stock?: number;
  shortDescription: string;
  features: string[];
  variants: Array<{
    size: "85ml" | "500ml" | "600ml" | "2L" | "12ml" | "20ml" | "30ml" | "50ml" | "100ml" | "150ml" | "50g" | "100g" | "200g" | "500g" | "1kg";
    price: number;
    discountPrice: number | null;
    imageUrl?: string[];
  }>;
  stockQuantity: number;
  gender: "Unisex" | "Male" | "Female";
  category:
  | "Baby Oil"
  | "Powder"
  | "Soap"
  | "Natural Oil";
  mainImage?: string;
  color?: {
    primaryColor?: string;
  };
  images: Array<{
    _id?: any;
    url: string;
    alt?: string;
  }>;
  averageRating: number;
  reviews?: Array<{
    user: string; // ObjectId (User reference)
    ratings: number;
    comment: string;
  }>;
  user?: string; // ObjectId (User reference)
  createdAt: Date;
  updatedAt: Date;
}
