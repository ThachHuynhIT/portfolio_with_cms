"use client";

import { SparklesIcon } from "lucide-react";
import { AdminDataTable } from "@components/admin/admin-data-table";
import { skillColumns, type AdminSkillRow } from "./skills-columns";

export function SkillsTable({ skills }: { skills: AdminSkillRow[] }) {
  return (
    <AdminDataTable
      caption="Skills"
      columns={skillColumns}
      data={skills}
      searchPlaceholder="Search skills..."
      emptyIcon={SparklesIcon}
      emptyTitle="No skills yet"
      emptyDescription="Add skills to show off on the About page."
      emptyActionHref="/admin/skills/new"
      emptyActionLabel="New skill"
    />
  );
}
