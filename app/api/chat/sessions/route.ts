import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL = process.env.BACKEND_API_URL || "https://hope-backend-2.onrender.com";
const RETRIES = 1;
const TIMEOUT_MS = 20000;

export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization") || "";
    const masked = auth ? `${auth.slice(0, 12)}…` : "<none>";
    console.log("[proxy] GET /api/chat/sessions auth:", masked);
    const doFetch = async (): Promise<Response> => {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), TIMEOUT_MS);
      try {
        return await fetch(`${BACKEND_API_URL}/chat/sessions`, {
          headers: {
            Authorization: req.headers.get("authorization") || "",
            ...(process.env.BACKEND_API_KEY ? { "x-api-key": process.env.BACKEND_API_KEY } : {}),
          },
          cache: "no-store",
          signal: controller.signal,
        });
      } finally {
        clearTimeout(id);
      }
    };

    let res = await doFetch();
    console.log("[proxy] GET /chat/sessions upstream status:", res.status);
    if (res.status >= 500) {
      for (let i = 0; i < RETRIES; i++) {
        await new Promise(r => setTimeout(r, 600));
        res = await doFetch();
        if (res.ok || res.status < 500) break;
      }
    }

    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('application/json')) {
      return NextResponse.json({ error: 'Upstream returned non-JSON' }, { status: 502 });
    }
    let data: any;
    try { data = await res.json(); } catch { return NextResponse.json({ error: 'Invalid JSON from upstream' }, { status: 502 }); }
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch chat sessions' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization") || "";
    const masked = auth ? `${auth.slice(0, 12)}…` : "<none>";
    console.log("[proxy] POST /api/chat/sessions auth:", masked);
    
    // Read request body (may be empty for session creation)
    let requestBody = {};
    try {
      const body = await req.json().catch(() => ({}));
      requestBody = body || {};
    } catch {
      // If body parsing fails, use empty object (session creation doesn't require body)
      requestBody = {};
    }
    
    const doFetch = async (body: any): Promise<Response> => {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), TIMEOUT_MS);
      try {
        return await fetch(`${BACKEND_API_URL}/chat/sessions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: req.headers.get("authorization") || "",
            ...(process.env.BACKEND_API_KEY ? { 'x-api-key': process.env.BACKEND_API_KEY } : {}),
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(id);
      }
    };

    const res = await doFetch(requestBody);
    console.log("[proxy] POST /chat/sessions upstream status:", res.status);
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('application/json')) {
      return NextResponse.json({ error: 'Upstream returned non-JSON' }, { status: 502 });
    }
    let data: any;
    try { data = await res.json(); } catch { return NextResponse.json({ error: 'Invalid JSON from upstream' }, { status: 502 }); }
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("[proxy] POST /api/chat/sessions error:", error);
    return NextResponse.json({ error: 'Failed to create chat session' }, { status: 500 });
  }
}
