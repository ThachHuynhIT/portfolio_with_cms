import { describe, expect, it } from "vitest";
import { socialLinksSchema, parseSocialLinks } from "@/lib/social-links";

describe("socialLinksSchema", () => {
  it("accepts a fully valid input", () => {
    const result = socialLinksSchema.safeParse({
      github: "https://github.com/example",
      linkedin: "https://linkedin.com/in/example",
      twitter: "https://x.com/example",
      instagram: "https://instagram.com/example",
      youtube: "https://youtube.com/@example",
    });
    expect(result.success).toBe(true);
  });

  it("treats an empty string field as null, not empty string", () => {
    const result = socialLinksSchema.safeParse({ github: "" });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.github).toBeNull();
  });

  it("treats a missing field as null", () => {
    const result = socialLinksSchema.safeParse({});
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.linkedin).toBeNull();
  });

  it("rejects a malformed URL", () => {
    const result = socialLinksSchema.safeParse({ github: "not-a-url" });
    expect(result.success).toBe(false);
  });
});

describe("parseSocialLinks", () => {
  it("parses a valid stored Json value", () => {
    const result = parseSocialLinks({ github: "https://github.com/example" });
    expect(result.github).toBe("https://github.com/example");
    expect(result.linkedin).toBeNull();
  });

  it("falls back to all-null on malformed stored data instead of throwing", () => {
    const result = parseSocialLinks({ github: "not-a-url" });
    expect(result).toEqual({
      github: null,
      linkedin: null,
      twitter: null,
      instagram: null,
      youtube: null,
    });
  });

  it("falls back to all-null when the value is null or undefined", () => {
    expect(parseSocialLinks(null)).toEqual({
      github: null,
      linkedin: null,
      twitter: null,
      instagram: null,
      youtube: null,
    });
    expect(parseSocialLinks(undefined)).toEqual({
      github: null,
      linkedin: null,
      twitter: null,
      instagram: null,
      youtube: null,
    });
  });
});
