import { Schema, model, models } from "mongoose";

export interface IOtpCode {
  phone: string;
  otpHash: string;
  expiresAt: Date;
  attempts: number;
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OtpCodeSchema = new Schema<IOtpCode>(
  {
    phone: {
      type: String,
      required: true,
      index: true,
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
    verifiedAt: Date,
  },
  { timestamps: true },
);

const OtpCode = models.OtpCode || model<IOtpCode>("OtpCode", OtpCodeSchema);

export default OtpCode;
