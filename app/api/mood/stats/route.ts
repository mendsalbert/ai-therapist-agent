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
    const period = searchParams.get("period") || "week";

    const response = await fetch(
      `${BACKEND_API_URL}/mood/stats?period=${period}`,
      {
        headers: {
          'Authorization': authHeader,
          "Content-Type": "application/json",
        },
        cache: 'no-store'
      }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error fetching mood stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch mood stats" },
      { status: 500 }
    );
  }
}

