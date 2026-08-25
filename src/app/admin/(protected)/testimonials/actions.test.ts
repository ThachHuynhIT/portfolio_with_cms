import { describe, expect, it, vi, beforeEach, type Mock } from "vitest";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    testimonial: { create: vi.fn(), update: vi.fn(), delete: vi.fn() },
  },
}));

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// `auth` is overloaded (it also doubles as a middleware wrapper — see
// src/proxy.ts), so `vi.mocked(auth)` resolves the wrong call signature.
// Cast to the mock explicitly instead.
const mockedAuth = auth as unknown as Mock;
import {
  createTestimonialAction,
  updateTestimonialAction,
  deleteTestimonialAction,
} from "./actions";

const validInput = {
  authorName: "Jane Doe",
  authorRole: "CEO, Acme Corp",
  authorAvatarUrl: "",
  quote: "Fantastic work.",
  order: 0,
  status: "DRAFT" as const,
};

// Guards Phase 9's C1 exit criterion: every server action must check auth
// itself, independent of the admin layout gate. Removing the `auth()` check
// from any of these actions should fail this test.
describe("testimonial server actions require auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedAuth.mockResolvedValue(null);
  });

  it("createTestimonialAction rejects when unauthenticated without touching Prisma", async () => {
    const result = await createTestimonialAction(validInput);
    expect(result).toEqual({ error: "Unauthorized." });
    expect(prisma.testimonial.create).not.toHaveBeenCalled();
  });

  it("updateTestimonialAction rejects when unauthenticated without touching Prisma", async () => {
    const result = await updateTestimonialAction("some-id", validInput);
    expect(result).toEqual({ error: "Unauthorized." });
    expect(prisma.testimonial.update).not.toHaveBeenCalled();
  });

  it("deleteTestimonialAction rejects when unauthenticated without touching Prisma", async () => {
    const result = await deleteTestimonialAction("some-id");
    expect(result).toEqual({ error: "Unauthorized." });
    expect(prisma.testimonial.delete).not.toHaveBeenCalled();
  });
});

// Coverage gap identified while building Phase 10 PR C's `useAdminForm`:
// the auth-check tests above never exercise the *authenticated* path, so a
// removed/weakened `safeParse` call would pass every existing test here.
describe("testimonial server actions validate input even when authenticated", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedAuth.mockResolvedValue({
      user: { id: "admin-1", email: "admin@example.com" },
    });
  });

  it("createTestimonialAction rejects invalid input without touching Prisma", async () => {
    const result = await createTestimonialAction({
      ...validInput,
      authorName: "",
    });
    expect(result?.error).toBeTruthy();
    expect(prisma.testimonial.create).not.toHaveBeenCalled();
  });

  it("updateTestimonialAction rejects invalid input without touching Prisma", async () => {
    const result = await updateTestimonialAction("some-id", {
      ...validInput,
      authorName: "",
    });
    expect(result?.error).toBeTruthy();
    expect(prisma.testimonial.update).not.toHaveBeenCalled();
  });
});
