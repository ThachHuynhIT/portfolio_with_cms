import { describe, expect, it, vi, beforeEach, type Mock } from "vitest";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: { skill: { create: vi.fn(), update: vi.fn(), delete: vi.fn() } },
}));

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// `auth` is overloaded (it also doubles as a middleware wrapper — see
// src/proxy.ts), so `vi.mocked(auth)` resolves the wrong call signature.
// Cast to the mock explicitly instead.
const mockedAuth = auth as unknown as Mock;
import {
  createSkillAction,
  updateSkillAction,
  deleteSkillAction,
} from "./actions";

const validInput = {
  name: "TypeScript",
  category: "Languages",
  iconUrl: "",
  order: 0,
};

// Guards Phase 9's C1 exit criterion: every server action must check auth
// itself, independent of the admin layout gate. Removing the `auth()` check
// from any of these actions should fail this test.
describe("skill server actions require auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedAuth.mockResolvedValue(null);
  });

  it("createSkillAction rejects when unauthenticated without touching Prisma", async () => {
    const result = await createSkillAction(validInput);
    expect(result).toEqual({ error: "Unauthorized." });
    expect(prisma.skill.create).not.toHaveBeenCalled();
  });

  it("updateSkillAction rejects when unauthenticated without touching Prisma", async () => {
    const result = await updateSkillAction("some-id", validInput);
    expect(result).toEqual({ error: "Unauthorized." });
    expect(prisma.skill.update).not.toHaveBeenCalled();
  });

  it("deleteSkillAction rejects when unauthenticated without touching Prisma", async () => {
    const result = await deleteSkillAction("some-id");
    expect(result).toEqual({ error: "Unauthorized." });
    expect(prisma.skill.delete).not.toHaveBeenCalled();
  });
});
