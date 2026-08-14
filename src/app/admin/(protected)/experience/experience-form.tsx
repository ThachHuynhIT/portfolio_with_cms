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
import styles from "./experience-form.module.scss";

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
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ExperienceFormInput>({
    // `raw: true`: validate client-side with the same schema for fast
    // feedback, but hand the server action the untransformed input — the
    // server re-parses independently (never trusts client-side transform
    // output).
    resolver: zodResolver(experienceFormSchema, undefined, { raw: true }),
    defaultValues,
  });

  async function submit(data: ExperienceFormInput) {
    setServerError(null);
    const result = entryId
      ? await updateExperienceEntryAction(entryId, data)
      : await createExperienceEntryAction(data);
    if (result?.error) {
      setServerError(result.error);
      toast.error(result.error);
      return;
    }
    toast.success("Experience entry saved.");
    router.refresh();
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit(submit)} noValidate>
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
