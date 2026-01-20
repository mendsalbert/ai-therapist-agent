import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'https://hope-backend-2.onrender.com';

// Mark this route as dynamic since it accesses request.headers and request.url
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function handleRequest(request: NextRequest) {
  try {
    const { pathname, search } = request.nextUrl;
    const method = request.method;
    const path = pathname.replace('/api/community', ''); // preserve the leading /
    const url = `${BACKEND_API_URL}/community${path}${search}`;
    
    console.log(`Community API: ${method} ${url}`);
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
      console.log('Authorization header included');
    } else {
      console.warn('No authorization header provided');
    }

    let response;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
      if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
        response = await fetch(url, { 
          method, 
          headers,
          cache: 'no-store',
          signal: controller.signal
        });
      } else {
        const body = await request.text();
        console.log('Request body length:', body.length);
        if (body) {
          console.log('Request body preview:', body.substring(0, 200));
        }
        response = await fetch(url, { 
          method, 
          headers, 
          body,
          signal: controller.signal
        });
      }
      
      clearTimeout(timeoutId);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error('Fetch error:', fetchError);
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Request timeout - backend took too long to respond'
          },
          { status: 504 }
        );
      }
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to connect to backend server',
          details: fetchError instanceof Error ? fetchError.message : 'Network error'
        },
        { status: 503 }
      );
    }
    
    console.log(`Backend response status: ${response.status}`);
    
    let data;
    const contentType = response.headers.get('content-type') || 'application/json';
    
    try {
      const textData = await response.text();
      if (contentType.includes('application/json')) {
        data = textData ? JSON.parse(textData) : {};
      } else {
        data = textData;
      }
    } catch (parseError) {
      console.error('Error parsing response:', parseError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid response from backend',
          details: 'Backend returned non-JSON response'
        },
        { status: 502 }
      );
    }
    
    // If backend returned an error, log it and return proper JSON
    if (!response.ok) {
      console.error('Backend error response:', data);
      return NextResponse.json(
        { 
          success: false, 
          error: data.error || data.message || 'Backend server error',
          details: data.details || data
        },
        { status: response.status }
      );
    }
    
    return NextResponse.json(data, {
      status: response.status,
      headers: { 
        'content-type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Community API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export const GET = handleRequest;
export const POST = handleRequest;
export const PATCH = handleRequest;
export const PUT = handleRequest;
export const DELETE = handleRequest;
export const OPTIONS = handleRequest;
export const HEAD = handleRequest;
