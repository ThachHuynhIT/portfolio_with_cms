"use client";

import Link from "next/link";
import { Button } from "@components/ui/button";
import styles from "./admin-form-actions.module.scss";

export function AdminFormActions({
  submitLabel,
  isSubmitting,
  isDirty,
  saved,
  cancelHref,
  destructive,
}: {
  submitLabel: string;
  isSubmitting: boolean;
  isDirty?: boolean;
  saved?: boolean;
  cancelHref?: string;
  destructive?: boolean;
}) {
  function guardCancelNavigate(event: { preventDefault: () => void }) {
    if (isDirty && !window.confirm("You have unsaved changes. Leave anyway?")) {
      event.preventDefault();
    }
  }

  return (
    <div className={styles.actions}>
      <div className={styles.status} role="status">
        {isSubmitting
          ? "Saving..."
          : isDirty
            ? "Unsaved changes"
            : saved
              ? "Saved"
              : null}
      </div>
      <div className={styles.buttons}>
        {cancelHref && (
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href={cancelHref} onNavigate={guardCancelNavigate} />}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant={destructive ? "destructive" : "default"}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </div>
    </div>
  );
}
