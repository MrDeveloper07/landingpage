import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ISubdomainRequest extends Document {
  userId: Types.ObjectId;
  userName: string;
  userEmail: string;
  subdomain: string;
  recordType: "CNAME" | "A" | "AAAA" | "TXT";
  target: string;
  description?: string;
  repoUrl?: string;
  status: "pending" | "approved" | "rejected" | "suspended";
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SubdomainRequestSchema = new Schema<ISubdomainRequest>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    subdomain: {
      type: String,
      required: [true, "Subdomain name is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [/^[a-z0-9]([a-z0-9-]{1,61}[a-z0-9])?$/, "Invalid subdomain format"],
    },
    recordType: {
      type: String,
      enum: ["CNAME", "A", "AAAA", "TXT"],
      default: "CNAME",
      required: true,
    },
    target: {
      type: String,
      required: [true, "Destination target is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    repoUrl: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "suspended"],
      default: "pending",
      index: true,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const SubdomainRequest: Model<ISubdomainRequest> =
  mongoose.models.SubdomainRequest ||
  mongoose.model<ISubdomainRequest>("SubdomainRequest", SubdomainRequestSchema);

export default SubdomainRequest;
