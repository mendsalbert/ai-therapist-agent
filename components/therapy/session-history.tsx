"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  MessageSquare, 
  Clock, 
  Calendar, 
  Search, 
  Plus,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowLeft
} from "lucide-react";
import { backendService } from "@/lib/api/backend-service";
import { useSession } from "@/lib/contexts/session-context";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

interface Session {
  id: string;
  title: string;
  status: "completed" | "in_progress" | "scheduled";
  summary?: string;
  createdAt: string;
  updatedAt: string;
  scheduledTime: Date;
  isActive?: boolean;
  messageCount?: number;
  duration?: number; // in minutes
}

interface SessionHistoryProps {
  params?: { sessionId?: string };
  onNewSession?: () => void;
  onSessionSelect?: (sessionId: string) => void;
}

export function SessionHistory({ params, onNewSession, onSessionSelect }: SessionHistoryProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const { isAuthenticated } = useSession();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && isAuthenticated) {
      loadSessions();
    }
  }, [mounted, isAuthenticated]);

  const loadSessions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await backendService.getChatSessions();
      
      console.log('Chat sessions response:', response);
      
      if (response.success && response.data) {
        console.log('Sessions data:', response.data, 'Count:', response.data.length);
        
        const transformedSessions = response.data
          .map((session: any) => ({
            id: session.id,
            title: session.title || `Session ${new Date(session.startTime || session.createdAt || Date.now()).toLocaleDateString()}`,
            status: session.status || "completed",
            summary: session.summary || session.lastMessage?.content?.substring(0, 100) + "..." || "Chat session",
            createdAt: session.startTime || session.createdAt || new Date().toISOString(),
            updatedAt: session.updatedAt || session.startTime || session.createdAt || new Date().toISOString(),
            scheduledTime: new Date(session.startTime || session.createdAt || Date.now()),
            isActive: session.id === params?.sessionId,
            messageCount: session.messageCount || session.messages?.length || 0,
            duration: session.duration || Math.floor(Math.random() * 30) + 5,
          }))
          .sort((a: Session, b: Session) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        console.log('Transformed sessions:', transformedSessions.length);
        setSessions(transformedSessions);
      } else {
        console.error('Failed response:', response);
        throw new Error(response.error || "Failed to load sessions");
      }
    } catch (error) {
      console.error("Failed to load sessions:", error);
      setError(error instanceof Error ? error.message : "Failed to load sessions");
      toast.error("Failed to load sessions");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewSession = async () => {
    // Check if user is authenticated before creating a new session
    if (!isAuthenticated) {
      toast.error("Please sign in to start a new session");
      router.push('/login');
      return;
    }

    try {
      if (onNewSession) {
        await onNewSession();
      } else {
        // Create a new session via backend
        const response = await backendService.createChatSession();
        
        if (response.success && response.data) {
          const sessionId = response.data.id;
          toast.success("New session created!");
          
          // Navigate to the new session
          router.push(`/therapy/${sessionId}`);
          
          // Reload sessions to show the new one
          loadSessions();
        } else {
          throw new Error(response.error || "Failed to create session");
        }
      }
    } catch (error) {
      console.error("Failed to create new session:", error);
      toast.error("Failed to create new session");
    }
  };

  const handleSessionSelect = (sessionId: string) => {
    if (onSessionSelect) {
      onSessionSelect(sessionId);
    } else {
      router.push(`/therapy/${sessionId}`);
    }
  };

  const getSessionTitle = (session: Session) => {
    return session.title || `Session ${session.scheduledTime.toLocaleDateString()}`;
  };

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         session.summary?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filter === "all" || 
                         (filter === "active" && session.status === "in_progress") ||
                         (filter === "completed" && session.status === "completed");
    
    return matchesSearch && matchesFilter;
  });

  const groupedSessions = filteredSessions.reduce((groups, session) => {
    const date = session.scheduledTime.toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(session);
    return groups;
  }, {} as Record<string, Session[]>);

  const formatGroupDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  if (!mounted) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Session History
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-32">
          <p className="text-muted-foreground text-center">
            Please sign in to view your session history
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/therapy")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>

        <Button
          variant="default"
          className="w-full justify-start gap-2 bg-primary/90 hover:bg-primary"
          onClick={handleNewSession}
        >
          <MessageSquare className="w-4 h-4" />
          New Session
        </Button>
      </div>

      <div className="p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sessions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>

        <div className="flex gap-2">
          {["all", "active", "completed"].map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter(f as typeof filter)}
              className="flex-1 capitalize"
            >
              {f}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-1.5">
        {isLoading ? (
          <LoadingSpinner />
        ) : Object.keys(groupedSessions).length === 0 ? (
          <EmptyState searchQuery={searchQuery} />
        ) : (
          <AnimatePresence>
            {Object.entries(groupedSessions).map(([date, sessions]) => (
              <div key={date} className="mb-4">
                <div className="px-3 py-1 text-xs font-medium text-muted-foreground">
                  {formatGroupDate(date)}
                </div>
                {sessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    onClick={() => handleSessionSelect(session.id)}
                    getSessionTitle={getSessionTitle}
                  />
                ))}
              </div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

// SessionCard component
function SessionCard({
  session,
  onClick,
  getSessionTitle,
}: {
  session: Session;
  onClick: () => void;
  getSessionTitle: (session: Session) => string;
}) {
  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="px-1.5"
    >
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start px-3 py-3 h-auto flex-col items-start gap-0.5 relative",
          "hover:bg-muted/50 rounded-lg my-0.5 transition-all duration-200",
          session.isActive && "bg-primary/5 hover:bg-primary/10"
        )}
        onClick={onClick}
      >
        <div className="flex items-center gap-2 text-sm font-medium">
          <Clock className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            {formatDate(session.scheduledTime)}
          </span>
          {session.status === "in_progress" && (
            <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
              Active
            </span>
          )}
        </div>
        <span className="text-sm font-medium truncate w-full">
          {getSessionTitle(session)}
        </span>
        {session.summary && (
          <div className="text-xs text-muted-foreground line-clamp-1 text-left w-full prose prose-sm dark:prose-invert">
            <ReactMarkdown>{session.summary}</ReactMarkdown>
          </div>
        )}
        {session.isActive && (
          <div className="absolute right-2 top-2.5 w-1.5 h-1.5 rounded-full bg-primary" />
        )}
      </Button>
    </motion.div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
    </div>
  );
}

function EmptyState({ searchQuery }: { searchQuery: string }) {
  return (
    <div className="text-center py-8 text-muted-foreground">
      {searchQuery ? (
        <p>No sessions found matching "{searchQuery}"</p>
      ) : (
        <>
          <p>No sessions yet</p>
          <p className="text-sm">Start a new session to begin</p>
        </>
      )}
    </div>
  );
}
