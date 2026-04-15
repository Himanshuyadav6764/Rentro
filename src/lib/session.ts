import { getCurrentJwtUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/nextAuth";

type LeanUser = {
  _id: { toString: () => string };
  name: string;
  email?: string;
  phone?: string;
  image?: string;
  providers?: string[];
  trustScore?: number;
  riskScore?: number;
  createdAt?: Date;
};

export function serializeUser(user: LeanUser) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone,
    image: user.image,
    providers: user.providers || [],
    trustScore: user.trustScore ?? 50,
    riskScore: user.riskScore ?? 50,
    createdAt: user.createdAt,
  };
}

/**
 * Returns the authenticated user.
 * Supports both auth strategies currently used in the app:
 * 1) custom JWT cookie (legacy OTP/Firebase flows)
 * 2) NextAuth Google OAuth session cookie
 */
export async function getAuthenticatedUser() {
  // Legacy auth cookie flow
  const jwtUser = await getCurrentJwtUser();
  if (jwtUser) {
    return jwtUser;
  }

  // NextAuth Google session flow
  const session = await getServerSession(authOptions);
  const sessionUser = session?.user;
  const sessionEmail = sessionUser?.email?.toLowerCase();
  if (!sessionEmail) {
    return null;
  }

  const sessionName = sessionUser?.name || sessionEmail.split("@")[0];
  const sessionImage = sessionUser?.image;

  try {
    await connectToDatabase();

    const dbUser = await User.findOneAndUpdate(
      { email: sessionEmail },
      {
        $set: {
          email: sessionEmail,
          name: sessionName,
          image: sessionImage,
          lastLoginAt: new Date(),
        },
        $setOnInsert: {
          trustScore: 50,
          riskScore: 50,
        },
        $addToSet: { providers: "google" },
      },
      { upsert: true, new: true },
    ).lean();

    if (dbUser) {
      return dbUser;
    }
  } catch (error) {
    console.error("[session] NextAuth user lookup failed:", error);
  }

  // Minimal fallback so user is treated as authenticated even during transient DB issues.
  return {
    _id: { toString: () => `google:${sessionEmail}` },
    name: sessionName || "Rentro User",
    email: sessionEmail,
    phone: undefined,
    image: sessionImage,
    providers: ["google"],
    trustScore: 50,
    riskScore: 50,
    createdAt: new Date(),
  };
}
