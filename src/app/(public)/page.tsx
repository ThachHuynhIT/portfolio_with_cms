import { Suspense } from "react";
import Link from "next/link";
import {
  getSiteSettings,
  getFeaturedProjects,
  getPublishedTestimonials,
  getLatestBlogPosts,
} from "@/lib/queries";
import { RemoteImage } from "@components/public/remote-image";
import { PageTransition } from "@components/motion/page-transition";
import { Reveal } from "@components/motion/reveal";
import { Stagger } from "@components/motion/stagger";
import { formatDate } from "@/lib/format-date";
import styles from "./page.module.scss";

const GRID_SIZES = "(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw";

type Settings = Awaited<ReturnType<typeof getSiteSettings>>;

export default async function Home() {
  const settings = await getSiteSettings();

  return (
    <main id="main-content" className={styles.main}>
      <Hero settings={settings} />
      <Suspense fallback={null}>
        <FeaturedProjectsSection />
      </Suspense>
      <Suspense fallback={null}>
        <TestimonialsSection />
      </Suspense>
      <Suspense fallback={null}>
        <LatestWritingSection />
      </Suspense>
    </main>
  );
}

// The <h1> is never wrapped in a motion component — it's this page's LCP
// candidate, and animating from opacity:0 would delay when the browser
// considers it painted. Only the secondary hero content (subtext/CTA/hero
// image) gets an entrance.
function Hero({ settings }: { settings: Settings }) {
  const heroImageUrl = settings?.heroImageUrl;
  const avatarUrl = settings?.avatarUrl;
  const contactEmail = settings?.contactEmail;
  const resumeFileUrl = settings?.resumeFileUrl;

  return (
    <section className={styles.hero}>
      <div className={styles.heroText}>
        <h1 className={styles.heroTitle}>
          {settings?.heroHeadline || "Portfolio"}
        </h1>
        <PageTransition>
          {avatarUrl && (
            <div className={styles.avatar}>
              <RemoteImage src={avatarUrl} alt="" sizes="64px" />
            </div>
          )}
          {settings?.heroSubtext && (
            <p className={styles.heroSubtext}>{settings.heroSubtext}</p>
          )}
          <div className={styles.heroActions}>
            <Link href="/projects" className={styles.primaryAction}>
              View projects
            </Link>
            {contactEmail && (
              <a
                href={`mailto:${contactEmail}`}
                className={styles.secondaryAction}
              >
                Email me
              </a>
            )}
            {resumeFileUrl && (
              <a
                href={resumeFileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.secondaryAction}
              >
                Resume
              </a>
            )}
          </div>
        </PageTransition>
      </div>
      {heroImageUrl && (
        <PageTransition className={styles.heroImage}>
          <RemoteImage
            src={heroImageUrl}
            alt=""
            priority
            sizes="(min-width: 768px) 40vw, 100vw"
          />
        </PageTransition>
      )}
    </section>
  );
}

async function FeaturedProjectsSection() {
  const featuredProjects = await getFeaturedProjects();
  if (featuredProjects.length === 0) {
    return null;
  }

  return (
    <section className={styles.section}>
      <Reveal>
        <h2 className={styles.sectionTitle}>Featured projects</h2>
      </Reveal>
      <Stagger className={styles.grid}>
        {featuredProjects.map((project) => (
          <Link
            key={project.id}
            href={`/projects/${project.slug}`}
            className={styles.card}
          >
            <div className={styles.cardCover}>
              <RemoteImage
                src={project.coverImageUrl}
                alt=""
                sizes={GRID_SIZES}
              />
            </div>
            <span className={styles.cardTitle}>{project.title}</span>
            <p className={styles.cardSummary}>{project.summary}</p>
            {project.techTags.length > 0 && (
              <ul className={styles.tagList}>
                {project.techTags.slice(0, 4).map((tag) => (
                  <li key={tag} className={styles.tagPill}>
                    {tag}
                  </li>
                ))}
                {project.techTags.length > 4 && (
                  <li className={styles.tagPill}>
                    +{project.techTags.length - 4}
                  </li>
                )}
              </ul>
            )}
          </Link>
        ))}
      </Stagger>
    </section>
  );
}

async function TestimonialsSection() {
  const testimonials = await getPublishedTestimonials();
  if (testimonials.length === 0) {
    return null;
  }

  return (
    <section className={styles.section}>
      <Reveal>
        <h2 className={styles.sectionTitle}>Testimonials</h2>
      </Reveal>
      <Stagger className={styles.testimonialGrid}>
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className={styles.testimonialCard}>
            {testimonial.authorAvatarUrl && (
              <div className={styles.testimonialAvatar}>
                <RemoteImage
                  src={testimonial.authorAvatarUrl}
                  alt=""
                  sizes="48px"
                />
              </div>
            )}
            <p className={styles.testimonialQuote}>
              &ldquo;{testimonial.quote}&rdquo;
            </p>
            <p className={styles.testimonialAuthor}>
              {testimonial.authorName}
              {testimonial.authorRole ? `, ${testimonial.authorRole}` : ""}
            </p>
          </div>
        ))}
      </Stagger>
    </section>
  );
}

async function LatestWritingSection() {
  const latestPosts = await getLatestBlogPosts(3);
  if (latestPosts.length === 0) {
    return null;
  }

  return (
    <section className={styles.section}>
      <Reveal>
        <h2 className={styles.sectionTitle}>Latest writing</h2>
      </Reveal>
      <Stagger className={styles.grid}>
        {latestPosts.map((post) => (
          <Link key={post.id} href={`/blog/${post.slug}`} className={styles.card}>
            {post.coverImageUrl && (
              <div className={styles.cardCover}>
                <RemoteImage
                  src={post.coverImageUrl}
                  alt=""
                  sizes={GRID_SIZES}
                />
              </div>
            )}
            <span className={styles.cardTitle}>{post.title}</span>
            <p className={styles.cardSummary}>{post.excerpt}</p>
            {post.publishedAt && (
              <time
                className={styles.postDate}
                dateTime={post.publishedAt.toISOString()}
              >
                {formatDate(post.publishedAt)}
              </time>
            )}
          </Link>
        ))}
      </Stagger>
    </section>
  );
}
