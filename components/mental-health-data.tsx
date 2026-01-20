"use client";

import { useState, useEffect } from "react";
import { Brain, Heart, Activity, Lightbulb, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { userMemoryManager, UserMemory } from "@/lib/memory/user-memory";
import { useSession } from "@/lib/contexts/session-context";
import { format } from "date-fns";
import { logger } from "@/lib/utils/logger";

interface MentalHealthDataProps {
  compact?: boolean;
  showInsights?: boolean;
}

export function MentalHealthData({ compact = false, showInsights = true }: MentalHealthDataProps) {
  const { user } = useSession();
  const [userMemory, setUserMemory] = useState<UserMemory | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserMemory();
  }, [user?._id]);

  const loadUserMemory = async () => {
    try {
      setIsLoading(true);
      if (!user?._id) return;
      const memory = await userMemoryManager.loadUserMemory(user._id);
      setUserMemory(memory);
    } catch (error) {
      logger.error("Failed to load user memory:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMemoryStats = () => {
    if (!userMemory) return null;

    return {
      journalEntries: userMemory.journalEntries.length,
      meditationSessions: userMemory.meditationHistory.length,
      therapySessions: userMemory.therapySessions.length,
      insights: userMemory.insights.length,
      recentMood: userMemory.moodPatterns[userMemory.moodPatterns.length - 1]?.mood || 3,
      moodTrend: userMemory.moodPatterns.length >= 7 ? 
        (userMemory.moodPatterns.slice(-7).reduce((sum, p) => sum + p.mood, 0) / 7) : 3
    };
  };

  const getRecentInsights = () => {
    if (!userMemory) return [];
    return userMemory.insights.slice(-2); // Show only 2 most recent insights
  };

  if (isLoading || !userMemory) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Brain className="w-4 h-4 animate-pulse" />
        <span>Loading...</span>
      </div>
    );
  }

  const stats = getMemoryStats();
  const recentInsights = getRecentInsights();

  if (compact) {
    return (
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1">
          <Heart className="w-4 h-4 text-primary" />
          <span className="font-medium">{stats?.journalEntries || 0}</span>
          <span className="text-muted-foreground">Journal</span>
        </div>
        <div className="flex items-center gap-1">
          <Activity className="w-4 h-4 text-blue-500" />
          <span className="font-medium">{stats?.meditationSessions || 0}</span>
          <span className="text-muted-foreground">Meditations</span>
        </div>
        <div className="flex items-center gap-1">
          <Brain className="w-4 h-4 text-green-500" />
          <span className="font-medium">{stats?.therapySessions || 0}</span>
          <span className="text-muted-foreground">Sessions</span>
        </div>
        <div className="flex items-center gap-1">
          <div className={`w-3 h-3 rounded-full ${
            (stats?.recentMood || 3) <= 2 ? 'bg-red-500' : 
            (stats?.recentMood || 3) <= 4 ? 'bg-yellow-500' : 'bg-green-500'
          }`} />
          <span className="font-medium">{stats?.recentMood || 3}/6</span>
        </div>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Mental Health Data</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="text-center">
            <div className="text-xl font-bold text-primary">{stats?.journalEntries || 0}</div>
            <div className="text-xs text-muted-foreground">Journal Entries</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-blue-500">{stats?.meditationSessions || 0}</div>
            <div className="text-xs text-muted-foreground">Meditations</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-green-500">{stats?.therapySessions || 0}</div>
            <div className="text-xs text-muted-foreground">Therapy Sessions</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-yellow-500">{stats?.insights || 0}</div>
            <div className="text-xs text-muted-foreground">AI Insights</div>
          </div>
        </div>
        
        <div className="pt-3 border-t">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Current Mood</span>
            <span className={`text-sm font-bold ${
              (stats?.recentMood || 3) <= 2 ? 'text-red-500' : 
              (stats?.recentMood || 3) <= 4 ? 'text-yellow-500' : 'text-green-500'
            }`}>
              {stats?.recentMood || 3}/6
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                (stats?.recentMood || 3) <= 2 ? 'bg-red-500' : 
                (stats?.recentMood || 3) <= 4 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${((stats?.recentMood || 3) / 6) * 100}%` }}
            />
          </div>
        </div>

        {showInsights && recentInsights.length > 0 && (
          <div className="pt-3 border-t">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium">Recent Insights</span>
            </div>
            <div className="space-y-2">
              {recentInsights.map((insight, index) => (
                <div key={index} className="p-2 bg-muted/50 rounded text-xs">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge 
                      variant={
                        insight.type === 'achievement' ? 'default' :
                        insight.type === 'concern' ? 'destructive' :
                        insight.type === 'breakthrough' ? 'secondary' : 'outline'
                      }
                      className="text-xs"
                    >
                      {insight.type}
                    </Badge>
                    <span className="text-muted-foreground">
                      {format(insight.date, 'MMM dd')}
                    </span>
                  </div>
                  <p className="text-xs line-clamp-2">{insight.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}