import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || process.env.BACKEND_API_URL || "https://hope-backend-2.onrender.com";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Check for token in Authorization header
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    // Validate backend JWT token with timeout
    if (token) {
      try {
        // Add timeout to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
        
        const response = await fetch(`${BACKEND_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          cache: 'no-store',
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user) {
            return NextResponse.json({
              isAuthenticated: true,
              user: {
                id: data.user._id || data.user.id,
                _id: data.user._id || data.user.id,
                name: data.user.name,
                email: data.user.email,
                createdAt: data.user.createdAt,
                updatedAt: data.user.updatedAt
              }
            });
          }
        }
      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.error("Backend session check timed out - backend may be sleeping");
        } else {
          console.error("Backend token validation error:", error);
        }
        // Continue to NextAuth fallback instead of failing
      }
    }
    
    // Fallback to NextAuth session
    try {
      const session = await getServerSession(authOptions);
      
      if (session?.user) {
        return NextResponse.json({
          isAuthenticated: true,
          user: session.user
        });
      }
    } catch (nextAuthError) {
      console.error("NextAuth session error:", nextAuthError);
    }
    
    // If all else fails, return unauthenticated instead of 500
    return NextResponse.json({
      isAuthenticated: false,
      user: null
    }, { status: 200 }); // Changed from 500 to 200 to prevent error spam

  } catch (error) {
    console.error("Session error:", error);
    // Return 200 with unauthenticated instead of 500 to prevent cascading failures
    return NextResponse.json(
      { 
        isAuthenticated: false,
        user: null,
        error: "Session check failed"
      },
      { status: 200 }
    );
  }
}