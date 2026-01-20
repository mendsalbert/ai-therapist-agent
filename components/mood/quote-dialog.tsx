"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormatQuote } from "lucide-react";
import { getRandomQuote } from "@/lib/services/quote-service";

interface QuoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuoteDialog({ open, onOpenChange }: QuoteDialogProps) {
  const quote = getRandomQuote();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              <FormatQuote className="h-8 w-8 text-primary" />
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <blockquote className="text-center space-y-3">
            <p className="text-lg font-medium italic text-foreground leading-relaxed">
              &ldquo;{quote.text}&rdquo;
            </p>
            <footer className="text-sm text-muted-foreground">
              — {quote.author}
            </footer>
          </blockquote>
          <div className="flex justify-center pt-2">
            <Button onClick={() => onOpenChange(false)} className="min-w-[120px]">
              Continue
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
