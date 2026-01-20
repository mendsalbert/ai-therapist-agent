import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const backendUrl = process.env.BACKEND_API_URL || "https://hope-backend-2.onrender.com";

  try {
    const res = await fetch(`${backendUrl}/health`, { cache: "no-store" });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json(
      { error: "Backend health check failed" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Perform more detailed health checks based on request
    const detailedCheck = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      checks: {
        memory: await checkMemorySystem(),
        backend: await checkBackendConnection(),
        database: await checkDatabaseConnection(),
      },
    };

    return NextResponse.json(detailedCheck, { status: 200 });
  } catch (error) {
    console.error("Detailed health check failed:", error);
    
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: "Detailed health check failed",
      },
      { status: 500 }
    );
  }
}

// Helper functions for health checks
async function checkMemorySystem(): Promise<{ status: string; details: any }> {
  try {
    // Check if memory system is accessible
    if (typeof window === "undefined") {
      // Server-side check
      return {
        status: "healthy",
        details: { type: "server-side", accessible: true },
      };
    } else {
      // Client-side check
      const memoryData = localStorage.getItem("user-memory");
      return {
        status: "healthy",
        details: { type: "client-side", hasData: !!memoryData },
      };
    }
  } catch (error) {
    return {
      status: "unhealthy",
      details: { error: error instanceof Error ? error.message : "Unknown error" },
    };
  }
}

async function checkBackendConnection(): Promise<{ status: string; details: any }> {
  try {
    const backendUrl = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_BACKEND_API_URL;
    
    if (!backendUrl) {
      return {
        status: "warning",
        details: { message: "Backend URL not configured" },
      };
    }

    // In a real implementation, you would ping your backend here
    // For now, we'll just check if the URL is configured
    return {
      status: "healthy",
      details: { url: backendUrl, configured: true },
    };
  } catch (error) {
    return {
      status: "unhealthy",
      details: { error: error instanceof Error ? error.message : "Unknown error" },
    };
  }
}

async function checkDatabaseConnection(): Promise<{ status: string; details: any }> {
  try {
    // In a real implementation, you would check your database connection here
    // For now, we'll return a mock healthy status
    return {
      status: "healthy",
      details: { type: "mock", message: "Database connection not implemented yet" },
    };
  } catch (error) {
    return {
      status: "unhealthy",
      details: { error: error instanceof Error ? error.message : "Unknown error" },
    };
  }
}
