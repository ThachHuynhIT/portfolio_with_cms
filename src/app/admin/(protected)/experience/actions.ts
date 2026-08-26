"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getExperienceEntryByIdAdmin } from "@lib/admin/experience-entries";
import {
  experienceFormSchema,
  type ExperienceFormInput,
} from "@lib/admin/experience-schema";

export type ExperienceActionState =
  | { error: string; field?: string }
  | undefined;

export async function createExperienceEntryAction(
  input: ExperienceFormInput
): Promise<ExperienceActionState> {
  const session = await auth();
  if (!session) return { error: "Unauthorized." };

  const parsed = experienceFormSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const created = await prisma.experienceEntry.create({
    data: parsed.data,
    select: { id: true },
  });

  revalidatePath("/about");
  revalidatePath("/cv"); // Phase 16 — /cv reads ExperienceEntry too
  redirect(`/admin/experience/${created.id}/edit?created=1`);
}

export async function updateExperienceEntryAction(
  id: string,
  input: ExperienceFormInput
): Promise<ExperienceActionState> {
  const session = await auth();
  if (!session) return { error: "Unauthorized." };

  const parsed = experienceFormSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const existing = await getExperienceEntryByIdAdmin(id);
  if (!existing) return { error: "Experience entry not found." };

  await prisma.experienceEntry.update({ where: { id }, data: parsed.data });

  revalidatePath("/about");
  revalidatePath("/cv"); // Phase 16 — /cv reads ExperienceEntry too
  // No redirect — see skills/actions.ts's updateSkillAction for why.
}

export async function deleteExperienceEntryAction(
  id: string
): Promise<ExperienceActionState> {
  const session = await auth();
  if (!session) return { error: "Unauthorized." };

  const existing = await getExperienceEntryByIdAdmin(id);
  if (!existing) return { error: "Experience entry not found." };

  await prisma.experienceEntry.delete({ where: { id } });
  revalidatePath("/about");
  revalidatePath("/cv"); // Phase 16 — /cv reads ExperienceEntry too
  revalidatePath("/admin/experience");
}
