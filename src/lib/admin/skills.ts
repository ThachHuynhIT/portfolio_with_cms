import { prisma } from "@/lib/prisma";

// Skill has no status/publishedAt — src/lib/queries.ts's getSkills() already
// returns everything, so the admin list page reuses it directly (no draft
// filter to bypass, unlike Project/BlogPost's C4 concern). Only the
// single-record lookup for the edit page is admin-only, so it lives here.
export function getSkillByIdAdmin(id: string) {
  return prisma.skill.findUnique({ where: { id } });
}
