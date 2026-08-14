import { prisma } from "@/lib/prisma";

// Admin-only reads: deliberately no status filter, unlike src/lib/queries.ts.
// Only ever call these from behind the admin auth gate (protected layout /
// server actions that check the session themselves) — never expose through
// the public query layer (see CLAUDE.md C4).
export function getAllProjectsAdmin() {
  return prisma.project.findMany({ orderBy: { order: "asc" } });
}

export function getProjectByIdAdmin(id: string) {
  return prisma.project.findUnique({ where: { id } });
}
