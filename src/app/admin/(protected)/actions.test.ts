import { describe, expect, it, vi, beforeEach, type Mock } from "vitest";

vi.mock("@/auth", () => ({ auth: vi.fn(), signOut: vi.fn() }));
vi.mock("@lib/admin/cloudinary", () => ({
  isUploadTarget: vi.fn(),
  createUploadSignature: vi.fn(),
  enforceMaxFileSize: vi.fn(),
}));

import { auth } from "@/auth";
import {
  isUploadTarget,
  createUploadSignature,
  enforceMaxFileSize,
} from "@lib/admin/cloudinary";
import { getUploadSignatureAction, enforceUploadSizeAction } from "./actions";

// `auth` is overloaded (it also doubles as a middleware wrapper — see
// src/proxy.ts), so `vi.mocked(auth)` resolves the wrong call signature.
// Cast to the mock explicitly instead.
const mockedAuth = auth as unknown as Mock;
const mockedIsUploadTarget = isUploadTarget as unknown as Mock;
const mockedCreateUploadSignature = createUploadSignature as unknown as Mock;
const mockedEnforceMaxFileSize = enforceMaxFileSize as unknown as Mock;

// Guards Phase 9's C1 exit criterion (this action is Phase 11 but the same
// rule applies): every server action must check auth itself, independent of
// the admin layout gate.
describe("getUploadSignatureAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects when unauthenticated without ever signing anything", async () => {
    mockedAuth.mockResolvedValue(null);

    const result = await getUploadSignatureAction("project-cover");

    expect(result).toEqual({ error: "Unauthorized." });
    expect(mockedCreateUploadSignature).not.toHaveBeenCalled();
  });

  it("rejects a target outside the known whitelist, even when authenticated", async () => {
    mockedAuth.mockResolvedValue({ user: { email: "admin@example.com" } });
    mockedIsUploadTarget.mockReturnValue(false);

    const result = await getUploadSignatureAction("../../etc/passwd");

    expect(result).toEqual({ error: "Invalid upload target." });
    expect(mockedCreateUploadSignature).not.toHaveBeenCalled();
  });

  it("returns a signature for a valid target when authenticated", async () => {
    mockedAuth.mockResolvedValue({ user: { email: "admin@example.com" } });
    mockedIsUploadTarget.mockReturnValue(true);
    mockedCreateUploadSignature.mockReturnValue({ signature: "sig" });

    const result = await getUploadSignatureAction("project-cover");

    expect(mockedCreateUploadSignature).toHaveBeenCalledWith("project-cover");
    expect(result).toEqual({ data: { signature: "sig" } });
  });
});

describe("enforceUploadSizeAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects when unauthenticated without ever calling Cloudinary", async () => {
    mockedAuth.mockResolvedValue(null);

    const result = await enforceUploadSizeAction("public-id", 1000);

    expect(result).toEqual({ error: "Unauthorized." });
    expect(mockedEnforceMaxFileSize).not.toHaveBeenCalled();
  });

  it("rejects malformed input even when authenticated", async () => {
    mockedAuth.mockResolvedValue({ user: { email: "admin@example.com" } });

    const result = await enforceUploadSizeAction(123, "not-a-number");

    expect(result).toEqual({ error: "Invalid upload." });
    expect(mockedEnforceMaxFileSize).not.toHaveBeenCalled();
  });

  it("returns an error when the asset was over the limit and got destroyed", async () => {
    mockedAuth.mockResolvedValue({ user: { email: "admin@example.com" } });
    mockedEnforceMaxFileSize.mockResolvedValue({ ok: false });

    const result = await enforceUploadSizeAction("public-id", 6_000_000);

    expect(mockedEnforceMaxFileSize).toHaveBeenCalledWith(
      "public-id",
      6_000_000
    );
    expect(result).toEqual({ error: "File is larger than 5MB." });
  });

  it("returns ok when the asset is within the limit", async () => {
    mockedAuth.mockResolvedValue({ user: { email: "admin@example.com" } });
    mockedEnforceMaxFileSize.mockResolvedValue({ ok: true });

    const result = await enforceUploadSizeAction("public-id", 1000);

    expect(result).toEqual({ ok: true });
  });
});
