"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { Loader2Icon, PlusIcon, UploadIcon, XIcon } from "lucide-react";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { useImageUpload } from "./use-image-upload";
import type { UploadTarget } from "@lib/admin/cloudinary";
import { ALLOWED_MIME_TYPES } from "@lib/admin/upload-limits";
import styles from "./url-list-input.module.scss";

// The RHF field value stays the same newline-separated string
// `lineSeparatedUrls` (project-schema.ts) already expects — this is a UI
// layer only, not a schema/transform change (see the design spec's §8.4).
export function UrlListInput({
  id,
  value,
  onChange,
  uploadTarget,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  uploadTarget: UploadTarget;
}) {
  const rows = value.split("\n");
  const inputRef = useRef<HTMLInputElement>(null);
  const { upload, isUploading } = useImageUpload(uploadTarget);
  const [batchError, setBatchError] = useState<string | null>(null);

  function updateRow(index: number, next: string) {
    const nextRows = [...rows];
    nextRows[index] = next;
    onChange(nextRows.join("\n"));
  }

  function removeRow(index: number) {
    onChange(rows.filter((_, i) => i !== index).join("\n"));
  }

  function addRow() {
    onChange([...rows, ""].join("\n"));
  }

  async function handleFilesSelected(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;

    setBatchError(null);
    const uploadedUrls: string[] = [];
    let failureCount = 0;
    let lastFailureMessage: string | null = null;
    // Sequential, not Promise.all: each `upload()` call shares one
    // `useImageUpload` instance's isUploading state, so overlapping calls
    // would race on that state.
    for (const file of files) {
      const result = await upload(file);
      if (result.url) {
        uploadedUrls.push(result.url);
      } else {
        failureCount++;
        lastFailureMessage = result.error;
      }
    }

    if (uploadedUrls.length > 0) {
      const existingRows = rows.filter((row) => row.trim() !== "");
      onChange([...existingRows, ...uploadedUrls].join("\n"));
    }
    // A later successful upload resets useImageUpload's own `error` to
    // null, which would otherwise silently hide an earlier file's failure
    // — surface a count-based summary instead so a partial failure is
    // never lost.
    if (failureCount > 0) {
      setBatchError(
        `${failureCount} of ${files.length} image${files.length > 1 ? "s" : ""} failed to upload${
          lastFailureMessage ? ` (${lastFailureMessage})` : ""
        }.`
      );
    }
  }

  return (
    <div className={styles.stack} id={id}>
      {rows.map((row, index) => (
        <div key={index} className={styles.row}>
          <Input
            value={row}
            onChange={(event) => updateRow(index, event.target.value)}
            placeholder="https://..."
            aria-label={`Gallery URL ${index + 1}`}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Remove gallery URL ${index + 1}`}
            onClick={() => removeRow(index)}
          >
            <XIcon aria-hidden="true" />
          </Button>
        </div>
      ))}
      <div className={styles.row}>
        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED_MIME_TYPES.join(",")}
          multiple
          className={styles.hiddenInput}
          onChange={handleFilesSelected}
          disabled={isUploading}
          tabIndex={-1}
          aria-hidden="true"
        />
        <Button type="button" variant="outline" size="sm" onClick={addRow}>
          <PlusIcon aria-hidden="true" />
          Add URL
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
        >
          {isUploading ? (
            <Loader2Icon aria-hidden="true" className={styles.spinner} />
          ) : (
            <UploadIcon aria-hidden="true" />
          )}
          {isUploading ? "Uploading..." : "Upload images"}
        </Button>
      </div>
      {batchError && (
        <p className={styles.error} role="alert">
          {batchError}
        </p>
      )}
    </div>
  );
}
