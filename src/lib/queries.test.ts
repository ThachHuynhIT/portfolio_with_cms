import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    project: { findMany: vi.fn(), findFirst: vi.fn() },
    blogPost: { findMany: vi.fn(), findFirst: vi.fn() },
    testimonial: { findMany: vi.fn() },
  },
}));

import { prisma } from "@/lib/prisma";
import {
  getPublishedProjects,
  getFeaturedProjects,
  getProjectBySlug,
  getPublishedBlogPosts,
  getBlogPostBySlug,
  getLatestBlogPosts,
  getPublishedTestimonials,
} from "@/lib/queries";

// This suite exists to guard one invariant: nothing in this file may ever ask
// Prisma for a row without `status: "PUBLISHED"`. It does not test Postgres —
// only that queries.ts keeps building the filter it claims to always apply.
describe("queries.ts published/draft filtering", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getPublishedProjects filters by PUBLISHED", () => {
    getPublishedProjects();
    expect(prisma.project.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { status: "PUBLISHED" } })
    );
  });

  it("getFeaturedProjects filters by PUBLISHED and featured", () => {
    getFeaturedProjects();
    expect(prisma.project.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: "PUBLISHED", featured: true },
      })
    );
  });

  it("getProjectBySlug filters by slug and PUBLISHED", () => {
    getProjectBySlug("my-project");
    expect(prisma.project.findFirst).toHaveBeenCalledWith({
      where: { slug: "my-project", status: "PUBLISHED" },
    });
  });

  it("getPublishedBlogPosts filters by PUBLISHED", () => {
    getPublishedBlogPosts();
    expect(prisma.blogPost.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { status: "PUBLISHED" } })
    );
  });

  it("getBlogPostBySlug filters by slug and PUBLISHED", () => {
    getBlogPostBySlug("my-post");
    expect(prisma.blogPost.findFirst).toHaveBeenCalledWith({
      where: { slug: "my-post", status: "PUBLISHED" },
    });
  });

  it("getLatestBlogPosts filters by PUBLISHED and defaults take to 3", () => {
    getLatestBlogPosts();
    expect(prisma.blogPost.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { status: "PUBLISHED" }, take: 3 })
    );
  });

  it("getLatestBlogPosts respects a custom take", () => {
    getLatestBlogPosts(5);
    expect(prisma.blogPost.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 5 })
    );
  });

  it("getPublishedTestimonials filters by PUBLISHED", () => {
    getPublishedTestimonials();
    expect(prisma.testimonial.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { status: "PUBLISHED" } })
    );
  });
});
