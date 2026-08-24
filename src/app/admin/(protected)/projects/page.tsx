import Link from "next/link";
import { getAllProjectsAdmin } from "@lib/admin/projects";
import { AdminPageHeader } from "@components/admin/admin-page-header";
import { Button } from "@components/ui/button";
import { ProjectsTable } from "./projects-table";

export const metadata = { title: "Projects" };

export default async function AdminProjectsPage() {
  const projects = await getAllProjectsAdmin();

  return (
    <>
      <AdminPageHeader title="Projects">
        <Button render={<Link href="/admin/projects/new" />}>
          New project
        </Button>
      </AdminPageHeader>
      <ProjectsTable projects={projects} />
    </>
  );
}
