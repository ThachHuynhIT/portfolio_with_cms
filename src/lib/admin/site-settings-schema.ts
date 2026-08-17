import { z } from "zod";
import { urlOrEmpty } from "@lib/admin/shared-schema";
import { socialLinksSchema } from "@/lib/social-links";

// Only one occurrence of an "email or empty" field in the codebase so far —
// inlined rather than added to shared-schema.ts, same convention as
// `authorRole`'s empty-string-to-null idiom before its second occurrence.
const emailOrEmpty = z
  .union([z.literal(""), z.string().trim().email("Must be a valid email")])
  .transform((value) => (value === "" ? null : value));

// Shared by the client form (react-hook-form + @hookform/resolvers/zod) and
// the server action, which validates again independently — per Phase 9's
// exit criteria, client-side validation is never trusted on its own.
export const siteSettingsFormSchema = z.object({
  siteName: z.string().trim().min(1, "Site name is required"),
  tagline: z.string().trim().default(""),
  heroHeadline: z.string().trim().default(""),
  heroSubtext: z.string().trim().default(""),
  heroImageUrl: urlOrEmpty,
  bio: z.string().trim().default(""),
  avatarUrl: urlOrEmpty,
  resumeFileUrl: urlOrEmpty,
  contactEmail: emailOrEmpty,
  socialLinks: socialLinksSchema,
  defaultSeoTitle: z.string().trim().default(""),
  defaultSeoDescription: z.string().trim().default(""),
  ogImageUrl: urlOrEmpty,
});

export type SiteSettingsFormInput = z.input<typeof siteSettingsFormSchema>;
export type SiteSettingsFormOutput = z.output<typeof siteSettingsFormSchema>;
