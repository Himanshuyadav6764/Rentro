import { Schema, model, models } from "mongoose";

export interface IAuthRateLimit {
  key: string;
  type: string;
  count: number;
  windowStart: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AuthRateLimitSchema = new Schema<IAuthRateLimit>(
  {
    key: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
    },
    count: {
      type: Number,
      default: 0,
      min: 0,
    },
    windowStart: {
      type: Date,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
  },
  { timestamps: true },
);

AuthRateLimitSchema.index({ key: 1, type: 1 }, { unique: true });

const AuthRateLimit =
  models.AuthRateLimit ||
  model<IAuthRateLimit>("AuthRateLimit", AuthRateLimitSchema);

export default AuthRateLimit;