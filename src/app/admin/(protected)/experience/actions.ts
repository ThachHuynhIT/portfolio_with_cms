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

export type ExperienceActionState = { error: string } | undefined;

export async function createExperienceEntryAction(
  input: ExperienceFormInput
): Promise<ExperienceActionState> {
  const session = await auth();
  if (!session) return { error: "Unauthorized." };

  const parsed = experienceFormSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  await prisma.experienceEntry.create({ data: parsed.data });

  revalidatePath("/about");
  redirect("/admin/experience");
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
  redirect("/admin/experience");
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
  revalidatePath("/admin/experience");
}
