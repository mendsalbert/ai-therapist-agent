"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  NotebookPen, 
  Save, 
  Calendar, 
  Heart, 
  Brain, 
  Lightbulb,
  TrendingUp,
  Clock,
  Filter,
  Search,
  Plus,
  Edit,
  Trash2,
  Crown,
  AlertCircle,
  Target,
  CheckCircle,
  Zap
} from "lucide-react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, startOfDay, isToday, isYesterday } from "date-fns";
import { useSession } from "@/lib/contexts/session-context";
import { getFeatureLimits, checkJournalLimit } from "@/lib/session-limits";
import { toast } from "sonner";
import React from "react";
import { useDebounce } from "@/hooks/use-debounce";

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood: number;
  tags: string[];
  createdAt: Date;
  insights?: string[];
  emotionalState?: string;
  keyThemes?: string[];
  concerns?: string[];
  achievements?: string[];
  // CBT fields
  cbtTemplate?: 'regular' | 'thought_record';
  situation?: string;
  automaticThoughts?: string;
  emotions?: string[];
  emotionIntensity?: number;
  evidenceFor?: string;
  evidenceAgainst?: string;
  balancedThought?: string;
  cognitiveDistortions?: string[];
  cbtInsights?: {
    detectedDistortions: string[];
    challengingQuestions: string[];
    balancedSuggestions: string[];
  };
}

