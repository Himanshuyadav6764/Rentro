type DevOtpRecord = {
  otpHash: string;
  expiresAt: Date;
  attempts: number;
  consumedAt: Date | null;
};

type DevOtpStore = Map<string, DevOtpRecord>;

declare global {
  var __rentroDevOtpStore: DevOtpStore | undefined;
}

function getStore(): DevOtpStore {
  if (!global.__rentroDevOtpStore) {
    global.__rentroDevOtpStore = new Map<string, DevOtpRecord>();
  }

  return global.__rentroDevOtpStore;
}

export function upsertDevOtp(email: string, otpHash: string, expiresAt: Date) {
  getStore().set(email, {
    otpHash,
    expiresAt,
    attempts: 0,
    consumedAt: null,
  });
}

export function getDevOtp(email: string): DevOtpRecord | null {
  return getStore().get(email) || null;
}

export function updateDevOtp(email: string, patch: Partial<DevOtpRecord>) {
  const current = getStore().get(email);
  if (!current) {
    return;
  }

  getStore().set(email, {
    ...current,
    ...patch,
  });
}