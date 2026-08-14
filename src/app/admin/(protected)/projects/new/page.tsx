import { ProjectForm } from "../project-form";
import type { ProjectFormInput } from "@lib/admin/project-schema";
import styles from "./page.module.scss";

const emptyDefaults: ProjectFormInput = {
  title: "",
  slug: "",
  summary: "",
  description: "",
  coverImageUrl: "",
  galleryUrls: "",
  techTags: "",
  liveUrl: "",
  repoUrl: "",
  order: 0,
  featured: false,
  status: "DRAFT",
  seoTitle: "",
  seoDescription: "",
};

export const metadata = { title: "New project" };

export default function NewProjectPage() {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>New project</h1>
      <ProjectForm defaultValues={emptyDefaults} submitLabel="Create project" />
    </main>
  );
}
