"use client";

import { PrinterIcon } from "lucide-react";

// A recruiter won't necessarily know to reach for Ctrl/Cmd+P themselves —
// this button exists to surface that the page is meant to be printed.
export function PrintButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => window.print()}
    >
      <PrinterIcon aria-hidden="true" />
      Print
    </button>
  );
}
