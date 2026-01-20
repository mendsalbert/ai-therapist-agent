import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL || "https://hope-backend-2.onrender.com";

interface MatchingPreferences {
  challenges: string[];
  goals: string[];
  experienceLevel: "beginner" | "intermediate" | "experienced";
  ageRange: [number, number];
  timezone: string;
  communicationStyle: "gentle" | "direct" | "supportive";
  preferredCheckInFrequency: "daily" | "weekly" | "monthly";
  allowVideoCalls: boolean;
}

interface UserProfile {
  id: string;
  name: string;
  age: number;
  challenges: string[];
  goals: string[];
  experienceLevel: string;
  communicationStyle: string;
  timezone: string;
  lastActive: Date;
  safetyScore: number;
  bio: string;
  preferences: MatchingPreferences;
}

// AI-powered compatibility scoring algorithm
function calculateCompatibility(user1: UserProfile, user2: UserProfile): number {
  let score = 0;
  let maxScore = 0;

  // Shared challenges (30% weight)
  const sharedChallenges = user1.challenges.filter(c => user2.challenges.includes(c));
  const challengeScore = sharedChallenges.length / Math.max(user1.challenges.length, user2.challenges.length, 1);
  score += challengeScore * 30;
  maxScore += 30;

  // Complementary goals (25% weight)
  const complementaryGoals = user1.goals.filter(g => user2.goals.includes(g));
  const goalScore = complementaryGoals.length / Math.max(user1.goals.length, user2.goals.length, 1);
  score += goalScore * 25;
  maxScore += 25;

  // Communication style compatibility (20% weight)
  const communicationCompatibility = getCommunicationCompatibility(
    user1.communicationStyle, 
    user2.communicationStyle
  );
  score += communicationCompatibility * 20;
  maxScore += 20;

  // Experience level compatibility (15% weight)
  const experienceCompatibility = getExperienceCompatibility(
    user1.experienceLevel, 
    user2.experienceLevel
  );
  score += experienceCompatibility * 15;
  maxScore += 15;

  // Age compatibility (10% weight)
  const ageCompatibility = getAgeCompatibility(user1.age, user2.age);
  score += ageCompatibility * 10;
  maxScore += 10;

  return Math.round((score / maxScore) * 100);
}

function getCommunicationCompatibility(style1: string, style2: string): number {
  const compatibilityMatrix: Record<string, Record<string, number>> = {
    gentle: { gentle: 1.0, supportive: 0.9, direct: 0.6 },
    supportive: { supportive: 1.0, gentle: 0.9, direct: 0.7 },
    direct: { direct: 1.0, supportive: 0.7, gentle: 0.6 }
  };
  return compatibilityMatrix[style1]?.[style2] || 0.5;
}

function getExperienceCompatibility(exp1: string, exp2: string): number {
  const levels = { beginner: 1, intermediate: 2, experienced: 3 };
  const diff = Math.abs((levels[exp1 as keyof typeof levels] || 1) - (levels[exp2 as keyof typeof levels] || 1));
  return Math.max(0, 1 - (diff * 0.3));
}

function getAgeCompatibility(age1: number, age2: number): number {
  const ageDiff = Math.abs(age1 - age2);
  if (ageDiff <= 5) return 1.0;
  if (ageDiff <= 10) return 0.8;
  if (ageDiff <= 15) return 0.6;
  return 0.4;
}

export async function POST(req: NextRequest) {
  try {
    const { preferences, userId } = await req.json();
    
    if (!preferences || !userId) {
      return NextResponse.json(
        { success: false, error: 'Missing preferences or userId' },
        { status: 400 }
      );
    }

    // Get auth token from request
    const authHeader = req.headers.get('authorization');
    
    // Call backend to find potential matches
    const response = await fetch(`${BACKEND_API_URL}/rescue-pairs/find-matches`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { Authorization: authHeader }),
      },
      body: JSON.stringify({
        userId,
        preferences,
        maxResults: 10
      })
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }

    const backendData = await response.json();
    
    if (!backendData.success) {
      return NextResponse.json({
        success: false,
        error: backendData.error || 'Failed to find matches'
      }, { status: 500 });
    }

    // Apply AI compatibility scoring to backend results
    const potentialMatches = backendData.data || [];
    const currentUser = backendData.currentUser;
    
    if (!currentUser) {
      return NextResponse.json({
        success: false,
        error: 'User profile not found'
      }, { status: 404 });
    }

    // Calculate compatibility scores for each potential match
    const scoredMatches = potentialMatches.map((match: any) => {
      const compatibility = calculateCompatibility(currentUser, match);
      const sharedChallenges = currentUser.challenges.filter((c: string) => 
        match.challenges.includes(c)
      );
      const complementaryGoals = currentUser.goals.filter((g: string) => 
        match.goals.includes(g)
      );

      return {
        id: match.id || match._id,
        name: match.name,
        age: match.age,
        challenges: match.challenges,
        goals: match.goals,
        experienceLevel: match.experienceLevel,
        communicationStyle: match.communicationStyle,
        compatibility,
        sharedChallenges,
        complementaryGoals,
        lastActive: match.lastActive,
        profileImage: match.profileImage,
        bio: match.bio || `Someone who understands your journey and shares ${sharedChallenges.length} similar challenges.`,
        safetyScore: match.safetyScore || 95,
        timezone: match.timezone,
        isVerified: match.isVerified || true
      };
    });

    // Sort by compatibility score (highest first)
    const sortedMatches = scoredMatches
      .filter((match: any) => match.compatibility >= 60) // Minimum 60% compatibility
      .sort((a: any, b: any) => b.compatibility - a.compatibility)
      .slice(0, 5); // Return top 5 matches

    return NextResponse.json({
      success: true,
      data: sortedMatches,
      message: `Found ${sortedMatches.length} compatible matches`
    });

  } catch (error) {
    console.error('Error finding matches:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to find matches. Please try again.' 
      },
      { status: 500 }
    );
  }
} 