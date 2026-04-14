import { NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db";
import { setAuthCookie } from "@/lib/auth";
import { signAuthToken } from "@/lib/jwt";
import User from "@/models/User";

export const runtime = "nodejs";

const bodySchema = z.object({
  firebaseToken: z.string().min(20, "Invalid Firebase token"),
  provider: z.enum(["email", "google"]),
  name: z.string().trim().min(2).max(80).optional(),
});

type FirebaseLookupUser = {
  localId: string;
  email?: string;
  displayName?: string;
  photoUrl?: string;
  phoneNumber?: string;
};

function isPlaceholder(value: string | undefined): boolean {
  if (!value) {
    return true;
  }

  const normalized = value.trim().toLowerCase();
  return normalized.startsWith("your-") || normalized.includes("example");
}

async function verifyFirebaseIdTokenWithApiKey(
  idToken: string,
): Promise<FirebaseLookupUser> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

  if (isPlaceholder(apiKey)) {
    throw new Error("Firebase API key is not configured");
  }

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idToken }),
    },
  );

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as {
      error?: { message?: string };
    };

    const code = payload.error?.message || "UNKNOWN";
    if (code.includes("INVALID_ID_TOKEN") || code.includes("USER_NOT_FOUND")) {
      throw new Error("Firebase token invalid or expired");
    }

    throw new Error("Unable to verify Firebase token");
  }

  const data = (await response.json()) as { users?: FirebaseLookupUser[] };
  const user = data.users?.[0];

  if (!user?.localId) {
    throw new Error("Firebase account not found");
  }

  return user;
}

function fallbackName(email: string | undefined, uid: string) {
  if (email) {
    return email.split("@")[0] || "Rentro User";
  }

  return `User-${uid.slice(-6)}`;
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const { firebaseToken, provider, name } = bodySchema.parse(json);

    const firebaseUser = await verifyFirebaseIdTokenWithApiKey(firebaseToken);

    if (!firebaseUser.email) {
      return NextResponse.json(
        {
          success: false,
          message: "Email not found in Firebase account",
        },
        { status: 400 },
      );
    }

    const normalizedEmail = firebaseUser.email.toLowerCase();
    const resolvedName =
      name || firebaseUser.displayName || fallbackName(normalizedEmail, firebaseUser.localId);

    let userId = `firebase:${firebaseUser.localId}`;
    let userName = resolvedName;
    let userEmail = normalizedEmail;
    let userImage = firebaseUser.photoUrl;

    try {
      await connectToDatabase();

      const dbUser = await User.findOneAndUpdate(
        { email: normalizedEmail },
        {
          $set: {
            email: normalizedEmail,
            name: resolvedName,
            image: firebaseUser.photoUrl,
            lastLoginAt: new Date(),
          },
          $setOnInsert: {
            trustScore: 50,
            riskScore: 50,
          },
          $addToSet: { providers: provider },
        },
        { upsert: true, new: true },
      );

      userId = dbUser._id.toString();
      userName = dbUser.name;
      userEmail = dbUser.email;
      userImage = dbUser.image;
    } catch {
      if (process.env.NODE_ENV === "production") {
        throw new Error("Database unavailable for login");
      }
    }

    const token = signAuthToken({
      sub: userId,
      email: userEmail,
      name: userName,
      provider,
    });

    const response = NextResponse.json({
      success: true,
      message: "Logged in successfully",
      user: {
        id: userId,
        name: userName,
        email: userEmail,
        image: userImage,
        providers: [provider],
      },
    });

    await setAuthCookie(response, token);
    return response;
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
          error instanceof Error && error.message
            ? error.message
            : "Firebase login failed",
      },
      { status: 500 },
    );
  }
}
