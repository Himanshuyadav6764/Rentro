import crypto from "node:crypto";

const OTP_TTL_MS = 5 * 60 * 1000;

function getOtpHashSecret(): string {
  const secret = process.env.OTP_HASH_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("OTP_HASH_SECRET or JWT_SECRET must be configured");
  }
  return secret;
}

export function getOtpExpiryDate(): Date {
  return new Date(Date.now() + OTP_TTL_MS);
}

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function hashOtp(identifier: string, otp: string): string {
  return crypto
    .createHmac("sha256", getOtpHashSecret())
    .update(`${identifier}:${otp}`)
    .digest("hex");
}

export function verifyOtpHash(
  identifier: string,
  otp: string,
  expectedHash: string,
): boolean {
  const providedHash = hashOtp(identifier, otp);
  const providedBuffer = Buffer.from(providedHash);
  const expectedBuffer = Buffer.from(expectedHash);

  if (providedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(providedBuffer, expectedBuffer);
}
