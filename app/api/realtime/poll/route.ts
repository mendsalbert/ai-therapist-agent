import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL || "https://hope-backend-2.onrender.com";

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const matchId = searchParams.get('matchId');
    const userId = searchParams.get('userId');
    const since = searchParams.get('since');
    
    if (!matchId || !userId) {
      return NextResponse.json(
        { success: false, error: 'Missing matchId or userId' },
        { status: 400 }
      );
    }

    const authHeader = req.headers.get('authorization');
    
    // Get new messages and events since timestamp
    const response = await fetch(`${BACKEND_API_URL}/realtime/poll?matchId=${matchId}&userId=${userId}&since=${since}`, {
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
      data: data.events || [],
      lastPolled: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error polling for updates:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to poll for updates' },
      { status: 500 }
    );
  }
} 