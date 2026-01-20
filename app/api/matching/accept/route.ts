import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL || "https://hope-backend-2.onrender.com";

export async function POST(req: NextRequest) {
  try {
    const { matchId, userId } = await req.json();
    
    if (!matchId || !userId) {
      return NextResponse.json(
        { success: false, error: 'Missing matchId or userId' },
        { status: 400 }
      );
    }

    // Get auth token from request
    const authHeader = req.headers.get('authorization');
    
    // Call backend to accept the match
    const response = await fetch(`${BACKEND_API_URL}/rescue-pairs/accept`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { Authorization: authHeader }),
      },
      body: JSON.stringify({
        matchId,
        userId,
        acceptedAt: new Date().toISOString()
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Backend error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (data.success) {
      // Create initial chat session for the match
      try {
        const chatResponse = await fetch(`${BACKEND_API_URL}/rescue-pairs/${matchId}/chat/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(authHeader && { Authorization: authHeader }),
          },
          body: JSON.stringify({
            participants: [userId, matchId],
            createdAt: new Date().toISOString()
          })
        });

        if (chatResponse.ok) {
          const chatData = await chatResponse.json();
          return NextResponse.json({
            success: true,
            data: {
              match: data.data,
              chatId: chatData.chatId
            },
            message: 'Match accepted successfully! You can now start chatting.'
          });
        }
      } catch (chatError) {
        console.error('Failed to create chat session:', chatError);
        // Still return success for match acceptance even if chat creation fails
      }

      return NextResponse.json({
        success: true,
        data: data.data,
        message: 'Match accepted successfully!'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: data.error || 'Failed to accept match'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error accepting match:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to accept match. Please try again.' 
      },
      { status: 500 }
    );
  }
} 