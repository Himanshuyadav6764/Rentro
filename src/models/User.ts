import { Schema, model, models } from "mongoose";

export type AuthProvider = "phone" | "google" | "email";

export interface IUser {
  name: string;
  email?: string;
  phone?: string;
  image?: string;
  providers: AuthProvider[];
  trustScore: number;
  riskScore: number;
  followers: string[];
  following: string[];
  memberSinceAt?: Date;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    image: String,
    providers: {
      type: [String],
      enum: ["phone", "google", "email"],
      default: [],
    },
    trustScore: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },
    riskScore: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },
    followers: {
      type: [String],
      default: [],
    },
    following: {
      type: [String],
      default: [],
    },
    memberSinceAt: {
      type: Date,
      default: Date.now,
      immutable: true,
    },
    lastLoginAt: Date,
  },
  { timestamps: true },
);

UserSchema.index({ email: 1 }, { unique: true, sparse: true });
UserSchema.index({ phone: 1 }, { unique: true, sparse: true });

const User = models.User || model<IUser>("User", UserSchema);

export default User;
