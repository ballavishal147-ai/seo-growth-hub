"use client";

import * as React from "react";
import { LazyMotion, domAnimation, MotionConfig } from "framer-motion";

/**
 * LazyMotion + domAnimation loads only the DOM animation features
 * (~15kb) instead of the full Framer Motion bundle. Components
 * should import `m` from "framer-motion" instead of `motion` when
 * inside this provider (see src/components/ui for the pattern).
 *
 * MotionConfig applies a global reduced-motion policy so individual
 * components don't each need to check prefers-reduced-motion.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
