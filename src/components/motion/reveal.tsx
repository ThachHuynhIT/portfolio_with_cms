"use client";

import * as m from "motion/react-m";
import type { ReactNode } from "react";
import { distance, duration, ease } from "@styles/motion";

type RevealProps = {
  children: ReactNode;
  delay?: number;
  distance?: keyof typeof distance;
  className?: string;
};

// Fade + rise into view once, the first time it crosses the viewport.
// Never wrap an LCP candidate (e.g. a hero heading) in this — starting at
// opacity 0 delays when the browser considers that element "painted".
export function Reveal({
  children,
  delay = 0,
  distance: distanceKey = "md",
  className,
}: RevealProps) {
  return (
    <m.div
      className={className}
      initial={{ opacity: 0, y: distance[distanceKey] }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: duration.base, ease: ease.out, delay }}
    >
      {children}
    </m.div>
  );
}
