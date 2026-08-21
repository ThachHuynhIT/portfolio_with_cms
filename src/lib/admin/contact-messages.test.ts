import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    contactMessage: { findMany: vi.fn(), findUnique: vi.fn() },
  },
}));

import { prisma } from "@/lib/prisma";
import {
  getAllContactMessagesAdmin,
  getContactMessageByIdAdmin,
} from "@lib/admin/contact-messages";

describe("getAllContactMessagesAdmin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("orders by createdAt descending, newest first", () => {
    getAllContactMessagesAdmin();
    expect(prisma.contactMessage.findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: "desc" },
    });
  });
});

describe("getContactMessageByIdAdmin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("looks up only by id", () => {
    getContactMessageByIdAdmin("some-id");
    expect(prisma.contactMessage.findUnique).toHaveBeenCalledWith({
      where: { id: "some-id" },
    });
  });
});
