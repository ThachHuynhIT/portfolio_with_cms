import { describe, expect, it } from "vitest";
import { contactMessageSchema } from "./contact-schema";

const validInput = {
  name: "Jane Doe",
  email: "jane@example.com",
  subject: "Hello",
  message: "Just saying hi.",
};

describe("contactMessageSchema", () => {
  it("accepts a fully valid submission", () => {
    const result = contactMessageSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("accepts a missing/empty subject and normalizes it to null", () => {
    const result = contactMessageSchema.safeParse({
      ...validInput,
      subject: "",
    });
    expect(result.success).toBe(true);
    expect(result.success && result.data.subject).toBeNull();
  });

  it("rejects an empty name", () => {
    const result = contactMessageSchema.safeParse({ ...validInput, name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = contactMessageSchema.safeParse({
      ...validInput,
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an empty message", () => {
    const result = contactMessageSchema.safeParse({
      ...validInput,
      message: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a message over the max length", () => {
    const result = contactMessageSchema.safeParse({
      ...validInput,
      message: "a".repeat(2001),
    });
    expect(result.success).toBe(false);
  });
});
