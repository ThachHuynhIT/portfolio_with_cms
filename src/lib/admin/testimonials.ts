import { prisma } from "@/lib/prisma";

// Admin-only reads: deliberately no status filter, unlike src/lib/queries.ts.
// Only ever call these from behind the admin auth gate (protected layout /
// server actions that check the session themselves) — never expose through
// the public query layer (see CLAUDE.md C4).
export function getAllTestimonialsAdmin() {
  return prisma.testimonial.findMany({ orderBy: { order: "asc" } });
}

export function getTestimonialByIdAdmin(id: string) {
  return prisma.testimonial.findUnique({ where: { id } });
}
