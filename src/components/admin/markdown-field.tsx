"use client";

import { useState } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "@components/ui/field";
import { Textarea } from "@components/ui/textarea";
import { Markdown } from "@components/markdown/markdown";
import styles from "./markdown-field.module.scss";

// Edit/Preview is a 2-button toggle group with `aria-pressed`, not a tablist
// — there's one textarea with two render modes, not two independently
// focusable panels.
export function MarkdownField({
  id,
  label,
  value,
  error,
  rows = 10,
  inputProps,
}: {
  id: string;
  label: string;
  value: string;
  error?: { message?: string };
  rows?: number;
  inputProps: UseFormRegisterReturn;
}) {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <Field>
      <div className={styles.header}>
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
        <div className={styles.toggleGroup} role="group" aria-label={`${label} view`}>
          <button
            type="button"
            aria-pressed={!showPreview}
            className={styles.toggleButton}
            onClick={() => setShowPreview(false)}
          >
            Edit
          </button>
          <button
            type="button"
            aria-pressed={showPreview}
            className={styles.toggleButton}
            onClick={() => setShowPreview(true)}
          >
            Preview
          </button>
        </div>
      </div>
      {showPreview ? (
        <div className={styles.preview}>
          <Markdown content={value ?? ""} />
        </div>
      ) : (
        <Textarea id={id} rows={rows} aria-invalid={!!error} {...inputProps} />
      )}
      <FieldError errors={[error]} />
    </Field>
  );
}
