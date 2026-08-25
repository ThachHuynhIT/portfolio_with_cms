import type { Metadata } from "next";
import { getSiteSettings, getSkills, getExperienceEntries } from "@/lib/queries";
import { buildMetadata } from "@/lib/seo";
import { RemoteImage } from "@components/public/remote-image";
import { formatDateRange } from "@/lib/format-date";
import { groupBy } from "@/lib/group-by";
import styles from "./page.module.scss";

type ExperienceEntry = Awaited<ReturnType<typeof getExperienceEntries>>[number];

const EXPERIENCE_TYPE_LABELS: Record<ExperienceEntry["type"], string> = {
  WORK: "Work",
  EDUCATION: "Education",
};

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  return buildMetadata({
    title: "About",
    description: settings?.defaultSeoDescription || settings?.tagline,
    path: "/about",
    image: settings?.ogImageUrl,
    siteName: settings?.siteName,
  });
}

export default async function AboutPage() {
  const [settings, skills, experience] = await Promise.all([
    getSiteSettings(),
    getSkills(),
    getExperienceEntries(),
  ]);

  const skillGroups = groupBy(skills, (skill) => skill.category);
  const experienceGroups = groupBy(experience, (entry) => entry.type);
  const bioParagraphs = (settings?.bio ?? "")
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <main id="main-content" className={styles.main}>
      <section className={styles.intro}>
        {settings?.avatarUrl && (
          <div className={styles.avatar}>
            <RemoteImage src={settings.avatarUrl} alt="" sizes="96px" />
          </div>
        )}
        <div className={styles.introText}>
          <h1 className={styles.title}>About</h1>
          {bioParagraphs.map((paragraph, index) => (
            <p key={index} className={styles.bio}>
              {paragraph}
            </p>
          ))}
        </div>
      </section>

      {skillGroups.size > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Skills</h2>
          <div className={styles.skillGroups}>
            {Array.from(skillGroups.entries()).map(
              ([category, categorySkills]) => (
                <div key={category} className={styles.skillGroup}>
                  <h3 className={styles.groupTitle}>{category || "Other"}</h3>
                  <ul className={styles.skillList}>
                    {categorySkills.map((skill) => (
                      <li key={skill.id} className={styles.skillPill}>
                        {skill.name}
                      </li>
                    ))}
                  </ul>
                </div>
              ),
            )}
          </div>
        </section>
      )}

      {experienceGroups.size > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Experience</h2>
          <div className={styles.experienceGroups}>
            {Array.from(experienceGroups.entries()).map(
              ([type, entries]) => (
                <div key={type} className={styles.experienceGroup}>
                  <h3 className={styles.groupTitle}>
                    {EXPERIENCE_TYPE_LABELS[type]}
                  </h3>
                  <ul className={styles.experienceList}>
                    {entries.map((entry) => (
                      <li key={entry.id} className={styles.experienceItem}>
                        <p className={styles.experienceTitle}>
                          {entry.title} — {entry.organization}
                        </p>
                        <p className={styles.experienceMeta}>
                          {formatDateRange(entry.startDate, entry.endDate)}
                          {entry.location ? ` · ${entry.location}` : ""}
                        </p>
                        <p className={styles.experienceDescription}>
                          {entry.description}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              ),
            )}
          </div>
        </section>
      )}
    </main>
  );
}
