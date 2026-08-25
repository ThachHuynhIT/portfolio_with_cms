import { z } from "zod";
import { slugPattern, urlOrEmpty, commaSeparatedTags } from "@lib/admin/shared-schema";

// Shared by the client form (react-hook-form + @hookform/resolvers/zod) and the
// server action, which validates again independently — per Phase 9's exit
// criteria, client-side validation is never trusted on its own.
export const blogPostFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .regex(slugPattern, "Slug must be lowercase letters, numbers, and hyphens only"),
  excerpt: z.string().trim().default(""),
  content: z.string().trim().default(""),
  coverImageUrl: urlOrEmpty,
  tags: commaSeparatedTags,
  status: z.enum(["DRAFT", "PUBLISHED"]),
  seoTitle: z.string().trim().default(""),
  seoDescription: z.string().trim().default(""),
});

export type BlogPostFormInput = z.input<typeof blogPostFormSchema>;
export type BlogPostFormOutput = z.output<typeof blogPostFormSchema>;
