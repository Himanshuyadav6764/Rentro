import { OAuth2Client } from "google-auth-library";
import { NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db";
import { setAuthCookie } from "@/lib/auth";
import { signAuthToken } from "@/lib/jwt";
import User from "@/models/User";

const bodySchema = z.object({
  credential: z.string().min(10),
});

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function normalizePhoneFromSub(sub: string): string {
  const digits = sub.replace(/\D/g, "").slice(-10).padStart(10, "0");
  return `+91${digits}`;
}

export async function POST(request: Request) {
  try {
    if (!process.env.GOOGLE_CLIENT_ID) {
      return NextResponse.json(
        { success: false, message: "Google login is not configured" },
        { status: 500 },
      );
    }

    const json = await request.json();
    const { credential } = bodySchema.parse(json);

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload?.sub || !payload?.email) {
      return NextResponse.json(
        { success: false, message: "Invalid Google token" },
        { status: 401 },
      );
    }

    await connectToDatabase();

    const user = await User.findOneAndUpdate(
      { email: payload.email.toLowerCase() },
      {
        $set: {
          email: payload.email.toLowerCase(),
          name: payload.name || payload.email.split("@")[0],
          avatarUrl: payload.picture,
          googleId: payload.sub,
        },
        $setOnInsert: {
          phone: normalizePhoneFromSub(payload.sub),
          trustScore: 50,
          riskScore: 50,
        },
        $addToSet: { providers: "google" },
      },
      { upsert: true, new: true },
    );

    const token = signAuthToken({
      sub: user._id.toString(),
      phone: user.phone,
      name: user.name,
      provider: "google",
    });

    const response = NextResponse.json({
      success: true,
      message: "Google login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        trustScore: user.trustScore,
        riskScore: user.riskScore,
      },
    });

    await setAuthCookie(response, token);
    return response;
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Google authentication failed",
      },
      { status: 401 },
    );
  }
}
