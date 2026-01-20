"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Heart, 
  MessageCircle, 
  Star, 
  Shield, 
  Clock,
  CheckCircle,
  X,
  Sparkles,
  Target,
  Brain,
  Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/lib/contexts/session-context";
import { toast } from "sonner";

interface MatchingPreferences {
  challenges: string[];
  goals: string[];
  experienceLevel: "beginner" | "intermediate" | "experienced";
  ageRange: [number, number];
  timezone: string;
  communicationStyle: "gentle" | "direct" | "supportive";
  preferredCheckInFrequency: "daily" | "weekly" | "as-needed";
  allowVideoCalls: boolean;
}

interface PotentialMatch {
  id: string;
  name: string;
  age: number;
  challenges: string[];
  goals: string[];
  experienceLevel: string;
  communicationStyle: string;
  compatibility: number;
  sharedChallenges: string[];
  complementaryGoals: string[];
  lastActive: string;
  profileImage?: string;
  bio: string;
  safetyScore: number;
}

interface UserMatchingProps {
  userTier: "free" | "premium";
  currentMatches: number;
  maxMatches: number;
}

export function UserMatching({ userTier, currentMatches, maxMatches }: UserMatchingProps) {
  const { user, isAuthenticated } = useSession();
  const [preferences, setPreferences] = useState<MatchingPreferences>({
    challenges: [],
    goals: [],
    experienceLevel: "beginner",
    ageRange: [18, 65],
    timezone: "UTC",
    communicationStyle: "supportive",
    preferredCheckInFrequency: "weekly",
    allowVideoCalls: false
  });
  
  const [potentialMatches, setPotentialMatches] = useState<PotentialMatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  // Load user preferences
  useEffect(() => {
    if (isAuthenticated) {
      loadUserPreferences();
    }
  }, [isAuthenticated]);

  const loadUserPreferences = async () => {
    try {
      // Load from backend
      const { backendService } = await import("@/lib/api/backend-service");
      const response = await backendService.getUserProfile();
      if (response.success && response.data?.matchingPreferences) {
        setPreferences(response.data.matchingPreferences);
      }
    } catch (error) {
      console.error("Failed to load preferences:", error);
    }
  };

  const findMatches = async () => {
    if (currentMatches >= maxMatches) {
      toast.error(`You've reached your limit of ${maxMatches} active match${maxMatches > 1 ? 'es' : ''}. Upgrade to premium for unlimited matches.`);
      return;
    }

    setIsLoading(true);
    try {
      // Call the new AI matching API
      const response = await fetch('/api/matching/find', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          preferences,
          userId: user?._id
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setPotentialMatches(result.data || []);
        toast.success(`Found ${result.data?.length || 0} compatible matches with AI scoring!`);
      } else {
        throw new Error(result.error || 'Failed to find matches');
      }
    } catch (error) {
      console.error("Failed to find matches:", error);
      toast.error("Failed to find matches. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const acceptMatch = async (matchId: string) => {
    try {
      const response = await fetch('/api/matching/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          matchId,
          userId: user?._id
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success("Match accepted! You can now start chatting with AI-powered safety features.");
        setPotentialMatches(prev => prev.filter(m => m.id !== matchId));
        
        // Navigate to chat if chatId is provided
        if (result.data?.chatId) {
          window.location.href = `/matching/chat/${matchId}`;
        }
      } else {
        throw new Error(result.error || 'Failed to accept match');
      }
    } catch (error) {
      console.error("Failed to accept match:", error);
      toast.error("Failed to accept match. Please try again.");
    }
  };

  const rejectMatch = (matchId: string) => {
    setPotentialMatches(prev => prev.filter(m => m.id !== matchId));
    toast.info("Match rejected");
  };

  const savePreferences = async () => {
    try {
      const { backendService } = await import("@/lib/api/backend-service");
      await backendService.updateMatchingPreferences(preferences);
      toast.success("Preferences saved!");
      setShowPreferences(false);
    } catch (error) {
      console.error("Failed to save preferences:", error);
      toast.error("Failed to save preferences");
    }
  };

  if (!isAuthenticated) {
    return (
      <Card className="p-8 text-center">
        <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">Sign in to find your support match</h3>
        <p className="text-muted-foreground">
          Connect with others who understand your journey and can provide mutual support.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary" />
            Find Your Support Match
          </h2>
          <p className="text-muted-foreground">
            Connect with others who share similar experiences and goals
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={userTier === "premium" ? "default" : "secondary"}>
            {userTier === "premium" ? "Premium" : "Free"}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {currentMatches}/{maxMatches} matches
          </span>
        </div>
      </div>

      {/* Current Status */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Active Matches</h3>
                <p className="text-sm text-muted-foreground">
                  {currentMatches} of {maxMatches} possible
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowPreferences(true)}
              >
                <Target className="w-4 h-4 mr-2" />
                Preferences
              </Button>
              <Button
                onClick={findMatches}
                disabled={isLoading || currentMatches >= maxMatches}
              >
                {isLoading ? (
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                Find Matches
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Potential Matches */}
      <AnimatePresence>
        {potentialMatches.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold">Potential Matches</h3>
            {potentialMatches.map((match, index) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
                          <Heart className="w-8 h-8 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{match.name}</h4>
                            <Badge variant="outline" className="text-xs">
                              {match.age} years old
                            </Badge>
                            <Badge 
                              variant={match.compatibility > 80 ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {match.compatibility}% match
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{match.bio}</p>
                          
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Brain className="w-4 h-4 text-primary" />
                              <span className="text-sm">
                                <strong>Shared challenges:</strong> {match.sharedChallenges.join(", ")}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Target className="w-4 h-4 text-primary" />
                              <span className="text-sm">
                                <strong>Complementary goals:</strong> {match.complementaryGoals.join(", ")}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MessageCircle className="w-4 h-4 text-primary" />
                              <span className="text-sm">
                                <strong>Communication style:</strong> {match.communicationStyle}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Shield className="w-3 h-3" />
                          Safety: {match.safetyScore}/10
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => rejectMatch(match.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => acceptMatch(match.id)}
                            disabled={currentMatches >= maxMatches}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Accept
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preferences Modal */}
      {showPreferences && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Matching Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* This would contain the full preferences form */}
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Preferences form would go here with all the matching criteria
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowPreferences(false)}>
                  Cancel
                </Button>
                <Button onClick={savePreferences}>
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Freemium Upgrade Prompt */}
      {userTier === "free" && currentMatches >= maxMatches && (
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-6 text-center">
            <Star className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-lg font-semibold mb-2">Unlock Unlimited Matches</h3>
            <p className="text-muted-foreground mb-4">
              Upgrade to premium to connect with unlimited support partners and access advanced features.
            </p>
            <Button>
              Upgrade to Premium - $7.99/month
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
