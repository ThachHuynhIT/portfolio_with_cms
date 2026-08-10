import Link from "next/link";
import { getPublishedProjects } from "@/lib/queries";
import styles from "./page.module.scss";

export default async function ProjectsPage() {
  const projects = await getPublishedProjects();

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Projects</h1>
      <ul className={styles.list}>
        {projects.map((project) => (
          <li key={project.id}>
            <Link href={`/projects/${project.slug}`} className={styles.card}>
              <span className={styles.cardTitle}>{project.title}</span>
              <p className={styles.summary}>{project.summary}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
