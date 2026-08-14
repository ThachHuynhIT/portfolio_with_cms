import { describe, expect, it } from "vitest";
import { experienceFormSchema } from "@lib/admin/experience-schema";

const validInput = {
  type: "WORK",
  title: "Senior Engineer",
  organization: "Acme Corp",
  location: "Remote",
  startDate: "2020-01-15",
  endDate: "2022-06-30",
  description: "Built things.",
  order: 0,
};

describe("experienceFormSchema", () => {
  it("accepts a fully valid input", () => {
    const result = experienceFormSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("parses startDate/endDate into Date objects", () => {
    const result = experienceFormSchema.safeParse(validInput);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.startDate).toBeInstanceOf(Date);
    expect(result.data.endDate).toBeInstanceOf(Date);
  });

  it("treats an empty endDate as null (ongoing), not empty string", () => {
    const result = experienceFormSchema.safeParse({ ...validInput, endDate: "" });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.endDate).toBeNull();
  });

  it("treats an empty location as null, not empty string", () => {
    const result = experienceFormSchema.safeParse({ ...validInput, location: "" });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.location).toBeNull();
  });

  it("rejects a missing title", () => {
    const result = experienceFormSchema.safeParse({ ...validInput, title: "  " });
    expect(result.success).toBe(false);
  });

  it("rejects a missing organization", () => {
    const result = experienceFormSchema.safeParse({
      ...validInput,
      organization: "  ",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid type", () => {
    const result = experienceFormSchema.safeParse({ ...validInput, type: "OTHER" });
    expect(result.success).toBe(false);
  });

  it("rejects a missing startDate", () => {
    const result = experienceFormSchema.safeParse({ ...validInput, startDate: "" });
    expect(result.success).toBe(false);
  });

  it("rejects a malformed startDate", () => {
    const result = experienceFormSchema.safeParse({
      ...validInput,
      startDate: "not-a-date",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a startDate that isn't a real calendar date instead of silently rolling over", () => {
    const result = experienceFormSchema.safeParse({
      ...validInput,
      startDate: "2023-02-30",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an endDate that isn't a real calendar date instead of silently rolling over", () => {
    const result = experienceFormSchema.safeParse({
      ...validInput,
      endDate: "2023-02-30",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an empty order string instead of silently coercing to 0", () => {
    const result = experienceFormSchema.safeParse({ ...validInput, order: "" });
    expect(result.success).toBe(false);
  });

  it("rejects a negative order", () => {
    const result = experienceFormSchema.safeParse({ ...validInput, order: -1 });
    expect(result.success).toBe(false);
  });
});
