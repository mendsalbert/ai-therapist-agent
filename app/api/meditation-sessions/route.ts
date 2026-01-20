import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL = process.env.BACKEND_API_URL || "https://hope-backend-2.onrender.com";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const limit = searchParams.get("limit") || "20";
    const offset = searchParams.get("offset") || "0";
    const meditationId = searchParams.get("meditationId");

    let url = `${BACKEND_API_URL}/meditation-sessions?limit=${limit}&offset=${offset}`;
    if (meditationId) {
      url += `&meditationId=${meditationId}`;
    }

    const response = await fetch(url, {
      headers: {
        'Authorization': authHeader,
        "Content-Type": "application/json",
      },
      cache: 'no-store'
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error fetching meditation sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch meditation sessions" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const response = await fetch(`${BACKEND_API_URL}/meditation-sessions`, {
      method: "POST",
      headers: {
        'Authorization': authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error creating meditation session:", error);
    return NextResponse.json(
      { error: "Failed to create meditation session" },
      { status: 500 }
    );
  }
}

