"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, ArrowLeft, Search, Heart } from "lucide-react";

export default function NotFound() {
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
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                <Heart className="w-12 h-12 text-primary" />
              </div>
            </motion.div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Page Not Found
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <p className="text-muted-foreground">
                Sorry, we couldn't find the page you're looking for.
              </p>
              <p className="text-sm text-muted-foreground">
                The page might have been moved, deleted, or you might have entered the wrong URL.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild className="flex-1">
                <Link href="/">
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Link>
              </Button>
              <Button variant="outline" asChild className="flex-1">
                <Link href="/features">
                  <Search className="w-4 h-4 mr-2" />
                  Explore Features
                </Link>
              </Button>
            </div>

            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground mb-2">
                Need help? Contact our support team at <a href="mailto:knsalee@gmail.com" className="text-primary underline">knsalee@gmail.com</a> or try one of these popular pages:
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/therapy/memory-enhanced">AI Therapist</Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/journaling">Journal</Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/meditations">Meditations</Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/therapy">Therapy</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
