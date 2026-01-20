"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Brain, 
  Heart, 
  Lightbulb,
  TrendingUp,
  Calendar,
  BookOpen,
  Activity,
  AlertCircle,
  Target,
  Zap,
  Crown,
  CheckCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { userMemoryManager, UserMemory } from "@/lib/memory/user-memory";
import { LoadingDots } from "@/components/ui/loading-dots";

interface MemoryEnhancedChatProps {
  sessionId: string;
  userId: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  context?: {
    mood?: number;
    themes?: string[];
    insights?: string[];
    isRateLimit?: boolean;
    isFailover?: boolean;
    isError?: boolean;
    // CBT fields
    cbtInsights?: {
      cognitiveDistortions?: string[];
      challengingQuestions?: string[];
      balancedSuggestions?: string[];
      copingStrategies?: string[];
    };
    isCBTTriggered?: boolean;
  };
}

export function MemoryEnhancedChat({ sessionId, userId }: MemoryEnhancedChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [userMemory, setUserMemory] = useState<UserMemory | null>(null);
  const [showContext, setShowContext] = useState(false);
  const [userTier, setUserTier] = useState<'free' | 'premium'>('free');
  const [cbtSuggestions, setCbtSuggestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadUserMemory();
  }, [userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadUserMemory = async () => {
    try {
      const memory = await userMemoryManager.loadUserMemory(userId);
      setUserMemory(memory);
    } catch (error) {
      console.error("Failed to load user memory:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // CBT detection and enhancement
  const detectCBTTriggers = (message: string): boolean => {
    const cbtKeywords = [
      'always', 'never', 'all', 'none', 'terrible', 'awful', 'disaster',
      'should', 'must', 'have to', 'my fault', 'because of me', 'i caused',
      'they think', 'they believe', 'will never', 'will always', 'obviously',
      'clearly', 'i am', 'you are', 'they are', 'huge', 'tiny', 'massive'
    ];
    
    const lowerMessage = message.toLowerCase();
    return cbtKeywords.some(keyword => lowerMessage.includes(keyword));
  };

  const getCBTSuggestions = async (message: string): Promise<string[]> => {
    if (userTier !== 'premium') return [];
    
    try {
      const response = await fetch('/api/cbt/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          text: message,
          type: 'general_insights'
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.data?.copingStrategies || [];
      }
    } catch (error) {
      console.error('Failed to get CBT suggestions:', error);
    }
    
    return [];
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isTyping) return;

    // Detect CBT triggers
    const hasCBTTriggers = detectCBTTriggers(inputMessage);
    const cbtSuggestions = hasCBTTriggers ? await getCBTSuggestions(inputMessage) : [];

    const userMessage: ChatMessage = {
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
      context: {
        mood: userMemory?.moodPatterns[userMemory.moodPatterns.length - 1]?.mood || 3,
        themes: extractThemes(inputMessage),
        isCBTTriggered: hasCBTTriggers,
        cbtInsights: hasCBTTriggers ? {
          copingStrategies: cbtSuggestions
        } : undefined
      }
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    // Create placeholder message for streaming
    const placeholderIndex = messages.length;
    let streamingContent = '';
    const assistantMessage: ChatMessage = {
      role: "assistant",
      content: "",
      timestamp: new Date(),
      context: {}
    };
    setMessages(prev => [...prev, assistantMessage]);

    try {
      // Get therapy context from memory
      const therapyContext = userMemoryManager.getTherapyContext();
      const therapySuggestions = userMemoryManager.getTherapySuggestions();

      // Send to backend with memory context
      const { backendService } = await import("@/lib/api/backend-service");
      const userMemory = await userMemoryManager.loadUserMemory(userId);

      const memoryRequest = {
        message: inputMessage,
        sessionId,
        userId,
        context: therapyContext,
        suggestions: therapySuggestions,
        userMemory: {
          journalEntries: userMemory.journalEntries.slice(-5),
          meditationHistory: userMemory.meditationHistory.slice(-3),
          moodPatterns: userMemory.moodPatterns.slice(-7),
          insights: userMemory.insights.slice(-3),
          profile: userMemory.profile
        },
        conversation: messages.map(msg => ({ role: msg.role, content: msg.content }))
      };

      // Use streaming API
      const response = await backendService.sendMemoryEnhancedMessageStream(
        memoryRequest,
        (chunk: string) => {
          // Update message as chunks arrive
          streamingContent += chunk;
          setMessages(prev => {
            const updated = [...prev];
            updated[placeholderIndex + 1] = {
              ...updated[placeholderIndex + 1],
              content: streamingContent,
            };
            return updated;
          });
          scrollToBottom();
        }
      );
      
      if (!response.success) {
        // Handle rate limiting specifically
        if (response.error?.includes('Rate limit exceeded')) {
          setMessages(prev => {
            const updated = [...prev];
            updated[placeholderIndex + 1] = {
              role: "assistant",
              content: "I understand you'd like to continue our conversation. To ensure quality responses, please wait a moment before sending your next message. In the meantime, take a deep breath and know that I'm here to support you.",
              timestamp: new Date(),
              context: {
                isRateLimit: true
              }
            };
            return updated;
          });
          setIsTyping(false);
          return;
        }
        throw new Error(response.error || 'Failed to get AI response');
      }

      const aiResponse = response.data!;

      // Update final message with complete response and metadata
      setMessages(prev => {
        const updated = [...prev];
        updated[placeholderIndex + 1] = {
          role: "assistant",
          content: aiResponse.response || streamingContent,
          timestamp: new Date(),
          context: {
            insights: aiResponse.insights,
            isFailover: aiResponse.isFailover || false
          }
        };
        return updated;
      });

      // Update user memory with this therapy session (only if not a failover response)
      if (!aiResponse.isFailover) {
        await userMemoryManager.addTherapySession({
          date: new Date(),
          topics: extractThemes(inputMessage),
          techniques: aiResponse.techniques || [],
          breakthroughs: aiResponse.breakthroughs || [],
          concerns: extractConcerns(inputMessage),
          goals: [],
          mood: userMessage.context?.mood || 3,
          summary: `Discussed: ${extractThemes(inputMessage).join(', ')}`
        });

        // Reload memory to get updated insights
        await loadUserMemory();
      }

    } catch (error) {
      console.error("Error sending message:", error);
      
      // Provide context-aware error message
      const errorMessage = error instanceof Error && error.message.includes('Rate limit') 
        ? "I'm receiving a lot of requests right now. Please wait a moment before trying again. Your mental health is important, and I want to give you my full attention."
        : "I'm experiencing some technical difficulties right now, but I want you to know that I'm here to support you. Your thoughts and feelings are important. Please try again in a moment, and if the issue persists, consider reaching out to a mental health professional for immediate support.";

      setMessages(prev => [...prev, {
        role: "assistant",
        content: errorMessage,
        timestamp: new Date(),
        context: {
          isError: true
        }
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  // Starter prompt click handler
  const handlePromptClick = async (prompt: string) => {
    if (isTyping) return;
    setInputMessage(prompt);
    // Wait for state update, then send
    setTimeout(() => handleSendMessagePrompt(prompt), 0);
  };

  // Helper to send a specific prompt text (separate from the inputMessage state to avoid race conditions)
  const handleSendMessagePrompt = async (promptMsg: string) => {
    if (!promptMsg.trim() || isTyping) return;

    // Detect CBT triggers
    const hasCBTTriggers = detectCBTTriggers(promptMsg);
    const cbtSuggestions = hasCBTTriggers ? await getCBTSuggestions(promptMsg) : [];

    const userMessage: ChatMessage = {
      role: "user",
      content: promptMsg,
      timestamp: new Date(),
      context: {
        mood: userMemory?.moodPatterns[userMemory.moodPatterns.length - 1]?.mood || 3,
        themes: extractThemes(promptMsg),
        isCBTTriggered: hasCBTTriggers,
        cbtInsights: hasCBTTriggers ? { copingStrategies: cbtSuggestions } : undefined,
      }
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    // Create placeholder message for streaming
    const placeholderIndex = messages.length;
    let streamingContent = '';
    const assistantMsg: ChatMessage = {
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, assistantMsg]);

    try {
      const therapyContext = userMemoryManager.getTherapyContext();
      const therapySuggestions = userMemoryManager.getTherapySuggestions();
      const { backendService } = await import("@/lib/api/backend-service");
      const userMemoryReal = await userMemoryManager.loadUserMemory(userId);
      const memoryRequest = {
        message: promptMsg,
        sessionId,
        userId,
        context: therapyContext,
        suggestions: therapySuggestions,
        userMemory: {
          journalEntries: userMemoryReal.journalEntries.slice(-5),
          meditationHistory: userMemoryReal.meditationHistory.slice(-3),
          moodPatterns: userMemoryReal.moodPatterns.slice(-7),
          insights: userMemoryReal.insights.slice(-3),
          profile: userMemoryReal.profile,
        },
        conversation: messages.map(msg => ({ role: msg.role, content: msg.content }))
      };
      
      // Use streaming API
      const response = await backendService.sendMemoryEnhancedMessageStream(
        memoryRequest,
        (chunk: string) => {
          // Update message as chunks arrive
          streamingContent += chunk;
          setMessages(prev => {
            const updated = [...prev];
            updated[placeholderIndex + 1] = {
              ...updated[placeholderIndex + 1],
              content: streamingContent,
            };
            return updated;
          });
          scrollToBottom();
        }
      );
      
      if (!response.success) throw new Error(response.error || "Unknown error");
      
      // Update final message with complete response
      setMessages(prev => {
        const updated = [...prev];
        updated[placeholderIndex + 1] = {
          role: "assistant",
          content: response.data?.response || streamingContent,
          timestamp: new Date(),
        };
        return updated;
      });
    } catch (error) {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I ran into a problem answering that.", timestamp: new Date() }]);
      console.error("Failed to get AI response:", error);
    } finally {
      setIsTyping(false);
    }
  };


  const extractThemes = (text: string): string[] => {
    const themes = [];
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('work') || lowerText.includes('job')) themes.push('work');
    if (lowerText.includes('relationship') || lowerText.includes('partner')) themes.push('relationships');
    if (lowerText.includes('anxiety') || lowerText.includes('worried')) themes.push('anxiety');
    if (lowerText.includes('depression') || lowerText.includes('sad')) themes.push('depression');
    if (lowerText.includes('sleep')) themes.push('sleep');
    if (lowerText.includes('health')) themes.push('health');
    
    return themes;
  };

  const extractConcerns = (text: string): string[] => {
    const concerns = [];
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('worried') || lowerText.includes('concerned')) concerns.push('worry');
    if (lowerText.includes('stressed') || lowerText.includes('overwhelmed')) concerns.push('stress');
    if (lowerText.includes('lonely') || lowerText.includes('isolated')) concerns.push('loneliness');
    
    return concerns;
  };

  const getMemoryInsights = () => {
    if (!userMemory) return [];

    const insights = [];
    
    if (userMemory.insights.length > 0) {
      insights.push({
        icon: Lightbulb,
        title: "Recent Insights",
        content: userMemory.insights.slice(-2).map(i => i.content).join(", "),
        color: "text-yellow-500"
      });
    }

    if (userMemory.journalEntries.length > 0) {
      const recentMood = userMemory.moodPatterns[userMemory.moodPatterns.length - 1]?.mood;
      if (recentMood) {
        insights.push({
          icon: Heart,
          title: "Current Mood",
          content: `${recentMood}/6 - ${recentMood <= 2 ? 'Low' : recentMood <= 4 ? 'Neutral' : 'Good'}`,
          color: recentMood <= 2 ? "text-red-500" : recentMood <= 4 ? "text-yellow-500" : "text-green-500"
        });
      }
    }

    if (userMemory.meditationHistory.length > 0) {
      const recentMeditation = userMemory.meditationHistory[userMemory.meditationHistory.length - 1];
      insights.push({
        icon: Activity,
        title: "Recent Meditation",
        content: `${recentMeditation.type} (${Math.round(recentMeditation.effectiveness * 100)}% effective)`,
        color: "text-blue-500"
      });
    }

    return insights;
  };

  const STARTER_PROMPTS = [
    "I feel stressed — help me calm down.",
    "I just want to talk about how I feel.",
    "Give me a quick self-reflection question.",
    "I need some motivation today.",
    "Guide me through a short meditation."
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Memory Context Panel */}
      {showContext && userMemory && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="border-b bg-muted/30 p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Brain className="w-4 h-4 text-primary" />
              Your Mental Health Context
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowContext(false)}
            >
              Hide
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {getMemoryInsights().map((insight, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <insight.icon className={`w-4 h-4 ${insight.color}`} />
                <div>
                  <div className="font-medium">{insight.title}</div>
                  <div className="text-muted-foreground">{insight.content}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <Brain className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">AI Therapist with Memory</h3>
            <p className="text-muted-foreground mb-4">
              I remember our conversations, your journal entries, and meditation sessions to provide personalized support.
            </p>
            <Button
              variant="outline"
              onClick={() => setShowContext(true)}
            >
              <Brain className="w-4 h-4 mr-2" />
              Show My Context
            </Button>
          </div>
        )}

        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`flex gap-3 max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === "assistant" 
                    ? "bg-primary/10 text-primary" 
                    : "bg-secondary text-secondary-foreground"
                }`}>
                  {message.role === "assistant" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>
                
                <div className={`rounded-lg p-3 ${
                  message.role === "assistant" 
                    ? "bg-muted/50" 
                    : "bg-primary text-primary-foreground"
                }`}>
                  <div className="prose prose-sm dark:prose-invert">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                  
                  {message.context && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {message.context.mood && (
                        <Badge variant="secondary" className="text-xs">
                          Mood: {message.context.mood}/6
                        </Badge>
                      )}
                      {message.context.themes?.map(theme => (
                        <Badge key={theme} variant="outline" className="text-xs">
                          {theme}
                        </Badge>
                      ))}
                      {message.context.insights?.map(insight => (
                        <Badge key={insight} variant="secondary" className="text-xs">
                          <Lightbulb className="w-3 h-3 mr-1" />
                          {insight}
                        </Badge>
                      ))}
                      {message.context.isRateLimit && (
                        <Badge variant="secondary" className="text-xs">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Rate Limited
                        </Badge>
                      )}
                      {message.context.isFailover && (
                        <Badge variant="secondary" className="text-xs">
                          <BookOpen className="w-3 h-3 mr-1" />
                          Fallback Response
                        </Badge>
                      )}
                      {message.context.isError && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Error
                        </Badge>
                      )}
                    </div>
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
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <LoadingDots size="sm" color="primary" />
                <span className="text-sm text-muted-foreground">AI is thinking...</span>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t p-4">
        <div className="flex flex-wrap gap-2 mb-4">
          {messages.length === 0 && STARTER_PROMPTS.map((prompt, idx) => (
            <Button
              key={idx}
              variant="outline"
              size="sm"
              className="rounded-full text-xs"
              onClick={() => handlePromptClick(prompt)}
            >
              {prompt}
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Share what's on your mind..."
            className="flex-1 p-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
            disabled={isTyping}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className={cn(
              "px-6 transition-all duration-200",
              isTyping && "h-8 w-8 p-0" // Smaller box when waiting
            )}
          >
            {isTyping ? (
              <div className="w-3 h-3 bg-primary-foreground/60 rounded-sm" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        
        {!showContext && (
          <div className="mt-2 flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowContext(true)}
              className="text-xs"
            >
              <Brain className="w-3 h-3 mr-1" />
              Show My Mental Health Context
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
