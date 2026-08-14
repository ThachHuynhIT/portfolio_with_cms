import { z } from "zod";
import { urlOrEmpty, orderNumber } from "@lib/admin/shared-schema";

// Shared by the client form (react-hook-form + @hookform/resolvers/zod) and the
// server action, which validates again independently — per Phase 9's exit
// criteria, client-side validation is never trusted on its own.
export const testimonialFormSchema = z.object({
  authorName: z.string().trim().min(1, "Author name is required"),
  authorRole: z
    .string()
    .trim()
    .default("")
    .transform((value) => (value === "" ? null : value)),
  authorAvatarUrl: urlOrEmpty,
  quote: z.string().trim().min(1, "Quote is required"),
  order: orderNumber,
  status: z.enum(["DRAFT", "PUBLISHED"]),
});

export type TestimonialFormInput = z.input<typeof testimonialFormSchema>;
export type TestimonialFormOutput = z.output<typeof testimonialFormSchema>;
