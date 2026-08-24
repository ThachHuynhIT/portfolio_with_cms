"use client";

import { useRef, useState } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import {
  BoldIcon,
  CodeIcon,
  Heading2Icon,
  ItalicIcon,
  LinkIcon,
  ListIcon,
  QuoteIcon,
} from "lucide-react";
import { Field, FieldError, FieldLabel } from "@components/ui/field";
import { Textarea } from "@components/ui/textarea";
import { Markdown } from "@components/markdown/markdown";
import styles from "./markdown-field.module.scss";

type ToolbarAction =
  | { type: "wrap"; before: string; after: string }
  | { type: "prefixLine"; prefix: string };

const TOOLBAR: { label: string; icon: typeof BoldIcon; action: ToolbarAction }[] = [
  { label: "Bold", icon: BoldIcon, action: { type: "wrap", before: "**", after: "**" } },
  { label: "Italic", icon: ItalicIcon, action: { type: "wrap", before: "_", after: "_" } },
  { label: "Link", icon: LinkIcon, action: { type: "wrap", before: "[", after: "](url)" } },
  { label: "Inline code", icon: CodeIcon, action: { type: "wrap", before: "`", after: "`" } },
  { label: "Heading", icon: Heading2Icon, action: { type: "prefixLine", prefix: "## " } },
  { label: "List", icon: ListIcon, action: { type: "prefixLine", prefix: "- " } },
  { label: "Quote", icon: QuoteIcon, action: { type: "prefixLine", prefix: "> " } },
];

// Edit/Preview is a 2-button toggle group with `aria-pressed`, not a tablist
// — there's one textarea with two render modes, not two independently
// focusable panels. From `lg` up, both panes show side by side instead
// (CSS-driven — the toggle buttons hide there, since there's nothing left
// to toggle).
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
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  function setRefs(el: HTMLTextAreaElement | null) {
    textareaRef.current = el;
    inputProps.ref(el);
  }

  // `setRangeText` edits the DOM value directly without going through
  // React, so RHF's registered `onChange` (listening on the native `input`
  // event via its own ref) never fires on its own — dispatch one so RHF
  // picks up the new value.
  function runToolbarAction(action: ToolbarAction) {
    const el = textareaRef.current;
    if (!el) return;
    el.focus();

    if (action.type === "wrap") {
      const { selectionStart: start, selectionEnd: end } = el;
      const selected = el.value.slice(start, end);
      el.setRangeText(`${action.before}${selected}${action.after}`, start, end, "select");
    } else {
      const lineStart = el.value.lastIndexOf("\n", el.selectionStart - 1) + 1;
      el.setRangeText(action.prefix, lineStart, lineStart, "end");
    }

    el.dispatchEvent(new Event("input", { bubbles: true }));
  }

  return (
    <Field>
      <div className={styles.header}>
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
        <div
          className={styles.toggleGroup}
          role="group"
          aria-label={`${label} view`}
        >
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

      {/* role="group", not "toolbar" — the ARIA toolbar role implies
          arrow-key roving-tabindex navigation between its controls, which
          this doesn't implement; declaring it without that behavior would
          be a worse a11y bug than a plain tab-through button group. */}
      <div className={styles.toolbar} role="group" aria-label={`${label} formatting`}>
        {TOOLBAR.map(({ label: actionLabel, icon: Icon, action }) => (
          <button
            key={actionLabel}
            type="button"
            className={styles.toolbarButton}
            aria-label={actionLabel}
            title={actionLabel}
            onClick={() => runToolbarAction(action)}
          >
            <Icon aria-hidden="true" />
          </button>
        ))}
        <span className={styles.charCount}>{value.length} characters</span>
      </div>

      <div className={styles.body}>
        <div className={showPreview ? styles.paneHidden : styles.pane}>
          <Textarea
            id={id}
            rows={rows}
            aria-invalid={!!error}
            {...inputProps}
            ref={setRefs}
          />
        </div>
        <div className={showPreview ? styles.pane : styles.paneHidden}>
          <div className={styles.preview}>
            <Markdown content={value ?? ""} />
          </div>
        </div>
      </div>

      <FieldError errors={[error]} />
    </Field>
  );
}
