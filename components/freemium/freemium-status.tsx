"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Crown, 
  Lock, 
  CheckCircle, 
  XCircle,
  Brain,
  Heart,
  BookOpen,
  Headphones,
  Users,
  TrendingUp,
  Calendar,
  Zap
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getFeatureLimits, getUserLimits } from "@/lib/session-limits";

interface FreemiumStatusProps {
  userTier: "free" | "premium";
  usage: {
    therapySessionsThisWeek: number;
    therapySessionsToday: number;
    meditationSessionsThisWeek: number;
    journalEntriesThisWeek: number;
    moodEntriesThisWeek: number;
    peerMatches: number;
  };
}

export function FreemiumStatus({ userTier, usage }: FreemiumStatusProps) {
  const router = useRouter();
  const featureLimits = getFeatureLimits(userTier);
  const sessionLimits = getUserLimits(userTier);

  const features = [
    {
      name: "Therapy Sessions",
      icon: Brain,
      current: usage.therapySessionsThisWeek,
      max: sessionLimits.maxSessionsPerWeek,
      period: "week",
      premium: userTier === "premium"
    },
    {
      name: "Meditation Sessions",
      icon: Headphones,
      current: usage.meditationSessionsThisWeek,
      max: featureLimits.maxMeditationSessionsPerWeek,
      period: "week",
      premium: userTier === "premium"
    },
    {
      name: "Journal Entries",
      icon: BookOpen,
      current: usage.journalEntriesThisWeek,
      max: featureLimits.maxJournalEntriesPerWeek,
      period: "week",
      premium: userTier === "premium"
    },
    {
      name: "Mood Tracking",
      icon: Heart,
      current: usage.moodEntriesThisWeek,
      max: featureLimits.maxMoodEntriesPerWeek,
      period: "week",
      premium: userTier === "premium"
    },
    {
      name: "Peer Matches",
      icon: Users,
      current: usage.peerMatches,
      max: sessionLimits.maxPeerMatches,
      period: "total",
      premium: userTier === "premium"
    }
  ];

  const premiumFeatures = [
    {
      name: "AI Journal Analysis",
      available: featureLimits.canAccessAIJournalAnalysis,
      icon: TrendingUp
    },
    {
      name: "Advanced Meditations",
      available: featureLimits.canAccessAdvancedMeditation,
      icon: Zap
    },
    {
      name: "Progress Analytics",
      available: featureLimits.canAccessProgressAnalytics,
      icon: TrendingUp
    },

  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          {userTier === "premium" ? (
            <Crown className="w-6 h-6 text-yellow-500" />
          ) : (
            <Lock className="w-6 h-6 text-gray-500" />
          )}
          <h2 className="text-2xl font-bold">
            {userTier === "premium" ? "Premium Plan" : "Free Plan"}
          </h2>
        </div>
        <p className="text-muted-foreground">
          {userTier === "premium" 
            ? "You have unlimited access to all features" 
            : "Upgrade to Premium for unlimited access and advanced features"
          }
        </p>
      </div>

      {/* Usage Limits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Usage This Week
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {features.map((feature, index) => {
            const usagePercentage = feature.max === 999 ? 0 : (feature.current / feature.max) * 100;
            const isNearLimit = usagePercentage >= 80;
            const isAtLimit = usagePercentage >= 100;
            
            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <feature.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{feature.name}</span>
                    {feature.premium && (
                      <Badge variant="default" className="text-xs">
                        <Crown className="w-3 h-3 mr-1" />
                        Unlimited
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {feature.current}/{feature.max === 999 ? "∞" : feature.max}
                    </span>
                    {!feature.premium && (isAtLimit ? (
                      <XCircle className="w-4 h-4 text-red-500" />
                    ) : isNearLimit ? (
                      <XCircle className="w-4 h-4 text-amber-500" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ))}
                  </div>
                </div>
                {!feature.premium && (
                  <Progress 
                    value={usagePercentage} 
                    className="h-2"
                  />
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Premium Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5" />
            Premium Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {premiumFeatures.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                {feature.available ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <Lock className="w-4 h-4 text-gray-400" />
                )}
                <span className={`text-sm ${feature.available ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {feature.name}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upgrade CTA */}
      {userTier === "free" && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-6 text-center">
            <Crown className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Unlock Premium Features</h3>
            <p className="text-muted-foreground mb-4">
              Get unlimited access to all features and advanced AI analysis
            </p>
            <Button 
              onClick={() => router.push("/pricing")}
              className="w-full"
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Premium - $7.99/month
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
