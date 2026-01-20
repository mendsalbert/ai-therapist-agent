import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'https://hope-backend-2.onrender.com';

// Mark this route as dynamic since it accesses request.headers and formData
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const postId = formData.get('postId') as string;
    const commentId = formData.get('commentId') as string;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '-');
    const filename = `${timestamp}-${sanitizedFilename}`;
    
    // Determine upload path based on context
    let path: string;
    if (postId) {
      path = `community/posts/${postId}/${filename}`;
    } else if (commentId) {
      path = `community/comments/${commentId}/${filename}`;
    } else {
      path = `community/uploads/${filename}`;
    }

    // Upload to Vercel Blob
    const blob = await put(path, file, {
      access: 'public',
      contentType: file.type,
    });

    // Get auth token for backend API call
    const authHeader = request.headers.get('authorization');
    
    // Save image metadata to backend
    const response = await fetch(`${BACKEND_API_URL}/community/images`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { Authorization: authHeader }),
      },
      body: JSON.stringify({
        url: blob.url,
        filename: filename,
        contentType: file.type,
        size: file.size,
        postId: postId || null,
        commentId: commentId || null,
        uploadedAt: new Date().toISOString()
      })
    });

    if (!response.ok) {
      // If backend save fails, we should ideally clean up the blob
      // For now, we'll just log the error
      console.error('Failed to save image metadata to backend:', response.status);
    }

    return NextResponse.json({
      success: true,
      imageUrl: blob.url,
      filename: filename,
      size: file.size,
      contentType: file.type
    });

  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}
