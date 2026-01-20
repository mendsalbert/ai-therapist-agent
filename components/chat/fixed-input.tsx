"use client";

import React, { FormEvent, useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Send } from "lucide-react";
import { useKeyboardOffset } from "@/hooks/useKeyboardOffset";

interface FixedInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (e: FormEvent) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  onFocusScrollIntoView?: () => void;
  rightAccessories?: React.ReactNode;
  isPopupOpen?: boolean;
  hideFooter?: boolean;
}

/**
 * FixedInput - Chat input that stays fixed at the bottom and automatically
 * adjusts position when the mobile keyboard appears.
 * 
 * Keyboard behavior:
 * - When keyboard is closed: Fixed at bottom of screen
 * - When keyboard opens: Automatically moves up to stay above keyboard
 * - Uses window.visualViewport API for accurate keyboard height detection
 * - Smooth transitions with no layout jumps
 */
export function FixedInput({
  value,
  onChange,
  onSend,
  placeholder = "Type a message...",
  disabled,
  className,
  onFocusScrollIntoView,
  rightAccessories,
  isPopupOpen = false,
  hideFooter = false,
}: FixedInputProps) {
  const offset = useKeyboardOffset(); // Tracks keyboard height in real-time
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    // Auto-grow textarea height up to a sensible max
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`; // Match max-h-[120px]
  }, [value]);

  // Handle form submission
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!value.trim() || disabled) return;
    
    // Call the parent's onSend handler
    onSend(e);
    
    // Keep textarea focused after sending to maintain keyboard visibility
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 50);
  };

  // Prevent body scroll when popup is open
  useEffect(() => {
    if (isPopupOpen && typeof document !== "undefined") {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      document.body.style.top = '0';
    } else if (!isPopupOpen) {
      // Don't reset if keyboard is handling it
      const isKeyboardOpen = document.documentElement.classList.contains('keyboard-open');
      if (!isKeyboardOpen) {
        document.body.style.overflow = "";
        document.body.style.position = "";
        document.body.style.width = "";
        document.body.style.top = "";
      }
    }

    return () => {
      const isKeyboardOpen = document.documentElement.classList.contains('keyboard-open');
      if (!isKeyboardOpen) {
        document.body.style.overflow = "";
        document.body.style.position = "";
        document.body.style.width = "";
        document.body.style.top = "";
      }
    };
  }, [isPopupOpen]);

  return (
    <div
      className={cn(
        // ALWAYS fixed positioning relative to viewport
        "fixed left-0 right-0 z-[60]",
        "border-t bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80",
        "fixed-input-container",
        (hideFooter || isPopupOpen) && "opacity-0 pointer-events-none",
        className
      )}
      style={{
        // Always stay fixed to bottom, positioned from bottom of viewport
        position: 'fixed',
        bottom: (hideFooter || isPopupOpen) 
          ? '-200px' // Move completely out of view
          : `calc(${offset}px + env(safe-area-inset-bottom))`,
        transition: 'none', // Remove transitions to prevent jumping
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="max-w-3xl mx-auto px-3 py-2 flex gap-2 items-end"
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
            onFocusScrollIntoView?.();
          }}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={cn(
            "flex-1 resize-none rounded-xl border bg-background",
            "px-3 py-2 pr-10 min-h-[40px] max-h-[120px]",
            "text-sm",
            "focus:outline-none focus:ring-1 focus:ring-primary/50",
            "transition-all duration-200",
            disabled && "opacity-50 cursor-not-allowed",
            isFocused && "ring-1 ring-primary/50 border-primary/50"
          )}
          rows={1}
          disabled={disabled}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e as unknown as FormEvent);
            }
          }}
        />
        {rightAccessories}
        <Button
          type="submit"
          size="icon"
          className={cn(
            "h-[32px] w-[32px] rounded-lg transition-all duration-200 shrink-0",
            "bg-primary hover:bg-primary/90 shadow-sm shadow-primary/20",
            (!value.trim() || disabled) && "opacity-50 cursor-not-allowed"
          )}
          disabled={!value.trim() || disabled}
        >
          <Send className="w-3.5 h-3.5" />
        </Button>
      </form>
    </div>
  );
}


