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

export type TestimonialActionState = { error: string } | undefined;

export async function createTestimonialAction(
  input: TestimonialFormInput
): Promise<TestimonialActionState> {
  const session = await auth();
  if (!session) return { error: "Unauthorized." };

  const parsed = testimonialFormSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  await prisma.testimonial.create({ data: parsed.data });

  revalidatePath("/");
  redirect("/admin/testimonials");
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
  redirect("/admin/testimonials");
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
