import { NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db";
import { setAuthCookie } from "@/lib/auth";
import { signAuthToken } from "@/lib/jwt";
import { isPlaceholderValue } from "@/lib/envCheck";
import {
  getFirebaseAdminAuth,
  isFirebaseAdminConfigured,
} from "@/lib/firebase-admin";
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

type VerifiedUser = {
  uid: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
};

/**
 * Preferred: use Firebase Admin SDK (validates signature server-side).
 */
async function verifyWithAdminSdk(
  idToken: string,
): Promise<VerifiedUser | null> {
  if (!isFirebaseAdminConfigured()) {
    return null;
  }

  try {
    const auth = getFirebaseAdminAuth();
    const decoded = await auth.verifyIdToken(idToken);

    return {
      uid: decoded.uid,
      email: decoded.email,
      displayName: decoded.name,
      photoURL: decoded.picture,
    };
  } catch (err) {
    console.warn("[firebase-login] Admin SDK verification failed:", err);
    return null;
  }
}

/**
 * Fallback: use Firebase REST API (less secure – only checks token is valid,
 * does not verify signature against Google public keys).
 */
async function verifyWithRestApi(
  idToken: string,
): Promise<VerifiedUser | null> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

  if (isPlaceholderValue(apiKey)) {
    return null;
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
    console.error("[firebase-login] REST API error:", code);

    if (code.includes("INVALID_ID_TOKEN") || code.includes("USER_NOT_FOUND")) {
      throw new Error("Firebase token invalid or expired");
    }

    throw new Error("Unable to verify Firebase token");
  }

  const data = (await response.json()) as {
    users?: FirebaseLookupUser[];
  };
  const user = data.users?.[0];

  if (!user?.localId) {
    return null;
  }

  return {
    uid: user.localId,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoUrl,
  };
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

    // Try Admin SDK first (secure), fall back to REST API
    let firebaseUser = await verifyWithAdminSdk(firebaseToken);
    if (!firebaseUser) {
      firebaseUser = await verifyWithRestApi(firebaseToken);
    }

    if (!firebaseUser) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Firebase token verification failed. Check Firebase credentials.",
        },
        { status: 401 },
      );
    }

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
      name ||
      firebaseUser.displayName ||
      fallbackName(normalizedEmail, firebaseUser.uid);

    let userId = `firebase:${firebaseUser.uid}`;
    let userName = resolvedName;
    let userEmail = normalizedEmail;
    let userImage = firebaseUser.photoURL;

    try {
      await connectToDatabase();

      const dbUser = await User.findOneAndUpdate(
        { email: normalizedEmail },
        {
          $set: {
            email: normalizedEmail,
            name: resolvedName,
            image: firebaseUser.photoURL,
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
    } catch (err) {
      console.error("[firebase-login] DB error:", err);
      // In production, DB must be reachable for a full login
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
          {
            success: false,
            message: "Service temporarily unavailable. Please try again.",
          },
          { status: 503 },
        );
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

    console.error("[firebase-login] Unhandled error:", error);

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
