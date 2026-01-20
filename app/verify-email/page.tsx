"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Shield, Mail, ArrowLeft, RefreshCw } from "lucide-react";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [devOTP, setDevOTP] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  const userId = searchParams.get("userId");
  const email = searchParams.get("email");
  const urlDevOTP = searchParams.get("devOTP");

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Auto-focus first input on load
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Set devOTP from URL if available
  useEffect(() => {
    if (urlDevOTP) {
      setDevOTP(urlDevOTP);
      toast.info("Development Mode: OTP displayed below", { duration: 5000 });
    }
  }, [urlDevOTP]);

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all filled
    if (index === 5 && value && newCode.every(digit => digit !== "")) {
      handleVerify(newCode.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newCode = [...code];
    
    pastedData.split("").forEach((char, index) => {
      if (index < 6) {
        newCode[index] = char;
      }
    });
    
    setCode(newCode);
    
    // Focus last filled input or next empty
    const lastFilledIndex = newCode.findIndex(digit => digit === "");
    if (lastFilledIndex !== -1) {
      inputRefs.current[lastFilledIndex]?.focus();
    } else {
      inputRefs.current[5]?.focus();
      // Auto-submit if all filled
      handleVerify(newCode.join(""));
    }
  };

  const handleVerify = async (verificationCode?: string) => {
    const finalCode = verificationCode || code.join("");
    
    if (finalCode.length !== 6) {
      toast.error("Please enter the complete 6-digit code");
      return;
    }

    if (!userId) {
      toast.error("User ID is missing. Please try signing up again.");
      return;
    }

    setIsVerifying(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL || "https://hope-backend-2.onrender.com"}/auth/verify-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          code: finalCode,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store the token
        localStorage.setItem("token", data.token);
        localStorage.setItem("authToken", data.token);

        toast.success("Email verified successfully! Welcome to Hope Therapy!");
        
        // Redirect to therapy sessions
        setTimeout(() => {
          router.push("/therapy");
        }, 1000);
      } else {
        if (data.codeExpired) {
          toast.error("Code expired. Please request a new code.");
        } else {
          toast.error(data.message || "Invalid verification code");
        }
        // Clear code on error
        setCode(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast.error("Failed to verify email. Please try again.");
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (!userId && !email) {
      toast.error("Cannot resend code. Please try signing up again.");
      return;
    }

    setIsResending(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL || "https://hope-backend-2.onrender.com"}/auth/resend-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          email,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Check if devOTP is provided (development mode)
        if (data.devOTP) {
          setDevOTP(data.devOTP);
          toast.success("Verification code generated! (Dev Mode: Check below)", { duration: 5000 });
        } else {
          toast.success("Verification code sent! Check your email.");
        }
        setCountdown(60); // 60 second cooldown
        setCode(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      } else {
        toast.error(data.message || "Failed to resend code");
      }
    } catch (error) {
      console.error("Resend error:", error);
      toast.error("Failed to resend code. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back button */}
        <button
          onClick={() => router.push("/signup")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to signup
        </button>

        {/* Main card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
              <Mail className="w-8 h-8 text-indigo-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Verify Your Email
            </h1>
            <p className="text-gray-600">
              We've sent a 6-digit code to
            </p>
            {email && (
              <p className="text-indigo-600 font-medium mt-1">
                {email}
              </p>
            )}
          </div>

          {/* OTP Input */}
          <div className="mb-6">
            <div className="flex justify-center gap-2 mb-4">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {inputRefs.current[index] = el}}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                  disabled={isVerifying}
                />
              ))}
            </div>

            {/* Security note */}
            <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <Shield className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-800">
                Never share this code with anyone. It expires in 10 minutes.
              </p>
            </div>
          </div>

          {/* Verify Button */}
          <button
            onClick={() => handleVerify()}
            disabled={isVerifying || code.some(digit => digit === "")}
            className="w-full bg-indigo-600 text-white rounded-lg px-6 py-3 font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-4"
          >
            {isVerifying ? (
              <span className="flex items-center justify-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin" />
                Verifying...
              </span>
            ) : (
              "Verify Email"
            )}
          </button>

          {/* Resend Code */}
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              Didn't receive the code?
            </p>
            <button
              onClick={handleResendCode}
              disabled={isResending || countdown > 0}
              className="text-indigo-600 hover:text-indigo-700 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isResending ? (
                <span className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Sending...
                </span>
              ) : countdown > 0 ? (
                `Resend in ${countdown}s`
              ) : (
                "Resend Code"
              )}
            </button>
          </div>

          {/* Development Mode OTP Display */}
          {devOTP && (
            <div className="mt-6 p-4 bg-amber-50 border-2 border-amber-300 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-amber-200 rounded-full flex items-center justify-center">
                    <span className="text-amber-700 font-bold text-sm">⚠️</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-amber-900 mb-1">
                    Development Mode
                  </h4>
                  <p className="text-xs text-amber-700 mb-2">
                    Email service is not configured. Use this OTP to verify:
                  </p>
                  <div className="bg-white rounded-md p-3 border border-amber-300">
                    <p className="text-2xl font-mono font-bold text-center text-amber-900 tracking-wider">
                      {devOTP}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(devOTP);
                      toast.success("OTP copied to clipboard!");
                    }}
                    className="mt-2 text-xs text-amber-700 hover:text-amber-900 underline"
                  >
                    Copy to clipboard
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Check your spam folder if you don't see the email in your inbox.
        </p>
      </div>
    </div>
  );
}

