"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  position?: "bottom" | "center";
}

/**
 * Example popup component that works seamlessly with the chat layout
 * Automatically hides the footer when open
 */
export function ChatPopup({
  isOpen,
  onClose,
  title,
  children,
  position = "bottom",
}: ChatPopupProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Popup */}
          <motion.div
            initial={
              position === "bottom"
                ? { y: "100%" }
                : { scale: 0.95, opacity: 0 }
            }
            animate={
              position === "bottom"
                ? { y: 0 }
                : { scale: 1, opacity: 1 }
            }
            exit={
              position === "bottom"
                ? { y: "100%" }
                : { scale: 0.95, opacity: 0 }
            }
            transition={{ 
              type: "spring",
              damping: 30,
              stiffness: 300,
            }}
            className={cn(
              "fixed z-50 bg-background rounded-t-3xl shadow-2xl",
              position === "bottom"
                ? "bottom-0 left-0 right-0 max-h-[80vh]"
                : "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md rounded-2xl"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-lg">{title || "Options"}</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

