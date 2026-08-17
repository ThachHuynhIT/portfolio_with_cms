"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  siteSettingsFormSchema,
  type SiteSettingsFormInput,
} from "@lib/admin/site-settings-schema";

export type SiteSettingsActionState = { error: string } | undefined;

export async function updateSiteSettingsAction(
  input: SiteSettingsFormInput
): Promise<SiteSettingsActionState> {
  const session = await auth();
  if (!session) return { error: "Unauthorized." };

  const parsed = siteSettingsFormSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  // Singleton row: `upsert` on the hardcoded id instead of update-or-404, so
  // this still works even if the row somehow doesn't exist yet (e.g. a
  // non-seeded database) — there's exactly one valid id, so no separate
  // "not found" branch is meaningful here.
  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", ...parsed.data },
    update: parsed.data,
  });

  // `siteName` renders via the public layout's nav on every public route,
  // not just "/" — revalidating the layout invalidates it everywhere that
  // layout is used, not only the path passed in.
  revalidatePath("/", "layout");
}
