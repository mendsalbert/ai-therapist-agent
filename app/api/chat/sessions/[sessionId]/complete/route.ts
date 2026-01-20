import { NextRequest, NextResponse } from "next/server";
import { backendService } from "@/lib/api/backend-service";

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;
    
    console.log(`Completing session: ${sessionId}`);
    
    const response = await backendService.completeChatSession(sessionId);
    
    console.log(`Session completion response:`, response);
    
    return NextResponse.json(response);
  } catch (error) {
    console.error("Error completing chat session:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to complete chat session",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
