import { Schema, model, models } from "mongoose";

export type AuthProvider = "phone" | "google";

export interface IUser {
  phone: string;
  name: string;
  email?: string;
  googleId?: string;
  avatarUrl?: string;
  providers: AuthProvider[];
  trustScore: number;
  riskScore: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true,
    },
    googleId: {
      type: String,
      sparse: true,
    },
    avatarUrl: String,
    providers: {
      type: [String],
      enum: ["phone", "google"],
      default: ["phone"],
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
  },
  { timestamps: true },
);

const User = models.User || model<IUser>("User", UserSchema);

export default User;
