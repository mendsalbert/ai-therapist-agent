"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Crown, 
  Calendar, 
  CreditCard, 
  Settings, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2
} from "lucide-react";
import { paystackService, SubscriptionStatus } from "@/lib/payments/paystack-service";
import { useSession } from "@/lib/contexts/session-context";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function SubscriptionManager() {
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const { user, isAuthenticated } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && user) {
      loadSubscriptionStatus();
    }
  }, [isAuthenticated, user]);

  const loadSubscriptionStatus = async () => {
    try {
      setIsLoading(true);
      // Get subscription status from backend
      const status = await paystackService.getSubscriptionStatus(user?._id || '');
      setSubscriptionStatus(status);
    } catch (error) {
      console.error("Error loading subscription status:", error);
      toast.error("Failed to load subscription status");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscriptionStatus?.plan || !user?._id) return;

    setIsCancelling(true);
    try {
      // Cancel subscription through backend
      const result = await paystackService.cancelSubscription(user._id);
      
      if (result.success) {
        toast.success("Subscription cancelled successfully");
        await loadSubscriptionStatus();
      } else {
        toast.error(result.error || "Failed to cancel subscription");
      }
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsCancelling(false);
    }
  };

  const getStatusIcon = () => {
    if (isLoading) return <Loader2 className="w-5 h-5 animate-spin" />;
    if (subscriptionStatus?.isActive) return <CheckCircle className="w-5 h-5 text-green-600" />;
    return <XCircle className="w-5 h-5 text-red-600" />;
  };

  const getStatusText = () => {
    if (isLoading) return "Loading...";
    if (subscriptionStatus?.isActive) return "Active";
    return "Inactive";
  };

  const getStatusColor = () => {
    if (isLoading) return "secondary";
    if (subscriptionStatus?.isActive) return "default";
    return "destructive";
  };

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5" />
            Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Sign in to manage your subscription
          </p>
          <Button onClick={() => router.push("/login")}>
            Sign In
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="w-5 h-5" />
          Subscription Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <>
            {/* Status */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status:</span>
              <Badge variant={getStatusColor() as any} className="flex items-center gap-1">
                {getStatusIcon()}
                {getStatusText()}
              </Badge>
            </div>

            {subscriptionStatus?.isActive ? (
              <>
                {/* Active Subscription Details */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Plan:</span>
                    <span className="text-sm">{subscriptionStatus.plan?.name}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Price:</span>
                    <span className="text-sm">${subscriptionStatus.plan?.price}/{subscriptionStatus.plan?.interval === 'monthly' ? 'month' : 'year'}</span>
                  </div>

                  {subscriptionStatus.nextBillingDate && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Next billing:</span>
                      <span className="text-sm">
                        {subscriptionStatus.nextBillingDate.toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Auto-renew:</span>
                    <span className="text-sm">
                      {subscriptionStatus.autoRenew ? "Yes" : "No"}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleCancelSubscription}
                    disabled={isCancelling}
                    className="flex-1"
                  >
                    {isCancelling ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Cancelling...
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 mr-2" />
                        Cancel
                      </>
                    )}
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Settings className="w-4 h-4 mr-2" />
                    Manage
                  </Button>
                </div>
              </>
            ) : (
              <>
                {/* No Active Subscription */}
                <div className="text-center py-6">
                  <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    You don't have an active subscription
                  </p>
                  <Button onClick={() => router.push("/pricing")} className="w-full">
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade to Premium
                  </Button>
                </div>
              </>
            )}

            {/* Features List */}
            {subscriptionStatus?.isActive && (
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-2">Your Premium Features:</h4>
                <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                    Unlimited Sessions
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                    Advanced Insights
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                    Priority Support
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                    Premium Content
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
