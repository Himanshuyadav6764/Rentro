import { NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db";
import OtpCode from "@/models/OtpCode";
import User from "@/models/User";
import { signAuthToken } from "@/lib/jwt";
import { setAuthCookie } from "@/lib/auth";
import { verifyOtpHash } from "@/lib/otp";
import { getDevOtp, updateDevOtp } from "@/lib/devOtpStore";

const bodySchema = z.object({
  email: z.email("Please enter a valid email address").trim().toLowerCase(),
  otp: z.string().trim().length(6, "OTP must be 6 digits"),
  name: z.string().trim().min(2).max(80).optional(),
});

function fallbackNameFromEmail(email: string): string {
  return email.split("@")[0] || "Rentro User";
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const { email, otp, name } = bodySchema.parse(json);

    try {
      await connectToDatabase();

      const otpDoc = await OtpCode.findOne({ email });
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

      if (otpDoc.consumedAt) {
        return NextResponse.json(
          { success: false, message: "OTP already used. Request a new OTP." },
          { status: 400 },
        );
      }

      if (otpDoc.attempts >= 5) {
        return NextResponse.json(
          { success: false, message: "Too many attempts. Request a new OTP." },
          { status: 429 },
        );
      }

      const isValidOtp = verifyOtpHash(email, otp, otpDoc.otpHash);
      if (!isValidOtp) {
        otpDoc.attempts += 1;
        await otpDoc.save();
        return NextResponse.json(
          { success: false, message: "Incorrect OTP" },
          { status: 401 },
        );
      }

      otpDoc.consumedAt = new Date();
      await otpDoc.save();

      const user = await User.findOneAndUpdate(
        { email },
        {
          $set: {
            email,
            name: name || fallbackNameFromEmail(email),
            lastLoginAt: new Date(),
          },
          $setOnInsert: {
            trustScore: 50,
            riskScore: 50,
          },
          $addToSet: { providers: "email" },
        },
        { upsert: true, new: true },
      );

      const token = signAuthToken({
        sub: user._id.toString(),
        email: user.email,
        name: user.name,
        provider: "email",
      });

      const response = NextResponse.json({
        success: true,
        message: "Logged in successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          image: user.image,
          trustScore: user.trustScore,
          riskScore: user.riskScore,
        },
      });

      await setAuthCookie(response, token);
      return response;
    } catch {
      if (process.env.NODE_ENV === "production") {
        throw new Error("Database unavailable for OTP verification");
      }

      const otpRecord = getDevOtp(email);
      if (!otpRecord) {
        return NextResponse.json(
          { success: false, message: "OTP not requested or expired" },
          { status: 400 },
        );
      }

      if (otpRecord.expiresAt.getTime() < Date.now()) {
        return NextResponse.json(
          { success: false, message: "OTP expired. Please request a new one." },
          { status: 400 },
        );
      }

      if (otpRecord.consumedAt) {
        return NextResponse.json(
          { success: false, message: "OTP already used. Request a new OTP." },
          { status: 400 },
        );
      }

      if (otpRecord.attempts >= 5) {
        return NextResponse.json(
          { success: false, message: "Too many attempts. Request a new OTP." },
          { status: 429 },
        );
      }

      const isValidOtp = verifyOtpHash(email, otp, otpRecord.otpHash);
      if (!isValidOtp) {
        updateDevOtp(email, { attempts: otpRecord.attempts + 1 });
        return NextResponse.json(
          { success: false, message: "Incorrect OTP" },
          { status: 401 },
        );
      }

      const resolvedName = name || fallbackNameFromEmail(email);
      updateDevOtp(email, { consumedAt: new Date() });

      const token = signAuthToken({
        sub: `dev-email:${email}`,
        email,
        name: resolvedName,
        provider: "email",
      });

      const response = NextResponse.json({
        success: true,
        message: "Logged in successfully (development mode)",
        user: {
          id: `dev-email:${email}`,
          name: resolvedName,
          email,
          phone: undefined,
          image: undefined,
          trustScore: 50,
          riskScore: 50,
        },
      });

      await setAuthCookie(response, token);
      return response;
    }
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
