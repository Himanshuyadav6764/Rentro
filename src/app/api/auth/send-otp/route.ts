import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  email: z.email("Please enter a valid email address").trim().toLowerCase(),
});

function isPlaceholder(value: string | undefined): boolean {
  if (!value) {
    return true;
  }

  const normalized = value.trim().toLowerCase();
  return normalized.startsWith("your-") || normalized.includes("example");
}

function mapFirebaseSendError(code: string): string {
  switch (code) {
    case "CONFIGURATION_NOT_FOUND":
      return "Firebase Authentication config missing hai. Console me Email link sign-in enable karo.";
    case "OPERATION_NOT_ALLOWED":
      return "Email link sign-in enabled nahi hai. Firebase Authentication me Email provider + Email link enable karo.";
    case "INVALID_EMAIL":
      return "Email address invalid hai.";
    case "TOO_MANY_ATTEMPTS_TRY_LATER":
      return "Too many attempts. Thodi der baad try karo.";
    default:
      return "Email link send nahi ho paya. Firebase Authentication setup verify karo.";
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const { email } = bodySchema.parse(json);

    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;

    if (isPlaceholder(apiKey) || isPlaceholder(authDomain)) {
      return NextResponse.json(
        {
          success: false,
          message: "Firebase client config missing hai. NEXT_PUBLIC_FIREBASE_API_KEY aur AUTH_DOMAIN set karo.",
        },
        { status: 503 },
      );
    }

    const origin = new URL(request.url).origin;

    const firebaseResponse = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestType: "EMAIL_SIGNIN",
          email,
          continueUrl: `${origin}/`,
          canHandleCodeInApp: true,
        }),
      },
    );

    if (!firebaseResponse.ok) {
      const errorPayload = (await firebaseResponse.json().catch(() => ({}))) as {
        error?: { message?: string };
      };

      const firebaseCode = errorPayload.error?.message || "UNKNOWN";
      return NextResponse.json(
        {
          success: false,
          message: mapFirebaseSendError(firebaseCode),
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Sign-in link sent to your email",
      resendAfterSeconds: 30,
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
