"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { getBlogPostByIdAdmin } from "@lib/admin/blog-posts";
import {
  blogPostFormSchema,
  type BlogPostFormInput,
  type BlogPostFormOutput,
} from "@lib/admin/blogpost-schema";

export type BlogPostActionState =
  | { error: string; field?: string }
  | undefined;

function revalidateBlogPostPaths(slug: string) {
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
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
  data: BlogPostFormOutput,
  previousPublishedAt: Date | null
): Date | null {
  if (data.status !== "PUBLISHED") return null;
  if (previousStatus === "PUBLISHED" && previousPublishedAt) {
    return previousPublishedAt;
  }
  return new Date();
}

export async function createBlogPostAction(
  input: BlogPostFormInput
): Promise<BlogPostActionState> {
  const session = await auth();
  if (!session) return { error: "Unauthorized." };

  const parsed = blogPostFormSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const data = parsed.data;

  let created: { id: string };
  try {
    created = await prisma.blogPost.create({
      data: {
        ...data,
        publishedAt: nextPublishedAt(null, data, null),
      },
      select: { id: true },
    });
  } catch (error) {
    if (isUniqueSlugViolation(error)) {
      return {
        error: "A blog post with this slug already exists.",
        field: "slug",
      };
    }
    throw error;
  }

  revalidateBlogPostPaths(data.slug);
  redirect(`/admin/blog-posts/${created.id}/edit?created=1`);
}

export async function updateBlogPostAction(
  id: string,
  input: BlogPostFormInput
): Promise<BlogPostActionState> {
  const session = await auth();
  if (!session) return { error: "Unauthorized." };

  const parsed = blogPostFormSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const data = parsed.data;

  const existing = await getBlogPostByIdAdmin(id);
  if (!existing) return { error: "Blog post not found." };

  try {
    await prisma.blogPost.update({
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
        error: "A blog post with this slug already exists.",
        field: "slug",
      };
    }
    throw error;
  }

  revalidateBlogPostPaths(data.slug);
  if (existing.slug !== data.slug) revalidateBlogPostPaths(existing.slug);
  // No redirect — see skills/actions.ts's updateSkillAction for why.
}

export async function deleteBlogPostAction(
  id: string
): Promise<BlogPostActionState> {
  const session = await auth();
  if (!session) return { error: "Unauthorized." };

  const existing = await getBlogPostByIdAdmin(id);
  if (!existing) return { error: "Blog post not found." };

  await prisma.blogPost.delete({ where: { id } });
  revalidateBlogPostPaths(existing.slug);
  revalidatePath("/admin/blog-posts");
}
