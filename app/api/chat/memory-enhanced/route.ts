import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL = process.env.BACKEND_API_URL || "https://hope-backend-2.onrender.com";
const RETRIES = 1;
const TIMEOUT_MS = 30000;

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    console.log("Memory-enhanced API: Received request");
    const { message, sessionId, userId, context, suggestions, userMemory } = await req.json();

    console.log("Memory-enhanced API: Request data", {
      message: message?.substring(0, 50) + "...",
      sessionId,
      userId,
      hasContext: !!context,
      hasUserMemory: !!userMemory
    });

    if (!message) {
      console.log("Memory-enhanced API: No message provided");
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    console.log("Memory-enhanced API: Sending to backend", { 
      backendUrl: `${BACKEND_API_URL}/memory-enhanced-chat`,
      hasAuth: !!req.headers.get("authorization")
    });

    const doFetch = async (): Promise<Response> => {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), TIMEOUT_MS);
      try {
        return await fetch(`${BACKEND_API_URL}/memory-enhanced-chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: req.headers.get("authorization") || "",
            ...(process.env.BACKEND_API_KEY ? { "x-api-key": process.env.BACKEND_API_KEY } : {}),
          },
          body: JSON.stringify({
            message,
            sessionId,
            userId,
            context,
            suggestions,
            userMemory,
            timestamp: new Date().toISOString(),
          }),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(id);
      }
    };

    let res = await doFetch();
    if (res.status >= 500) {
      for (let i = 0; i < RETRIES; i++) {
        await new Promise(r => setTimeout(r, 600));
        res = await doFetch();
        if (res.ok || res.status < 500) break;
      }
    }

    console.log("Memory-enhanced API: Backend response", {
      status: res.status,
      statusText: res.statusText,
      ok: res.ok
    });

    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('application/json')) {
      return NextResponse.json({ error: 'Upstream returned non-JSON' }, { status: 502 });
    }
    let data: any;
    try {
      data = await res.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON from upstream' }, { status: 502 });
    }
    console.log("Memory-enhanced API: Backend data received", {
      hasResponse: !!data.response,
      responseLength: data.response?.length || 0,
      isFailover: data.isFailover
    });

    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Memory-enhanced API: Error occurred", error);
    return NextResponse.json(
      { error: "Failed to process memory-enhanced message" },
      { status: 500 }
    );
  }
}
