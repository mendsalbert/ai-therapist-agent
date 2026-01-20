"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Lock, 
  Crown, 
  TrendingUp, 
  Calendar,
  Brain,
  Heart,
  BookOpen,
  Headphones
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getFeatureLimits, getUserLimits } from "@/lib/session-limits";

interface LimitIndicatorProps {
  userTier: "free" | "premium";
  feature: "therapy" | "meditation" | "journaling" | "mood" | "peer-matching";
  currentUsage: number;
  maxUsage: number;
  period: "day" | "week" | "month";
}

export function LimitIndicator({ 
  userTier, 
  feature, 
  currentUsage, 
  maxUsage, 
  period 
}: LimitIndicatorProps) {
  const router = useRouter();
  const featureLimits = getFeatureLimits(userTier);
  const sessionLimits = getUserLimits(userTier);
  
  const usagePercentage = (currentUsage / maxUsage) * 100;
  const isNearLimit = usagePercentage >= 80;
  const isAtLimit = usagePercentage >= 100;

  const getFeatureIcon = () => {
    switch (feature) {
      case "therapy": return <Brain className="w-4 h-4" />;
      case "meditation": return <Headphones className="w-4 h-4" />;
      case "journaling": return <BookOpen className="w-4 h-4" />;
      case "mood": return <Heart className="w-4 h-4" />;
      case "peer-matching": return <TrendingUp className="w-4 h-4" />;
      default: return <Lock className="w-4 h-4" />;
    }
  };

  const getFeatureName = () => {
    switch (feature) {
      case "therapy": return "Therapy Sessions";
      case "meditation": return "Meditation Sessions";
      case "journaling": return "Journal Entries";
      case "mood": return "Mood Entries";
      case "peer-matching": return "Peer Matches";
      default: return "Feature";
    }
  };

  const getPeriodText = () => {
    switch (period) {
      case "day": return "today";
      case "week": return "this week";
      case "month": return "this month";
      default: return "";
    }
  };

  if (userTier === "premium") {
    return (
      <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800 dark:text-green-200">
              Premium: Unlimited {getFeatureName()}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${isAtLimit ? 'border-red-200 bg-red-50 dark:bg-red-950/20' : isNearLimit ? 'border-amber-200 bg-amber-50 dark:bg-amber-950/20' : 'border-blue-200 bg-blue-50 dark:bg-blue-950/20'}`}>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getFeatureIcon()}
              <span className="text-sm font-medium">
                {getFeatureName()} {getPeriodText()}
              </span>
            </div>
            <Badge variant={isAtLimit ? "destructive" : isNearLimit ? "secondary" : "default"}>
              {currentUsage}/{maxUsage}
            </Badge>
          </div>
          
          <Progress 
            value={usagePercentage} 
            className="h-2"
          />
          
          {isAtLimit && (
            <div className="text-center">
              <p className="text-xs text-red-600 dark:text-red-400 mb-2">
                You've reached your limit for {getFeatureName().toLowerCase()} {getPeriodText()}
              </p>
              <Button 
                size="sm" 
                onClick={() => router.push("/pricing")}
                className="w-full"
              >
                <Crown className="w-3 h-3 mr-1" />
                Upgrade to Premium
              </Button>
            </div>
          )}
          
          {isNearLimit && !isAtLimit && (
            <div className="text-center">
              <p className="text-xs text-amber-600 dark:text-amber-400 mb-2">
                You're close to your limit
              </p>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => router.push("/pricing")}
                className="w-full"
              >
                <Crown className="w-3 h-3 mr-1" />
                Upgrade for Unlimited
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
