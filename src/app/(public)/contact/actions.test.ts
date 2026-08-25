import { describe, expect, it, vi, beforeEach } from "vitest";

const { sendMock, headersMock } = vi.hoisted(() => ({
  sendMock: vi.fn(() => Promise.resolve({ data: { id: "email-id" }, error: null })),
  headersMock: vi.fn(),
}));

vi.mock("next/headers", () => ({ headers: headersMock }));
vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(function ResendMock() {
    return { emails: { send: sendMock } };
  }),
}));
vi.mock("@/lib/prisma", () => ({
  prisma: { contactMessage: { create: vi.fn() } },
}));

vi.stubEnv("CONTACT_NOTIFICATION_EMAIL", "owner@example.com");
vi.stubEnv("RESEND_API_KEY", "test-key");

import { prisma } from "@/lib/prisma";
import { submitContactMessageAction } from "./actions";

const mockedCreate = prisma.contactMessage.create as unknown as ReturnType<
  typeof vi.fn
>;

function headersFor(ip: string) {
  return new Headers({ "x-forwarded-for": ip });
}

const validInput = {
  name: "Jane Doe",
  email: "jane@example.com",
  subject: "Hello",
  message: "Just saying hi.",
};

describe("submitContactMessageAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sendMock.mockResolvedValue({ data: { id: "email-id" }, error: null });
  });

  it("saves the message and sends the notification email for valid input", async () => {
    headersMock.mockResolvedValue(headersFor("1.1.1.1"));

    const result = await submitContactMessageAction(validInput, "");

    expect(result).toEqual({ ok: true });
    expect(mockedCreate).toHaveBeenCalledWith({
      data: {
        name: "Jane Doe",
        email: "jane@example.com",
        subject: "Hello",
        message: "Just saying hi.",
      },
    });
    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "owner@example.com",
        replyTo: "jane@example.com",
      })
    );
  });

  it("pretends success on a filled honeypot without touching Prisma or Resend", async () => {
    headersMock.mockResolvedValue(headersFor("2.2.2.2"));

    const result = await submitContactMessageAction(
      validInput,
      "i-am-a-bot"
    );

    expect(result).toEqual({ ok: true });
    expect(mockedCreate).not.toHaveBeenCalled();
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("rejects invalid input without touching Prisma or Resend", async () => {
    headersMock.mockResolvedValue(headersFor("3.3.3.3"));

    const result = await submitContactMessageAction(
      { ...validInput, email: "not-an-email" },
      ""
    );

    expect(result).toEqual({ error: expect.any(String) });
    expect(mockedCreate).not.toHaveBeenCalled();
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("rate limits after 3 submissions from the same IP", async () => {
    headersMock.mockResolvedValue(headersFor("4.4.4.4"));

    await submitContactMessageAction(validInput, "");
    await submitContactMessageAction(validInput, "");
    await submitContactMessageAction(validInput, "");
    const fourth = await submitContactMessageAction(validInput, "");

    expect(fourth).toEqual({ error: expect.any(String) });
    expect(mockedCreate).toHaveBeenCalledTimes(3);
  });

  it("still saves the message and reports success when Resend throws", async () => {
    headersMock.mockResolvedValue(headersFor("5.5.5.5"));
    sendMock.mockRejectedValue(new Error("Resend is down"));

    const result = await submitContactMessageAction(validInput, "");

    expect(result).toEqual({ ok: true });
    expect(mockedCreate).toHaveBeenCalledTimes(1);
  });
});
