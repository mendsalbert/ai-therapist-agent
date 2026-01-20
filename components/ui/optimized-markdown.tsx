"use client";

import { lazy, Suspense } from "react";

// Lazy load ReactMarkdown to reduce initial bundle size
const ReactMarkdown = lazy(() => import("react-markdown"));

interface OptimizedMarkdownProps {
  children: string;
  className?: string;
}

export function OptimizedMarkdown({ children, className }: OptimizedMarkdownProps) {
  return (
    <Suspense
      fallback={
        <div className={className}>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      }
    >
      <ReactMarkdown className={className}>{children}</ReactMarkdown>
    </Suspense>
  );
}