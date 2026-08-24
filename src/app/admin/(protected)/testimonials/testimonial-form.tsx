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
import { ImageUploadField } from "@components/admin/image-upload-field";
import { useAdminForm } from "@components/admin/use-admin-form";
import { useUnsavedChangesGuard } from "@components/admin/use-unsaved-changes-guard";
import {
  testimonialFormSchema,
  type TestimonialFormInput,
} from "@lib/admin/testimonial-schema";
// Imported directly (not passed down as props): a Server Component can only
// hand a Client Component a real Server Action reference or plain
// serializable data across the boundary — not a closure wrapping one (e.g.
// `(data) => updateTestimonialAction(id, data)`). `testimonialId` is a plain
// string, so it crosses the boundary fine; the action lookup happens here.
import {
  createTestimonialAction,
  updateTestimonialAction,
} from "./actions";

type TestimonialFormProps = {
  defaultValues: TestimonialFormInput;
  testimonialId?: string;
  submitLabel: string;
};

export function TestimonialForm({
  defaultValues,
  testimonialId,
  submitLabel,
}: TestimonialFormProps) {
  const {
    register,
    control,
    formState: { errors, isSubmitting, isDirty },
    serverError,
    saved,
    onSubmit,
  } = useAdminForm({
    schema: testimonialFormSchema,
    defaultValues,
    action: (data) =>
      testimonialId
        ? updateTestimonialAction(testimonialId, data)
        : createTestimonialAction(data),
    successMessage: "Testimonial saved.",
  });

  useUnsavedChangesGuard(isDirty);

  return (
    <AdminFormShell onSubmit={onSubmit}>
      <AdminFormError message={serverError} />
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="authorName">Author name</FieldLabel>
          <Input
            id="authorName"
            aria-invalid={!!errors.authorName}
            {...register("authorName")}
          />
          <FieldError errors={[errors.authorName]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="authorRole">Author role</FieldLabel>
          <Input
            id="authorRole"
            aria-invalid={!!errors.authorRole}
            {...register("authorRole")}
          />
          <FieldError errors={[errors.authorRole]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="authorAvatarUrl">Author avatar</FieldLabel>
          <Controller
            control={control}
            name="authorAvatarUrl"
            render={({ field }) => (
              <ImageUploadField
                id="authorAvatarUrl"
                target="testimonial-avatar"
                value={field.value}
                onChange={field.onChange}
                alt="Author avatar preview"
              />
            )}
          />
          <FieldError errors={[errors.authorAvatarUrl]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="quote">Quote</FieldLabel>
          <Textarea
            id="quote"
            rows={4}
            aria-invalid={!!errors.quote}
            {...register("quote")}
          />
          <FieldError errors={[errors.quote]} />
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

        <Field>
          <FieldLabel htmlFor="status">Status</FieldLabel>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="status" aria-invalid={!!errors.status}>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          <FieldError errors={[errors.status]} />
        </Field>
      </FieldGroup>

      <AdminFormActions
        submitLabel={submitLabel}
        isSubmitting={isSubmitting}
        isDirty={isDirty}
        saved={saved}
        cancelHref="/admin/testimonials"
      />
    </AdminFormShell>
  );
}
