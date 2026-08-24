"use client";

import { useState } from "react";
import {
  getUploadSignatureAction,
  enforceUploadSizeAction,
} from "@/app/admin/(protected)/actions";
import type { UploadTarget } from "@lib/admin/cloudinary";
// Deliberately from upload-limits.ts, not cloudinary.ts: that module
// configures the `cloudinary` Node SDK with CLOUDINARY_API_SECRET at import
// time, which must never end up in a client bundle.
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from "@lib/admin/upload-limits";

// The client-side type/size checks below are UX only (instant feedback
// before spending a round trip) — Cloudinary has no way to enforce a size
// cap ahead of time for signed uploads on this account (see
// docs/LESSONS.md), so the real enforcement is: `allowed_formats` signed
// directly in the request (rejected server-side before the file is even
// stored), and a post-upload size check that destroys an oversized asset
// via `enforceUploadSizeAction` instead of ever returning its URL.
async function uploadToCloudinary(
  file: File,
  target: UploadTarget
): Promise<string> {
  const signed = await getUploadSignatureAction(target);
  if ("error" in signed) throw new Error(signed.error);

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", signed.data.apiKey);
  formData.append("timestamp", String(signed.data.timestamp));
  formData.append("signature", signed.data.signature);
  formData.append("folder", signed.data.folder);
  formData.append("allowed_formats", signed.data.allowedFormats);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${signed.data.cloudName}/image/upload`,
    { method: "POST", body: formData }
  );
  const json = await response.json();
  if (!response.ok) {
    throw new Error(json?.error?.message ?? "Upload failed.");
  }

  const sizeCheck = await enforceUploadSizeAction(json.public_id, json.bytes);
  if ("error" in sizeCheck) throw new Error(sizeCheck.error);

  return json.secure_url as string;
}

export type UploadResult = { url: string | null; error: string | null };

export function useImageUpload(target: UploadTarget) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Returns the outcome directly (not just via the `error` state above) so
  // a caller uploading several files in sequence can read each file's own
  // result — reading `error` state instead would only ever see the last
  // call's value, since state updates don't change what an in-flight async
  // function's own local variables see.
  async function upload(file: File): Promise<UploadResult> {
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      const message = "Unsupported format — use JPG, PNG, WEBP, or GIF.";
      setError(message);
      return { url: null, error: message };
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const message = "File is larger than 5MB.";
      setError(message);
      return { url: null, error: message };
    }

    setError(null);
    setIsUploading(true);
    try {
      const url = await uploadToCloudinary(file, target);
      return { url, error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed.";
      setError(message);
      return { url: null, error: message };
    } finally {
      setIsUploading(false);
    }
  }

  return { upload, isUploading, error };
}
