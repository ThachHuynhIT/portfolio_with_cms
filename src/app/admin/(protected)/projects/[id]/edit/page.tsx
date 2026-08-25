import { notFound } from "next/navigation";
import { getProjectByIdAdmin } from "@lib/admin/projects";
import { AdminPageHeader } from "@components/admin/admin-page-header";
import { ProjectForm } from "../../project-form";
import type { ProjectFormInput } from "@lib/admin/project-schema";

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
    <>
      <AdminPageHeader
        title="Edit project"
        breadcrumbs={[
          { label: "Projects", href: "/admin/projects" },
          { label: "Edit project" },
        ]}
      />
      <ProjectForm
        defaultValues={defaultValues}
        projectId={project.id}
        submitLabel="Save changes"
      />
    </>
  );
}
