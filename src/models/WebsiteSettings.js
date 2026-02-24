import mongoose from "mongoose";

const websiteSettingsSchema = new mongoose.Schema(
  {
    moments: {
      type: [String], // Simplified from [{ type: String }] to just [String]
      validate: {
        validator: function (values) {
          return values.every(
            (val) =>
              !val ||
              /^https?:\/\/(?:www\.)?[a-z0-9-]+(?:\.[a-z]{2,})+(?:\/[^\s]*)?$/i.test(
                val,
              ),
          );
        },
        message: "Invalid video URL format",
      },
      required: false,
      default: [],
    },
    testimonials: {
      type: [
        {
          name: {
            type: String,
            required: [true, "Testimonial name is required"],
            maxLength: [100, "Name cannot exceed 100 characters"],
            trim: true,
          },
          comment: {
            type: String,
            required: [true, "Testimonial comment is required"],
            maxLength: [1000, "Comment cannot exceed 1000 characters"],
            trim: true,
          },
          rating: {
            type: Number,
            required: false,
            min: [0, "Rating cannot be less than 0"],
            max: [5, "Rating cannot be more than 5"],
          },
        },
      ],
      required: false,
      default: [],
    },
  },
  { timestamps: true },
);

const WebsiteSettings =
  mongoose.models.WebsiteSettings ||
  mongoose.model("WebsiteSettings", websiteSettingsSchema, "websiteSettings");

export default WebsiteSettings;
