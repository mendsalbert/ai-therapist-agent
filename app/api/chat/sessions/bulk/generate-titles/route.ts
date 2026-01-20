import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL = process.env.BACKEND_API_URL || "https://hope-backend-2.onrender.com";
const TIMEOUT_MS = 60000; // 60 seconds for bulk operation

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization") || "";

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), TIMEOUT_MS);
    
    try {
      const response = await fetch(`${BACKEND_API_URL}/chat/sessions/bulk/generate-titles`, {
        method: "POST",
        headers: {
          Authorization: auth,
          "Content-Type": "application/json",
          ...(process.env.BACKEND_API_KEY ? { "x-api-key": process.env.BACKEND_API_KEY } : {}),
        },
        signal: controller.signal,
      });

      clearTimeout(id);

      const ct = response.headers.get('content-type') || '';
      if (!ct.includes('application/json')) {
        return NextResponse.json({ error: 'Upstream returned non-JSON' }, { status: 502 });
      }

      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    } finally {
      clearTimeout(id);
    }
  } catch (error: any) {
    if (error.name === "AbortError") {
      return NextResponse.json({ error: "Request timeout" }, { status: 504 });
    }
    return NextResponse.json(
      { error: error.message || "Failed to generate titles" },
      { status: 500 }
    );
  }
}

