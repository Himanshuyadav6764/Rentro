import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db";
import OtpCode from "@/models/OtpCode";
import User from "@/models/User";
import { signAuthToken } from "@/lib/jwt";
import { setAuthCookie } from "@/lib/auth";

const bodySchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(/^\+?[1-9]\d{7,14}$/, "Phone number format is invalid"),
  otp: z.string().trim().length(6, "OTP must be 6 digits"),
  name: z.string().trim().min(2).max(80).optional(),
});

function hashOtp(otp: string): string {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

function fallbackNameFromPhone(phone: string): string {
  return `User-${phone.slice(-4)}`;
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const { phone, otp, name } = bodySchema.parse(json);

    await connectToDatabase();

    const otpDoc = await OtpCode.findOne({ phone });
    if (!otpDoc) {
      return NextResponse.json(
        { success: false, message: "OTP not requested or expired" },
        { status: 400 },
      );
    }

    if (otpDoc.expiresAt.getTime() < Date.now()) {
      return NextResponse.json(
        { success: false, message: "OTP expired. Please request a new one." },
        { status: 400 },
      );
    }

    if (otpDoc.attempts >= 5) {
      return NextResponse.json(
        { success: false, message: "Too many attempts. Request a new OTP." },
        { status: 429 },
      );
    }

    const providedHash = hashOtp(otp);
    if (otpDoc.otpHash !== providedHash) {
      otpDoc.attempts += 1;
      await otpDoc.save();
      return NextResponse.json(
        { success: false, message: "Incorrect OTP" },
        { status: 401 },
      );
    }

    otpDoc.verifiedAt = new Date();
    await otpDoc.save();

    const user = await User.findOneAndUpdate(
      { phone },
      {
        $setOnInsert: {
          phone,
          name: name || fallbackNameFromPhone(phone),
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
      message: "Logged in successfully",
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
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

    return NextResponse.json(
      {
        success: false,
        message: "Failed to verify OTP",
      },
      { status: 500 },
    );
  }
}
