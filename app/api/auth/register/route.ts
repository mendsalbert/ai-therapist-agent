import { NextRequest, NextResponse } from "next/server";
import { rateLimiters } from "@/lib/utils/rate-limit";

const API_URL = process.env.BACKEND_API_URL || "https://hope-backend-2.onrender.com";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  // Rate limiting for registration attempts (5 per minute)
  const rateLimitError = rateLimiters.strict(req);
  if (rateLimitError) return rateLimitError;
  
  try {
    const body = await req.json();

    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Server error", error },
      { status: 500 }
    );
  }
}
