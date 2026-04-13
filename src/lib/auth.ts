import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import User from "@/models/User";
import { verifyAuthToken } from "@/lib/jwt";
import { connectToDatabase } from "@/lib/db";

export const AUTH_COOKIE = "studentrental_token";

const cookieBaseOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export async function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set({
    ...cookieBaseOptions,
    name: AUTH_COOKIE,
    value: token,
    maxAge: 7 * 24 * 60 * 60,
  });
}

export async function clearAuthCookie(response: NextResponse) {
  response.cookies.set({
    ...cookieBaseOptions,
    name: AUTH_COOKIE,
    value: "",
    maxAge: 0,
  });
}

export async function getCurrentUser() {
  await connectToDatabase();
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    const payload = verifyAuthToken(token);
    const user = await User.findById(payload.sub).lean();
    if (!user) {
      return null;
    }
    return user;
  } catch {
    return null;
  }
}
