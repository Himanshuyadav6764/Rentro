import { NextResponse } from "next/server";
export async function GET(request: Request) {
  const redirectUrl = new URL("/api/auth/signin/google", request.url);
  const callbackUrl = new URL("/", request.url).toString();
  redirectUrl.searchParams.set("callbackUrl", callbackUrl);

  return NextResponse.redirect(redirectUrl);
}
