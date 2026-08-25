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
            aria-describedby={
              errors.authorName ? "authorName-error" : undefined
            }
            {...register("authorName")}
          />
          <FieldError id="authorName-error" errors={[errors.authorName]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="authorRole">Author role</FieldLabel>
          <Input
            id="authorRole"
            aria-invalid={!!errors.authorRole}
            aria-describedby={
              errors.authorRole ? "authorRole-error" : undefined
            }
            {...register("authorRole")}
          />
          <FieldError id="authorRole-error" errors={[errors.authorRole]} />
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
                aria-describedby={
                  errors.authorAvatarUrl ? "authorAvatarUrl-error" : undefined
                }
              />
            )}
          />
          <FieldError
            id="authorAvatarUrl-error"
            errors={[errors.authorAvatarUrl]}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="quote">Quote</FieldLabel>
          <Textarea
            id="quote"
            rows={4}
            aria-invalid={!!errors.quote}
            aria-describedby={errors.quote ? "quote-error" : undefined}
            {...register("quote")}
          />
          <FieldError id="quote-error" errors={[errors.quote]} />
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

        <Field>
          <FieldLabel htmlFor="status">Status</FieldLabel>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  id="status"
                  aria-invalid={!!errors.status}
                  aria-describedby={errors.status ? "status-error" : undefined}
                >
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          <FieldError id="status-error" errors={[errors.status]} />
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
