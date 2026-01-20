"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Activity, 
  Heart, 
  Wind, 
  Target,
  TrendingUp,
  Calendar,
  CheckCircle,
  Clock,
  BarChart3
} from "lucide-react";
import { useSession } from "@/lib/contexts/session-context";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface CBTProgress {
  thoughtRecordsCompleted: number;
  activitiesScheduled: number;
  moodEntries: number;
  relaxationSessions: number;
  goalsAchieved: number;
  weeklyStreak: number;
}

export default function CBTDashboard() {
  const { user, isAuthenticated, userTier } = useSession();
  const router = useRouter();
  const [progress, setProgress] = useState<CBTProgress>({
    thoughtRecordsCompleted: 0,
    activitiesScheduled: 0,
    moodEntries: 0,
    relaxationSessions: 0,
    goalsAchieved: 0,
    weeklyStreak: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadCBTProgress();
  }, [isAuthenticated, router]);

  const loadCBTProgress = async () => {
    try {
      setIsLoading(true);
      // Load CBT progress from backend
      const response = await fetch('/api/cbt/progress', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProgress(data.progress || {
          thoughtRecordsCompleted: 0,
          activitiesScheduled: 0,
          moodEntries: 0,
          relaxationSessions: 0,
          goalsAchieved: 0,
          weeklyStreak: 0
        });
      }
    } catch (error) {
      console.error('Error loading CBT progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const cbtTools = [
    {
      title: "Thought Records",
      description: "Challenge negative thoughts and develop balanced thinking",
      icon: Brain,
      href: "/journaling",
      color: "bg-blue-500",
      completed: progress.thoughtRecordsCompleted,
      isPremium: false
    },
    {
      title: "Behavioral Activation",
      description: "Schedule activities and track your mood",
      icon: Activity,
      href: "/therapy",
      color: "bg-green-500",
      completed: progress.activitiesScheduled,
      isPremium: false
    },
    {
      title: "Mood Tracking",
      description: "Monitor your emotional patterns and triggers",
      icon: Heart,
      href: "/therapy",
      color: "bg-pink-500",
      completed: progress.moodEntries,
      isPremium: false
    },
    {
      title: "Relaxation Techniques",
      description: "Learn breathing exercises and relaxation methods",
      icon: Wind,
      href: "/meditations",
      color: "bg-purple-500",
      completed: progress.relaxationSessions,
      isPremium: userTier === "premium"
    },
    {
      title: "Goal Setting",
      description: "Set and track therapeutic goals",
      icon: Target,
      href: "/therapy",
      color: "bg-orange-500",
      completed: progress.goalsAchieved,
      isPremium: userTier === "premium"
    }
  ];

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">CBT Tools Dashboard</h1>
          <p className="text-muted-foreground">
            Evidence-based cognitive behavioral therapy tools to support your mental health journey
          </p>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Weekly Streak</p>
                  <p className="text-2xl font-bold">{progress.weeklyStreak} days</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/10 rounded-full">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completed This Week</p>
                  <p className="text-2xl font-bold">
                    {progress.thoughtRecordsCompleted + progress.activitiesScheduled + progress.moodEntries}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-full">
                  <Calendar className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Activity</p>
                  <p className="text-2xl font-bold">Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CBT Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cbtTools.map((tool, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${tool.color} text-white`}>
                      <tool.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{tool.title}</CardTitle>
                      {tool.isPremium && (
                        <Badge variant="secondary" className="text-xs">
                          Premium
                        </Badge>
                      )}
                    </div>
                  </div>
                  {tool.completed > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {tool.completed} completed
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {tool.description}
                </p>
                <Link href={tool.href}>
                  <Button 
                    className="w-full" 
                    variant={tool.isPremium && userTier !== "premium" ? "outline" : "default"}
                    disabled={tool.isPremium && userTier !== "premium"}
                  >
                    {tool.isPremium && userTier !== "premium" ? "Upgrade to Access" : "Start Tool"}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-full">
                    <Brain className="w-6 h-6 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Quick Thought Check</h3>
                    <p className="text-sm text-muted-foreground">
                      Challenge a negative thought in 5 minutes
                    </p>
                  </div>
                  <Button size="sm" asChild>
                    <Link href="/journaling">Start</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-500/10 rounded-full">
                    <Heart className="w-6 h-6 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Mood Check-in</h3>
                    <p className="text-sm text-muted-foreground">
                      Track your current mood and emotions
                    </p>
                  </div>
                  <Button size="sm" asChild>
                    <Link href="/therapy">Start</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Progress Insights */}
        {userTier === "premium" && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Progress Insights</h2>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-500/10 rounded-full">
                    <BarChart3 className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">AI-Powered Insights</h3>
                    <p className="text-sm text-muted-foreground">
                      Get personalized recommendations based on your CBT progress
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    View Insights
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
