import mongoose from "mongoose";

const { Schema } = mongoose;

const ProductSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    sku: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    discountPrice: {
      type: Number,
      min: 0,
      default: 0,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    shortDescription: {
      type: String,
      required: true,
      trim: true,
      maxlength: [230, "Short description cannot exceed 230 characters"],
    },
    features: {
      type: [{ type: String, trim: true }],
      validate: {
        validator: (features) => features.length <= 20,
        message: "Maximum 20 features allowed",
      },
      default: [],
    },
    variants: [
      {
        size: {
          type: String,
          required: true,
          enum: ["85ml", "500ml", "600ml", "2L", "12ml", "20ml", "30ml", "50ml", "100ml", "150ml", "50g", "100g", "200g", "500g", "1kg"], // Restrict to common sizes
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
        discountPrice: {
          type: Number,
          min: 0,
          default: null,
        },
        imageUrl: {
          type: [{ type: String }],
          default: [],
        },
      },
    ],
    stockQuantity: {
      type: Number,
      required: true,
      min: 0,
    },
    gender: {
      type: String,
      enum: ["Unisex", "Male", "Female"],
      default: "Unisex",
    },
    category: {
      type: String,
      required: true,
      enum: ["Baby Oil", "Powder", "Soap", "Natural Oil"],
    },
    mainImage: {
      type: String,
      required: false,
      trim: true,
    },
    color: {
      primaryColor: {
        type: String,
        trim: true,
      },
    },
    images: [
      {
        url: { type: String, required: true },
        alt: { type: String, default: "" },
      },
    ],
    averageRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        ratings: {
          type: Number,
          required: true,
        },
        comment: {
          type: String,
          required: true,
        },
      },
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

if (mongoose.models.Product) {
  delete mongoose.models.Product;
}
const Product =
  mongoose.models.Product || mongoose.model("Product", ProductSchema);

export default Product;
