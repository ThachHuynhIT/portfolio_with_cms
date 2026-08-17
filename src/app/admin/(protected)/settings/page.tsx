import { getSiteSettings } from "@/lib/queries";
import { parseSocialLinks } from "@/lib/social-links";
import { SiteSettingsForm } from "./site-settings-form";
import type { SiteSettingsFormInput } from "@lib/admin/site-settings-schema";
import styles from "./page.module.scss";

export const metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();
  // Never read `settings.socialLinks` as a raw `Json` property (C5) — always
  // through the shared parser, same as the public read boundary does.
  const socialLinks = parseSocialLinks(settings?.socialLinks);

  // No "new"/list flow: this is the one singleton row. If it doesn't exist
  // yet (non-seeded database), the form falls back to blank defaults and the
  // first save creates it via the action's `upsert`.
  const defaultValues: SiteSettingsFormInput = {
    siteName: settings?.siteName ?? "",
    tagline: settings?.tagline ?? "",
    heroHeadline: settings?.heroHeadline ?? "",
    heroSubtext: settings?.heroSubtext ?? "",
    heroImageUrl: settings?.heroImageUrl ?? "",
    bio: settings?.bio ?? "",
    avatarUrl: settings?.avatarUrl ?? "",
    resumeFileUrl: settings?.resumeFileUrl ?? "",
    contactEmail: settings?.contactEmail ?? "",
    socialLinks: {
      github: socialLinks.github ?? "",
      linkedin: socialLinks.linkedin ?? "",
      twitter: socialLinks.twitter ?? "",
      instagram: socialLinks.instagram ?? "",
      youtube: socialLinks.youtube ?? "",
    },
    defaultSeoTitle: settings?.defaultSeoTitle ?? "",
    defaultSeoDescription: settings?.defaultSeoDescription ?? "",
    ogImageUrl: settings?.ogImageUrl ?? "",
  };

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Settings</h1>
      <SiteSettingsForm defaultValues={defaultValues} />
    </main>
  );
}
