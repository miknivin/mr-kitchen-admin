import { Types } from "mongoose";

type Review = {
  user: Types.ObjectId;
  ratings: number;
  comment: string;
};

type Dimensions = {
  length?: number;
  width?: number;
  height?: number;
  unit?: "cm" | "inches";
};

type Specifications = {
  dimensions?: Dimensions;
  color?: string;
  weight?: number;
};

type APlusContent = {
  title: string;
  content: string;
  images: Image[];
  videoUrl?: string;
};

type Details = {
  description: string;
  features?: string[];
  materialUsed?: string[];
  aPlusContent?: APlusContent[];
};

type Image = {
  _id: string;
  url: string;
  public_id: string;
};

export type Product = {
  _id: Types.ObjectId;
  name: string;
  actualPrice: number;
  offer?: number;
  details: Details;
  ratings: number;
  images: Image[];
  category: any;
  specifications?: Specifications;
  capacity: number;
  size: "Small" | "Medium" | "Large";
  stock: number;
  numOfReviews: number;
  reviews: Review[];
  user: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  templateImages: any[];
};
