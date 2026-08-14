import { describe, expect, it } from "vitest";
import { testimonialFormSchema } from "@lib/admin/testimonial-schema";

const validInput = {
  authorName: "Jane Doe",
  authorRole: "CEO, Acme Corp",
  authorAvatarUrl: "https://example.com/avatar.png",
  quote: "Fantastic work.",
  order: 0,
  status: "DRAFT" as const,
};

describe("testimonialFormSchema", () => {
  it("accepts a fully valid input", () => {
    const result = testimonialFormSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("treats an empty authorRole as null, not empty string", () => {
    const result = testimonialFormSchema.safeParse({
      ...validInput,
      authorRole: "",
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.authorRole).toBeNull();
  });

  it("treats an empty authorAvatarUrl as null, not empty string", () => {
    const result = testimonialFormSchema.safeParse({
      ...validInput,
      authorAvatarUrl: "",
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.authorAvatarUrl).toBeNull();
  });

  it("rejects a missing authorName", () => {
    const result = testimonialFormSchema.safeParse({
      ...validInput,
      authorName: "  ",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a missing quote", () => {
    const result = testimonialFormSchema.safeParse({ ...validInput, quote: "  " });
    expect(result.success).toBe(false);
  });

  it("rejects a malformed authorAvatarUrl", () => {
    const result = testimonialFormSchema.safeParse({
      ...validInput,
      authorAvatarUrl: "not-a-url",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid status", () => {
    const result = testimonialFormSchema.safeParse({
      ...validInput,
      status: "ARCHIVED",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an empty order string instead of silently coercing to 0", () => {
    const result = testimonialFormSchema.safeParse({ ...validInput, order: "" });
    expect(result.success).toBe(false);
  });

  it("rejects a negative order", () => {
    const result = testimonialFormSchema.safeParse({ ...validInput, order: -1 });
    expect(result.success).toBe(false);
  });
});
