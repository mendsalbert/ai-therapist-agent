import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.BACKEND_API_URL || "https://hope-backend-2.onrender.com";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const res = await fetch(`${API_URL}/user/profile`, {
      headers: { Authorization: authHeader },
      cache: "no-store",
      signal: AbortSignal.timeout(45000), // 45 seconds for Render cold starts
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    const errorMessage = error instanceof Error && (error.name === 'AbortError' || error.name === 'TimeoutError')
      ? "Server timeout - backend may be starting up"
      : "Server error";
    return NextResponse.json(
      { message: errorMessage, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    
    const res = await fetch(`${API_URL}/user/profile`, {
      method: "PUT",
      headers: { 
        Authorization: authHeader,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(45000), // 45 seconds for Render cold starts
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Error updating user profile:", error);
    const errorMessage = error instanceof Error && (error.name === 'AbortError' || error.name === 'TimeoutError')
      ? "Server timeout - backend may be starting up"
      : "Server error";
    return NextResponse.json(
      { message: errorMessage, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
