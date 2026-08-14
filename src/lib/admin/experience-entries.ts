import { prisma } from "@/lib/prisma";

// ExperienceEntry has no status/publishedAt — src/lib/queries.ts's
// getExperienceEntries() already returns everything, so the admin list page
// reuses it directly (no draft filter to bypass, unlike Project/BlogPost's C4
// concern). Only the single-record lookup for the edit page is admin-only, so
// it lives here.
export function getExperienceEntryByIdAdmin(id: string) {
  return prisma.experienceEntry.findUnique({ where: { id } });
}
