"use client";

import { useEffect, useRef, useState } from "react";

// TypeScript declarations for Speech Recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
import { useParams, useRouter } from "next/navigation";
import { computeIsPremium } from "@/hooks/usePremium";
import { Button } from "@/components/ui/button";
import {
  Send,
  Bot,
  User,
  Loader2,
  Sparkles,
  X,
  Trophy,
  Star,
  Clock,
  Smile,
  PlusCircle,
  MessageSquare,
  Mic,
  MicOff,
  Keyboard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  createChatSession,
  sendChatMessage,
  getChatHistory,
  ChatMessage,
  getAllChatSessions,
  ChatSession,
} from "@/lib/api/chat";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { VoiceControls } from "@/components/therapy/voice-controls";
import { FixedInput } from "@/components/chat/fixed-input";
import { useSession } from "@/lib/contexts/session-context";
import { toast } from "sonner";
import { backendService } from "@/lib/api/backend-service";
import { logger } from "@/lib/utils/logger";
import { LoadingDots } from "@/components/ui/loading-dots";

type SpeechRecognitionEventLike = {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
  error?: string;
};

interface SuggestedQuestion {
  id: string;
  text: string;
}

interface StressPrompt {
  trigger: string;
  activity: {
    type: "breathing" | "garden" | "forest" | "waves";
    title: string;
    description: string;
  };
}

interface ApiResponse {
  message: string;
  metadata: {
    technique: string;
    goal: string;
    progress: any[];
  };
}

const SUGGESTED_QUESTIONS = [
  { text: "How can I manage my anxiety better?" },
  { text: "I've been feeling overwhelmed lately" },
  { text: "Can we talk about improving sleep?" },
  { text: "I need help with work-life balance" },
];

const FREE_MESSAGES_PER_MONTH = 150;

