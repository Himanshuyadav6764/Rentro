import { getCurrentJwtUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";

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
 * Uses the custom JWT cookie (set by /api/auth/firebase-login) as the
 * primary auth source. This is the only auth method the app actually uses
 * — NextAuth's SessionProvider has been removed.
 */
export async function getAuthenticatedUser() {
  // Primary: custom JWT cookie (Firebase popup → /api/auth/firebase-login)
  const jwtUser = await getCurrentJwtUser();
  if (jwtUser) {
    return jwtUser;
  }

  return null;
}
