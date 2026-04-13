import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ success: false, user: null }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      trustScore: user.trustScore,
      riskScore: user.riskScore,
      providers: user.providers,
    },
  });
}