const glowAnimation = {
  initial: { opacity: 0.5, scale: 1 },
  animate: {
    opacity: [0.5, 1, 0.5],
    scale: [1, 1.05, 1],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

const COMPLETION_THRESHOLD = 5;

export default function TherapyPage() {
  const { user, isAuthenticated } = useSession();
  const params = useParams();
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stressPrompt, setStressPrompt] = useState<StressPrompt | null>(null);
  const [showActivity, setShowActivity] = useState(false);
  const [isChatPaused, setIsChatPaused] = useState(false);
  const [showNFTCelebration, setShowNFTCelebration] = useState(false);
  
  // Voice controls
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  const [isCompletingSession, setIsCompletingSession] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(
    params.sessionId as string
  );
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [trialEndsAt, setTrialEndsAt] = useState<string | null>(null);
  const [trialWillAutoBill, setTrialWillAutoBill] = useState<boolean>(true);
  const [isVoiceMode, setIsVoiceMode] = useState<boolean>(false);
  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);
  const [hideFooter, setHideFooter] = useState<boolean>(false);

  const getUsageKey = () => {
    const now = new Date();
    return `chat-usage-${now.getFullYear()}-${now.getMonth() + 1}`;
  };

  const getRemainingFreeMessages = () => {
    if (typeof window === "undefined") return FREE_MESSAGES_PER_MONTH;
    const key = getUsageKey();
    const used = Number(localStorage.getItem(key) || "0");
    return Math.max(0, FREE_MESSAGES_PER_MONTH - used);
  };

  const incrementUsage = () => {
    if (typeof window === "undefined") return;
    const key = getUsageKey();
    const used = Number(localStorage.getItem(key) || "0");
    localStorage.setItem(key, String(used + 1));
  };

  const handleNewSession = async () => {
    // Check if user is authenticated before creating a new session
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    try {
      setIsLoading(true);
      const newSessionId = await createChatSession();
      logger.debug("New session created", { sessionId: newSessionId });

      // Update sessions list immediately
      const newSession: ChatSession = {
        sessionId: newSessionId,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Update all state in one go
      setSessions((prev) => [newSession, ...prev]);
      setSessionId(newSessionId);
      setMessages([]);

      // Update URL without refresh
      window.history.pushState({}, "", `/therapy/${newSessionId}`);

      // Force a re-render of the chat area
      setIsLoading(false);
    } catch (error) {
      logger.error("Failed to create new session", error);
      setIsLoading(false);
    }
  };

  // Initialize chat session and load history
  useEffect(() => {
    const initChat = async () => {
      try {
        setIsLoading(true);
        
        // Validate sessionId - if it's invalid, redirect to sessions page
        if (!sessionId || sessionId === "new" || sessionId === "undefined" || sessionId === "null") {
          logger.debug("Invalid or missing sessionId, redirecting to sessions page", { sessionId });
          router.push("/therapy");
          return;
        }
        
        logger.debug("Loading existing chat session", { sessionId });
        try {
          const history = await getChatHistory(sessionId);
          logger.debug("Loaded chat history", { history, historyLength: history?.length });
          if (Array.isArray(history) && history.length > 0) {
            const formattedHistory = history.map((msg) => ({
              ...msg,
              timestamp: new Date(msg.timestamp),
            }));
            logger.debug("Formatted history", { formattedHistory, count: formattedHistory.length });
            setMessages(formattedHistory);
          } else {
            logger.warn("No chat history found or empty array", { history, sessionId });
            setMessages([]);
          }
        } catch (historyError) {
          logger.error("Error loading chat history", historyError);
          // If session not found, redirect to sessions page
          if (historyError instanceof Error && historyError.message.includes("not found")) {
            logger.debug("Session not found, redirecting to sessions page");
            router.push("/therapy");
            return;
          }
          setMessages([]);
        }
      } catch (error) {
        logger.error("Failed to initialize chat", error);
        setMessages([
          {
            role: "assistant",
            content:
              "I apologize, but I'm having trouble loading the chat session. Please try refreshing the page.",
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    initChat();
  }, [sessionId, router]);

  // Load subscription status to gate premium features (includes trial)
  useEffect(() => {
    const loadSubscription = async () => {
      try {
        if (!user?._id) return;
        const res = await backendService.getSubscriptionStatus(user._id as unknown as string);
        if (res?.success) {
          const data = res.data;
          const trialEnds = (data as any)?.trial?.trialEndsAt as string | undefined || (user as any)?.trialEndsAt as string | undefined;
          setTrialEndsAt(trialEnds || null);
          setTrialWillAutoBill((data as any)?.trial?.willAutoBill ?? true);
          const premium = computeIsPremium({
            userTier: user?.tier as string | undefined,
            trialEndsAt: trialEnds,
            subscriptionActive: Boolean(data?.isActive || data?.plan === "premium"),
          });
          setIsPremium(premium);
        } else {
          const premium = computeIsPremium({
            userTier: user?.tier as string | undefined,
            trialEndsAt: (user as any)?.trialEndsAt as string | undefined,
            subscriptionActive: false,
          });
          setIsPremium(premium);
        }
      } catch (e) {
        const premium = computeIsPremium({
          userTier: user?.tier as string | undefined,
          trialEndsAt: (user as any)?.trialEndsAt as string | undefined,
          subscriptionActive: false,
        });
        setIsPremium(premium);
      }
    };
    loadSubscription();
  }, [user?._id]);

  // Load all chat sessions
  useEffect(() => {
    const loadSessions = async () => {
      try {
        const allSessions = await getAllChatSessions();
        setSessions(allSessions);
      } catch (error) {
        logger.error("Failed to load sessions", error);
      }
    };

    loadSessions();
  }, [messages]);

  const scrollToBottom = () => {
    // Scroll the messages container to bottom, not the entire viewport
    // This prevents the input from jumping when new messages arrive
    if (scrollContainerRef.current) {
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
      }, 100);
    }
  };

  useEffect(() => {
    if (!isTyping) {
      scrollToBottom();
    }
  }, [messages, isTyping]);

  // Initialize voice recognition
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SR) {
        setVoiceSupported(true);
        recognitionRef.current = new SR();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: SpeechRecognitionEventLike) => {
          const transcript = event.results[0][0].transcript;
          setMessage(transcript);
          setIsListening(false);
          // Auto-send when in Voice Mode
          if (isVoiceMode) {
            setTimeout(() => {
              const fakeEvent = { preventDefault: () => {} } as unknown as React.FormEvent;
              handleSubmit(fakeEvent);
            }, 50);
          }
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      } else {
        setVoiceSupported(false);
      }
    } catch {
      setVoiceSupported(false);
    }
  }, []);

  // Voice control functions
  const toggleListening = () => {
    if (typeof window === 'undefined') return;

    // Lazy init if missing
    if (!recognitionRef.current) {
      const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SR) {
        recognitionRef.current = new SR();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';
        recognitionRef.current.onresult = (event: SpeechRecognitionEventLike) => {
          const transcript = event.results[0][0].transcript;
          setMessage(transcript);
          setIsListening(false);
          if (isVoiceMode) {
            setTimeout(() => {
              const fakeEvent = { preventDefault: () => {} } as unknown as React.FormEvent;
              handleSubmit(fakeEvent);
            }, 50);
          }
        };
        recognitionRef.current.onend = () => setIsListening(false);
        setVoiceSupported(true);
      }
    }

    if (!voiceSupported || !recognitionRef.current) {
      toast.error("Voice input not supported on this device.");
      return;
    }

    if (isListening) {
      try { recognitionRef.current.stop(); } catch {}
      setIsListening(false);
    } else {
      // Interrupt TTS if speaking
      if (typeof window !== 'undefined' && (window as any).speechSynthesis?.speaking) {
        (window as any).speechSynthesis.cancel();
      }
      try { recognitionRef.current.start(); } catch {}
      setIsListening(true);
    }
  };

  const speakText = (text: string) => {
    if (!isPremium) {
      toast.error("Listening is a Premium feature.");
      router.push("/pricing");
      return;
    }
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      // Try to use a more natural voice
      const voices = speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Google') || 
        voice.name.includes('Microsoft') ||
        voice.name.includes('Natural')
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        // Interrupt listening while speaking
        if (isListening && recognitionRef.current) {
          try { recognitionRef.current.stop(); } catch {}
          setIsListening(false);
        }
      };
      utterance.onend = () => {
        setIsSpeaking(false);
        // Resume listening in Voice Mode
        if (isVoiceMode && recognitionRef.current) {
          try {
            recognitionRef.current.start();
            setIsListening(true);
          } catch {}
        }
      };
      
      speechSynthesis.speak(utterance);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
      logger.debug("Form submitted");
    const currentMessage = message.trim();
    logger.debug("Current message:", currentMessage);
    logger.debug("Session ID", { sessionId });
    logger.debug("Is typing", { isTyping });
    logger.debug("Is chat paused", { isChatPaused });

    if (!currentMessage || isTyping || isChatPaused || !sessionId) {
      logger.warn("Submission blocked", {
        noMessage: !currentMessage,
        isTyping,
        isChatPaused,
        noSessionId: !sessionId,
      });
      return;
    }

    if (!isPremium) {
      const remaining = getRemainingFreeMessages();
      if (remaining <= 0) {
        toast.error("Free plan limit reached (150 messages/month). Upgrade to continue.");
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "You've reached the free monthly message limit. Upgrade to Premium for unlimited chats.",
            timestamp: new Date(),
          },
        ]);
        setIsTyping(false);
        setTimeout(() => router.push('/pricing'), 600);
        return;
      }
    }

    setMessage("");
    setIsTyping(true);

    try {
      // Add user message
      const userMessage: ChatMessage = {
        role: "user",
        content: currentMessage,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // Check for stress signals
      const stressCheck = detectStressSignals(currentMessage);
      if (stressCheck) {
        setStressPrompt(stressCheck);
        setIsTyping(false);
        return;
      }

      logger.debug("Sending message to API");
      // Send message to API
      logger.debug("Sending message to regular chat API...");
      const response = await sendChatMessage(sessionId, currentMessage);
      logger.debug("Raw API response", { response });

      // Parse the response if it's a string
      const aiResponse =
        typeof response === "string" ? JSON.parse(response) : response;
      logger.debug("Parsed AI response", { aiResponse });

      // Add AI response with metadata
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content:
          aiResponse.response ||
          aiResponse.message ||
          "I'm here to support you. Could you tell me more about what's on your mind?",
        timestamp: new Date(),
        metadata: {
          analysis: aiResponse.analysis || {
            emotionalState: "neutral",
            riskLevel: 0,
            themes: [],
            recommendedApproach: "supportive",
            progressIndicators: [],
          },
          technique: aiResponse.metadata?.technique || "supportive",
          goal: aiResponse.metadata?.currentGoal || "Provide support",
          progress: aiResponse.metadata?.progress || {
            emotionalState: "neutral",
            riskLevel: 0,
          },
        },
      };

      logger.debug("Created assistant message", { assistantMessage });

      // Add the message immediately
      setMessages((prev) => [...prev, assistantMessage]);
      if (!isPremium) {
        incrementUsage();
      }
      setIsTyping(false);
      scrollToBottom();

      // In Voice Mode, auto-play assistant reply
      if (isVoiceMode) {
        speakText(assistantMessage.content);
      }
    } catch (error: any) {
      logger.error("Error in chat", error);
      const messageText = (error?.message || "").toString();
      if (messageText.includes("Daily chat limit")) {
        toast.error("Daily chat limit reached on Free plan. Upgrade to continue chatting today.");
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "You've reached the daily chat limit on the Free plan. Upgrade to Premium for unlimited chats.",
            timestamp: new Date(),
          },
        ]);
        setTimeout(() => router.push('/pricing'), 600);
        return;
      }
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
          timestamp: new Date(),
        },
      ]);
      setIsTyping(false);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const detectStressSignals = (message: string): StressPrompt | null => {
    const stressKeywords = [
      "stress",
      "anxiety",
      "worried",
      "panic",
      "overwhelmed",
      "nervous",
      "tense",
      "pressure",
      "can't cope",
      "exhausted",
    ];

    const lowercaseMsg = message.toLowerCase();
    const foundKeyword = stressKeywords.find((keyword) =>
      lowercaseMsg.includes(keyword)
    );

    if (foundKeyword) {
      const activities = [
        {
          type: "breathing" as const,
          title: "Breathing Exercise",
          description:
            "Follow calming breathing exercises with visual guidance",
        },
        {
          type: "garden" as const,
          title: "Zen Garden",
          description: "Create and maintain your digital peaceful space",
        },
        {
          type: "forest" as const,
          title: "Mindful Forest",
          description: "Take a peaceful walk through a virtual forest",
        },
        {
          type: "waves" as const,
          title: "Ocean Waves",
          description: "Match your breath with gentle ocean waves",
        },
      ];

      return {
        trigger: foundKeyword,
        activity: activities[Math.floor(Math.random() * activities.length)],
      };
    }

    return null;
  };

  const handleSuggestedQuestion = async (text: string) => {
    // Don't create a new session - use the existing one
    setMessage(text);
    setTimeout(() => {
      const event = new Event("submit") as unknown as React.FormEvent;
      handleSubmit(event);
    }, 0);
  };

  const handleCompleteSession = async () => {
    if (isCompletingSession) return;
    setIsCompletingSession(true);
    try {
      // Call the completion API
      if (sessionId) {
        const { completeChatSession } = await import("@/lib/api/chat");
        await completeChatSession(sessionId);
        logger.info(`Session ${sessionId} completed successfully`);
      }
      
      setShowNFTCelebration(true);
      
      // Show success toast
      toast.success("Session completed successfully!");
      
    } catch (error) {
      logger.error("Error completing session", error);
      toast.error("Failed to complete session. Please try again.");
    } finally {
      setIsCompletingSession(false);
    }
  };

  const handleSessionSelect = async (selectedSessionId: string) => {
    if (selectedSessionId === sessionId) return;

    try {
      setIsLoading(true);
      const history = await getChatHistory(selectedSessionId);
      if (Array.isArray(history)) {
        const formattedHistory = history.map((msg) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(formattedHistory);
        setSessionId(selectedSessionId);
        window.history.pushState({}, "", `/therapy/${selectedSessionId}`);
      }
    } catch (error) {
      logger.error("Failed to load session", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderTrialBanner = () => {
    if (!trialEndsAt) return null;
    const ends = new Date(trialEndsAt);
    if (Number.isNaN(ends.getTime())) return null;
    const daysLeft = Math.max(0, Math.ceil((ends.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
    return (
      <div className="mx-4 mt-4 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-primary shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="font-semibold">Free trial active</div>
            <div className="text-primary/80">Ends in {daysLeft} day{daysLeft === 1 ? '' : 's'} ({ends.toLocaleDateString()}). Billing continues after the trial unless you cancel before billing.</div>
          </div>
          <Button size="sm" variant={"outline" as any} onClick={() => router.push('/pricing')}>
            Cancel before billing
          </Button>
        </div>
        <div className="mt-1 text-xs text-primary/70">Auto-billing: {trialWillAutoBill ? 'On' : 'Off'}</div>
      </div>
    );
  };

  // Single page - just the chat interface
  // This page takes full viewport and doesn't use the default layout padding
  return (
    <div 
      className="fixed inset-0 bg-background" 
      style={{ 
        position: 'fixed', 
        width: '100%', 
        height: '100vh',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1
      }}
    >
      {/* Floating back button - ALWAYS fixed to viewport top, never moves */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => router.push('/therapy')}
        className="fixed top-4 left-4 z-[100] w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm shadow-lg border border-border hover:bg-background"
        style={{ position: 'fixed' }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </Button>
      
      <div className="flex h-full w-full">
        {/* Main chat area - full width, no sidebar */}
        <div className="flex-1 flex flex-col overflow-hidden bg-background w-full h-full">
          {renderTrialBanner()}

          {messages.length === 0 ? (
            // Welcome screen with suggested questions
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="max-w-2xl w-full space-y-8">
                <div className="text-center space-y-4">
                  <div className="relative inline-flex flex-col items-center">
                    <motion.div
                      className="absolute inset-0 bg-primary/20 blur-2xl rounded-full"
                      initial="initial"
                      animate="animate"
                      variants={glowAnimation}
                    />
                    <div className="relative flex items-center gap-2 text-2xl font-semibold">
                      <div className="relative">
                        <Sparkles className="w-6 h-6 text-primary" />
                        <motion.div
                          className="absolute inset-0 text-primary"
                          initial="initial"
                          animate="animate"
                          variants={glowAnimation}
                        >
                          <Sparkles className="w-6 h-6" />
                        </motion.div>
                      </div>
                      <span className="bg-gradient-to-r from-primary/90 to-primary bg-clip-text text-transparent">
                        AI Therapist
                      </span>
                    </div>
                    <p className="text-muted-foreground mt-2">
                      How can I assist you today?
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 relative">
                  <motion.div
                    className="absolute -inset-4 bg-gradient-to-b from-primary/5 to-transparent blur-xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  />
                  {SUGGESTED_QUESTIONS.map((q, index) => (
                    <motion.div
                      key={q.text}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 + 0.5 }}
                    >
                      <Button
                        variant="outline"
                        className="w-full h-auto py-4 px-6 text-left justify-start hover:bg-muted/50 hover:border-primary/50 transition-all duration-300"
                        onClick={() => handleSuggestedQuestion(q.text)}
                      >
                        {q.text}
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // Chat messages
            <div 
              ref={scrollContainerRef}
              className={cn(
                "flex-1 overflow-y-auto chat-messages",
                "pb-[calc(80px+env(safe-area-inset-bottom))]"
              )}
              style={{
                height: '100%',
                marginBottom: isPopupOpen ? '0' : undefined,
              }}
            >
              <div className="max-w-3xl mx-auto">
                <AnimatePresence initial={false}>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.timestamp.toISOString()}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ 
                        duration: 0.15, // Faster animation for smoother feel
                        ease: [0.4, 0, 0.2, 1] // Smooth easing
                      }}
                      className={cn(
                        "px-4 py-4",
                        msg.role === "assistant"
                          ? "bg-muted/30"
                          : "bg-background"
                      )}
                    >
                      <div className="flex gap-3">
                        <div className="w-7 h-7 shrink-0 mt-1">
                          {msg.role === "assistant" ? (
                            <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center ring-1 ring-primary/20">
                              <Bot className="w-4 h-4" />
                            </div>
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center">
                              <User className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 space-y-1.5 overflow-hidden min-h-[2rem]">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-xs">
                              {msg.role === "assistant"
                                ? "AI Therapist"
                                : "You"}
                            </p>
                            {msg.metadata?.technique && (
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                {msg.metadata.technique}
                              </Badge>
                            )}
                          </div>
                          <div className="prose prose-sm dark:prose-invert text-sm leading-relaxed">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                          {msg.role === "assistant" && null}
                          {msg.metadata?.goal && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Goal: {msg.metadata.goal}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="py-6 bg-muted/20"
                  >
                    <div className="flex gap-4 max-w-3xl mx-auto px-4">
                      <div className="w-10 h-10 shrink-0">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center ring-1 ring-primary/20">
                          <Bot className="w-6 h-6" />
                        </div>
                      </div>
                      <div className="flex-1 space-y-3">
                        <p className="font-medium text-base">AI Therapist</p>
                        <div className="flex items-center gap-2">
                          <LoadingDots size="sm" color="primary" />
                          <span className="text-sm text-muted-foreground">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Input - Always fixed to viewport bottom, outside overflow containers */}
      <FixedInput
        value={message}
        onChange={setMessage}
        onSend={handleSubmit}
        placeholder={
          isChatPaused
            ? "Complete the activity to continue..."
            : isListening 
              ? "Listening... Speak now"
              : "Type or speak your message..."
        }
        disabled={isTyping || isChatPaused}
        isPopupOpen={isPopupOpen}
        hideFooter={hideFooter}
        onFocusScrollIntoView={() => {
          try {
            // Scroll the container to bottom, not the viewport
            if (scrollContainerRef.current) {
              scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
            }
          } catch {}
        }}
        rightAccessories={(
          <div className="flex items-center gap-1">
            {/* Toggle between typing and voice mode */}
            <Button
              type="button"
              size="icon"
              variant={isVoiceMode ? "default" : "ghost"}
              onClick={() => {
                setIsVoiceMode(!isVoiceMode);
                // If switching to voice mode and voice is supported, start listening
                if (!isVoiceMode && voiceSupported && !isListening) {
                  toggleListening();
                } else if (isVoiceMode && isListening) {
                  // If switching away from voice mode, stop listening
                  toggleListening();
                }
              }}
              disabled={isTyping || isChatPaused || !voiceSupported}
              className={cn(
                "h-[32px] w-[32px] shrink-0",
                "rounded-lg transition-all duration-200",
                isVoiceMode && "bg-primary text-primary-foreground"
              )}
              title={
                !voiceSupported
                  ? "Voice input not supported on this device"
                  : isVoiceMode
                    ? "Switch to typing mode"
                    : "Switch to voice mode"
              }
            >
              {isVoiceMode ? (
                <Mic className="w-3.5 h-3.5" />
              ) : (
                <Keyboard className="w-3.5 h-3.5" />
              )}
            </Button>
            
            {/* Voice input button (only show in voice mode or when listening) */}
            {(isVoiceMode || isListening) && (
              <Button
                type="button"
                size="icon"
                variant={isListening ? "destructive" : "outline"}
                onClick={toggleListening}
                disabled={isTyping || isChatPaused || !voiceSupported}
                className={cn(
                  "h-[32px] w-[32px] shrink-0",
                  "rounded-lg transition-all duration-200",
                  "bg-background border",
                  isListening && "animate-pulse"
                )}
                title={
                  isListening
                    ? "Stop listening"
                    : "Start voice input"
                }
              >
                {isListening ? (
                  <MicOff className="w-3.5 h-3.5" />
                ) : (
                  <Mic className="w-3.5 h-3.5" />
                )}
              </Button>
            )}
          </div>
        )}
      />
    </div>
  );
}


