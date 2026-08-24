import { describe, expect, it, vi } from "vitest";

// `getAdminDashboardData` is wrapped in React's `cache()`, which memoizes
// per process outside of a real render — one call per test file only, or
// later tests would just get the first call's memoized result back instead
// of anything newly mocked. A single call below covers every assertion.
const projectGroups = [
  { status: "DRAFT", _count: { _all: 2 } },
  { status: "PUBLISHED", _count: { _all: 3 } },
];
const blogPostGroups = [{ status: "PUBLISHED", _count: { _all: 4 } }];
const testimonialGroups = [{ status: "DRAFT", _count: { _all: 1 } }];

const draftProjects = [
  { id: "p1", title: "Older draft project", updatedAt: new Date("2026-01-01") },
  { id: "p2", title: "Newest draft project", updatedAt: new Date("2026-03-01") },
];
const draftBlogPosts = [
  { id: "b1", title: "Middle draft post", updatedAt: new Date("2026-02-01") },
];

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: vi.fn(() =>
      Promise.resolve([
        projectGroups,
        blogPostGroups,
        testimonialGroups,
        5, // skill count
        3, // experience count
        7, // unread message count
        draftProjects,
        draftBlogPosts,
      ]),
    ),
    project: { groupBy: vi.fn(), findMany: vi.fn() },
    blogPost: { groupBy: vi.fn(), findMany: vi.fn() },
    testimonial: { groupBy: vi.fn() },
    skill: { count: vi.fn() },
    experienceEntry: { count: vi.fn() },
    contactMessage: { count: vi.fn() },
  },
}));

import { getAdminDashboardData } from "./dashboard";

describe("getAdminDashboardData", () => {
  it("computes total/draft counts per model and passes through plain counts", async () => {
    const data = await getAdminDashboardData();

    expect(data.projects).toEqual({ total: 5, draft: 2 });
    expect(data.blogPosts).toEqual({ total: 4, draft: 0 });
    expect(data.testimonials).toEqual({ total: 1, draft: 1 });
    expect(data.skills).toEqual({ total: 5 });
    expect(data.experience).toEqual({ total: 3 });
    expect(data.unreadMessages).toEqual({ total: 7 });
  });

  it("merges draft projects and blog posts, sorted by updatedAt desc, capped at 5", async () => {
    const data = await getAdminDashboardData();

    expect(data.draftItems.map((item) => item.id)).toEqual(["p2", "b1", "p1"]);
    expect(data.draftItems.map((item) => item.kind)).toEqual([
      "project",
      "blogPost",
      "project",
    ]);
  });
});
