import { NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db";
import { getFirebaseAdminAuth } from "@/lib/firebase-admin";
import { setAuthCookie } from "@/lib/auth";
import { signAuthToken } from "@/lib/jwt";
import User from "@/models/User";

export const runtime = "nodejs";

const bodySchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(/^\+?[1-9]\d{7,14}$/, "Phone number format is invalid"),
  firebaseToken: z.string().min(20, "Invalid Firebase token"),
  name: z.string().trim().min(2).max(80).optional(),
});

function normalizePhone(phone: string): string {
  return phone.startsWith("+") ? phone : `+${phone}`;
}

function fallbackNameFromPhone(phone: string): string {
  return `User-${phone.slice(-4)}`;
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const { phone, firebaseToken, name } = bodySchema.parse(json);

    const adminAuth = getFirebaseAdminAuth();
    const decoded = await adminAuth.verifyIdToken(firebaseToken);
    const tokenPhone = decoded.phone_number;

    if (!tokenPhone) {
      return NextResponse.json(
        { success: false, message: "Phone number missing in Firebase token" },
        { status: 401 },
      );
    }

    const normalizedPhone = normalizePhone(phone);
    const normalizedTokenPhone = normalizePhone(tokenPhone);

    if (normalizedPhone !== normalizedTokenPhone) {
      return NextResponse.json(
        { success: false, message: "Phone verification mismatch" },
        { status: 401 },
      );
    }

    await connectToDatabase();

    const user = await User.findOneAndUpdate(
      { phone: normalizedPhone },
      {
        $set: {
          phone: normalizedPhone,
          name: name || decoded.name || fallbackNameFromPhone(normalizedPhone),
          lastLoginAt: new Date(),
        },
        $setOnInsert: {
          trustScore: 50,
          riskScore: 50,
        },
        $addToSet: { providers: "phone" },
      },
      { upsert: true, new: true },
    );

    const token = signAuthToken({
      sub: user._id.toString(),
      phone: user.phone,
      name: user.name,
      provider: "phone",
    });

    const response = NextResponse.json({
      success: true,
      message: "Phone login successful",
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        image: user.image,
        trustScore: user.trustScore,
        riskScore: user.riskScore,
      },
    });

    await setAuthCookie(response, token);
    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: error.issues[0]?.message || "Invalid request",
        },
        { status: 400 },
      );
    }

    if (
      error instanceof Error &&
      error.message.includes("Firebase Admin credentials are not configured")
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Phone OTP verify backend setup pending hai. FIREBASE_SERVICE_ACCOUNT_KEY ya FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY configure karo.",
        },
        { status: 503 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error && error.message
            ? error.message
            : "Failed to login with phone",
      },
      { status: 500 },
    );
  }
}
