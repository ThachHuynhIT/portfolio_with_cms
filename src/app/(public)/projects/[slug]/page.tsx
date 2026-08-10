import { notFound } from "next/navigation";
import { getProjectBySlug } from "@/lib/queries";
import styles from "./page.module.scss";

export default async function ProjectDetailPage(
  props: PageProps<"/projects/[slug]">,
) {
  const { slug } = await props.params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>{project.title}</h1>
      <p className={styles.summary}>{project.summary}</p>
      <p className={styles.description}>{project.description}</p>
      {project.techTags.length > 0 && (
        <ul className={styles.tagList}>
          {project.techTags.map((tag) => (
            <li key={tag} className={styles.tagPill}>
              {tag}
            </li>
          ))}
        </ul>
      )}
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
    </main>
  );
}
