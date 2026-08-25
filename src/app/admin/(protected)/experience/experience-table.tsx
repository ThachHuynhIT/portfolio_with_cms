"use client";

import { BriefcaseIcon } from "lucide-react";
import { AdminDataTable } from "@components/admin/admin-data-table";
import { experienceColumns, type AdminExperienceRow } from "./experience-columns";

export function ExperienceTable({
  entries,
}: {
  entries: AdminExperienceRow[];
}) {
  return (
    <AdminDataTable
      caption="Experience"
      columns={experienceColumns}
      data={entries}
      searchPlaceholder="Search experience..."
      emptyIcon={BriefcaseIcon}
      emptyTitle="No experience entries yet"
      emptyDescription="Add work or education history to show on the About page."
      emptyActionHref="/admin/experience/new"
      emptyActionLabel="New entry"
    />
  );
}
