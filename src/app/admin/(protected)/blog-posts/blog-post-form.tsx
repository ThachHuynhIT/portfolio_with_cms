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
import { MarkdownField } from "@components/admin/markdown-field";
import { useAdminForm } from "@components/admin/use-admin-form";
import { useUnsavedChangesGuard } from "@components/admin/use-unsaved-changes-guard";
import {
  blogPostFormSchema,
  type BlogPostFormInput,
} from "@lib/admin/blogpost-schema";
// Imported directly (not passed down as props): a Server Component can only
// hand a Client Component a real Server Action reference or plain
// serializable data across the boundary — not a closure wrapping one (e.g.
// `(data) => updateBlogPostAction(id, data)`). `blogPostId` is a plain
// string, so it crosses the boundary fine; the action lookup happens here.
import { createBlogPostAction, updateBlogPostAction } from "./actions";

type BlogPostFormProps = {
  defaultValues: BlogPostFormInput;
  blogPostId?: string;
  submitLabel: string;
};

export function BlogPostForm({
  defaultValues,
  blogPostId,
  submitLabel,
}: BlogPostFormProps) {
  const {
    register,
    control,
    watch,
    formState: { errors, isSubmitting, isDirty },
    serverError,
    saved,
    onSubmit,
  } = useAdminForm({
    schema: blogPostFormSchema,
    defaultValues,
    action: (data) =>
      blogPostId
        ? updateBlogPostAction(blogPostId, data)
        : createBlogPostAction(data),
    successMessage: "Blog post saved.",
  });

  const contentValue = watch("content");

  useUnsavedChangesGuard(isDirty);

  return (
    <AdminFormShell width="lg" onSubmit={onSubmit}>
      <AdminFormError message={serverError} />
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
          <FieldLabel htmlFor="excerpt">Excerpt</FieldLabel>
          <Textarea
            id="excerpt"
            rows={2}
            aria-invalid={!!errors.excerpt}
            {...register("excerpt")}
          />
          <FieldError errors={[errors.excerpt]} />
        </Field>

        <MarkdownField
          id="content"
          label="Content (Markdown)"
          value={contentValue ?? ""}
          error={errors.content}
          rows={14}
          inputProps={register("content")}
        />

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
          <FieldLabel htmlFor="tags">Tags (comma separated)</FieldLabel>
          <Input id="tags" aria-invalid={!!errors.tags} {...register("tags")} />
          <FieldError errors={[errors.tags]} />
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

      <AdminFormActions
        submitLabel={submitLabel}
        isSubmitting={isSubmitting}
        isDirty={isDirty}
        saved={saved}
        cancelHref="/admin/blog-posts"
      />
    </AdminFormShell>
  );
}
