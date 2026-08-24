"use client";

import { FolderIcon } from "lucide-react";
import { AdminDataTable } from "@components/admin/admin-data-table";
import { projectColumns, type AdminProjectRow } from "./projects-columns";

export function ProjectsTable({ projects }: { projects: AdminProjectRow[] }) {
  return (
    <AdminDataTable
      caption="Projects"
      columns={projectColumns}
      data={projects}
      searchPlaceholder="Search projects..."
      emptyIcon={FolderIcon}
      emptyTitle="No projects yet"
      emptyDescription="Create your first project to feature it on the public site."
      emptyActionHref="/admin/projects/new"
      emptyActionLabel="New project"
    />
  );
}
