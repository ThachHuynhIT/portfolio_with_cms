"use server";

import { auth, signOut } from "@/auth";
import {
  createUploadSignature,
  enforceMaxFileSize,
  isUploadTarget,
  type UploadSignature,
} from "@lib/admin/cloudinary";

export async function logoutAction() {
  await signOut({ redirectTo: "/admin/login" });
}

export type UploadSignatureActionState =
  | { data: UploadSignature }
  | { error: string };

export async function getUploadSignatureAction(
  target: unknown
): Promise<UploadSignatureActionState> {
  const session = await auth();
  if (!session) return { error: "Unauthorized." };

  if (!isUploadTarget(target)) return { error: "Invalid upload target." };

  return { data: createUploadSignature(target) };
}

export type EnforceUploadSizeActionState = { ok: true } | { error: string };

// Cloudinary has no signed param to cap upload size ahead of time (see
// docs/LESSONS.md) — the client uploads, then calls this with what
// Cloudinary reported back. An oversized asset is destroyed here rather
// than accepted into a form field.
export async function enforceUploadSizeAction(
  publicId: unknown,
  bytes: unknown
): Promise<EnforceUploadSizeActionState> {
  const session = await auth();
  if (!session) return { error: "Unauthorized." };

  if (typeof publicId !== "string" || !publicId) {
    return { error: "Invalid upload." };
  }
  if (typeof bytes !== "number" || !Number.isFinite(bytes)) {
    return { error: "Invalid upload." };
  }

  const result = await enforceMaxFileSize(publicId, bytes);
  if (!result.ok) return { error: "File is larger than 5MB." };
  return { ok: true };
}
