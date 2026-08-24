"use client";

import { useEffect } from "react";
import { Controller } from "react-hook-form";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@components/ui/field";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import { Button } from "@components/ui/button";
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
import { TagsInput } from "@components/admin/tags-input";
import { useAdminForm } from "@components/admin/use-admin-form";
import { useUnsavedChangesGuard } from "@components/admin/use-unsaved-changes-guard";
import { slugify } from "@/lib/slugify";
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
    setValue,
    formState: { errors, isSubmitting, isDirty, dirtyFields },
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
  const titleValue = watch("title");
  const slugValue = watch("slug");
  const tagsValue = watch("tags");

  // Create only: keep the slug in sync with the title until the user
  // actually touches the slug field themselves — then stop forever.
  useEffect(() => {
    if (blogPostId) return;
    if (dirtyFields.slug) return;
    setValue("slug", slugify(titleValue ?? ""));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-sync on title changes; re-running on setValue/blogPostId identity would defeat the "stop once touched" guard above.
  }, [titleValue]);

  const slugChangedFromPublished =
    !!blogPostId &&
    defaultValues.status === "PUBLISHED" &&
    slugValue !== defaultValues.slug;

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
          <FieldDescription>
            /blog/{slugValue || "..."}
            {blogPostId && (
              <>
                {" · "}
                <Button
                  type="button"
                  variant="link"
                  size="xs"
                  onClick={() =>
                    setValue("slug", slugify(titleValue ?? ""), {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                >
                  Generate from title
                </Button>
              </>
            )}
          </FieldDescription>
          {slugChangedFromPublished && (
            <FieldDescription>
              Changing the slug breaks existing links.
            </FieldDescription>
          )}
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
          <FieldLabel htmlFor="tags">Tags</FieldLabel>
          <Controller
            control={control}
            name="tags"
            render={({ field }) => (
              <TagsInput
                id="tags"
                value={tagsValue ?? ""}
                onChange={field.onChange}
                placeholder="Add a tag..."
              />
            )}
          />
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
