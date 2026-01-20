"use client";

import { lazy, Suspense, ComponentType } from "react";
import type { Variants, Transition } from "framer-motion";

// Lazy load framer-motion to reduce initial bundle size
const MotionDiv = lazy(() =>
  import("framer-motion").then((mod) => ({ default: mod.motion.div }))
);
const MotionSpan = lazy(() =>
  import("framer-motion").then((mod) => ({ default: mod.motion.span }))
);
const AnimatePresence = lazy(() =>
  import("framer-motion").then((mod) => ({ default: mod.AnimatePresence }))
);

interface OptimizedMotionProps {
  children: React.ReactNode;
  className?: string;
  initial?: any;
  animate?: any;
  exit?: any;
  variants?: Variants;
  transition?: Transition;
}

export function OptimizedMotion({
  children,
  className,
  ...props
}: OptimizedMotionProps) {
  return (
    <Suspense fallback={<div className={className}>{children}</div>}>
      <MotionDiv className={className} {...props}>
        {children}
      </MotionDiv>
    </Suspense>
  );
}

export function OptimizedAnimatePresence({
  children,
  ...props
}: {
  children: React.ReactNode;
  mode?: "sync" | "wait" | "popLayout";
  initial?: boolean;
}) {
  return (
    <Suspense fallback={<>{children}</>}>
      <AnimatePresence {...props}>{children}</AnimatePresence>
    </Suspense>
  );
}