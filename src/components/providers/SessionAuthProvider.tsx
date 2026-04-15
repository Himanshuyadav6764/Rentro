"use client";

type SessionAuthProviderProps = {
  children: React.ReactNode;
};

export default function SessionAuthProvider({
  children,
}: SessionAuthProviderProps) {
  return <>{children}</>;
}
