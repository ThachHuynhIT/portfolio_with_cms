import { describe, expect, it, vi, beforeEach } from "vitest";

const { apiSignRequest, destroy } = vi.hoisted(() => ({
  apiSignRequest: vi.fn(() => "signed-signature"),
  destroy: vi.fn(() => Promise.resolve({ result: "ok" })),
}));
vi.mock("cloudinary", () => ({
  v2: {
    config: vi.fn(),
    utils: { api_sign_request: apiSignRequest },
    uploader: { destroy },
  },
}));

vi.stubEnv("CLOUDINARY_CLOUD_NAME", "test-cloud");
vi.stubEnv("CLOUDINARY_API_KEY", "test-key");
vi.stubEnv("CLOUDINARY_API_SECRET", "test-secret");

import {
  ALLOWED_FORMATS,
  createUploadSignature,
  enforceMaxFileSize,
  isUploadTarget,
  MAX_FILE_SIZE_BYTES,
  type UploadTarget,
} from "./cloudinary";

describe("isUploadTarget", () => {
  beforeEach(() => vi.clearAllMocks());

  it("accepts every known target", () => {
    const targets: UploadTarget[] = [
      "site-hero",
      "site-avatar",
      "site-og",
      "project-cover",
      "project-gallery",
      "blog-cover",
      "skill-icon",
      "testimonial-avatar",
    ];
    for (const target of targets) {
      expect(isUploadTarget(target)).toBe(true);
    }
  });

  it("rejects an arbitrary string, not just the wrong TS type", () => {
    expect(isUploadTarget("../../etc/passwd")).toBe(false);
    expect(isUploadTarget("")).toBe(false);
    expect(isUploadTarget(undefined)).toBe(false);
  });
});

describe("createUploadSignature", () => {
  beforeEach(() => vi.clearAllMocks());

  // Cloudinary was verified NOT to enforce an upload preset's
  // allowed_formats/max_file_size for signed uploads on this account (see
  // docs/LESSONS.md) — allowed_formats must be signed directly instead.
  it("signs the request with the target's fixed folder and allowed_formats directly, never a caller-supplied folder", () => {
    const result = createUploadSignature("project-gallery");

    expect(apiSignRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        folder: "portfolio/projects/gallery",
        allowed_formats: ALLOWED_FORMATS,
      }),
      "test-secret"
    );
    expect(result.folder).toBe("portfolio/projects/gallery");
    expect(result.allowedFormats).toBe(ALLOWED_FORMATS);
    expect(result.signature).toBe("signed-signature");
    expect(result.cloudName).toBe("test-cloud");
    expect(result.apiKey).toBe("test-key");
  });

  it("never includes the API secret in the returned signature payload", () => {
    const result = createUploadSignature("site-avatar");
    expect(JSON.stringify(result)).not.toContain("test-secret");
  });
});

describe("enforceMaxFileSize", () => {
  beforeEach(() => vi.clearAllMocks());

  it("leaves an asset within the limit alone", async () => {
    const result = await enforceMaxFileSize("some-id", MAX_FILE_SIZE_BYTES);
    expect(result).toEqual({ ok: true });
    expect(destroy).not.toHaveBeenCalled();
  });

  it("destroys an asset over the limit and reports not-ok", async () => {
    const result = await enforceMaxFileSize(
      "some-id",
      MAX_FILE_SIZE_BYTES + 1
    );
    expect(result).toEqual({ ok: false });
    expect(destroy).toHaveBeenCalledWith("some-id");
  });
});
