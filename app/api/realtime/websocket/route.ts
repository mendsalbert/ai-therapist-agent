import { NextRequest, NextResponse } from 'next/server';

// WebSocket connection management
const connections = new Map<string, WebSocket>();
const userConnections = new Map<string, Set<string>>();

interface WebSocketMessage {
  type: 'message' | 'typing' | 'video_call' | 'notification' | 'status';
  data: any;
  userId: string;
  matchId?: string;
  timestamp: string;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const matchId = searchParams.get('matchId');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    // For now, return WebSocket connection info
    // In a real implementation, this would upgrade to WebSocket
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || process.env.BACKEND_API_URL || 'http://localhost:3001';
    const WS_URL = BACKEND_URL.replace('https://', 'wss://').replace('http://', 'ws://');
    
    return NextResponse.json({
      success: true,
      data: {
        websocketUrl: `${WS_URL}/ws?userId=${userId}&matchId=${matchId}`,
        connectionId: `${userId}_${Date.now()}`,
        supportedEvents: [
          'message',
          'typing',
          'video_call_invite',
          'video_call_answer',
          'video_call_end',
          'user_status',
          'match_notification'
        ]
      },
      message: 'WebSocket connection info provided'
    });

  } catch (error) {
    console.error('Error getting WebSocket info:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get WebSocket connection info' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { type, data, userId, matchId } = await req.json();
    
    if (!type || !userId) {
      return NextResponse.json(
        { success: false, error: 'Missing type or userId' },
        { status: 400 }
      );
    }

    const message: WebSocketMessage = {
      type,
      data,
      userId,
      matchId,
      timestamp: new Date().toISOString()
    };

    // Handle different message types
    switch (type) {
      case 'message':
        // Broadcast message to match participants
        if (matchId) {
          await broadcastToMatch(matchId, message);
        }
        break;
        
      case 'typing':
        // Send typing indicator to match participants
        if (matchId) {
          await broadcastToMatch(matchId, message, [userId]); // Exclude sender
        }
        break;
        
      case 'video_call':
        // Handle video call signaling
        if (matchId && data.targetUserId) {
          await sendToUser(data.targetUserId, message);
        }
        break;
        
      case 'status':
        // Update user online status
        await updateUserStatus(userId, data.status);
        break;
    }

    return NextResponse.json({
      success: true,
      message: 'Real-time message processed'
    });

  } catch (error) {
    console.error('Error processing real-time message:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process real-time message' },
      { status: 500 }
    );
  }
}

// Helper functions for WebSocket management
async function broadcastToMatch(matchId: string, message: WebSocketMessage, excludeUsers: string[] = []) {
  try {
    // In a real implementation, this would send to WebSocket connections
    // For now, we'll use Server-Sent Events or polling as fallback
    
    const BACKEND_API_URL = process.env.BACKEND_API_URL || "https://hope-backend-2.onrender.com";
    
    await fetch(`${BACKEND_API_URL}/realtime/broadcast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        matchId,
        message,
        excludeUsers,
        timestamp: new Date().toISOString()
      })
    });
  } catch (error) {
    console.error('Failed to broadcast to match:', error);
  }
}

async function sendToUser(userId: string, message: WebSocketMessage) {
  try {
    const BACKEND_API_URL = process.env.BACKEND_API_URL || "https://hope-backend-2.onrender.com";
    
    await fetch(`${BACKEND_API_URL}/realtime/send-to-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        message,
        timestamp: new Date().toISOString()
      })
    });
  } catch (error) {
    console.error('Failed to send to user:', error);
  }
}

async function updateUserStatus(userId: string, status: string) {
  try {
    const BACKEND_API_URL = process.env.BACKEND_API_URL || "https://hope-backend-2.onrender.com";
    
    await fetch(`${BACKEND_API_URL}/users/${userId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status,
        lastActive: new Date().toISOString()
      })
    });
  } catch (error) {
    console.error('Failed to update user status:', error);
  }
} 