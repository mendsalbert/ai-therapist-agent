import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0; // Disable caching

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || searchParams.get('q');
    const category = searchParams.get('category');
    const isPremium = searchParams.get('isPremium');
    const limit = searchParams.get('limit') || '50';
    
    const backendUrl = process.env.BACKEND_API_URL || 'https://hope-backend-2.onrender.com';
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    if (isPremium !== null) params.append('isPremium', isPremium);
    params.append('limit', limit);

    const backendResponse = await fetch(`${backendUrl}/meditations?${params.toString()}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    
    if (!backendResponse.ok) {
      throw new Error(`Backend returned ${backendResponse.status}`);
    }

    const data = await backendResponse.json();
    
    return NextResponse.json({
      success: true,
      meditations: data.meditations || [],
      pagination: data.pagination
    });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to search meditations',
      meditations: []
    }, { status: 500 });
  }
}