import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAuditLog extends Document {
  action: string;
  category: "subdomain" | "user" | "security" | "system";
  actorEmail: string;
  target?: string;
  details: string;
  ipAddress?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    action: {
      type: String,
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: ["subdomain", "user", "security", "system"],
      default: "subdomain",
      index: true,
    },
    actorEmail: {
      type: String,
      required: true,
      index: true,
    },
    target: {
      type: String,
      default: "",
    },
    details: {
      type: String,
      required: true,
    },
    ipAddress: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// High-speed sorting and filtering indexes for audit logs
AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ category: 1, createdAt: -1 });

const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);

export default AuditLog;
