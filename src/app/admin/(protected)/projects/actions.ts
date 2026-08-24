"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { getProjectByIdAdmin } from "@lib/admin/projects";
import {
  projectFormSchema,
  type ProjectFormInput,
  type ProjectFormOutput,
} from "@lib/admin/project-schema";

export type ProjectActionState = { error: string; field?: string } | undefined;

function revalidateProjectPaths(slug: string) {
  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath(`/projects/${slug}`);
}

// The slug regex/uniqueness is enforced by the schema + DB constraint, but a
// duplicate slug only surfaces as a Postgres unique-violation at write time.
function isUniqueSlugViolation(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

function nextPublishedAt(
  previousStatus: "DRAFT" | "PUBLISHED" | null,
  data: ProjectFormOutput,
  previousPublishedAt: Date | null
): Date | null {
  if (data.status !== "PUBLISHED") return null;
  if (previousStatus === "PUBLISHED" && previousPublishedAt) {
    return previousPublishedAt;
  }
  return new Date();
}

export async function createProjectAction(
  input: ProjectFormInput
): Promise<ProjectActionState> {
  const session = await auth();
  if (!session) return { error: "Unauthorized." };

  const parsed = projectFormSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const data = parsed.data;

  let created: { id: string };
  try {
    created = await prisma.project.create({
      data: {
        ...data,
        publishedAt: nextPublishedAt(null, data, null),
      },
      select: { id: true },
    });
  } catch (error) {
    if (isUniqueSlugViolation(error)) {
      return {
        error: "A project with this slug already exists.",
        field: "slug",
      };
    }
    throw error;
  }

  revalidateProjectPaths(data.slug);
  redirect(`/admin/projects/${created.id}/edit?created=1`);
}

export async function updateProjectAction(
  id: string,
  input: ProjectFormInput
): Promise<ProjectActionState> {
  const session = await auth();
  if (!session) return { error: "Unauthorized." };

  const parsed = projectFormSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const data = parsed.data;

  const existing = await getProjectByIdAdmin(id);
  if (!existing) return { error: "Project not found." };

  try {
    await prisma.project.update({
      where: { id },
      data: {
        ...data,
        publishedAt: nextPublishedAt(
          existing.status,
          data,
          existing.publishedAt
        ),
      },
    });
  } catch (error) {
    if (isUniqueSlugViolation(error)) {
      return {
        error: "A project with this slug already exists.",
        field: "slug",
      };
    }
    throw error;
  }

  revalidateProjectPaths(data.slug);
  if (existing.slug !== data.slug) revalidateProjectPaths(existing.slug);
  // No redirect — see skills/actions.ts's updateSkillAction for why.
}

export async function deleteProjectAction(
  id: string
): Promise<ProjectActionState> {
  const session = await auth();
  if (!session) return { error: "Unauthorized." };

  const existing = await getProjectByIdAdmin(id);
  if (!existing) return { error: "Project not found." };

  await prisma.project.delete({ where: { id } });
  revalidateProjectPaths(existing.slug);
  revalidatePath("/admin/projects");
}
