import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: "user" | "admin";
  currentSessionId?: string;
  lastLoginAt?: Date;
  lastLoginDevice?: string;
  failedLoginAttempts?: number;
  lockUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    currentSessionId: {
      type: String,
      default: null,
      index: true,
    },
    lastLoginAt: {
      type: Date,
      default: Date.now,
    },
    lastLoginDevice: {
      type: String,
      default: "",
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

if (process.env.NODE_ENV !== "production" && mongoose.models && mongoose.models.User) {
  delete mongoose.models.User;
}

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
