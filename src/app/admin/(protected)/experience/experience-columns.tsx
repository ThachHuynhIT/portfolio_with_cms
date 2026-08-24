"use client";

import { createAdminColumnHelper } from "@components/admin/admin-table";
import { createRowActionsColumn } from "@components/admin/admin-row-actions";
import { deleteExperienceEntryAction } from "./actions";

export type AdminExperienceRow = {
  id: string;
  type: "WORK" | "EDUCATION";
  title: string;
  organization: string;
  startDate: Date;
  endDate: Date | null;
  order: number;
};

const columnHelper = createAdminColumnHelper<AdminExperienceRow>();

function formatYear(date: Date) {
  return date.getFullYear();
}

export const experienceColumns = columnHelper.columns([
  columnHelper.accessor("type", { header: "Type" }),
  columnHelper.accessor("title", { header: "Title" }),
  columnHelper.accessor("organization", { header: "Organization" }),
  columnHelper.display({
    id: "dates",
    header: "Dates",
    cell: (info) => {
      const { startDate, endDate } = info.row.original;
      return `${formatYear(startDate)} – ${
        endDate ? formatYear(endDate) : "present"
      }`;
    },
  }),
  columnHelper.accessor("order", { header: "Order" }),
  createRowActionsColumn<AdminExperienceRow>({
    entityName: "entry",
    editHref: (row) => `/admin/experience/${row.id}/edit`,
    getLabel: (row) => row.title,
    onDelete: (row) => deleteExperienceEntryAction(row.id),
  }),
]);
