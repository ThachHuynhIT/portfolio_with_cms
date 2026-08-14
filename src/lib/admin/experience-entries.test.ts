import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    experienceEntry: { findUnique: vi.fn() },
  },
}));

import { prisma } from "@/lib/prisma";
import { getExperienceEntryByIdAdmin } from "@lib/admin/experience-entries";

describe("getExperienceEntryByIdAdmin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("looks up only by id", () => {
    getExperienceEntryByIdAdmin("some-id");
    expect(prisma.experienceEntry.findUnique).toHaveBeenCalledWith({
      where: { id: "some-id" },
    });
  });
});
