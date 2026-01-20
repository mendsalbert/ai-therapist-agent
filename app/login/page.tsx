"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { AccessibleInput } from "@/components/ui/accessible-input";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useSession } from "@/lib/contexts/session-context";
import { logger } from "@/lib/utils/logger";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [navigatingToSignup, setNavigatingToSignup] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Please enter a valid email address";
    }
    
    if (!password.trim()) {
      errors.password = "Password is required";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError("");
    setFieldErrors({});
    
    try {
      logger.debug("Attempting login...");
      
      // First, check if the account requires email verification
      const { backendService } = await import("@/lib/api/backend-service");
      const response = await backendService.login(email, password);
      
      // Check if email verification is required
      if (!response.success && (response as any).requiresVerification && (response as any).userId) {
        toast.error("Please verify your email before logging in.");
        // Redirect to verification page
        setTimeout(() => {
          router.push(`/verify-email?userId=${(response as any).userId}&email=${encodeURIComponent(email)}`);
        }, 1000);
        return;
      }
      
      // Use the session context login method
      const success = await login(email, password);
      
      if (success) {
        toast.success("Welcome back! Redirecting to AI Chat...");
        
        // Wait a moment for state to update, then redirect to AI chat
        setTimeout(() => {
          router.push("/therapy/memory-enhanced");
        }, 1000);
      } else {
        if (response.isNetworkError) {
          setError("Unable to connect to the server. This might be a temporary issue. Please try again in a moment.");
          toast.error("Server connection issue. Please try again.");
        } else if (response.isAuthError) {
          setError("Invalid email or password. Please check your credentials.");
          toast.error("Invalid credentials. Please try again.");
        } else {
          setError(response.error || "Login failed. Please try again.");
          toast.error("Login failed. Please try again.");
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      
      // Provide more helpful error messages
      if (errorMessage.includes("timeout") || errorMessage.includes("Cannot connect")) {
        setError("Server is currently unavailable. Please try again in a few minutes.");
        toast.error("Server timeout. Please try again.");
      } else if (errorMessage.includes("Invalid email or password")) {
        setError("Invalid email or password. Please check your credentials.");
        toast.error("Invalid credentials. Please try again.");
      } else {
        setError(errorMessage);
        toast.error("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignupClick = () => {
    // Show immediate visual feedback
    setNavigatingToSignup(true);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/30">
      <Container className="flex flex-col items-center justify-center w-full">
        <Card className="w-full md:w-5/12 max-w-2xl p-8 md:p-10 rounded-3xl shadow-2xl border border-primary/10 bg-card/90 backdrop-blur-lg mt-12">
          <div className="mb-6 text-center">
            <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent mb-1 tracking-tight">
              Sign In
            </h1>
            <p className="text-base text-muted-foreground font-medium">
              Welcome back! Please sign in to continue your journey.
            </p>
          </div>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-3">
              <AccessibleInput
                label="Email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) {
                    setFieldErrors(prev => ({ ...prev, email: '' }));
                  }
                }}
                error={fieldErrors.email}
                required
                className="pl-12 py-2 text-base rounded-xl bg-card bg-opacity-80 border text-foreground placeholder:text-muted-foreground"
                helperText="Enter your email address"
              />
              <AccessibleInput
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) {
                    setFieldErrors(prev => ({ ...prev, password: '' }));
                  }
                }}
                error={fieldErrors.password}
                required
                className="pl-12 pr-12 py-2 text-base rounded-xl bg-card bg-opacity-80 border text-foreground placeholder:text-muted-foreground"
                helperText="Enter your password"
                rightContent={
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                }
              />
            </div>
            {error && (
              <p className="text-red-500 text-base text-center font-medium">
                {error}
              </p>
            )}
            <Button
              className="w-full py-2 text-base rounded-xl font-bold bg-gradient-to-r from-primary to-primary/80 shadow-md hover:from-primary/80 hover:to-primary"
              size="lg"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
          <div className="my-6 border-t border-primary/10" />
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center justify-center gap-2 text-sm">
              <span className="text-muted-foreground">
                Don&apos;t have an account?
              </span>
              <Link
                href="/signup"
                onClick={handleSignupClick}
                className="text-primary font-semibold underline hover:text-primary/80 transition-colors flex items-center gap-1"
              >
                {navigatingToSignup ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Loading...</span>
                  </>
                ) : (
                  "Sign up"
                )}
              </Link>
              <span className="text-muted-foreground">·</span>
              <Link
                href="/forgot-password"
                className="text-primary underline hover:text-primary/80 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
          </div>
        </Card>
      </Container>
    </div>
  );
}
