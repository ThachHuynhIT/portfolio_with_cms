"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getSkillByIdAdmin } from "@lib/admin/skills";
import { skillFormSchema, type SkillFormInput } from "@lib/admin/skill-schema";

export type SkillActionState = { error: string; field?: string } | undefined;

export async function createSkillAction(
  input: SkillFormInput
): Promise<SkillActionState> {
  const session = await auth();
  if (!session) return { error: "Unauthorized." };

  const parsed = skillFormSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const created = await prisma.skill.create({
    data: parsed.data,
    select: { id: true },
  });

  revalidatePath("/about");
  redirect(`/admin/skills/${created.id}/edit?created=1`);
}

export async function updateSkillAction(
  id: string,
  input: SkillFormInput
): Promise<SkillActionState> {
  const session = await auth();
  if (!session) return { error: "Unauthorized." };

  const parsed = skillFormSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const existing = await getSkillByIdAdmin(id);
  if (!existing) return { error: "Skill not found." };

  await prisma.skill.update({ where: { id }, data: parsed.data });

  revalidatePath("/about");
  // No redirect — stays on the edit page so the client can show a "Saved"
  // state and router.refresh() (see useAdminForm), instead of bouncing back
  // to the list where the update actually happened.
}

export async function deleteSkillAction(
  id: string
): Promise<SkillActionState> {
  const session = await auth();
  if (!session) return { error: "Unauthorized." };

  const existing = await getSkillByIdAdmin(id);
  if (!existing) return { error: "Skill not found." };

  await prisma.skill.delete({ where: { id } });
  revalidatePath("/about");
  revalidatePath("/admin/skills");
}
