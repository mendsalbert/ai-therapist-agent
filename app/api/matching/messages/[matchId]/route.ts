import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL || "https://hope-backend-2.onrender.com";

// AI Content Moderation
async function moderateContent(message: string): Promise<{ isAllowed: boolean; reason?: string; severity?: string }> {
  // Simple content moderation rules
  const prohibitedWords = [
    'suicide', 'kill myself', 'end it all', 'hurt myself',
    'personal info', 'phone number', 'address', 'email',
    'meet up', 'meet in person', 'harassment', 'abuse'
  ];
  
  const messageLower = message.toLowerCase();
  
  // Check for prohibited content
  for (const word of prohibitedWords) {
    if (messageLower.includes(word)) {
      const severity = ['suicide', 'kill myself', 'end it all', 'hurt myself'].includes(word) ? 'high' : 'medium';
      return {
        isAllowed: false,
        reason: severity === 'high' ? 'Crisis language detected' : 'Inappropriate content detected',
        severity
      };
    }
  }
  
  // Check message length
  if (message.length > 1000) {
    return {
      isAllowed: false,
      reason: 'Message too long',
      severity: 'low'
    };
  }
  
  return { isAllowed: true };
}

// GET - Retrieve chat history
export async function GET(
  req: NextRequest,
  { params }: { params: { matchId: string } }
) {
  try {
    const { matchId } = params;
    const authHeader = req.headers.get('authorization');
    
    const response = await fetch(`${BACKEND_API_URL}/rescue-pairs/${matchId}/messages`, {
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
      data: data.messages || [],
      matchInfo: data.matchInfo
    });

  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// POST - Send new message
export async function POST(
  req: NextRequest,
  { params }: { params: { matchId: string } }
) {
  try {
    const { matchId } = params;
    const { message, userId } = await req.json();
    
    if (!message || !userId) {
      return NextResponse.json(
        { success: false, error: 'Missing message or userId' },
        { status: 400 }
      );
    }

    // Content moderation
    const moderation = await moderateContent(message);
    
    if (!moderation.isAllowed) {
      // Log the violation for safety review
      console.warn(`Content violation in match ${matchId}:`, {
        userId,
        message: message.substring(0, 100),
        reason: moderation.reason,
        severity: moderation.severity
      });

      // Handle high severity violations (crisis language)
      if (moderation.severity === 'high') {
        // Trigger crisis support escalation
        try {
          await fetch(`${BACKEND_API_URL}/crisis/escalate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId,
              matchId,
              message: message.substring(0, 200),
              reason: 'Crisis language detected in chat',
              severity: 'high',
              timestamp: new Date().toISOString()
            })
          });
        } catch (crisisError) {
          console.error('Failed to escalate to crisis support:', crisisError);
        }

        return NextResponse.json({
          success: false,
          error: 'Your message contains concerning language. Crisis support has been notified and will reach out to you.',
          severity: 'high',
          supportMessage: 'If you\'re in immediate danger, please contact emergency services or a crisis hotline.'
        }, { status: 400 });
      }

      return NextResponse.json({
        success: false,
        error: moderation.reason,
        severity: moderation.severity
      }, { status: 400 });
    }

    const authHeader = req.headers.get('authorization');
    
    // Send message to backend
    const response = await fetch(`${BACKEND_API_URL}/rescue-pairs/${matchId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { Authorization: authHeader }),
      },
      body: JSON.stringify({
        message,
        userId,
        timestamp: new Date().toISOString(),
        moderated: true
      })
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success) {
      // Trigger real-time notification to other participant
      try {
        await fetch(`${BACKEND_API_URL}/notifications/match-message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            matchId,
            senderId: userId,
            messagePreview: message.substring(0, 50),
            timestamp: new Date().toISOString()
          })
        });
      } catch (notificationError) {
        console.error('Failed to send notification:', notificationError);
      }

      return NextResponse.json({
        success: true,
        data: data.message,
        message: 'Message sent successfully'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: data.error || 'Failed to send message'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send message' },
      { status: 500 }
    );
  }
} 