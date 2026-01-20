"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function SkipLink({ href, children, className }: SkipLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4',
        'bg-blue-600 text-white px-4 py-2 rounded-md',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        'z-50 transition-all duration-200',
        className
      )}
      onFocus={(e) => {
        // Ensure the link is visible when focused
        e.currentTarget.classList.remove('sr-only');
      }}
      onBlur={(e) => {
        // Hide the link when not focused
        e.currentTarget.classList.add('sr-only');
      }}
    >
      {children}
    </a>
  );
}

// Skip to main content link
export function SkipToMainContent() {
  return (
    <SkipLink href="#main-content">
      Skip to main content
    </SkipLink>
  );
}

// Skip to navigation link
export function SkipToNavigation() {
  return (
    <SkipLink href="#main-navigation">
      Skip to navigation
    </SkipLink>
  );
}
