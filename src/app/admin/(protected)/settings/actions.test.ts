import { describe, expect, it, vi, beforeEach, type Mock } from "vitest";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    siteSettings: { upsert: vi.fn() },
  },
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// `auth` is overloaded (it also doubles as a middleware wrapper — see
// src/proxy.ts), so `vi.mocked(auth)` resolves the wrong call signature.
// Cast to the mock explicitly instead.
const mockedAuth = auth as unknown as Mock;
import { updateSiteSettingsAction } from "./actions";

const validInput = {
  siteName: "Jane Doe",
  tagline: "",
  heroHeadline: "",
  heroSubtext: "",
  heroImageUrl: "",
  bio: "",
  avatarUrl: "",
  resumeFileUrl: "",
  contactEmail: "",
  socialLinks: {},
  defaultSeoTitle: "",
  defaultSeoDescription: "",
  ogImageUrl: "",
};

// Guards Phase 9's C1 exit criterion: every server action must check auth
// itself, independent of the admin layout gate. Removing the `auth()` check
// from this action should fail this test.
describe("updateSiteSettingsAction requires auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedAuth.mockResolvedValue(null);
  });

  it("rejects when unauthenticated without touching Prisma", async () => {
    const result = await updateSiteSettingsAction(validInput);
    expect(result).toEqual({ error: "Unauthorized." });
    expect(prisma.siteSettings.upsert).not.toHaveBeenCalled();
  });
});

// Coverage gap identified while building Phase 10 PR C's `useAdminForm`:
// the auth-check test above never exercises the *authenticated* path, so a
// removed/weakened `safeParse` call would pass it.
describe("updateSiteSettingsAction validates input even when authenticated", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedAuth.mockResolvedValue({
      user: { id: "admin-1", email: "admin@example.com" },
    });
  });

  it("rejects invalid input without touching Prisma", async () => {
    const result = await updateSiteSettingsAction({
      ...validInput,
      siteName: "",
    });
    expect(result?.error).toBeTruthy();
    expect(prisma.siteSettings.upsert).not.toHaveBeenCalled();
  });
});
