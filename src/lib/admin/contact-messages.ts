import { prisma } from "@/lib/prisma";

// Admin-only reads: ContactMessage has no PUBLISHED/DRAFT concept and is never
// safe to read through src/lib/queries.ts — the public query layer must never
// expose messages submitted by other visitors. Only ever call these from
// behind the admin auth gate (protected layout / server actions that check
// the session themselves) — see CLAUDE.md C4.
export function getAllContactMessagesAdmin() {
  return prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } });
}

export function getContactMessageByIdAdmin(id: string) {
  return prisma.contactMessage.findUnique({ where: { id } });
}
