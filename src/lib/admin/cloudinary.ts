import { v2 as cloudinary } from "cloudinary";
import { ALLOWED_FORMATS, MAX_FILE_SIZE_BYTES } from "./upload-limits";

export { ALLOWED_FORMATS, MAX_FILE_SIZE_BYTES };

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Fixed destination folders, keyed by upload target. The client only ever
// sends a `target` key (validated against this map) — never a raw folder
// path, so a signed request can't be redirected to write anywhere else in
// the Cloudinary account.
const UPLOAD_TARGETS = {
  "site-hero": "portfolio/site/hero",
  "site-avatar": "portfolio/site/avatar",
  "site-og": "portfolio/site/og",
  "project-cover": "portfolio/projects/covers",
  "project-gallery": "portfolio/projects/gallery",
  "blog-cover": "portfolio/blog/covers",
  "skill-icon": "portfolio/skills/icons",
  "testimonial-avatar": "portfolio/testimonials/avatars",
} as const;

export type UploadTarget = keyof typeof UPLOAD_TARGETS;

export function isUploadTarget(value: unknown): value is UploadTarget {
  return typeof value === "string" && value in UPLOAD_TARGETS;
}

// Verified against the real Cloudinary account (not assumed from docs): an
// upload preset's `allowed_formats`/`max_file_size` settings are silently
// NOT enforced for signed uploads here — only `allowed_formats` signed
// directly as an ad-hoc param is. There is no per-request signed param for
// max size, so that limit is enforced after the fact in
// `enforceMaxFileSize` instead. See docs/LESSONS.md.

export type UploadSignature = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  allowedFormats: string;
};

export function createUploadSignature(target: UploadTarget): UploadSignature {
  const folder = UPLOAD_TARGETS[target];
  const timestamp = Math.round(Date.now() / 1000);

  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder, allowed_formats: ALLOWED_FORMATS },
    process.env.CLOUDINARY_API_SECRET!
  );

  return {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    timestamp,
    signature,
    folder,
    allowedFormats: ALLOWED_FORMATS,
  };
}

// Cloudinary has no signed param to cap upload size server-side ahead of
// time, so the limit is enforced here instead: the caller uploads, then
// calls this with the resulting `bytes` + `public_id`; an oversized asset
// is destroyed immediately rather than left referenceable.
export async function enforceMaxFileSize(
  publicId: string,
  bytes: number
): Promise<{ ok: boolean }> {
  if (bytes <= MAX_FILE_SIZE_BYTES) return { ok: true };
  await cloudinary.uploader.destroy(publicId);
  return { ok: false };
}
