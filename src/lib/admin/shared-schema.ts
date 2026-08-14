import { z } from "zod";

// Shared Zod field builders reused across the admin CRUD schemas
// (src/lib/admin/<model>-schema.ts) — extracted once the same shape
// (order, an optional URL, a slug) started repeating across models.

export const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const urlOrEmpty = z
  .union([z.literal(""), z.string().trim().url("Must be a valid URL")])
  .transform((value) => (value === "" ? null : value));

export const commaSeparatedTags = z
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
export const orderNumber = z
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
