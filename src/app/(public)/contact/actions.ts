"use server";

import { headers } from "next/headers";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { createRateLimiter } from "@lib/rate-limit";
import { contactMessageSchema } from "@lib/contact-schema";

export type ContactActionState = { ok: true } | { error: string };

// Public, unauthenticated write endpoint — the only rate limiter in the app
// keyed by IP instead of email, since there's no account to key off of.
const rateLimiter = createRateLimiter({ max: 3, windowMs: 60 * 60 * 1000 });

const NOTIFICATION_FROM = "Portfolio Contact <onboarding@resend.dev>";
const NOTIFICATION_SUBJECT = "New message from your portfolio contact form";

function getClientIp(headerList: Headers): string {
  // Vercel and most reverse proxies set this; falls back to a shared bucket
  // in environments without it (e.g. local dev) rather than throwing.
  const forwardedFor = headerList.get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() || "unknown";
}

export async function submitContactMessageAction(
  input: unknown,
  honeypot: unknown
): Promise<ContactActionState> {
  const ip = getClientIp(await headers());
  if (rateLimiter.isRateLimited(ip)) {
    return { error: "Too many messages sent. Please try again later." };
  }
  rateLimiter.recordAttempt(ip);

  // A filled honeypot means a bot filled every field it could find. Report
  // success without touching the DB or Resend — never reveal detection.
  if (typeof honeypot === "string" && honeypot.length > 0) {
    return { ok: true };
  }

  const parsed = contactMessageSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const data = parsed.data;

  await prisma.contactMessage.create({
    data: {
      name: data.name,
      email: data.email,
      subject: data.subject,
      message: data.message,
    },
  });

  // A Resend failure must never look like a lost message to the visitor —
  // the record above is already saved. Log and move on rather than
  // surfacing an error for something the visitor did nothing wrong on.
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: NOTIFICATION_FROM,
      to: process.env.CONTACT_NOTIFICATION_EMAIL!,
      subject: NOTIFICATION_SUBJECT,
      replyTo: data.email,
      text: [
        `Name: ${data.name}`,
        `Email: ${data.email}`,
        `Subject: ${data.subject ?? "(none)"}`,
        "",
        data.message,
      ].join("\n"),
    });
    if (error) console.error("Resend send failed:", error);
  } catch (error) {
    console.error("Resend send threw:", error);
  }

  return { ok: true };
}
