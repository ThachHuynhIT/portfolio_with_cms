"use client";

import { Controller } from "react-hook-form";
import { Field, FieldError, FieldGroup, FieldLabel } from "@components/ui/field";
import { Input } from "@components/ui/input";
import { AdminFormActions } from "@components/admin/admin-form-actions";
import { AdminFormError } from "@components/admin/admin-form-error";
import { AdminFormShell } from "@components/admin/admin-form-shell";
import { ImageUploadField } from "@components/admin/image-upload-field";
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
    control,
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
          <Input
            id="name"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "name-error" : undefined}
            {...register("name")}
          />
          <FieldError id="name-error" errors={[errors.name]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="category">Category</FieldLabel>
          <Input
            id="category"
            aria-invalid={!!errors.category}
            aria-describedby={errors.category ? "category-error" : undefined}
            {...register("category")}
          />
          <FieldError id="category-error" errors={[errors.category]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="iconUrl">Icon</FieldLabel>
          <Controller
            control={control}
            name="iconUrl"
            render={({ field }) => (
              <ImageUploadField
                id="iconUrl"
                target="skill-icon"
                value={field.value}
                onChange={field.onChange}
                alt="Icon preview"
                aria-describedby={errors.iconUrl ? "iconUrl-error" : undefined}
              />
            )}
          />
          <FieldError id="iconUrl-error" errors={[errors.iconUrl]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="order">Order</FieldLabel>
          <Input
            id="order"
            type="number"
            aria-invalid={!!errors.order}
            aria-describedby={errors.order ? "order-error" : undefined}
            {...register("order", { valueAsNumber: true })}
          />
          <FieldError id="order-error" errors={[errors.order]} />
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
