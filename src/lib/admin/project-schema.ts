import { z } from "zod";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const urlOrEmpty = z
  .union([z.literal(""), z.string().trim().url("Must be a valid URL")])
  .transform((value) => (value === "" ? null : value));

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

const commaSeparatedTags = z
  .string()
  .default("")
  .transform((value) =>
    value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
  );

// z.coerce.number() alone would silently coerce "" to 0 (Number("") === 0),
// letting an empty order field through as valid — reject blank/non-numeric
// input explicitly before the numeric constraints run.
const orderNumber = z
  .union([z.number(), z.string()])
  .transform((value, ctx) => {
    if (typeof value === "string" && value.trim() === "") {
      ctx.addIssue({ code: "custom", message: "Order is required" });
      return z.NEVER;
    }
    const numeric = typeof value === "string" ? Number(value) : value;
    if (Number.isNaN(numeric)) {
      ctx.addIssue({ code: "custom", message: "Order must be a number" });
      return z.NEVER;
    }
    return numeric;
  })
  .pipe(
    z
      .number()
      .int("Order must be a whole number")
      .min(0, "Order must be zero or greater")
  );

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
