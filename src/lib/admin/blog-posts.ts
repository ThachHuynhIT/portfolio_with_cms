import { prisma } from "@/lib/prisma";

// Admin-only reads: deliberately no status filter, unlike src/lib/queries.ts.
// Only ever call these from behind the admin auth gate (protected layout /
// server actions that check the session themselves) — never expose through
// the public query layer (see CLAUDE.md C4).
export function getAllBlogPostsAdmin() {
  return prisma.blogPost.findMany({ orderBy: { updatedAt: "desc" } });
}

export function getBlogPostByIdAdmin(id: string) {
  return prisma.blogPost.findUnique({ where: { id } });
}
