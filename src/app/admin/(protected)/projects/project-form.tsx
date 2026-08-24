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
import { Checkbox } from "@components/ui/checkbox";
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
import { ImageUploadField } from "@components/admin/image-upload-field";
import { MarkdownField } from "@components/admin/markdown-field";
import { TagsInput } from "@components/admin/tags-input";
import { UrlListInput } from "@components/admin/url-list-input";
import { useAdminForm } from "@components/admin/use-admin-form";
import { useUnsavedChangesGuard } from "@components/admin/use-unsaved-changes-guard";
import { slugify } from "@/lib/slugify";
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
    schema: projectFormSchema,
    defaultValues,
    action: (data) =>
      projectId
        ? updateProjectAction(projectId, data)
        : createProjectAction(data),
    successMessage: "Project saved.",
  });

  const descriptionValue = watch("description");
  const titleValue = watch("title");
  const slugValue = watch("slug");
  const techTagsValue = watch("techTags");
  const galleryUrlsValue = watch("galleryUrls");

  // Create only: keep the slug in sync with the title until the user
  // actually touches the slug field themselves — then stop forever.
  useEffect(() => {
    if (projectId) return;
    if (dirtyFields.slug) return;
    setValue("slug", slugify(titleValue ?? ""));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-sync on title changes; re-running on setValue/projectId identity would defeat the "stop once touched" guard above.
  }, [titleValue]);

  const slugChangedFromPublished =
    !!projectId &&
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
            /projects/{slugValue || "..."}
            {projectId && (
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
          <FieldLabel htmlFor="summary">Summary</FieldLabel>
          <Textarea
            id="summary"
            rows={2}
            aria-invalid={!!errors.summary}
            {...register("summary")}
          />
          <FieldError errors={[errors.summary]} />
        </Field>

        <MarkdownField
          id="description"
          label="Description (Markdown)"
          value={descriptionValue ?? ""}
          error={errors.description}
          rows={10}
          inputProps={register("description")}
        />

        <Field>
          <FieldLabel htmlFor="coverImageUrl">Cover image</FieldLabel>
          <Controller
            control={control}
            name="coverImageUrl"
            render={({ field }) => (
              <ImageUploadField
                id="coverImageUrl"
                target="project-cover"
                value={field.value}
                onChange={field.onChange}
                alt="Cover image preview"
              />
            )}
          />
          <FieldError errors={[errors.coverImageUrl]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="galleryUrls">Gallery URLs</FieldLabel>
          <Controller
            control={control}
            name="galleryUrls"
            render={({ field }) => (
              <UrlListInput
                id="galleryUrls"
                value={galleryUrlsValue ?? ""}
                onChange={field.onChange}
                uploadTarget="project-gallery"
              />
            )}
          />
          <FieldError errors={[errors.galleryUrls]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="techTags">Tech tags</FieldLabel>
          <Controller
            control={control}
            name="techTags"
            render={({ field }) => (
              <TagsInput
                id="techTags"
                value={techTagsValue ?? ""}
                onChange={field.onChange}
                placeholder="Add a tag..."
              />
            )}
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

      <AdminFormActions
        submitLabel={submitLabel}
        isSubmitting={isSubmitting}
        isDirty={isDirty}
        saved={saved}
        cancelHref="/admin/projects"
      />
    </AdminFormShell>
  );
}
