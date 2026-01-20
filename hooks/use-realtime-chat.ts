import { useState, useEffect, useRef, useCallback } from 'react';

interface RealtimeMessage {
  id: string;
  type: 'message' | 'typing' | 'status' | 'video_call';
  data: any;
  userId: string;
  matchId?: string;
  timestamp: string;
}

interface UseRealtimeChatOptions {
  matchId: string;
  userId: string;
  onMessage?: (message: any) => void;
  onTyping?: (isTyping: boolean, userId: string) => void;
  onVideoCall?: (callData: any) => void;
  onUserStatus?: (status: string, userId: string) => void;
}

export function useRealtimeChat({
  matchId,
  userId,
  onMessage,
  onTyping,
  onVideoCall,
  onUserStatus
}: UseRealtimeChatOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastMessageTimestamp = useRef<string>(new Date().toISOString());

  // Polling-based real-time simulation (fallback for WebSocket)
  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) return;

    pollingIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(`/api/realtime/poll?matchId=${matchId}&userId=${userId}&since=${lastMessageTimestamp.current}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          const result = await response.json();
          
          if (result.success && result.data?.length > 0) {
            result.data.forEach((msg: RealtimeMessage) => {
              switch (msg.type) {
                case 'message':
                  onMessage?.(msg.data);
                  break;
                case 'typing':
                  onTyping?.(msg.data.isTyping, msg.userId);
                  break;
                case 'video_call':
                  onVideoCall?.(msg.data);
                  break;
                case 'status':
                  onUserStatus?.(msg.data.status, msg.userId);
                  break;
              }
              
              lastMessageTimestamp.current = msg.timestamp;
            });
          }
          
          setIsConnected(true);
          setConnectionError(null);
        }
      } catch (error) {
        console.error('Polling error:', error);
        setConnectionError('Connection lost');
        setIsConnected(false);
      }
    }, 2000); // Poll every 2 seconds
  }, [matchId, userId, onMessage, onTyping, onVideoCall, onUserStatus]);

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  // Send real-time message
  const sendRealtimeMessage = useCallback(async (type: string, data: any) => {
    try {
      const response = await fetch('/api/realtime/websocket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          type,
          data,
          userId,
          matchId
        })
      });

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Failed to send real-time message:', error);
      return false;
    }
  }, [userId, matchId]);

  // Send typing indicator
  const sendTyping = useCallback((isTyping: boolean) => {
    sendRealtimeMessage('typing', { isTyping });
  }, [sendRealtimeMessage]);

  // Send status update
  const sendStatus = useCallback((status: 'online' | 'away' | 'offline') => {
    sendRealtimeMessage('status', { status });
  }, [sendRealtimeMessage]);

  // Initialize connection
  useEffect(() => {
    if (matchId && userId) {
      startPolling();
      sendStatus('online');
    }

    return () => {
      stopPolling();
      sendStatus('offline');
    };
  }, [matchId, userId, startPolling, stopPolling, sendStatus]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  return {
    isConnected,
    connectionError,
    sendTyping,
    sendStatus,
    sendRealtimeMessage
  };
} 