import { describe, expect, it } from "vitest";
import { siteSettingsFormSchema } from "@lib/admin/site-settings-schema";

const validInput = {
  siteName: "Jane Doe",
  tagline: "Full-stack developer",
  heroHeadline: "Hi, I'm Jane",
  heroSubtext: "I build things.",
  heroImageUrl: "https://example.com/hero.png",
  bio: "Some bio text.",
  avatarUrl: "https://example.com/avatar.png",
  resumeFileUrl: "https://example.com/resume.pdf",
  contactEmail: "jane@example.com",
  socialLinks: { github: "https://github.com/jane" },
  defaultSeoTitle: "Jane Doe — Portfolio",
  defaultSeoDescription: "Portfolio of Jane Doe.",
  ogImageUrl: "https://example.com/og.png",
};

describe("siteSettingsFormSchema", () => {
  it("accepts a fully valid input", () => {
    const result = siteSettingsFormSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("rejects a missing site name", () => {
    const result = siteSettingsFormSchema.safeParse({
      ...validInput,
      siteName: "  ",
    });
    expect(result.success).toBe(false);
  });

  it("defaults optional text fields to empty string when omitted", () => {
    const rest = { ...validInput };
    delete (rest as Partial<typeof validInput>).tagline;
    delete (rest as Partial<typeof validInput>).heroHeadline;
    delete (rest as Partial<typeof validInput>).heroSubtext;
    const result = siteSettingsFormSchema.safeParse(rest);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.tagline).toBe("");
    expect(result.data.heroHeadline).toBe("");
    expect(result.data.heroSubtext).toBe("");
  });

  it("treats an empty contact email as null, not empty string", () => {
    const result = siteSettingsFormSchema.safeParse({
      ...validInput,
      contactEmail: "",
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.contactEmail).toBeNull();
  });

  it("rejects a malformed contact email", () => {
    const result = siteSettingsFormSchema.safeParse({
      ...validInput,
      contactEmail: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("treats an empty hero image URL as null, not empty string", () => {
    const result = siteSettingsFormSchema.safeParse({
      ...validInput,
      heroImageUrl: "",
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.heroImageUrl).toBeNull();
  });

  it("rejects a malformed social link nested inside socialLinks", () => {
    const result = siteSettingsFormSchema.safeParse({
      ...validInput,
      socialLinks: { github: "not-a-url" },
    });
    expect(result.success).toBe(false);
  });

  it("normalizes an empty social link to null", () => {
    const result = siteSettingsFormSchema.safeParse({
      ...validInput,
      socialLinks: { github: "" },
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.socialLinks.github).toBeNull();
  });
});
