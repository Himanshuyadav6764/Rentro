import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/session";
import User from "@/models/User";

const bodySchema = z.object({
  targetUserId: z.string().trim().min(1, "targetUserId is required"),
});

function isObjectId(value: string) {
  return mongoose.Types.ObjectId.isValid(value);
}

export async function POST(request: Request) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { targetUserId } = bodySchema.parse(await request.json());
    const currentUserId = authUser._id?.toString?.() || "";

    if (!currentUserId || currentUserId === targetUserId) {
      return NextResponse.json(
        { success: false, message: "Invalid follow target" },
        { status: 400 },
      );
    }

    if (!isObjectId(currentUserId) || !isObjectId(targetUserId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Follow action is available only for persisted users",
        },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const targetUser = await User.findById(targetUserId).select("_id followers").lean();
    if (!targetUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    const alreadyFollowing = (targetUser.followers || []).includes(currentUserId);

    if (alreadyFollowing) {
      await Promise.all([
        User.findByIdAndUpdate(currentUserId, { $pull: { following: targetUserId } }),
        User.findByIdAndUpdate(targetUserId, { $pull: { followers: currentUserId } }),
      ]);
    } else {
      await Promise.all([
        User.findByIdAndUpdate(currentUserId, { $addToSet: { following: targetUserId } }),
        User.findByIdAndUpdate(targetUserId, { $addToSet: { followers: currentUserId } }),
      ]);
    }

    const refreshedCurrent = await User.findById(currentUserId)
      .select("followers following")
      .lean();
    const refreshedTarget = await User.findById(targetUserId)
      .select("followers")
      .lean();

    return NextResponse.json({
      success: true,
      following: !alreadyFollowing,
      currentFollowingCount: refreshedCurrent?.following?.length || 0,
      currentFollowerCount: refreshedCurrent?.followers?.length || 0,
      targetFollowerCount: refreshedTarget?.followers?.length || 0,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: error.issues[0]?.message || "Invalid request" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Follow action failed",
      },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const targetUserId = (searchParams.get("targetUserId") || "").trim();
    const currentUserId = authUser._id?.toString?.() || "";

    if (!targetUserId || !currentUserId) {
      return NextResponse.json(
        { success: false, message: "targetUserId is required" },
        { status: 400 },
      );
    }

    if (!isObjectId(targetUserId)) {
      return NextResponse.json(
        { success: false, message: "Invalid target user" },
        { status: 400 },
      );
    }

    await connectToDatabase();
    const targetUser = await User.findById(targetUserId).select("followers").lean();
    if (!targetUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    const followers = targetUser.followers || [];

    return NextResponse.json({
      success: true,
      following: followers.includes(currentUserId),
      targetFollowerCount: followers.length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unable to fetch follow status",
      },
      { status: 500 },
    );
  }
}
