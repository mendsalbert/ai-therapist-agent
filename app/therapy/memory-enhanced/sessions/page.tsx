"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Bot,
  MessageSquare,
  PlusCircle,
  Clock,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  createChatSession,
  getAllChatSessions,
  ChatSession,
} from "@/lib/api/chat";
import { formatDistanceToNow } from "date-fns";
import { logger } from "@/lib/utils/logger";
import { useSession } from "@/lib/contexts/session-context";
import { toast } from "sonner";

export default function MemoryEnhancedSessionsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useSession();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // Load all sessions
  useEffect(() => {
    const loadSessions = async () => {
      try {
        setIsLoading(true);
        const allSessions = await getAllChatSessions();
        setSessions(allSessions);
      } catch (error) {
        logger.error("Failed to load sessions", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSessions();
  }, []);

  const handleNewSession = async () => {
    // Check if user is authenticated before creating a new session
    if (!isAuthenticated) {
      toast.error("Please sign in to start a new session");
      router.push('/login');
      return;
    }

    try {
      setIsCreating(true);
      const newSessionId = await createChatSession();
      logger.debug("New memory-enhanced session created", { sessionId: newSessionId });
      
      // Store in localStorage for memory-enhanced mode
      if (typeof window !== 'undefined') {
        localStorage.setItem('memoryEnhancedSessionId', newSessionId);
      }
      
      // Navigate to the memory-enhanced chat
      router.push(`/therapy/memory-enhanced`);
    } catch (error) {
      logger.error("Failed to create new session", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleSessionClick = (sessionId: string) => {
    // Store in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('memoryEnhancedSessionId', sessionId);
    }
    router.push(`/therapy/memory-enhanced`);
  };

  // Show content immediately, sessions load in background

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto pt-20 px-4 pb-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 text-primary flex items-center justify-center ring-2 ring-primary/20 shadow-lg mx-auto mb-4">
            <Sparkles className="w-8 h-8" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <h1 className="text-3xl font-bold">Memory-Enhanced Chat</h1>
            <Badge variant="secondary" className="text-xs">Premium</Badge>
          </div>
          <p className="text-muted-foreground">
            AI remembers your conversations, journals, and mood patterns
          </p>
        </div>

        {/* New Session Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <Card
            className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 border-primary/20 hover:border-primary/40 bg-gradient-to-br from-primary/5 to-primary/10"
            onClick={handleNewSession}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  {isCreating ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <PlusCircle className="w-6 h-6" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1 flex items-center gap-2">
                    New Session
                    <Sparkles className="w-4 h-4 text-primary" />
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Start a new conversation with full context and memory
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Previous Sessions */}
        {isLoading ? (
          <div className="text-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
            <p className="text-sm text-muted-foreground">Loading sessions...</p>
          </div>
        ) : sessions.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Recent Sessions
            </h2>

            <div className="grid gap-4">
              {sessions.map((session, index) => (
                <motion.div
                  key={session.sessionId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-primary/40"
                    onClick={() => handleSessionClick(session.sessionId)}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shrink-0">
                          <MessageSquare className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold mb-1 truncate">
                            {session.messages[0]?.content.slice(0, 60) || "New Chat"}
                            {(session.messages[0]?.content?.length || 0) > 60 && "..."}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {session.messages[session.messages.length - 1]?.content ||
                              "No messages yet"}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-3 h-3" />
                              {session.messages.length} messages
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {(() => {
                                try {
                                  const date = new Date(session.updatedAt);
                                  if (isNaN(date.getTime())) return "Just now";
                                  return formatDistanceToNow(date, { addSuffix: true });
                                } catch {
                                  return "Just now";
                                }
                              })()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-10 h-10 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground mb-2">No previous sessions</p>
            <p className="text-sm text-muted-foreground">
              Start your first memory-enhanced conversation above
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

