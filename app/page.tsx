"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(true);

  // Immediately send users to the Memory-Enhanced sessions list
  useEffect(() => {
    router.replace("/therapy/memory-enhanced/sessions");
    // Set a small timeout to show loading state
    const timer = setTimeout(() => {
      setIsRedirecting(false);
    }, 100);
    return () => clearTimeout(timer);
  }, [router]);

  // Show loading state while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
}
