"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
  FieldSet,
  FieldLegend,
} from "@components/ui/field";
import {
  siteSettingsFormSchema,
  type SiteSettingsFormInput,
} from "@lib/admin/site-settings-schema";
import { updateSiteSettingsAction } from "./actions";
import styles from "./site-settings-form.module.scss";

type SiteSettingsFormProps = {
  defaultValues: SiteSettingsFormInput;
};

export function SiteSettingsForm({ defaultValues }: SiteSettingsFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SiteSettingsFormInput>({
    // `raw: true`: validate client-side with the same schema for fast
    // feedback, but hand the server action the untransformed input — the
    // server re-parses independently (never trusts client-side transform
    // output).
    resolver: zodResolver(siteSettingsFormSchema, undefined, { raw: true }),
    defaultValues,
  });

  async function submit(data: SiteSettingsFormInput) {
    setServerError(null);
    const result = await updateSiteSettingsAction(data);
    if (result?.error) {
      setServerError(result.error);
      toast.error(result.error);
      return;
    }
    toast.success("Settings saved.");
    router.refresh();
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit(submit)} noValidate>
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
          <FieldLabel htmlFor="heroImageUrl">Hero image URL</FieldLabel>
          <Input
            id="heroImageUrl"
            aria-invalid={!!errors.heroImageUrl}
            {...register("heroImageUrl")}
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
          <FieldLabel htmlFor="avatarUrl">Avatar URL</FieldLabel>
          <Input
            id="avatarUrl"
            aria-invalid={!!errors.avatarUrl}
            {...register("avatarUrl")}
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
          <FieldLabel htmlFor="ogImageUrl">OG image URL</FieldLabel>
          <Input
            id="ogImageUrl"
            aria-invalid={!!errors.ogImageUrl}
            {...register("ogImageUrl")}
          />
          <FieldError errors={[errors.ogImageUrl]} />
        </Field>
      </FieldGroup>

      {serverError && (
        <p className={styles.error} role="alert">
          {serverError}
        </p>
      )}

      <Button type="submit" disabled={isSubmitting} className={styles.submit}>
        {isSubmitting ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}
