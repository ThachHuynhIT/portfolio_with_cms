"use client";

import { useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { XIcon } from "lucide-react";
import styles from "./tags-input.module.scss";

// The RHF field value stays the same comma-separated string
// `commaSeparatedTags` (shared-schema.ts) already expects — this is a UI
// layer only, not a schema/transform change (see the design spec's §8.4).
export function TagsInput({
  id,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const tags = value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  const [draft, setDraft] = useState("");

  function commitDraft() {
    const next = draft.trim();
    setDraft("");
    if (!next) return;
    onChange([...tags, next].join(", "));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      commitDraft();
    } else if (event.key === "Backspace" && draft === "" && tags.length > 0) {
      onChange(tags.slice(0, -1).join(", "));
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    const pasted = event.clipboardData.getData("text");
    if (!pasted.includes(",")) return;
    event.preventDefault();
    const pastedTags = pasted
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    onChange([...tags, ...pastedTags].join(", "));
  }

  function removeTag(index: number) {
    onChange(tags.filter((_, i) => i !== index).join(", "));
  }

  return (
    <div className={styles.wrapper}>
      {tags.map((tag, index) => (
        <span key={`${tag}-${index}`} className={styles.chip}>
          {tag}
          <button
            type="button"
            aria-label={`Remove ${tag}`}
            onClick={() => removeTag(index)}
          >
            <XIcon aria-hidden="true" />
          </button>
        </span>
      ))}
      <input
        id={id}
        className={styles.input}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commitDraft}
        onPaste={handlePaste}
        placeholder={tags.length === 0 ? placeholder : undefined}
      />
    </div>
  );
}
