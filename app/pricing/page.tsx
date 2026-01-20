"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Smartphone } from "lucide-react";
import { paystackService } from "@/lib/payments/paystack-service";
import { useSession } from "@/lib/contexts/session-context";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { MobileDownloadButton } from "@/components/mobile-download-button";
import { PaymentModal } from "@/components/payments/payment-modal";

export default function PricingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, user, refreshUserTier } = useSession();
  const [isLoading, setIsLoading] = useState<null | "monthly" | "annually">(null);
  const [isStartingTrial, setIsStartingTrial] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string>("");
  const [paymentReference, setPaymentReference] = useState<string>("");

  const plans = paystackService.getPlans();
  const monthlyPlan = plans.find((p) => p.id === "monthly");
  const annualPlan = plans.find((p) => p.id === "annually");

  // Check if returning from payment success
  useEffect(() => {
    const reference = searchParams.get('reference') || searchParams.get('trxref');
    if (reference && isAuthenticated) {
      // Verify payment automatically
      paystackService.verifyPayment(reference).then((result) => {
        if (result.success) {
          toast.success("🎉 Payment successful! Premium features activated.");
          refreshUserTier();
        }
      });
    }
  }, [searchParams, isAuthenticated, refreshUserTier]);

  const handleSignIn = () => router.push("/login");

  const handleSubscribe = async (planId: "monthly" | "annually") => {
    if (!isAuthenticated || !user) {
      toast.error("Unable to subscribe: User session not found. Please restart the app and log in.");
      // Don't redirect to login - user should already be logged in to use the app
      return;
    }

    try {
      setIsLoading(planId);
      // Use initializePayment to charge the exact amount from code (converted to KES)
      const res = await paystackService.initializePayment(
        user.email,
        planId,
        user.id || user._id || String(user._id) || "",
        {
          callback_url: `${window.location.origin}/payment/success`,
        }
      );

      if (!res.success) {
        toast.error?.(res.error || "We couldn’t start the payment. Please try again.");
        setIsLoading(null);
        return;
      }

      if (res.authorization_url && res.reference) {
        // Show payment modal instead of redirecting
        setPaymentUrl(res.authorization_url);
        setPaymentReference(res.reference);
        setPaymentModalOpen(true);
        setIsLoading(null);
      } else {
        toast.error?.("We couldn’t open the payment page. Please try again.");
        setIsLoading(null);
      }
    } catch (err) {
      console.error("Subscribe error:", err);
      toast.error?.("We hit a snag starting payment. Please try again in a moment.");
      setIsLoading(null);
    }
  };

  const handlePaymentSuccess = async () => {
    setPaymentModalOpen(false);
    toast.success("🎉 Payment successful! Activating premium features...");
    await refreshUserTier();
    // Optionally navigate to therapy sessions
    setTimeout(() => {
      router.push("/therapy");
    }, 2000);
  };

  const handlePaymentCancelled = () => {
    setPaymentModalOpen(false);
    toast.info("Payment cancelled");
  };

  const handleStartTrial = async () => {
    if (!isAuthenticated || !user) {
      toast.error("Please log in to start your free trial.");
      router.push("/login");
      return;
    }

    try {
      setIsStartingTrial(true);
      const res = await paystackService.startFreeTrial();
      if (res.success) {
        toast.success("✅ Trial started — premium unlocked for 7 days. Billing begins after unless you cancel.");
        await refreshUserTier?.();
      } else {
        toast.error(res.error || "Unable to start trial");
      }
    } catch (e) {
      toast.error("We hit a snag starting the trial. Please try again in a moment.");
    } finally {
      setIsStartingTrial(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/5 py-20">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-extrabold">Simple plans. No surprises.</h1>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">FREE — Support without pressure. PREMIUM — Depth, clarity, continuity.</p>
            <div className="mt-4 flex flex-col items-center gap-2">
              <Button onClick={handleStartTrial} disabled={isStartingTrial} variant={"secondary" as any} className="max-w-xs w-full">
                {isStartingTrial ? "Starting trial..." : "Start free trial"}
              </Button>
              <p className="text-xs text-muted-foreground">7 days of premium. Cancel before billing from your pricing page.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 items-start mb-10">
            <Card className="p-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Badge variant="outline">FREE</Badge>
                  <span className="text-lg font-semibold">Support without pressure</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="mt-4 space-y-3 text-sm">
                  <li>✔ AI Chat: 150 messages / month</li>
                  <li>✔ Use anytime (all in one day if you want)</li>
                  <li>✔ No memory across sessions</li>
                  <li>✔ Meditations: 10 full sessions / month (counted if ≥50% listened)</li>
                  <li>✔ Journaling: Unlimited (no AI insights or summaries)</li>
                  <li>✔ Community access & mood check-ins</li>
                </ul>
                <div className="mt-6">
                  <Button onClick={handleSignIn} className="w-full" variant={"secondary" as any}>Sign in to get started</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6 border-primary shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-primary text-primary-foreground">PREMIUM</Badge>
                    <span className="text-lg font-semibold">Depth, clarity, continuity</span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">${monthlyPlan?.price?.toFixed(2) ?? '3.99'}</div>
                    <div className="text-sm text-muted-foreground">/ month</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      ≈ KES {Math.round((monthlyPlan?.price ?? 3.99) * 130)} / month
                    </div>
                    <div className="text-xs text-muted-foreground italic">
                      (1 USD = 130 KES)
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="mt-4 space-y-3 text-sm">
                  <li>🔥 Unlimited AI messages</li>
                  <li>🔥 Long, reflective replies</li>
                  <li>🔥 Conversation memory across sessions</li>
                  <li>🔥 AI journal insights & weekly emotional reports</li>
                  <li>🔥 Mood pattern detection & full meditation library</li>
                  <li>🔥 Priority features and faster support</li>
                </ul>

                <div className="mt-6 grid grid-cols-1 gap-3">
                  <Button onClick={() => handleSubscribe('monthly')} disabled={isLoading === 'monthly'} className="w-full bg-primary">{isLoading === 'monthly' ? 'Processing...' : `Subscribe — $${monthlyPlan?.price?.toFixed(2) ?? '3.99'} / month`}</Button>
                  <Button onClick={() => handleSubscribe('annually')} disabled={isLoading === 'annually'} className="w-full" variant={"outline" as any}>{isLoading === 'annually' ? 'Processing...' : `Subscribe annually — $${annualPlan?.price?.toFixed(2) ?? '39.90'} / year`}</Button>
                  <Button onClick={handleStartTrial} disabled={isStartingTrial} variant={"secondary" as any} className="w-full">
                    {isStartingTrial ? "Starting trial..." : "Start free trial"}
                  </Button>
                </div>

                {annualPlan?.savings && (
                  <div className="mt-2 p-2 bg-green-50 rounded-md">
                    <p className="text-sm text-green-700 font-medium">2 Months Free!</p>
                    <p className="text-xs text-green-600">Save ${annualPlan.savings.toFixed(2)} with annual plan</p>
                  </div>
                )}

                <p className="mt-4 text-xs text-muted-foreground">
                  Cancel anytime. No hidden fees. Prices shown in USD; payment processed in KES (130 KES = 1 USD).
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-white/60 rounded-lg p-6 border">
            <h3 className="text-lg font-semibold mb-3">Why upgrade to Premium?</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-muted-foreground">
              <div>
                <strong>More time with the AI</strong>
                <p>Longer, more reflective conversations and fewer interruptions.</p>
              </div>
              <div>
                <strong>Continuity</strong>
                <p>Memory across sessions so progress is tracked and insights improve with time.</p>
              </div>
              <div>
                <strong>Better support</strong>
                <p>AI journal insights, weekly emotional reports, and priority features.</p>
              </div>
            </div>
          </div>

          <div className="mt-8 p-5 rounded-xl border border-primary/20 bg-primary/5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-primary">Premium keeps your progress connected</p>
              <p className="text-sm text-muted-foreground">
                Unlimited AI, conversation memory, deeper insights, and faster responses. Try it free for 7 days.
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button onClick={handleStartTrial} disabled={isStartingTrial} variant={"secondary" as any}>
                {isStartingTrial ? "Starting trial..." : "Start free trial"}
              </Button>
              <Button onClick={() => handleSubscribe('monthly')} disabled={isLoading === 'monthly'}>
                {isLoading === 'monthly' ? 'Processing...' : 'Upgrade now'}
              </Button>
            </div>
          </div>

          {process.env.NEXT_PUBLIC_APK_DOWNLOAD_URL && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.35 }} className="text-center mt-8 mb-8">
              <Card className="max-w-2xl mx-auto bg-gradient-to-r from-primary/10 to-primary/5 border-2 border-primary/20">
                <CardContent className="p-8">
                  <div className="flex items-center justify-center mb-4"><div className="p-3 rounded-full bg-primary/20"><Smartphone className="w-8 h-8 text-primary" /></div></div>
                  <h2 className="text-2xl font-bold mb-2">Download Our Mobile App</h2>
                  <p className="text-muted-foreground mb-6">Get Hope on your Android device for the best mobile experience.</p>
                  <MobileDownloadButton variant="default" className="text-lg px-8 py-6 h-auto" />
                </CardContent>
              </Card>
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="text-center mt-10">
            <Card className="max-w-2xl mx-auto bg-primary/5 border-primary/20">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-4">Ready to go Premium?</h2>
                <p className="text-muted-foreground mb-6">Unlock unlimited chat, journaling, and meditations today.</p>
                <Button onClick={() => router.push('/pricing')} size="lg" className="bg-primary hover:bg-primary/90"><Users className="w-4 h-4 mr-2" /> Get Started Today</Button>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>

      {/* Payment Modal */}
      {paymentModalOpen && paymentUrl && paymentReference && (
        <PaymentModal
          authorizationUrl={paymentUrl}
          reference={paymentReference}
          isOpen={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentCancelled={handlePaymentCancelled}
        />
      )}
    </div>
  );
}

