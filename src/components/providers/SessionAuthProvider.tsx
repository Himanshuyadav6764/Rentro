// SessionAuthProvider has been removed.
// Rentro uses Firebase popup auth + custom JWT cookies for authentication.
// NextAuth's SessionProvider is not needed and was causing CLIENT_FETCH_ERROR
// by polling /api/auth/session on every page load.
//
// This file is kept as a no-op wrapper for backwards compatibility
// in case any other component imports it.

"use client";

type SessionAuthProviderProps = {
  children: React.ReactNode;
};

export default function SessionAuthProvider({
  children,
}: SessionAuthProviderProps) {
  return <>{children}</>;
}
