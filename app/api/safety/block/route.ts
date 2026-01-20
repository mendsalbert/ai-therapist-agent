import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL || "https://hope-backend-2.onrender.com";

export async function POST(req: NextRequest) {
  try {
    const { userId, blockedUserId, reason } = await req.json();
    
    if (!userId || !blockedUserId) {
      return NextResponse.json(
        { success: false, error: 'Missing userId or blockedUserId' },
        { status: 400 }
      );
    }

    // Prevent self-blocking
    if (userId === blockedUserId) {
      return NextResponse.json(
        { success: false, error: 'Cannot block yourself' },
        { status: 400 }
      );
    }

    const authHeader = req.headers.get('authorization');
    
    // Block user in backend
    const response = await fetch(`${BACKEND_API_URL}/safety/block`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { Authorization: authHeader }),
      },
      body: JSON.stringify({
        userId,
        blockedUserId,
        reason: reason || 'User blocked',
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success) {
      // End any active matches between these users
      try {
        await fetch(`${BACKEND_API_URL}/rescue-pairs/end-match`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(authHeader && { Authorization: authHeader }),
          },
          body: JSON.stringify({
            user1Id: userId,
            user2Id: blockedUserId,
            reason: 'User blocked',
            endedBy: userId
          })
        });
      } catch (matchError) {
        console.error('Failed to end match after blocking:', matchError);
      }

      return NextResponse.json({
        success: true,
        message: 'User blocked successfully. You will no longer see them in matches or receive messages from them.'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: data.error || 'Failed to block user'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error blocking user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to block user' },
      { status: 500 }
    );
  }
}

// GET - Get list of blocked users
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    const authHeader = req.headers.get('authorization');
    
    const response = await fetch(`${BACKEND_API_URL}/safety/blocked?userId=${userId}`, {
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
      data: data.blockedUsers || []
    });

  } catch (error) {
    console.error('Error fetching blocked users:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch blocked users' },
      { status: 500 }
    );
  }
}

// DELETE - Unblock user
export async function DELETE(req: NextRequest) {
  try {
    const { userId, blockedUserId } = await req.json();
    
    if (!userId || !blockedUserId) {
      return NextResponse.json(
        { success: false, error: 'Missing userId or blockedUserId' },
        { status: 400 }
      );
    }

    const authHeader = req.headers.get('authorization');
    
    const response = await fetch(`${BACKEND_API_URL}/safety/unblock`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { Authorization: authHeader }),
      },
      body: JSON.stringify({
        userId,
        blockedUserId,
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success) {
      return NextResponse.json({
        success: true,
        message: 'User unblocked successfully.'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: data.error || 'Failed to unblock user'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error unblocking user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to unblock user' },
      { status: 500 }
    );
  }
} 