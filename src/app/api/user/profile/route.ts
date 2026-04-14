import { NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import { getAuthenticatedUser, serializeUser } from "@/lib/session";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";

const imageSchema = z
  .string()
  .trim()
  .min(1)
  .refine(
    (value) => value.startsWith("/") || /^https?:\/\//i.test(value),
    "Image URL invalid",
  );

const bodySchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  email: z.email().trim().toLowerCase().optional().or(z.literal("")),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  image: imageSchema.optional(),
});

function normalizePhone(value: string) {
  const digitsOnly = value.replace(/\D/g, "");

  if (digitsOnly.length === 11 && digitsOnly.startsWith("0")) {
    return digitsOnly.slice(0, 10);
  }

  if (digitsOnly.length > 10) {
    return digitsOnly.slice(0, 10);
  }

  return digitsOnly;
}

export async function PATCH(request: Request) {
  try {
    const authUser = await getAuthenticatedUser();

    if (!authUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const json = await request.json();
    const payload = bodySchema.parse(json);

    const normalizedEmail = payload.email ? payload.email.trim().toLowerCase() : "";
    const normalizedPhone = payload.phone ? normalizePhone(payload.phone.trim()) : "";

    if (normalizedPhone && normalizedPhone.length !== 10) {
      return NextResponse.json(
        { success: false, message: "Phone number must be exactly 10 digits" },
        { status: 400 },
      );
    }

    const updates: {
      name?: string;
      email?: string;
      phone?: string;
      image?: string;
      lastLoginAt?: Date;
    } = {
      lastLoginAt: new Date(),
    };

    if (payload.name) {
      updates.name = payload.name;
    }

    if (payload.email !== undefined) {
      updates.email = normalizedEmail || undefined;
    }

    if (payload.phone !== undefined) {
      updates.phone = normalizedPhone || undefined;
    }

    if (payload.image) {
      updates.image = payload.image;
    }

    try {
      await connectToDatabase();

      const userId = authUser._id?.toString?.();
      const query =
        userId && mongoose.Types.ObjectId.isValid(userId)
          ? { _id: userId }
          : authUser.email
            ? { email: authUser.email.toLowerCase() }
            : authUser.phone
              ? { phone: authUser.phone }
              : null;

      if (!query) {
        return NextResponse.json(
          { success: false, message: "Unable to identify profile" },
          { status: 400 },
        );
      }

      const updated = await User.findOneAndUpdate(
        query,
        {
          $set: updates,
          $setOnInsert: {
            trustScore: 50,
            riskScore: 50,
          },
        },
        { new: true, upsert: true },
      ).lean();

      if (!updated) {
        return NextResponse.json(
          { success: false, message: "Profile update failed" },
          { status: 500 },
        );
      }

      return NextResponse.json({
        success: true,
        user: serializeUser(updated),
      });
    } catch {
      if (process.env.NODE_ENV === "production") {
        throw new Error("Database unavailable for profile update");
      }

      const fallbackUser = {
        ...authUser,
        name: updates.name || authUser.name,
        email: updates.email || authUser.email,
        phone: updates.phone || authUser.phone,
        image: updates.image || authUser.image,
        providers: authUser.providers || [],
      };

      return NextResponse.json({
        success: true,
        user: serializeUser(fallbackUser),
      });
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
        message:
          error instanceof Error ? error.message : "Profile update failed",
      },
      { status: 500 },
    );
  }
}
