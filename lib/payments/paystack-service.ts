// Paystack Payment Service for HOPE
// Handles all payment operations with Paystack

export interface PaymentPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'monthly' | 'annually';
  paystackPlanCode: string;
  features: string[];
  popular?: boolean;
  savings?: number; // For annual plans
}

export interface PaymentResponse {
  success: boolean;
  reference?: string;
  authorization_url?: string;
  access_code?: string;
  message?: string;
  error?: string;
}

export interface SubscriptionStatus {
  isActive: boolean;
  plan: PaymentPlan | null;
  expiresAt: Date | null;
  autoRenew: boolean;
  nextBillingDate: Date | null;
  isTrialActive?: boolean;
  trialEndsAt?: Date | null;
  trialStartedAt?: Date | null;
  willAutoBill?: boolean;
}

class PaystackService {
  private publicKey: string;
  private backendUrl: string;

  constructor() {
    this.publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '';
    this.backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || process.env.BACKEND_API_URL || 'https://hope-backend-2.onrender.com';
  }

  // Exchange rate: 1 USD = 130 KES (approximate)
  private readonly USD_TO_KES_RATE = 130;

  // Available subscription plans
  getPlans(): PaymentPlan[] {
    return [
      {
        id: 'monthly',
        name: 'Monthly Plan',
        price: 3.99, // $3.99 USD
        currency: 'USD',
        interval: 'monthly',
        paystackPlanCode: process.env.PAYSTACK_MONTHLY_PLAN_CODE || 'PLN_monthly_plan',
        features: [
          'Unlimited AI therapy sessions',
          'Advanced mood tracking',
          'Personalized insights',
          'Full meditation library',
          'AI journal analysis',
          'Advanced progress tracking',
          'Priority email support',
          'Unlimited session duration'
        ]
      },
      {
        id: 'annually',
        name: 'Annual Plan',
        price: 39.90, // $39.90 USD (10 months = 2 months free: $3.99 * 10)
        currency: 'USD',
        interval: 'annually',
        paystackPlanCode: process.env.PAYSTACK_ANNUAL_PLAN_CODE || 'PLN_annual_plan',
        popular: true,
        savings: 7.98, // Save $7.98 total (2 months * $3.99 = $7.98)
        features: [
          'Everything in Monthly Plan',
          'Priority support',
          'Advanced analytics',
          'Custom therapy approaches',
          'Family sharing (up to 3 members)',
          'Export data',
          'Premium meditation content',
          '2 months free (save $7.98)'
        ]
      }
    ];
  }

  // Convert USD to KES for display
  convertUsdToKes(usdAmount: number): number {
    return Math.round(usdAmount * this.USD_TO_KES_RATE);
  }