export default function JournalingPage() {
  const { user, isAuthenticated } = useSession();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState("");
  const [entryTitle, setEntryTitle] = useState("");
  const [mood, setMood] = useState(5);
  const [tags, setTags] = useState<string[]>([]);
  
  // CBT template state
  const [cbtTemplate, setCbtTemplate] = useState<'regular' | 'thought_record'>('regular');
  const [cbtData, setCbtData] = useState({
    situation: '',
    automaticThoughts: '',
    emotions: [] as string[],
    emotionIntensity: 5,
    evidenceFor: '',
    evidenceAgainst: '',
    balancedThought: '',
    cognitiveDistortions: [] as string[]
  });
  const [newTag, setNewTag] = useState("");
  const [saved, setSaved] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMood, setFilterMood] = useState<number | null>(null);
  const [userTier, setUserTier] = useState<"free" | "premium">("free");
  const [backendConnected, setBackendConnected] = useState<boolean | null>(null);

  const moodLabels = [
    "😔 Very Low", "😟 Low", "😐 Neutral", "😊 Good", "😄 Great", "🤩 Excellent"
  ];

  const commonTags = [
    "gratitude", "anxiety", "work", "relationships", "health", "goals", "reflection",
    "stress", "happiness", "family", "friends", "exercise", "sleep", "mindfulness",
    "achievement", "challenge", "growth", "learning", "creativity", "nature"
  ];

  useEffect(() => {
    const loadJournalEntries = async () => {
      try {
        // First load from localStorage for immediate display
        const savedEntries = localStorage.getItem("journalEntries");
        if (savedEntries) {
          const localEntries = JSON.parse(savedEntries).map((entry: any) => ({
            ...entry,
            createdAt: new Date(entry.createdAt)
          }));
          setEntries(localEntries);
        }

        // Then load from backend if authenticated
        if (isAuthenticated) {
          const { backendService } = await import("@/lib/api/backend-service");
          const response = await backendService.getJournalEntries();
          
          if (response.success && response.data) {
            setBackendConnected(true);
            
            // Backend returns { success, entries, pagination } OR just an array
            // Extract the entries array from the nested structure
            let entriesArray: any[] = [];
            
            if (Array.isArray(response.data)) {
              // Data is directly an array
              entriesArray = response.data;
            } else if (response.data.entries && Array.isArray(response.data.entries)) {
              // Data has an entries property that is an array
              entriesArray = response.data.entries;
            } else {
              console.error("Unexpected response format:", response.data);
              setBackendConnected(false);
              return;
            }
            
            if (entriesArray.length >= 0) {
              const backendEntries = entriesArray.map((entry: any) => ({
                id: entry._id,
                title: entry.title,
                content: entry.content,
                mood: entry.mood,
                tags: entry.tags || [],
                createdAt: new Date(entry.createdAt),
                insights: entry.insights || [],
                emotionalState: entry.emotionalState || "",
                keyThemes: entry.keyThemes || [],
                concerns: entry.concerns || [],
                achievements: entry.achievements || []
              }));
              
              // Create a map of backend entries by ID for quick lookup
              const backendEntriesMap = new Map(backendEntries.map(entry => [entry.id, entry]));
              
              // Get current local entries
              const currentLocal = localStorage.getItem("journalEntries");
              const localEntries = currentLocal ? JSON.parse(currentLocal).map((entry: any) => ({
                ...entry,
                createdAt: new Date(entry.createdAt)
              })) : [];
              
              // Merge: keep backend entries + local entries not yet in backend
              const localOnlyEntries = localEntries.filter((local: any) => !backendEntriesMap.has(local.id));
              const mergedEntries = [...backendEntries, ...localOnlyEntries].sort((a, b) => 
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              );
              
              setEntries(mergedEntries);
              
              // Update localStorage with merged data
              localStorage.setItem("journalEntries", JSON.stringify(mergedEntries));
            }
          } else {
            setBackendConnected(false);
          }
        }
      } catch (error) {
        console.error("Failed to load journal entries:", error);
        setBackendConnected(false);
        // Continue with localStorage data if backend fails
      }
    };

    loadJournalEntries();
  }, [isAuthenticated]);

  // Load user tier
  useEffect(() => {
    if (isAuthenticated) {
      const checkUserTier = async () => {
        try {
          const response = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUserTier(userData.user?.subscription?.tier || 'free');
          } else {
            setUserTier('free');
          }
        } catch (error) {
          console.error('Error checking user tier:', error);
          setUserTier('free');
        }
      };
      
      checkUserTier();
    }
  }, [isAuthenticated]);

  const saveEntries = (newEntries: JournalEntry[]) => {
    setEntries(newEntries);
    localStorage.setItem("journalEntries", JSON.stringify(newEntries));
  };

  const handleSave = async () => {
    console.log('Save button clicked');
    console.log('Current entry:', currentEntry);
    console.log('CBT template:', cbtTemplate);
    console.log('CBT data:', cbtData);
    
    // Check if there's content to save
    const hasContent = currentEntry.trim() || 
      (cbtTemplate === 'thought_record' && cbtData.automaticThoughts.trim());
    
    console.log('Has content:', hasContent);
    
    if (!hasContent) {
      toast.error("Please write something before saving");
      return;
    }

    // Check journal limits for free users
    if (userTier === "free") {
      const currentEntriesThisWeek = entries.filter(entry => {
        const entryDate = new Date(entry.createdAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return entryDate >= weekAgo;
      }).length;
      
      const limitCheck = checkJournalLimit(userTier, currentEntriesThisWeek);
      
      if (!limitCheck.canStart) {
        toast.error(limitCheck.reason);
        return;
      }

      // Optional pre-check against backend (authoritative)
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        const res = await fetch('/api/journal?limit=100', { headers: token ? { Authorization: `Bearer ${token}` } : {} });
        if (res.ok) {
          const data = await res.json();
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          const count7 = (data || []).filter((e: any) => new Date(e.createdAt) >= weekAgo).length;
          if (count7 >= 3) {
            toast.error("Weekly journal limit reached on Free plan. Upgrade to continue journaling.");
            return;
          }
        }
      } catch {}
    }

    // Generate CBT insights for thought records
    let cbtInsights = undefined;
    if (cbtTemplate === 'thought_record' && userTier === 'premium' && cbtData.automaticThoughts) {
      try {
        const requestData = {
          text: cbtData.automaticThoughts,
          type: 'thought_analysis',
          mood: mood,
          emotions: cbtData.emotions,
          situation: cbtData.situation
        };
        
        console.log('Sending CBT insights request:', requestData);
        
        const response = await fetch('/api/cbt/insights', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('authToken')}`
          },
          body: JSON.stringify(requestData)
        });
        
        console.log('CBT insights response status:', response.status);
        const data = await response.json();
        console.log('CBT insights response data:', data);
        
        if (response.ok) {
          cbtInsights = data.data;
        } else {
          console.error('CBT insights failed:', data);
        }
      } catch (error) {
        console.error('Failed to get CBT insights:', error);
      }
    }

    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      title: entryTitle || `Entry ${format(new Date(), "MMM dd, yyyy")}`,
      content: cbtTemplate === 'thought_record' 
        ? `Situation: ${cbtData.situation}\n\nAutomatic Thoughts: ${cbtData.automaticThoughts}\n\nEmotions: ${cbtData.emotions.join(', ')} (${cbtData.emotionIntensity}/10)\n\nEvidence For: ${cbtData.evidenceFor}\n\nEvidence Against: ${cbtData.evidenceAgainst}\n\nBalanced Thought: ${cbtData.balancedThought}`
        : currentEntry,
      mood,
      tags,
      createdAt: new Date(),
      insights: userTier === "premium" ? await generateInsights(currentEntry, mood) : undefined,
      // CBT fields
      cbtTemplate,
      situation: cbtData.situation,
      automaticThoughts: cbtData.automaticThoughts,
      emotions: cbtData.emotions,
      emotionIntensity: cbtData.emotionIntensity,
      evidenceFor: cbtData.evidenceFor,
      evidenceAgainst: cbtData.evidenceAgainst,
      balancedThought: cbtData.balancedThought,
      cognitiveDistortions: cbtInsights?.cognitiveDistortions || [],
      cbtInsights
    };

    // Save to local state immediately
    let currentEntries = [newEntry, ...entries];
    saveEntries(currentEntries);
    
    // Add to memory system for therapy context
    try {
      const { userMemoryManager } = await import("@/lib/memory/user-memory");
      await userMemoryManager.addJournalEntry({
        date: new Date(),
        mood,
        content: currentEntry,
        tags,
        keyThemes: [],
        emotionalState: "",
        concerns: [],
        achievements: [],
        insights: []
      });
    } catch (error) {
      console.error("Failed to add journal entry to memory:", error);
    }

        // Save to backend with AI analysis
        try {
          const { backendService } = await import("@/lib/api/backend-service");
          
          // Generate insights for the content
          const contentToAnalyze = cbtTemplate === 'thought_record' 
            ? cbtData.automaticThoughts 
            : currentEntry;
          
          const insights = await generateInsights(contentToAnalyze, mood);
          const emotionalState = analyzeEmotionalState(contentToAnalyze, mood);
          const keyThemes = extractKeyThemes(contentToAnalyze);
          const concerns = extractConcerns(contentToAnalyze);
          const achievements = extractAchievements(contentToAnalyze);
          
          const response = await backendService.createJournalEntry({
            title: entryTitle || `Entry ${format(new Date(), "MMM dd, yyyy")}`,
            content: cbtTemplate === 'thought_record' 
              ? `Situation: ${cbtData.situation}\n\nAutomatic Thoughts: ${cbtData.automaticThoughts}\n\nEmotions: ${cbtData.emotions.join(', ')} (${cbtData.emotionIntensity}/10)\n\nEvidence For: ${cbtData.evidenceFor}\n\nEvidence Against: ${cbtData.evidenceAgainst}\n\nBalanced Thought: ${cbtData.balancedThought}`
              : currentEntry,
            mood,
            tags,
            createdAt: new Date(),
            insights,
            emotionalState,
            keyThemes,
            concerns,
            achievements,
            // CBT fields
            cbtTemplate,
            situation: cbtData.situation,
            automaticThoughts: cbtData.automaticThoughts,
            emotions: cbtData.emotions,
            emotionIntensity: cbtData.emotionIntensity,
            evidenceFor: cbtData.evidenceFor,
            evidenceAgainst: cbtData.evidenceAgainst,
            balancedThought: cbtData.balancedThought,
            cognitiveDistortions: cbtInsights?.cognitiveDistortions || [],
            cbtInsights
          });
          
          if (response.success) {
            toast.success("Journal entry saved and analyzed successfully!");
            // Update the entry with AI analysis AND backend ID
            const backendId = response.data?.entry?._id || response.data?._id;
            const updatedEntry = { 
              ...newEntry, 
              id: backendId || newEntry.id, // Use backend MongoDB ID
              insights, 
              emotionalState, 
              keyThemes, 
              concerns, 
              achievements 
            };
            currentEntries = [updatedEntry, ...currentEntries.slice(1)];
            saveEntries(currentEntries);

            // If it's a CBT thought record, also save it to the CBT system
            if (cbtTemplate === 'thought_record' && cbtData.automaticThoughts) {
              try {
                const cbtResponse = await fetch('/api/cbt/thought-records', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('authToken')}`
                  },
                  body: JSON.stringify({
                    situation: cbtData.situation,
                    automaticThoughts: cbtData.automaticThoughts,
                    emotions: cbtData.emotions,
                    emotionIntensity: cbtData.emotionIntensity,
                    evidenceFor: cbtData.evidenceFor,
                    evidenceAgainst: cbtData.evidenceAgainst,
                    balancedThought: cbtData.balancedThought,
                    cognitiveDistortions: cbtInsights?.cognitiveDistortions || [],
                    insights: cbtInsights,
                    mood: mood,
                    tags: tags
                  })
                });

                if (cbtResponse.ok) {
                  const cbtData = await cbtResponse.json();
                  console.log('CBT thought record saved to backend:', cbtData);
                  toast.success("CBT thought record saved successfully!");
                } else {
                  console.error('Failed to save CBT thought record to backend');
                  toast.error("Failed to save CBT thought record to backend");
                }
              } catch (error) {
                console.error('Error saving CBT thought record:', error);
                toast.error("Failed to save CBT thought record");
              }
            }
          }
        } catch (error) {
          console.error("Failed to save journal entry to backend:", error);
          toast.error("Failed to sync with cloud. Entry saved locally.");
        }
    
    setCurrentEntry("");
    setEntryTitle("");
    setMood(5);
    setTags([]);
    setCbtTemplate('regular');
    setCbtData({
      situation: '',
      automaticThoughts: '',
      emotions: [],
      emotionIntensity: 5,
      evidenceFor: '',
      evidenceAgainst: '',
      balancedThought: '',
      cognitiveDistortions: []
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    
    console.log('Save completed successfully');
  };

  const generateInsights = async (content: string, mood: number, entryId?: string): Promise<string[]> => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      if (!token) {
        console.warn('No auth token available for AI insights');
        return getFallbackInsights(content, mood);
      }

      console.log('🔍 Requesting AI insights for journal entry...');

      const response = await fetch('/api/cbt/insights', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: content,  // API route expects 'content'
          mood,
          type: 'journal_insights'  // API route has specific handler for this
        })
      });

      console.log('📊 AI insights response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ AI insights response:', data);
        
        if (data.success) {
          // API route returns { success, insights, source }
          const insights = data.insights || [];
          
          if (Array.isArray(insights) && insights.length > 0) {
            console.log('✨ Got AI insights:', insights);
            console.log('📍 Source:', data.source);
            return insights;
          }
        }
      } else {
        const errorData = await response.json();
        console.warn('⚠️ AI insights request failed:', errorData);
      }

      console.warn('⚠️ Using fallback insights');
      return getFallbackInsights(content, mood);
    } catch (error) {
      console.error('❌ Error generating AI insights:', error);
      return getFallbackInsights(content, mood);
    }
  };

  const getFallbackInsights = (content: string, mood: number): string[] => {
    const insights = [];
    const lowerContent = content.toLowerCase();
    
    // Gratitude detection
    if (lowerContent.includes("grateful") || lowerContent.includes("thankful") || 
        lowerContent.includes("appreciate") || lowerContent.includes("blessed")) {
      insights.push("🌟 Gratitude practice detected - great for mental well-being!");
    }
    
    // Mood-based insights
    if (mood <= 2) {
      insights.push("💙 Consider reaching out to a support system or trying a relaxation technique.");
    } else if (mood >= 5) {
      insights.push("😊 You're feeling great today - this positive energy is wonderful!");
    }
    
    // Goal-setting detection
    if (lowerContent.includes("goal") || lowerContent.includes("plan") || 
        lowerContent.includes("achieve") || lowerContent.includes("target")) {
      insights.push("🎯 Goal-setting mindset - keep up the positive planning!");
    }
    
    // Stress/anxiety detection
    if (lowerContent.includes("stress") || lowerContent.includes("anxiety") || 
        lowerContent.includes("worried") || lowerContent.includes("overwhelmed")) {
      insights.push("🧘 Consider trying mindfulness exercises or deep breathing techniques.");
    }
    
    // Relationships detection
    if (lowerContent.includes("friend") || lowerContent.includes("family") || 
        lowerContent.includes("relationship") || lowerContent.includes("love")) {
      insights.push("💕 Relationships are important for well-being - nurture these connections.");
    }
    
    // Achievement detection
    if (lowerContent.includes("accomplish") || lowerContent.includes("success") || 
        lowerContent.includes("proud") || lowerContent.includes("achieved")) {
      insights.push("🏆 Celebrating your achievements is important for motivation!");
    }
    
    // Detailed reflection
    if (content.length > 300) {
      insights.push("📝 Detailed reflection - this depth of thinking is valuable for self-awareness.");
    }
    
    // Exercise/physical activity
    if (lowerContent.includes("exercise") || lowerContent.includes("workout") || 
        lowerContent.includes("run") || lowerContent.includes("walk")) {
      insights.push("🏃 Physical activity is excellent for both mental and physical health!");
    }
    
    return insights;
  };

  const analyzeEmotionalState = (content: string, mood: number): string => {
    const lowerContent = content.toLowerCase();
    
    if (mood <= 2) {
      return "Low mood - may need support";
    } else if (mood <= 4) {
      return "Neutral to moderate mood";
    } else {
      return "Positive mood - feeling good";
    }
  };

  const extractKeyThemes = (content: string): string[] => {
    const themes = [];
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes("work") || lowerContent.includes("job") || lowerContent.includes("career")) {
      themes.push("Work/Career");
    }
    if (lowerContent.includes("family") || lowerContent.includes("parent") || lowerContent.includes("sibling")) {
      themes.push("Family");
    }
    if (lowerContent.includes("friend") || lowerContent.includes("social")) {
      themes.push("Social Relationships");
    }
    if (lowerContent.includes("health") || lowerContent.includes("exercise") || lowerContent.includes("fitness")) {
      themes.push("Health & Wellness");
    }
    if (lowerContent.includes("goal") || lowerContent.includes("plan") || lowerContent.includes("future")) {
      themes.push("Goals & Planning");
    }
    if (lowerContent.includes("stress") || lowerContent.includes("anxiety") || lowerContent.includes("worry")) {
      themes.push("Stress & Anxiety");
    }
    
    return themes;
  };

  const extractConcerns = (content: string): string[] => {
    const concerns = [];
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes("worried") || lowerContent.includes("concerned") || lowerContent.includes("anxious")) {
      concerns.push("General anxiety");
    }
    if (lowerContent.includes("tired") || lowerContent.includes("exhausted") || lowerContent.includes("fatigue")) {
      concerns.push("Fatigue");
    }
    if (lowerContent.includes("sad") || lowerContent.includes("depressed") || lowerContent.includes("down")) {
      concerns.push("Low mood");
    }
    if (lowerContent.includes("stressed") || lowerContent.includes("overwhelmed")) {
      concerns.push("Stress");
    }
    
    return concerns;
  };

  const extractAchievements = (content: string): string[] => {
    const achievements = [];
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes("accomplished") || lowerContent.includes("completed") || lowerContent.includes("finished")) {
      achievements.push("Task completion");
    }
    if (lowerContent.includes("proud") || lowerContent.includes("success") || lowerContent.includes("achieved")) {
      achievements.push("Personal success");
    }
    if (lowerContent.includes("learned") || lowerContent.includes("discovered") || lowerContent.includes("realized")) {
      achievements.push("Learning & growth");
    }
    if (lowerContent.includes("helped") || lowerContent.includes("supported") || lowerContent.includes("gave")) {
      achievements.push("Helping others");
    }
    
    return achievements;
  };

  const addTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const deleteEntry = async (id: string) => {
    const entryToDelete = entries.find(entry => entry.id === id);
    
    // Remove from local state immediately
    const updatedEntries = entries.filter(entry => entry.id !== id);
    saveEntries(updatedEntries);
    
    if (selectedEntry?.id === id) {
      setSelectedEntry(null);
    }
    
    // Try to delete from backend
    try {
      const { backendService } = await import("@/lib/api/backend-service");
      await backendService.deleteJournalEntry(id);
      toast.success("Entry deleted successfully!");
    } catch (error) {
      console.error("Failed to delete entry from backend:", error);
      toast.error("Entry deleted locally, but failed to sync with cloud.");
    }
  };

  // Debounce search term for better performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Memoize filtered entries for performance
  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      const lowerSearchTerm = debouncedSearchTerm.toLowerCase();
      const matchesSearch = !debouncedSearchTerm || 
        entry.title.toLowerCase().includes(lowerSearchTerm) ||
        entry.content.toLowerCase().includes(lowerSearchTerm) ||
        entry.tags.some(tag => tag.toLowerCase().includes(lowerSearchTerm));
      const matchesMood = filterMood === null || entry.mood === filterMood;
      return matchesSearch && matchesMood;
    });
  }, [entries, debouncedSearchTerm, filterMood]);

  const getMoodColor = (moodValue: number) => {
    if (moodValue <= 2) return "text-red-500";
    if (moodValue <= 4) return "text-yellow-500";
    return "text-green-500";
  };

  function JournalEntryContent({ content }: { content: string }) {
    const [expanded, setExpanded] = useState(false);
    const shouldClamp = content.trim().split(/\s+/).length > 20 || content.length > 120;
    return (
      <>
        <span
          className={
            expanded
              ? 'text-[15px] md:text-base text-gray-700 dark:text-gray-300'
              : 'block text-[13px] md:text-sm text-muted-foreground leading-relaxed line-clamp-3 transition-all duration-200'
          }
          style={expanded ? {} : { WebkitLineClamp: 3, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
          aria-expanded={expanded}
        >
          {content}
        </span>
        {shouldClamp && (
          <button
            type="button"
            aria-label={expanded ? 'Collapse journal content' : 'Expand full journal content'}
            className="ml-1 text-primary underline hover:text-primary/80 text-xs align-baseline focus:outline-none focus:ring-2 focus:ring-primary rounded transition-all"
            onClick={() => setExpanded((e) => !e)}
          >
            {expanded ? 'See less' : 'See more'}
          </button>
        )}
      </>
    );
  }

  return (
    <div className="container mx-auto px-2 xs:px-4 py-8 sm:py-12 md:py-20">
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex flex-col xs:flex-row items-center justify-center gap-2 sm:gap-4 mb-2 sm:mb-4">
            <h1 className="text-2xl xs:text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              AI Journal
            </h1>
            {/* Backend Connection Status */}
            {backendConnected !== null && (
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                backendConnected 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  backendConnected ? 'bg-green-500' : 'bg-yellow-500'
                }`} />
                {backendConnected ? 'Cloud Sync' : 'Local Only'}
              </div>
            )}
          </div>
          <p className="text-base xs:text-lg text-muted-foreground max-w-xs xs:max-w-2xl mx-auto mb-2 sm:mb-4">
            Write freely, reflect deeply, and discover insights about your mental well-being
          </p>
          
          {/* Stats */}
          <div className="flex flex-col xs:flex-row items-center justify-center gap-4 sm:gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <NotebookPen className="w-4 h-4" />
              <span>{entries.length} entries</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span>
                {entries.length > 0 
                  ? Math.round(entries.reduce((sum, entry) => sum + entry.mood, 0) / entries.length * 10) / 10
                  : 0
                } avg mood
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>
                {entries.filter(entry => isToday(entry.createdAt)).length} today
              </span>
            </div>
          </div>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
        {/* New Entry Form */}
        <div className="lg:col-span-2 min-w-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <NotebookPen className="w-5 h-5 text-primary" />
                {selectedEntry ? "Edit Entry" : "New Entry"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-2">Title (optional)</label>
                <input
                  type="text"
                  value={entryTitle}
                  onChange={(e) => setEntryTitle(e.target.value)}
                  placeholder="Give your entry a title..."
                  className="w-full p-2 sm:p-3 rounded-md border bg-background"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium mb-2">How are you feeling today?</label>
                <div className="flex items-center gap-2 xs:gap-4">
                  <motion.span 
                    className="text-2xl"
                    animate={{ scale: mood <= 2 ? [1, 1.2, 1] : 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    😔
                  </motion.span>
                  <div className="flex-1 relative"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const percentage = x / rect.width;
                      const newMood = Math.round(percentage * 5) + 1; // 1-6 range
                      setMood(Math.max(1, Math.min(6, newMood)));
                    }}
                  >
                    <input
                      type="range"
                      min="1"
                      max="6"
                      value={mood}
                      onChange={(e) => setMood(parseInt(e.target.value))}
                      className="w-full h-2 bg-gradient-to-r from-red-200 via-yellow-200 to-green-200 dark:from-red-900/30 dark:via-yellow-900/30 dark:to-green-900/30 rounded-lg appearance-none cursor-pointer transition-all duration-300
                        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-200 [&::-webkit-slider-thumb]:hover:scale-110
                        [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:transition-transform [&::-moz-range-thumb]:duration-200 [&::-moz-range-thumb]:hover:scale-110"
                    />
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 pointer-events-none">
                      <motion.div
                        key={mood}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 25 }}
                        className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-xs font-medium shadow-lg"
                        style={{ left: `${((mood - 1) / 5) * 100}%` }}
                      >
                        {mood}/6
                      </motion.div>
                    </div>
                  </div>
                  <motion.span 
                    className="text-2xl"
                    animate={{ scale: mood >= 5 ? [1, 1.2, 1] : 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    🤩
                  </motion.span>
                  <motion.span 
                    className={`text-sm font-medium min-w-[120px] ${getMoodColor(mood)}`}
                    key={mood}
                    initial={{ y: 5, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {moodLabels[mood - 1]}
                  </motion.span>
                </div>
              </div>

              {/* CBT Template Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">Journal Template</label>
                <div className="flex gap-2 mb-4">
                  <Button
                    variant={cbtTemplate === 'regular' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCbtTemplate('regular')}
                    className="flex items-center gap-2"
                  >
                    <NotebookPen className="w-4 h-4" />
                    Regular Journal
                  </Button>
                  <Button
                    variant={cbtTemplate === 'thought_record' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCbtTemplate('thought_record')}
                    className="flex items-center gap-2"
                  >
                    <Brain className="w-4 h-4" />
                    CBT Thought Record
                    {userTier === 'premium' && <Crown className="w-3 h-3" />}
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="ml-1 hover:text-red-500">
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag(newTag);
                        setNewTag("");
                      }
                    }}
                    placeholder="Add a tag..."
                    className="flex-1 p-2 rounded-md border bg-background text-sm"
                  />
                  <Button
                    size="sm"
                    onClick={() => {
                      addTag(newTag);
                      setNewTag("");
                    }}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {commonTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => addTag(tag)}
                      className="text-xs px-2 py-1 rounded-full bg-muted hover:bg-primary/20 transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Regular Journal Entry */}
              {cbtTemplate === 'regular' && (
                <div>
                  <label className="block text-sm font-medium mb-2">What's on your mind?</label>
                  <textarea
                    value={currentEntry}
                    onChange={(e) => {
                      setCurrentEntry(e.target.value);
                      setSaved(false);
                    }}
                    placeholder="Write freely about your thoughts, feelings, experiences, or anything else on your mind..."
                    className="w-full min-h-[300px] rounded-md border p-3 bg-background resize-none"
                  />
                </div>
              )}

              {/* CBT Thought Record Form */}
              {cbtTemplate === 'thought_record' && (
                <div className="space-y-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100">CBT Thought Record</h3>
                    </div>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Use this structured approach to challenge unhelpful thoughts and develop balanced thinking.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Situation</label>
                    <textarea
                      value={cbtData.situation}
                      onChange={(e) => setCbtData({...cbtData, situation: e.target.value})}
                      placeholder="What happened? Where were you? Who was with you?"
                      className="w-full min-h-[80px] rounded-md border p-3 bg-background resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Automatic Thoughts</label>
                    <textarea
                      value={cbtData.automaticThoughts}
                      onChange={(e) => setCbtData({...cbtData, automaticThoughts: e.target.value})}
                      placeholder="What thoughts went through your mind? What did you believe?"
                      className="w-full min-h-[80px] rounded-md border p-3 bg-background resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Emotions & Intensity</label>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {['Anxious', 'Sad', 'Angry', 'Frustrated', 'Guilty', 'Shame', 'Fear', 'Worry', 'Happy', 'Content', 'Excited', 'Proud'].map(emotion => (
                          <button
                            key={emotion}
                            onClick={() => {
                              const emotions = cbtData.emotions.includes(emotion)
                                ? cbtData.emotions.filter(e => e !== emotion)
                                : [...cbtData.emotions, emotion];
                              setCbtData({...cbtData, emotions});
                            }}
                            className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                              cbtData.emotions.includes(emotion)
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-background border-border hover:border-primary/50'
                            }`}
                          >
                            {emotion}
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-sm text-muted-foreground min-w-[70px]">Intensity:</span>
                        <div className="flex-1 relative"
                          onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const x = e.clientX - rect.left;
                            const percentage = x / rect.width;
                            const newIntensity = Math.round(percentage * 9) + 1; // 1-10 range
                            setCbtData({...cbtData, emotionIntensity: Math.max(1, Math.min(10, newIntensity))});
                          }}
                        >
                          <input
                            type="range"
                            min="1"
                            max="10"
                            value={cbtData.emotionIntensity}
                            onChange={(e) => setCbtData({...cbtData, emotionIntensity: parseInt(e.target.value)})}
                            className="w-full h-2 bg-gradient-to-r from-blue-200 via-purple-200 to-red-200 dark:from-blue-900/30 dark:via-purple-900/30 dark:to-red-900/30 rounded-lg appearance-none cursor-pointer transition-all duration-300
                              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-200 [&::-webkit-slider-thumb]:hover:scale-110
                              [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:transition-transform [&::-moz-range-thumb]:duration-200 [&::-moz-range-thumb]:hover:scale-110"
                          />
                        </div>
                        <motion.span 
                          className="text-sm font-medium min-w-[45px] text-center"
                          key={cbtData.emotionIntensity}
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          {cbtData.emotionIntensity}/10
                        </motion.span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Evidence For This Thought</label>
                    <textarea
                      value={cbtData.evidenceFor}
                      onChange={(e) => setCbtData({...cbtData, evidenceFor: e.target.value})}
                      placeholder="What evidence supports this thought?"
                      className="w-full min-h-[60px] rounded-md border p-3 bg-background resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Evidence Against This Thought</label>
                    <textarea
                      value={cbtData.evidenceAgainst}
                      onChange={(e) => setCbtData({...cbtData, evidenceAgainst: e.target.value})}
                      placeholder="What evidence contradicts this thought?"
                      className="w-full min-h-[60px] rounded-md border p-3 bg-background resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Balanced Thought</label>
                    <textarea
                      value={cbtData.balancedThought}
                      onChange={(e) => setCbtData({...cbtData, balancedThought: e.target.value})}
                      placeholder="What's a more balanced way of thinking about this situation?"
                      className="w-full min-h-[80px] rounded-md border p-3 bg-background resize-none"
                    />
                  </div>

                  {/* AI-Powered CBT Insights for Premium Users */}
                  {userTier === 'premium' && cbtData.automaticThoughts && (
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                      <div className="flex items-center gap-2 mb-3">
                        <Zap className="w-4 h-4 text-purple-600" />
                        <h4 className="font-semibold text-purple-900 dark:text-purple-100">AI CBT Insights</h4>
                        <Crown className="w-3 h-3 text-yellow-500" />
                      </div>
                      <div className="text-sm text-purple-700 dark:text-purple-300">
                        <p>AI analysis will appear here to help identify cognitive distortions and suggest challenging questions.</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleSave}
                    disabled={
                      cbtTemplate === 'regular' 
                        ? !currentEntry.trim()
                        : !cbtData.automaticThoughts.trim()
                    }
                    className="bg-primary/90 hover:bg-primary"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Entry
                  </Button>
                  {saved && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-green-600 flex items-center gap-1"
                    >
                      ✓ Saved!
                    </motion.span>
                  )}
                  {userTier === "free" && (
                    <Badge variant="outline" className="text-xs">
                      <Crown className="w-3 h-3 mr-1" />
                      Premium for AI insights
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span>{currentEntry.length} characters</span>
                  <span>•</span>
                  <span>{currentEntry.split(' ').filter(word => word.length > 0).length} words</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Entries List */}
        <div className="space-y-4 sm:space-y-6">
          {/* Search and Filter */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Entries</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search entries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-md border bg-background text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Filter by mood</label>
                <select
                  value={filterMood || ""}
                  onChange={(e) => setFilterMood(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full p-2 rounded-md border bg-background text-sm"
                >
                  <option value="">All moods</option>
                  {moodLabels.map((label, index) => (
                    <option key={index} value={index + 1}>{label}</option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Entries */}
          <div className="space-y-2 sm:space-y-3 max-h-[400px] sm:max-h-[600px] overflow-y-auto">
            <AnimatePresence>
              {filteredEntries.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ 
                    duration: 0.2, // Faster animation
                    delay: index * 0.02, // Staggered but fast
                    ease: [0.4, 0, 0.2, 1] // Smooth easing
                  }}
                >
                  <Card 
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedEntry?.id === entry.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedEntry(entry)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-sm line-clamp-1">{entry.title}</h3>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteEntry(entry.id);
                            }}
                            className="text-muted-foreground hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      
                      <p className="mb-2">
                        <JournalEntryContent content={entry.content} />
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <span className={getMoodColor(entry.mood)}>
                            {moodLabels[entry.mood - 1].split(' ')[0]}
                          </span>
                          <Clock className="w-3 h-3" />
                          {isToday(entry.createdAt) ? 'Today' : 
                           isYesterday(entry.createdAt) ? 'Yesterday' : 
                           format(entry.createdAt, 'MMM dd')}
                        </div>
                        {entry.insights && entry.insights.length > 0 && (
                          <Lightbulb className="w-3 h-3 text-yellow-500" />
                        )}
                      </div>
                      
                      {entry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {entry.tags.slice(0, 3).map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {entry.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{entry.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {filteredEntries.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <NotebookPen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No entries found</p>
                <p className="text-sm">Start writing your first entry!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Entry Details Modal */}
      <AnimatePresence>
        {selectedEntry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 z-50"
            onClick={() => setSelectedEntry(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-background rounded-lg max-w-full sm:max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{selectedEntry.title}</CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedEntry(null)}
                    >
                      ×
                    </Button>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className={getMoodColor(selectedEntry.mood)}>
                      {moodLabels[selectedEntry.mood - 1]}
                    </span>
                    <span>{format(selectedEntry.createdAt, 'MMMM dd, yyyy')}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Entry</h4>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {selectedEntry.content}
                    </p>
                  </div>
                  
                  {selectedEntry.tags.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedEntry.tags.map(tag => (
                          <Badge key={tag} variant="secondary">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedEntry.insights && selectedEntry.insights.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-yellow-500" />
                        AI Insights
                      </h4>
                      <div className="space-y-2">
                        {selectedEntry.insights.map((insight, index) => (
                          <div key={index} className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
                            <p className="text-sm">{insight}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedEntry.emotionalState && (
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Heart className="w-4 h-4 text-red-500" />
                        Emotional State
                      </h4>
                      <p className="text-sm text-muted-foreground">{selectedEntry.emotionalState}</p>
                    </div>
                  )}
                  
                  {selectedEntry.keyThemes && selectedEntry.keyThemes.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Brain className="w-4 h-4 text-blue-500" />
                        Key Themes
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedEntry.keyThemes.map((theme, index) => (
                          <Badge key={index} variant="secondary">{theme}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedEntry.concerns && selectedEntry.concerns.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-orange-500" />
                        Concerns
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedEntry.concerns.map((concern, index) => (
                          <Badge key={index} variant="destructive" className="text-xs">{concern}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedEntry.achievements && selectedEntry.achievements.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        Achievements
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedEntry.achievements.map((achievement, index) => (
                          <Badge key={index} variant="default" className="text-xs bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">{achievement}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


