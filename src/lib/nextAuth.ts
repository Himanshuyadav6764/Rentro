import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";

function isValidGoogleCredential(value: string | undefined): boolean {
  if (!value) {
    return false;
  }

  const normalized = value.trim().toLowerCase();
  return !normalized.startsWith("your-") && !normalized.includes("example");
}

const googleEnabled = Boolean(
  isValidGoogleCredential(process.env.GOOGLE_CLIENT_ID) &&
    isValidGoogleCredential(process.env.GOOGLE_CLIENT_SECRET),
);

export const authOptions: NextAuthOptions = {
  providers: googleEnabled
    ? [
        GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID as string,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }),
      ]
    : [],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "google") {
        return false;
      }

      if (!user.email) {
        return false;
      }

      try {
        await connectToDatabase();

        await User.findOneAndUpdate(
          { email: user.email.toLowerCase() },
          {
            $set: {
              email: user.email.toLowerCase(),
              name: user.name || user.email.split("@")[0],
              image: user.image,
              lastLoginAt: new Date(),
            },
            $setOnInsert: {
              trustScore: 50,
              riskScore: 50,
              followers: [],
              following: [],
              memberSinceAt: new Date(),
            },
            $addToSet: { providers: "google" },
          },
          { upsert: true },
        );
      } catch {
        if (process.env.NODE_ENV === "production") {
          return false;
        }
      }

      return true;
    },
    async jwt({ token, account, user }) {
      if (account?.provider) {
        token.provider = account.provider;
      }

      if (user?.email) {
        token.email = user.email;
      }

      if (typeof token.email === "string") {
        try {
          await connectToDatabase();
          const dbUser = await User.findOne({
            email: token.email.toLowerCase(),
          })
            .select("_id name email phone image providers")
            .lean();

          if (dbUser) {
            token.uid = dbUser._id.toString();
            token.name = dbUser.name;
            token.email = dbUser.email;
            token.picture = dbUser.image;
            token.phone = dbUser.phone;
          }
        } catch {
          if (process.env.NODE_ENV !== "production") {
            token.uid = `google:${token.email}`;
          }
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = typeof token.uid === "string" ? token.uid : "";
        session.user.email =
          typeof token.email === "string" ? token.email : undefined;
        session.user.name = typeof token.name === "string" ? token.name : "";
        session.user.image =
          typeof token.picture === "string" ? token.picture : undefined;
        session.user.phone =
          typeof token.phone === "string" ? token.phone : undefined;
        session.user.provider =
          typeof token.provider === "string" ? token.provider : "google";
      }

      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
