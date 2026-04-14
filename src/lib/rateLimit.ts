import AuthRateLimit from "@/models/AuthRateLimit";

type RateLimitInput = {
  key: string;
  type: string;
  limit: number;
  windowMs: number;
};

type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
  remaining: number;
};

export async function checkAndConsumeRateLimit({
  key,
  type,
  limit,
  windowMs,
}: RateLimitInput): Promise<RateLimitResult> {
  const now = new Date();
  const existing = await AuthRateLimit.findOne({ key, type });

  if (!existing || now.getTime() - existing.windowStart.getTime() >= windowMs) {
    const expiresAt = new Date(now.getTime() + windowMs);
    await AuthRateLimit.findOneAndUpdate(
      { key, type },
      {
        key,
        type,
        count: 1,
        windowStart: now,
        expiresAt,
      },
      { upsert: true },
    );

    return {
      allowed: true,
      retryAfterSeconds: 0,
      remaining: Math.max(limit - 1, 0),
    };
  }

  if (existing.count >= limit) {
    const retryAfterMs = Math.max(
      0,
      existing.windowStart.getTime() + windowMs - now.getTime(),
    );
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil(retryAfterMs / 1000),
      remaining: 0,
    };
  }

  existing.count += 1;
  existing.expiresAt = new Date(existing.windowStart.getTime() + windowMs);
  await existing.save();

  return {
    allowed: true,
    retryAfterSeconds: 0,
    remaining: Math.max(limit - existing.count, 0),
  };
}
