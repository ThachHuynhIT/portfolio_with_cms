import Link from "next/link";
import {
  getSiteSettings,
  getFeaturedProjects,
  getPublishedTestimonials,
} from "@/lib/queries";
import styles from "./page.module.scss";

export default async function Home() {
  const [settings, featuredProjects, testimonials] = await Promise.all([
    getSiteSettings(),
    getFeaturedProjects(),
    getPublishedTestimonials(),
  ]);

  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>
          {settings?.heroHeadline || "Portfolio"}
        </h1>
        <p className={styles.heroSubtext}>{settings?.heroSubtext}</p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Featured projects</h2>
        <ul className={styles.list}>
          {featuredProjects.map((project) => (
            <li key={project.id}>
              <Link href={`/projects/${project.slug}`} className={styles.projectCard}>
                <span className={styles.projectTitle}>{project.title}</span>
                <p className={styles.projectSummary}>{project.summary}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {testimonials.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Testimonials</h2>
          <ul className={styles.list}>
            {testimonials.map((testimonial) => (
              <li key={testimonial.id} className={styles.testimonialCard}>
                <p className={styles.testimonialQuote}>
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <p className={styles.testimonialAuthor}>
                  {testimonial.authorName}
                  {testimonial.authorRole ? `, ${testimonial.authorRole}` : ""}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
