"use client";

import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

function isLikelyPlaceholder(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return (
    normalized.startsWith("your-") ||
    normalized.includes("<") ||
    normalized.includes("example") ||
    normalized.includes("project-id")
  );
}

function getFirebaseConfig() {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

  if (!apiKey || !authDomain || !projectId || !appId) {
    throw new Error(
      "Firebase client env vars are missing. Check NEXT_PUBLIC_FIREBASE_* settings.",
    );
  }

  if (
    isLikelyPlaceholder(apiKey) ||
    isLikelyPlaceholder(authDomain) ||
    isLikelyPlaceholder(projectId) ||
    isLikelyPlaceholder(appId)
  ) {
    throw new Error(
      "Firebase client is using placeholder values. Update NEXT_PUBLIC_FIREBASE_* in .env.local.",
    );
  }

  return {
    apiKey,
    authDomain,
    projectId,
    appId,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  };
}

export function getFirebaseClientAuth() {
  const app = getApps().length > 0 ? getApp() : initializeApp(getFirebaseConfig());
  return getAuth(app);
}
