import { ArrowUpRightIcon } from "lucide-react";
import { getSiteSettings, getSocialLinks } from "@/lib/queries";
import type { SocialLinks } from "@/lib/social-links";
import styles from "./site-footer.module.scss";

const SOCIAL_LABELS: Record<keyof SocialLinks, string> = {
  github: "GitHub",
  linkedin: "LinkedIn",
  twitter: "Twitter",
  instagram: "Instagram",
  youtube: "YouTube",
};

export async function SiteFooter() {
  const settings = await getSiteSettings();
  const socialLinks = await getSocialLinks();

  const socialEntries = Object.entries(socialLinks).filter(
    (entry): entry is [keyof SocialLinks, string] => Boolean(entry[1]),
  );
  const contactEmail = settings?.contactEmail;
  const resumeFileUrl = settings?.resumeFileUrl;
  const siteName = settings?.siteName || "Portfolio";
  const hasLinks = socialEntries.length > 0 || Boolean(contactEmail) || Boolean(resumeFileUrl);
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      {hasLinks && (
        <div className={styles.links}>
          {socialEntries.map(([key, url]) => (
            <a
              key={key}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              {SOCIAL_LABELS[key]}
              <ArrowUpRightIcon aria-hidden="true" className={styles.linkIcon} />
            </a>
          ))}
          {contactEmail && (
            <a href={`mailto:${contactEmail}`} className={styles.link}>
              Email
            </a>
          )}
          {resumeFileUrl && (
            <a
              href={resumeFileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              Resume
              <ArrowUpRightIcon aria-hidden="true" className={styles.linkIcon} />
            </a>
          )}
        </div>
      )}
      <p className={styles.copyright}>
        &copy; {year} {siteName}
      </p>
    </footer>
  );
}
