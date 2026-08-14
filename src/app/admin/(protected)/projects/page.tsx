import Link from "next/link";
import { getAllProjectsAdmin } from "@lib/admin/projects";
import { Button } from "@components/ui/button";
import { ProjectsTable } from "./projects-table";
import styles from "./page.module.scss";

export const metadata = { title: "Projects" };

export default async function AdminProjectsPage() {
  const projects = await getAllProjectsAdmin();

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1 className={styles.title}>Projects</h1>
        <Button render={<Link href="/admin/projects/new" />}>
          New project
        </Button>
      </div>
      <ProjectsTable projects={projects} />
    </main>
  );
}
