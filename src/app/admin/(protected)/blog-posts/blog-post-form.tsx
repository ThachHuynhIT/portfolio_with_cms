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
import { Markdown } from "@components/markdown/markdown";
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
import styles from "./blog-post-form.module.scss";

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
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BlogPostFormInput>({
    // `raw: true`: validate client-side with the same schema for fast
    // feedback, but hand the server action the untransformed input — the
    // server re-parses independently (never trusts client-side transform
    // output) and is the only place the string->array transform actually
    // runs against data that gets persisted.
    resolver: zodResolver(blogPostFormSchema, undefined, { raw: true }),
    defaultValues,
  });

  const contentValue = watch("content");

  async function submit(data: BlogPostFormInput) {
    setServerError(null);
    const result = blogPostId
      ? await updateBlogPostAction(blogPostId, data)
      : await createBlogPostAction(data);
    if (result?.error) {
      setServerError(result.error);
      toast.error(result.error);
      return;
    }
    toast.success("Blog post saved.");
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
          <FieldLabel htmlFor="excerpt">Excerpt</FieldLabel>
          <Textarea
            id="excerpt"
            rows={2}
            aria-invalid={!!errors.excerpt}
            {...register("excerpt")}
          />
          <FieldError errors={[errors.excerpt]} />
        </Field>

        <Field>
          <div className={styles.contentHeader}>
            <FieldLabel htmlFor="content">Content (Markdown)</FieldLabel>
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
              <Markdown content={contentValue ?? ""} />
            </div>
          ) : (
            <Textarea
              id="content"
              rows={14}
              aria-invalid={!!errors.content}
              {...register("content")}
            />
          )}
          <FieldError errors={[errors.content]} />
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
