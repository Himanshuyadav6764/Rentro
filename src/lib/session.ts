import { getServerSession } from "next-auth";
import { getCurrentJwtUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { authOptions } from "@/lib/nextAuth";
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

export async function getAuthenticatedUser() {
  const session = await getServerSession(authOptions);
  if (session?.user?.email) {
    try {
      await connectToDatabase();

      const nextAuthUser = await User.findOne({
        email: session.user.email.toLowerCase(),
      }).lean();

      if (nextAuthUser) {
        return nextAuthUser;
      }
    } catch {
      if (process.env.NODE_ENV !== "production") {
        return {
          _id: { toString: () => `google:${session.user.email}` },
          name: session.user.name || "Rentro User",
          email: session.user.email,
          phone: session.user.phone,
          image: session.user.image,
          providers: [session.user.provider || "google"],
          trustScore: 50,
          riskScore: 50,
          createdAt: new Date(),
        };
      }
    }
  }

  const jwtUser = await getCurrentJwtUser();
  return jwtUser;
}
