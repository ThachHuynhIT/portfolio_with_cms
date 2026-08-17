import { z } from "zod";

// Shared across the admin write boundary (`site-settings-schema.ts`'s form)
// and the public read boundary (`getSocialLinks` in `queries.ts`) — per
// Phase 9's C5, `SiteSettings.socialLinks` is untyped `Json` and must never
// be accessed as a raw property on either side; both go through this schema.
const optionalUrl = z
  .union([z.literal(""), z.string().trim().url("Must be a valid URL")])
  .optional()
  .transform((value) => (value ? value : null));

export const socialLinksSchema = z.object({
  github: optionalUrl,
  linkedin: optionalUrl,
  twitter: optionalUrl,
  instagram: optionalUrl,
  youtube: optionalUrl,
});

export type SocialLinksInput = z.input<typeof socialLinksSchema>;
export type SocialLinks = z.output<typeof socialLinksSchema>;

const emptySocialLinks: SocialLinks = {
  github: null,
  linkedin: null,
  twitter: null,
  instagram: null,
  youtube: null,
};

// Defensive on read: falls back to all-null instead of throwing, since a
// public page rendering social icons shouldn't 500 over malformed JSON that
// predates this schema (e.g. the model's `@default("{}")`).
export function parseSocialLinks(value: unknown): SocialLinks {
  const result = socialLinksSchema.safeParse(value ?? {});
  return result.success ? result.data : emptySocialLinks;
}
