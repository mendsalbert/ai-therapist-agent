"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/contexts/session-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { backendService } from "@/lib/api/backend-service";
import { paystackService } from "@/lib/payments/paystack-service";
import { MentalHealthData } from "@/components/mental-health-data";
import { WeeklyReport } from "@/components/analytics/weekly-report";
import { 
  User, 
  Settings, 
  Calendar,
  Edit,
  Save,
  X,
  Loader2,
  Crown,
  Lock,
  CheckCircle,
  Target,
  Plus,
  Trash2,
  BarChart3
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface UserProfile {
  bio: string;
  challenges: string[];
  goals: string[];
  communicationStyle: "gentle" | "direct" | "supportive";
  experienceLevel: "beginner" | "intermediate" | "experienced";
}

const COMMUNICATION_STYLES = [
  { value: "gentle", label: "Gentle", description: "Soft and empathetic approach" },
  { value: "direct", label: "Direct", description: "Clear and straightforward communication" },
  { value: "supportive", label: "Supportive", description: "Encouraging and affirming style" }
];

const EXPERIENCE_LEVELS = [
  { value: "beginner", label: "Beginner", description: "New to mental health journey" },
  { value: "intermediate", label: "Intermediate", description: "Some experience with therapy/self-care" },
  { value: "experienced", label: "Experienced", description: "Well-versed in mental health practices" }
];

const COMMON_CHALLENGES = [
  "Anxiety", "Depression", "Stress", "PTSD", "OCD", "Bipolar Disorder",
  "Eating Disorders", "Social Anxiety", "Panic Attacks", "Insomnia",
  "ADHD", "Addiction", "Grief", "Trauma", "Burnout"
];

const COMMON_GOALS = [
  "Better Sleep", "Stress Management", "Mindfulness", "Emotional Regulation",
  "Improved Relationships", "Self-Confidence", "Work-Life Balance",
  "Reduce Anxiety", "Overcome Depression", "Build Resilience",
  "Develop Coping Skills", "Increase Self-Awareness", "Find Purpose"
];

export default function ProfilePage() {
  const { user, isAuthenticated, userTier, isLoading, refreshUser } = useSession();
  const router = useRouter();
  
  // State management
  const [activeTab, setActiveTab] = useState("analytics");
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // User data
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null);
  const [editedName, setEditedName] = useState("");
  const [editedEmail, setEditedEmail] = useState("");
  const [newGoal, setNewGoal] = useState("");
  
  // Subscription data
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);
  
  // Error tracking
  const [apiErrors, setApiErrors] = useState<string[]>([]);
  
  // Memory data
  const [memories, setMemories] = useState<Array<{
    id: string;
    type: string;
    content: string;
    importance: number;
    tags: string[];
    context?: string;
    timestamp: string;
    createdAt: string;
  }>>([]);
  const [loadingMemories, setLoadingMemories] = useState(false);
  const [editingMemory, setEditingMemory] = useState<string | null>(null);
  const [editMemoryContent, setEditMemoryContent] = useState("");
  const [editMemoryType, setEditMemoryType] = useState("");
  const [editMemoryImportance, setEditMemoryImportance] = useState(5);

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      loadProfileData();
      loadMemories();
    }
  }, [isAuthenticated, isLoading]);
  
  const loadMemories = async () => {
    try {
      setLoadingMemories(true);
      const response = await backendService.getUserMemories();
      if (response.success && response.data) {
        setMemories(response.data);
      }
    } catch (error) {
      console.error("Failed to load memories:", error);
    } finally {
      setLoadingMemories(false);
    }
  };
  
  const handleEditMemory = (memory: any) => {
    setEditingMemory(memory.id);
    setEditMemoryContent(memory.content);
    setEditMemoryType(memory.type);
    setEditMemoryImportance(memory.importance);
  };
  
  const handleSaveMemory = async (memoryId: string) => {
    try {
      const response = await backendService.updateMemory(memoryId, {
        content: editMemoryContent,
        type: editMemoryType,
        importance: editMemoryImportance,
      });
      if (response.success) {
        toast.success("Memory updated successfully");
        setEditingMemory(null);
        await loadMemories();
      } else {
        toast.error(response.error || "Failed to update memory");
      }
    } catch (error) {
      console.error("Failed to update memory:", error);
      toast.error("Failed to update memory");
    }
  };
  
  const handleDeleteMemory = async (memoryId: string) => {
    if (!confirm("Are you sure you want to delete this memory? This action cannot be undone.")) {
      return;
    }
    try {
      const response = await backendService.deleteMemory(memoryId);
      if (response.success) {
        toast.success("Memory deleted successfully");
        await loadMemories();
      } else {
        toast.error(response.error || "Failed to delete memory");
      }
    } catch (error) {
      console.error("Failed to delete memory:", error);
      toast.error("Failed to delete memory");
    }
  };

  // Keep edited fields in sync with user object when not editing
  useEffect(() => {
    if (!isEditing && user) {
      setEditedName(user.name);
      setEditedEmail(user.email);
    }
  }, [user, isEditing]);

  const loadProfileData = async () => {
    // CRITICAL: Don't reload if we're currently saving (prevents race condition)
    if (isSaving) {
      console.log("⏸️ Skipping profile load - save in progress");
      return;
    }
    
    try {
      setLoading(true);
      
      // Load profile and subscription data in parallel
      const [profileRes, subscriptionData] = await Promise.all([
        backendService.getUserProfile().catch((e) => {
          console.error("❌ Profile fetch failed:", e.message || e);
          return { success: false, data: null, error: e.message };
        }),
        paystackService.getSubscriptionStatus(user?._id || '').catch((e) => {
          console.error("❌ Subscription status fetch failed:", e.message || e);
          return { isActive: false, plan: null, error: e.message };
        })
      ]);

      // Set profile data
      if (profileRes.success && profileRes.data) {
        // Only extract the fields we need (don't spread MongoDB internals)
        const profile: UserProfile = {
          bio: profileRes.data.bio || "",
          challenges: profileRes.data.challenges || [],
          goals: profileRes.data.goals || [],
          communicationStyle: profileRes.data.communicationStyle || "gentle",
          experienceLevel: profileRes.data.experienceLevel || "beginner"
        };
        setUserProfile(profile);
        setEditedProfile(profile);
      } else {
        // Initialize with empty profile if none exists
        const emptyProfile: UserProfile = {
          bio: "",
          challenges: [],
          goals: [],
          communicationStyle: "gentle",
          experienceLevel: "beginner"
        };
        setUserProfile(emptyProfile);
        setEditedProfile(emptyProfile);
      }
      
      // Set user basic info for editing
      if (user) {
        setEditedName(user.name);
        setEditedEmail(user.email);
      }
      
      // Set subscription data
      setSubscriptionStatus(subscriptionData);
      
      // Collect errors for display
      const errors: string[] = [];
      if ((profileRes as any).error) errors.push(`Profile: ${(profileRes as any).error}`);
      if ((subscriptionData as any).error) errors.push(`Subscription: ${(subscriptionData as any).error}`);
      
      setApiErrors(errors);
      
      if (errors.length > 0) {
        console.error("🔴 API Errors detected:", errors);
      }
    } catch (error) {
      console.error("Error loading profile data:", error);
      toast.error("Failed to load profile data. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  const saveGoalsToBackend = async (goals: string[]) => {
    setIsSaving(true); // 🔒 Lock to prevent race condition
    try {
      console.log("Saving goals to backend:", goals);
      
      // Save to localStorage as backup
      if (typeof window !== 'undefined') {
        const backup = { goals, userId: user?._id, timestamp: Date.now() };
        localStorage.setItem('profile_goals_backup', JSON.stringify(backup));
      }
      
      // Only send the goals field that changed
      const profileRes = await backendService.updateUserProfile({ goals });
      console.log("Backend response:", profileRes);
      
      if (profileRes.success) {
        toast.success("Goal saved!");
        // Clear backup on successful save
        localStorage.removeItem('profile_goals_backup');
        
        // Update local state with the saved data FIRST
        if (profileRes.data) {
          console.log("Updated profile data:", profileRes.data);
          const updatedProfile = {
            bio: profileRes.data.bio || "",
            challenges: profileRes.data.challenges || [],
            goals: profileRes.data.goals || [],
            communicationStyle: profileRes.data.communicationStyle || "gentle",
            experienceLevel: profileRes.data.experienceLevel || "beginner"
          };
          setUserProfile(updatedProfile);
          setEditedProfile(updatedProfile);
          
          // Update AI memory with the data we already have (no second API call)
          if (user?._id) {
            const { userMemoryManager } = await import("@/lib/memory/user-memory");
            // Update memory directly with the saved data instead of fetching again
            if (userMemoryManager.memory) {
              userMemoryManager.memory.profile.goals = updatedProfile.goals;
              userMemoryManager.memory.profile.challenges = updatedProfile.challenges;
              await userMemoryManager.saveUserMemory();
              console.log("✅ AI memory updated with latest goals");
            }
          }
        }
      } else if (profileRes.isNetworkError) {
        // Network error - data is backed up locally
        toast.warning("Offline - goal will save when connection is restored", {
          duration: 5000
        });
      } else {
        console.error("Failed to save goal:", profileRes.error);
        toast.error(profileRes.error || "Failed to save goal");
      }
    } catch (error) {
      console.error("Error saving goal:", error);
      toast.warning("Goal saved locally - will sync when online", {
        duration: 5000
      });
    } finally {
      setIsSaving(false); // 🔓 Unlock after save completes
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      
      // Save to localStorage as backup
      if (typeof window !== 'undefined') {
        const backup = { 
          profile: editedProfile, 
          name: editedName,
          email: editedEmail,
          userId: user?._id, 
          timestamp: Date.now() 
        };
        localStorage.setItem('profile_full_backup', JSON.stringify(backup));
      }
      
      let userInfoUpdated = false;
      
      // Update basic user info if changed
      if (editedName !== user?.name || editedEmail !== user?.email) {
        const userRes = await backendService.updateUser({
          name: editedName,
          email: editedEmail
        });
        if (!userRes.success) {
          if (userRes.isNetworkError) {
            toast.warning("Profile saved locally - will sync when connection is restored", {
              duration: 5000
            });
            setIsSaving(false);
            return;
          }
          throw new Error("Failed to update basic info");
        }
        userInfoUpdated = true;
      }
      
      // Update user profile (therapeutic preferences)
      if (editedProfile) {
        const profileRes = await backendService.updateUserProfile(editedProfile);
        if (!profileRes.success) {
          if (profileRes.isNetworkError) {
            toast.warning("Profile saved locally - will sync when connection is restored", {
              duration: 5000
            });
            setIsSaving(false);
            return;
          }
          throw new Error("Failed to update profile");
        }
        
        // Update local state with response data
        if (profileRes.data) {
          const updatedProfile = {
            bio: profileRes.data.bio || "",
            challenges: profileRes.data.challenges || [],
            goals: profileRes.data.goals || [],
            communicationStyle: profileRes.data.communicationStyle || "gentle",
            experienceLevel: profileRes.data.experienceLevel || "beginner"
          };
          setUserProfile(updatedProfile);
          setEditedProfile(updatedProfile);
        } else {
          // If no data returned, use the edited profile
          setUserProfile(editedProfile);
          setEditedProfile(editedProfile);
        }
      }

      // Clear backup on successful save
      localStorage.removeItem('profile_full_backup');
      
      // Update AI memory with the data we already have (no second API call)
      if (user?._id && editedProfile) {
        const { userMemoryManager } = await import("@/lib/memory/user-memory");
        if (userMemoryManager.memory) {
          // Update all profile fields to memory
          userMemoryManager.memory.profile.goals = editedProfile.goals || [];
          userMemoryManager.memory.profile.challenges = editedProfile.challenges || [];
          if (editedProfile.communicationStyle) {
            userMemoryManager.memory.profile.preferences.communicationStyle = editedProfile.communicationStyle as 'gentle' | 'direct' | 'supportive';
          }
          if (editedProfile.bio) {
            // Store bio in memory (if memory structure supports it, otherwise store in preferences)
            // Note: Bio might not be directly stored in memory structure, but we can add it to preferences if needed
          }
          await userMemoryManager.saveUserMemory();
          console.log("✅ AI memory updated with latest profile data:", {
            goals: editedProfile.goals,
            challenges: editedProfile.challenges,
            communicationStyle: editedProfile.communicationStyle,
            experienceLevel: editedProfile.experienceLevel
          });
        }
      }
      
      // If user info was updated, refresh the session
      if (userInfoUpdated) {
        await refreshUser();
        // Wait a moment for session to update
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedProfile(userProfile);
    setEditedName(user?.name || "");
    setEditedEmail(user?.email || "");
    setIsEditing(false);
  };

  const toggleChallenge = (challenge: string) => {
    if (!editedProfile) return;
    const challenges = editedProfile.challenges || [];
    const updated = challenges.includes(challenge)
      ? challenges.filter(c => c !== challenge)
      : [...challenges, challenge];
    setEditedProfile({ ...editedProfile, challenges: updated });
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading profile...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please sign in to view your profile</h2>
          <Button onClick={() => router.push("/login")}>Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6 pt-20">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* API Error Banner */}
        {apiErrors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
          >
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-yellow-600 text-xs font-bold">!</span>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-yellow-900 mb-1">
                  Some data failed to load
                </h3>
                <p className="text-xs text-yellow-700 mb-2">
                  The backend may be starting up or experiencing temporary issues. Your data is safe.
                </p>
                <details className="text-xs text-yellow-600">
                  <summary className="cursor-pointer hover:underline font-medium">
                    View error details
                  </summary>
                  <ul className="mt-2 space-y-1 ml-4 list-disc">
                    {apiErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </details>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={loadProfileData}
                className="text-xs"
              >
                Retry
              </Button>
            </div>
          </motion.div>
        )}
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <User className="w-8 h-8 text-primary" />
              My Profile
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your profile and track your mental health journey
            </p>
          </div>
          <Badge variant={userTier === "premium" ? "default" : "secondary"} className="text-sm">
            <Crown className="w-3 h-3 mr-1" />
            {userTier === "premium" ? "Premium" : "Free"} Plan
          </Badge>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-grid">
            <TabsTrigger value="analytics">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics & Reports
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="w-4 h-4 mr-2" />
              Account Settings
            </TabsTrigger>
          </TabsList>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6 mt-6">
            {/* Mental Health Journey Section */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="mb-4">
                <h2 className="text-2xl font-bold mb-2">Your Mental Health Journey</h2>
                <p className="text-muted-foreground">
                  Track your progress, insights, and wellness activities
                </p>
              </div>
              
              <div className="max-w-2xl mx-auto mb-6">
                <MentalHealthData showInsights={true} />
              </div>
            </motion.div>

            {/* Weekly Report Section */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <WeeklyReport />
            </motion.div>

            {/* AI Stored Memories Section */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="w-5 h-5" />
                        AI Stored Memories
                      </CardTitle>
                      <CardDescription>
                        Important details the AI remembers from your conversations. You can edit or delete these.
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={loadMemories} disabled={loadingMemories}>
                      {loadingMemories ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Refresh
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {loadingMemories ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : memories.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No stored memories yet.</p>
                      <p className="text-sm mt-1">The AI will remember important details from your conversations.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* User Summary (if exists) - Show first and prominently */}
                      {(() => {
                        const summary = memories.find(m => m.type === 'user_summary');
                        if (!summary) return null;
                        
                        return (
                          <Card className="border-primary/20 bg-primary/5">
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between gap-4 mb-4">
                                <div className="flex items-center gap-2">
                                  <Brain className="w-5 h-5 text-primary" />
                                  <CardTitle className="text-lg">AI Summary About You</CardTitle>
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8"
                                    onClick={() => {
                                      setEditingMemory(summary.id);
                                      setEditMemoryContent(summary.content);
                                      setEditMemoryType('user_summary');
                                      setEditMemoryImportance(10);
                                    }}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                    onClick={() => handleDeleteMemory(summary.id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                              {editingMemory === summary.id ? (
                                <div className="space-y-3">
                                  <div>
                                    <Label>Summary</Label>
                                    <p className="text-xs text-muted-foreground mb-2">
                                      This is an AI-generated summary about you. You can edit it to better reflect your situation.
                                    </p>
                                    <Textarea
                                      value={editMemoryContent}
                                      onChange={(e) => setEditMemoryContent(e.target.value)}
                                      className="mt-1"
                                      rows={8}
                                    />
                                  </div>
                                  <div className="flex gap-2">
                                    <Button size="sm" onClick={() => handleSaveMemory(summary.id)}>
                                      <Save className="w-4 h-4 mr-2" />
                                      Save
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => setEditingMemory(null)}>
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{summary.content}</p>
                                  {summary.timestamp && (
                                    <p className="text-xs text-muted-foreground mt-3 italic">
                                      Last updated: {new Date(summary.timestamp).toLocaleDateString()}
                                    </p>
                                  )}
                                </>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })()}
                      
                      {/* Other memories (excluding summary) */}
                      {memories.filter(m => m.type !== 'user_summary').map((memory) => (
                        <div
                          key={memory.id}
                          className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                        >
                          {editingMemory === memory.id ? (
                            <div className="space-y-3">
                              <div>
                                <Label>Content</Label>
                                <Textarea
                                  value={editMemoryContent}
                                  onChange={(e) => setEditMemoryContent(e.target.value)}
                                  className="mt-1"
                                  rows={3}
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <Label>Type</Label>
                                  <Select value={editMemoryType} onValueChange={setEditMemoryType}>
                                    <SelectTrigger className="mt-1">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="user_summary">User Summary</SelectItem>
                                      <SelectItem value="emotional_theme">Emotional Theme</SelectItem>
                                      <SelectItem value="coping_pattern">Coping Pattern</SelectItem>
                                      <SelectItem value="goal">Goal</SelectItem>
                                      <SelectItem value="trigger">Trigger</SelectItem>
                                      <SelectItem value="insight">Insight</SelectItem>
                                      <SelectItem value="preference">Preference</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label>Importance: {editMemoryImportance}</Label>
                                  <Slider
                                    value={[editMemoryImportance]}
                                    onValueChange={(vals) => setEditMemoryImportance(vals[0])}
                                    min={1}
                                    max={10}
                                    step={1}
                                    className="mt-2"
                                  />
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" onClick={() => handleSaveMemory(memory.id)}>
                                  <Save className="w-4 h-4 mr-2" />
                                  Save
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => setEditingMemory(null)}>
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="secondary" className="text-xs">
                                      {memory.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      Importance: {memory.importance}/10
                                    </Badge>
                                    {memory.timestamp && (
                                      <span className="text-xs text-muted-foreground">
                                        {new Date(memory.timestamp).toLocaleDateString()}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm">{memory.content}</p>
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8"
                                    onClick={() => handleEditMemory(memory)}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                    onClick={() => handleDeleteMemory(memory.id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Profile Tab - HIDDEN */}
          <TabsContent value="profile" className="hidden">
            {/* Mental Health Journey Section */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="mb-4">
                <h2 className="text-2xl font-bold mb-2">Your Mental Health Journey</h2>
                <p className="text-muted-foreground">
                  Track your progress, insights, and wellness activities
                </p>
              </div>
              
              <div className="max-w-2xl mx-auto mb-6">
                <MentalHealthData showInsights={true} />
              </div>
            </motion.div>

            {/* Goal Setting Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  My Goals
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Set and track your mental health goals
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Add new goal */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter a new goal..."
                      value={newGoal}
                      onChange={(e) => setNewGoal(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newGoal.trim()) {
                          const currentGoals = userProfile?.goals || [];
                          const updatedGoals = [...currentGoals, newGoal.trim()];
                          setEditedProfile(prev => ({ 
                            ...prev!, 
                            goals: updatedGoals
                          }));
                          setUserProfile(prev => ({
                            ...prev!,
                            goals: updatedGoals
                          }));
                          setNewGoal("");
                          saveGoalsToBackend(updatedGoals);
                        }
                      }}
                    />
                    <Button
                      onClick={() => {
                        if (newGoal.trim()) {
                          const currentGoals = userProfile?.goals || [];
                          const updatedGoals = [...currentGoals, newGoal.trim()];
                          setEditedProfile(prev => ({ 
                            ...prev!, 
                            goals: updatedGoals
                          }));
                          setUserProfile(prev => ({
                            ...prev!,
                            goals: updatedGoals
                          }));
                          setNewGoal("");
                          saveGoalsToBackend(updatedGoals);
                        }
                      }}
                      disabled={!newGoal.trim()}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  </div>

                  {/* Goals list */}
                  {(!userProfile?.goals || userProfile.goals.length === 0) ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Target className="w-12 h-12 mx-auto mb-2 opacity-20" />
                      <p className="text-sm">No goals yet. Add your first goal above!</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-semibold text-primary mb-2 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Your Active Goals ({userProfile.goals.length})
                      </p>
                      <div className="space-y-2">
                        {(userProfile?.goals || []).map((goal, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="flex items-center justify-between p-3 rounded-lg border-2 border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors shadow-sm"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                <CheckCircle className="w-4 h-4 text-primary fill-primary/20" />
                              </div>
                              <span className="text-sm font-medium">{goal}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const newGoals = userProfile.goals.filter((_, i) => i !== index);
                                setEditedProfile(prev => ({ ...prev!, goals: newGoals }));
                                setUserProfile(prev => ({ ...prev!, goals: newGoals }));
                                saveGoalsToBackend(newGoals);
                              }}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggested goals */}
                  {(!userProfile?.goals || userProfile.goals.length < 5) && (
                    <div className="pt-4 mt-4 border-t">
                      <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                        <Plus className="w-3 h-3" />
                        Quick Add from Suggestions
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {COMMON_GOALS.filter(g => !(userProfile?.goals || []).includes(g)).slice(0, 6).map((goal) => (
                          <Button
                            key={goal}
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const currentGoals = userProfile?.goals || [];
                              const newGoals = [...currentGoals, goal];
                              setEditedProfile(prev => ({ ...prev!, goals: newGoals }));
                              setUserProfile(prev => ({ ...prev!, goals: newGoals }));
                              saveGoalsToBackend(newGoals);
                            }}
                            className="text-xs border-dashed hover:border-solid hover:border-primary hover:bg-primary/5 transition-all"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            {goal}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Basic Information Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Basic Information</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your personal details and account information
                    </p>
                  </div>
                  {!isEditing && (
                    <Button onClick={() => setIsEditing(true)} variant="outline">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="mt-2"
                      />
                    ) : (
                      <div className="mt-2 p-3 rounded-lg bg-muted/50">
                        {user?.name || "Not set"}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        type="email"
                        value={editedEmail}
                        onChange={(e) => setEditedEmail(e.target.value)}
                        className="mt-2"
                      />
                    ) : (
                      <div className="mt-2 p-3 rounded-lg bg-muted/50">
                        {user?.email || "Not set"}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label>Member Since</Label>
                    <div className="mt-2 p-3 rounded-lg bg-muted/50 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
                    </div>
                  </div>
                  <div>
                    <Label>Subscription</Label>
                    <div className="mt-2 p-3 rounded-lg bg-muted/50">
                      <Badge variant={userTier === "premium" ? "default" : "secondary"}>
                        <Crown className="w-3 h-3 mr-1" />
                        {userTier === "premium" ? "Premium" : "Free"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Therapeutic Profile */}
            <Card>
              <CardHeader>
                <CardTitle>Therapeutic Profile</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Your mental health preferences and goals
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Communication Style */}
                <div>
                  <Label className="text-base font-semibold mb-3 block">Communication Style</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {COMMUNICATION_STYLES.map((style) => {
                      const isSelected = (isEditing ? editedProfile?.communicationStyle : userProfile?.communicationStyle) === style.value;
                      return (
                        <button
                          key={style.value}
                          onClick={() => isEditing && setEditedProfile({ ...editedProfile!, communicationStyle: style.value as any })}
                          disabled={!isEditing}
                          className={`p-4 rounded-lg border-2 transition-all text-left relative ${
                            isSelected
                              ? "border-primary bg-primary/10 shadow-sm ring-2 ring-primary/20"
                              : "border-muted-foreground/20 opacity-50"
                          } ${isEditing && !isSelected && "hover:border-primary/50 hover:opacity-100"} ${!isEditing && "cursor-default"}`}
                        >
                          {isSelected && (
                            <CheckCircle className="w-5 h-5 text-primary absolute top-2 right-2" />
                          )}
                          <div className={`font-medium ${isSelected && "text-primary"}`}>{style.label}</div>
                          <div className="text-xs text-muted-foreground mt-1">{style.description}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Experience Level */}
                <div>
                  <Label className="text-base font-semibold mb-3 block">Experience Level</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {EXPERIENCE_LEVELS.map((level) => {
                      const isSelected = (isEditing ? editedProfile?.experienceLevel : userProfile?.experienceLevel) === level.value;
                      return (
                        <button
                          key={level.value}
                          onClick={() => isEditing && setEditedProfile({ ...editedProfile!, experienceLevel: level.value as any })}
                          disabled={!isEditing}
                          className={`p-4 rounded-lg border-2 transition-all text-left relative ${
                            isSelected
                              ? "border-primary bg-primary/10 shadow-sm ring-2 ring-primary/20"
                              : "border-muted-foreground/20 opacity-50"
                          } ${isEditing && !isSelected && "hover:border-primary/50 hover:opacity-100"} ${!isEditing && "cursor-default"}`}
                        >
                          {isSelected && (
                            <CheckCircle className="w-5 h-5 text-primary absolute top-2 right-2" />
                          )}
                          <div className={`font-medium ${isSelected && "text-primary"}`}>{level.label}</div>
                          <div className="text-xs text-muted-foreground mt-1">{level.description}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Mental Health Challenges */}
                <div>
                  <Label className="text-base font-semibold mb-3 block">Mental Health Challenges</Label>
                  <p className="text-sm text-muted-foreground mb-3">Select all that apply</p>
                  <div className="flex flex-wrap gap-2">
                    {COMMON_CHALLENGES.map((challenge) => {
                      const isSelected = (isEditing ? editedProfile?.challenges : userProfile?.challenges)?.includes(challenge);
                      return (
                        <Badge
                          key={challenge}
                          variant={isSelected ? "default" : "outline"}
                          className={`cursor-pointer transition-all ${
                            isSelected 
                              ? "bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/20" 
                              : "opacity-50 hover:opacity-100"
                          } ${isEditing ? "hover:scale-105" : "cursor-default"}`}
                          onClick={() => isEditing && toggleChallenge(challenge)}
                        >
                          {isSelected && <CheckCircle className="w-3 h-3 mr-1" />}
                          {challenge}
                        </Badge>
                      );
                    })}
                  </div>
                  {(!userProfile?.challenges || userProfile.challenges.length === 0) && !isEditing && (
                    <p className="text-sm text-muted-foreground mt-3 italic">No challenges selected yet</p>
                  )}
                </div>

                {/* Bio */}
                {isEditing ? (
                  <div>
                    <Label htmlFor="bio" className="text-base font-semibold">Bio</Label>
                    <textarea
                      id="bio"
                      value={editedProfile?.bio || ""}
                      onChange={(e) => setEditedProfile({ ...editedProfile!, bio: e.target.value })}
                      className="w-full mt-2 p-3 rounded-lg border border-input bg-background min-h-[100px]"
                      placeholder="Tell us a bit about yourself..."
                      maxLength={500}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {editedProfile?.bio?.length || 0}/500 characters
                    </p>
                  </div>
                ) : userProfile?.bio && (
                  <div>
                    <Label className="text-base font-semibold">Bio</Label>
                    <p className="mt-2 p-3 rounded-lg bg-muted/50">{userProfile.bio}</p>
                  </div>
                )}

                {isEditing && (
                  <div className="flex gap-3 pt-4 border-t">
                    <Button onClick={handleSaveProfile} disabled={isSaving} className="flex-1">
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                    <Button onClick={handleCancelEdit} variant="outline" disabled={isSaving}>
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Manage your account security and preferences
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <div className="flex items-start gap-3">
                    <Lock className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold">Password & Security</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        For security reasons, password changes must be done through your email.
                      </p>
                      <Button variant="outline" className="mt-3" onClick={() => router.push("/forgot-password")}>
                        Change Password
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <div className="flex items-start gap-3">
                    <Crown className="w-5 h-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold">Subscription</h4>
                      <div className="mt-2 space-y-2">
                        <p className="text-sm">
                          Current plan: <strong>{userTier === "premium" ? "Premium" : "Free"}</strong>
                        </p>
                        
                        {subscriptionStatus && subscriptionStatus.isActive && subscriptionStatus.plan && (
                          <div className="text-sm text-muted-foreground">
                            <p>Plan: {subscriptionStatus.plan.name}</p>
                            {subscriptionStatus.expiresAt && (
                              <p>Expires: {new Date(subscriptionStatus.expiresAt).toLocaleDateString()}</p>
                            )}
                          </div>
                        )}
                        
                        {userTier === "free" ? (
                          <Button className="mt-3" onClick={() => router.push("/pricing")}>
                            <Crown className="w-4 h-4 mr-2" />
                            Upgrade to Premium
                          </Button>
                        ) : (
                          <div className="mt-3 space-y-2">
                            <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Active Premium
                            </Badge>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => router.push("/pricing")}
                              >
                                Manage Subscription
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={async () => {
                                  if (confirm("Are you sure you want to cancel your premium subscription? You'll lose access to premium features at the end of your billing period.")) {
                                    try {
                                      const res = await paystackService.cancelSubscription(user?._id || '');
                                      if (res.success) {
                                        toast.success("Subscription cancelled successfully");
                                        await loadProfileData();
                                      } else {
                                        toast.error(res.error || "Failed to cancel subscription");
                                      }
                                    } catch (error) {
                                      console.error("Error cancelling subscription:", error);
                                      toast.error("Failed to cancel subscription");
                                    }
                                  }
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

