"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import { Checkbox } from "@components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import { Field, FieldLabel, FieldError, FieldGroup } from "@components/ui/field";
import { Markdown } from "@components/markdown/markdown";
import {
  projectFormSchema,
  type ProjectFormInput,
} from "@lib/admin/project-schema";
// Imported directly (not passed down as props): a Server Component can only
// hand a Client Component a real Server Action reference or plain
// serializable data across the boundary — not a closure wrapping one (e.g.
// `(data) => updateProjectAction(id, data)`). `projectId` is a plain string,
// so it crosses the boundary fine; the action lookup/binding happens here.
import { createProjectAction, updateProjectAction } from "./actions";
import styles from "./project-form.module.scss";

type ProjectFormProps = {
  defaultValues: ProjectFormInput;
  projectId?: string;
  submitLabel: string;
};

export function ProjectForm({
  defaultValues,
  projectId,
  submitLabel,
}: ProjectFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormInput>({
    // `raw: true`: validate client-side with the same schema for fast
    // feedback, but hand the server action the untransformed input — the
    // server re-parses independently (never trusts client-side transform
    // output) and is the only place the string->array transform actually
    // runs against data that gets persisted.
    resolver: zodResolver(projectFormSchema, undefined, { raw: true }),
    defaultValues,
  });

  const descriptionValue = watch("description");

  async function submit(data: ProjectFormInput) {
    setServerError(null);
    const result = projectId
      ? await updateProjectAction(projectId, data)
      : await createProjectAction(data);
    if (result?.error) {
      setServerError(result.error);
      toast.error(result.error);
      return;
    }
    toast.success("Project saved.");
    router.refresh();
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit(submit)} noValidate>
      <FieldGroup>
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
          <FieldLabel htmlFor="slug">Slug</FieldLabel>
          <Input
            id="slug"
            aria-invalid={!!errors.slug}
            {...register("slug")}
          />
          <FieldError errors={[errors.slug]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="summary">Summary</FieldLabel>
          <Textarea
            id="summary"
            rows={2}
            aria-invalid={!!errors.summary}
            {...register("summary")}
          />
          <FieldError errors={[errors.summary]} />
        </Field>

        <Field>
          <div className={styles.descriptionHeader}>
            <FieldLabel htmlFor="description">
              Description (Markdown)
            </FieldLabel>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowPreview((value) => !value)}
            >
              {showPreview ? "Edit" : "Preview"}
            </Button>
          </div>
          {showPreview ? (
            <div className={styles.preview}>
              <Markdown content={descriptionValue ?? ""} />
            </div>
          ) : (
            <Textarea
              id="description"
              rows={10}
              aria-invalid={!!errors.description}
              {...register("description")}
            />
          )}
          <FieldError errors={[errors.description]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="coverImageUrl">Cover image URL</FieldLabel>
          <Input
            id="coverImageUrl"
            aria-invalid={!!errors.coverImageUrl}
            {...register("coverImageUrl")}
          />
          <FieldError errors={[errors.coverImageUrl]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="galleryUrls">
            Gallery URLs (one per line)
          </FieldLabel>
          <Textarea
            id="galleryUrls"
            rows={4}
            aria-invalid={!!errors.galleryUrls}
            {...register("galleryUrls")}
          />
          <FieldError errors={[errors.galleryUrls]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="techTags">Tech tags (comma separated)</FieldLabel>
          <Input
            id="techTags"
            aria-invalid={!!errors.techTags}
            {...register("techTags")}
          />
          <FieldError errors={[errors.techTags]} />
        </Field>

        <Field orientation="responsive">
          <Field>
            <FieldLabel htmlFor="liveUrl">Live URL</FieldLabel>
            <Input
              id="liveUrl"
              aria-invalid={!!errors.liveUrl}
              {...register("liveUrl")}
            />
            <FieldError errors={[errors.liveUrl]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="repoUrl">Repo URL</FieldLabel>
            <Input
              id="repoUrl"
              aria-invalid={!!errors.repoUrl}
              {...register("repoUrl")}
            />
            <FieldError errors={[errors.repoUrl]} />
          </Field>
        </Field>

        <Field orientation="responsive">
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

          <Field orientation="horizontal">
            <Controller
              control={control}
              name="featured"
              render={({ field }) => (
                <Checkbox
                  id="featured"
                  checked={field.value}
                  aria-invalid={!!errors.featured}
                  onCheckedChange={(checked) =>
                    field.onChange(checked === true)
                  }
                />
              )}
            />
            <FieldLabel htmlFor="featured">Featured</FieldLabel>
          </Field>
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

        <Field>
          <FieldLabel htmlFor="seoTitle">SEO title</FieldLabel>
          <Input id="seoTitle" {...register("seoTitle")} />
        </Field>

        <Field>
          <FieldLabel htmlFor="seoDescription">SEO description</FieldLabel>
          <Textarea id="seoDescription" rows={2} {...register("seoDescription")} />
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
