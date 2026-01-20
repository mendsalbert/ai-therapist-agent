import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.BACKEND_API_URL || "https://hope-backend-2.onrender.com";

export async function PUT(req: NextRequest) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    
    const res = await fetch(`${API_URL}/user`, {
      method: "PUT",
      headers: { 
        Authorization: authHeader,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { message: "Server error", error },
      { status: 500 }
    );
  }
}
