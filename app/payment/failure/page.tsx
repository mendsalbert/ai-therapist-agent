"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle, RefreshCw, ArrowLeft, MessageCircle, CreditCard } from "lucide-react";

export default function PaymentFailurePage() {
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
              <div className="w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <XCircle className="w-12 h-12 text-red-600" />
              </div>
            </motion.div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Payment Failed
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <p className="text-muted-foreground">
                We're sorry, but your payment could not be processed at this time.
              </p>
              <p className="text-sm text-muted-foreground">
                This could be due to insufficient funds, incorrect card details, or a temporary issue with your bank.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button asChild className="w-full">
                <Link href="/pricing">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
            </div>

            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground mb-3">
                Common solutions:
              </p>
              <div className="space-y-2 text-xs text-left">
                <div className="flex items-start gap-2">
                  <CreditCard className="w-3 h-3 mt-0.5 text-muted-foreground" />
                  <p>Check your card details and available balance</p>
                </div>
                <div className="flex items-start gap-2">
                  <MessageCircle className="w-3 h-3 mt-0.5 text-muted-foreground" />
                  <p>Contact your bank if the issue persists</p>
                </div>
                <div className="flex items-start gap-2">
                  <RefreshCw className="w-3 h-3 mt-0.5 text-muted-foreground" />
                  <p>Try a different payment method</p>
                </div>
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              <p>
                Need help? Our support team is here to assist you.
              </p>
              <Button variant="ghost" size="sm" asChild className="mt-2">
                <a href="mailto:knsalee@gmail.com?subject=Payment Support Request">
                  Contact Support (knsalee@gmail.com)
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
