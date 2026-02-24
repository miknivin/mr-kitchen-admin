// src/models/Enquiry.js
import mongoose from "mongoose";

const enquirySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [false, "Please enter your name"],
    maxlength: [50, "Your name cannot exceed 50 characters"],
  },
  email: {
    type: String,
    validate: {
      validator: function (value) {
        return this.phone || value; // At least one of email or phone must be present
      },
      message: "Email or phone is required",
    },
  },
  phone: {
    type: String,
    validate: {
      validator: function (value) {
        return this.email || value; // At least one of email or phone must be present
      },
      message: "Email or phone is required",
    },
  },
  subject: { type: String },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

if (mongoose.models.Enquiry) {
  delete mongoose.models.Enquiry;
}
const Enquiry = mongoose.model("Enquiry", enquirySchema);

export default Enquiry;