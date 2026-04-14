import jwt, { type SignOptions } from "jsonwebtoken";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }
  return secret;
}

export type JwtPayload = {
  sub: string;
  phone?: string;
  email?: string;
  name?: string;
  provider: "phone" | "email" | "google";
};

export function signAuthToken(payload: JwtPayload): string {
  const expiresIn = (process.env.JWT_EXPIRES_IN || "7d") as SignOptions["expiresIn"];

  return jwt.sign(payload, getJwtSecret(), {
    expiresIn,
  });
}

export function verifyAuthToken(token: string): JwtPayload {
  return jwt.verify(token, getJwtSecret()) as JwtPayload;
}
