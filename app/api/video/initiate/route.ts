import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL || "https://hope-backend-2.onrender.com";

interface VideoCallSession {
  callId: string;
  matchId: string;
  initiatorId: string;
  participantId: string;
  status: 'initiated' | 'ringing' | 'active' | 'ended';
  startedAt?: Date;
  endedAt?: Date;
  duration?: number;
}

export async function POST(req: NextRequest) {
  try {
    const { matchId, userId, participantId } = await req.json();
    
    if (!matchId || !userId || !participantId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: matchId, userId, participantId' },
        { status: 400 }
      );
    }

    const authHeader = req.headers.get('authorization');
    
    // Check if user has premium access
    const subscriptionResponse = await fetch(`${BACKEND_API_URL}/subscription/status?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { Authorization: authHeader }),
      }
    });

    if (subscriptionResponse.ok) {
      const subData = await subscriptionResponse.json();
      if (!subData.success || !subData.data?.isActive) {
        return NextResponse.json({
          success: false,
          error: 'Video calls are available for Premium users only. Please upgrade your plan.',
          requiresPremium: true
        }, { status: 403 });
      }
    }

    // Create video call session
    const callResponse = await fetch(`${BACKEND_API_URL}/video-calls/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { Authorization: authHeader }),
      },
      body: JSON.stringify({
        matchId,
        initiatorId: userId,
        participantId,
        type: 'peer_support',
        maxDuration: 60, // 60 minutes max
        timestamp: new Date().toISOString()
      })
    });

    if (!callResponse.ok) {
      throw new Error(`Failed to create video call: ${callResponse.status}`);
    }

    const callData = await callResponse.json();
    
    if (callData.success) {
      // Generate WebRTC signaling data (simplified)
      const signalingData = {
        callId: callData.callId,
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ],
        roomId: `match_${matchId}_${callData.callId}`,
        initiator: userId,
        participant: participantId
      };

      // Notify the other participant
      try {
        await fetch(`${BACKEND_API_URL}/notifications/video-call-invite`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            callId: callData.callId,
            fromUserId: userId,
            toUserId: participantId,
            matchId,
            timestamp: new Date().toISOString()
          })
        });
      } catch (notificationError) {
        console.error('Failed to send video call notification:', notificationError);
      }

      return NextResponse.json({
        success: true,
        data: {
          callId: callData.callId,
          signaling: signalingData,
          status: 'initiated'
        },
        message: 'Video call initiated. Waiting for participant to join.'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: callData.error || 'Failed to initiate video call'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error initiating video call:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to initiate video call' },
      { status: 500 }
    );
  }
}

// GET - Get video call status
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const callId = searchParams.get('callId');
    
    if (!callId) {
      return NextResponse.json(
        { success: false, error: 'Missing callId parameter' },
        { status: 400 }
      );
    }

    const authHeader = req.headers.get('authorization');
    
    const response = await fetch(`${BACKEND_API_URL}/video-calls/${callId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { Authorization: authHeader }),
      }
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      data: data.call
    });

  } catch (error) {
    console.error('Error fetching video call status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch call status' },
      { status: 500 }
    );
  }
} 