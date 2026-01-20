import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.BACKEND_API_URL || "https://hope-backend-2.onrender.com";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const res = await fetch(`${API_URL}/activity`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to log activity" },
      { status: 500 }
    );
  }
}
