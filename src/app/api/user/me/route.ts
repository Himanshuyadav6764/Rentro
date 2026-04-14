import { NextResponse } from "next/server";
import { getAuthenticatedUser, serializeUser } from "@/lib/session";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ success: false, user: null }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user: serializeUser(user),
    });
  } catch {
    return NextResponse.json({ success: false, user: null }, { status: 401 });
  }
}
