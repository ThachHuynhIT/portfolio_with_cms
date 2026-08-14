import { notFound } from "next/navigation";
import { getProjectByIdAdmin } from "@lib/admin/projects";
import { ProjectForm } from "../../project-form";
import type { ProjectFormInput } from "@lib/admin/project-schema";
import styles from "./page.module.scss";

export const metadata = { title: "Edit project" };

export default async function EditProjectPage(
  props: PageProps<"/admin/projects/[id]/edit">
) {
  const { id } = await props.params;
  const project = await getProjectByIdAdmin(id);

  if (!project) {
    notFound();
  }

  const defaultValues: ProjectFormInput = {
    title: project.title,
    slug: project.slug,
    summary: project.summary,
    description: project.description,
    coverImageUrl: project.coverImageUrl ?? "",
    galleryUrls: project.galleryUrls.join("\n"),
    techTags: project.techTags.join(", "),
    liveUrl: project.liveUrl ?? "",
    repoUrl: project.repoUrl ?? "",
    order: project.order,
    featured: project.featured,
    status: project.status,
    seoTitle: project.seoTitle ?? "",
    seoDescription: project.seoDescription ?? "",
  };

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Edit project</h1>
      <ProjectForm
        defaultValues={defaultValues}
        projectId={project.id}
        submitLabel="Save changes"
      />
    </main>
  );
}
