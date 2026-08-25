import type { MetadataRoute } from "next";
import { getPublishedProjects, getPublishedBlogPosts } from "@/lib/queries";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const STATIC_ROUTES = ["", "/about", "/projects", "/blog", "/contact"];

// Reuses queries.ts (never a standalone Prisma call) so this can never list a DRAFT
// project/post — the same PUBLISHED-only invariant the public pages rely on (C4).
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, posts] = await Promise.all([
    getPublishedProjects(),
    getPublishedBlogPosts(),
  ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
  }));

  const projectEntries: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${SITE_URL}/projects/${project.slug}`,
    lastModified: project.updatedAt,
  }));

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.updatedAt,
  }));

  return [...staticEntries, ...projectEntries, ...postEntries];
}
