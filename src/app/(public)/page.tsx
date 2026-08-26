import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import {
  getSiteSettings,
  getFeaturedProjects,
  getPublishedTestimonials,
  getLatestBlogPosts,
  getSkills,
  getSocialLinks,
} from "@/lib/queries";
import { buildMetadata } from "@/lib/seo";
import { RemoteImage } from "@components/public/remote-image";
import { PageTransition } from "@components/motion/page-transition";
import { Reveal } from "@components/motion/reveal";
import { Stagger } from "@components/motion/stagger";
import { formatDate } from "@/lib/format-date";
import { splitParagraphs } from "@/lib/paragraphs";
import { groupBy } from "@/lib/group-by";
import { SOCIAL_LABELS, type SocialLinks } from "@/lib/social-links";
import styles from "./page.module.scss";

const GRID_SIZES = "(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw";

// A teaser, not the full story — 2 paragraphs max. /about keeps the
// complete bio.
const INTRO_PARAGRAPH_LIMIT = 2;

type Settings = Awaited<ReturnType<typeof getSiteSettings>>;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  return buildMetadata({
    description: settings?.defaultSeoDescription || settings?.tagline,
    path: "/",
    image: settings?.ogImageUrl,
    siteName: settings?.siteName,
  });
}

export default async function Home() {
  const settings = await getSiteSettings();

  return (
    <main id="main-content" className={styles.main}>
      <Hero settings={settings} />
      <Suspense fallback={null}>
        <IntroSection />
      </Suspense>
      <Suspense fallback={null}>
        <FeaturedProjectsSection />
      </Suspense>
      <Suspense fallback={null}>
        <LatestWritingSection />
      </Suspense>
      <Suspense fallback={null}>
        <TestimonialsSection />
      </Suspense>
      <Suspense fallback={null}>
        <ContactCtaSection />
      </Suspense>
    </main>
  );
}

// A short mono caption paired with each section's heading (design spec
// §3/§6) — the alternative to numbered markers (01/02/03), which would
// decorate rather than encode anything: these sections aren't a sequence.
function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <Reveal>
      <div className={styles.sectionHead}>
        <span className={styles.eyebrow}>{eyebrow}</span>
        <h2 className={styles.sectionTitle}>{title}</h2>
      </div>
    </Reveal>
  );
}

// The <h1> is never wrapped in a motion component — it's this page's LCP
// candidate, and animating from opacity:0 would delay when the browser
// considers it painted. The eyebrow directly above it renders statically
// too, for the same reason a caption shouldn't fade in after the headline
// it introduces has already painted. Only what follows (subtext/CTA/hero
// image) gets an entrance.
function Hero({ settings }: { settings: Settings }) {
  const heroImageUrl = settings?.heroImageUrl;
  const avatarUrl = settings?.avatarUrl;
  const contactEmail = settings?.contactEmail;
  const resumeFileUrl = settings?.resumeFileUrl;

  return (
    <section className={styles.hero}>
      <div className={styles.heroText}>
        {settings?.tagline && (
          <p className={styles.eyebrow}>{settings.tagline}</p>
        )}
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
            <Link href="/cv" className={styles.primaryAction}>
              View CV
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

async function IntroSection() {
  const [settings, skills] = await Promise.all([
    getSiteSettings(),
    getSkills(),
  ]);

  const bioParagraphs = splitParagraphs(settings?.bio ?? "").slice(
    0,
    INTRO_PARAGRAPH_LIMIT,
  );
  const skillGroups = groupBy(skills, (skill) => skill.category);

  if (bioParagraphs.length === 0 && skillGroups.size === 0) {
    return null;
  }

  return (
    <section className={styles.section}>
      <SectionHeading eyebrow="About" title="A quick intro" />
      <Reveal>
        <div className={styles.intro}>
          {bioParagraphs.length > 0 && (
            <div className={styles.introText}>
              {bioParagraphs.map((paragraph, index) => (
                <p key={index} className={styles.introParagraph}>
                  {paragraph}
                </p>
              ))}
            </div>
          )}
          {skillGroups.size > 0 && (
            <div className={styles.skillGroups}>
              {Array.from(skillGroups.entries()).map(
                ([category, categorySkills]) => (
                  <div key={category} className={styles.skillGroup}>
                    <span className={styles.skillGroupLabel}>
                      {category || "Other"}
                    </span>
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
          )}
        </div>
      </Reveal>
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
      <SectionHeading eyebrow="Work" title="Featured projects" />
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

async function LatestWritingSection() {
  const latestPosts = await getLatestBlogPosts(3);
  if (latestPosts.length === 0) {
    return null;
  }

  return (
    <section className={styles.section}>
      <SectionHeading eyebrow="Writing" title="Latest writing" />
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

async function TestimonialsSection() {
  const testimonials = await getPublishedTestimonials();
  if (testimonials.length === 0) {
    return null;
  }

  return (
    <section className={styles.section}>
      <SectionHeading eyebrow="Feedback" title="Testimonials" />
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

// The page's one exit ramp — before this, there was nothing at the bottom
// of the page pointing anywhere.
async function ContactCtaSection() {
  const [settings, socialLinks] = await Promise.all([
    getSiteSettings(),
    getSocialLinks(),
  ]);

  const contactEmail = settings?.contactEmail;
  const resumeFileUrl = settings?.resumeFileUrl;
  const socialEntries = Object.entries(socialLinks).filter(
    (entry): entry is [keyof SocialLinks, string] => Boolean(entry[1]),
  );

  return (
    <section className={styles.section}>
      <SectionHeading eyebrow="Contact" title="Let's work together" />
      <Reveal>
        <div className={styles.contactCta}>
          <p className={styles.contactCtaText}>
            Have a project in mind, or just want to say hello?
          </p>
          <div className={styles.heroActions}>
            <Link href="/contact" className={styles.primaryAction}>
              Get in touch
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
          {socialEntries.length > 0 && (
            <ul className={styles.contactCtaSocial}>
              {socialEntries.map(([key, url]) => (
                <li key={key}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.contactCtaSocialLink}
                  >
                    {SOCIAL_LABELS[key]}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Reveal>
    </section>
  );
}
