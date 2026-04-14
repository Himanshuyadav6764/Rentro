import { Schema, model, models } from "mongoose";

export interface IOtpCode {
  email: string;
  otpHash: string;
  expiresAt: Date;
  attempts: number;
  consumedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OtpCodeSchema = new Schema<IOtpCode>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
    },
    otpHash: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
    attempts: {
      type: Number,
      default: 0,
    },
    consumedAt: Date,
  },
  { timestamps: true },
);

OtpCodeSchema.index({ email: 1 }, { unique: true });

const OtpCode = models.OtpCode || model<IOtpCode>("OtpCode", OtpCodeSchema);

export default OtpCode;
