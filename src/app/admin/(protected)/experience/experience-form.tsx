"use client";

import { Controller } from "react-hook-form";
import { Field, FieldError, FieldGroup, FieldLabel } from "@components/ui/field";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import { AdminFormActions } from "@components/admin/admin-form-actions";
import { AdminFormError } from "@components/admin/admin-form-error";
import { AdminFormShell } from "@components/admin/admin-form-shell";
import { useAdminForm } from "@components/admin/use-admin-form";
import { useUnsavedChangesGuard } from "@components/admin/use-unsaved-changes-guard";
import {
  experienceFormSchema,
  type ExperienceFormInput,
} from "@lib/admin/experience-schema";
// Imported directly (not passed down as props): a Server Component can only
// hand a Client Component a real Server Action reference or plain
// serializable data across the boundary — not a closure wrapping one (e.g.
// `(data) => updateExperienceEntryAction(id, data)`). `entryId` is a plain
// string, so it crosses the boundary fine; the action lookup happens here.
import {
  createExperienceEntryAction,
  updateExperienceEntryAction,
} from "./actions";

type ExperienceFormProps = {
  defaultValues: ExperienceFormInput;
  entryId?: string;
  submitLabel: string;
};

export function ExperienceForm({
  defaultValues,
  entryId,
  submitLabel,
}: ExperienceFormProps) {
  const {
    register,
    control,
    formState: { errors, isSubmitting, isDirty },
    serverError,
    saved,
    onSubmit,
  } = useAdminForm({
    schema: experienceFormSchema,
    defaultValues,
    action: (data) =>
      entryId
        ? updateExperienceEntryAction(entryId, data)
        : createExperienceEntryAction(data),
    successMessage: "Experience entry saved.",
  });

  useUnsavedChangesGuard(isDirty);

  return (
    <AdminFormShell onSubmit={onSubmit}>
      <AdminFormError message={serverError} />
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="type">Type</FieldLabel>
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="type" aria-invalid={!!errors.type}>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WORK">Work</SelectItem>
                  <SelectItem value="EDUCATION">Education</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          <FieldError errors={[errors.type]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="title">Title</FieldLabel>
          <Input
            id="title"
            aria-invalid={!!errors.title}
            {...register("title")}
          />
          <FieldError errors={[errors.title]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="organization">Organization</FieldLabel>
          <Input
            id="organization"
            aria-invalid={!!errors.organization}
            {...register("organization")}
          />
          <FieldError errors={[errors.organization]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="location">Location</FieldLabel>
          <Input
            id="location"
            aria-invalid={!!errors.location}
            {...register("location")}
          />
          <FieldError errors={[errors.location]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="startDate">Start date</FieldLabel>
          <Input
            id="startDate"
            type="date"
            aria-invalid={!!errors.startDate}
            {...register("startDate")}
          />
          <FieldError errors={[errors.startDate]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="endDate">End date (blank = present)</FieldLabel>
          <Input
            id="endDate"
            type="date"
            aria-invalid={!!errors.endDate}
            {...register("endDate")}
          />
          <FieldError errors={[errors.endDate]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="description">Description</FieldLabel>
          <Textarea
            id="description"
            rows={4}
            aria-invalid={!!errors.description}
            {...register("description")}
          />
          <FieldError errors={[errors.description]} />
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
        cancelHref="/admin/experience"
      />
    </AdminFormShell>
  );
}
