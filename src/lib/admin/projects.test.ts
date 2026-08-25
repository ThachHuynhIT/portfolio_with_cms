import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    project: { findMany: vi.fn(), findUnique: vi.fn() },
  },
}));

import { prisma } from "@/lib/prisma";
import { getAllProjectsAdmin, getProjectByIdAdmin } from "@lib/admin/projects";

// Mirror image of Phase 8's queries.test.ts invariant: admin reads must NOT
// filter by status — that's the whole point of this module existing
// separately from src/lib/queries.ts (see CLAUDE.md C4).
describe("admin projects reads never filter by status", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getAllProjectsAdmin has no status filter in its where clause", () => {
    getAllProjectsAdmin();
    const call = vi.mocked(prisma.project.findMany).mock.calls[0]?.[0];
    expect(call?.where).toBeUndefined();
  });

  it("getProjectByIdAdmin looks up only by id, not status", () => {
    getProjectByIdAdmin("some-id");
    expect(prisma.project.findUnique).toHaveBeenCalledWith({
      where: { id: "some-id" },
    });
  });
});
