import { getSiteSettings, getSkills, getExperienceEntries } from "@/lib/queries";
import styles from "./page.module.scss";

export default async function AboutPage() {
  const [settings, skills, experience] = await Promise.all([
    getSiteSettings(),
    getSkills(),
    getExperienceEntries(),
  ]);

  return (
    <main id="main-content" className={styles.main}>
      <section className={styles.section}>
        <h1 className={styles.title}>About</h1>
        <p className={styles.bio}>{settings?.bio}</p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Skills</h2>
        <ul className={styles.skillList}>
          {skills.map((skill) => (
            <li key={skill.id} className={styles.skillPill}>
              {skill.name}
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Experience</h2>
        <ul className={styles.experienceList}>
          {experience.map((entry) => (
            <li key={entry.id} className={styles.experienceItem}>
              <p className={styles.experienceTitle}>
                {entry.title} — {entry.organization}
              </p>
              <p className={styles.experienceDates}>
                {entry.startDate.getFullYear()}
                {" – "}
                {entry.endDate ? entry.endDate.getFullYear() : "present"}
              </p>
              <p className={styles.experienceDescription}>{entry.description}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
