import { AdminPageHeader } from "@components/admin/admin-page-header";
import { ProjectForm } from "../project-form";
import type { ProjectFormInput } from "@lib/admin/project-schema";

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
    <>
      <AdminPageHeader
        title="New project"
        breadcrumbs={[
          { label: "Projects", href: "/admin/projects" },
          { label: "New project" },
        ]}
      />
      <ProjectForm defaultValues={emptyDefaults} submitLabel="Create project" />
    </>
  );
}
