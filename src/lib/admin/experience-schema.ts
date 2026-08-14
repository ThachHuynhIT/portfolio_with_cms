import { z } from "zod";
import { orderNumber } from "@lib/admin/shared-schema";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

// The regex only checks shape — `new Date("2023-02-30")` doesn't throw, it
// silently rolls over to 2023-03-02. Re-checking the round-tripped ISO date
// against the input catches that instead of persisting a silently-wrong date.
function parseCalendarDate(value: string, ctx: z.RefinementCtx) {
  const date = new Date(value);
  if (date.toISOString().slice(0, 10) !== value) {
    ctx.addIssue({ code: "custom", message: "Must be a valid date" });
    return z.NEVER;
  }
  return date;
}

const requiredDate = z
  .string()
  .trim()
  .min(1, "Date is required")
  .regex(datePattern, "Must be a valid date")
  .transform(parseCalendarDate);

const optionalDate = z
  .union([z.literal(""), z.string().trim().regex(datePattern, "Must be a valid date")])
  .transform((value, ctx) => (value === "" ? null : parseCalendarDate(value, ctx)));

// Shared by the client form (react-hook-form + @hookform/resolvers/zod) and the
// server action, which validates again independently — per Phase 9's exit
// criteria, client-side validation is never trusted on its own.
export const experienceFormSchema = z.object({
  type: z.enum(["WORK", "EDUCATION"]),
  title: z.string().trim().min(1, "Title is required"),
  organization: z.string().trim().min(1, "Organization is required"),
  location: z
    .string()
    .trim()
    .default("")
    .transform((value) => (value === "" ? null : value)),
  startDate: requiredDate,
  endDate: optionalDate,
  description: z.string().trim().default(""),
  order: orderNumber,
});

export type ExperienceFormInput = z.input<typeof experienceFormSchema>;
export type ExperienceFormOutput = z.output<typeof experienceFormSchema>;
