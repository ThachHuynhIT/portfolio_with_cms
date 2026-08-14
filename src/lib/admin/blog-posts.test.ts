import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    blogPost: { findMany: vi.fn(), findUnique: vi.fn() },
  },
}));

import { prisma } from "@/lib/prisma";
import {
  getAllBlogPostsAdmin,
  getBlogPostByIdAdmin,
} from "@lib/admin/blog-posts";

// Mirror image of Phase 8's queries.test.ts invariant: admin reads must NOT
// filter by status — that's the whole point of this module existing
// separately from src/lib/queries.ts (see CLAUDE.md C4).
describe("admin blog posts reads never filter by status", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getAllBlogPostsAdmin has no status filter in its where clause", () => {
    getAllBlogPostsAdmin();
    const call = vi.mocked(prisma.blogPost.findMany).mock.calls[0]?.[0];
    expect(call?.where).toBeUndefined();
  });

  it("getBlogPostByIdAdmin looks up only by id, not status", () => {
    getBlogPostByIdAdmin("some-id");
    expect(prisma.blogPost.findUnique).toHaveBeenCalledWith({
      where: { id: "some-id" },
    });
  });
});
