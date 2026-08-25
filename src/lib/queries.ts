import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { parseSocialLinks } from "@/lib/social-links";

const published = { status: "PUBLISHED" as const };

// Cached per-request: both the root layout and individual pages call this,
// and without dedup that's 2 DB round-trips for the same row per request.
export const getSiteSettings = cache(function getSiteSettings() {
  return prisma.siteSettings.findUnique({ where: { id: "singleton" } });
});

// The sanctioned way to read `SiteSettings.socialLinks` (C5) — never access
// the raw `Json` field directly, since it's untyped and unvalidated at rest.
export async function getSocialLinks() {
  const settings = await getSiteSettings();
  return parseSocialLinks(settings?.socialLinks);
}

export function getPublishedProjects() {
  return prisma.project.findMany({
    where: published,
    orderBy: { order: "asc" },
  });
}

export function getFeaturedProjects() {
  return prisma.project.findMany({
    where: { ...published, featured: true },
    orderBy: { order: "asc" },
  });
}

// Cached per-request (Phase 13 — SEO): a detail page's generateMetadata and its page
// component both look up the same slug, and without dedup that's 2 DB round-trips.
export const getProjectBySlug = cache(function getProjectBySlug(slug: string) {
  return prisma.project.findFirst({
    where: { slug, ...published },
  });
});

export function getPublishedBlogPosts() {
  return prisma.blogPost.findMany({
    where: published,
    orderBy: { publishedAt: "desc" },
  });
}

// Home's "Latest writing" section (Phase 10 PR 7) — still bakes in
// PUBLISHED-only (C4); adding a bounded reader doesn't weaken the filter.
export function getLatestBlogPosts(take = 3) {
  return prisma.blogPost.findMany({
    where: published,
    orderBy: { publishedAt: "desc" },
    take,
  });
}

// Cached per-request — same reasoning as getProjectBySlug above.
export const getBlogPostBySlug = cache(function getBlogPostBySlug(slug: string) {
  return prisma.blogPost.findFirst({
    where: { slug, ...published },
  });
});

export function getSkills() {
  return prisma.skill.findMany({ orderBy: { order: "asc" } });
}

export function getExperienceEntries() {
  return prisma.experienceEntry.findMany({ orderBy: { order: "asc" } });
}

export function getPublishedTestimonials() {
  return prisma.testimonial.findMany({
    where: published,
    orderBy: { order: "asc" },
  });
}
