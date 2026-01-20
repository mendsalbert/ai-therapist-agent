"use client";

import { useState, useEffect } from "react";
import { UserMatching } from "@/components/matching/user-matching";
import { useSession } from "@/lib/contexts/session-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Heart, 
  Shield, 
  Star, 
  MessageCircle,
  Video,
  Clock,
  CheckCircle,
  X
} from "lucide-react";

export default function MatchingPage() {
  const { user, isAuthenticated } = useSession();
  const [userTier, setUserTier] = useState<"free" | "premium">("free");
  const [currentMatches, setCurrentMatches] = useState(0);

  // Load user subscription status
  useEffect(() => {
    if (isAuthenticated) {
      loadUserSubscriptionStatus();
      loadCurrentMatches();
    }
  }, [isAuthenticated]);

  const loadUserSubscriptionStatus = async () => {
    try {
      const { backendService } = await import("@/lib/api/backend-service");
      const response = await backendService.getSubscriptionStatus(user?._id || '');
      if (response.success && response.data?.status === 'active') {
        setUserTier("premium");
      }
    } catch (error) {
      console.error("Failed to load subscription status:", error);
    }
  };

  const loadCurrentMatches = async () => {
    try {
      const { backendService } = await import("@/lib/api/backend-service");
      const response = await backendService.getActiveMatches();
      if (response.success) {
        setCurrentMatches(response.data?.length || 0);
      }
    } catch (error) {
      console.error("Failed to load current matches:", error);
    }
  };

  const maxMatches = userTier === "premium" ? 999 : 1; // Unlimited for premium, 1 for free

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          Find Your Support Match
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Connect with others who understand your journey and can provide mutual support on your mental health path
        </p>
      </div>

      {/* Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card className="text-center">
          <CardContent className="p-6">
            <Heart className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-lg font-semibold mb-2">Peer Support</h3>
            <p className="text-muted-foreground text-sm">
              Connect with others who share similar experiences and challenges
            </p>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="p-6">
            <Shield className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-lg font-semibold mb-2">Safe & Secure</h3>
            <p className="text-muted-foreground text-sm">
              All interactions are moderated and safety-checked for your protection
            </p>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="p-6">
            <Users className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-lg font-semibold mb-2">Smart Matching</h3>
            <p className="text-muted-foreground text-sm">
              AI-powered matching based on compatibility, goals, and communication style
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pricing Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <Card className={userTier === "free" ? "ring-2 ring-primary" : ""}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Free Plan
              {userTier === "free" && <Badge>Current</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm">1 active match</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm">Basic text chat</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm">Weekly check-ins</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm">Community support groups</span>
              </div>
              <div className="flex items-center gap-2">
                <X className="w-4 h-4 text-red-500" />
                <span className="text-sm text-muted-foreground">Video calls</span>
              </div>
              <div className="flex items-center gap-2">
                <X className="w-4 h-4 text-red-500" />
                <span className="text-sm text-muted-foreground">Advanced filters</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={userTier === "premium" ? "ring-2 ring-primary" : ""}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Premium Plan
              {userTier === "premium" && <Badge>Current</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm">Unlimited matches</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm">Video calls</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm">Advanced matching filters</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm">Priority matching</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm">Daily check-ins</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm">Crisis support priority</span>
              </div>
            </div>
            {userTier === "free" && (
              <div className="pt-4 border-t">
                <div className="text-center">
                  <div className="text-2xl font-bold mb-1">$7.99</div>
                  <div className="text-sm text-muted-foreground mb-3">per month</div>
                  <button className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 transition-colors">
                    Upgrade to Premium
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Matching Component */}
      <UserMatching 
        userTier={userTier}
        currentMatches={currentMatches}
        maxMatches={maxMatches}
      />

      {/* Safety Information */}
      <Card className="mt-12">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Safety & Privacy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Your Safety is Our Priority</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• All profiles are verified and safety-checked</li>
                <li>• AI content moderation for all messages</li>
                <li>• Easy report and block functionality</li>
                <li>• Emergency escalation to crisis support</li>
                <li>• Session time limits for healthy boundaries</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Privacy Protection</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• End-to-end encrypted messaging</li>
                <li>• No personal data shared without consent</li>
                <li>• Anonymous matching options available</li>
                <li>• GDPR compliant data handling</li>
                <li>• You control what information to share</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
