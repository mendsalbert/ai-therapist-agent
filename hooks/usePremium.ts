export function isTrialActive(trialEndsAt?: string | null): boolean {
  if (!trialEndsAt) return false;
  const ends = new Date(trialEndsAt);
  return !Number.isNaN(ends.getTime()) && new Date() < ends;
}

export function computeIsPremium(opts: {
  userTier?: string | null;
  trialEndsAt?: string | null;
  subscriptionActive?: boolean;
}): boolean {
  const { userTier, trialEndsAt, subscriptionActive } = opts;
  if (subscriptionActive) return true;
  if (userTier === "premium") return true;
  if (isTrialActive(trialEndsAt)) return true;
  return false;
}

