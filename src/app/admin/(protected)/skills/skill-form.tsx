"use client";

import { Field, FieldError, FieldGroup, FieldLabel } from "@components/ui/field";
import { Input } from "@components/ui/input";
import { AdminFormActions } from "@components/admin/admin-form-actions";
import { AdminFormError } from "@components/admin/admin-form-error";
import { AdminFormShell } from "@components/admin/admin-form-shell";
import { useAdminForm } from "@components/admin/use-admin-form";
import { useUnsavedChangesGuard } from "@components/admin/use-unsaved-changes-guard";
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

type SkillFormProps = {
  defaultValues: SkillFormInput;
  skillId?: string;
  submitLabel: string;
};

export function SkillForm({ defaultValues, skillId, submitLabel }: SkillFormProps) {
  const {
    register,
    formState: { errors, isSubmitting, isDirty },
    serverError,
    saved,
    onSubmit,
  } = useAdminForm({
    schema: skillFormSchema,
    defaultValues,
    action: (data) =>
      skillId ? updateSkillAction(skillId, data) : createSkillAction(data),
    successMessage: "Skill saved.",
  });

  useUnsavedChangesGuard(isDirty);

  return (
    <AdminFormShell onSubmit={onSubmit}>
      <AdminFormError message={serverError} />
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

      <AdminFormActions
        submitLabel={submitLabel}
        isSubmitting={isSubmitting}
        isDirty={isDirty}
        saved={saved}
        cancelHref="/admin/skills"
      />
    </AdminFormShell>
  );
}
