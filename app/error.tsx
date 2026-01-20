"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home, MessageCircle } from "lucide-react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <Card className="text-center">
          <CardHeader>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto mb-4"
            >
              <div className="w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-12 h-12 text-destructive" />
              </div>
            </motion.div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Something went wrong
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <p className="text-muted-foreground">
                We encountered an unexpected error. Don't worry, our team has been notified.
              </p>
              <p className="text-sm text-muted-foreground">
                Error ID: {error.digest || "Unknown"}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={reset} className="flex-1">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button variant="outline" asChild className="flex-1">
                <Link href="/">
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Link>
              </Button>
            </div>

            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground mb-3">
                If this problem persists, please contact our support team:
              </p>
              <div className="flex flex-col gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <a href="mailto:knsalee@gmail.com?subject=Error Report - ${error.digest || 'Unknown'}">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Email Support (knsalee@gmail.com)
                  </a>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/therapy/memory-enhanced">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Contact AI Support
                  </Link>
                </Button>
              </div>
            </div>

            {process.env.NODE_ENV === "development" && (
              <div className="pt-4 border-t">
                <details className="text-left">
                  <summary className="text-sm font-medium cursor-pointer text-muted-foreground">
                    Development Error Details
                  </summary>
                  <pre className="mt-2 text-xs bg-muted p-3 rounded overflow-auto">
                    {error.message}
                    {error.stack && `\n\n${error.stack}`}
                  </pre>
                </details>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
