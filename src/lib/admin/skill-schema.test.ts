import { describe, expect, it } from "vitest";
import { skillFormSchema } from "@lib/admin/skill-schema";

const validInput = {
  name: "TypeScript",
  category: "Languages",
  iconUrl: "https://example.com/icon.svg",
  order: 1,
};

describe("skillFormSchema", () => {
  it("accepts a fully valid input", () => {
    const result = skillFormSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("treats an empty icon URL as null, not empty string", () => {
    const result = skillFormSchema.safeParse({ ...validInput, iconUrl: "" });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.iconUrl).toBeNull();
  });

  it("rejects a missing name", () => {
    const result = skillFormSchema.safeParse({ ...validInput, name: "  " });
    expect(result.success).toBe(false);
  });

  it("rejects a missing category", () => {
    const result = skillFormSchema.safeParse({
      ...validInput,
      category: "  ",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a malformed icon URL", () => {
    const result = skillFormSchema.safeParse({
      ...validInput,
      iconUrl: "not-a-url",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an empty order string instead of silently coercing to 0", () => {
    const result = skillFormSchema.safeParse({ ...validInput, order: "" });
    expect(result.success).toBe(false);
  });

  it("rejects a negative order", () => {
    const result = skillFormSchema.safeParse({ ...validInput, order: -1 });
    expect(result.success).toBe(false);
  });
});
