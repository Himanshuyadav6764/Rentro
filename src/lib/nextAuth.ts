import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import { isConfigured, warnMissingEnv, getMissingEnvVars } from "@/lib/envCheck";

const googleEnabled = Boolean(
  isConfigured(process.env.GOOGLE_CLIENT_ID) &&
    isConfigured(process.env.GOOGLE_CLIENT_SECRET),
);

if (!googleEnabled) {
  warnMissingEnv(
    "NextAuth",
    getMissingEnvVars({
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    }),
  );
}

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
            },
            $addToSet: { providers: "google" },
          },
          { upsert: true },
        );
      } catch (err) {
        console.error("[NextAuth:signIn] DB error:", err);
        return false;
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
        } catch (err) {
          console.error("[NextAuth:jwt] DB error:", err);
          // In production we still need a usable uid even if DB lookup fails
          // temporarily. The user was already authenticated by Google OAuth.
          if (!token.uid) {
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
