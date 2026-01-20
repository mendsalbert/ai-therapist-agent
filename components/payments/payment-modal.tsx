"use client";

import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PaymentModalProps {
  authorizationUrl: string;
  reference: string;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess?: () => void;
  onPaymentCancelled?: () => void;
}

export function PaymentModal({
  authorizationUrl,
  reference,
  isOpen,
  onClose,
  onPaymentSuccess,
  onPaymentCancelled,
}: PaymentModalProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    let pollInterval: NodeJS.Timeout | null = null;
    let iframeCheckInterval: NodeJS.Timeout | null = null;

    // Listen for postMessage from Paystack (if supported)
    const handleMessage = (event: MessageEvent) => {
      // Verify origin is Paystack
      if (event.origin.includes('paystack.com') || event.origin.includes('paystack.co')) {
        if (event.data?.status === 'success' || event.data?.success) {
          onPaymentSuccess?.();
          onClose();
        } else if (event.data?.status === 'cancelled' || event.data?.cancelled) {
          onPaymentCancelled?.();
          onClose();
        }
      }
    };

    // Monitor iframe load for redirect to success page
    const checkIframeLocation = () => {
      try {
        const iframe = iframeRef.current;
        if (iframe?.contentWindow?.location) {
          const iframeUrl = iframe.contentWindow.location.href;
          if (iframeUrl.includes('/payment/success') || iframeUrl.includes('success=true')) {
            onPaymentSuccess?.();
            onClose();
          }
        }
      } catch (e) {
        // Cross-origin error expected - Paystack redirects will go to callback_url
        // which will verify payment automatically
      }
    };

    // Poll to check if payment was completed
    // After Paystack payment, it redirects to callback_url which verifies payment
    // We can check by polling the backend for payment status
    let pollCount = 0;
    const maxPolls = 90; // Poll for up to 90 seconds (3 seconds intervals)
    pollInterval = setInterval(async () => {
      pollCount++;
      if (pollCount > maxPolls) {
        if (pollInterval) clearInterval(pollInterval);
        return;
      }

      try {
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        if (!token) return;

        // Check payment status by verifying with backend
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL || 'https://hope-backend-2.onrender.com'}/payments/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ reference }),
        });

        const data = await response.json();
        if (data.success && data.subscription?.status === 'active') {
          if (pollInterval) clearInterval(pollInterval);
          if (iframeCheckInterval) clearInterval(iframeCheckInterval);
          onPaymentSuccess?.();
          onClose();
          return;
        }
      } catch (e) {
        // Silently handle polling errors
        console.debug('Payment polling error:', e);
      }
    }, 3000); // Poll every 3 seconds

    // Also check iframe location periodically (may fail due to CORS but worth trying)
    iframeCheckInterval = setInterval(checkIframeLocation, 2000);

    window.addEventListener('message', handleMessage);

    return () => {
      if (pollInterval) clearInterval(pollInterval);
      if (iframeCheckInterval) clearInterval(iframeCheckInterval);
      window.removeEventListener('message', handleMessage);
    };
  }, [isOpen, reference, onPaymentSuccess, onPaymentCancelled, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl w-[95vw] h-[90vh] p-0 flex flex-col">
        <DialogHeader className="p-4 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle>Complete Payment</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription className="text-sm text-muted-foreground mt-2">
            Payment is processed in KES (converted from USD). You can pay via card or mobile money (M-Pesa).
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 relative min-h-0">
          <iframe
            ref={iframeRef}
            src={authorizationUrl}
            className="w-full h-full border-0 absolute inset-0"
            title="Payment Gateway"
            allow="payment *"
            sandbox="allow-forms allow-scripts allow-same-origin allow-top-navigation allow-popups allow-popups-to-escape-sandbox"
          />
        </div>
        <div className="p-3 bg-muted/50 border-t text-xs text-muted-foreground flex-shrink-0">
          <div className="flex items-center gap-2">
            <span>ℹ️</span>
            <span>
              Amount will be charged in KES (Kenyan Shillings). Exchange rate: 1 USD = 130 KES (approximate).
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

