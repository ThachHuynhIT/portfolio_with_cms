import Link from "next/link";
import { getPublishedProjects } from "@/lib/queries";
import { RemoteImage } from "@components/public/remote-image";
import { EmptyState } from "@components/public/empty-state";
import { Stagger } from "@components/motion/stagger";
import styles from "./page.module.scss";

const GRID_SIZES = "(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw";

export default async function ProjectsPage() {
  const projects = await getPublishedProjects();

  return (
    <main id="main-content" className={styles.main}>
      <h1 className={styles.title}>Projects</h1>
      {projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Check back soon — new work is on the way."
        />
      ) : (
        <Stagger className={styles.grid}>
          {projects.map((project) => (
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
                {project.featured && (
                  <span className={styles.featuredBadge}>Featured</span>
                )}
              </div>
              <span className={styles.cardTitle}>{project.title}</span>
              <p className={styles.summary}>{project.summary}</p>
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
      )}
    </main>
  );
}
