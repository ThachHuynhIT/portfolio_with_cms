"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  contactMessageSchema,
  type ContactMessageInput,
} from "@lib/contact-schema";
import { submitContactMessageAction } from "./actions";
import styles from "./contact-form.module.scss";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "success">("idle");
  const [serverError, setServerError] = useState<string | null>(null);
  // Not part of the Zod schema on purpose — a bot filling this field must
  // short-circuit in the action before validation even runs.
  const [honeypot, setHoneypot] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactMessageInput>({
    // raw: true — validate client-side for fast feedback, but hand the
    // server action the untransformed input; the action re-parses
    // independently (never trusts client-side transform output).
    resolver: zodResolver(contactMessageSchema, undefined, { raw: true }),
  });

  async function onSubmit(data: ContactMessageInput) {
    setServerError(null);
    const result = await submitContactMessageAction(data, honeypot);
    if ("error" in result) {
      setServerError(result.error);
      return;
    }
    setStatus("success");
  }

  if (status === "success") {
    return (
      <div className={styles.success} role="status">
        <p className={styles.successTitle}>Message sent.</p>
        <p className={styles.successBody}>
          Thanks for reaching out — I&apos;ll get back to you soon.
        </p>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      {serverError && (
        <p className={styles.formError} role="alert">
          {serverError}
        </p>
      )}

      {/* Honeypot: invisible and unreachable for real visitors (tabIndex
          -1 + aria-hidden), but a bot parsing the raw HTML will still find
          and fill an ordinary-looking field. */}
      <div className={styles.honeypot} aria-hidden="true">
        <label htmlFor="company">Company</label>
        <input
          id="company"
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(event) => setHoneypot(event.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="name" className={styles.label}>
          Name
        </label>
        <input
          id="name"
          className={styles.input}
          aria-invalid={!!errors.name}
          {...register("name")}
        />
        {errors.name && (
          <p className={styles.fieldError}>{errors.name.message}</p>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="email" className={styles.label}>
          Email
        </label>
        <input
          id="email"
          type="email"
          className={styles.input}
          aria-invalid={!!errors.email}
          {...register("email")}
        />
        {errors.email && (
          <p className={styles.fieldError}>{errors.email.message}</p>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="subject" className={styles.label}>
          Subject <span className={styles.optional}>(optional)</span>
        </label>
        <input
          id="subject"
          className={styles.input}
          aria-invalid={!!errors.subject}
          {...register("subject")}
        />
        {errors.subject && (
          <p className={styles.fieldError}>{errors.subject.message}</p>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="message" className={styles.label}>
          Message
        </label>
        <textarea
          id="message"
          rows={6}
          className={styles.textarea}
          aria-invalid={!!errors.message}
          {...register("message")}
        />
        {errors.message && (
          <p className={styles.fieldError}>{errors.message.message}</p>
        )}
      </div>

      <button type="submit" className={styles.submit} disabled={isSubmitting}>
        {isSubmitting ? "Sending..." : "Send message"}
      </button>
    </form>
  );
}
