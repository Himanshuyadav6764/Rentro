const SUSPICIOUS_WORDS = [
  'scam',
  'fraud',
  'fake',
  'abuse',
  'threat',
  'cheat',
  'steal',
  'harass',
  'blackmail',
];

export function detectSuspiciousWords(message: string) {
  const lower = message.toLowerCase();
  const matched = SUSPICIOUS_WORDS.filter((word) => lower.includes(word));

  return {
    isSuspicious: matched.length > 0,
    matched,
  };
}

export function scoreImpactOnRentalStart() {
  return {
    trustDelta: 3,
    riskDelta: -1,
    behaviorNote: 'Item rented successfully. Trust increased by +3.',
  };
}

export function scoreImpactOnSellerMarkReturned() {
  return {
    trustDelta: 5,
    riskDelta: -2,
    behaviorNote: 'Seller marked return completed. Trust increased by +5.',
  };
}

export function scoreImpactOnRenterReturn(daysLate: number) {
  if (daysLate <= 0) {
    return {
      trustDelta: 3,
      riskDelta: -2,
      behaviorNote: 'On-time return by renter. Trust increased by +3.',
    };
  }

  const penalty = daysLate * 3;
  return {
    trustDelta: -penalty,
    riskDelta: Math.min(30, daysLate * 2),
    behaviorNote: `Late return by renter (${daysLate} day(s)). Trust decreased by -${penalty}.`,
  };
}

export function scoreImpactOnNotReturned() {
  return {
    trustDelta: -50,
    riskDelta: 40,
    behaviorNote: 'Item not returned. Red flag triggered with -50 trust.',
  };
}

export function evaluateExtensionPolicy(params: {
  trustScore: number;
  riskScore: number;
  extraDays: number;
  issuesCount: number;
  lateReturnsCount: number;
}) {
  const { trustScore, riskScore, extraDays, issuesCount, lateReturnsCount } = params;

  if (riskScore >= 80 || issuesCount >= 3 || lateReturnsCount >= 3) {
    return {
      allowed: false,
      suggestedDepositMultiplier: 1.8,
      note: 'Risky behavior detected. Extension blocked by policy.',
    };
  }

  if (trustScore >= 75 && riskScore <= 40) {
    return {
      allowed: true,
      suggestedDepositMultiplier: extraDays > 7 ? 1.1 : 1,
      note: 'Reliable user. Extension approved.',
    };
  }

  return {
    allowed: true,
    suggestedDepositMultiplier: 1.35,
    note: 'Moderate risk. Extension allowed with higher deposit.',
  };
}

export function scoreImpactOnReturn(params: { isLate: boolean; daysLate: number }) {
  const { isLate, daysLate } = params;

  if (!isLate) {
    return {
      trustDelta: 4,
      riskDelta: -3,
      behaviorNote: 'On-time return. Trust increased.',
    };
  }

  const penalty = Math.min(20, 4 + daysLate * 2);
  return {
    trustDelta: -penalty,
    riskDelta: Math.ceil(penalty / 1.5),
    behaviorNote: `Late return (${daysLate} day(s)). Trust decreased.`,
  };
}

export function scoreImpactOnIssue(severity: 'low' | 'medium' | 'high') {
  if (severity === 'high') {
    return { trustDelta: -12, riskDelta: 14 };
  }

  if (severity === 'medium') {
    return { trustDelta: -7, riskDelta: 8 };
  }

  return { trustDelta: -3, riskDelta: 4 };
}

export function clampScore(value: number) {
  return Math.min(100, Math.max(0, value));
}
