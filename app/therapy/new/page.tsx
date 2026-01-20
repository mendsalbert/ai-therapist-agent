"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createChatSession } from "@/lib/api/chat";
import { Loader2 } from "lucide-react";
import { useSession } from "@/lib/contexts/session-context";

export default function NewTherapyRedirectPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useSession();

  useEffect(() => {
    // Wait for authentication check to complete
    if (isLoading) {
      return;
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    const go = async () => {
      try {
        const id = await createChatSession();
        // Redirect immediately without delay
        router.replace(`/therapy/${id}`);
      } catch (e) {
        // Redirect immediately on error too
        router.replace(`/therapy/${Date.now()}`);
      }
    };
    go();
  }, [router, isAuthenticated, isLoading]);

  // Minimal loading state - redirect happens immediately
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
      </div>
    </div>
  );
}


