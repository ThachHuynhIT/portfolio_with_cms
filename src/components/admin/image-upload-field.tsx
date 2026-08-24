"use client";

import { useRef, type ChangeEvent } from "react";
import { Loader2Icon, UploadIcon, XIcon } from "lucide-react";
import { Button } from "@components/ui/button";
import { RemoteImage } from "@components/public/remote-image";
import { useImageUpload } from "./use-image-upload";
import type { UploadTarget } from "@lib/admin/cloudinary";
import { ALLOWED_MIME_TYPES } from "@lib/admin/upload-limits";
import styles from "./image-upload-field.module.scss";

type ImageUploadFieldProps = {
  id: string;
  target: UploadTarget;
  value: string | null | undefined;
  onChange: (url: string) => void;
  alt: string;
};

export function ImageUploadField({
  id,
  target,
  value,
  onChange,
  alt,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { upload, isUploading, error } = useImageUpload(target);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Reset so selecting the same file again still fires onChange.
    event.target.value = "";
    if (!file) return;

    const result = await upload(file);
    if (result.url) onChange(result.url);
  }

  return (
    <div className={styles.wrapper}>
      {value && (
        <div className={styles.preview}>
          <RemoteImage src={value} alt={alt} sizes="160px" />
        </div>
      )}

      <div className={styles.actions}>
        {/* The hidden input is never itself the labelled/focusable control
            — `id` lives on the button below so <FieldLabel htmlFor> forwards
            activation to something a keyboard/screen-reader user can
            actually reach (a `display:none` input can't be tabbed to). */}
        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED_MIME_TYPES.join(",")}
          className={styles.hiddenInput}
          onChange={handleFileChange}
          disabled={isUploading}
          tabIndex={-1}
          aria-hidden="true"
        />
        <Button
          id={id}
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
          {isUploading
            ? "Uploading..."
            : value
              ? "Replace image"
              : "Upload image"}
        </Button>
        {value && !isUploading && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange("")}
          >
            <XIcon aria-hidden="true" />
            Remove
          </Button>
        )}
      </div>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
