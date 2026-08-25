"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getTestimonialByIdAdmin } from "@lib/admin/testimonials";
import {
  testimonialFormSchema,
  type TestimonialFormInput,
} from "@lib/admin/testimonial-schema";

export type TestimonialActionState =
  | { error: string; field?: string }
  | undefined;

export async function createTestimonialAction(
  input: TestimonialFormInput
): Promise<TestimonialActionState> {
  const session = await auth();
  if (!session) return { error: "Unauthorized." };

  const parsed = testimonialFormSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const created = await prisma.testimonial.create({
    data: parsed.data,
    select: { id: true },
  });

  revalidatePath("/");
  redirect(`/admin/testimonials/${created.id}/edit?created=1`);
}

export async function updateTestimonialAction(
  id: string,
  input: TestimonialFormInput
): Promise<TestimonialActionState> {
  const session = await auth();
  if (!session) return { error: "Unauthorized." };

  const parsed = testimonialFormSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const existing = await getTestimonialByIdAdmin(id);
  if (!existing) return { error: "Testimonial not found." };

  await prisma.testimonial.update({ where: { id }, data: parsed.data });

  revalidatePath("/");
  // No redirect — see skills/actions.ts's updateSkillAction for why.
}

export async function deleteTestimonialAction(
  id: string
): Promise<TestimonialActionState> {
  const session = await auth();
  if (!session) return { error: "Unauthorized." };

  const existing = await getTestimonialByIdAdmin(id);
  if (!existing) return { error: "Testimonial not found." };

  await prisma.testimonial.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/testimonials");
}
