import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    project: { findMany: vi.fn().mockResolvedValue([]) },
    blogPost: { findMany: vi.fn().mockResolvedValue([]) },
  },
}));

import { prisma } from "@/lib/prisma";
import sitemap from "./sitemap";

// Guards the risk called out in docs/ROADMAP.md Phase 13: sitemap.ts must reuse
// queries.ts (PUBLISHED-only) instead of a standalone Prisma call that could leak DRAFT URLs.
describe("sitemap", () => {
  it("queries projects and blog posts filtered by PUBLISHED", async () => {
    await sitemap();

    expect(prisma.project.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { status: "PUBLISHED" } }),
    );
    expect(prisma.blogPost.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { status: "PUBLISHED" } }),
    );
  });

  it("includes the static public routes", async () => {
    const entries = await sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(urls).toEqual(
      expect.arrayContaining([
        "http://localhost:3000",
        expect.stringContaining("/about"),
        expect.stringContaining("/cv"),
        expect.stringContaining("/projects"),
        expect.stringContaining("/blog"),
        expect.stringContaining("/contact"),
      ]),
    );
  });

  it("includes one entry per published project and blog post slug", async () => {
    vi.mocked(prisma.project.findMany).mockResolvedValueOnce([
      { slug: "my-project", updatedAt: new Date("2026-01-01") },
    ] as never);
    vi.mocked(prisma.blogPost.findMany).mockResolvedValueOnce([
      { slug: "my-post", updatedAt: new Date("2026-01-02") },
    ] as never);

    const entries = await sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(urls).toEqual(
      expect.arrayContaining([
        expect.stringContaining("/projects/my-project"),
        expect.stringContaining("/blog/my-post"),
      ]),
    );
  });
});
