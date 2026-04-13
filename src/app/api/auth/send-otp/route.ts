import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import OtpCode from "@/models/OtpCode";
import { connectToDatabase } from "@/lib/db";

const bodySchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(/^\+?[1-9]\d{7,14}$/, "Phone number format is invalid"),
});

function hashOtp(otp: string): string {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const { phone } = bodySchema.parse(json);

    await connectToDatabase();

    const otp = generateOtp();
    const otpHash = hashOtp(otp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await OtpCode.findOneAndUpdate(
      { phone },
      {
        phone,
        otpHash,
        expiresAt,
        attempts: 0,
        verifiedAt: null,
      },
      { upsert: true, new: true },
    );

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
      // Dev-only OTP echo for local testing while SMS gateway is not integrated.
      devOtp: process.env.NODE_ENV === "development" ? otp : undefined,
    });
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
        message: "Failed to send OTP",
      },
      { status: 500 },
    );
  }
}
