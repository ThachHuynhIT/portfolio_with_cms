import type { Metadata } from "next";
import { DownloadIcon } from "lucide-react";
import {
  getSiteSettings,
  getSocialLinks,
  getSkills,
  getExperienceEntries,
  getFeaturedProjects,
} from "@/lib/queries";
import { buildMetadata } from "@/lib/seo";
import { Markdown } from "@components/markdown/markdown";
import { groupBy } from "@/lib/group-by";
import { formatDuration, formatYearRange } from "@/lib/format-date";
import type { SocialLinks } from "@/lib/social-links";
import { PrintButton } from "./print-button";
import styles from "./page.module.scss";

type ExperienceEntry = Awaited<ReturnType<typeof getExperienceEntries>>[number];

const SOCIAL_LABELS: Record<keyof SocialLinks, string> = {
  github: "GitHub",
  linkedin: "LinkedIn",
  twitter: "Twitter",
  instagram: "Instagram",
  youtube: "YouTube",
};

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  return buildMetadata({
    title: "CV",
    description: settings?.tagline || settings?.defaultSeoDescription,
    path: "/cv",
    image: settings?.ogImageUrl,
    siteName: settings?.siteName,
  });
}

export default async function CvPage() {
  const [settings, socialLinks, skills, experience, featuredProjects] =
    await Promise.all([
      getSiteSettings(),
      getSocialLinks(),
      getSkills(),
      getExperienceEntries(),
      getFeaturedProjects(),
    ]);

  // Explicit lookups (not an iteration over the Map) so Experience always
  // renders before Education regardless of fetch order — order carries
  // meaning on a CV, unlike /about's category groups.
  const experienceByType = groupBy(experience, (entry) => entry.type);
  const workEntries = experienceByType.get("WORK") ?? [];
  const educationEntries = experienceByType.get("EDUCATION") ?? [];

  const skillGroups = groupBy(skills, (skill) => skill.category);

  const socialEntries = Object.entries(socialLinks).filter(
    (entry): entry is [keyof SocialLinks, string] => Boolean(entry[1]),
  );

  return (
    <main id="main-content" className={styles.main}>
      <header className={styles.header}>
        <h1 className={styles.name}>{settings?.siteName || "CV"}</h1>
        {settings?.tagline && (
          <p className={styles.role}>{settings.tagline}</p>
        )}

        {(settings?.contactEmail || socialEntries.length > 0) && (
          <ul className={styles.contactList}>
            {settings?.contactEmail && (
              <li className={styles.contactItem}>
                <a
                  href={`mailto:${settings.contactEmail}`}
                  className={styles.contactLink}
                >
                  {settings.contactEmail}
                </a>
              </li>
            )}
            {socialEntries.map(([key, url]) => (
              <li key={key} className={styles.contactItem}>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.contactLink}
                >
                  {SOCIAL_LABELS[key]}
                </a>
              </li>
            ))}
          </ul>
        )}

        <div className={styles.actions}>
          {settings?.resumeFileUrl && (
            <a
              href={settings.resumeFileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.actionButton}
            >
              <DownloadIcon aria-hidden="true" />
              Download PDF
            </a>
          )}
          <PrintButton className={styles.actionButton} />
        </div>
      </header>

      {workEntries.length > 0 && (
        <ExperienceSection
          headingId="cv-experience-heading"
          title="Experience"
          entries={workEntries}
        />
      )}

      {educationEntries.length > 0 && (
        <ExperienceSection
          headingId="cv-education-heading"
          title="Education"
          entries={educationEntries}
        />
      )}

      {skillGroups.size > 0 && (
        <section
          className={styles.section}
          aria-labelledby="cv-skills-heading"
        >
          <h2 id="cv-skills-heading" className={styles.sectionLabel}>
            Skills
          </h2>
          <div className={styles.skillRows}>
            {Array.from(skillGroups.entries()).map(
              ([category, categorySkills]) => (
                <div key={category} className={styles.skillRow}>
                  <span className={styles.skillCategory}>
                    {category || "Other"}
                  </span>
                  <span className={styles.skillNames}>
                    {categorySkills.map((skill) => skill.name).join(", ")}
                  </span>
                </div>
              ),
            )}
          </div>
        </section>
      )}

      {featuredProjects.length > 0 && (
        <section className={styles.section} aria-labelledby="cv-work-heading">
          <h2 id="cv-work-heading" className={styles.sectionLabel}>
            Selected work
          </h2>
          <div className={styles.workList}>
            {featuredProjects.map((project) => (
              <div key={project.id} className={styles.workRow}>
                <div className={styles.workHeader}>
                  <span className={styles.workTitle}>{project.title}</span>
                  {(project.liveUrl || project.repoUrl) && (
                    <div className={styles.workLinks}>
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.workLink}
                        >
                          Live
                        </a>
                      )}
                      {project.repoUrl && (
                        <a
                          href={project.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.workLink}
                        >
                          Source
                        </a>
                      )}
                    </div>
                  )}
                </div>
                {project.summary && (
                  <p className={styles.workSummary}>{project.summary}</p>
                )}
                {project.techTags.length > 0 && (
                  <p className={styles.workTags}>
                    {project.techTags.join(" · ")}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function ExperienceSection({
  headingId,
  title,
  entries,
}: {
  headingId: string;
  title: string;
  entries: ExperienceEntry[];
}) {
  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles.sectionLabel}>
        {title}
      </h2>
      <div className={styles.entryList}>
        {entries.map((entry) => (
          <article key={entry.id} className={styles.entry}>
            <div className={styles.entryDates}>
              <span className={styles.entryRange}>
                {!entry.endDate && (
                  <span className={styles.currentMarker} aria-hidden="true" />
                )}
                {formatYearRange(entry.startDate, entry.endDate)}
              </span>
              <span className={styles.entryDuration}>
                ({formatDuration(entry.startDate, entry.endDate ?? new Date())})
              </span>
            </div>
            <div className={styles.entryContent}>
              <p className={styles.entryTitle}>{entry.title}</p>
              <p className={styles.entryMeta}>
                {entry.organization}
                {entry.location ? ` · ${entry.location}` : ""}
              </p>
              {entry.description && (
                <Markdown content={entry.description} />
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
