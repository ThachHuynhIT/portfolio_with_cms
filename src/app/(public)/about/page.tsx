import Link from "next/link";
import type { Metadata } from "next";
import { getSiteSettings, getSkills } from "@/lib/queries";
import { buildMetadata } from "@/lib/seo";
import { RemoteImage } from "@components/public/remote-image";
import { groupBy } from "@/lib/group-by";
import { splitParagraphs } from "@/lib/paragraphs";
import styles from "./page.module.scss";

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
  const [settings, skills] = await Promise.all([
    getSiteSettings(),
    getSkills(),
  ]);

  const skillGroups = groupBy(skills, (skill) => skill.category);
  const bioParagraphs = splitParagraphs(settings?.bio ?? "");

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

      {/* Full work/education history moved to /cv (Phase 16) — showing it
          here too would read as carelessness, not thoroughness, since it'd
          be the exact same timeline twice. */}
      <section className={styles.section}>
        <Link href="/cv" className={styles.cvLink}>
          View full experience &amp; education on my CV
        </Link>
      </section>
    </main>
  );
}
