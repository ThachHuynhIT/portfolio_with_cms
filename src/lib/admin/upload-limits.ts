// Single source of truth for the client-side pre-check (use-image-upload.ts)
// and the server-side signing/enforcement (cloudinary.ts). Deliberately its
// own module with zero Node-only imports so the client hook can import it
// without ever pulling the `cloudinary` SDK (and its config using
// CLOUDINARY_API_SECRET) into the browser bundle.
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_FORMATS = "jpg,jpeg,png,webp,gif";
export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];
