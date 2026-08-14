import { describe, expect, it, vi, beforeEach, type Mock } from "vitest";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: { project: { create: vi.fn(), update: vi.fn(), delete: vi.fn() } },
}));

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// `auth` is overloaded (it also doubles as a middleware wrapper — see
// src/proxy.ts), so `vi.mocked(auth)` resolves the wrong call signature.
// Cast to the mock explicitly instead.
const mockedAuth = auth as unknown as Mock;
import {
  createProjectAction,
  updateProjectAction,
  deleteProjectAction,
} from "./actions";

const validInput = {
  title: "My Project",
  slug: "my-project",
  summary: "",
  description: "",
  coverImageUrl: "",
  galleryUrls: "",
  techTags: "",
  liveUrl: "",
  repoUrl: "",
  order: 0,
  featured: false,
  status: "DRAFT" as const,
  seoTitle: "",
  seoDescription: "",
};

// Guards Phase 9's C1 exit criterion: every server action must check auth
// itself, independent of the admin layout gate. Removing the `auth()` check
// from any of these actions should fail this test.
describe("project server actions require auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedAuth.mockResolvedValue(null);
  });

  it("createProjectAction rejects when unauthenticated without touching Prisma", async () => {
    const result = await createProjectAction(validInput);
    expect(result).toEqual({ error: "Unauthorized." });
    expect(prisma.project.create).not.toHaveBeenCalled();
  });

  it("updateProjectAction rejects when unauthenticated without touching Prisma", async () => {
    const result = await updateProjectAction("some-id", validInput);
    expect(result).toEqual({ error: "Unauthorized." });
    expect(prisma.project.update).not.toHaveBeenCalled();
  });

  it("deleteProjectAction rejects when unauthenticated without touching Prisma", async () => {
    const result = await deleteProjectAction("some-id");
    expect(result).toEqual({ error: "Unauthorized." });
    expect(prisma.project.delete).not.toHaveBeenCalled();
  });
});
