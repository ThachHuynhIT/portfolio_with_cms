"use client";

import * as m from "motion/react-m";
import type { ReactNode } from "react";
import { distance, duration, ease } from "@styles/motion";

type PageTransitionProps = {
  children: ReactNode;
  className?: string;
};

// Entrance for a page's <main> on mount. Never apply this to a hero
// headline or other LCP candidate directly — animate a wrapper around it
// (or the subtext/CTA next to it) instead, never the LCP element itself.
export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <m.div
      className={className}
      initial={{ opacity: 0, y: distance.sm }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: duration.base, ease: ease.out }}
    >
      {children}
    </m.div>
  );
}
