"use client";

import { useEffect } from "react";

// Warns before an actual page unload (refresh, close tab, external link)
// when the form has unsaved changes. In-app navigation isn't covered here —
// AdminFormActions' own Cancel button guards that narrower case directly,
// since it's the one in-app link a form actually renders.
export function useUnsavedChangesGuard(isDirty: boolean) {
  useEffect(() => {
    if (!isDirty) return;

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);
}
