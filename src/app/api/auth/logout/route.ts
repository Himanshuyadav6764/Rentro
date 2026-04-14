import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ success: true, message: "Logged out" });
  await clearAuthCookie(response);

  response.cookies.set("next-auth.session-token", "", { path: "/", maxAge: 0 });
  response.cookies.set("__Secure-next-auth.session-token", "", {
    path: "/",
    maxAge: 0,
    secure: true,
  });
  response.cookies.set("next-auth.csrf-token", "", { path: "/", maxAge: 0 });
  response.cookies.set("__Host-next-auth.csrf-token", "", {
    path: "/",
    maxAge: 0,
    secure: true,
  });

  return response;
}
