import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProjectBySlug, getSiteSettings } from "@/lib/queries";
import { buildMetadata } from "@/lib/seo";
import { Markdown } from "@components/markdown/markdown";
import { RemoteImage } from "@components/public/remote-image";
import { formatDate } from "@/lib/format-date";
import styles from "./page.module.scss";

export async function generateMetadata(
  props: PageProps<"/projects/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const [project, settings] = await Promise.all([
    getProjectBySlug(slug),
    getSiteSettings(),
  ]);

  if (!project) {
    return {};
  }

  return buildMetadata({
    title: project.seoTitle || project.title,
    description: project.seoDescription || project.summary,
    path: `/projects/${project.slug}`,
    image: project.coverImageUrl || settings?.ogImageUrl,
    type: "article",
    siteName: settings?.siteName,
  });
}

export default async function ProjectDetailPage(
  props: PageProps<"/projects/[slug]">,
) {
  const { slug } = await props.params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  return (
    <main id="main-content" className={styles.main}>
      <Link href="/projects" className={styles.backLink}>
        ← Back to projects
      </Link>
      {project.coverImageUrl && (
        <div className={styles.cover}>
          <RemoteImage
            src={project.coverImageUrl}
            alt=""
            priority
            sizes="(min-width: 704px) 704px, 100vw"
          />
        </div>
      )}
      <h1 className={styles.title}>{project.title}</h1>
      <div className={styles.meta}>
        {project.publishedAt && (
          <time
            className={styles.publishedAt}
            dateTime={project.publishedAt.toISOString()}
          >
            {formatDate(project.publishedAt)}
          </time>
        )}
        {project.techTags.length > 0 && (
          <ul className={styles.tagList}>
            {project.techTags.map((tag) => (
              <li key={tag} className={styles.tagPill}>
                {tag}
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className={styles.summary}>{project.summary}</p>
      <div className={styles.linkRow}>
        {project.liveUrl && (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.button}
          >
            Live site
          </a>
        )}
        {project.repoUrl && (
          <a
            href={project.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.button}
          >
            Source
          </a>
        )}
      </div>
      <Markdown content={project.description} />
      {project.galleryUrls.length > 0 && (
        <div className={styles.gallery}>
          {project.galleryUrls.map((url) => (
            <div key={url} className={styles.galleryItem}>
              <RemoteImage src={url} alt="" sizes="(min-width: 768px) 50vw, 100vw" />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