  // Initialize payment through backend
  async initializePayment(
    email: string,
    planId: string,
    userId: string,
    metadata?: Record<string, any>
  ): Promise<PaymentResponse> {
    try {
      const plan = this.getPlans().find(p => p.id === planId);
      if (!plan) {
        throw new Error('Invalid plan selected');
      }

      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${this.backendUrl}/payments/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          email,
          planId,
          userId,
          metadata: {
            planName: plan.name,
            planCode: plan.paystackPlanCode,
            amount: plan.price,
            currency: plan.currency,
            callback_url: `${window.location.origin}/payment/success`,
            ...metadata
          }
        })
      });

      const data = await response.json();

      if (data.success) {
        return {
          success: true,
          reference: data.reference,
          authorization_url: data.authorization_url,
          access_code: data.access_code,
          message: 'Payment initialized successfully'
        };
      } else {
        return {
          success: false,
          error: data.error || 'Failed to initialize payment'
        };
      }
    } catch (error) {
      console.error('Payment initialization error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment initialization failed'
      };
    }
  }

  // Verify payment through backend
  async verifyPayment(reference: string): Promise<PaymentResponse> {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${this.backendUrl}/payments/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          reference
        })
      });

      const data = await response.json();

      if (data.success) {
        return {
          success: true,
          reference: data.reference,
          message: 'Payment verified successfully'
        };
      } else {
        return {
          success: false,
          error: data.error || 'Payment verification failed'
        };
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment verification failed'
      };
    }
  }

  // Create subscription through backend
  async createSubscription(
    customerEmail: string,
    planId: string
  ): Promise<PaymentResponse> {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Use AbortController to avoid hanging requests (e.g., CORS/preflight or network issues)
      const controller = new AbortController();
      const timeoutMs = 30000; // 30 seconds
      const timeout = setTimeout(() => controller.abort(), timeoutMs);

      let response: Response;
      try {
        response = await fetch(`${this.backendUrl}/payments/subscription/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ planId }),
          signal: controller.signal
        });
      } catch (err: any) {
        if (err.name === 'AbortError') {
          return { success: false, error: 'Request timed out. Please try again.' };
        }
        console.error('Network error creating subscription:', err);
        return { success: false, error: err instanceof Error ? err.message : 'Network error' };
      } finally {
        clearTimeout(timeout);
      }

      let data: any;
      try {
        data = await response.json();
      } catch (err) {
        console.error('Invalid JSON response from subscription/create:', err);
        return { success: false, error: 'Invalid response from server' };
      }

      if (data.success) {
        return {
          success: true,
          reference: data.subscription?.subscription_code || data.subscription?.id || undefined,
          authorization_url: data.authorization_url || undefined,
          message: 'Subscription created successfully'
        };
      } else {
        return {
          success: false,
          error: data.error || 'Failed to create subscription'
        };
      }
    } catch (error) {
      console.error('Subscription creation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Subscription creation failed'
      };
    }
  }

  // Get subscription status through backend
  async getSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      
      const response = await fetch(`${this.backendUrl}/payments/subscription/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        const subscription = data.subscription;
        const plan = this.getPlans().find(p => p.id === subscription.planId);
        
        return {
          isActive: data.isPremium,
          plan: plan || null,
          expiresAt: subscription?.expiresAt ? new Date(subscription.expiresAt) : null,
          autoRenew: subscription?.autoRenew ?? true,
          nextBillingDate: subscription?.nextBillingDate ? new Date(subscription.nextBillingDate) : (subscription?.expiresAt ? new Date(subscription.expiresAt) : null),
          isTrialActive: data.trial?.isActive || subscription?.status === 'trialing',
          trialEndsAt: data.trial?.trialEndsAt ? new Date(data.trial.trialEndsAt) : (subscription?.trialEndsAt ? new Date(subscription.trialEndsAt) : null),
          trialStartedAt: data.trial?.trialStartedAt ? new Date(data.trial.trialStartedAt) : (subscription?.trialStartsAt ? new Date(subscription.trialStartsAt) : null),
          willAutoBill: data.trial?.willAutoBill ?? subscription?.autoRenew ?? true
        };
      } else {
        return {
          isActive: false,
          plan: null,
          expiresAt: null,
          autoRenew: false,
          nextBillingDate: null,
          isTrialActive: false,
          trialEndsAt: null,
          trialStartedAt: null,
          willAutoBill: false
        };
      }
    } catch (error) {
      console.error('Subscription status error:', error);
      return {
        isActive: false,
        plan: null,
        expiresAt: null,
        autoRenew: false,
        nextBillingDate: null,
        isTrialActive: false,
        trialEndsAt: null,
        trialStartedAt: null,
        willAutoBill: false
      };
    }
  }

  // Start a 7-day free trial
  async startFreeTrial(): Promise<PaymentResponse> {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      if (!token) {
        return { success: false, error: 'Authentication required' };
      }

      const response = await fetch(`${this.backendUrl}/payments/subscription/start-trial`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        return {
          success: true,
          message: data.message || 'Trial started',
          reference: data.trial?.status
        };
      }

      return { success: false, error: data.error || 'Failed to start trial' };
    } catch (error) {
      console.error('Start trial error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to start trial' };
    }
  }

  // Cancel subscription through backend
  async cancelSubscription(userId: string, subscriptionId?: string): Promise<PaymentResponse> {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${this.backendUrl}/payments/subscription/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          subscriptionId
        })
      });

      const data = await response.json();

      if (data.success) {
        return {
          success: true,
          message: 'Subscription cancelled successfully'
        };
      } else {
        return {
          success: false,
          error: data.error || 'Failed to cancel subscription'
        };
      }
    } catch (error) {
      console.error('Subscription cancellation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Subscription cancellation failed'
      };
    }
  }

  // Get public key for frontend
  getPublicKey(): string {
    return this.publicKey;
  }

  // Check if Paystack is configured
  isConfigured(): boolean {
    return !!(this.publicKey && this.backendUrl);
  }
}

// Export singleton instance
export const paystackService = new PaystackService();
