"use client";

import { Controller } from "react-hook-form";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldLegend,
} from "@components/ui/field";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import { AdminFormActions } from "@components/admin/admin-form-actions";
import { AdminFormError } from "@components/admin/admin-form-error";
import { AdminFormShell } from "@components/admin/admin-form-shell";
import { ImageUploadField } from "@components/admin/image-upload-field";
import { useAdminForm } from "@components/admin/use-admin-form";
import { useUnsavedChangesGuard } from "@components/admin/use-unsaved-changes-guard";
import {
  siteSettingsFormSchema,
  type SiteSettingsFormInput,
} from "@lib/admin/site-settings-schema";
import { updateSiteSettingsAction } from "./actions";

type SiteSettingsFormProps = {
  defaultValues: SiteSettingsFormInput;
};

export function SiteSettingsForm({ defaultValues }: SiteSettingsFormProps) {
  const {
    register,
    control,
    formState: { errors, isSubmitting, isDirty },
    serverError,
    saved,
    onSubmit,
  } = useAdminForm({
    schema: siteSettingsFormSchema,
    defaultValues,
    action: (data) => updateSiteSettingsAction(data),
    successMessage: "Settings saved.",
  });

  useUnsavedChangesGuard(isDirty);

  return (
    <AdminFormShell onSubmit={onSubmit}>
      <AdminFormError message={serverError} />
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="siteName">Site name</FieldLabel>
          <Input
            id="siteName"
            aria-invalid={!!errors.siteName}
            {...register("siteName")}
          />
          <FieldError errors={[errors.siteName]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="tagline">Tagline</FieldLabel>
          <Input
            id="tagline"
            aria-invalid={!!errors.tagline}
            {...register("tagline")}
          />
          <FieldError errors={[errors.tagline]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="heroHeadline">Hero headline</FieldLabel>
          <Input
            id="heroHeadline"
            aria-invalid={!!errors.heroHeadline}
            {...register("heroHeadline")}
          />
          <FieldError errors={[errors.heroHeadline]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="heroSubtext">Hero subtext</FieldLabel>
          <Textarea
            id="heroSubtext"
            rows={3}
            aria-invalid={!!errors.heroSubtext}
            {...register("heroSubtext")}
          />
          <FieldError errors={[errors.heroSubtext]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="heroImageUrl">Hero image</FieldLabel>
          <Controller
            control={control}
            name="heroImageUrl"
            render={({ field }) => (
              <ImageUploadField
                id="heroImageUrl"
                target="site-hero"
                value={field.value}
                onChange={field.onChange}
                alt="Hero image preview"
              />
            )}
          />
          <FieldError errors={[errors.heroImageUrl]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="bio">Bio</FieldLabel>
          <Textarea
            id="bio"
            rows={5}
            aria-invalid={!!errors.bio}
            {...register("bio")}
          />
          <FieldError errors={[errors.bio]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="avatarUrl">Avatar</FieldLabel>
          <Controller
            control={control}
            name="avatarUrl"
            render={({ field }) => (
              <ImageUploadField
                id="avatarUrl"
                target="site-avatar"
                value={field.value}
                onChange={field.onChange}
                alt="Avatar preview"
              />
            )}
          />
          <FieldError errors={[errors.avatarUrl]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="resumeFileUrl">Resume file URL</FieldLabel>
          <Input
            id="resumeFileUrl"
            aria-invalid={!!errors.resumeFileUrl}
            {...register("resumeFileUrl")}
          />
          <FieldError errors={[errors.resumeFileUrl]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="contactEmail">Contact email</FieldLabel>
          <Input
            id="contactEmail"
            type="email"
            aria-invalid={!!errors.contactEmail}
            {...register("contactEmail")}
          />
          <FieldError errors={[errors.contactEmail]} />
        </Field>

        <FieldSet>
          <FieldLegend>Social links</FieldLegend>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="socialLinks.github">GitHub</FieldLabel>
              <Input
                id="socialLinks.github"
                aria-invalid={!!errors.socialLinks?.github}
                {...register("socialLinks.github")}
              />
              <FieldError errors={[errors.socialLinks?.github]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="socialLinks.linkedin">LinkedIn</FieldLabel>
              <Input
                id="socialLinks.linkedin"
                aria-invalid={!!errors.socialLinks?.linkedin}
                {...register("socialLinks.linkedin")}
              />
              <FieldError errors={[errors.socialLinks?.linkedin]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="socialLinks.twitter">Twitter/X</FieldLabel>
              <Input
                id="socialLinks.twitter"
                aria-invalid={!!errors.socialLinks?.twitter}
                {...register("socialLinks.twitter")}
              />
              <FieldError errors={[errors.socialLinks?.twitter]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="socialLinks.instagram">
                Instagram
              </FieldLabel>
              <Input
                id="socialLinks.instagram"
                aria-invalid={!!errors.socialLinks?.instagram}
                {...register("socialLinks.instagram")}
              />
              <FieldError errors={[errors.socialLinks?.instagram]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="socialLinks.youtube">YouTube</FieldLabel>
              <Input
                id="socialLinks.youtube"
                aria-invalid={!!errors.socialLinks?.youtube}
                {...register("socialLinks.youtube")}
              />
              <FieldError errors={[errors.socialLinks?.youtube]} />
            </Field>
          </FieldGroup>
        </FieldSet>

        <Field>
          <FieldLabel htmlFor="defaultSeoTitle">Default SEO title</FieldLabel>
          <Input
            id="defaultSeoTitle"
            aria-invalid={!!errors.defaultSeoTitle}
            {...register("defaultSeoTitle")}
          />
          <FieldError errors={[errors.defaultSeoTitle]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="defaultSeoDescription">
            Default SEO description
          </FieldLabel>
          <Textarea
            id="defaultSeoDescription"
            rows={3}
            aria-invalid={!!errors.defaultSeoDescription}
            {...register("defaultSeoDescription")}
          />
          <FieldError errors={[errors.defaultSeoDescription]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="ogImageUrl">OG image</FieldLabel>
          <Controller
            control={control}
            name="ogImageUrl"
            render={({ field }) => (
              <ImageUploadField
                id="ogImageUrl"
                target="site-og"
                value={field.value}
                onChange={field.onChange}
                alt="OG image preview"
              />
            )}
          />
          <FieldError errors={[errors.ogImageUrl]} />
        </Field>
      </FieldGroup>

      <AdminFormActions
        submitLabel="Save changes"
        isSubmitting={isSubmitting}
        isDirty={isDirty}
        saved={saved}
      />
    </AdminFormShell>
  );
}
