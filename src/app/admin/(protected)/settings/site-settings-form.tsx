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
            aria-describedby={errors.siteName ? "siteName-error" : undefined}
            {...register("siteName")}
          />
          <FieldError id="siteName-error" errors={[errors.siteName]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="tagline">Tagline</FieldLabel>
          <Input
            id="tagline"
            aria-invalid={!!errors.tagline}
            aria-describedby={errors.tagline ? "tagline-error" : undefined}
            {...register("tagline")}
          />
          <FieldError id="tagline-error" errors={[errors.tagline]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="heroHeadline">Hero headline</FieldLabel>
          <Input
            id="heroHeadline"
            aria-invalid={!!errors.heroHeadline}
            aria-describedby={
              errors.heroHeadline ? "heroHeadline-error" : undefined
            }
            {...register("heroHeadline")}
          />
          <FieldError id="heroHeadline-error" errors={[errors.heroHeadline]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="heroSubtext">Hero subtext</FieldLabel>
          <Textarea
            id="heroSubtext"
            rows={3}
            aria-invalid={!!errors.heroSubtext}
            aria-describedby={
              errors.heroSubtext ? "heroSubtext-error" : undefined
            }
            {...register("heroSubtext")}
          />
          <FieldError id="heroSubtext-error" errors={[errors.heroSubtext]} />
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
                aria-describedby={
                  errors.heroImageUrl ? "heroImageUrl-error" : undefined
                }
              />
            )}
          />
          <FieldError id="heroImageUrl-error" errors={[errors.heroImageUrl]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="bio">Bio</FieldLabel>
          <Textarea
            id="bio"
            rows={5}
            aria-invalid={!!errors.bio}
            aria-describedby={errors.bio ? "bio-error" : undefined}
            {...register("bio")}
          />
          <FieldError id="bio-error" errors={[errors.bio]} />
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
                aria-describedby={
                  errors.avatarUrl ? "avatarUrl-error" : undefined
                }
              />
            )}
          />
          <FieldError id="avatarUrl-error" errors={[errors.avatarUrl]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="resumeFileUrl">Resume file URL</FieldLabel>
          <Input
            id="resumeFileUrl"
            aria-invalid={!!errors.resumeFileUrl}
            aria-describedby={
              errors.resumeFileUrl ? "resumeFileUrl-error" : undefined
            }
            {...register("resumeFileUrl")}
          />
          <FieldError id="resumeFileUrl-error" errors={[errors.resumeFileUrl]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="contactEmail">Contact email</FieldLabel>
          <Input
            id="contactEmail"
            type="email"
            aria-invalid={!!errors.contactEmail}
            aria-describedby={
              errors.contactEmail ? "contactEmail-error" : undefined
            }
            {...register("contactEmail")}
          />
          <FieldError id="contactEmail-error" errors={[errors.contactEmail]} />
        </Field>

        <FieldSet>
          <FieldLegend>Social links</FieldLegend>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="socialLinks.github">GitHub</FieldLabel>
              <Input
                id="socialLinks.github"
                aria-invalid={!!errors.socialLinks?.github}
                aria-describedby={
                  errors.socialLinks?.github
                    ? "socialLinks.github-error"
                    : undefined
                }
                {...register("socialLinks.github")}
              />
              <FieldError
                id="socialLinks.github-error"
                errors={[errors.socialLinks?.github]}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="socialLinks.linkedin">LinkedIn</FieldLabel>
              <Input
                id="socialLinks.linkedin"
                aria-invalid={!!errors.socialLinks?.linkedin}
                aria-describedby={
                  errors.socialLinks?.linkedin
                    ? "socialLinks.linkedin-error"
                    : undefined
                }
                {...register("socialLinks.linkedin")}
              />
              <FieldError
                id="socialLinks.linkedin-error"
                errors={[errors.socialLinks?.linkedin]}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="socialLinks.twitter">Twitter/X</FieldLabel>
              <Input
                id="socialLinks.twitter"
                aria-invalid={!!errors.socialLinks?.twitter}
                aria-describedby={
                  errors.socialLinks?.twitter
                    ? "socialLinks.twitter-error"
                    : undefined
                }
                {...register("socialLinks.twitter")}
              />
              <FieldError
                id="socialLinks.twitter-error"
                errors={[errors.socialLinks?.twitter]}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="socialLinks.instagram">
                Instagram
              </FieldLabel>
              <Input
                id="socialLinks.instagram"
                aria-invalid={!!errors.socialLinks?.instagram}
                aria-describedby={
                  errors.socialLinks?.instagram
                    ? "socialLinks.instagram-error"
                    : undefined
                }
                {...register("socialLinks.instagram")}
              />
              <FieldError
                id="socialLinks.instagram-error"
                errors={[errors.socialLinks?.instagram]}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="socialLinks.youtube">YouTube</FieldLabel>
              <Input
                id="socialLinks.youtube"
                aria-invalid={!!errors.socialLinks?.youtube}
                aria-describedby={
                  errors.socialLinks?.youtube
                    ? "socialLinks.youtube-error"
                    : undefined
                }
                {...register("socialLinks.youtube")}
              />
              <FieldError
                id="socialLinks.youtube-error"
                errors={[errors.socialLinks?.youtube]}
              />
            </Field>
          </FieldGroup>
        </FieldSet>

        <Field>
          <FieldLabel htmlFor="defaultSeoTitle">Default SEO title</FieldLabel>
          <Input
            id="defaultSeoTitle"
            aria-invalid={!!errors.defaultSeoTitle}
            aria-describedby={
              errors.defaultSeoTitle ? "defaultSeoTitle-error" : undefined
            }
            {...register("defaultSeoTitle")}
          />
          <FieldError id="defaultSeoTitle-error" errors={[errors.defaultSeoTitle]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="defaultSeoDescription">
            Default SEO description
          </FieldLabel>
          <Textarea
            id="defaultSeoDescription"
            rows={3}
            aria-invalid={!!errors.defaultSeoDescription}
            aria-describedby={
              errors.defaultSeoDescription
                ? "defaultSeoDescription-error"
                : undefined
            }
            {...register("defaultSeoDescription")}
          />
          <FieldError
            id="defaultSeoDescription-error"
            errors={[errors.defaultSeoDescription]}
          />
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
                aria-describedby={
                  errors.ogImageUrl ? "ogImageUrl-error" : undefined
                }
              />
            )}
          />
          <FieldError id="ogImageUrl-error" errors={[errors.ogImageUrl]} />
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
