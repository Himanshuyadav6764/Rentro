import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const OTP_AUTH_COOKIE = "rentro_token";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const otpCookie = request.cookies.get(OTP_AUTH_COOKIE)?.value;
  const nextAuthToken = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (otpCookie || nextAuthToken) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/", request.url);
  loginUrl.searchParams.set("auth", "required");
  loginUrl.searchParams.set("redirect", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/home/:path*", "/chat/:path*", "/pricing-availability/:path*"],
};
