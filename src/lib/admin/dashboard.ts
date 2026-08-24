import { cache } from "react";
import { prisma } from "@/lib/prisma";

// Admin-only reads: deliberately no status filter, unlike src/lib/queries.ts.
// Only ever call this from behind the admin auth gate (protected layout /
// server actions that check the session themselves) — never expose through
// the public query layer (see CLAUDE.md C4).

type StatusCounts = { total: number; draft: number };

type StatusGroup = { status: "DRAFT" | "PUBLISHED"; _count: { _all: number } };

// Prisma's generated `groupBy` return type widens `_count` to
// `true | {..., _all?: number} | undefined` once the call sits inside a
// `$transaction([...])` array alongside other query types — it narrows fine
// standalone. The cast below is safe: we control every `_count: { _all: true }`
// argument above, so the runtime shape always matches `StatusGroup`.
function toStatusCounts(groups: unknown): StatusCounts {
  let total = 0;
  let draft = 0;
  for (const group of groups as StatusGroup[]) {
    const count = group._count._all;
    total += count;
    if (group.status === "DRAFT") draft = count;
  }
  return { total, draft };
}

export type AdminDashboardDraftItem = {
  id: string;
  title: string;
  updatedAt: Date;
  kind: "project" | "blogPost";
};

export type AdminDashboardData = {
  projects: StatusCounts;
  blogPosts: StatusCounts;
  testimonials: StatusCounts;
  skills: { total: number };
  experience: { total: number };
  unreadMessages: { total: number };
  draftItems: AdminDashboardDraftItem[];
};

// Deliberately not one statement per the design spec's original estimate —
// the "needs attention" list spans two separate tables (Project, BlogPost),
// and Prisma has no cross-model query to merge them server-side. 8
// statements, one $transaction (one connection acquire either way).
export const getAdminDashboardData = cache(
  async function getAdminDashboardData(): Promise<AdminDashboardData> {
    const [
      projectGroups,
      blogPostGroups,
      testimonialGroups,
      skillCount,
      experienceCount,
      unreadMessageCount,
      draftProjects,
      draftBlogPosts,
    ] = await prisma.$transaction([
      prisma.project.groupBy({
        by: ["status"],
        orderBy: { status: "asc" },
        _count: { _all: true },
      }),
      prisma.blogPost.groupBy({
        by: ["status"],
        orderBy: { status: "asc" },
        _count: { _all: true },
      }),
      prisma.testimonial.groupBy({
        by: ["status"],
        orderBy: { status: "asc" },
        _count: { _all: true },
      }),
      prisma.skill.count(),
      prisma.experienceEntry.count(),
      prisma.contactMessage.count({ where: { read: false } }),
      prisma.project.findMany({
        where: { status: "DRAFT" },
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: { id: true, title: true, updatedAt: true },
      }),
      prisma.blogPost.findMany({
        where: { status: "DRAFT" },
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: { id: true, title: true, updatedAt: true },
      }),
    ]);

    const draftItems: AdminDashboardDraftItem[] = [
      ...draftProjects.map((project) => ({ ...project, kind: "project" as const })),
      ...draftBlogPosts.map((post) => ({ ...post, kind: "blogPost" as const })),
    ]
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, 5);

    return {
      projects: toStatusCounts(projectGroups),
      blogPosts: toStatusCounts(blogPostGroups),
      testimonials: toStatusCounts(testimonialGroups),
      skills: { total: skillCount },
      experience: { total: experienceCount },
      unreadMessages: { total: unreadMessageCount },
      draftItems,
    };
  },
);
