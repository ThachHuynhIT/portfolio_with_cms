import { z } from "zod";
import { urlOrEmpty, orderNumber } from "@lib/admin/shared-schema";

// Shared by the client form (react-hook-form + @hookform/resolvers/zod) and the
// server action, which validates again independently — per Phase 9's exit
// criteria, client-side validation is never trusted on its own.
export const skillFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  category: z.string().trim().min(1, "Category is required"),
  iconUrl: urlOrEmpty,
  order: orderNumber,
});

export type SkillFormInput = z.input<typeof skillFormSchema>;
export type SkillFormOutput = z.output<typeof skillFormSchema>;
