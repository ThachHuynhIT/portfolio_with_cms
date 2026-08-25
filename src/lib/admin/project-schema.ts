import { z } from "zod";
import { slugPattern, urlOrEmpty, commaSeparatedTags, orderNumber } from "@lib/admin/shared-schema";

const lineSeparatedUrls = z
  .string()
  .default("")
  .transform((value) =>
    value
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
  )
  .pipe(z.array(z.string().url("Each gallery URL must be a valid URL")));

// Shared by the client form (react-hook-form + @hookform/resolvers/zod) and the
// server action, which validates again independently — per Phase 9's exit
// criteria, client-side validation is never trusted on its own.
export const projectFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .regex(slugPattern, "Slug must be lowercase letters, numbers, and hyphens only"),
  summary: z.string().trim().default(""),
  description: z.string().trim().default(""),
  coverImageUrl: urlOrEmpty,
  galleryUrls: lineSeparatedUrls,
  techTags: commaSeparatedTags,
  liveUrl: urlOrEmpty,
  repoUrl: urlOrEmpty,
  order: orderNumber,
  featured: z.boolean().default(false),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  seoTitle: z.string().trim().default(""),
  seoDescription: z.string().trim().default(""),
});

export type ProjectFormInput = z.input<typeof projectFormSchema>;
export type ProjectFormOutput = z.output<typeof projectFormSchema>;
