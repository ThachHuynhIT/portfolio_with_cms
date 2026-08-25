"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useForm,
  type DefaultValues,
  type FieldValues,
  type Path,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { ZodType } from "zod";

export type AdminActionResult = { error: string; field?: string } | undefined;

export function useAdminForm<TInput extends FieldValues>({
  schema,
  defaultValues,
  action,
  successMessage,
}: {
  schema: ZodType<unknown, TInput>;
  defaultValues: DefaultValues<TInput>;
  action: (data: TInput) => Promise<AdminActionResult>;
  successMessage: string;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const form = useForm<TInput>({
    // `raw: true`: validate client-side with the same schema for fast
    // feedback, but hand the server action the untransformed input — the
    // server re-parses independently (never trusts client-side transform
    // output).
    resolver: zodResolver(schema, undefined, { raw: true }),
    defaultValues,
  });

  // Must NOT wrap `action(data)` in try/catch: on create, a successful
  // action redirects by throwing a special Next.js error, and catching it
  // here would swallow that navigation. If a catch is ever added, it must
  // rethrow when `isRedirectError(e)`.
  async function runAction(data: TInput) {
    setServerError(null);
    setSaved(false);
    const result = await action(data);
    if (result?.error) {
      if (result.field) {
        form.setError(result.field as Path<TInput>, { message: result.error });
      } else {
        setServerError(result.error);
      }
      return;
    }
    toast.success(successMessage);
    setSaved(true);
    router.refresh();
  }

  return {
    ...form,
    serverError,
    saved,
    onSubmit: form.handleSubmit(runAction),
  };
}
