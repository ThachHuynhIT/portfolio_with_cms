import { describe, expect, it } from "vitest";
import { projectFormSchema } from "@lib/admin/project-schema";

const validInput = {
  title: "My Project",
  slug: "my-project",
  summary: "A short summary",
  description: "# Heading\n\nSome body text.",
  coverImageUrl: "https://example.com/cover.png",
  galleryUrls: "https://example.com/a.png\nhttps://example.com/b.png",
  techTags: "TypeScript, Next.js, Prisma",
  liveUrl: "https://example.com",
  repoUrl: "https://github.com/example/repo",
  order: 1,
  featured: true,
  status: "PUBLISHED",
  seoTitle: "My Project — SEO title",
  seoDescription: "SEO description",
};

describe("projectFormSchema", () => {
  it("accepts a fully valid input and transforms list fields", () => {
    const result = projectFormSchema.safeParse(validInput);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.galleryUrls).toEqual([
      "https://example.com/a.png",
      "https://example.com/b.png",
    ]);
    expect(result.data.techTags).toEqual(["TypeScript", "Next.js", "Prisma"]);
  });

  it("treats empty optional URL fields as null, not empty string", () => {
    const result = projectFormSchema.safeParse({
      ...validInput,
      coverImageUrl: "",
      liveUrl: "",
      repoUrl: "",
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.coverImageUrl).toBeNull();
    expect(result.data.liveUrl).toBeNull();
    expect(result.data.repoUrl).toBeNull();
  });

  it("rejects a missing title", () => {
    const result = projectFormSchema.safeParse({ ...validInput, title: "  " });
    expect(result.success).toBe(false);
  });

  it("rejects a slug with uppercase or spaces", () => {
    const result = projectFormSchema.safeParse({
      ...validInput,
      slug: "My Project Slug",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a malformed cover image URL", () => {
    const result = projectFormSchema.safeParse({
      ...validInput,
      coverImageUrl: "not-a-url",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a malformed gallery URL", () => {
    const result = projectFormSchema.safeParse({
      ...validInput,
      galleryUrls: "https://example.com/ok.png\nnot-a-url",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a negative order", () => {
    const result = projectFormSchema.safeParse({ ...validInput, order: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects an empty order string instead of silently coercing to 0", () => {
    const result = projectFormSchema.safeParse({ ...validInput, order: "" });
    expect(result.success).toBe(false);
  });

  it("accepts a numeric order string", () => {
    const result = projectFormSchema.safeParse({ ...validInput, order: "3" });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.order).toBe(3);
  });

  it("rejects an invalid status value", () => {
    const result = projectFormSchema.safeParse({
      ...validInput,
      status: "ARCHIVED",
    });
    expect(result.success).toBe(false);
  });
});
