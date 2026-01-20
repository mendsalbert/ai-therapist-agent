import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 120;

// Note: Next.js App Router handles large files natively
// File is uploaded directly to Vercel Blob, bypassing body parser limits

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const duration = parseInt(formData.get('duration') as string || '0');
    const category = formData.get('category') as string;
    const isPremium = formData.get('isPremium') === 'true';
    const tags = JSON.parse(formData.get('tags') as string || '[]');
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!title || !description || !category) {
      return NextResponse.json(
        { success: false, error: 'Title, description, and category are required' },
        { status: 400 }
      );
    }

    // Step 1: Upload file to Vercel Blob
    const timestamp = Date.now();
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '-');
    const filename = `${timestamp}-${sanitizedFilename}`;
    const path = `meditations/${filename}`;

    const blob = await put(path, file, {
      access: 'public',
      contentType: file.type,
      token: process.env.BLOB_READ_WRITE_TOKEN
    });

    // Step 2: Save metadata to MongoDB backend
    const backendUrl = process.env.BACKEND_API_URL || 'https://hope-backend-2.onrender.com';

    // Get auth token from Next.js request
    const authHeader = request.headers.get('authorization');

    const meditationData = {
      title,
      description,
      duration,
      audioUrl: blob.url,
      category,
      isPremium,
      tags
    };

    console.log('Saving meditation metadata to backend:', meditationData);

    const backendResponse = await fetch(`${backendUrl}/meditations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader })
      },
      body: JSON.stringify(meditationData)
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}));
      console.error('Backend save failed:', backendResponse.status, errorData);
      
      // File is uploaded to Vercel Blob, but metadata save failed
      return NextResponse.json({
        success: false,
        error: `Failed to save meditation metadata: ${errorData.error || backendResponse.statusText}`,
        details: errorData.details,
        fileUploaded: true,
        fileUrl: blob.url
      }, { status: 500 });
    }

    const savedMeditation = await backendResponse.json();
    console.log('Meditation saved successfully:', savedMeditation);

    return NextResponse.json({
      success: true,
      data: savedMeditation.meditation || savedMeditation
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error uploading meditation:', message);
    return NextResponse.json(
      { success: false, error: `Failed to upload meditation: ${message}` },
      { status: 500 }
    );
  }
}