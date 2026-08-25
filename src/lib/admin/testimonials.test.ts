import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    testimonial: { findMany: vi.fn(), findUnique: vi.fn() },
  },
}));

import { prisma } from "@/lib/prisma";
import {
  getAllTestimonialsAdmin,
  getTestimonialByIdAdmin,
} from "@lib/admin/testimonials";

describe("getAllTestimonialsAdmin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not filter by status — returns drafts and published alike", () => {
    getAllTestimonialsAdmin();
    expect(prisma.testimonial.findMany).toHaveBeenCalledWith({
      orderBy: { order: "asc" },
    });
  });
});

describe("getTestimonialByIdAdmin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("looks up only by id", () => {
    getTestimonialByIdAdmin("some-id");
    expect(prisma.testimonial.findUnique).toHaveBeenCalledWith({
      where: { id: "some-id" },
    });
  });
});
