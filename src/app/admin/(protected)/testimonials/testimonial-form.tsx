"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import { Field, FieldLabel, FieldError, FieldGroup } from "@components/ui/field";
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
import styles from "./testimonial-form.module.scss";

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
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TestimonialFormInput>({
    // `raw: true`: validate client-side with the same schema for fast
    // feedback, but hand the server action the untransformed input — the
    // server re-parses independently (never trusts client-side transform
    // output).
    resolver: zodResolver(testimonialFormSchema, undefined, { raw: true }),
    defaultValues,
  });

  async function submit(data: TestimonialFormInput) {
    setServerError(null);
    const result = testimonialId
      ? await updateTestimonialAction(testimonialId, data)
      : await createTestimonialAction(data);
    if (result?.error) {
      setServerError(result.error);
      toast.error(result.error);
      return;
    }
    toast.success("Testimonial saved.");
    router.refresh();
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit(submit)} noValidate>
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
          <FieldLabel htmlFor="authorAvatarUrl">Author avatar URL</FieldLabel>
          <Input
            id="authorAvatarUrl"
            aria-invalid={!!errors.authorAvatarUrl}
            {...register("authorAvatarUrl")}
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
