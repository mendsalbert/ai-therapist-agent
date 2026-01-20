"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Brain, Target, Crown, Zap } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useSession } from "@/lib/contexts/session-context";
import { useRouter } from "next/navigation";
import { QuoteDialog } from "./quote-dialog";

interface MoodFormProps {
  onSuccess?: () => void;
}

export function MoodForm({ onSuccess }: MoodFormProps) {
  const [moodScore, setMoodScore] = useState(50);
  const [isLoading, setIsLoading] = useState(false);
  const [showQuote, setShowQuote] = useState(false);
  const { toast } = useToast();
  const { user, isAuthenticated, loading, userTier } = useSession();
  const router = useRouter();

  // CBT-enhanced mood tracking state
  const [showCBTFields, setShowCBTFields] = useState(false);
  const [cbtData, setCbtData] = useState({
    triggers: [] as string[],
    copingStrategies: [] as string[],
    thoughts: '',
    situation: '',
    cbtInsights: null as any
  });
  const [newTrigger, setNewTrigger] = useState('');
  const [newCopingStrategy, setNewCopingStrategy] = useState('');

  const emotions = [
    { value: 0, label: "😔", description: "Very Low" },
    { value: 25, label: "😕", description: "Low" },
    { value: 50, label: "😊", description: "Neutral" },
    { value: 75, label: "😃", description: "Good" },
    { value: 100, label: "🤗", description: "Great" },
  ];

  // CBT constants
  const commonTriggers = [
    'Work stress', 'Relationship issues', 'Health concerns', 'Financial worries',
    'Social situations', 'Family problems', 'Sleep issues', 'Past trauma',
    'Future uncertainty', 'Self-criticism', 'Loneliness', 'Overwhelming tasks'
  ];

  const commonCopingStrategies = [
    'Deep breathing', 'Physical exercise', 'Talking to someone', 'Mindfulness',
    'Problem-solving', 'Self-compassion', 'Taking a break', 'Listening to music',
    'Going for a walk', 'Journaling', 'Practicing gratitude', 'Seeking support'
  ];

  const currentEmotion =
    emotions.find((em) => Math.abs(moodScore - em.value) < 15) || emotions[2];

  const handleSubmit = async () => {
    console.log("MoodForm: Starting submission");
    console.log("MoodForm: Auth state:", { isAuthenticated, loading, user });

    if (!isAuthenticated) {
      console.log("MoodForm: User not authenticated");
      toast({
        title: "Authentication required",
        description: "Please log in to track your mood",
        variant: "destructive",
      });
      router.push("/login");
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      console.log(
        "MoodForm: Token from localStorage:",
        token ? "exists" : "not found"
      );

      // Generate CBT insights for low moods
      let cbtInsights = null;
      if (moodScore <= 40 && userTier === 'premium' && cbtData.thoughts) {
        try {
          const insightsResponse = await fetch('/api/cbt/insights', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              text: cbtData.thoughts,
              type: 'mood_analysis',
              mood: moodScore,
              emotions: [currentEmotion.description],
              situation: cbtData.situation
            })
          });
          
          if (insightsResponse.ok) {
            const insightsData = await insightsResponse.json();
            cbtInsights = insightsData.data;
          }
        } catch (error) {
          console.error('Failed to get CBT insights:', error);
        }
      }

      const response = await fetch("/api/mood", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          score: moodScore,
          // CBT-enhanced data
          triggers: cbtData.triggers,
          copingStrategies: cbtData.copingStrategies,
          thoughts: cbtData.thoughts,
          situation: cbtData.situation,
          cbtInsights
        }),
      });

      console.log("MoodForm: Response status:", response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error("MoodForm: Error response:", error);
        throw new Error(error.error || "Failed to track mood");
      }

      const data = await response.json();
      console.log("MoodForm: Success response:", data);

      toast({
        title: "Mood tracked successfully!",
        description: "Your mood has been recorded.",
      });

      // Show inspirational quote instead of immediately closing
      setShowQuote(true);
    } catch (error) {
      console.error("MoodForm: Error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to track mood",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 py-4">
      {/* Emotion display */}
      <div className="text-center space-y-2">
        <div className="text-4xl">{currentEmotion.label}</div>
        <div className="text-sm text-muted-foreground">
          {currentEmotion.description}
        </div>
      </div>

      {/* Emotion slider */}
      <div className="space-y-4">
        <div className="flex justify-between px-2">
          {emotions.map((em) => (
            <div
              key={em.value}
              className={`cursor-pointer transition-opacity ${
                Math.abs(moodScore - em.value) < 15
                  ? "opacity-100"
                  : "opacity-50"
              }`}
              onClick={() => setMoodScore(em.value)}
            >
              <div className="text-2xl">{em.label}</div>
            </div>
          ))}
        </div>

        <Slider
          value={[moodScore]}
          onValueChange={(value) => setMoodScore(value[0])}
          min={0}
          max={100}
          step={1}
          className="py-4"
        />
      </div>

      {/* CBT Enhancement Toggle */}
      <div className="border-t pt-4">
        <Button
          variant="outline"
          onClick={() => setShowCBTFields(!showCBTFields)}
          className="w-full flex items-center gap-2"
        >
          <Brain className="w-4 h-4" />
          {showCBTFields ? 'Hide CBT Fields' : 'Add CBT Context'}
          {userTier === 'premium' && <Crown className="w-3 h-3" />}
        </Button>
      </div>

      {/* CBT Fields */}
      {showCBTFields && (
        <div className="space-y-4 border-t pt-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-blue-600" />
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">CBT-Enhanced Mood Tracking</h3>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Help identify triggers and coping strategies to better understand your mood patterns.
            </p>
          </div>

          {/* Situation */}
          <div>
            <Label htmlFor="situation">What's happening? (Optional)</Label>
            <Textarea
              id="situation"
              value={cbtData.situation}
              onChange={(e) => setCbtData({...cbtData, situation: e.target.value})}
              placeholder="Briefly describe what's going on in your life right now..."
              className="mt-2"
              rows={2}
            />
          </div>

          {/* Triggers */}
          <div>
            <Label>What triggered this mood? (Optional)</Label>
            <div className="flex flex-wrap gap-2 mt-2 mb-2">
              {cbtData.triggers.map(trigger => (
                <Badge key={trigger} variant="secondary" className="flex items-center gap-1">
                  {trigger}
                  <button 
                    onClick={() => setCbtData({...cbtData, triggers: cbtData.triggers.filter(t => t !== trigger)})}
                    className="ml-1 hover:text-red-500"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newTrigger}
                onChange={(e) => setNewTrigger(e.target.value)}
                placeholder="Add a trigger..."
                className="flex-1"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (newTrigger && !cbtData.triggers.includes(newTrigger)) {
                      setCbtData({...cbtData, triggers: [...cbtData.triggers, newTrigger]});
                      setNewTrigger('');
                    }
                  }
                }}
              />
              <Button
                size="sm"
                onClick={() => {
                  if (newTrigger && !cbtData.triggers.includes(newTrigger)) {
                    setCbtData({...cbtData, triggers: [...cbtData.triggers, newTrigger]});
                    setNewTrigger('');
                  }
                }}
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {commonTriggers.map(trigger => (
                <button
                  key={trigger}
                  onClick={() => {
                    if (!cbtData.triggers.includes(trigger)) {
                      setCbtData({...cbtData, triggers: [...cbtData.triggers, trigger]});
                    }
                  }}
                  className="text-xs px-2 py-1 rounded-full bg-muted hover:bg-primary/20 transition-colors"
                >
                  {trigger}
                </button>
              ))}
            </div>
          </div>

          {/* Thoughts */}
          <div>
            <Label htmlFor="thoughts">What thoughts are you having? (Optional)</Label>
            <Textarea
              id="thoughts"
              value={cbtData.thoughts}
              onChange={(e) => setCbtData({...cbtData, thoughts: e.target.value})}
              placeholder="What's going through your mind right now?"
              className="mt-2"
              rows={2}
            />
          </div>

          {/* Coping Strategies */}
          <div>
            <Label>What helps you cope? (Optional)</Label>
            <div className="flex flex-wrap gap-2 mt-2 mb-2">
              {cbtData.copingStrategies.map(strategy => (
                <Badge key={strategy} variant="secondary" className="flex items-center gap-1">
                  {strategy}
                  <button 
                    onClick={() => setCbtData({...cbtData, copingStrategies: cbtData.copingStrategies.filter(s => s !== strategy)})}
                    className="ml-1 hover:text-red-500"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newCopingStrategy}
                onChange={(e) => setNewCopingStrategy(e.target.value)}
                placeholder="Add a coping strategy..."
                className="flex-1"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (newCopingStrategy && !cbtData.copingStrategies.includes(newCopingStrategy)) {
                      setCbtData({...cbtData, copingStrategies: [...cbtData.copingStrategies, newCopingStrategy]});
                      setNewCopingStrategy('');
                    }
                  }
                }}
              />
              <Button
                size="sm"
                onClick={() => {
                  if (newCopingStrategy && !cbtData.copingStrategies.includes(newCopingStrategy)) {
                    setCbtData({...cbtData, copingStrategies: [...cbtData.copingStrategies, newCopingStrategy]});
                    setNewCopingStrategy('');
                  }
                }}
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {commonCopingStrategies.map(strategy => (
                <button
                  key={strategy}
                  onClick={() => {
                    if (!cbtData.copingStrategies.includes(strategy)) {
                      setCbtData({...cbtData, copingStrategies: [...cbtData.copingStrategies, strategy]});
                    }
                  }}
                  className="text-xs px-2 py-1 rounded-full bg-muted hover:bg-primary/20 transition-colors"
                >
                  {strategy}
                </button>
              ))}
            </div>
          </div>

          {/* AI-Powered CBT Insights for Premium Users */}
          {userTier === 'premium' && moodScore <= 40 && cbtData.thoughts && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-purple-600" />
                <h4 className="font-semibold text-purple-900 dark:text-purple-100">AI CBT Insights</h4>
                <Crown className="w-3 h-3 text-yellow-500" />
              </div>
              <div className="text-sm text-purple-700 dark:text-purple-300">
                <p>AI analysis will appear here to help identify cognitive patterns and suggest coping strategies.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Submit button */}
      <Button
        className="w-full"
        onClick={handleSubmit}
        disabled={isLoading || loading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : loading ? (
          "Loading..."
        ) : (
          "Save Mood"
        )}
      </Button>

      {/* Quote Dialog - shown after successful mood submission */}
      <QuoteDialog
        open={showQuote}
        onOpenChange={(open) => {
          setShowQuote(open);
          if (!open) {
            // When quote dialog closes, close the parent modal
            onSuccess?.();
          }
        }}
      />
    </div>
  );
}
