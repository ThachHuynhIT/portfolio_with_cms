import { describe, expect, it, vi, beforeEach, type Mock } from "vitest";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: { blogPost: { create: vi.fn(), update: vi.fn(), delete: vi.fn() } },
}));

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// `auth` is overloaded (it also doubles as a middleware wrapper — see
// src/proxy.ts), so `vi.mocked(auth)` resolves the wrong call signature.
// Cast to the mock explicitly instead.
const mockedAuth = auth as unknown as Mock;
import {
  createBlogPostAction,
  updateBlogPostAction,
  deleteBlogPostAction,
} from "./actions";

const validInput = {
  title: "My Post",
  slug: "my-post",
  excerpt: "",
  content: "",
  coverImageUrl: "",
  tags: "",
  status: "DRAFT" as const,
  seoTitle: "",
  seoDescription: "",
};

// Guards Phase 9's C1 exit criterion: every server action must check auth
// itself, independent of the admin layout gate. Removing the `auth()` check
// from any of these actions should fail this test.
describe("blog post server actions require auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedAuth.mockResolvedValue(null);
  });

  it("createBlogPostAction rejects when unauthenticated without touching Prisma", async () => {
    const result = await createBlogPostAction(validInput);
    expect(result).toEqual({ error: "Unauthorized." });
    expect(prisma.blogPost.create).not.toHaveBeenCalled();
  });

  it("updateBlogPostAction rejects when unauthenticated without touching Prisma", async () => {
    const result = await updateBlogPostAction("some-id", validInput);
    expect(result).toEqual({ error: "Unauthorized." });
    expect(prisma.blogPost.update).not.toHaveBeenCalled();
  });

  it("deleteBlogPostAction rejects when unauthenticated without touching Prisma", async () => {
    const result = await deleteBlogPostAction("some-id");
    expect(result).toEqual({ error: "Unauthorized." });
    expect(prisma.blogPost.delete).not.toHaveBeenCalled();
  });
});
