import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL = process.env.BACKEND_API_URL || "https://hope-backend-2.onrender.com";

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;
    const auth = req.headers.get("authorization") || "";
    
    console.log(`[proxy] GET /api/chat/sessions/${sessionId}/history`);
    
    const res = await fetch(`${BACKEND_API_URL}/chat/sessions/${sessionId}/history`, { 
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Authorization: auth,
        ...(process.env.BACKEND_API_KEY ? { "x-api-key": process.env.BACKEND_API_KEY } : {}),
      }
    });
    
    console.log(`[proxy] GET /chat/sessions/${sessionId}/history upstream status:`, res.status);
    
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat history" },
      { status: 500 }
    );
  }
}
