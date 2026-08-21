import { describe, expect, it, vi, beforeEach, type Mock } from "vitest";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: { contactMessage: { update: vi.fn() } },
}));
vi.mock("@lib/admin/contact-messages", () => ({
  getContactMessageByIdAdmin: vi.fn(),
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getContactMessageByIdAdmin } from "@lib/admin/contact-messages";

// `auth` is overloaded (it also doubles as a middleware wrapper — see
// src/proxy.ts), so `vi.mocked(auth)` resolves the wrong call signature.
// Cast to the mock explicitly instead.
const mockedAuth = auth as unknown as Mock;
const mockedGetById = getContactMessageByIdAdmin as unknown as Mock;

import { setContactMessageReadAction } from "./actions";

// Guards Phase 9's C1 exit criterion: the server action must check auth
// itself, independent of the admin layout gate.
describe("setContactMessageReadAction requires auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedAuth.mockResolvedValue(null);
  });

  it("rejects when unauthenticated without touching Prisma", async () => {
    const result = await setContactMessageReadAction("some-id", true);
    expect(result).toEqual({ error: "Unauthorized." });
    expect(prisma.contactMessage.update).not.toHaveBeenCalled();
  });
});

// Case not covered by any of the 6 CRUD models: their actions.test.ts files
// prove the auth check exists but never prove the server-side safeParse does
// anything, because their inputs are already typed objects from a zod
// resolver. This action's `read` argument has no client-side schema to lean
// on, so this is the first test in the repo that actually removes the type
// guarantee and checks the runtime guard.
describe("setContactMessageReadAction validates input", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedAuth.mockResolvedValue({ user: { email: "admin@example.com" } });
  });

  it("rejects a non-boolean read value without touching Prisma", async () => {
    const result = await setContactMessageReadAction(
      "some-id",
      // @ts-expect-error deliberately passing a runtime-invalid value
      "yes"
    );
    expect(result).toEqual({ error: expect.any(String) });
    expect(prisma.contactMessage.update).not.toHaveBeenCalled();
  });
});

describe("setContactMessageReadAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedAuth.mockResolvedValue({ user: { email: "admin@example.com" } });
  });

  it("returns an error when the message does not exist", async () => {
    mockedGetById.mockResolvedValue(null);

    const result = await setContactMessageReadAction("missing-id", true);

    expect(result).toEqual({ error: "Message not found." });
    expect(prisma.contactMessage.update).not.toHaveBeenCalled();
  });

  it("updates the read flag when the message exists", async () => {
    mockedGetById.mockResolvedValue({ id: "some-id" });

    const result = await setContactMessageReadAction("some-id", true);

    expect(result).toBeUndefined();
    expect(prisma.contactMessage.update).toHaveBeenCalledWith({
      where: { id: "some-id" },
      data: { read: true },
    });
  });
});
