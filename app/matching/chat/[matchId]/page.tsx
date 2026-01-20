"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Send, 
  Video, 
  VideoOff, 
  Phone, 
  PhoneOff, 
  MoreVertical,
  Flag,
  Shield,
  AlertTriangle,
  Crown
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { backendService } from "@/lib/api/backend-service";
import { useSession } from "@/lib/contexts/session-context";
import { logger } from "@/lib/utils/logger";
import { toast } from "sonner";

interface MatchedMessage {
  id: string;
  role: "user" | "partner";
  content: string;
  timestamp?: string | Date;
}

export default function MatchedChatPage() {
  const { matchId } = useParams() as { matchId: string };
  const { user, userTier } = useSession();
  const [messages, setMessages] = useState<MatchedMessage[]>([]);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const isPremium = userTier === "premium";

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch(`/api/matching/messages/${matchId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        const result = await response.json();
        
        if (result.success && Array.isArray(result.data)) {
          setMessages(result.data as MatchedMessage[]);
        }
      } catch (e) {
        console.error("Failed to load chat history:", e);
      }
    };
    load();
  }, [matchId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = message.trim();
    if (!text || isSending) return;
    setIsSending(true);
    setMessage("");
    const localMsg: MatchedMessage = { 
      id: Date.now().toString(),
      role: "user", 
      content: text, 
      timestamp: new Date() 
    };
    setMessages((prev) => [...prev, localMsg]);
    
    try {
      const response = await fetch(`/api/matching/messages/${matchId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          message: text,
          userId: user?._id
        })
      });

      const result = await response.json();
      
      if (!result.success) {
        // Handle content moderation violations
        if (result.severity === 'high') {
          toast.error(result.error);
          if (result.supportMessage) {
            setTimeout(() => {
              alert(`Important Safety Notice:\n\n${result.supportMessage}`);
            }, 1000);
          }
        } else {
          toast.error(result.error || "Message blocked by safety filters.");
        }
        
        // Remove the message from UI
        setMessages((prev) => prev.filter((m) => m.id !== localMsg.id));
        setMessage(text); // Restore message for editing
      } else {
        toast.success("Message sent with AI safety verification.");
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      // revert on error
      setMessages((prev) => prev.filter((m) => m.id !== localMsg.id));
      setMessage(text);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleReport = async () => {
    try {
      const response = await fetch('/api/safety/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          reporterId: user?._id,
          reportedUserId: matchId,
          reason: "inappropriate_behavior",
          details: "Reported from chat interface",
          evidence: {
            additionalInfo: "User reported via chat safety menu"
          }
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success("User reported. Our safety team will review this promptly.");
      } else {
        toast.error(result.error || "Failed to report user.");
      }
    } catch (error) {
      console.error("Failed to report user:", error);
      toast.error("Failed to report user.");
    }
  };

  const handleBlock = async () => {
    try {
      const response = await fetch('/api/safety/block', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          userId: user?._id,
          blockedUserId: matchId,
          reason: "User blocked via chat interface"
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success("User blocked successfully. Redirecting...");
        setTimeout(() => {
          window.location.href = '/matching';
        }, 2000);
      } else {
        toast.error(result.error || "Failed to block user.");
      }
    } catch (error) {
      console.error("Failed to block user:", error);
      toast.error("Failed to block user.");
    }
  };

  const handleCrisisEscalation = async () => {
    try {
      const response = await fetch('/api/crisis/escalate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          userId: user?._id,
          details: `Crisis escalation from match ${matchId}. User needs immediate support.`,
          context: {
            matchId,
            source: 'chat_interface'
          },
          userLocation: {
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
          }
        })
      });

      const result = await response.json();
      
      if (result.success) {
        const resources = result.data?.crisisResources;
        toast.success("Crisis support has been notified. Help is on the way.");
        
        // Show crisis resources
        if (resources) {
          const actionsText = resources.immediateActions?.join('\n• ') || '';
          alert(`Crisis Support Activated\n\nImmediate Actions:\n• ${actionsText}\n\nHotline: ${resources.hotline?.name} - ${resources.hotline?.number}`);
        }
      } else {
        toast.error(result.error || "Failed to contact crisis support.");
        
        // Show fallback crisis resources
        if (result.crisisResources) {
          const hotline = result.crisisResources.hotline;
          alert(`Crisis Resources Available\n\nEmergency: Call local emergency services\nCrisis Hotline: ${hotline?.name} - ${hotline?.number}`);
        }
      }
    } catch (error) {
      console.error("Failed to escalate to crisis support:", error);
      toast.error("Failed to contact crisis support. Please call emergency services if in immediate danger.");
    }
  };

  const handleVideoCall = async () => {
    if (!isPremium) {
      toast.error("Video calls are available for Premium users only.");
      return;
    }

    try {
      if (!isInCall) {
        const response = await fetch('/api/video/initiate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            matchId,
            userId: user?._id,
            participantId: matchId // In real implementation, get actual participant ID
          })
        });

        const result = await response.json();
        
        if (result.success) {
          setIsInCall(true);
          setIsVideoCall(true);
          toast.success("Video call initiated! Waiting for participant to join.");
          
          // In a real implementation, initialize WebRTC here
          logger.debug('WebRTC signaling data:', result.data?.signaling);
        } else {
          if (result.requiresPremium) {
            toast.error("Video calls require Premium subscription.");
          } else {
            toast.error(result.error || "Failed to start video call.");
          }
        }
      } else {
        setIsInCall(false);
        setIsVideoCall(false);
        toast.info("Video call ended.");
      }
    } catch (error) {
      console.error("Failed to initiate video call:", error);
      toast.error("Failed to start video call.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <Card className="h-[calc(100vh-8rem)]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-2">
            <CardTitle>Support Match Chat</CardTitle>
            {isPremium && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Crown className="w-3 h-3" />
                Premium
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {/* Video Call Button - Premium Only */}
            <Button
              variant={isInCall ? "destructive" : "outline"}
              size="sm"
              onClick={handleVideoCall}
              disabled={!isPremium}
              title={!isPremium ? "Video calls are Premium only" : isInCall ? "End video call" : "Start video call"}
            >
              {isInCall ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
            </Button>

            {/* Safety Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleReport}>
                  <Flag className="w-4 h-4 mr-2" />
                  Report User
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleBlock}>
                  <Shield className="w-4 h-4 mr-2" />
                  Block User
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCrisisEscalation} className="text-red-600">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Crisis Support
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col h-full p-0">
          {/* Video Call Area */}
          {isVideoCall && (
            <div className="bg-gray-900 h-48 flex items-center justify-center text-white mb-4">
              <div className="text-center">
                <Video className="w-8 h-8 mx-auto mb-2" />
                <p>Video call in progress...</p>
                <p className="text-sm text-gray-300">Premium feature</p>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <p>Start a conversation with your support match!</p>
                <p className="text-sm mt-2">Remember: Be respectful and supportive.</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    {msg.timestamp && (
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div className="border-t p-4">
            <form onSubmit={handleSend} className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isSending}
              />
              <Button type="submit" disabled={isSending || !message.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
            
            {/* Safety Notice */}
            <p className="text-xs text-muted-foreground mt-2 text-center">
              All messages are monitored for safety. Report inappropriate behavior immediately.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


