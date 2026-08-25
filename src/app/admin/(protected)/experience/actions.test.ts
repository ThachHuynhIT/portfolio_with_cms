import { describe, expect, it, vi, beforeEach, type Mock } from "vitest";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    experienceEntry: { create: vi.fn(), update: vi.fn(), delete: vi.fn() },
  },
}));

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// `auth` is overloaded (it also doubles as a middleware wrapper — see
// src/proxy.ts), so `vi.mocked(auth)` resolves the wrong call signature.
// Cast to the mock explicitly instead.
const mockedAuth = auth as unknown as Mock;
import {
  createExperienceEntryAction,
  updateExperienceEntryAction,
  deleteExperienceEntryAction,
} from "./actions";

const validInput = {
  type: "WORK" as const,
  title: "Senior Engineer",
  organization: "Acme Corp",
  location: "Remote",
  startDate: "2020-01-15",
  endDate: "",
  description: "Built things.",
  order: 0,
};

// Guards Phase 9's C1 exit criterion: every server action must check auth
// itself, independent of the admin layout gate. Removing the `auth()` check
// from any of these actions should fail this test.
describe("experience entry server actions require auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedAuth.mockResolvedValue(null);
  });

  it("createExperienceEntryAction rejects when unauthenticated without touching Prisma", async () => {
    const result = await createExperienceEntryAction(validInput);
    expect(result).toEqual({ error: "Unauthorized." });
    expect(prisma.experienceEntry.create).not.toHaveBeenCalled();
  });

  it("updateExperienceEntryAction rejects when unauthenticated without touching Prisma", async () => {
    const result = await updateExperienceEntryAction("some-id", validInput);
    expect(result).toEqual({ error: "Unauthorized." });
    expect(prisma.experienceEntry.update).not.toHaveBeenCalled();
  });

  it("deleteExperienceEntryAction rejects when unauthenticated without touching Prisma", async () => {
    const result = await deleteExperienceEntryAction("some-id");
    expect(result).toEqual({ error: "Unauthorized." });
    expect(prisma.experienceEntry.delete).not.toHaveBeenCalled();
  });
});

// Coverage gap identified while building Phase 10 PR C's `useAdminForm`:
// the auth-check tests above never exercise the *authenticated* path, so a
// removed/weakened `safeParse` call would pass every existing test here.
describe("experience entry server actions validate input even when authenticated", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedAuth.mockResolvedValue({
      user: { id: "admin-1", email: "admin@example.com" },
    });
  });

  it("createExperienceEntryAction rejects invalid input without touching Prisma", async () => {
    const result = await createExperienceEntryAction({
      ...validInput,
      title: "",
    });
    expect(result?.error).toBeTruthy();
    expect(prisma.experienceEntry.create).not.toHaveBeenCalled();
  });

  it("updateExperienceEntryAction rejects invalid input without touching Prisma", async () => {
    const result = await updateExperienceEntryAction("some-id", {
      ...validInput,
      title: "",
    });
    expect(result?.error).toBeTruthy();
    expect(prisma.experienceEntry.update).not.toHaveBeenCalled();
  });
});
