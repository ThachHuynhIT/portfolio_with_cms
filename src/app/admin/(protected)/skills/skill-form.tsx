"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Field, FieldLabel, FieldError, FieldGroup } from "@components/ui/field";
import {
  skillFormSchema,
  type SkillFormInput,
} from "@lib/admin/skill-schema";
// Imported directly (not passed down as props): a Server Component can only
// hand a Client Component a real Server Action reference or plain
// serializable data across the boundary — not a closure wrapping one (e.g.
// `(data) => updateSkillAction(id, data)`). `skillId` is a plain string, so
// it crosses the boundary fine; the action lookup happens here.
import { createSkillAction, updateSkillAction } from "./actions";
import styles from "./skill-form.module.scss";

type SkillFormProps = {
  defaultValues: SkillFormInput;
  skillId?: string;
  submitLabel: string;
};

export function SkillForm({ defaultValues, skillId, submitLabel }: SkillFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SkillFormInput>({
    // `raw: true`: validate client-side with the same schema for fast
    // feedback, but hand the server action the untransformed input — the
    // server re-parses independently (never trusts client-side transform
    // output).
    resolver: zodResolver(skillFormSchema, undefined, { raw: true }),
    defaultValues,
  });

  async function submit(data: SkillFormInput) {
    setServerError(null);
    const result = skillId
      ? await updateSkillAction(skillId, data)
      : await createSkillAction(data);
    if (result?.error) {
      setServerError(result.error);
      toast.error(result.error);
      return;
    }
    toast.success("Skill saved.");
    router.refresh();
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit(submit)} noValidate>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="name">Name</FieldLabel>
          <Input id="name" aria-invalid={!!errors.name} {...register("name")} />
          <FieldError errors={[errors.name]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="category">Category</FieldLabel>
          <Input
            id="category"
            aria-invalid={!!errors.category}
            {...register("category")}
          />
          <FieldError errors={[errors.category]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="iconUrl">Icon URL</FieldLabel>
          <Input
            id="iconUrl"
            aria-invalid={!!errors.iconUrl}
            {...register("iconUrl")}
          />
          <FieldError errors={[errors.iconUrl]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="order">Order</FieldLabel>
          <Input
            id="order"
            type="number"
            aria-invalid={!!errors.order}
            {...register("order", { valueAsNumber: true })}
          />
          <FieldError errors={[errors.order]} />
        </Field>
      </FieldGroup>

      {serverError && (
        <p className={styles.error} role="alert">
          {serverError}
        </p>
      )}

      <Button type="submit" disabled={isSubmitting} className={styles.submit}>
        {isSubmitting ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
