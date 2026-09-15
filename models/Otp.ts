import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOtp extends Document {
  email: string;
  otp: string;
  purpose: "registration" | "reset_password";
  attempts: number;
  createdAt: Date;
}

const OtpSchema = new Schema<IOtp>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      index: true,
    },
    otp: {
      type: String,
      required: [true, "OTP is required"],
      trim: true,
    },
    purpose: {
      type: String,
      enum: ["registration", "reset_password"],
      default: "registration",
    },
    attempts: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 600, // MongoDB TTL index: automatically deletes document after 10 minutes (600 seconds)
    },
  },
  {
    timestamps: false,
  }
);

const Otp: Model<IOtp> =
  mongoose.models.Otp || mongoose.model<IOtp>("Otp", OtpSchema);

export default Otp;
