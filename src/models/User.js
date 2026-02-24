import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [false, "Please enter your name"],
      maxlength: [50, "Your name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      unique: true,
      sparse: true, // Allows the unique constraint to be ignored if the value is null or undefined
      validate: {
        validator: function (value) {
          return !this.phone || !!value; // Only validate email if phone is not provided
        },
        message: "Email or phone is required",
      },
    },
    phone: {
      type: String,
      unique: true,
      sparse: true, // Allows the unique constraint to be ignored if the value is null or undefined
      validate: {
        validator: function (value) {
          return !this.email || !!value; // Only validate phone if email is not provided
        },
        message: "Email or phone is required",
      },
    },
    password: {
      type: String,
      required: [false, "Please enter your password"],
      minlength: [6, "Your password must be longer than 6 characters"],
      select: false,
    },
    avatar: {
      public_id: String,
      url: String, // Provide a default value (e.g., "user.jpg") for the avatar
    },
    role: {
      type: String,
      default: "user",
      immutable: true,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    signupMethod: {
      type: String,
      enum: ["OTP", "Email/Password", "OAuth"],
      default: "Email/Password", // Provide a default value
    },
  },
  { timestamps: true },
);

// Explicitly create an index on the email field

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  this.password = await bcrypt.hash(this.password, 10);
});

// Return JWT token
userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_TIME,
  });
};

// Compare entered password with hashed password in DB
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate password reset token
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hash and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes
  return resetToken;
};

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
