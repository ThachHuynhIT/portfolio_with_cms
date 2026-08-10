import { prisma } from "@/lib/prisma";

const published = { status: "PUBLISHED" as const };

export function getSiteSettings() {
  return prisma.siteSettings.findUnique({ where: { id: "singleton" } });
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

export function getProjectBySlug(slug: string) {
  return prisma.project.findFirst({
    where: { slug, ...published },
  });
}

export function getPublishedBlogPosts() {
  return prisma.blogPost.findMany({
    where: published,
    orderBy: { publishedAt: "desc" },
  });
}

export function getBlogPostBySlug(slug: string) {
  return prisma.blogPost.findFirst({
    where: { slug, ...published },
  });
}

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
