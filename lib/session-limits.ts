// Session limits for different user tiers
export interface SessionLimits {
  maxSessionsPerWeek: number;
  maxSessionsPerDay: number;
  maxSessionDuration: number; // in minutes
  canUseVoice: boolean;
  canUseAdvancedFeatures: boolean;
  canAccessMeditation: boolean;
  canAccessJournaling: boolean;
  canAccessPeerMatching: boolean;
  maxPeerMatches: number;
}

export const FREE_TIER_LIMITS: SessionLimits = {
  maxSessionsPerWeek: 5,
  maxSessionsPerDay: 2,
  maxSessionDuration: 30, // 30 minutes max per session
  canUseVoice: true, // Basic voice features
  canUseAdvancedFeatures: false,
  canAccessMeditation: true, // Limited to 5 sessions per week
  canAccessJournaling: true, // No AI analysis
  canAccessPeerMatching: true,
  maxPeerMatches: 1,
};

// Additional feature limits
export interface FeatureLimits {
  maxMeditationSessionsPerWeek: number;
  maxJournalEntriesPerWeek: number;
  canAccessAIJournalAnalysis: boolean;
  canAccessAdvancedMeditation: boolean;
  canAccessCrisisSupport: boolean;
  canAccessProgressAnalytics: boolean;
  canAccessMoodTracking: boolean;
  maxMoodEntriesPerWeek: number;
  canAccessBreathingExercises: boolean;
}

export const FREE_FEATURE_LIMITS: FeatureLimits = {
  maxMeditationSessionsPerWeek: 5,
  maxJournalEntriesPerWeek: 5,
  canAccessAIJournalAnalysis: false,
  canAccessAdvancedMeditation: false,
  canAccessCrisisSupport: true, // Basic crisis support
  canAccessProgressAnalytics: false,
  canAccessMoodTracking: true,
  maxMoodEntriesPerWeek: 7, // One per day
  canAccessBreathingExercises: true,
};

export const PREMIUM_FEATURE_LIMITS: FeatureLimits = {
  maxMeditationSessionsPerWeek: 999, // Unlimited
  maxJournalEntriesPerWeek: 999, // Unlimited
  canAccessAIJournalAnalysis: true,
  canAccessAdvancedMeditation: true,
  canAccessCrisisSupport: true, // Advanced crisis support
  canAccessProgressAnalytics: true,
  canAccessMoodTracking: true,
  maxMoodEntriesPerWeek: 999, // Unlimited
  canAccessBreathingExercises: true,
};

export const PREMIUM_TIER_LIMITS: SessionLimits = {
  maxSessionsPerWeek: 999, // Unlimited
  maxSessionsPerDay: 999, // Unlimited
  maxSessionDuration: 120, // 2 hours max per session
  canUseVoice: true, // Advanced voice features
  canUseAdvancedFeatures: true,
  canAccessMeditation: true, // Full library
  canAccessJournaling: true, // With AI analysis
  canAccessPeerMatching: true,
  maxPeerMatches: 999, // Unlimited
};

export function getUserLimits(userTier: "free" | "premium"): SessionLimits {
  return userTier === "premium" ? PREMIUM_TIER_LIMITS : FREE_TIER_LIMITS;
}

export function checkSessionLimit(
  userTier: "free" | "premium",
  currentSessionsThisWeek: number,
  currentSessionsToday: number
): { canStart: boolean; reason?: string } {
  const limits = getUserLimits(userTier);
  
  if (currentSessionsToday >= limits.maxSessionsPerDay) {
    return {
      canStart: false,
      reason: `You've reached your daily limit of ${limits.maxSessionsPerDay} session${limits.maxSessionsPerDay > 1 ? 's' : ''}. Upgrade to Premium for unlimited sessions.`
    };
  }
  
  if (currentSessionsThisWeek >= limits.maxSessionsPerWeek) {
    return {
      canStart: false,
      reason: `You've reached your weekly limit of ${limits.maxSessionsPerWeek} session${limits.maxSessionsPerWeek > 1 ? 's' : ''}. Upgrade to Premium for unlimited sessions.`
    };
  }
  
  return { canStart: true };
}

export function getFeatureLimits(userTier: "free" | "premium"): FeatureLimits {
  return userTier === "premium" ? PREMIUM_FEATURE_LIMITS : FREE_FEATURE_LIMITS;
}

export function checkMeditationLimit(
  userTier: "free" | "premium",
  currentSessionsThisWeek: number
): { canStart: boolean; reason?: string } {
  const limits = getFeatureLimits(userTier);
  
  if (currentSessionsThisWeek >= limits.maxMeditationSessionsPerWeek) {
    return {
      canStart: false,
      reason: `You've reached your weekly meditation limit of ${limits.maxMeditationSessionsPerWeek} sessions. Upgrade to Premium for unlimited meditation.`
    };
  }
  
  return { canStart: true };
}

export function checkJournalLimit(
  userTier: "free" | "premium",
  currentEntriesThisWeek: number
): { canStart: boolean; reason?: string } {
  const limits = getFeatureLimits(userTier);
  
  if (currentEntriesThisWeek >= limits.maxJournalEntriesPerWeek) {
    return {
      canStart: false,
      reason: `You've reached your weekly journal limit of ${limits.maxJournalEntriesPerWeek} entries. Upgrade to Premium for unlimited journaling.`
    };
  }
  
  return { canStart: true };
}

export function checkMoodTrackingLimit(
  userTier: "free" | "premium",
  currentEntriesThisWeek: number
): { canStart: boolean; reason?: string } {
  const limits = getFeatureLimits(userTier);
  
  if (currentEntriesThisWeek >= limits.maxMoodEntriesPerWeek) {
    return {
      canStart: false,
      reason: `You've reached your weekly mood tracking limit of ${limits.maxMoodEntriesPerWeek} entries. Upgrade to Premium for unlimited mood tracking.`
    };
  }
  
  return { canStart: true };
}
