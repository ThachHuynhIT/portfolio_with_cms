"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getContactMessageByIdAdmin } from "@lib/admin/contact-messages";

export type ContactMessageActionState = { error: string } | undefined;

export async function setContactMessageReadAction(
  id: string,
  read: boolean
): Promise<ContactMessageActionState> {
  const session = await auth();
  if (!session) return { error: "Unauthorized." };

  // Server action arguments are controlled by the client at runtime —
  // TypeScript gives no guarantee here. This is the one admin action in the
  // repo whose arguments can genuinely be forged by an outside caller, so
  // parsing them is real security, not ceremony.
  const parsed = z
    .object({ id: z.string().min(1), read: z.boolean() })
    .safeParse({ id, read });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const existing = await getContactMessageByIdAdmin(parsed.data.id);
  if (!existing) return { error: "Message not found." };

  await prisma.contactMessage.update({
    where: { id: parsed.data.id },
    data: { read: parsed.data.read },
  });

  // No public destination — messages never render outside /admin.
  revalidatePath("/admin/contact-messages");
  revalidatePath(`/admin/contact-messages/${parsed.data.id}`);
  // No redirect(): the toggle stays put, on the list or the detail page.
}
