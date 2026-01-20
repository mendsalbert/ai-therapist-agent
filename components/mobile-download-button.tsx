"use client";

import { Button } from "@/components/ui/button";
import { Download, Smartphone } from "lucide-react";

export function MobileDownloadButton({ variant = "default", className = "" }: { variant?: "default" | "outline" | "ghost"; className?: string }) {
  // Get APK URL - now hardcoded instead of using env variable
  const apkUrl = "https://jum4pw3ribx7b8ps.public.blob.vercel-storage.com/app-release-apk-v1";

  // If no URL is set, don't show the button
  if (!apkUrl) {
    return null;
  }

  return (
    <Button
      asChild
      variant={variant}
      className={`gap-2 ${className}`}
    >
      <a
        href={apkUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Download Android App"
      >
        <Smartphone className="w-4 h-4" />
        <span className="hidden sm:inline">Download App</span>
        <Download className="w-4 h-4 sm:hidden" />
      </a>
    </Button>
  );
}





