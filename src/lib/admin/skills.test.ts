import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    skill: { findUnique: vi.fn() },
  },
}));

import { prisma } from "@/lib/prisma";
import { getSkillByIdAdmin } from "@lib/admin/skills";

describe("getSkillByIdAdmin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("looks up only by id", () => {
    getSkillByIdAdmin("some-id");
    expect(prisma.skill.findUnique).toHaveBeenCalledWith({
      where: { id: "some-id" },
    });
  });
});
