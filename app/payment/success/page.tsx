"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, Crown } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/lib/contexts/session-context";
import { paystackService } from "@/lib/payments/paystack-service";
import { LoadingDots } from "@/components/ui/loading-dots";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUserTier } = useSession();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyPayment = async () => {
      const reference = searchParams.get('reference');
      const trxref = searchParams.get('trxref');

      if (!reference && !trxref) {
        setStatus('error');
        setMessage('No payment reference found');
        return;
      }

      const paymentRef = reference || trxref;

      try {
        // Show progress feedback
        setMessage('Verifying your payment with Paystack...');

        if (!paymentRef) {
          setStatus('error');
          setMessage('No payment reference provided');
          return;
        }

        const data = await paystackService.verifyPayment(paymentRef);

  if (data.success) {
          setMessage('Payment verified! Activating premium features...');
          
          // Small delay for better UX
          setTimeout(async () => {
            setStatus('success');
            setMessage('Payment verified successfully! Your premium subscription is now active.');
            
            // Enhanced success feedback
            toast.success('🎉 Welcome to Premium!', { duration: 4000 });
            
            // Refresh user tier to reflect premium status
            await refreshUserTier();
            
            // Show feature activation feedback
            setTimeout(() => {
              toast.success('✨ Premium features activated: Unlimited matches, Video calls, Advanced filters!', {
                duration: 6000
              });
            }, 1000);
            
            // Show what they can do now
            setTimeout(() => {
              toast.success('🚀 Ready to explore? Visit the matching page to find unlimited support matches!', {
                duration: 5000
              });
            }, 2500);
            
            // Redirect to matching page after 4 seconds to show premium features
            setTimeout(() => {
              router.push('/matching');
            }, 4000);
          }, 1000);
        } else {
          setStatus('error');
          setMessage(data.error || 'Payment verification failed');
          toast.error(data.error || 'Payment verification failed');
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setStatus('error');
        setMessage('Failed to verify payment. Please contact support if your payment was processed.');
        toast.error('Payment verification failed');
      }
    };

    verifyPayment();
  }, [searchParams, router, refreshUserTier]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            {status === 'loading' && <Loader2 className="w-6 h-6 animate-spin" />}
            {status === 'success' && <CheckCircle className="w-6 h-6 text-green-500" />}
            {status === 'error' && <XCircle className="w-6 h-6 text-red-500" />}
            Payment {status === 'loading' ? 'Processing' : status === 'success' ? 'Successful' : 'Failed'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">{message}</p>
          
          {status === 'success' && (
            <div className="space-y-2">
              <p className="text-sm text-green-600">
                You now have access to all premium features!
              </p>
              <Button onClick={() => router.push('/therapy')} className="w-full">
                Go to Therapy
              </Button>
            </div>
          )}
          
          {status === 'error' && (
            <div className="space-y-2">
              <Button onClick={() => router.push('/pricing')} variant="outline" className="w-full">
                Try Again
              </Button>
              <Button onClick={() => router.push('/therapy')} variant="ghost" className="w-full">
                Go to Therapy
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
