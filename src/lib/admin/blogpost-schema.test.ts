import { describe, expect, it } from "vitest";
import { blogPostFormSchema } from "@lib/admin/blogpost-schema";

const validInput = {
  title: "My Post",
  slug: "my-post",
  excerpt: "A short excerpt",
  content: "# Heading\n\nSome body text.",
  coverImageUrl: "https://example.com/cover.png",
  tags: "TypeScript, Next.js, Prisma",
  status: "PUBLISHED",
  seoTitle: "My Post — SEO title",
  seoDescription: "SEO description",
};

describe("blogPostFormSchema", () => {
  it("accepts a fully valid input and transforms tags", () => {
    const result = blogPostFormSchema.safeParse(validInput);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.tags).toEqual(["TypeScript", "Next.js", "Prisma"]);
  });

  it("treats an empty cover image URL as null, not empty string", () => {
    const result = blogPostFormSchema.safeParse({
      ...validInput,
      coverImageUrl: "",
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.coverImageUrl).toBeNull();
  });

  it("rejects a missing title", () => {
    const result = blogPostFormSchema.safeParse({
      ...validInput,
      title: "  ",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a slug with uppercase or spaces", () => {
    const result = blogPostFormSchema.safeParse({
      ...validInput,
      slug: "My Post Slug",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a malformed cover image URL", () => {
    const result = blogPostFormSchema.safeParse({
      ...validInput,
      coverImageUrl: "not-a-url",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid status value", () => {
    const result = blogPostFormSchema.safeParse({
      ...validInput,
      status: "ARCHIVED",
    });
    expect(result.success).toBe(false);
  });
});
