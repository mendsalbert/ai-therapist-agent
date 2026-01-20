"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/lib/contexts/session-context";
import { toast } from "sonner";
import { backendService } from "@/lib/api/backend-service";
import { 
  MessageSquare, 
  Mic, 
  Video, 
  Clock, 
  Crown, 
  Loader2,
  CheckCircle,
  XCircle
} from "lucide-react";

interface StartSessionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNewSession?: () => void;
}

export function StartSessionModal({ open, onOpenChange, onNewSession }: StartSessionModalProps) {
  const [sessionType, setSessionType] = useState<"text" | "audio" | "video">("text");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated, userTier } = useSession();
  const router = useRouter();

  const sessionTypes = [
    {
      id: "text" as const,
      name: "Text Chat",
      description: "Type your thoughts and get AI responses",
      icon: <MessageSquare className="w-5 h-5" />,
      available: true,
      premium: false,
    },
    {
      id: "audio" as const,
      name: "Voice Chat",
      description: "Speak naturally with voice recognition",
      icon: <Mic className="w-5 h-5" />,
      available: true,
      premium: true,
    },
    {
      id: "video" as const,
      name: "Video Session",
      description: "Face-to-face therapy with AI avatar",
      icon: <Video className="w-5 h-5" />,
      available: false,
      premium: true,
    },
  ];

  const getUserLimits = (tier: string) => {
    switch (tier) {
      case "premium":
        return {
          sessionsPerWeek: 50,
          sessionsPerDay: 10,
          canUseVoice: true,
          canUseVideo: true,
        };
      case "free":
      default:
        return {
          sessionsPerWeek: 3,
          sessionsPerDay: 1,
          canUseVoice: false,
          canUseVideo: false,
        };
    }
  };

  const checkSessionLimit = (tier: string, weeklyCount: number, dailyCount: number) => {
    const limits = getUserLimits(tier);
    
    if (dailyCount >= limits.sessionsPerDay) {
      return {
        canStart: false,
        reason: `Daily limit reached (${limits.sessionsPerDay} sessions per day)`,
      };
    }
    
    if (weeklyCount >= limits.sessionsPerWeek) {
      return {
        canStart: false,
        reason: `Weekly limit reached (${limits.sessionsPerWeek} sessions per week)`,
      };
    }
    
    return { canStart: true, reason: null };
  };

  const handleStartSession = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to start a session");
      onOpenChange(false);
      router.push('/login');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Check session limits for free users
      if (userTier === "free") {
        try {
          // Get real session counts from backend
          const sessionsResponse = await backendService.getChatSessions();
          const currentSessions = sessionsResponse.success ? sessionsResponse.data || [] : [];
          
          // Calculate sessions this week
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
          
          const sessionsThisWeek = currentSessions.filter((session: any) => 
            new Date(session.createdAt) > oneWeekAgo
          ).length;
          
          // Calculate sessions today
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const sessionsToday = currentSessions.filter((session: any) => 
            new Date(session.createdAt) >= today
          ).length;
          
          const limitCheck = checkSessionLimit(userTier, sessionsThisWeek, sessionsToday);
          
          if (!limitCheck.canStart) {
            toast.error(limitCheck.reason);
            setError(limitCheck.reason || "Session limit reached");
            return;
          }
        } catch (error) {
          console.error("Error checking session limits:", error);
          // Continue with session creation if limit check fails
        }
      }

      // Handle different session types
      if (sessionType === "audio") {
        const limits = getUserLimits(userTier);
        if (!limits.canUseVoice) {
          toast.error("Voice therapy is a premium feature. Upgrade to access voice sessions.");
          setError("Voice therapy requires Premium subscription");
          return;
        }
      }

      if (sessionType === "video") {
        toast.error("Video sessions are coming soon!");
        setError("Video sessions are not yet available");
        return;
      }

      // Create a new session via backend
      const sessionResponse = await backendService.createChatSession();
      
      if (sessionResponse.success && sessionResponse.data) {
        const sessionId = sessionResponse.data.id;
        
        onOpenChange(false);
        toast.success("Session started successfully!");
        
        // Redirect to the therapy chat page with the real session ID
        router.push(`/therapy/${sessionId}`);
        
        if (onNewSession) {
          onNewSession();
        }
      } else {
        throw new Error(sessionResponse.error || "Failed to create session");
      }
    } catch (error) {
      console.error("Failed to start session:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to start session. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const limits = getUserLimits(userTier);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Start New Therapy Session
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Session Limits Info */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Your Limits</span>
              <Badge variant={userTier === "premium" ? "default" : "secondary"}>
                <Crown className="w-3 h-3 mr-1" />
                {userTier === "premium" ? "Premium" : "Free"}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{limits.sessionsPerDay} per day</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{limits.sessionsPerWeek} per week</span>
              </div>
            </div>
          </div>

          {/* Session Type Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Choose Session Type</Label>
            <RadioGroup value={sessionType} onValueChange={(value) => setSessionType(value as any)}>
              {sessionTypes.map((type) => (
                <div key={type.id} className="flex items-center space-x-3">
                  <RadioGroupItem 
                    value={type.id} 
                    id={type.id}
                    disabled={!type.available}
                  />
                  <Label 
                    htmlFor={type.id} 
                    className={`flex-1 cursor-pointer ${!type.available ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                      <div className="text-muted-foreground">
                        {type.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{type.name}</span>
                          {type.premium && (
                            <Badge variant="outline" className="text-xs">
                              <Crown className="w-3 h-3 mr-1" />
                              Premium
                            </Badge>
                          )}
                          {!type.available && (
                            <Badge variant="secondary" className="text-xs">
                              Coming Soon
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{type.description}</p>
                      </div>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-600" />
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleStartSession}
              disabled={loading || !sessionTypes.find(t => t.id === sessionType)?.available}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Start Session
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
