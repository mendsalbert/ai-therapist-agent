import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL || "https://hope-backend-2.onrender.com";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { reference } = await req.json();
    
    if (!reference) {
      return NextResponse.json(
        { success: false, error: 'Payment reference is required' },
        { status: 400 }
      );
    }

    const authHeader = req.headers.get('authorization');
    
    // Verify payment with backend
    const response = await fetch(`${BACKEND_API_URL}/payments/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { Authorization: authHeader }),
      },
      body: JSON.stringify({
        reference,
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Backend verification failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (data.success) {
      // Payment verified successfully
      const subscription = data.subscription;
      
      // Update user's premium status
      if (subscription && subscription.isActive) {
        try {
          await fetch(`${BACKEND_API_URL}/users/update-tier`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(authHeader && { Authorization: authHeader }),
            },
            body: JSON.stringify({
              userId: subscription.userId,
              tier: 'premium',
              subscriptionId: subscription.id,
              planId: subscription.planId,
              activatedAt: new Date().toISOString()
            })
          });
        } catch (tierUpdateError) {
          console.error('Failed to update user tier:', tierUpdateError);
        }
      }

      return NextResponse.json({
        success: true,
        data: {
          subscription,
          userTier: subscription?.isActive ? 'premium' : 'free',
          features: subscription?.isActive ? [
            'Unlimited matches',
            'Video calls',
            'Advanced matching filters',
            'Priority matching',
            'Daily check-ins',
            'Crisis support priority'
          ] : []
        },
        message: 'Payment verified successfully! Premium features are now active.'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: data.error || 'Payment verification failed',
        details: data.details
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to verify payment. Please contact support if your payment was processed.',
        supportInfo: {
          email: 'knsalee@gmail.com',
          message: 'Include your payment reference and user email for faster assistance.'
        }
      },
      { status: 500 }
    );
  }
} 